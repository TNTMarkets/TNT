import { expect, test } from "./test.ts";

test("the theme exposes the Figma colors to components", async ({ page }) => {
  await page.goto("/");

  const colors = {
    "bg-canvas": "#f5f5f2",
    "bg-surface": "#ffffff",
    "bg-muted": "#efefeb",
    "bg-inverse": "#141414",
    "text-primary": "#141414",
    "text-secondary": "#6b6e73",
    "text-tertiary": "#a0a3a8",
    "text-inverse": "#ffffff",
    "border-default": "#e7e7e3",
    "border-strong": "#d5d5d0",
    "brand-orange": "#ff5b1f",
    "brand-blue": "#2f5bff",
    "brand-yellow": "#ffd84a",
    "brand-green": "#2bb673",
    "status-online": "#22c55e",
    "status-danger": "#e5484d",
    "tint-blue": "#e4eeff",
    "tint-mint": "#dcf4e6",
    "tint-peach": "#ffe8db",
    "tint-yellow": "#fff3c6",
    "tint-lilac": "#ece8ff",
    "tint-pink": "#ffe5ec",
    "tint-sky": "#ddf4fa",
    "tint-sand": "#f1ece3",
  };

  const rendered = await page.evaluate((palette) => {
    const sample = document.createElement("div");
    document.body.append(sample);
    const results = Object.entries(palette).map(([name, expected]) => {
      sample.style.backgroundColor = `var(--color-${name})`;
      const actual = getComputedStyle(sample).backgroundColor;
      sample.style.backgroundColor = expected;
      return {
        name,
        actual,
        expected: getComputedStyle(sample).backgroundColor,
      };
    });
    sample.remove();
    return results;
  }, colors);

  for (const { name, actual, expected } of rendered) {
    expect(actual, name).toBe(expected);
  }
});

test("Plus Jakarta Sans loads locally for every design weight", async ({
  page,
}) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });
  await page.goto("/");

  const font = await page.evaluate(async () => {
    const weights = [400, 500, 600, 700, 800];
    const faces = await Promise.all(
      weights.map((weight) =>
        document.fonts.load(
          `${String(weight)} 16px "Plus Jakarta Sans Variable"`,
        ),
      ),
    );
    return {
      family: getComputedStyle(document.body).fontFamily,
      loaded: faces.map((matching) =>
        matching.some((face) => face.status === "loaded"),
      ),
    };
  });

  expect(font.family.split(",")[0]?.replaceAll('"', "").trim()).toBe(
    "Plus Jakarta Sans Variable",
  );
  expect(font.loaded).toEqual([true, true, true, true, true]);
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(new URL(url).origin).toBe(new URL(page.url()).origin);
    expect(new URL(url).pathname).toMatch(/\.woff2$/);
  }
});
