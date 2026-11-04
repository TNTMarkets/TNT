import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { DbPool } from "./db.ts";
import type { JournalEntry } from "./migration-order.ts";

const migrationsFolder = fileURLToPath(
  new URL("../../../drizzle", import.meta.url),
);
const journalFile = `${migrationsFolder}/meta/_journal.json`;

export async function runMigrations(db: DbPool): Promise<string[]> {
  const lastAppliedBefore = await lastAppliedAt(db);
  await migrate(db, { migrationsFolder });
  const journal = JSON.parse(await readFile(journalFile, "utf8")) as {
    entries: JournalEntry[];
  };
  return journal.entries
    .filter((entry) => entry.when > lastAppliedBefore)
    .map((entry) => entry.tag);
}

// Drizzle saves each migration's journal `when` as created_at.
async function lastAppliedAt(db: DbPool): Promise<number> {
  const [table] = await db.execute<{ name: string | null }>(
    sql`select to_regclass('drizzle.__drizzle_migrations') as name`,
  );
  if (!table?.name) return 0;
  const [row] = await db.execute<{ last: string | null }>(
    sql`select max(created_at) as last from drizzle.__drizzle_migrations`,
  );
  return Number(row?.last ?? 0);
}
