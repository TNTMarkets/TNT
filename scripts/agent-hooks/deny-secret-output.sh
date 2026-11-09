#!/bin/sh

deny() {
  echo "Blocked: this command would print secret values ($1). Look at names only, e.g. in .env.example (AGENTS.md, Secrets)." >&2
  exit 2
}

# Claude Code and Codex send {"tool_input":{"command":...}}, Cursor sends {"command":...}
command=$(sed -nE 's/.*"command"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)".*/\1/p' | head -n 1 |
  sed 's/\\"/"/g; s/\\[nt]/ /g')

segments=$(printf '%s\n' "$command" | tr ';&|()`' '\n\n\n\n\n\n')

env_file='(^|[[:space:]/<"'\''])\.env(\.[A-Za-z0-9_-]+)*($|[[:space:]"'\''])'
readers='cat|less|more|head|tail|bat|grep|egrep|rg|sed|awk|cut|sort|uniq|nl|tac|strings|xxd|od|source|\.'

printf '%s\n' "$segments" | while IFS= read -r segment; do
  segment=$(printf '%s' "$segment" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')
  [ -n "$segment" ] || continue
  file_hit=$(printf '%s' "$segment" | sed -E 's/\.env\.example//g' | grep -E "$env_file")

  if [ -n "$file_hit" ] && printf '%s' "$segment" | grep -Eq "^($readers)([[:space:]]|$)|<[[:space:]]*[^[:space:]]*\.env"; then
    exit 10
  fi
  if printf '%s' "$segment" | grep -Eq '^env([[:space:]]+(-[^[:space:]]*|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*))*$|^printenv([[:space:]]|$)|^export([[:space:]]+-p)?$'; then
    exit 11
  fi
  if printf '%s' "$segment" | grep -Eq '^docker([[:space:]]+compose|-compose)([[:space:]].*)?[[:space:]]config([[:space:]]|$)' &&
    ! printf '%s' "$segment" | grep -Eq '[[:space:]](--quiet|-q|--no-interpolate)([[:space:]]|$)'; then
    exit 12
  fi
done
case $? in
  10) deny "reads a .env file" ;;
  11) deny "prints environment variables" ;;
  12) deny "docker compose config without --quiet or --no-interpolate" ;;
esac
exit 0
