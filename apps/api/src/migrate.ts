import { createDb } from "./platform/db/db.ts";
import { runMigrations } from "./platform/db/migrate.ts";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Every run repeats "schema already exists, skipping" notices.
const db = createDb(databaseUrl, { onnotice: false });
await runMigrations(db);
await db.$client.end();
console.log("migrations applied");
