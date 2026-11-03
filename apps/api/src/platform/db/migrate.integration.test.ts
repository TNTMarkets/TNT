import { sql } from "drizzle-orm";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "./db.ts";
import { runMigrations } from "./migrate.ts";

const db = createDb(inject("dbConfig"));

afterAll(async () => {
  await db.$client.end();
});

test("running migrations again on a migrated database changes nothing", async () => {
  const [before] = await db.execute<{ count: string }>(
    sql`select count(*) from drizzle.__drizzle_migrations`,
  );

  await runMigrations(db);

  const [after] = await db.execute<{ count: string }>(
    sql`select count(*) from drizzle.__drizzle_migrations`,
  );
  expect(after).toEqual(before);
});
