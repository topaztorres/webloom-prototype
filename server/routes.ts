import type { Express } from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { storage } from "./storage";
import { insertSiteSchema, siteToView } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // List all sites (optionally filter by category/status)
  app.get("/api/sites", async (req, res) => {
    const { category, status } = req.query as { category?: string; status?: string };
    const list = await storage.listSites({
      status: status ?? "approved",
      category: category && category !== "All" ? category : undefined,
    });
    res.json(list.map(siteToView));
  });

  // Stats for dashboard
  app.get("/api/stats", async (_req, res) => {
    const s = await storage.stats();
    res.json(s);
  });

  // Random approved site
  app.get("/api/sites/random", async (req, res) => {
    const excludeId = req.query.exclude ? Number(req.query.exclude) : undefined;
    const site = await storage.getRandomApproved(
      Number.isFinite(excludeId) ? (excludeId as number) : undefined
    );
    if (!site) return res.status(404).json({ message: "No sites available yet" });
    res.json(siteToView(site));
  });

  // Increment visit count
  app.post("/api/sites/:id/visit", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const updated = await storage.incrementVisits(id);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(siteToView(updated));
  });

  // Create a new site
  app.post("/api/sites", async (req, res) => {
    try {
      const parsed = insertSiteSchema.parse(req.body);
      const created = await storage.createSite(parsed);
      res.status(201).json(siteToView(created));
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.flatten(),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
