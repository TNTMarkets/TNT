import { queryOptions } from "@tanstack/react-query";
import { categoriesResponseSchema } from "@tnt/api-schemas/listings";
import { getJson } from "#shared/api/request.ts";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    (await getJson("/api/categories", categoriesResponseSchema)).categories,
});
