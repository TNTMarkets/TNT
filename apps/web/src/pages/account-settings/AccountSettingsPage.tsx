import { useTranslation } from "react-i18next";

export function AccountSettingsPage() {
  const { t } = useTranslation("accountSettings");

  return (
    <main className="flex flex-col gap-4 p-8">
      <button type="button">{t("logOut")}</button>
    </main>
  );
}
