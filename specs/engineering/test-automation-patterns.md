# Test Automation Patterns

This document defines how end-to-end tests for BuggyBoard are written, organized, and run.
Tests use [Playwright Test](https://playwright.dev/docs/intro) and live under `tests/` at the
repo root. The runner configuration is `playwright.config.ts` (also at the repo root).

## Tests Ship With Every Feature

A feature is not done until its tests exist and pass. Tests are part of the feature's
deliverable, in the same branch and the same review, never a follow-up task.

Rules:
- Every Gherkin scenario in the feature spec (`specs/features/NN-name.md`) maps to at least
  one atomic test. Name the test after the scenario so the mapping is obvious.
- Any new page or modal ships with its page object class and fixture (see below).
- Any new UI element a test interacts with or asserts on ships with a `data-testid`
  (see "Locators and test IDs").
- `specs/PROGRESS.md` gets a **Tests written and passing** checkbox for each feature. It is
  checked only after the full suite passes locally.
- Changing existing behaviour means updating the affected tests in the same change. Deleting
  a test to make a change pass is not acceptable without noting it in the feature spec.

## Always Run Tests After Changes

Run the full Playwright suite after every change to application code, test code, or
configuration, and before every commit. This applies equally to human and AI contributors.

```bash
npx playwright test
```

Rules:
- Do not commit or open a pull request with a failing or skipped test. Fix the code or the
  test, or explain the failure to the reviewer and stop.
- Run the linter and type checker as well (`npm run lint`; `tsc --noEmit` in each workspace).
  A change is complete only when lint, types, and tests are all clean.
- `test.only` and `test.skip` must not be committed. CI sets `forbidOnly`, but do not rely on
  CI to catch it.
- When a test fails, read the failure and the trace before changing anything. Do not add
  retries, waits, or looser assertions to hide flakiness; fix the cause.
- The CI pipeline (`specs/engineering/pipelines.md`) runs the same suite with `npm test`. The
  root `package.json` must define `test` as `playwright test` so local and CI runs match.

## Locators and Test IDs

Every element that a test interacts with or asserts on **must** carry a unique
`data-testid` attribute, and page objects **must** locate those elements with
`page.getByTestId(...)`. Playwright's default `testIdAttribute` is `data-testid`, so no
configuration change is needed.

### Why

Role- and label-based locators break when copy, layout, or markup changes for design reasons.
A test ID is a stable contract between the application and the tests: it changes only when a
test deliberately needs it to.

### Naming

- Kebab-case, lowercase: `login-username-input`, `board-new-bug-button`.
- Prefix with the page or modal the element belongs to: `login-`, `title-bar-`, `board-`,
  `create-bug-`, `edit-bug-`.
- End with what the element is: `-input`, `-select`, `-button`, `-row`, `-cell`, `-error`,
  `-heading`.
- Repeated elements (table rows, cells, list items) include the stable domain key, never an
  index: `board-row-42`, `board-row-42-owner`. Indexes change when sort or filter changes.

### Uniqueness

- A test ID must be unique within the rendered document at any moment. Two elements visible
  at the same time may never share an ID.
- The same ID may not be reused across pages or modals, even if they never render together.
  Uniqueness across the whole app keeps `getByTestId` unambiguous and grep-able.
- Do not generate IDs from user-entered data (titles, descriptions). Use server-assigned keys
  such as the bug ID.

### When other locators are allowed

- `getByRole` and `getByLabel` are acceptable **only** in accessibility-focused assertions
  where the role or label is the thing under test (for example, verifying a column header has
  `aria-sort`). Even then, the element still has a test ID.
- Never locate by CSS class, tag structure, or text content. Theme classes and copy change.

### Application responsibility

Adding test IDs is part of implementing the frontend for a feature, not part of writing the
tests. The frontend code sets them; the tests only read them. A feature spec's Design section
should list the test IDs it introduces.

## Page Object Model

All Playwright tests **must** use the Page Object Model (POM) pattern. Raw, inline chains of
`page.*` calls are not permitted in spec files.

**Exception:** `tests/seed.spec.ts` is a smoke test that proves the dev server, base URL, and
login work before any page objects exist. It may use raw `page.*` calls and may import from
`@playwright/test` directly. It is the only file with this exemption.

### Why

Page objects create a higher-level API that matches the application's language, capture
locators in one place so a selector change requires only a single edit, and make tests
readable without requiring the reader to parse low-level locator details.

### File layout

```
tests/
  fixtures/            ← one fixture file; exports test and expect for all spec files
    index.ts
  helpers/             ← API helpers for test data setup and cleanup (no UI)
    bugs-api.ts
    users.ts           ← loads users.json for test credentials
  pages/               ← one file per page or modal; one class per file
    login-page.ts
    title-bar.ts
    board-page.ts
    create-bug-modal.ts
    edit-bug-modal.ts
  login/
    valid-credentials.spec.ts
    blank-password.spec.ts
  create-bug/
    open-modal.spec.ts
    save-with-required-fields.spec.ts
  seed.spec.ts         ← smoke test; exempt from POM rules
```

- One directory per feature, named after the feature spec without its number prefix
  (`03-login.md` → `tests/login/`).
- One spec file per scenario or small group of closely related scenarios. File names describe
  the behaviour, not the page (`blank-password.spec.ts`, not `login-2.spec.ts`).
- Test titles are full sentences in the present tense describing the expected behaviour:
  `test('shows an error when the password is blank', ...)`.

### One class per file, one file per page

Create a separate page object class for each distinct page, modal, or shared component.
Do not combine multiple pages into a single file.

Current pages, modals, and components that require a page object class:

| Page / Modal / Component | File |
|---|---|
| Login page | `tests/pages/login-page.ts` |
| Title bar (logo, search, New Bug, Logout) | `tests/pages/title-bar.ts` |
| Board page (state filter, table, sorting) | `tests/pages/board-page.ts` |
| Create Bug modal | `tests/pages/create-bug-modal.ts` |
| Edit Bug modal | `tests/pages/edit-bug-modal.ts` |

Add a new file whenever a new page, modal, or shared component is introduced. Add the
matching fixture in the same change.

### Class structure

Follow the conventions from the [Playwright POM documentation](https://playwright.dev/docs/pom):

```typescript
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.loginButton = page.getByTestId('login-submit-button');
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

Rules:
- Accept `page: Page` as the sole constructor argument.
- Declare every locator used by the class as a `readonly` field initialized in the constructor,
  using `getByTestId`.
- Expose locators as public fields so tests can assert against them.
- Keep navigation and interaction logic in methods. Methods may wait for the UI to settle (for
  example `waitForURL` after a navigation) but must not contain `expect` assertions.
  Assertions belong in spec files.
- Methods return `void`, or another page object when an action opens a new page or modal.
  Never return raw locators from methods; expose them as fields instead.
- Do not import `expect` into page object files.

### Usage in tests

Tests must **never** construct page objects directly. Instead, import `test` and `expect`
from `tests/fixtures` and receive page objects as fixture parameters:

```typescript
import { test, expect } from '../fixtures';

test('shows the bug table after a valid login', async ({ loginPage, boardPage, users }) => {
  // Arrange
  await loginPage.goto();

  // Act
  await loginPage.login(users[0].username, users[0].password);

  // Assert
  await expect(boardPage.bugTable).toBeVisible();
});
```

- Import `test` and `expect` from the fixtures module, never from `@playwright/test`
  (`seed.spec.ts` excepted).
- Declare only the fixtures the test needs as destructured parameters.
- Call page object methods for all interactions (Act).
- Assert directly against page object locators using `expect` (Assert).
- Never mix raw `page.*` calls alongside page object calls in the same test.
- Never hard-code credentials in a test. Read them through the `users` fixture, which loads
  `users.json` from the repo root.

## Page Object Fixtures

Every page object must have a corresponding fixture so tests receive page objects
automatically rather than constructing them with `new`.

### Why

Fixtures eliminate boilerplate constructor calls in every test, co-locate setup and
teardown with the object they manage, and let Playwright initialize only the fixtures
each test actually needs.

### Fixture file

All fixtures live in a single file: `tests/fixtures/index.ts`. That file re-exports
`test` (extended with the fixtures below) and `expect` so spec files have a single,
consistent import point.

```typescript
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { TitleBar } from '../pages/title-bar';
import { BoardPage } from '../pages/board-page';
import { CreateBugModal } from '../pages/create-bug-modal';
import { EditBugModal } from '../pages/edit-bug-modal';
import { loadUsers, type User } from '../helpers/users';
import { BugsApi } from '../helpers/bugs-api';

type Fixtures = {
  loginPage: LoginPage;
  titleBar: TitleBar;
  boardPage: BoardPage;
  createBugModal: CreateBugModal;
  editBugModal: EditBugModal;
  users: User[];
  bugsApi: BugsApi;
  loggedIn: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  titleBar: async ({ page }, use) => {
    await use(new TitleBar(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
  createBugModal: async ({ page }, use) => {
    await use(new CreateBugModal(page));
  },
  editBugModal: async ({ page }, use) => {
    await use(new EditBugModal(page));
  },
  users: async ({}, use) => {
    await use(loadUsers());
  },
  bugsApi: async ({ request }, use) => {
    const api = new BugsApi(request);
    await use(api);
    await api.deleteCreated(); // teardown: remove bugs this test created
  },
  loggedIn: async ({ loginPage, users }, use) => {
    await loginPage.goto();
    await loginPage.login(users[0].username, users[0].password);
    await loginPage.page.waitForURL(/\/board$/);
    await use();
  },
});

export { expect };
```

Rules:
- Follow the [Playwright fixtures documentation](https://playwright.dev/docs/test-fixtures).
- Use `test.extend<T>()` with a typed interface listing every fixture.
- Each page object fixture receives `{ page }` and calls `await use(new PageObject(page))`.
- Place setup code before `await use()` and teardown code after it.
- Add a new fixture entry whenever a new page object class or helper is created.
- Tests that start on the board request the `loggedIn` fixture instead of repeating the login
  steps. Login tests do not use it; logging in is their Act step.
- Spec files must import `{ test, expect }` from the fixtures module, never from
  `'@playwright/test'` (`seed.spec.ts` excepted).

## Test Data and Independence

No test may rely on state created by another test, and no test may leave behind state that
changes the outcome of another test. The suite runs fully parallel, so ordering is never
guaranteed.

Rules:
- Each test creates its own bugs through the `bugsApi` helper (which calls the backend REST
  API directly, see `specs/engineering/api-conventions.md`), not through the UI, unless
  creating through the UI is the behaviour under test.
- The `bugsApi` fixture deletes everything the test created during teardown. Tests must not
  delete bugs they did not create.
- Make test data recognisably unique per test, for example by appending `test.info().testId`
  or a timestamp to bug titles, so parallel tests never match each other's rows in search or
  sort assertions.
- Assert on the rows the test created (`board-row-{id}`), never on absolute table counts or
  positions, because other workers may be adding rows at the same time.
- Do not reset or delete the SQLite database file from tests.
- Use the accounts from `users.json` for login. Do not add test-only users to that file
  without updating `specs/features/02-user-accounts.md`.

## Other Patterns

### Atomic tests

Every test covers exactly one behaviour. A test that clicks through five pages to verify
one assertion is a grand tour, not an atomic test. Grand tours make failures hard to
diagnose; split them.

A test may have several `expect` calls when they verify the same outcome (for example, a
modal is visible **and** its title input is focused). It may not verify two different
behaviours (for example, that the modal opens **and** that Save is disabled on blank input).

### Arrange-Act-Assert

Structure every test body as:

1. **Arrange** – set up preconditions (log in via fixture, create data via API, navigate).
2. **Act** – perform the single action under test.
3. **Assert** – verify the expected outcome.

Mark the three sections with comments when the body is longer than a few lines. There is
exactly one Act step; if a test needs two actions before asserting, the first one is Arrange
and belongs in a fixture or helper.

### Assertions

- Use Playwright's web-first assertions (`await expect(locator).toBeVisible()`,
  `toHaveText`, `toHaveValue`, `toHaveAttribute`) so the assertion retries until the
  timeout. Never read a value into a variable and compare it synchronously.
- Never use fixed sleeps (`page.waitForTimeout`). Wait for a locator state or URL instead.
- Assert on the visible outcome the user sees, not on internal state such as localStorage,
  unless the spec scenario is explicitly about that state.

### UI tests versus API tests

The scenarios in feature specs describe user-visible behaviour and are tested through the
UI. Backend validation that has no UI path (for example, `PUT /api/bugs/:id` ignoring the
`creator` field) is tested with Playwright's `request` fixture in `tests/api/`, following the
same file layout and Arrange-Act-Assert rules. API tests do not use page objects.
