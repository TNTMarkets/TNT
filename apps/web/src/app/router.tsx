import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { z } from "zod";
import { AccountSettingsPage } from "#pages/account-settings/AccountSettingsPage.tsx";
import { HomePage } from "#pages/home/HomePage.tsx";
import { NotFoundPage } from "#pages/not-found/NotFoundPage.tsx";
import { SignInPage } from "#pages/sign-in/SignInPage.tsx";

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: SignInPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: Outlet,
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "settings",
  component: AccountSettingsPage,
});

export function createAppRouter({ queryClient }: { queryClient: QueryClient }) {
  return createRouter({
    routeTree: rootRoute.addChildren([
      homeRoute,
      signInRoute,
      accountRoute.addChildren([accountSettingsRoute]),
    ]),
    context: { queryClient },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
