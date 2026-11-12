import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () =>
  uuid()
    .primaryKey()
    .default(sql`uuidv7()`);

export const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true });

export const createdAt = () => timestamptz("created_at").defaultNow().notNull();

export const updatedAt = () =>
  timestamptz("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();
