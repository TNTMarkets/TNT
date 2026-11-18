import type { QueryClient } from "@tanstack/react-query";
import { currentUserQuery } from "./current-user/queries.ts";

export async function signOut({
  authClient,
  queryClient,
}: {
  authClient: { signOut: () => Promise<unknown> };
  queryClient: QueryClient;
}): Promise<void> {
  await authClient.signOut();
  // No user data may outlive log out
  queryClient.clear();
  queryClient.setQueryData(currentUserQuery.queryKey, null);
}
