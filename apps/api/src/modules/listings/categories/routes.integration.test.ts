import { expect } from "vitest";
import { categoriesResponseSchema } from "@tnt/api-schemas/listings";
import type { Db } from "#platform/db/db.ts";
import { dbTest } from "#test/db.ts";
import { request } from "#test/http.ts";
import { createApp } from "#app/create-app.ts";
import { createListingsModule } from "#modules/listings/index.ts";
import { categories } from "./schema.ts";

function getCategories(db: Db) {
  return request(createApp({ db, modules: [createListingsModule({ db })] }), {
    path: "/api/categories",
  });
}

dbTest(
  "GET /api/categories lists categories sorted by slug",
  async ({ db }) => {
    await db.insert(categories).values([{ slug: "books" }, { slug: "bikes" }]);

    const { status, body } = await getCategories(db);

    expect(status).toBe(200);
    const listed = categoriesResponseSchema.parse(body).categories;
    expect(listed.map((category) => category.slug)).toEqual(["bikes", "books"]);
  },
);

dbTest(
  "GET /api/categories is an empty list when there are none",
  async ({ db }) => {
    expect(await getCategories(db)).toEqual({
      status: 200,
      body: { categories: [] },
    });
  },
);
