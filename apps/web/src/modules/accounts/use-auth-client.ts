import { useRouteContext } from "@tanstack/react-router";

export function useAuthClient() {
  return useRouteContext({
    from: "__root__",
    select: (context) => context.authClient,
  });
}
