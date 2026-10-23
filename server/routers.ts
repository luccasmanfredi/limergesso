import { TRPCError } from "@trpc/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { companySettings, photos, projects, quoteNotes, quoteRequests, services, siteContent } from "./db";
import { storagePut } from "./storage";

const statusSchema = z.enum(["Novo", "Em análise", "Orçamento enviado", "Aprovado", "Recusado", "Concluído"]);
const imageInput = z.object({
  fileName: z.string().min(1).max(240),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1),
});

function publicError(message: string, code: "BAD_REQUEST" | "INTERNAL_SERVER_ERROR" = "BAD_REQUEST") {
  return new TRPCError({ code, message });
}

function decodeDataUrl(value: string) {
  const raw = value.includes(",") ? value.split(",", 2)[1] : value;
  const buffer = Buffer.from(raw, "base64");
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) throw publicError("A imagem deve ter até 8 MB.");
  return buffer;
}

async function persistImage(file: z.infer<typeof imageInput>, folder: string) {
  const buffer = decodeDataUrl(file.base64);
  const extension = file.contentType.split("/")[1];
  const upload = await storagePut(`${folder}/${randomUUID()}.${extension}`, buffer, file.contentType);
  return upload;
}

const serviceInput = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(160),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(120),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  sortOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

const projectInput = z.object({
  id: z.number().optional(),
  title: z.string().min(2).max(180),
  category: z.string().min(2).max(120),
  description: z.string().min(10).max(2000),
  coverImageUrl: z.string().url().or(z.string().startsWith("/")),
  clientName: z.string().max(160).optional().or(z.literal("")),
  city: z.string().max(160).optional().or(z.literal("")),
  clientAuthorized: z.boolean().default(false),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const appRouter = router({
  system: router({ health: publicProcedure.query(() => ({ ok: true })) }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("webdev_app_session", { maxAge: -1, httpOnly: true, sameSite: "none", secure: true, path: "/" });
      return { success: true } as const;
    }),
  }),
  publicSite: router({
    getContent: publicProcedure.query(() => db.getPublicSiteData()),
    submitQuote: publicProcedure.input(z.object({
      fullName: z.string().min(2).max(180),
      whatsapp: z.string().min(8).max(40),
      city: z.string().min(2).max(120),
      service: z.string().min(2).max(160),
      message: z.string().min(10).max(5000),
      idempotencyKey: z.string().min(12).max(100),
      attachments: z.array(imageInput).max(3).default([]),
    })).mutation(async ({ input }) => {
      const dedupeHash = createHash("sha256").update(`${input.idempotencyKey}:${input.whatsapp}:${input.message}`).digest("hex");
      const duplicate = await db.findRecentDuplicate(dedupeHash);
      if (duplicate) return { success: true, publicId: duplicate.publicId, duplicate: true };
      const publicId = `LG-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const quote = await db.createQuote({ publicId, fullName: input.fullName.trim(), whatsapp: input.whatsapp.trim(), city: input.city.trim(), service: input.service, message: input.message.trim(), dedupeHash });
      for (const attachment of input.attachments) {
        try {
          const uploaded = await persistImage(attachment, `quotes/${quote.id}`);
          await db.addAttachment({ quoteId: quote.id, storageKey: uploaded.key, imageUrl: uploaded.url, fileName: attachment.fileName, contentType: attachment.contentType });
        } catch (error) {
          console.error("[Quote] Attachment failed", error instanceof Error ? error.message : error);
        }
      }
      return { success: true, publicId, duplicate: false };
    }),
  }),
  admin: router({
    dashboard: adminProcedure.query(async () => db.getDashboardStats()),
    quotes: adminProcedure.query(async () => db.listQuotes()),
    quoteDetails: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const details = await db.getQuoteDetails(input.id);
      if (!details) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });
      return details;
    }),
    updateQuote: adminProcedure.input(z.object({ id: z.number().int().positive(), status: statusSchema })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.update(quoteRequests).set({ status: input.status }).where(eq(quoteRequests.id, input.id));
      return { success: true };
    }),
    addQuoteNote: adminProcedure.input(z.object({ quoteId: z.number().int().positive(), note: z.string().min(2).max(3000) })).mutation(async ({ ctx, input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.insert(quoteNotes).values({ quoteId: input.quoteId, authorId: ctx.user.id, note: input.note.trim() });
      return { success: true };
    }),
    deleteQuote: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.update(quoteRequests).set({ deletedAt: new Date() }).where(eq(quoteRequests.id, input.id));
      return { success: true };
    }),
    photos: adminProcedure.query(() => db.listAdminPhotos()),
    createPhoto: adminProcedure.input(z.object({
      title: z.string().min(2).max(180),
      description: z.string().max(2000).optional(),
      altText: z.string().min(5).max(240),
      category: z.string().min(2).max(120),
      imageUrl: z.string().url().or(z.string().startsWith("/")).optional(),
      image: imageInput.optional(),
      published: z.boolean().default(true),
      featured: z.boolean().default(false),
      sortOrder: z.number().int().min(0).default(0),
    })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      let imageUrl = input.imageUrl;
      let storageKey: string | null = null;
      if (input.image) {
        const uploaded = await persistImage(input.image, "photos");
        imageUrl = uploaded.url;
        storageKey = uploaded.key;
      }
      if (!imageUrl) throw publicError("Envie uma imagem para publicar a foto.");
      const result = await database.insert(photos).values({ title: input.title, description: input.description ?? null, altText: input.altText, category: input.category, imageUrl, storageKey, published: input.published, featured: input.featured, sortOrder: input.sortOrder });
      return { success: true, id: Number(result[0].insertId) };
    }),
    updatePhoto: adminProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().min(2).max(180), description: z.string().max(2000).optional(), altText: z.string().min(5).max(240), category: z.string().min(2).max(120), published: z.boolean(), featured: z.boolean(), sortOrder: z.number().int().min(0), image: imageInput.optional() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      const replacement = input.image ? await persistImage(input.image, "photos") : null;
      await database.update(photos).set({ title: input.title, description: input.description ?? null, altText: input.altText, category: input.category, published: input.published, featured: input.featured, sortOrder: input.sortOrder, ...(replacement ? { imageUrl: replacement.url, storageKey: replacement.key } : {}) }).where(eq(photos.id, input.id));
      return { success: true };
    }),
    deletePhoto: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.update(photos).set({ deletedAt: new Date(), published: false }).where(eq(photos.id, input.id));
      return { success: true };
    }),
    services: adminProcedure.query(() => db.listAdminServices()),
    saveService: adminProcedure.input(serviceInput).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      const slug = `${input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}-${input.id ?? randomUUID().slice(0, 6)}`;
      if (input.id) await database.update(services).set({ name: input.name, description: input.description, category: input.category, imageUrl: input.imageUrl, sortOrder: input.sortOrder, published: input.published }).where(eq(services.id, input.id));
      else await database.insert(services).values({ name: input.name, slug, description: input.description, category: input.category, imageUrl: input.imageUrl, sortOrder: input.sortOrder, published: input.published });
      return { success: true };
    }),
    deleteService: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.delete(services).where(eq(services.id, input.id));
      return { success: true };
    }),
    projects: adminProcedure.query(() => db.listAdminProjects()),
    saveProject: adminProcedure.input(projectInput).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      const values = { title: input.title, category: input.category, description: input.description, coverImageUrl: input.coverImageUrl, clientName: input.clientAuthorized ? input.clientName || null : null, city: input.clientAuthorized ? input.city || null : null, clientAuthorized: input.clientAuthorized, published: input.published, featured: input.featured, sortOrder: input.sortOrder };
      if (input.id) await database.update(projects).set(values).where(eq(projects.id, input.id));
      else await database.insert(projects).values(values);
      return { success: true };
    }),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      await database.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
    settings: adminProcedure.query(() => db.getSettingsAndContent()),
    saveSettings: adminProcedure.input(z.object({ companyName: z.string().min(2).max(120), responsible: z.string().min(2).max(120), logoUrl: z.string().max(1000).optional(), phonePrimary: z.string().min(8).max(40), phoneSecondary: z.string().min(8).max(40), email: z.string().email(), instagram: z.string().max(240).optional(), address: z.string().max(1000).optional(), mapUrl: z.string().max(1000).optional(), heroImageUrl: z.string().max(1000).optional(), historyImageUrl: z.string().max(1000).optional() })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      const [current] = await database.select({ id: companySettings.id }).from(companySettings).limit(1);
      if (current) await database.update(companySettings).set(input).where(eq(companySettings.id, current.id));
      else await database.insert(companySettings).values(input);
      return { success: true };
    }),
    saveContent: adminProcedure.input(z.object({ heroTitle: z.string().min(10).max(500), heroBody: z.string().min(10).max(2000), aboutTitle: z.string().min(5).max(240), aboutBody: z.string().min(30).max(6000), historyTitle: z.string().min(5).max(240), historyBody: z.string().min(10).max(2000), classicTitle: z.string().min(5).max(240), classicBody: z.string().min(10).max(1000) })).mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw publicError("Banco de dados indisponível.", "INTERNAL_SERVER_ERROR");
      const [current] = await database.select({ id: siteContent.id }).from(siteContent).limit(1);
      if (current) await database.update(siteContent).set(input).where(eq(siteContent.id, current.id));
      else await database.insert(siteContent).values(input);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
