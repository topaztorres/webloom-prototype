import { sites } from "@shared/schema";
import type { Site, InsertSite } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Ensure table exists (lightweight bootstrap so we don't require drizzle-kit at runtime)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Curiosities',
    tags TEXT NOT NULL DEFAULT '[]',
    submitted_by TEXT NOT NULL DEFAULT 'anonymous',
    status TEXT NOT NULL DEFAULT 'approved',
    visits INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  listSites(opts?: { status?: string; category?: string }): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(input: InsertSite): Promise<Site>;
  getRandomApproved(excludeId?: number): Promise<Site | undefined>;
  incrementVisits(id: number): Promise<Site | undefined>;
  stats(): Promise<{ total: number; totalVisits: number; categories: { name: string; count: number }[]; contributors: number }>;
}

export class DatabaseStorage implements IStorage {
  async listSites(opts: { status?: string; category?: string } = {}): Promise<Site[]> {
    const query = db.select().from(sites);
    const rows = query.all();
    return rows
      .filter((r) => (opts.status ? r.status === opts.status : true))
      .filter((r) => (opts.category ? r.category === opts.category : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getSite(id: number): Promise<Site | undefined> {
    return db.select().from(sites).where(eq(sites.id, id)).get();
  }

  async createSite(input: InsertSite): Promise<Site> {
    const row = {
      title: input.title,
      url: input.url,
      description: input.description ?? "",
      category: input.category ?? "Curiosities",
      tags: input.tags ?? "[]",
      submittedBy: input.submittedBy && input.submittedBy.trim() ? input.submittedBy : "anonymous",
      status: "approved", // prototype: auto-approve
      visits: 0,
      createdAt: Date.now(),
    };
    return db.insert(sites).values(row).returning().get();
  }

  async getRandomApproved(excludeId?: number): Promise<Site | undefined> {
    const rows = db
      .select()
      .from(sites)
      .where(eq(sites.status, "approved"))
      .all();
    const pool = excludeId ? rows.filter((r) => r.id !== excludeId) : rows;
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async incrementVisits(id: number): Promise<Site | undefined> {
    db.update(sites)
      .set({ visits: sql`${sites.visits} + 1` })
      .where(eq(sites.id, id))
      .run();
    return this.getSite(id);
  }

  async stats() {
    const rows = db.select().from(sites).where(eq(sites.status, "approved")).all();
    const total = rows.length;
    const totalVisits = rows.reduce((s, r) => s + r.visits, 0);
    const catMap = new Map<string, number>();
    rows.forEach((r) => catMap.set(r.category, (catMap.get(r.category) ?? 0) + 1));
    const categories = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const contributors = new Set(rows.map((r) => r.submittedBy)).size;
    return { total, totalVisits, categories, contributors };
  }
}

export const storage = new DatabaseStorage();

// ---------- Seeding ----------
const SEEDS: Array<Omit<Site, "id" | "createdAt" | "visits" | "status">> = [
  {
    title: "The Useless Web",
    url: "https://theuselessweb.com",
    description: "A single button that flings you to a wonderfully pointless corner of the internet.",
    category: "Curiosities",
    tags: JSON.stringify(["random", "classic", "fun"]),
    submittedBy: "topaz",
  },
  {
    title: "Window Swap",
    url: "https://www.window-swap.com",
    description: "Look out of strangers' windows from anywhere in the world. Quietly beautiful.",
    category: "Maps & Worlds",
    tags: JSON.stringify(["windows", "calm", "global"]),
    submittedBy: "wanderlust",
  },
  {
    title: "Radiooooo",
    url: "https://radiooooo.com",
    description: "A musical time machine: pick a country, pick a decade, listen to the world.",
    category: "Music & Sound",
    tags: JSON.stringify(["radio", "music", "travel"]),
    submittedBy: "mira",
  },
  {
    title: "Neal.fun",
    url: "https://neal.fun",
    description: "Tiny, brilliant interactive experiments. Internet candy.",
    category: "Games & Play",
    tags: JSON.stringify(["interactive", "indie", "creative"]),
    submittedBy: "topaz",
  },
  {
    title: "Patatap",
    url: "https://patatap.com",
    description: "A portable animation and sound kit. Hit keys, make joy.",
    category: "Music & Sound",
    tags: JSON.stringify(["animation", "audio", "play"]),
    submittedBy: "kai",
  },
  {
    title: "The Internet Archive",
    url: "https://archive.org",
    description: "A nonprofit library of the internet — books, software, old web, free forever.",
    category: "Learning",
    tags: JSON.stringify(["archive", "history", "library"]),
    submittedBy: "rowan",
  },
  {
    title: "Drawing Garden",
    url: "https://drawing.garden",
    description: "Click and drag to grow soft little plants. Pure useless beauty.",
    category: "Useless Beauty",
    tags: JSON.stringify(["generative", "calm", "drawing"]),
    submittedBy: "leah",
  },
  {
    title: "Pointer Pointer",
    url: "https://pointerpointer.com",
    description: "A photograph of someone pointing at your cursor. Always. Somehow.",
    category: "Internet Lore",
    tags: JSON.stringify(["meme", "classic", "weird"]),
    submittedBy: "anonymous",
  },
  {
    title: "Stars",
    url: "https://stars.chromeexperiments.com",
    description: "Fly through 119,617 nearby stars. Built with WebGL.",
    category: "Maps & Worlds",
    tags: JSON.stringify(["space", "webgl", "data"]),
    submittedBy: "topaz",
  },
  {
    title: "Bouncy Ball Generator",
    url: "https://bouncyballs.org",
    description: "Sing into your mic; balls bounce to your voice. Genuinely delightful.",
    category: "Games & Play",
    tags: JSON.stringify(["audio", "physics", "silly"]),
    submittedBy: "kai",
  },
  {
    title: "Submarine Cable Map",
    url: "https://www.submarinecablemap.com",
    description: "The literal physical internet — cables stretched across the ocean floor.",
    category: "Tech & Tools",
    tags: JSON.stringify(["infrastructure", "map", "data"]),
    submittedBy: "rowan",
  },
  {
    title: "Bruno Simon Portfolio",
    url: "https://bruno-simon.com",
    description: "Drive a tiny 3D car through a designer's portfolio. Iconic.",
    category: "Art & Design",
    tags: JSON.stringify(["threejs", "portfolio", "iconic"]),
    submittedBy: "mira",
  },
  {
    title: "Quick, Draw!",
    url: "https://quickdraw.withgoogle.com",
    description: "Can a neural net guess your doodle? You have twenty seconds. Go.",
    category: "Learning",
    tags: JSON.stringify(["ai", "drawing", "game"]),
    submittedBy: "leah",
  },
  {
    title: "Long Bets",
    url: "https://longbets.org",
    description: "Public predictions about the future, with money behind them. Long-term thinking, online.",
    category: "Learning",
    tags: JSON.stringify(["futurism", "philosophy", "long-now"]),
    submittedBy: "rowan",
  },
  {
    title: "Silk — Interactive Generative Art",
    url: "http://weavesilk.com",
    description: "Draw symmetrical, glowing ribbons of light. Meditative.",
    category: "Art & Design",
    tags: JSON.stringify(["generative", "drawing", "calm"]),
    submittedBy: "leah",
  },
];

export function seedIfEmpty() {
  const count = db.select({ c: sql<number>`count(*)` }).from(sites).get();
  if (!count || (count.c ?? 0) > 0) return;
  const now = Date.now();
  SEEDS.forEach((s, i) => {
    db.insert(sites)
      .values({
        ...s,
        status: "approved",
        visits: Math.floor(Math.random() * 60),
        // stagger created times to feel like real history (newest last in array → oldest first; reverse so first item is newest)
        createdAt: now - (SEEDS.length - i) * 1000 * 60 * 60 * 6,
      })
      .run();
  });
}

seedIfEmpty();
