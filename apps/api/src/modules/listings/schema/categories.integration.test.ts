import { eq } from "drizzle-orm";
import { expect } from "vitest";
import { dbTest } from "#test/db.ts";
import { categories } from "./categories.ts";

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

dbTest(
  "a saved category reads back with an id from the database",
  async ({ db }) => {
    const [saved] = await db
      .insert(categories)
      .values({ slug: "bikes" })
      .returning();
    const read = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, "bikes"));

    expect(read).toEqual([saved]);
  },
);

dbTest("two categories can't share a slug", async ({ db }) => {
  await db.insert(categories).values({ slug: "books" });

  await expect(
    db.insert(categories).values({ slug: "books" }),
  ).rejects.toMatchObject({ cause: { code: UNIQUE_VIOLATION } });
});

dbTest.for(["Books", "home garden", "-books", "books-", "a--b", "книги"])(
  "slug %j is rejected: only a-z, digits and single dashes",
  async (slug, { db }) => {
    await expect(db.insert(categories).values({ slug })).rejects.toMatchObject({
      cause: { code: CHECK_VIOLATION },
    });
  },
);
