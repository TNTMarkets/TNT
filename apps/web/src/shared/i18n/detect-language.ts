export const languages = ["en", "uk", "ja"] as const;
export type Language = (typeof languages)[number];

export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.split("-")[0]?.toLowerCase();
    const language = languages.find((known) => known === base);
    if (language) return language;
  }
  return "en";
}
