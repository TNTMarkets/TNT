import { expect, test } from "vitest";
import { redirectAfterSignIn } from "./redirect-after-sign-in.ts";

test.each([
  ["/account/settings?tab=1", "/account/settings?tab=1"],
  ["//evil.com", "/"],
  ["/\\evil.com", "/"],
  ["https://evil.com/x", "/"],
  [undefined, "/"],
])("after sign-in %s leads to %s", (redirect, expected) => {
  expect(redirectAfterSignIn(redirect)).toBe(expected);
});
