import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "./db.ts";
import { runMigrations } from "./migrate.ts";
import type { JournalEntry } from "./migration-order.ts";

const db = createDb(inject("dbConfig"));

afterAll(async () => {
  await db.$client.end();
});

test("on a migrated database, applies nothing and reports nothing", async () => {
  const [before] = await db.execute<{ count: string }>(
    sql`select count(*) from drizzle.__drizzle_migrations`,
  );

  const applied = await runMigrations(db);

  const [after] = await db.execute<{ count: string }>(
    sql`select count(*) from drizzle.__drizzle_migrations`,
  );
  expect(after).toEqual(before);
  expect(applied).toEqual([]);
});

test("on an empty database, applies every migration and reports their names in order", async () => {
  const journal = JSON.parse(
    readFileSync(
      new URL("../../../drizzle/meta/_journal.json", import.meta.url),
      "utf8",
    ),
  ) as { entries: JournalEntry[] };
  const database = "empty_for_migrate_test";
  await db.execute(sql.raw(`create database ${database}`));
  const emptyDb = createDb(
    { ...inject("dbConfig"), database },
    { onnotice: false },
  );

  try {
    const applied = await runMigrations(emptyDb);

    expect(applied).toEqual(journal.entries.map((entry) => entry.tag));
  } finally {
    await emptyDb.$client.end();
    await db.execute(sql.raw(`drop database ${database}`));
  }
});
