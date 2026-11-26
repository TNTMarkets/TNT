import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";
import { wcagTags } from "#shared/testing/axe-tags.ts";

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        problems.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      problems.push(`uncaught: ${error.message}`);
    });

    await use(page);

    expect(problems, "browser console must stay clean").toEqual([]);

    // Skip pages that aren't ours
    if (baseURL && new URL(page.url()).origin === new URL(baseURL).origin) {
      const { violations } = await new AxeBuilder({ page })
        .withTags(wcagTags)
        .analyze();
      expect(
        violations.map((v) => `${v.id}: ${v.help} (${String(v.nodes.length)})`),
        "page must pass axe",
      ).toEqual([]);
    }
  },
});

export { expect };
