import type { Decorator, Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { createAppI18n } from "#app/i18n.ts";
import { createAppRouter } from "#app/router.tsx";
import { createWebAuthClient } from "#modules/accounts/index.ts";
import "#app/index.css";
import { wcagTags } from "#shared/testing/axe-tags.ts";

const i18n = createAppI18n("en");

function AppAtRoute({ route }: { route: string }) {
  const [{ queryClient, router }] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const router = createAppRouter(
      { queryClient, authClient: createWebAuthClient() },
      createMemoryHistory({ initialEntries: [route] }),
    );
    return { queryClient, router };
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const withRoute: Decorator = (Story, { parameters }) => {
  const route = parameters["route"] as string | undefined;
  return route ? <AppAtRoute key={route} route={route} /> : <Story />;
};

const preview: Preview = {
  decorators: [
    withRoute,
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  parameters: {
    a11y: { test: "error", options: { runOnly: wcagTags } },
    viewport: {
      options: {
        desktop: {
          name: "Desktop",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
        mobile: {
          name: "Mobile",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
      },
    },
  },
  initialGlobals: { viewport: { value: "desktop", isRotated: false } },
  afterEach: async ({ canvasElement, tags, parameters }) => {
    if (
      !("__vitest_browser__" in globalThis) ||
      tags.includes("skip-screenshot")
    ) {
      return;
    }
    const { page } = await import("vitest/browser");
    const { expect } = await import("vitest");
    const { target } = (parameters["screenshot"] ?? {}) as {
      target?: "page";
    };
    const element = target === "page" ? document.body : canvasElement;
    await expect.element(page.elementLocator(element)).toMatchScreenshot();
  },
};

export default preview;
