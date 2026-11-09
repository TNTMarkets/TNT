---
name: onboard
description:
  Set up a fresh clone of TNT for a newcomer, get the app running and show how the project is
  organized. Use when someone is new, sets up the repo, setup fails, or asks how the project works.
---

# Onboard

## Setup

Go through `docs/setup.md` from "Before you start" to "Run the app", running each step for the user.

- `scripts/setup.sh` asks for a name, email and nick, and an agent can't type into it: ask the user
  here, set them with `git config user.name`, `user.email` and `tnt.nick`, then run
  `printf 'y\n' | ./scripts/setup.sh`.
- Your shell doesn't load nvm: run `. "$HOME/.nvm/nvm.sh" && nvm use` before `pnpm` or `node`.
- On an error, use "Common errors" in `docs/setup.md`; if it isn't there, explain it and suggest a
  row for the table.
- Done when `docker compose up --build -d --wait` succeeds and
  `curl -ks https://localhost:8443/api/health` answers `"status":"ok"`.

## Tour

Offer it after setup, or give it when asked. Build it from the code and `AGENTS.md`, not from
memory:

- the parts of the repo, from the tree and "Where things live" in `AGENTS.md`;
- one request end to end through the reference feature `listings/categories`: the api route, its
  module function and table, the schema in `@tnt/api-schemas`, the web component that shows it,
  and the tests around it;
- which file in `docs/` to read when, and the way from an issue to a PR (`docs/workflow.md`, the
  `start-issue` and `create-pr` skills).
