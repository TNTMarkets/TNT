import { useQuery } from "@tanstack/react-query";
import { Link, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { currentUserQuery } from "#modules/accounts/index.ts";

export function AccountPage() {
  const { t } = useTranslation("account");
  const { data: user } = useQuery(currentUserQuery);

  return (
    <main className="flex flex-col gap-4 p-8">
      {user && (
        <header className="flex items-center gap-3">
          {user.image && (
            <img
              src={user.image}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          )}
          <h1 className="text-2xl font-semibold">{user.name}</h1>
        </header>
      )}
      <nav>
        <Link to="/account/settings" className="underline">
          {t("tabs.settings")}
        </Link>
      </nav>
      <Outlet />
    </main>
  );
}
