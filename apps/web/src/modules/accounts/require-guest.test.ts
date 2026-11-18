import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";
import { testUser } from "#shared/testing/fixtures/users.ts";
import { currentUserQuery } from "./current-user/queries.ts";
import { requireGuest } from "./require-guest.ts";

test("a signed-in user skips sign-in and goes where they were going", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(currentUserQuery.queryKey, testUser);

  await expect(
    requireGuest({
      context: { queryClient },
      search: { redirect: "/account/settings" },
    }),
  ).rejects.toMatchObject({ options: { href: "/account/settings" } });
});
