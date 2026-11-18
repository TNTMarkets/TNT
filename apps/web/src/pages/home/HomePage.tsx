import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { currentUserQuery } from "#modules/accounts/index.ts";
import { PopularCategoriesSection } from "#modules/listings/index.ts";

const brand = "TNT";

export function HomePage() {
  const { t } = useTranslation("home");
  const { data: user } = useQuery(currentUserQuery);

  return (
    <main className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">{brand}</h1>
      {user ? (
        <Link to="/account">{user.name}</Link>
      ) : (
        user === null && <Link to="/sign-in">{t("logIn")}</Link>
      )}
      <PopularCategoriesSection />
    </main>
  );
}
