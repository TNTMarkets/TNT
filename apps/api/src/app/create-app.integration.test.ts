import { once } from "node:events";
import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "#platform/db/db.ts";
import type { Db } from "#platform/db/db.ts";
import { serve } from "#platform/http/serve.ts";
import { createApp } from "./create-app.ts";

const db = createDb(inject("dbConfig"));

afterAll(async () => {
  await db.$client.end();
});

async function health(appDb: Db) {
  const { port, shutdown } = await serve(
    createApp({ db: appDb, modules: [] }),
    {
      port: 0,
      onClose: () => {},
    },
  );
  try {
    const res = await fetch(`http://localhost:${String(port)}/api/health`);
    return { status: res.status, body: (await res.json()) as unknown };
  } finally {
    await shutdown();
  }
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
