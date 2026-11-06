# Setup

From a fresh clone to the running app, on macOS or Linux, without admin rights.

## Before you start

- Access: ask a repo admin (@LavrAnastasia or @Udobnaja) for write access to the GitHub repo and an
  invite to Linear.
- `git`, `curl` and `openssl` installed.
- Docker running: `docker run --rm hello-world` prints a greeting. On a Mac, install and start
  Docker Desktop.
- An SSH key on GitHub: `ssh -T git@github.com` greets you by name. If it doesn't, follow
  [GitHub's guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

## First setup

```sh
git clone git@github.com:TNTMarkets/TNT.git
cd TNT
./scripts/setup.sh
```

It asks for your git identity and a nick, installs Node and pnpm for your user, sets the git options
the team relies on, and creates `.env`. It's safe to run again.

When it finishes, open a new terminal and run `nvm use` in the repo. Skip `nvm use` if you already
had Node 26 and the script didn't install nvm.

## Run the app

### With Docker

The whole app, as it runs in production:

```sh
docker compose up --build
```

The first build takes a few minutes. Then open <https://localhost:8443>.

The browser warns about the certificate, because it's self-signed for local use. Accept it, normally
just once.

Stop with Ctrl+C, then `docker compose down`. Code changes need another `--build`.

### For development

Hot reload: the web updates as you save, and the api restarts. Use two terminals:

```sh
pnpm --filter @tnt/api dev   # api on :3000, starts the db and applies migrations
pnpm --filter @tnt/web dev   # web on http://localhost:5173
```

Stop each with Ctrl+C. The db keeps running until `docker compose down`.

## Next

- Tests: `docs/testing.md`
- Database and migrations: `docs/database.md`
- Branches, commits and PRs: `docs/workflow.md`

## Common errors

| What you see                                            | Fix                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm: command not found`, or `node -v` isn't 26        | Open a new terminal and run `nvm use` in the repo. Still wrong: run the setup again        |
| `Permission to TNTMarkets/TNT.git denied`               | No write access: ask a repo admin, see "Before you start"                                  |
| `POSTGRES_PASSWORD` … `set it in .env`                  | No `.env` yet: run `./scripts/setup.sh`                                                    |
| `port is already allocated` or `address already in use` | Another program has the port. Stop it, or change `POSTGRES_PORT` or `HTTPS_PORT` in `.env` |
| `password authentication failed`                        | Reset the local db, see `docs/database.md`                                                 |
| `No test files found` from `pnpm test:integration`      | Start Docker and run again, see `docs/testing.md`                                          |
