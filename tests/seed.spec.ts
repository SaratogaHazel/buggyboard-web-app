import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Seed test.
 *
 * This is the minimal starting point used by Playwright's test generation
 * tooling and as a smoke check that the dev server, base URL, browser, and
 * login flow are wired up correctly. It logs in with a real account from
 * users.json so that generated tests start from an authenticated board.
 *
 * Real feature tests belong in their own spec files and must use the
 * fixtures and Page Object classes under tests/fixtures and tests/pages.
 */

interface UserAccount {
  username: string;
  password: string;
}

/** Load all accounts from users.json at the repository root. */
function loadUsers(): UserAccount[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const usersPath = join(here, "..", "users.json");
  return JSON.parse(readFileSync(usersPath, "utf-8")) as UserAccount[];
}

const users = loadUsers();

test.describe("Seed", () => {
  test("seed: log in as the default user", async ({ page }) => {
    const [defaultUser] = users;
    expect(defaultUser, "users.json must contain at least one user").toBeDefined();

    await page.goto("/");
    await expect(page).toHaveTitle(/BuggyBoard/);

    await page.getByLabel("Username").fill(defaultUser.username);
    await page.getByLabel("Password").fill(defaultUser.password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/board$/);
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });
});
