import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { redirectAfterSignIn, useAuthClient } from "#modules/accounts/index.ts";

const route = getRouteApi("/sign-in");

export function SignInPage() {
  const { t } = useTranslation("signIn");
  const { redirect, error } = route.useSearch();
  const authClient = useAuthClient();
  const router = useRouter();
  const navigate = route.useNavigate();
  const [pending, setPending] = useState(false);

  function logInWith42() {
    if (pending) return;
    setPending(true);
    const callbackURL = redirectAfterSignIn(redirect);
    authClient.signIn
      .social({
        provider: "42",
        callbackURL,
        errorCallbackURL: router.buildLocation({
          to: "/sign-in",
          search: { redirect: callbackURL },
        }).href,
      })
      .catch(() => {
        setPending(false);
        void navigate({ search: { redirect, error: "sign_in_failed" } });
      });
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {error && <p role="alert">{t("failed")}</p>}
      <button
        type="button"
        onClick={logInWith42}
        aria-disabled={pending}
        className="self-start border px-3 py-1">
        {t("with42")}
      </button>
    </main>
  );
}
