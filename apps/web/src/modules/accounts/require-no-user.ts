import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { currentUserQuery } from "./current-user/queries.ts";
import { redirectAfterSignIn } from "./sign-in/redirect-after-sign-in.ts";

export async function requireNoUser({
  context,
  search,
}: {
  context: { queryClient: QueryClient };
  search: { redirect?: string | undefined };
}): Promise<void> {
  const user = await context.queryClient
    .query(currentUserQuery)
    .catch(() => null);
  if (user) {
    redirect({ href: redirectAfterSignIn(search.redirect), throw: true });
  }
}
