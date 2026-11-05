import type { PgDatabase } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { DbConfig } from "./config.ts";

export function createDb(config: DbConfig, options: postgres.Options = {}) {
  return drizzle({ client: postgres({ ...config, ...options }) });
}

export type DbPool = ReturnType<typeof createDb>;
export type Db = PgDatabase<PostgresJsQueryResultHKT>;
