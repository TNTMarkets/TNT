import { expect, test } from "vitest";
import { languages } from "#shared/i18n/detect-language.ts";
import { createAppI18n, resources } from "./i18n.ts";

const keysOf = (value: object, prefix = ""): string[] =>
  Object.entries(value)
    .flatMap(([key, nested]: [string, unknown]) =>
      typeof nested === "object" && nested !== null
        ? keysOf(nested, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    )
    .sort();

test("every language has the same keys as English", () => {
  const english = keysOf(resources.en);
  expect(english).not.toEqual([]);
  for (const language of languages) {
    expect(keysOf(resources[language]), language).toEqual(english);
  }
});

test("a misspelled key fails typecheck", () => {
  const t = createAppI18n("en").getFixedT(null, "notFound");
  // @ts-expect-error the key doesn't exist
  t("no-such-key");
});
