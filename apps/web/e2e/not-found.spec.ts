import { expect, test } from "./test.ts";

test("an unknown address shows the not-found page", async ({ page }) => {
  await page.goto("/no-such-page");

  await expect(page.getByTestId("not-found")).toBeVisible();
});
