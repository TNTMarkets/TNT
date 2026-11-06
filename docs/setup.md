# Setup

From a fresh clone to the running app, on macOS or Linux, without admin rights.

## Before you start

- Access: ask a repo admin (@Udobnaja or @LavrAnastasia) to invite you to the `TNTMarkets` GitHub
  org with write access, and to Linear.
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

The script needs no admin rights. It asks you to confirm your git name and email, and for a nick
used in branch names. It installs Node (through nvm) and pnpm for your user only, sets the git
options the team relies on, creates `.env` with a random database password, installs dependencies
and git hooks. It's safe to run again.

When it finishes, open a new terminal and run `nvm use` in the repo. Skip `nvm use` if you already
had Node 26 and the script didn't install nvm.

## Run the app

### With Docker

The whole app, as it runs in production:

```sh
docker compose up --build
```

The first build takes a few minutes. Then open <https://localhost:8443>.

The browser warns about the certificate, because it's self-signed for local use. Accept it:

- Chrome: **Advanced**, then **Proceed to localhost**.
- Firefox: **Advanced**, then **Accept the Risk and Continue**.
- Safari: **Show Details**, then **visit this website**.

The certificate stays in a Docker volume, so normally this is a one-time step. If the browser asks
again later, accept it the same way.

Stop with Ctrl+C, then `docker compose down`. Code changes need another `--build`.

### For development

Pages reload as you save. Use two terminals:

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
| `git is not installed`                                  | It needs admin rights: ask whoever manages the computer                                    |
| `npm can't install globally here`                       | Node isn't from nvm: remove the system Node from `PATH` and run the setup again            |
| `Permission denied (publickey)` on clone or push        | Add your SSH key to GitHub, see "Before you start"                                         |
| `Permission to TNTMarkets/TNT.git denied`               | No write access: ask a repo admin, see "Before you start"                                  |
| `Cannot connect to the Docker daemon`, or similar       | Start Docker                                                                               |
| `POSTGRES_PASSWORD` … `set it in .env`                  | No `.env` yet: run `./scripts/setup.sh`                                                    |
| `port is already allocated` or `address already in use` | Another program has the port. Stop it, or change `POSTGRES_PORT` or `HTTPS_PORT` in `.env` |
| `password authentication failed`                        | Reset the local db, see `docs/database.md`                                                 |
| `No test files found` from `pnpm test:integration`      | Start Docker and run again, see `docs/testing.md`                                          |
| `Can't commit on "<branch>"`                            | Wrong branch name, see `docs/workflow.md`                                                  |
