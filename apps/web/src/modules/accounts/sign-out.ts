import type { QueryClient } from "@tanstack/react-query";

export async function signOut(_deps: {
  authClient: { signOut: () => Promise<unknown> };
  queryClient: QueryClient;
}): Promise<void> {}
