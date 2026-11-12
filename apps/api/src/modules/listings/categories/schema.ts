import { check, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { id } from "#platform/db/columns.ts";

export const categories = pgTable(
  "categories",
  {
    id: id(),
    slug: text().notNull().unique(),
  },
  (table) => [
    check(
      "categories_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
  ],
);
