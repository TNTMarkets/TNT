import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { signOut } from "#modules/accounts/index.ts";

const route = getRouteApi("/account/settings");

export function AccountSettingsPage() {
  const { t } = useTranslation("accountSettings");
  const { authClient } = route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = route.useNavigate();

  function logOut() {
    void signOut({ authClient, queryClient }).then(() => navigate({ to: "/" }));
  }

  return (
    <section className="flex flex-col gap-4">
      <button type="button" onClick={logOut}>
        {t("logOut")}
      </button>
    </section>
  );
}
