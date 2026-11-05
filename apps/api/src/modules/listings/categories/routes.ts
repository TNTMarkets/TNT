import { Router } from "express";
import { categoriesResponseSchema } from "@tnt/api-schemas/listings";
import type { Db } from "#platform/db/db.ts";
import { listCategories } from "./queries.ts";

export function categoriesRoutes({ db }: { db: Db }): Router {
  const router = Router();

  router.get("/categories", async (_req, res) => {
    const categories = await listCategories(db);
    res.json(categoriesResponseSchema.parse({ categories }));
  });

  return router;
}
