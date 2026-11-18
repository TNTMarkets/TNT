import { getRouteApi } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { redirectAfterSignIn, useAuthClient } from "#modules/accounts/index.ts";

const route = getRouteApi("/sign-in");

export function SignInPage() {
  const { t } = useTranslation("signIn");
  const { redirect, error } = route.useSearch();
  const authClient = useAuthClient();
  const navigate = route.useNavigate();

  function logInWith42() {
    const callbackURL = redirectAfterSignIn(redirect);
    authClient.signIn
      .social({
        provider: "42",
        callbackURL,
        errorCallbackURL: `/sign-in?redirect=${encodeURIComponent(callbackURL)}`,
      })
      .catch(() => navigate({ search: { redirect, error: "sign_in_failed" } }));
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {error && <p role="alert">{t("failed")}</p>}
      <button
        type="button"
        onClick={logInWith42}
        className="self-start border px-3 py-1">
        {t("with42")}
      </button>
    </main>
  );
}
