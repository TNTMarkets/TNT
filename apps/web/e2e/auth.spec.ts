import signIn from "#pages/sign-in/locales/en.json" with { type: "json" };
import { expect, test } from "./test.ts";

const intra42 = "https://api.intra.42.fr";

test("a closed page sends a guest to sign-in", async ({ page }) => {
  await page.goto("/account/settings");

  await expect(page).toHaveURL("/sign-in?redirect=%2Faccount%2Fsettings");
});

test("log in with 42 goes to 42 and comes back to the page", async ({
  page,
}) => {
  await page.route(`${intra42}/**`, (route) => route.fulfill({ body: "" }));
  const signInRequest = page.waitForRequest("**/api/auth/sign-in/social");
  await page.goto("/sign-in?redirect=%2Faccount%2Fsettings");

  await page.getByRole("button", { name: signIn.with42 }).click();

  await expect(page).toHaveURL((url) =>
    url.href.startsWith(`${intra42}/oauth/authorize`),
  );
  expect((await signInRequest).postDataJSON()).toMatchObject({
    provider: "42",
    callbackURL: "/account/settings",
  });
});
