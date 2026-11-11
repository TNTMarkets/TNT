import { eq } from "drizzle-orm";
import { testUtils, type TestHelpers } from "better-auth/plugins";
import { expect } from "vitest";
import { z } from "zod";
import type { Db } from "#platform/db/db.ts";
import { dbTest } from "#test/db.ts";
import { request, requestWithHeaders } from "#test/http.ts";
import { createApp } from "#app/create-app.ts";
import { createAccountsModule, createAuth } from "#modules/accounts/index.ts";
import { sessions, users } from "./schema.ts";

const config = {
  baseURL: "http://localhost:3000",
  secret: "test-secret-at-least-32-characters-long",
  intra42: { clientId: "test-client-id", clientSecret: "test-client-secret" },
};

async function setup(db: Db) {
  const auth = createAuth({ db, config, plugins: [testUtils()] });
  const accounts = createAccountsModule({ db, auth });
  const app = createApp({
    db,
    auth: accounts.authHandler,
    modules: [accounts],
  });
  const { test } = (await auth.$context) as unknown as { test: TestHelpers };
  return { app, test };
}

dbTest("GET /api/me answers 401 without a session", async ({ db }) => {
  const { app } = await setup(db);

  expect(await request(app, { path: "/api/me" })).toEqual({
    status: 401,
    body: { error: { code: "unauthorized" } },
  });
});

dbTest("GET /api/me answers the signed-in user", async ({ db }) => {
  const { app, test } = await setup(db);
  const [user] = await db
    .insert(users)
    .values({ name: "Ada", email: "ada@student.42.fr" })
    .returning();
  if (!user) throw new Error("user not inserted");
  const headers = Object.fromEntries(
    await test.getAuthHeaders({ userId: user.id }),
  );

  expect(await request(app, { path: "/api/me", headers })).toEqual({
    status: 200,
    body: { user: { id: user.id, name: "Ada", image: null } },
  });
});

dbTest(
  "a day-old session is extended and the browser gets the new cookie",
  async ({ db }) => {
    const { app, test } = await setup(db);
    const [user] = await db
      .insert(users)
      .values({ name: "Ada", email: "ada@student.42.fr" })
      .returning();
    if (!user) throw new Error("user not inserted");
    const headers = Object.fromEntries(
      await test.getAuthHeaders({ userId: user.id }),
    );
    const inOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db
      .update(sessions)
      .set({ expiresAt: inOneDay })
      .where(eq(sessions.userId, user.id));

    const res = await requestWithHeaders(app, { path: "/api/me", headers });

    expect(res.status).toBe(200);
    expect(res.headers.getSetCookie().join("; ")).toContain(
      "better-auth.session_token=",
    );
  },
);

dbTest(
  "sign-in with 42 sends the user to 42 with our app and callback",
  async ({ db }) => {
    const { app } = await setup(db);

    const { status, body } = await request(app, {
      method: "POST",
      path: "/api/auth/sign-in/social",
      body: { provider: "42" },
      headers: { origin: config.baseURL },
    });

    expect(status).toBe(200);
    const url = new URL(z.object({ url: z.string() }).parse(body).url);
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://api.intra.42.fr/oauth/authorize",
    );
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/callback/42",
    );
  },
);
