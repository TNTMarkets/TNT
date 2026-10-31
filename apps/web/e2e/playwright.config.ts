import { defineConfig, devices } from "@playwright/test";

const ci = Boolean(process.env["CI"]);
const baseURL = process.env["BASE_URL"];

export default defineConfig({
  testDir: ".",
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: baseURL ?? "http://localhost:5173",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "webkit", use: devices["Desktop Safari"] },
  ],
  ...(baseURL === undefined && {
    webServer: [
      {
        command: "pnpm --filter @tnt/api dev",
        url: "http://localhost:3000/api/health",
        reuseExistingServer: true,
      },
      {
        command: "pnpm --filter @tnt/web dev",
        url: "http://localhost:5173",
        reuseExistingServer: true,
      },
    ],
  }),
});
