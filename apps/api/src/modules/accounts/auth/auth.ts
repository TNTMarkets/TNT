import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import type { Db } from "#platform/db/db.ts";
import type { AuthConfig } from "./config.ts";
import * as schema from "./schema.ts";

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
            authorizationUrl: "https://api.intra.42.fr/oauth/authorize",
            tokenUrl: "https://api.intra.42.fr/oauth/token",
            userInfoUrl: "https://api.intra.42.fr/v2/me",
            scopes: ["public"],
            mapProfileToUser: (profile) => ({
              name: String(profile["displayname"]),
              image: (profile["image"] as { link?: string } | undefined)?.link,
              // 42 gives every student a school email it has checked
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
