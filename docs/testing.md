# Testing

| Kind        | Where                                      | Run                     | Needs                                                                            |
| ----------- | ------------------------------------------ | ----------------------- | -------------------------------------------------------------------------------- |
| Unit        | `*.test.ts` next to the code               | `pnpm test`             | —                                                                                |
| Integration | `*.integration.test.ts` next to the code   | `pnpm test:integration` | Docker running                                                                   |
| e2e         | `apps/web/e2e/*.spec.ts`                   | `pnpm test:e2e`         | Docker running; browsers, once: `pnpm --filter @tnt/web exec playwright install` |
| Screenshots | stories `*.stories.tsx` next to components | `pnpm test:screenshots` | Docker running                                                                   |

## Unit and integration

- Rerun on every save: `pnpm --filter @tnt/api exec vitest` (or `@tnt/web`).
- Integration tests start a fresh Postgres from `compose.yaml` and remove it afterwards.
- A test that touches the db uses `dbTest` from `#test/db.ts`: it runs in a transaction that's
  rolled back afterwards, so tests don't see each other's data.
- After a db error inside `dbTest`, Postgres refuses further queries in that transaction. If the
  test continues after an expected error, wrap the failing query in `db.transaction(...)`.
- Test api routes through the real app, so the parser and error handler run too:
  `request(createApp({ db, modules: [createXModule({ db })] }), { path })` from `#test/http.ts`.
- Docker off → Vitest prints "No test files found". That's a known Vitest bug (vitest#11682):
  start Docker and run again.

## e2e

- Runs in Chrome, Firefox and WebKit (Safari's engine).
- Locally it starts the api and web dev servers itself, or reuses them if they already run.
- Against the full stack, as CI does:

  ```sh
  docker compose up --build --detach --wait
  BASE_URL=https://localhost:8443 pnpm test:e2e
  ```

- A test fails on any error or warning in the browser console.

## Screenshots

- Every story is screenshotted in a Linux browser inside Docker, so results match on every machine
  and in CI. The first run builds that browser image (about 1 GB download).
- Baselines live in `__screenshots__/` next to the stories and are committed.
- Changed the UI on purpose? Run `pnpm test:screenshots:update`, look at the new PNGs, commit them.
- Mobile width: add `globals: { viewport: { value: "mobile" } }` to a story.
- Modals and toasts render outside the story: add `parameters: { screenshot: { target: "page" } }`.
- Browse stories: `pnpm --filter @tnt/web storybook`.
- Stop the browser container: `docker compose --profile screenshots down`.

## When CI fails

- e2e: download the `playwright-report` artifact from the run page.
- Screenshots: download the `screenshot-diffs` artifact; locally the same files are in
  `apps/web/.vitest/attachments/`.
