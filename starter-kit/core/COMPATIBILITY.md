# Compatibility

This starter kit is designed to sit **on top of** the upstream Clawdbot/OpenClaw installation.

## Assumptions
- macOS or Linux
- Node.js available (Playwright requires Node)
- Clawdbot installed and working

## Known operational rules
- **Claude Code / claude-cli session IDs:** do not reuse the same session ID for parallel runs; prefer a fresh session per query.

## Upgrade strategy
- Update Clawdbot/OpenClaw via upstream mechanisms.
- Re-run `starter-kit/core/scripts/validate.sh` after updating.
- Fix breakages in templates/packs (avoid forking upstream).
