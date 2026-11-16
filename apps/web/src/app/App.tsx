import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import type { i18n as I18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { AppRouter } from "./router.tsx";

export function App({
  queryClient,
  router,
  i18n,
}: {
  queryClient: QueryClient;
  router: AppRouter;
  i18n: I18n;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
