import { PopularCategoriesSection } from "#modules/listings/index.ts";

export function HomePage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">TNT</h1>
      <PopularCategoriesSection />
    </main>
  );
}
