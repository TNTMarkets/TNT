import { join } from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: join(import.meta.dirname, ".storybook"),
            }),
          ],
          test: {
            name: "screenshots",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({
                connectOptions: {
                  wsEndpoint: "ws://127.0.0.1:3001/",
                  exposeNetwork: "<loopback>",
                },
              }),
              instances: [{ browser: "chromium" }],
              expect: {
                toMatchScreenshot: {
                  // The browser runs in Linux in the container, whatever the host is
                  resolveScreenshotPath: ({
                    root,
                    testFileDirectory,
                    testFileName,
                    arg,
                    browserName,
                    ext,
                  }) =>
                    join(
                      root,
                      testFileDirectory,
                      "__screenshots__",
                      testFileName,
                      `${arg}-${browserName}-linux${ext}`,
                    ),
                },
              },
            },
          },
        },
      ],
    },
  }),
);
