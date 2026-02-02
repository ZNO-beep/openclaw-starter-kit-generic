#!/usr/bin/env bash
set -euo pipefail

# Apply a pack by running its install script(s).
# Packs are overlays and must never include secrets.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"  # .../starter-kit/core
REPO_ROOT="$(cd "$ROOT_DIR/../.." && pwd)"     # repo root
PACKS_DIR="$REPO_ROOT/starter-kit/packs"

usage() {
  cat <<'EOF'
Usage:
  apply_pack.sh <pack-path>

Examples:
  # research vertical pack
  bash starter-kit/core/scripts/apply_pack.sh starter-kit/packs/verticals/research

  # finance vertical pack
  bash starter-kit/core/scripts/apply_pack.sh starter-kit/packs/verticals/finance
EOF
}

PACK_PATH="${1:-}"
if [[ -z "$PACK_PATH" ]]; then
  usage
  exit 2
fi

# Allow passing either relative or absolute
if [[ "$PACK_PATH" != /* ]]; then
  PACK_PATH="$REPO_ROOT/$PACK_PATH"
fi

if [[ ! -d "$PACK_PATH" ]]; then
  echo "ERROR: pack not found: $PACK_PATH" >&2
  exit 2
fi

INSTALL="$PACK_PATH/scripts/install.sh"
if [[ ! -f "$INSTALL" ]]; then
  echo "ERROR: pack has no install script: $INSTALL" >&2
  exit 2
fi

echo "Applying pack: $PACK_PATH"
bash "$INSTALL"

echo "Pack applied."
