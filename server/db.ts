import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  companySettings,
  photos,
  projects,
  quoteAttachments,
  quoteNotes,
  quoteRequests,
  services,
  siteContent,
  users,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const HERO_IMAGE = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-1.webp";
const MOLDING_IMAGE = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-2.webp";
const HISTORY_IMAGE = "/manus-storage/async-images/7w6Qk7vYuuiZ1x6RKVDxLn/image-3.webp";

export const DEFAULT_CONTENT = {
  settings: {
    companyName: "LimerGesso",
    responsible: "Junior Felizatti",
    logoUrl: "",
    phonePrimary: "(19) 98266-3443",
    phoneSecondary: "(19) 98121-4643",
    email: "limergesso@email.com",
    instagram: "https://www.instagram.com/limergesso/",
    address: "",
    mapUrl: "",
    heroImageUrl: HERO_IMAGE,
    historyImageUrl: HISTORY_IMAGE,
  },
  content: {
    heroTitle: "Há mais de 40 anos transformando ambientes através do gesso.",
    heroBody: "Experiência, qualidade e precisão em cada detalhe. Criamos soluções em gesso que valorizam ambientes residenciais e comerciais, unindo tradição, sofisticação e acabamento de excelência.",
    aboutTitle: "Mais de 40 anos transformando ambientes",
    aboutBody: "Há mais de 40 anos, construímos nossa história no mercado de gesso, unindo experiência, qualidade e dedicação em cada projeto realizado.\n\nAo longo dessas décadas, acompanhamos a evolução do setor e aprimoramos nossas técnicas para oferecer soluções modernas, funcionais e com acabamento impecável.\n\nNosso compromisso vai além de executar um serviço: buscamos entender a necessidade de cada cliente e transformar suas ideias em ambientes sofisticados e bem executados.\n\nTrabalhamos com responsabilidade, atenção aos detalhes e respeito aos prazos, sempre buscando entregar um resultado que supere as expectativas.\n\nMais de 40 anos de experiência.\nMilhares de projetos realizados.\nUm compromisso que permanece: fazer bem feito.",
    historyTitle: "40 anos de história, milhares de ambientes transformados.",
    historyBody: "Uma trajetória construída com conhecimento técnico, atenção aos detalhes e a confiança de quem escolhe fazer bem feito.",
    classicTitle: "Molduras clássicas, assinatura de tradição",
    classicBody: "A tradição das molduras clássicas, um diferencial da LimerGesso na região.",
  },
};

export const DEFAULT_SERVICES = [
  ["Forros de gesso", "Superfícies contínuas e precisas para elevar o conforto e a linguagem arquitetônica do ambiente.", "Forros de gesso", HERO_IMAGE],
  ["Sancas", "Recortes e volumes que desenham a luz e criam uma atmosfera acolhedora.", "Sancas e iluminação", HISTORY_IMAGE],
  ["Iluminação embutida", "Integração cuidadosa entre gesso, luz e proporção para um resultado limpo.", "Sancas e iluminação", HERO_IMAGE],
  ["Divisórias em drywall", "Soluções versáteis para organizar espaços com rapidez, desempenho e acabamento.", "Drywall e divisórias", HISTORY_IMAGE],
  ["Painéis decorativos", "Composições sob medida que acrescentam textura, profundidade e personalidade.", "Painéis decorativos", MOLDING_IMAGE],
  ["Molduras e detalhes em gesso", "Elementos que valorizam encontros, transições e proporções do projeto.", "Reformas e acabamentos", MOLDING_IMAGE],
  ["Molduras clássicas", "Releituras e execução de detalhes clássicos com cuidado artesanal e precisão.", "Molduras clássicas", MOLDING_IMAGE],
  ["Projetos comerciais", "Acabamentos que comunicam a identidade de espaços comerciais e corporativos.", "Ambientes comerciais", HISTORY_IMAGE],
  ["Projetos residenciais", "Soluções personalizadas para transformar a casa em um espaço de permanência.", "Ambientes residenciais", HERO_IMAGE],
  ["Reformas e acabamentos", "Atenção aos detalhes para renovar ambientes com integração e coerência visual.", "Reformas e acabamentos", HISTORY_IMAGE],
] as const;

export const DEFAULT_PROJECTS = [
  ["Luz e proporção", "Sancas e iluminação", "Projeto conceitual de sala com planos de luz indireta e acabamento em gesso.", HERO_IMAGE, true],
  ["Clássico contemporâneo", "Molduras clássicas", "Referência visual conceitual de molduras ornamentais e volumes atemporais.", MOLDING_IMAGE, true],
  ["Ambientes que permanecem", "Ambientes residenciais", "Composição editorial conceitual para uma residência de linguagem neutra.", HISTORY_IMAGE, false],
] as const;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureDefaults() {
  const db = await getDb();
  if (!db) return;
  const [settings] = await db.select().from(companySettings).limit(1);
  if (!settings) await db.insert(companySettings).values(DEFAULT_CONTENT.settings);
  const [content] = await db.select().from(siteContent).limit(1);
  if (!content) await db.insert(siteContent).values(DEFAULT_CONTENT.content);
  const serviceCount = await db.select({ count: sql<number>`count(*)` }).from(services);
  if (Number(serviceCount[0]?.count ?? 0) === 0) {
    await db.insert(services).values(DEFAULT_SERVICES.map(([name, description, category, imageUrl], index) => ({
      name,
      slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
      description,
      category,
      imageUrl,
      sortOrder: index,
      published: true,
    })));
  }
  const projectCount = await db.select({ count: sql<number>`count(*)` }).from(projects);
  if (Number(projectCount[0]?.count ?? 0) === 0) {
    await db.insert(projects).values(DEFAULT_PROJECTS.map(([title, category, description, coverImageUrl, featured], index) => ({
      title,
      category,
      description,
      coverImageUrl,
      featured,
      sortOrder: index,
      published: true,
      clientAuthorized: false,
    })));
  }
  const photoCount = await db.select({ count: sql<number>`count(*)` }).from(photos);
  if (Number(photoCount[0]?.count ?? 0) === 0) {
    await db.insert(photos).values([
      { title: "Luz desenhada no teto", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Sala sofisticada com iluminação embutida em teto de gesso", imageUrl: HERO_IMAGE, storageKey: null, category: "Sancas e iluminação", published: true, featured: true, sortOrder: 0 },
      { title: "Detalhe clássico", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Detalhe de moldura clássica em gesso com relevo floral", imageUrl: MOLDING_IMAGE, storageKey: null, category: "Molduras clássicas", published: true, featured: true, sortOrder: 1 },
      { title: "Planos e volumes", description: "Imagem ilustrativa conceitual — não representa obra realizada pela LimerGesso.", altText: "Ambiente contemporâneo com acabamento de gesso e luz indireta", imageUrl: HISTORY_IMAGE, storageKey: null, category: "Ambientes residenciais", published: true, featured: false, sortOrder: 2 },
    ]);
  }
  const categoryCount = await db.select({ count: sql<number>`count(*)` }).from(categories);
  if (Number(categoryCount[0]?.count ?? 0) === 0) {
    const categoryNames = ["Forros de gesso", "Sancas e iluminação", "Molduras clássicas", "Painéis decorativos", "Ambientes residenciais", "Ambientes comerciais", "Drywall e divisórias", "Reformas e acabamentos"];
    await db.insert(categories).values(categoryNames.map((name, index) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), kind: "photo" as const, sortOrder: index, published: true })));
  }
}

export async function getPublicSiteData() {
  const db = await getDb();
  if (!db) return { settings: DEFAULT_CONTENT.settings, content: DEFAULT_CONTENT.content, services: DEFAULT_SERVICES.map(([name, description, category, imageUrl], id) => ({ id, name, description, category, imageUrl, published: true })), projects: DEFAULT_PROJECTS.map(([title, category, description, coverImageUrl, featured], id) => ({ id, title, category, description, coverImageUrl, featured, published: true })), photos: [] };
  await ensureDefaults();
  const [settings] = await db.select().from(companySettings).limit(1);
  const [content] = await db.select().from(siteContent).limit(1);
  const serviceRows = await db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder));
  const projectRows = await db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sortOrder));
  const photoRows = await db.select().from(photos).where(and(eq(photos.published, true), isNull(photos.deletedAt))).orderBy(asc(photos.sortOrder));
  return { settings: settings ?? DEFAULT_CONTENT.settings, content: content ?? DEFAULT_CONTENT.content, services: serviceRows, projects: projectRows, photos: photoRows };
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalQuotes: 0, newQuotes: 0, inAnalysis: 0, sentQuotes: 0, approvedQuotes: 0, completedQuotes: 0, publishedServices: 0, publishedProjects: 0 };
  const countBy = async (table: any, condition?: any) => {
    const query = condition ? db.select({ count: sql<number>`count(*)` }).from(table).where(condition) : db.select({ count: sql<number>`count(*)` }).from(table);
    const rows = await query;
    return Number(rows[0]?.count ?? 0);
  };
  return {
    totalQuotes: await countBy(quoteRequests, isNull(quoteRequests.deletedAt)),
    newQuotes: await countBy(quoteRequests, and(eq(quoteRequests.status, "Novo"), isNull(quoteRequests.deletedAt))),
    inAnalysis: await countBy(quoteRequests, and(eq(quoteRequests.status, "Em análise"), isNull(quoteRequests.deletedAt))),
    sentQuotes: await countBy(quoteRequests, and(eq(quoteRequests.status, "Orçamento enviado"), isNull(quoteRequests.deletedAt))),
    approvedQuotes: await countBy(quoteRequests, and(eq(quoteRequests.status, "Aprovado"), isNull(quoteRequests.deletedAt))),
    completedQuotes: await countBy(quoteRequests, and(eq(quoteRequests.status, "Concluído"), isNull(quoteRequests.deletedAt))),
    publishedServices: await countBy(services, eq(services.published, true)),
    publishedProjects: await countBy(projects, eq(projects.published, true)),
  };
}

export async function listQuotes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteRequests).where(isNull(quoteRequests.deletedAt)).orderBy(desc(quoteRequests.createdAt));
}

export async function listQuoteNotes(quoteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: quoteNotes.id, note: quoteNotes.note, createdAt: quoteNotes.createdAt, authorName: users.name }).from(quoteNotes).leftJoin(users, eq(users.id, quoteNotes.authorId)).where(eq(quoteNotes.quoteId, quoteId)).orderBy(desc(quoteNotes.createdAt));
}

export async function listAdminPhotos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(photos).where(isNull(photos.deletedAt)).orderBy(asc(photos.sortOrder), desc(photos.createdAt));
}

export async function listAdminServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).orderBy(asc(services.sortOrder));
}

export async function listAdminProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(asc(projects.sortOrder));
}

export async function getSettingsAndContent() {
  const db = await getDb();
  if (!db) return DEFAULT_CONTENT;
  await ensureDefaults();
  const [settings] = await db.select().from(companySettings).limit(1);
  const [content] = await db.select().from(siteContent).limit(1);
  return { settings: settings ?? DEFAULT_CONTENT.settings, content: content ?? DEFAULT_CONTENT.content };
}

export async function findRecentDuplicate(dedupeHash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(quoteRequests).where(and(eq(quoteRequests.dedupeHash, dedupeHash), sql`${quoteRequests.createdAt} > DATE_SUB(NOW(), INTERVAL 10 MINUTE)`)).limit(1);
  return row;
}

export async function createQuote(input: { publicId: string; fullName: string; whatsapp: string; city: string; service: string; message: string; dedupeHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(quoteRequests).values(input);
  return { id: Number(result[0].insertId), publicId: input.publicId };
}

export async function addAttachment(input: { quoteId: number; storageKey: string; imageUrl: string; fileName: string; contentType: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(quoteAttachments).values(input);
}

export async function getQuoteDetails(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1);
  if (!quote) return null;
  const attachments = await db.select().from(quoteAttachments).where(eq(quoteAttachments.quoteId, id));
  const notes = await listQuoteNotes(id);
  return { quote, attachments, notes };
}

export { categories, companySettings, photos, projects, quoteAttachments, quoteNotes, quoteRequests, services, siteContent, users };
