# OpenClaw Starter Kit (Generic)

A generic, public-ish starter kit for setting up Clawdbot/OpenClaw with:
- a clean separation of **runtime state** (`~/.clawdbot`) vs **portable templates** (this repo)
- reusable **agents + orchestration**
- repeatable **Playwright automation** patterns with artifact capture
- a path toward **continuous improvement** (site records, validation, HITL)

## Quick start
1) Copy config templates:
```bash
cp starter-kit/core/config/clawdbot.json.template ~/.clawdbot/clawdbot.json
cp starter-kit/core/config/.env.example ~/.clawdbot/.env
```
2) Fill `~/.clawdbot/.env` with your secrets.
3) Install Playwright skill:
```bash
bash starter-kit/core/scripts/install_playwright_skill.sh
```
4) Validate:
```bash
bash starter-kit/core/scripts/validate.sh
```

## Repo structure
- `starter-kit/core/` — shared baseline
- `starter-kit/packs/` — vertical/persona overlays

