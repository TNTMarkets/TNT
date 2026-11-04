import { Router } from "express";
import type { AppModule } from "#platform/http/module.ts";
import type { Db } from "#platform/db/db.ts";
import { categoriesRoutes } from "./categories/routes.ts";

export function createListingsModule({ db }: { db: Db }): AppModule {
  const router = Router();
  router.use(categoriesRoutes({ db }));
  return { router };
}

export * from "./schema.ts";
