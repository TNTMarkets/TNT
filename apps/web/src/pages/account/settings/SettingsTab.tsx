import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signOut, useAuthClient } from "#modules/accounts/index.ts";

export function SettingsTab() {
  const { t } = useTranslation("account");
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  function logOut() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    signOut({ authClient, queryClient }).then(
      () => navigate({ to: "/" }),
      () => {
        setPending(false);
        setFailed(true);
      },
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {failed && <p role="alert">{t("settings.logOutFailed")}</p>}
      <button
        type="button"
        onClick={logOut}
        aria-disabled={pending}
        className="self-start border px-3 py-1">
        {t("settings.logOut")}
      </button>
    </section>
  );
}
