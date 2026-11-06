# Workflow

From a Linear issue to a merged PR. Code rules are in `AGENTS.md`; they apply to people too.

## Branch

Names look like `<nick>.TNT-<n>.<kebab-description>`, e.g. `udobnaja.TNT-12.agent-lint-hook`. A
commit on any other branch, `main` included, is refused. Don't use Linear's "copy git branch name":
its format is different.

```sh
git switch main
git pull
git switch -c "$(git config tnt.nick).TNT-<n>.<description>"
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

The pull rebases: your commits move on top of the new `main`, so a plain `git push` is rejected
afterwards. `--force-with-lease` overwrites your branch only if nobody else pushed to it. Never push
with `--force`.

On a conflict: fix the files, `git add` them, `git rebase --continue`. To give up and return to
where you were: `git rebase --abort`.

- Conflict in `pnpm-lock.yaml`: run `pnpm install`, then `git add pnpm-lock.yaml`.
- CI says your migration is older than `main`'s: see `docs/database.md`.

## Pull request

1. Run the checks: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` (`pnpm format` fixes),
   `pnpm test`, and the test kinds you touched (`docs/testing.md`).
2. `git push`, then open a draft PR on GitHub or with `gh pr create --draft`. Fill in the template.
3. Title: `TNT-<n>: <what changed>`, e.g. `TNT-7: CI and PR rules`. CI checks the format. It becomes
   the commit on `main`, so say what changed.
4. When it's ready, press **Ready for review**: GitHub requests the code owners of the paths you
   touched. If it requests nobody, pick a reviewer yourself.

To merge, a PR needs:

- green `checks`, `docker` and `pr-title`;
- a branch up to date with `main`: if it's behind, update it as above;
- one approval, from a code owner if you touched paths in `.github/CODEOWNERS`. You can't approve
  your own PR.

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
- Agree with the project's lead what you take in the cycle; priorities are set at a team sync.
- Move your issue to In Progress when you start. **Ready for review** moves it to In Review, and
  merging moves it to Done.

## Data and AI

- Never paste tokens, keys, certificates, `.env` or users' personal data to an agent, chat or MCP.
- Remove personal data from logs and crash reports before passing them to an agent.
