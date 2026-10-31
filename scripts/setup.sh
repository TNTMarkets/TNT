#!/usr/bin/env bash
# One-time setup for a fresh clone; safe to re-run. Installs nothing system-wide (no sudo).
set -euo pipefail
cd "$(dirname "$0")/.."

NVM_VERSION=v0.40.8
node_major=$(cat .nvmrc)
pnpm_version=$(sed -n 's/.*"packageManager": "pnpm@\([^"]*\)".*/\1/p' package.json)

step() { printf '\n==> %s\n' "$1"; }
fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

step "git"
command -v git >/dev/null || fail "git is not installed; it needs admin rights, ask whoever manages this computer."

step "Node $node_major"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)" != "$node_major" ]; then
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    echo "Installing nvm $NVM_VERSION into $NVM_DIR (it adds itself to your shell profile)"
    curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
  fi
  # nvm.sh fails under `set -eu`, so it runs with them off.
  set +eu
  . "$NVM_DIR/nvm.sh"
  nvm install || fail "nvm couldn't install Node $node_major."
  set -eu
fi
echo "node $(node -v)"

step "pnpm $pnpm_version"
if ! command -v pnpm >/dev/null; then
  npm install --global "pnpm@$pnpm_version" ||
    fail "npm can't install globally here; install Node through nvm (remove the system Node from PATH) and re-run."
fi
echo "pnpm $(pnpm -v)"

step "git identity"
name=$(git config user.name || true)
email=$(git config user.email || true)
answer=n
if [ -n "$name" ] && [ -n "$email" ]; then
  read -rp "Commits will be authored as: $name <$email>. Correct? [Y/n] " answer
fi
case "$answer" in
  [nN]*)
    read -rp "Your name: " name
    read -rp "Your email (the one on your GitHub account): " email
    git config user.name "$name"
    git config user.email "$email"
    ;;
esac

step "nick for branch names"
nick=$(git config tnt.nick || true)
until printf '%s' "$nick" | grep -Eq '^[a-z0-9-]+$'; do
  read -rp "Your nick (lowercase latin letters, digits, hyphens), e.g. udobnaja: " nick
done
git config tnt.nick "$nick"

step "git settings"
git config pull.rebase true
git config rebase.autoStash true
git config push.autoSetupRemote true

step ".env"
if [ -e .env ]; then
  echo ".env exists, left as is"
else
  cp .env.example .env
  echo "Created .env from .env.example"
fi

step "dependencies and git hooks"
pnpm install

printf '\nDone. Open a new terminal, run `nvm use` in the repo, then: pnpm --filter @tnt/api dev\n'
