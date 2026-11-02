import { check, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: uuid()
      .primaryKey()
      .default(sql`uuidv7()`),
    slug: text().notNull().unique(),
  },
  (table) => [
    check(
      "categories_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
    ),
  ],
);
