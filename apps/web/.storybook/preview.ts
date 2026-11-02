import type { Preview } from "@storybook/react-vite";
import "../src/index.css";

const preview: Preview = {
  parameters: {
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
