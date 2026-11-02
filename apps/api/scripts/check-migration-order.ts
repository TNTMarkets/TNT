import { existsSync, readFileSync } from "node:fs";
import {
  type JournalEntry,
  migrationsOlderThanMain,
} from "../src/platform/db/migration-order.ts";

const [mainJournal, branchJournal] = process.argv.slice(2);
if (!mainJournal || !branchJournal) {
  throw new Error(
    "Usage: check-migration-order <main _journal.json> <branch _journal.json>",
  );
}

function readEntries(path: string): JournalEntry[] {
  if (!existsSync(path)) {
    return [];
  }
  const journal = JSON.parse(readFileSync(path, "utf8")) as {
    entries: JournalEntry[];
  };
  return journal.entries;
}

const outOfOrder = migrationsOlderThanMain(
  readEntries(mainJournal),
  readEntries(branchJournal),
);

if (outOfOrder.length > 0) {
  console.error(
    `Older than the newest migration on main: ${outOfOrder.map((entry) => entry.tag).join(", ")}.`,
  );
  console.error(
    "Databases that already ran main's migrations would silently skip them (drizzle-orm#5769).",
  );
  console.error(
    "Fix: remove them with `pnpm --filter @tnt/api exec drizzle-kit drop`, update the branch from main, then run `pnpm --filter @tnt/api db:generate --name=<what_changed>` again.",
  );
  process.exit(1);
}

console.log("Migration order is fine.");
