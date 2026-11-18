import { Router } from "express";
import { meResponseSchema } from "@tnt/api-schemas/accounts";
import type { Db } from "#platform/db/db.ts";
import type { GetUserId } from "#platform/http/require-user.ts";
import { getCurrentUser } from "./queries.ts";

export function authRoutes({
  db,
  getUserId,
}: {
  db: Db;
  getUserId: GetUserId;
}): Router {
  const router = Router();

  router.get("/me", async (req, res) => {
    const user = await getCurrentUser(db, await getUserId(req.headers, res));
    res.json(meResponseSchema.parse({ user }));
  });

  return router;
}
