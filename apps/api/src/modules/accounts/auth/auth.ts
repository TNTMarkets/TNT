import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import type { Db } from "#platform/db/db.ts";
import type { AuthConfig } from "./config.ts";
import * as schema from "./schema.ts";

const INTRA42_API = "https://api.intra.42.fr";

export function createAuth({
  db,
  config,
  plugins = [],
}: {
  db: Db;
  config: AuthConfig;
  plugins?: BetterAuthPlugin[];
}) {
  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
    advanced: { database: { generateId: false } },
    account: { encryptOAuthTokens: true },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: "42",
            clientId: config.intra42.clientId,
            clientSecret: config.intra42.clientSecret,
            authorizationUrl: `${INTRA42_API}/oauth/authorize`,
            tokenUrl: `${INTRA42_API}/oauth/token`,
            userInfoUrl: `${INTRA42_API}/v2/me`,
            scopes: ["public"],
            mapProfileToUser: (profile) => ({
              name: String(profile["displayname"] ?? profile["login"]),
              image: (profile["image"] as { link?: string } | undefined)?.link,
              // 42 verifies emails
              emailVerified: true,
            }),
          },
        ],
      }),
      ...plugins,
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
