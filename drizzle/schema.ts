import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 120 }).notNull(),
  responsible: varchar("responsible", { length: 120 }).notNull(),
  logoUrl: text("logoUrl"),
  phonePrimary: varchar("phonePrimary", { length: 40 }).notNull(),
  phoneSecondary: varchar("phoneSecondary", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  instagram: varchar("instagram", { length: 240 }),
  address: text("address"),
  mapUrl: text("mapUrl"),
  heroImageUrl: text("heroImageUrl"),
  historyImageUrl: text("historyImageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteContent = mysqlTable("site_content", {
  id: int("id").autoincrement().primaryKey(),
  heroTitle: text("heroTitle").notNull(),
  heroBody: text("heroBody").notNull(),
  aboutTitle: text("aboutTitle").notNull(),
  aboutBody: text("aboutBody").notNull(),
  historyTitle: text("historyTitle").notNull(),
  historyBody: text("historyBody").notNull(),
  classicTitle: text("classicTitle").notNull(),
  classicBody: text("classicBody").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  kind: mysqlEnum("kind", ["service", "photo", "project"]).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description").notNull(),
  coverImageUrl: text("coverImageUrl"),
  clientName: varchar("clientName", { length: 160 }),
  city: varchar("city", { length: 160 }),
  clientAuthorized: boolean("clientAuthorized").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  altText: varchar("altText", { length: 240 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }),
  imageUrl: text("imageUrl").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  projectId: int("projectId"),
  published: boolean("published").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  fullName: varchar("fullName", { length: 180 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  service: varchar("service", { length: 160 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["Novo", "Em análise", "Orçamento enviado", "Aprovado", "Recusado", "Concluído"]).default("Novo").notNull(),
  dedupeHash: varchar("dedupeHash", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const quoteAttachments = mysqlTable("quote_attachments", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  fileName: varchar("fileName", { length: 240 }).notNull(),
  contentType: varchar("contentType", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quoteNotes = mysqlTable("quote_notes", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  authorId: int("authorId").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CompanySettings = typeof companySettings.$inferSelect;
export type SiteContent = typeof siteContent.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type QuoteAttachment = typeof quoteAttachments.$inferSelect;
export type QuoteNote = typeof quoteNotes.$inferSelect;
