# TNT

A second-hand marketplace web app: post listings, search, and chat with sellers in real time.

## Stack

pnpm monorepo · React + Vite (`apps/web`) · Express + Socket.io (`apps/api`) ·
Zod schemas in `packages/api-schemas` · PostgreSQL + Drizzle · Docker Compose

## Tasks

[Linear](https://linear.app/tntmarkets), team key `TNT`.

## Quick start

Needs Docker running and an SSH key on GitHub.

```sh
git clone git@github.com:TNTMarkets/TNT.git
cd TNT
./scripts/setup.sh
docker compose up --build   # https://localhost:8443
```

- Full setup and common errors: [docs/setup.md](docs/setup.md)
- Branches, commits and PRs: [docs/workflow.md](docs/workflow.md)
