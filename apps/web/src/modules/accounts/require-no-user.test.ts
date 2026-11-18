import { QueryClient } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import { testUser } from "#shared/testing/fixtures/users.ts";
import { currentUserQuery } from "./current-user/queries.ts";
import { requireNoUser } from "./require-no-user.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a signed-in user skips sign-in and goes where they were going", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(currentUserQuery.queryKey, testUser);

  await expect(
    requireNoUser({
      context: { queryClient },
      search: { redirect: "/account/settings" },
    }),
  ).rejects.toMatchObject({ options: { href: "/account/settings" } });
});

test("sign-in still opens when the api can't tell who it is", async () => {
  vi.stubGlobal("fetch", () =>
    Promise.resolve(new Response("", { status: 500 })),
  );
  const queryClient = new QueryClient();

  await expect(
    requireNoUser({ context: { queryClient }, search: {} }),
  ).resolves.toBeUndefined();
});
