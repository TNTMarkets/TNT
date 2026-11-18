import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { currentUserQuery } from "./current-user/queries.ts";

export async function requireUser({
  context,
  location,
}: {
  context: { queryClient: QueryClient };
  location: { href: string };
}): Promise<void> {
  // A failed /api/me shows the app error page: TNT-45
  const user = await context.queryClient.query(currentUserQuery);
  if (!user) {
    redirect({
      to: "/sign-in",
      search: { redirect: location.href },
      throw: true,
    });
  }
}
