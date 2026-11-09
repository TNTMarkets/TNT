---
name: start-issue
description:
  Start work on a Linear issue TNT-<n>, or propose a new one: check it can start, pick or split into
  sub-issues, create the branch, move the issue to In Progress. Use when asked to start, take or
  pick up an issue or a task.
---

# Start an issue

1. No `TNT-<n>` given: ask for the issue number, or, if there is no issue yet, for a description of
   the task. From a description, propose an issue (title, goal, scope, done when, project) and
   create it through the Linear MCP after a yes.
2. Read the issue through the Linear MCP, with its relations and sub-issues.
3. Stop and say why, if any of these is true:
   - it has the `Draft` label;
   - a blocker isn't Done or Canceled (name the blockers);
   - it is Done or Canceled;
   - it is assigned to someone else: to take it, the user reassigns it in Linear by hand.
4. Sub-issues:
   - it has open sub-issues: list them, ask which one to take, then start over with that one;
   - it has none, but it needs both `api` and `web`, or looks over ~400 changed lines: propose
     `api` and `web` sub-issues (titles and scope split from the parent) and create them after a
     yes, as children of this issue with its project, cycle and Type label, plus the `api` or `web`
     label; if web needs the api first, mark web as blocked by api; then ask which one to take.
5. Branch, named as in `AGENTS.md`:
   - nick: `git config tnt.nick`; empty: ask, then `git config tnt.nick <nick>`;
   - description: 2–4 kebab-case words from the title;
   - changes in the working tree, untracked files included: ask whether to carry them over;
   - the branch exists already, locally or on `origin`: ask whether to switch to it;
   - `git fetch origin main`, then `git switch --no-track -c <branch> origin/main` (with tracking,
     the first push goes to `main`).
6. Move the issue to In Progress; if it has no assignee, assign it to the user.
7. Read the issue's scope and the code it touches, then propose the behavior and the tests as
   `AGENTS.md` asks; wait for a yes before writing anything.
