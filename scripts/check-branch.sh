#!/bin/sh
# Detached HEAD (e.g. editing a commit during rebase) is not a branch; allow it.
branch=$(git symbolic-ref --short -q HEAD) || exit 0

if ! printf '%s' "$branch" | grep -Eq '^[a-z0-9-]+\.TNT-[1-9][0-9]*\.[a-z0-9]+(-[a-z0-9]+)*$'; then
  echo "Can't commit on \"$branch\": work goes in a branch <nick>.TNT-<n>.<kebab-description>, e.g. udobnaja.TNT-12.agent-lint-hook" >&2
  echo "Create one: git switch -c <name>, or rename this one: git branch -m <name>" >&2
  exit 1
fi
