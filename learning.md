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

## Where to Learn More

- `specs/engineering/tech-stack.md` - stack and constraints
- `specs/engineering/coding-standards.md` - style and architecture
- `specs/product/vision.md` - what the app is for
- `package.json`, `frontend/package.json`, `backend/package.json` - exact dependency versions
