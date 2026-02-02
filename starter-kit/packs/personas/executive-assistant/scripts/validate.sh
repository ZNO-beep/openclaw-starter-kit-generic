#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$ROOT/agents/ORCHESTRATION.md" ]]; then
  echo "ERROR: missing ORCHESTRATION.md" >&2
  exit 2
fi

echo "VALIDATION_OK"
