import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  type RouterHistory,
} from "@tanstack/react-router";
import { z } from "zod";
import {
  requireGuest,
  requireUser,
  type WebAuthClient,
} from "#modules/accounts/index.ts";
import { AccountPage } from "#pages/account/AccountPage.tsx";
import { SettingsTab } from "#pages/account/settings/SettingsTab.tsx";
import { HomePage } from "#pages/home/HomePage.tsx";
import { NotFoundPage } from "#pages/not-found/NotFoundPage.tsx";
import { SignInPage } from "#pages/sign-in/SignInPage.tsx";

interface RouterContext {
  queryClient: QueryClient;
  authClient: WebAuthClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
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
  validateSearch: z.object({
    redirect: z.string().optional(),
    error: z.string().optional(),
  }),
  beforeLoad: requireGuest,
  component: SignInPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  beforeLoad: requireUser,
  component: AccountPage,
});

const accountIndexRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/",
  beforeLoad: () => redirect({ to: "/account/settings", throw: true }),
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "settings",
  component: SettingsTab,
});

export function createAppRouter(
  context: RouterContext,
  history?: RouterHistory,
) {
  return createRouter({
    ...(history && { history }),
    routeTree: rootRoute.addChildren([
      homeRoute,
      signInRoute,
      accountRoute.addChildren([accountIndexRoute, accountSettingsRoute]),
    ]),
    context,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
