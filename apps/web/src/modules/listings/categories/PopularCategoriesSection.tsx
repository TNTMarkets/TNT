import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PopularCategories } from "./PopularCategories.tsx";
import { categoriesQuery } from "./queries.ts";

export function PopularCategoriesSection() {
  const { data, isError } = useQuery(categoriesQuery);
  const { t } = useTranslation("listings");

  if (isError) {
    return (
      <p role="alert" data-testid="popular-categories-error">
        {t("categories.loadFailed")}
      </p>
    );
  }
  if (!data) return null;
  return <PopularCategories categories={data} />;
}
