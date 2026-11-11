import { sql } from "drizzle-orm";
import express, { type Express, type RequestHandler } from "express";
import { healthResponseSchema } from "@tnt/api-schemas/health";
import type { Db } from "#platform/db/db.ts";
import { errorHandler, notFound } from "#platform/http/errors.ts";
import type { AppModule } from "#platform/http/module.ts";
import { assertNoRouteConflicts } from "#platform/http/module.ts";

export function createApp({
  db,
  modules,
  auth,
  logError = console.error,
}: {
  db: Db;
  modules: AppModule[];
  auth?: RequestHandler;
  logError?: (error: unknown) => void;
}): Express {
  assertNoRouteConflicts(modules);
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  // Before express.json(): Better Auth reads the request body itself
  if (auth) app.all("/api/auth/*splat", auth);
  app.use(express.json({ limit: "100kb" }));

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

  for (const module of modules) app.use("/api", module.router);

  app.use("/api", notFound);
  app.use(errorHandler(logError));

  return app;
}
