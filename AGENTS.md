# TNT — rules for agents

On conflict with a rule here: name the rule, propose a compliant version; write the violating one
only if asked again.

## Working

- This file beats existing code.
- Ask before: a new dependency, a DB schema change, edits outside the issue's scope.
- Decisions the user owns (product behavior, data shape, dependencies): up to 3 options in plain
  words with their later cost, plus one recommendation. Code details are yours.
- New rules go here, never in `CLAUDE.md`.
- Link docs in `docs/` from here with when to read each; never `@`-import them.

## Tasks, branches, PRs

- Code changes start from a Linear issue `TNT-<n>`: ask for it, or propose one and create it via
  the Linear MCP after the user agrees. Never invent a number.
- Branch `<nick>.TNT-<n>.<kebab-description>`; nick from `git config tnt.nick` (if empty, ask and set it).
- Squash merge: the PR title `TNT-<n>: <what changed>` becomes the commit on `main`.
- Before a PR, a fresh-context reviewer checks the diff against this file and reports merge
  blockers only: wrong behavior, rule violations. No style.

## Code

- Tests first: agree on behavior, write failing tests, then code. Never bend a test to fit
  the code; if a test is wrong, say so first.
- DI by hand, no container, no singletons: build services and read env only in `apps/api/src/main.ts`
  and `apps/web/src/main.tsx`, then pass them down as arguments or props.
- React Compiler is on in web: no manual `useMemo` or `useCallback`.
- Comments only for what code can't say: a product decision or a deliberate workaround, with the reason.

## Commands

Repo root, pnpm only: never `npm` or `npx` (use `pnpm dlx`).

- Check your work: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` (`pnpm format` fixes).
- Run: `pnpm --filter @tnt/api dev` (:3000), `pnpm --filter @tnt/web dev` (:5173).
- Add a dependency (after the user agrees): `pnpm add <pkg> --filter @tnt/<package>`, or `-D -w`
  for a root tool; `pnpm add` writes its version to the `catalog` in `pnpm-workspace.yaml`.

## Where things live

- `apps/web`: React + Vite + Tailwind v4.
- `apps/api`: Express; Node runs the `.ts` files as they are, there is no compile step to JS.
- `packages/api-schemas`: zod schemas shared by web and api.
- One eslint, prettier and base tsconfig at the root; packages only extend them.
- Planned, not installed yet: Socket.io, PostgreSQL + Drizzle, Docker.
