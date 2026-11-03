import { sql } from "drizzle-orm";
import express, { type Express, type Router } from "express";
import { healthResponseSchema } from "@tnt/api-schemas";
import type { Db } from "#platform/db/db.ts";

export function createApp({
  db,
  modules,
}: {
  db: Db;
  modules: Router[];
}): Express {
  const app = express();

  app.get("/api/health", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json(healthResponseSchema.parse({ status: "ok" }));
    } catch {
      res
        .status(503)
        .json(healthResponseSchema.parse({ status: "unavailable" }));
    }
  });

  for (const router of modules) app.use("/api", router);

  return app;
}
