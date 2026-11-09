---
name: create-pr
description:
  Open a draft PR for the current TNT branch: checks, review, size, PR titled TNT-<n>. Use when
  asked to open, create or send a PR.
---

# Create a PR

1. The branch must be named as in `AGENTS.md`; take `TNT-<n>` from it and read the issue through
   the Linear MCP.
2. Uncommitted changes, untracked files included: ask the user to commit them, and wait; the PR
   must contain what gets reviewed.
3. Run the checks `AGENTS.md` lists; on a failure, stop and show it.
4. Review: start a fresh-context subagent (in a tool without subagents, a new session) on the
   branch's whole diff from `origin/main`. It reports merge blockers only, no style:
   - wrong behavior, including regressions in what worked before;
   - violations of `AGENTS.md`;
   - dead code: unused exports, files, branches, dependencies;
   - tests that duplicate another test or can't fail;
   - `AGENTS.md` or `docs/` left stale by the change, or now contradicting each other.

   Show the blockers and fix them after a yes. Blockers the user leaves open go in the PR body.

5. Size: added plus deleted lines in
   `git diff --numstat origin/main...HEAD -- . ':(exclude)pnpm-lock.yaml' ':(exclude,glob)**/__screenshots__/**' ':(exclude)apps/api/drizzle/meta'`;
   tests (`*.test.*`, `*.spec.*`, `e2e/`) and stories (`*.stories.*`) don't count toward the limit
   in `AGENTS.md`, show them apart. Over the limit: say so and offer to split into sub-issues; go
   on if the user wants.
6. Write the PR title `TNT-<n>: <what changed>` and the body from
   `.github/pull_request_template.md`, each section in 1–3 short lines; say there if the PR is over
   the size limit and why, and for screenshot baselines, what visual change was meant.
7. Show the title and body and ask whether to open the PR. On a yes: `git push -u origin HEAD`,
   `gh pr create --draft`, then give the link.
