import { PopularCategoriesSection } from "#modules/listings/index.ts";

const brand = "TNT";

export function HomePage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">{brand}</h1>
      <PopularCategoriesSection />
    </main>
  );
}
