import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";
import { testUser } from "#shared/testing/fixtures/users.ts";
import { currentUserQuery } from "./current-user/queries.ts";
import { signOut } from "./sign-out.ts";

test("after log out nobody is signed in", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(currentUserQuery.queryKey, testUser);

  await signOut({
    authClient: { signOut: () => Promise.resolve() },
    queryClient,
  });

  expect(queryClient.getQueryData(currentUserQuery.queryKey)).toBeNull();
});

test("log out drops the previous user's data", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["listings", "mine"], [{ id: "1" }]);

  await signOut({
    authClient: { signOut: () => Promise.resolve() },
    queryClient,
  });

  expect(queryClient.getQueryData(["listings", "mine"])).toBeUndefined();
});
