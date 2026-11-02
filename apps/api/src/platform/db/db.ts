import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function createDb(url: string, options: postgres.Options = {}) {
  return drizzle({ client: postgres(url, options) });
}

export type Db = ReturnType<typeof createDb>;
