import { sql } from "drizzle-orm";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "#platform/db/db.ts";
import { rollbackAfter } from "#test/db.ts";

const pool = createDb(inject("dbConfig"), { onnotice: false });

afterAll(async () => {
  await pool.$client.end();
});

async function tableExists(name: string): Promise<boolean> {
  const [row] = await pool.execute<{ name: string | null }>(
    sql`select to_regclass(${name}) as name`,
  );
  return Boolean(row?.name);
}

test("what the test writes is visible inside it and gone after", async () => {
  let rowsInside = 0;

  await rollbackAfter(pool, async (db) => {
    await db.execute(sql`create table rollback_probe_written (id int)`);
    await db.execute(sql`insert into rollback_probe_written values (1)`);
    rowsInside = (await db.execute(sql`select * from rollback_probe_written`))
      .length;
  });

  expect(rowsInside).toBe(1);
  expect(await tableExists("rollback_probe_written")).toBe(false);
});

test("an error in the test reaches vitest, and the writes still roll back", async () => {
  await expect(
    rollbackAfter(pool, async (db) => {
      await db.execute(sql`create table rollback_probe_failed (id int)`);
      throw new Error("test failed");
    }),
  ).rejects.toThrow("test failed");

  expect(await tableExists("rollback_probe_failed")).toBe(false);
});

test("a transaction inside the test rolls back too", async () => {
  await rollbackAfter(pool, async (db) => {
    await db.transaction(async (tx) => {
      await tx.execute(sql`create table rollback_probe_nested (id int)`);
    });
  });

  expect(await tableExists("rollback_probe_nested")).toBe(false);
});
