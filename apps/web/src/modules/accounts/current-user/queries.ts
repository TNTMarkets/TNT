import { queryOptions } from "@tanstack/react-query";
import { meResponseSchema } from "@tnt/api-schemas/accounts";
import { ApiError, getJson } from "#shared/api/request.ts";

export const currentUserQuery = queryOptions({
  queryKey: ["accounts", "me"],
  queryFn: async () => (await getJson("/api/me", meResponseSchema)).user,
  staleTime: 60_000,
  // Retry only a lost connection
  retry: (failureCount, error) =>
    failureCount < 1 && !(error instanceof ApiError),
});
