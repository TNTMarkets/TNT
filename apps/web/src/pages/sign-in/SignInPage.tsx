import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { redirectAfterSignIn } from "#modules/accounts/index.ts";

const route = getRouteApi("/sign-in");

export function SignInPage() {
  const { t } = useTranslation("signIn");
  const { redirect, error } = route.useSearch();
  const { authClient } = route.useRouteContext();
  const navigate = route.useNavigate();

  function logInWith42() {
    authClient.signIn
      .social({
        provider: "42",
        callbackURL: redirectAfterSignIn(redirect),
        errorCallbackURL: "/sign-in",
      })
      .catch(() => navigate({ search: { redirect, error: "sign_in_failed" } }));
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {error && <p role="alert">{t("failed")}</p>}
      <button type="button" onClick={logInWith42}>
        {t("with42")}
      </button>
    </main>
  );
}
