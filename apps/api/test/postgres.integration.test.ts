import postgres from "postgres";
import { afterAll, expect, inject, test } from "vitest";

const sql = postgres(inject("databaseUrl"));

afterAll(async () => {
  await sql.end();
});

test("integration tests run on the Postgres version from compose.yaml", async () => {
  const [row] = await sql<{ server_version: string }[]>`show server_version`;

  expect(row?.server_version).toMatch(/^18\.6\b/);
});
