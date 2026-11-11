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

### Keys for sign-in with 42

Sign-in needs your own 42 app; don't share its secret.

1. Open <https://profile.intra.42.fr/oauth/applications/new>.
2. Website: `http://localhost:5173`. Redirect URI, one per line:

   ```
   http://localhost:5173/api/auth/callback/42
   https://localhost:8443/api/auth/callback/42
   ```

   Scopes: only "Access the user public data". Leave Public off.

3. From the app's page, put UID and SECRET into `.env` as `INTRA42_CLIENT_ID` and
   `INTRA42_CLIENT_SECRET`.

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

## Agents

Rules for every agent are in `AGENTS.md`. Skills `onboard`, `start-issue` and `create-pr` are in
`.agents/skills/`; agents also pick them on their own when a task matches.

|              | Claude Code                                                 | Codex (CLI, VS Code)     | Cursor                    |
| ------------ | ----------------------------------------------------------- | ------------------------ | ------------------------- |
| Run a skill  | `/start-issue`                                              | `$start-issue`           | `/start-issue`            |
| Linear MCP   | approve `linear-tnt` on first start, then `/mcp` to sign in | add it, see below        | Settings → MCP, sign in   |
| Secrets hook | on                                                          | once: `/hooks`, trust it | on in a trusted workspace |

Codex reads MCP servers only from your own config. Add to `~/.codex/config.toml`:

```toml
[mcp_servers.linear-tnt]
url = "https://mcp.linear.app/mcp"
```

Then sign in: `codex mcp login linear-tnt`, or **Authenticate** in the VS Code extension.

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
| 42 says the redirect URI is invalid                     | Your 42 app lacks that exact Redirect URI, see "Keys for sign-in with 42"                  |
