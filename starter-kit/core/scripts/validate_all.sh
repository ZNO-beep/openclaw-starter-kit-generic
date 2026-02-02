#!/usr/bin/env bash
set -euo pipefail

# Validate core + (optionally) pack validations.
# By default validates core, then validates any packs whose validate script exists.

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CORE_DIR="$REPO_ROOT/starter-kit/core"
PACKS_DIR="$REPO_ROOT/starter-kit/packs"

usage() {
  cat <<'EOF'
Usage:
  validate_all.sh [--applied-only]

Options:
  --applied-only   Validate only packs that appear installed in ~/.clawdbot (best-effort).
                   If not set, validates all packs present in this repo that have scripts/validate.sh.
EOF
}

APPLIED_ONLY=0
if [[ ${1:-} == "--applied-only" ]]; then
  APPLIED_ONLY=1
elif [[ -n ${1:-} ]]; then
  usage
  exit 2
fi

echo "== Validate: CORE =="
bash "$CORE_DIR/scripts/validate.sh"

echo ""
echo "== Validate: PACKS =="

# Determine installed pack heuristics (best effort)
# - research: tools present in ~/.clawdbot/tools/youtube-search-api
# - finance: no runtime artifacts yet (docs-only)
# - executive-assistant: docs-only
is_pack_applied() {
  local pack="$1"
  case "$pack" in
    starter-kit/packs/verticals/research)
      [[ -d "$HOME/.clawdbot/tools/youtube-search-api" ]] && return 0 || return 1
      ;;
    starter-kit/packs/verticals/finance)
      return 0 # docs-only for now
      ;;
    starter-kit/packs/personas/executive-assistant)
      return 0 # docs-only for now
      ;;
    *)
      return 1
      ;;
  esac
}

# Find validate scripts
mapfile -t VALIDATORS < <(find "$PACKS_DIR" -type f -path "*/scripts/validate.sh" | sort)

if [[ ${#VALIDATORS[@]} -eq 0 ]]; then
  echo "No pack validators found."
  echo "VALIDATION_OK"
  exit 0
fi

FAIL=0
for v in "${VALIDATORS[@]}"; do
  pack_dir="$(cd "$(dirname "$v")/.." && pwd)"
  rel="${pack_dir#$REPO_ROOT/}"

  if [[ $APPLIED_ONLY -eq 1 ]]; then
    if ! is_pack_applied "$rel"; then
      echo "- skipping (not applied): $rel"
      continue
    fi
  fi

  echo ""
  echo "-- Pack validate: $rel"
  if ! bash "$v"; then
    echo "FAIL: $rel"
    FAIL=1
  fi

done

if [[ $FAIL -ne 0 ]]; then
  echo ""
  echo "VALIDATION_FAILED"
  exit 1
fi

echo ""
echo "VALIDATION_OK"
