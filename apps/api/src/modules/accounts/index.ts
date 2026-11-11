import { Router } from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import type { Db } from "#platform/db/db.ts";
import type { GetUserId } from "#platform/http/require-user.ts";
import type { Auth } from "./auth/auth.ts";
import { authRoutes } from "./auth/routes.ts";

export function createAccountsModule({ db, auth }: { db: Db; auth: Auth }) {
  const getUserId: GetUserId = async (headers, res) => {
    const { headers: out, response } = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
      returnHeaders: true,
    });
    // Keep the refreshed session cookie
    const cookies = out.getSetCookie();
    if (cookies.length > 0) res.append("set-cookie", cookies);
    return response?.user.id ?? null;
  };
  const router = Router();
  router.use(authRoutes({ db, getUserId }));
  return { router, authHandler: toNodeHandler(auth), getUserId };
}

export { createAuth } from "./auth/auth.ts";
export { authConfigFromEnv, type AuthConfig } from "./auth/config.ts";
export * from "./schema.ts";
