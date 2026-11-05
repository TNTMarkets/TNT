import { once } from "node:events";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "#platform/db/db.ts";
import type { Db } from "#platform/db/db.ts";
import { request } from "#test/http.ts";
import { createApp } from "./create-app.ts";

const db = createDb(inject("dbConfig"));

afterAll(async () => {
  await db.$client.end();
});

function health(appDb: Db) {
  return request(createApp({ db: appDb, modules: [] }), {
    path: "/api/health",
  });
}

async function freePort() {
  const server = createServer().listen(0);
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  server.close();
  await once(server, "close");
  return port;
}

test("GET /api/health is ok when the db answers", async () => {
  expect(await health(db)).toEqual({ status: 200, body: { status: "ok" } });
});

test("GET /api/health is unavailable when the db doesn't answer", async () => {
  const deadDb = createDb({ ...inject("dbConfig"), port: await freePort() });
  try {
    expect(await health(deadDb)).toEqual({
      status: 503,
      body: { status: "unavailable" },
    });
  } finally {
    await deadDb.$client.end();
  }
});
