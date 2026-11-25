import { uuid } from "drizzle-orm/pg-core";
import { users } from "./schema.ts";

export const userIdColumn = (name: string) =>
  uuid(name).references(() => users.id, { onDelete: "restrict" });
