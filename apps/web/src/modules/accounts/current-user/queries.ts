import { queryOptions } from "@tanstack/react-query";
import { meResponseSchema } from "@tnt/api-schemas/accounts";
import { getJson } from "#shared/api/request.ts";

export const currentUserQuery = queryOptions({
  queryKey: ["accounts", "me"],
  queryFn: async () => (await getJson("/api/me", meResponseSchema)).user,
  staleTime: 60_000,
  retry: false,
});
