import { createInstance, type i18n } from "i18next";
import { listingsLocales } from "#modules/listings/index.ts";
import { notFoundLocales } from "#pages/not-found/locales.ts";
import {
  detectLanguage,
  type Language,
  languages,
} from "#shared/i18n/detect-language.ts";

const namespaces = {
  listings: listingsLocales,
  notFound: notFoundLocales,
};

type Namespaces = typeof namespaces;
type Messages = { [Ns in keyof Namespaces]: Namespaces[Ns]["en"] };

export const resources = Object.fromEntries(
  languages.map((language) => [
    language,
    Object.fromEntries(
      Object.entries(namespaces).map(([ns, locales]) => [
        ns,
        locales[language],
      ]),
    ),
  ]),
) as Record<Language, Messages>;

export function createAppI18n(language: Language): i18n {
  const instance = createInstance({
    resources,
    lng: language,
    fallbackLng: "en",
    // React escapes text itself
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  void instance.init();
  return instance;
}

export function createBrowserI18n(): i18n {
  const instance = createAppI18n(detectLanguage(navigator.languages));
  document.documentElement.lang = instance.language;
  instance.on("languageChanged", (language) => {
    document.documentElement.lang = language;
  });
  return instance;
}

declare module "i18next" {
  interface CustomTypeOptions {
    resources: Messages;
  }
}
