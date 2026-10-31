import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, test } from "vitest";
import { createApp } from "./app.ts";

let server: Server;
let baseUrl = "";

beforeAll(async () => {
  server = createApp().listen(0);
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://localhost:${String(port)}`;
});

afterAll(() => {
  server.close();
});

test("GET /api/health returns status ok", async () => {
  const res = await fetch(`${baseUrl}/api/health`);

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
