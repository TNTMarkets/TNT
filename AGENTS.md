# TNT — rules for agents

On conflict with a rule here: name the rule, propose a compliant version; write the violating one
only if asked again.

## Working

- This file beats existing code.
- Ask before: a new dependency, a DB schema change, edits outside the issue's scope.
- Decisions the user owns (product behavior, data shape, dependencies): up to 3 options in plain
  words with their later cost, plus one recommendation. Code details are yours.

## Tasks, branches, PRs

- Work starts from a Linear issue `TNT-<n>`: ask for it, or create it via the Linear MCP.
  Never invent a number.
- Branch `<nick>.TNT-<n>.<kebab-description>`; nick from `git config tnt.nick` (if empty, ask and set it).
- Squash merge: the PR title `TNT-<n>: <what changed>` becomes the commit on `main`.
- Before a PR, a fresh-context reviewer checks the diff against this file and reports merge
  blockers only: wrong behavior, rule violations. No style.

## Code

- Tests first: agree on behavior, write failing tests, then code. Never bend a test to fit
  the code; if a test is wrong, say so first.
- Dependencies are passed in and built only in the composition root: no singletons,
  no config read in place.
- Comments only for what code can't say: a product decision or a deliberate workaround, with the reason.
