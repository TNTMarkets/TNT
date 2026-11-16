import { expect, test } from "vitest";
import { detectLanguage } from "./detect-language.ts";

test.each([
  [["uk-UA", "en"], "uk"],
  [["ja-JP"], "ja"],
  [["fr-FR", "uk"], "uk"],
])("picks a language we have: %j → %s", (preferred, expected) => {
  expect(detectLanguage(preferred)).toBe(expected);
});

test.each([[["fr-FR", "de"]], [[]]])(
  "falls back to English for %j",
  (preferred) => {
    expect(detectLanguage(preferred)).toBe("en");
  },
);
