# TNT — rules for agents

On conflict with a rule here: name the rule, propose a compliant version; write the violating one
only if asked again. If a rule's purpose doesn't apply, don't build a workaround to satisfy it:
say why and propose changing the rule.

## Working

- This file beats existing code.
- Ask before: a new dependency, a DB schema change, edits outside the issue's scope.
- Decisions the user owns (product behavior, data shape, dependencies): up to 3 options in plain
  words with their later cost, plus one recommendation. Code details are yours.
- New rules go here, never in `CLAUDE.md`.
- Link here only the `docs/` files an agent needs, each with when to read it; never `@`-import them.

## Tasks, branches, PRs

- Code changes start from a Linear issue `TNT-<n>`: ask for it, or propose one and create it via
  the Linear MCP after the user agrees. Never invent a number.
- Branch `<nick>.TNT-<n>.<kebab-description>`; nick from `git config tnt.nick` (if empty, ask and set it).
- Squash merge: the PR title `TNT-<n>: <what changed>` becomes the commit on `main`.
- Before a PR, a fresh-context reviewer checks the diff against this file and reports merge
  blockers only: wrong behavior, rule violations. No style.

## Code

- Tests first: agree on behavior with the user; write the tests plus only the empty stubs they need
  to load (files, exports, routes); see each fail because the behavior is missing (a failed
  assertion, a timeout, an error on the missing result), never because something can't load; then
  code. Don't rewrite a test to change how it fails or to make it pass; if a test is wrong, say so
  first and wait. Infra that can't be tested: verify by hand, and name the issue that adds the test.
- DI by hand, no container: modules get their dependencies (db, clients, config) as arguments or
  props; they never export a live instance or read env. Only the code that starts a process wires
  them up.
- React Compiler is on in web: no manual `useMemo` or `useCallback`.
- api route handler: `parseRequest(schema, req.body | req.params | req.query)`, call one module
  function, passing it `db`, answer through the response schema; request and response schemas live
  in `@tnt/api-schemas` and describe JSON (dates are `z.iso.datetime()` strings, no `transform`).
  Logic and transactions live in that function, not in the handler; it fails with
  `HttpError(status, code)`. Query params arrive as strings: `z.coerce.number()`, `z.stringbool()`.
- Web routes are code in `apps/web/src/app/router.tsx`, not file-based.
- UI text is plain English until TNT-22; mark each component that has it with
  `// TODO: TNT-22 — move this UI text to translation keys`.
- Comments only for what code can't say: a product decision or a deliberate workaround, with the
  reason. Short, no trailing period.

## Secrets

- Never print secret values (`.env`, keys, certs, tokens), even if asked again; look at names only.
  `docker compose config` prints them too: use `--quiet` or `--no-interpolate`.

## Tests

- Read `docs/testing.md` before writing integration, e2e or screenshot tests.
- `pnpm test:integration` with Docker stopped prints "No test files found" (vitest#11682), not a
  Docker error: start Docker, don't debug the globs.
- e2e specs import `test` and `expect` from `apps/web/e2e/test.ts`, never `@playwright/test`,
  which skips our console check.
- Until TNT-22 fixes the e2e locale, don't match on UI text (`getByText`, or `getByRole` with
  `name`): match by `data-testid`.
- Every component with its own markup gets a story. `tags: ["skip-screenshot"]` only for output
  that stays unstable after fixing dates and seeds, e.g. animation.
- Stories skip tests-first. New story: check the baseline shows the component correctly. Update
  baselines only for a visual change you meant to make: check the diff is what you meant, and say
  so in the PR.

## Commands

Repo root, pnpm only: never `npm` or `npx` (use `pnpm dlx`); npm only installs pnpm itself.
Commands inside Docker images aren't in the workspace; this rule doesn't apply there.

- Check your work: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` (`pnpm format` fixes),
  `pnpm test`, plus the test kinds your change touches (`docs/testing.md`).
- Run: `pnpm --filter @tnt/api dev` (:3000), `pnpm --filter @tnt/web dev` (:5173).
- Add a dependency (after the user agrees): `pnpm add <pkg> --filter @tnt/<package>`, or `-D -w`
  for a root tool; `pnpm add` writes its version to the `catalog` in `pnpm-workspace.yaml`.
- DB schema change (after the user agrees): follow `docs/database.md`.

## Where things live

- `apps/web`: React + Vite + Tailwind v4.
- `apps/api`: Express; Node runs the `.ts` files as they are, there is no compile step to JS.
- `packages/api-schemas`: zod schemas shared by web and api.
- One eslint, prettier and base tsconfig at the root; packages only extend them.
- The product word in code and tables is "listing", not "item"; Figma's Item screens are listings.
- New module or feature: follow the reference `listings/categories` in api and web.
- A new module (rather than a feature in an existing one) is the user's call. Once agreed, add it
  to `createApp`'s `modules` in `apps/api/src/main.ts`, or its routes answer 404.
- For module A to import module B, add B to A's list in `moduleDeps` (`eslint/boundaries.js`),
  e.g. `chat: ["listings"]` lets chat import listings. Ask the user first.
- Realtime (Socket.io, not installed yet) goes in `apps/api/src/platform/realtime`, not in a
  module: chat and notifications send events through it, so they don't import each other.
