#!/usr/bin/env bash
set -euo pipefail

# Playwright run wrapper:
# - runs a Playwright script via the installed playwright-skill executor
# - captures stdout/stderr + /tmp artifacts into a case folder

usage() {
  cat <<'EOF'
Usage:
  playwright_run_case.sh --case <name> --script <path> [--skill-dir <dir>] [--env-file <path>]

Examples:
  ./scripts/playwright_run_case.sh \
    --case spotgamma-founders-notes \
    --script /tmp/playwright-spotgamma-dashboard-login-founders.js

Options:
  --case      Case folder name (required)
  --script    Path to the Playwright JS file to execute (required)
  --skill-dir Directory containing run.js (default: ~/.clawdbot/skills/playwright-skill)
  --env-file  Env file to source (default: ~/.clawdbot/.env)
EOF
}

CASE=""
SCRIPT=""
SKILL_DIR="$HOME/.clawdbot/skills/playwright-skill"
ENV_FILE="$HOME/.clawdbot/.env"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --case) CASE="$2"; shift 2;;
    --script) SCRIPT="$2"; shift 2;;
    --skill-dir) SKILL_DIR="$2"; shift 2;;
    --env-file) ENV_FILE="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 2;;
  esac
done

if [[ -z "$CASE" || -z "$SCRIPT" ]]; then
  usage
  exit 2
fi

if [[ ! -f "$SCRIPT" ]]; then
  echo "Script not found: $SCRIPT" >&2
  exit 2
fi

if [[ ! -d "$SKILL_DIR" || ! -f "$SKILL_DIR/run.js" ]]; then
  echo "Skill dir not found or missing run.js: $SKILL_DIR" >&2
  exit 2
fi

DATE_DIR="$(date +%F)"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/playwright/runs/$DATE_DIR/$CASE"
mkdir -p "$OUT_DIR"

# Marker used to collect new /tmp artifacts from this run only
MARKER="$OUT_DIR/.marker"
: > "$MARKER"

# Load env vars (do not use set -u while sourcing)
if [[ -f "$ENV_FILE" ]]; then
  set +u
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  set -u
fi

cp -f "$SCRIPT" "$OUT_DIR/" || true

echo "Running case: $CASE"
echo "Script: $SCRIPT"
echo "Skill dir: $SKILL_DIR"
echo "Output dir: $OUT_DIR"

LOG="$OUT_DIR/run.log"

set +e
(
  cd "$SKILL_DIR" && node run.js "$SCRIPT"
) >"$LOG" 2>&1
RC=$?
set -e

echo "Exit code: $RC" | tee -a "$LOG"

# Collect artifacts created during this run
# Common patterns: screenshots, extracted text/json
ART_DIR="$OUT_DIR/artifacts"
mkdir -p "$ART_DIR"

# Find temp files newer than marker.
# On macOS, /tmp is typically a symlink to /private/tmp; search both to avoid edge cases.
for TMPROOT in /tmp /private/tmp; do
  find "$TMPROOT" -maxdepth 1 -type f \( -name '*.png' -o -name '*.txt' -o -name '*.json' \) -newer "$MARKER" -print0 2>/dev/null \
    | xargs -0 -I{} cp -f {} "$ART_DIR/" 2>/dev/null || true
done

# Metadata (no secrets)
cat > "$OUT_DIR/metadata.json" <<JSON
{
  "case": "${CASE}",
  "date": "${DATE_DIR}",
  "script": "${SCRIPT}",
  "skillDir": "${SKILL_DIR}",
  "envFile": "${ENV_FILE}",
  "exitCode": ${RC},
  "capturedAt": "$(date -Iseconds)"
}
JSON

# Return code for CI or calling scripts
exit $RC
