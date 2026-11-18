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
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{brand}</h1>
        {user ? (
          <Link to="/account" className="underline">
            {user.name}
          </Link>
        ) : (
          user === null && (
            <Link to="/sign-in" className="underline">
              {t("logIn")}
            </Link>
          )
        )}
      </header>
      <PopularCategoriesSection />
    </main>
  );
}
