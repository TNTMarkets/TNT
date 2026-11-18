import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";
import { currentUserQuery } from "./current-user/queries.ts";
import { signOut } from "./sign-out.ts";

test("after log out nobody is signed in", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(currentUserQuery.queryKey, {
    id: "0193a000-0000-7000-8000-000000000001",
    name: "Aino",
    image: null,
  });

  await signOut({
    authClient: { signOut: () => Promise.resolve() },
    queryClient,
  });

  expect(queryClient.getQueryData(currentUserQuery.queryKey)).toBeNull();
});
