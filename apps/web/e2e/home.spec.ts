import { expect, test } from "./test.ts";

test("home page shows its main heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
