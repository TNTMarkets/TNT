import categoriesEn from "./categories/locales/en.json" with { type: "json" };
import categoriesJa from "./categories/locales/ja.json" with { type: "json" };
import categoriesUk from "./categories/locales/uk.json" with { type: "json" };

export const listingsLocales = {
  en: { categories: categoriesEn },
  uk: { categories: categoriesUk },
  ja: { categories: categoriesJa },
};
