import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  editedMigrations,
  type JournalEntry,
  migrationsOlderThanMain,
} from "../src/platform/db/migration-order.ts";

const [mainFolder, branchFolder] = process.argv.slice(2);
if (!mainFolder || !branchFolder) {
  throw new Error(
    "Usage: check-migrations <main's drizzle folder> <branch's drizzle folder>",
  );
}

function readMigrations(folder: string): {
  entries: JournalEntry[];
  sql: Record<string, string>;
} {
  const journal = JSON.parse(
    readFileSync(join(folder, "meta", "_journal.json"), "utf8"),
  ) as { entries: JournalEntry[] };
  const sql = Object.fromEntries(
    journal.entries.map((entry) => [
      entry.tag,
      readFileSync(join(folder, `${entry.tag}.sql`), "utf8"),
    ]),
  );
  return { entries: journal.entries, sql };
}

const main = existsSync(join(mainFolder, "meta", "_journal.json"))
  ? readMigrations(mainFolder)
  : { entries: [], sql: {} };
const branch = readMigrations(branchFolder);

const problems: string[] = [];

const edited = editedMigrations(main.sql, branch.sql);
if (edited.length > 0) {
  problems.push(
    `Changed or deleted although already on main: ${edited.join(", ")}.`,
    "Databases that ran them won't see the change. Restore them from main and put the change in a new migration.",
  );
}

const older = migrationsOlderThanMain(main.entries, branch.entries);
if (older.length > 0) {
  problems.push(
    `Older than the newest migration on main: ${older.map((entry) => entry.tag).join(", ")}.`,
    "Databases that already ran main's migrations would silently skip them (drizzle-orm#5769).",
    "Fix: remove them with `pnpm --filter @tnt/api exec drizzle-kit drop`, update the branch from main, then run `pnpm --filter @tnt/api db:generate --name=<what_changed>` again.",
  );
}

if (problems.length > 0) {
  for (const line of problems) {
    console.error(line);
  }
  process.exit(1);
}

console.log("Migrations are fine.");
