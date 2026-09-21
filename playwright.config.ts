import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for BuggyBoard end-to-end tests.
 * See specs/engineering/test-automation-patterns.md for test conventions.
 */

/**
 * The Vite dev server serves the React frontend on port 5173 and proxies /api
 * through to the Express backend on port 3000 (see frontend/vite.config.ts),
 * so a single frontend base URL covers both the UI and the API.
 */
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

  /** Chromium only. Add further browser projects when the course calls for them. */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /** Start the frontend and backend together, then wait for the frontend to answer. */
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
