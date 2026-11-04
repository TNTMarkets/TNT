import { Router } from "express";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { createDb } from "#platform/db/db.ts";
import { HttpError } from "#platform/http/errors.ts";
import type { AppModule } from "#platform/http/module.ts";
import { parseRequest } from "#platform/http/parse-request.ts";
import { request } from "#test/http.ts";
import { createApp } from "./create-app.ts";

// postgres.js connects on the first query; these tests never query
const db = createDb({
  host: "localhost",
  port: 1,
  user: "unused",
  password: "unused",
  database: "unused",
});

function moduleWith(build: (router: Router) => void): AppModule {
  const router = Router();
  build(router);
  return { router };
}

describe("errors answer JSON", () => {
  test("an unknown /api path is 404 not_found", async () => {
    const app = createApp({ db, modules: [] });

    expect(await request(app, { path: "/api/nope" })).toEqual({
      status: 404,
      body: { error: { code: "not_found" } },
    });
  });

  test("an HttpError keeps its status and code", async () => {
    const app = createApp({
      db,
      modules: [
        moduleWith((router) =>
          router.get("/gone", () => {
            throw new HttpError(410, "gone");
          }),
        ),
      ],
    });

    expect(await request(app, { path: "/api/gone" })).toEqual({
      status: 410,
      body: { error: { code: "gone" } },
    });
  });

  test("an unexpected error is 500 internal, logged, and its message stays inside", async () => {
    const logError = vi.fn();
    const failure = new Error("secret detail");
    const app = createApp({
      db,
      logError,
      modules: [
        moduleWith((router) =>
          router.get("/broken", () => {
            throw failure;
          }),
        ),
      ],
    });

    expect(await request(app, { path: "/api/broken" })).toEqual({
      status: 500,
      body: { error: { code: "internal" } },
    });
    expect(logError).toHaveBeenCalledWith(failure);
  });
});

describe("request bodies", () => {
  const echo = moduleWith((router) =>
    router.post("/echo", (req, res) => {
      res.json(parseRequest(z.object({ name: z.string() }), req.body));
    }),
  );

  test("a valid JSON body reaches the route", async () => {
    const app = createApp({ db, modules: [echo] });

    expect(
      await request(app, {
        method: "POST",
        path: "/api/echo",
        body: { name: "a" },
      }),
    ).toEqual({ status: 200, body: { name: "a" } });
  });

  test("a body that doesn't match the schema is 400 invalid_request", async () => {
    const app = createApp({ db, modules: [echo] });

    expect(
      await request(app, { method: "POST", path: "/api/echo", body: {} }),
    ).toEqual({ status: 400, body: { error: { code: "invalid_request" } } });
  });

  test("malformed JSON is 400 invalid_request", async () => {
    const app = createApp({ db, modules: [echo] });

    expect(
      await request(app, { method: "POST", path: "/api/echo", rawBody: "{" }),
    ).toEqual({ status: 400, body: { error: { code: "invalid_request" } } });
  });

  test("a body over 100 kB is 413 payload_too_large", async () => {
    const app = createApp({ db, modules: [echo] });

    expect(
      await request(app, {
        method: "POST",
        path: "/api/echo",
        body: { name: "x".repeat(101 * 1024) },
      }),
    ).toEqual({ status: 413, body: { error: { code: "payload_too_large" } } });
  });
});

describe("module routes", () => {
  test("two modules can't declare the same method and path", () => {
    const first = moduleWith((router) => router.get("/things", () => {}));
    const second = moduleWith((router) =>
      router.use(Router().get("/things", () => {})),
    );

    expect(() => createApp({ db, modules: [first, second] })).toThrow(
      "GET /things",
    );
  });

  test("the same path with different methods is fine", () => {
    const reads = moduleWith((router) => router.get("/things", () => {}));
    const writes = moduleWith((router) => router.post("/things", () => {}));

    expect(() => createApp({ db, modules: [reads, writes] })).not.toThrow();
  });

  test("a feature router can't be mounted under a path", () => {
    const nested = moduleWith((router) =>
      router.use(
        "/things",
        Router().get("/", () => {}),
      ),
    );

    expect(() => createApp({ db, modules: [nested] })).toThrow(
      "without a path",
    );
  });
});
