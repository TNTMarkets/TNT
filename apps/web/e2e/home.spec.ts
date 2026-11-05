import { expect, test } from "./test.ts";

test("home page shows its main heading", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("home page loads the popular categories from the api", async ({
  page,
}) => {
  const response = page.waitForResponse("**/api/categories");
  await page.goto("/");

  expect((await response).status()).toBe(200);
  await expect(page.getByTestId("popular-categories")).toBeVisible();
});
