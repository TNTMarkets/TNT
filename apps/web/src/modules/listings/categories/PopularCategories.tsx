import { useId } from "react";
import type { Category } from "@tnt/api-schemas/listings";

export function PopularCategories({ categories }: { categories: Category[] }) {
  const titleId = useId();

  // TODO(TNT-22): move this UI text to translation keys
  return (
    <section
      aria-labelledby={titleId}
      data-testid="popular-categories"
      className="flex flex-col gap-4">
      <h2 id={titleId} className="text-2xl font-semibold">
        Popular categories
      </h2>
      {categories.length === 0 ? (
        <p className="text-neutral-500">No categories yet</p>
      ) : (
        <ul className="grid grid-cols-4 gap-4 lg:grid-cols-8">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex aspect-square items-end justify-center rounded-2xl bg-neutral-100 p-3 text-sm">
              {category.slug}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
