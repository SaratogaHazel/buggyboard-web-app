# Learning: BuggyBoard Tech Stack

BuggyBoard is a small bug-tracker web app used as the system under test for a Playwright course. It is a **full-stack Node.js** application written entirely in **TypeScript**, organized as an npm workspaces monorepo with two packages: `frontend` and `backend`.

## At a Glance

| Layer          | Technology                    | Version   |
| -------------- | ----------------------------- | --------- |
| Language       | TypeScript                    | ~5.6      |
| Runtime        | Node.js (ES modules)          | -         |
| Frontend       | React                         | 18.3      |
| Routing        | React Router DOM              | 7.x       |
| Styling        | Tailwind CSS (PostCSS, Autoprefixer) | 3.4 |
| Frontend build | Vite with `@vitejs/plugin-react` | 8.x    |
| Backend        | Express                       | 4.21      |
| Backend dev    | tsx (watch mode)              | 4.x       |
| Database       | SQLite via `better-sqlite3`   | 13.x      |
| Linting        | ESLint 9 with typescript-eslint, React plugins | 9.x |
| Formatting     | Prettier                      | 3.x       |
| Task runner    | npm workspaces + concurrently | -         |

## Frontend (`frontend/`)

- **React 18** for UI components.
- **React Router DOM 7** for client-side routing.
- **Tailwind CSS 3** for styling, processed through PostCSS and Autoprefixer.
- **Vite** as the dev server and bundler. `npm run build` runs `tsc -b` then `vite build`.

## Backend (`backend/`)

- **Express 4** serves the REST API.
- **tsx** runs TypeScript directly in watch mode during development (`tsx watch src/index.ts`).
- Production build compiles with `tsc` and runs `node dist/index.js`.

## Database

- **SQLite**, accessed synchronously through `better-sqlite3`.
- A single file at `backend/data/buggyboard.db`, created automatically on first backend run.
- No migrations or schema versioning. Tables are created with `CREATE TABLE IF NOT EXISTS` at startup. To change the schema, edit the definition and delete the existing DB file.

## Languages

- **TypeScript** for all frontend and backend source code.
- HTML and CSS via React JSX and Tailwind utility classes.
- JSON for configuration.

## Tooling and Workflow

- **npm workspaces** tie `frontend` and `backend` together from the root `package.json`.
- `npm run dev` uses **concurrently** to start both the Vite dev server and the Express backend.
- **ESLint 9** (flat config) with `typescript-eslint`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`.
- **Prettier** for formatting.
- **GitHub Actions** for CI/CD (see `specs/engineering/pipelines.md`).

## Testing (course material)

- **Playwright** end-to-end tests are added as part of the course, not during app development.
- Tests follow the Page Object Model (`tests/pages/`), Arrange-Act-Assert, and atomic-test rules from `specs/engineering/test-automation-patterns.md`.

## User Accounts

Users are **not stored in the database**. They live in a plain JSON file and are validated by the Express backend on login. The spec is `specs/features/02-user-accounts.md`.

### Where users are defined

- **File:** `users.json` at the repository root (committed to git, not gitignored).
- **Format:** a JSON array of objects, each with a `username` and a plaintext `password`.
- **Rule:** every username must be unique. The file is the single source of truth.
- **Adding a user:** append another object to the array. No restart logic is needed because the file is re-read on every login attempt.

Current contents:

```json
[
  { "username": "buggy", "password": "1970beetle" },
  { "username": "vanny", "password": "1979bus" }
]
```

The spec requires the default user `buggy` / `1970beetle`. The `vanny` account is an extra seeded user.

### How login works

1. The React `LoginPage` posts `username` and `password` to `POST /api/login` (`backend/src/index.ts`).
2. The route delegates to `login()` in `backend/src/authService.ts`, which trims the username and returns one of four error codes: `MISSING_CREDENTIALS`, `BLANK_USERNAME`, `BLANK_PASSWORD`, or `INVALID_CREDENTIALS`.
3. `authService` calls `getUsers()` in `backend/src/users.ts`, which reads and parses `users.json` (path resolved relative to the backend as `../../users.json`), filtering out any malformed entries. A missing file yields an empty user list, so all logins fail.
4. Passwords are compared as plaintext string equality. There is no hashing, salting, or rate limiting. This is intentional for a teaching app.
5. On success the API returns `{ "username": "..." }` with HTTP 200. On failure it returns a JSON `error` code and a human-readable `message`.

### Session handling on the frontend

- There are **no server-side sessions, cookies, or tokens**. The backend is stateless with respect to auth.
- `frontend/src/auth.tsx` provides an `AuthProvider` React context. After a successful login it stores `{ "username": "..." }` in `localStorage` under the key `buggyboard_user`.
- `isAuthenticated` is simply whether that value exists. Logout removes the key.
- Because auth state is client-side only, clearing `localStorage` (or setting it directly) is enough to log out or fake a login. This matters for Playwright tests: you can seed `localStorage` to skip the login UI when a test is not about login itself.

## Where to Learn More

- `specs/engineering/tech-stack.md` - stack and constraints
- `specs/engineering/coding-standards.md` - style and architecture
- `specs/product/vision.md` - what the app is for
- `specs/features/02-user-accounts.md`, `specs/features/03-login.md`, `specs/features/05-logout.md` - user, login, and logout specs
- `package.json`, `frontend/package.json`, `backend/package.json` - exact dependency versions
