#!/usr/bin/env bash
# Fails if any tracked or staged file mentions a confidential pattern.
# Patterns live outside the repo history: .superpowers/confidential-patterns.txt (one regex per line).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
PAT=.superpowers/confidential-patterns.txt
[ -f "$PAT" ] || { echo "missing $PAT"; exit 2; }
hits=$( { git ls-files; git diff --cached --name-only; } | sort -u | grep -v '^tests/node_modules/' \
  | xargs -I{} sh -c '[ -f "{}" ] && grep -ilE -f "'"$PAT"'" "{}" || true' )
msg=$(git log -1 --format=%B 2>/dev/null || true)
if [ -n "$hits" ] || echo "$msg" | grep -qiE -f "$PAT"; then echo "CONFIDENTIAL MATCH:"; echo "$hits"; exit 1; fi
echo clean
