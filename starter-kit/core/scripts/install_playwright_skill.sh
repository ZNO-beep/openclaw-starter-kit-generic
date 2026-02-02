#!/usr/bin/env bash
set -euo pipefail

# Installs lackeyjb/playwright-skill into ~/.clawdbot/skills/playwright-skill
# Strategy: GitHub install (clone) + npm run setup

SKILL_DIR="$HOME/.clawdbot/skills/playwright-skill"
TMP_DIR="/tmp/playwright-skill-temp"

mkdir -p "$HOME/.clawdbot/skills"
rm -rf "$TMP_DIR"

echo "Cloning playwright-skill..."
git clone https://github.com/lackeyjb/playwright-skill.git "$TMP_DIR"

rm -rf "$SKILL_DIR"
cp -R "$TMP_DIR/skills/playwright-skill" "$SKILL_DIR"

cd "$SKILL_DIR"
echo "Running npm setup (installs deps + chromium)..."
npm run setup

echo "Installed to: $SKILL_DIR"
