import { type Language, languages } from "./languages.ts";

export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.split("-")[0]?.toLowerCase();
    const language = languages.find((known) => known === base);
    if (language) return language;
  }
  return "en";
}
