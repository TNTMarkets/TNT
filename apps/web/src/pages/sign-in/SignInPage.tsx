import { useTranslation } from "react-i18next";

export function SignInPage() {
  const { t } = useTranslation("signIn");

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <button type="button">{t("with42")}</button>
    </main>
  );
}
