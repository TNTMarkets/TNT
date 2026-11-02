import { dbConfigFromEnv } from "./platform/db/config.ts";
import { createDb } from "./platform/db/db.ts";
import { runMigrations } from "./platform/db/migrate.ts";

// Every run repeats "schema already exists, skipping" notices.
const db = createDb(dbConfigFromEnv(process.env), { onnotice: false });
await runMigrations(db);
await db.$client.end();
console.log("migrations applied");
