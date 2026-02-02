#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "== Validate: Clawdbot/OpenClaw baseline =="

if ! command -v clawdbot >/dev/null 2>&1; then
  echo "ERROR: clawdbot not found in PATH" >&2
  exit 2
fi

clawdbot agent list

echo ""
echo "== Validate: skills list (playwright-skill should be present when installed) =="
clawdbot skills list | sed -n '1,160p'

echo ""
echo "== Validate: playwright smoke via installed skill (if present) =="
SKILL_DIR="$HOME/.clawdbot/skills/playwright-skill"
if [[ -d "$SKILL_DIR" ]]; then
  cat > /tmp/playwright-smoke.js <<'JS'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Title:', await page.title());
  await page.screenshot({ path: '/tmp/playwright-validate.png', fullPage: true });
  console.log('Screenshot: /tmp/playwright-validate.png');
  await browser.close();
})();
JS
  node "$SKILL_DIR/run.js" /tmp/playwright-smoke.js
else
  echo "WARN: playwright-skill not installed at $SKILL_DIR (run install_playwright_skill.sh)"
fi

echo ""
echo "== Optional: validate installed research pack tools (if present) =="
RESEARCH_TOOLS="$HOME/.clawdbot/tools/youtube-search-api"
if [[ -d "$RESEARCH_TOOLS" ]]; then
  echo "Found youtube-search-api tool installed in ~/.clawdbot/tools"
  node "$HOME/.clawdbot/tools/youtube-search-api/tool.js" --query "openclaw" >/tmp/youtube-search-api.validate.json 2>/dev/null || true
  echo "Wrote /tmp/youtube-search-api.validate.json (may be error if key not set)"
else
  echo "(research pack tools not installed; ok)"
fi

echo ""
echo "VALIDATION_OK"
