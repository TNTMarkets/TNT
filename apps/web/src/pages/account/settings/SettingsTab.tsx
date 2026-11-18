import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { signOut, useAuthClient } from "#modules/accounts/index.ts";

export function SettingsTab() {
  const { t } = useTranslation("account");
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function logOut() {
    void signOut({ authClient, queryClient }).then(() => navigate({ to: "/" }));
  }

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={logOut}
        className="self-start border px-3 py-1">
        {t("settings.logOut")}
      </button>
    </section>
  );
}
