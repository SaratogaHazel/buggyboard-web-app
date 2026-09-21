import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for BuggyBoard end-to-end tests.
 * See specs/engineering/test-automation-patterns.md for test conventions.
 */

/** Vite dev server port for the frontend. The backend runs on 3000 and is proxied via /api. */
const FRONTEND_PORT = 5173;
const BASE_URL = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /** Start the frontend (Vite) and backend (Express) together before running tests. */
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
