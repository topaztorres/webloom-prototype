import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sites = sqliteTable("sites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("Curiosities"),
  // JSON-encoded string[] (SQLite has no array type)
  tags: text("tags").notNull().default("[]"),
  submittedBy: text("submitted_by").notNull().default("anonymous"),
  status: text("status").notNull().default("approved"), // approved | pending | rejected
  visits: integer("visits").notNull().default(0),
  createdAt: integer("created_at").notNull(), // unix ms
});

export const CATEGORIES = [
  "Curiosities",
  "Art & Design",
  "Tech & Tools",
  "Games & Play",
  "Music & Sound",
  "Learning",
  "Internet Lore",
  "Useless Beauty",
  "Maps & Worlds",
] as const;

// Insert schema with strict URL validation and tag transform
export const insertSiteSchema = createInsertSchema(sites, {
  title: (s) => s.min(1, "Title is required").max(120),
  url: () =>
    z
      .string()
      .min(1, "URL is required")
      .url("Must be a valid URL (include https://)")
      .refine((v) => /^https?:\/\//i.test(v), "URL must start with http:// or https://"),
  description: (s) => s.max(400).optional().default(""),
  category: () => z.enum(CATEGORIES).default("Curiosities"),
  // accept either a JSON string or array of strings; output is JSON string
  tags: () =>
    z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((v) => {
        if (!v) return "[]";
        if (Array.isArray(v)) return JSON.stringify(v.map((t) => t.trim()).filter(Boolean).slice(0, 8));
        // comma-separated string from form
        const arr = v
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 8);
        return JSON.stringify(arr);
      }),
  submittedBy: (s) => s.max(60).optional().default("anonymous"),
}).omit({ id: true, status: true, visits: true, createdAt: true });

export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;

// Helper for the frontend: tags as array
export type SiteWithTags = Omit<Site, "tags"> & { tags: string[] };

export const siteToView = (s: Site): SiteWithTags => {
  let tags: string[] = [];
  try {
    tags = JSON.parse(s.tags) as string[];
  } catch {
    tags = [];
  }
  return { ...s, tags };
};
