#!/usr/bin/env bash
set -euo pipefail

echo "== Finance pack validation =="

# Currently docs-only; validate presence of key files.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

req=(
  "$ROOT/site-records/spotgamma.md"
)

for f in "${req[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "ERROR: missing $f" >&2
    exit 2
  fi
done

echo "VALIDATION_OK"
