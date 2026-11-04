import { useQuery } from "@tanstack/react-query";
import { PopularCategories } from "./PopularCategories.tsx";
import { categoriesQuery } from "./queries.ts";

export function PopularCategoriesSection() {
  const { data, isError } = useQuery(categoriesQuery);

  // TODO: TNT-22 — move this UI text to translation keys
  if (isError) {
    return (
      <p role="alert" data-testid="popular-categories-error">
        Couldn't load categories
      </p>
    );
  }
  if (!data) return null;
  return <PopularCategories categories={data} />;
}
