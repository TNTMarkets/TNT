import { asc } from "drizzle-orm";
import type { Db } from "#platform/db/db.ts";
import { categories } from "./schema.ts";

export async function listCategories(
  db: Db,
): Promise<{ id: string; slug: string }[]> {
  return db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.slug));
}
