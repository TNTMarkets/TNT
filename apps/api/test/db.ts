import { TransactionRollbackError } from "drizzle-orm";
import { inject, test } from "vitest";
import { createDb } from "#platform/db/db.ts";
import type { Db, DbPool } from "#platform/db/db.ts";

export async function rollbackAfter(
  pool: DbPool,
  use: (db: Db) => Promise<void>,
): Promise<void> {
  try {
    await pool.transaction(async (tx) => {
      await use(tx);
      tx.rollback();
    });
  } catch (error) {
    if (!(error instanceof TransactionRollbackError)) throw error;
  }
}

export const dbTest = test.extend<{
  $file: { pool: DbPool };
  $test: { db: Db };
}>({
  pool: [
    async ({}, use) => {
      const pool = createDb(inject("dbConfig"));
      await use(pool);
      await pool.$client.end();
    },
    { scope: "file" },
  ],
  db: async ({ pool }, use) => {
    await rollbackAfter(pool, use);
  },
});
