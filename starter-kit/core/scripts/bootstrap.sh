#!/usr/bin/env bash
set -euo pipefail

# Bootstrap a fresh OpenClaw/Clawdbot runtime home (~/.clawdbot) using this starter kit.
# Safe-by-default: never writes secrets; copies only templates.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_DIR="$ROOT_DIR/config"

RUNTIME_HOME="$HOME/.clawdbot"

usage() {
  cat <<'EOF'
Usage:
  bootstrap.sh [--workspace <path>] [--skip-playwright]

What it does:
  1) Creates ~/.clawdbot/ if missing
  2) Copies clawdbot.json.template -> ~/.clawdbot/clawdbot.json (if not present)
  3) Copies .env.example -> ~/.clawdbot/.env (if not present)
  4) Optionally installs playwright-skill from GitHub

Options:
  --workspace <path>   Suggested workspace path (printed guidance only)
  --skip-playwright    Skip installing playwright-skill
EOF
}

WORKSPACE=""
SKIP_PLAYWRIGHT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2;;
    --skip-playwright) SKIP_PLAYWRIGHT=1; shift 1;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 2;;
  esac
done

mkdir -p "$RUNTIME_HOME"

# Copy templates if missing
if [[ ! -f "$RUNTIME_HOME/clawdbot.json" ]]; then
  if [[ ! -f "$CONFIG_DIR/clawdbot.json.template" ]]; then
    echo "ERROR: missing template $CONFIG_DIR/clawdbot.json.template" >&2
    exit 2
  fi
  cp "$CONFIG_DIR/clawdbot.json.template" "$RUNTIME_HOME/clawdbot.json"
  echo "Created: $RUNTIME_HOME/clawdbot.json (template)"
else
  echo "Exists:  $RUNTIME_HOME/clawdbot.json (not overwritten)"
fi

if [[ ! -f "$RUNTIME_HOME/.env" ]]; then
  if [[ ! -f "$CONFIG_DIR/.env.example" ]]; then
    echo "ERROR: missing template $CONFIG_DIR/.env.example" >&2
    exit 2
  fi
  cp "$CONFIG_DIR/.env.example" "$RUNTIME_HOME/.env"
  echo "Created: $RUNTIME_HOME/.env (example; fill in secrets)"
else
  echo "Exists:  $RUNTIME_HOME/.env (not overwritten)"
fi

if [[ -n "$WORKSPACE" ]]; then
  echo ""
  echo "Workspace suggestion: $WORKSPACE"
fi

echo ""
echo "Next: fill secrets in $RUNTIME_HOME/.env"
echo "Then: ensure Clawdbot points at your workspace and restart gateway if needed."

if [[ $SKIP_PLAYWRIGHT -eq 0 ]]; then
  echo ""
  echo "Installing playwright-skill (GitHub)..."
  bash "$ROOT_DIR/scripts/install_playwright_skill.sh"
else
  echo "Skipping playwright-skill install."
fi

echo ""
echo "Run validation:"
echo "  bash $ROOT_DIR/scripts/validate.sh"
