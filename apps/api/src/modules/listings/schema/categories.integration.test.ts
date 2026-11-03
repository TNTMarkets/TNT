import { eq } from "drizzle-orm";
import { afterAll, expect, inject, test } from "vitest";
import { createDb } from "#platform/db/db.ts";
import { categories } from "./categories.ts";

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

const db = createDb(inject("dbConfig"));

afterAll(async () => {
  await db.$client.end();
});

test("a saved category reads back with an id from the database", async () => {
  const [saved] = await db
    .insert(categories)
    .values({ slug: "bikes" })
    .returning();
  const read = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "bikes"));

  expect(read).toEqual([saved]);
});

test("two categories can't share a slug", async () => {
  await db.insert(categories).values({ slug: "books" });

  await expect(
    db.insert(categories).values({ slug: "books" }),
  ).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
});

test.each(["Books", "home garden", "-books", "books-", "a--b", "книги"])(
  "slug %j is rejected: only a-z, digits and single dashes",
  async (slug) => {
    await expect(db.insert(categories).values({ slug })).rejects.toMatchObject({
      cause: { code: CHECK_VIOLATION },
    });
  },
);
