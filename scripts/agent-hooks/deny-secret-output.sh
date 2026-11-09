#!/bin/sh

deny() {
  echo "Blocked: this command would print secret values ($1). Look at names only, e.g. in .env.example (AGENTS.md, Secrets)." >&2
  exit 2
}

# Claude Code and Codex send {"tool_input":{"command":...}}, Cursor sends {"command":...}
command=$(sed -nE 's/.*"command"[[:space:]]*:[[:space:]]*"(([^"\\]|\\.)*)".*/\1/p' | head -n 1 |
  sed 's/\\"/"/g; s/\\n/;/g; s/\\t/ /g')

split() {
  awk '{
    q = ""; out = ""
    for (i = 1; i <= length($0); i++) {
      c = substr($0, i, 1)
      if (q == "" && (c == "\"" || c == "'\''")) q = c
      else if (c == q) q = ""
      if (q == "" && index(";&|()`", c)) c = "\n"
      out = out c
    }
    print out
  }' | tr -d '"'\'
}

# Drop sudo, env assignments and wrappers, and the path of the program: /bin/cat → cat
normalize() {
  sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' |
    sed -E ':a
      s/^(sudo|command|exec|nohup|time)[[:space:]]+//; ta
      s/^[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+//; ta' |
    sed -E 's#^[^[:space:]]*/([^/[:space:]]+)#\1#'
}

# A recursive grep reaches the root .env when it has no path, or searches ., .., * or an absolute path
recursive_from_root() {
  awk '{
    explicit = 0; n = 0
    for (i = 2; i <= NF; i++) {
      if ($i == "-e" || $i == "-f") { explicit = 1; i++; continue }
      if ($i ~ /^-/) continue
      args[++n] = $i
    }
    first = explicit ? 1 : 2
    if (n < first) exit 0
    for (i = first; i <= n; i++) if (args[i] ~ /^(\.|\.\/|\.\.|\.\.\/|\*|\/.*|~.*)$/) exit 0
    exit 1
  }'
}

segments=$(printf '%s\n' "$command" | split | normalize)
# bash -c "...", sh -c '...': check the inner command too
inner=$(printf '%s\n' "$segments" | sed -nE 's/^(ba|z|da)?sh[[:space:]]+-c[[:space:]]+//p' | tr ';&|()`' '\n\n\n\n\n\n' | normalize)
segments=$(printf '%s\n%s\n' "$segments" "$inner")

env_file='(^|[[:space:]/<])\.env(\.[A-Za-z0-9_-]+)*[*?]*($|[[:space:]])'
readers='cat|less|more|head|tail|bat|grep|egrep|rg|sed|awk|cut|sort|uniq|nl|tac|strings|xxd|od|diff|comm|cmp|sdiff|git[[:space:]]+diff|source|\.'
names_only='--quiet|-q|--no-interpolate|--services|--images|--volumes|--profiles|--networks'

printf '%s\n' "$segments" | while IFS= read -r segment; do
  [ -n "$segment" ] || continue
  file_hit=$(printf '%s' "$segment" | sed -E 's/\.env\.example//g' | grep -E "$env_file")

  if [ -n "$file_hit" ] && printf '%s' "$segment" | grep -Eq "^($readers)([[:space:]]|$)|<[[:space:]]*[^[:space:]]*\.env"; then
    exit 10
  fi
  if printf '%s' "$segment" | grep -Eq '^e?grep[[:space:]]+(.*[[:space:]])?(-[A-Za-z]*[rR][A-Za-z]*|--recursive|--dereference-recursive)([[:space:]]|$)' &&
    ! printf '%s' "$segment" | grep -Eq -- '--(exclude|include)=' &&
    printf '%s' "$segment" | recursive_from_root; then
    exit 13
  fi
  if printf '%s' "$segment" | grep -Eq '^docker([[:space:]]+container)?[[:space:]]+inspect([[:space:]]|$)' &&
    { ! printf '%s' "$segment" | grep -Eq '[[:space:]](-f|--format)([[:space:]=]|$)' ||
      printf '%s' "$segment" | grep -q 'Env'; }; then
    exit 11
  fi
  if printf '%s' "$segment" | grep -Eq '^docker([[:space:]]+compose|-compose)?[[:space:]].*(exec|run)[[:space:]].*[[:space:]](env|printenv)([[:space:]]+[A-Za-z_][A-Za-z0-9_]*)?$'; then
    exit 11
  fi
  if printf '%s' "$segment" | grep -Eq '^env([[:space:]]+(-[^[:space:]]*|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*))*$|^printenv([[:space:]]|$)|^export([[:space:]]+-p)?$|^set$|^declare([[:space:]]+-[A-Za-z]+)*$'; then
    exit 11
  fi
  if printf '%s' "$segment" | grep -Eq '^docker([[:space:]]+compose|-compose)([[:space:]].*)?[[:space:]]config([[:space:]]|$)' &&
    ! printf '%s' "$segment" | grep -Eq "[[:space:]]($names_only)([[:space:]]|\$)"; then
    exit 12
  fi
done
case $? in
  10) deny "reads a .env file" ;;
  11) deny "prints environment variables" ;;
  12) deny "docker compose config without --quiet or --no-interpolate" ;;
  13) deny "grep -r reads .env too; use rg, which skips it, or add --exclude='.env*'" ;;
esac
exit 0
