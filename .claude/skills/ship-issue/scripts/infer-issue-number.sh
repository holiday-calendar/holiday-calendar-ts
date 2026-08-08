#!/usr/bin/env bash
# Prints the leading issue number from the current branch name (e.g.
# "12-kickstart-this-ts-project" -> "12"), or "NONE" if the branch name
# doesn't start with one.
set -euo pipefail

branch="$(git branch --show-current)"

if [[ "$branch" =~ ^([0-9]+) ]]; then
  echo "${BASH_REMATCH[1]}"
else
  echo "NONE"
fi
