import uk from "#pages/not-found/locales/uk.json" with { type: "json" };
import { expect, test } from "./test.ts";

test.use({ locale: "uk-UA" });

test("the page follows the browser language", async ({ page }) => {
  await page.goto("/no-such-page");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(uk.title);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});
