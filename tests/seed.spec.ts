import { test, expect } from "@playwright/test";

/**
 * Seed test.
 *
 * This is the minimal starting point used by Playwright's test generation
 * tooling and as a smoke check that the dev server, base URL, and browser
 * are wired up correctly. It intentionally stays tiny: it opens the app's
 * base URL (see playwright.config.ts) and confirms the page loaded.
 *
 * Real feature tests belong in their own spec files and must use the
 * fixtures and Page Object classes under tests/fixtures and tests/pages.
 */
test.describe("Seed", () => {
  test("seed", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BuggyBoard/);
  });
});
