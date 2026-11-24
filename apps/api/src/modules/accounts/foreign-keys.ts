import { uuid } from "drizzle-orm/pg-core";

export const userIdColumn = (name: string) => uuid(name);
