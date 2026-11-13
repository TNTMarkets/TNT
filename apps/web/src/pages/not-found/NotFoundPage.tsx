import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation("notFound");

  return (
    <main data-testid="not-found" className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <a href="/" className="underline">
        {t("homeLink")}
      </a>
    </main>
  );
}
