import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "@tnt/api-schemas/listings";

export function PopularCategories({ categories }: { categories: Category[] }) {
  const titleId = useId();
  const { t } = useTranslation("listings");
  const names: Record<string, string | undefined> = t("categories.names", {
    returnObjects: true,
  });
  const translated = categories.filter((category) => {
    if (Object.hasOwn(names, category.slug)) return true;
    // TODO: TNT-40 — implement logger
    // eslint-disable-next-line no-restricted-syntax -- the logger will get it as a dependency
    if (import.meta.env.DEV) {
      console.warn(`Category "${category.slug}" has no translation`);
    }
    return false;
  });

  return (
    <section
      aria-labelledby={titleId}
      data-testid="popular-categories"
      className="flex flex-col gap-4">
      <h2 id={titleId} className="text-2xl font-semibold">
        {t("categories.title")}
      </h2>
      {translated.length === 0 ? (
        <p className="text-neutral-500">{t("categories.empty")}</p>
      ) : (
        <ul className="grid grid-cols-4 gap-4 lg:grid-cols-8">
          {translated.map((category) => (
            <li
              key={category.id}
              className="flex aspect-square items-end justify-center rounded-2xl bg-neutral-100 p-3 text-sm">
              {names[category.slug]}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
