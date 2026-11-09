# Workflow

From a Linear issue to a merged PR. Code rules are in `AGENTS.md`; they apply to people too.

## Branch

An agent creates it with the `start-issue` skill. By hand: name it as in `AGENTS.md`, e.g.
`udobnaja.TNT-12.agent-lint-hook`. Don't use Linear's "copy git branch name": its format is
different.

```sh
git switch main
git pull
git switch -c <branch>
```

Wrong name: `git branch -m <new name>`.

## Commit

Commit as often as you like, with any message: only the PR title reaches `main`.

Each commit runs hooks that check the branch name, run ESLint with fixes on staged `.ts` and `.tsx`
files, and format staged files with Prettier. Their fixes join the commit. Type checks and tests
run in CI, not in hooks.

## Update your branch

```sh
git pull origin main
pnpm install
git push --force-with-lease
```

The pull rebases, so push with `--force-with-lease`, never `--force`. On a conflict: fix the files,
`git add` them, `git rebase --continue`; `git rebase --abort` gives up.

- Conflict in `pnpm-lock.yaml`: run `pnpm install`, then `git add pnpm-lock.yaml`.
- CI says your migration is older than `main`'s: see `docs/database.md`.

## Pull request

An agent runs the checks and the review and opens a draft PR with the `create-pr` skill. By hand:

1. Run the checks in `AGENTS.md`, Commands.
2. `git push`, then open a draft PR on GitHub or with `gh pr create --draft`. Fill in the template.
   Title as in `AGENTS.md`, e.g. `TNT-7: CI and PR rules`.
3. When it's ready, press **Ready for review**: GitHub requests the code owners of the paths you
   touched. If it requests nobody, pick a reviewer yourself.

To merge, a PR needs green checks, a branch up to date with `main` (update it as above) and one
approval, from a code owner if you touched their paths.

## Merge

Use **Squash and merge**, the only option on. GitHub deletes the remote branch. Then clean up
locally:

```sh
git switch main
git pull
git branch -D <your branch>
```

`-D` is needed because after a squash git doesn't see your commits on `main`.

## Linear

- One issue is one PR.
- Issues belong to a [project](https://linear.app/tntmarkets/projects/all) by area (Listings, Chat,
  DevEx…).
- A feature too big for one PR is a parent issue with `api` and `web` sub-issues. Branches and PRs
  come from the sub-issues.
- Work is planned in weekly cycles.
- Agree with the project's lead what you take in the cycle; priorities are set at a team sync. A
  project without a lead doesn't start yet.
- Move your issue to In Progress when you start; Linear moves it to In Review and Done with the PR.

## Data and AI

- Never paste tokens, keys, certificates, `.env` or users' personal data to an agent, chat or MCP.
- Remove personal data from logs and crash reports before passing them to an agent.
