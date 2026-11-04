import { expect } from "vitest";
import { dbTest } from "#test/db.ts";
import { categories } from "./schema.ts";

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

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
