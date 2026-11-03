export interface JournalEntry {
  tag: string;
  when: number;
}

export function migrationsOlderThanMain(
  main: JournalEntry[],
  branch: JournalEntry[],
): JournalEntry[] {
  const onMain = new Set(main.map((entry) => entry.tag));
  const newestOnMain = Math.max(0, ...main.map((entry) => entry.when));

  return branch.filter(
    (entry) => !onMain.has(entry.tag) && entry.when <= newestOnMain,
  );
}

export function editedMigrations(
  main: Record<string, string>,
  branch: Record<string, string>,
): string[] {
  return Object.keys(main).filter((tag) => branch[tag] !== main[tag]);
}
