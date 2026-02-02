# Playwright Skill Playbook (OpenClaw)

This folder contains a lightweight, repeatable process for running Playwright automations via the installed `playwright-skill`, and capturing artifacts so we can continuously improve reliability.

## Goals
- Standardize each run as a **case file** (script, logs, screenshots, extracted outputs)
- Make debugging fast (always know what happened + where it failed)
- Enable continuous improvement via templates + site-specific notes

## Key Concepts
### 1) Templates
Reusable script patterns live in `playwright/templates/`.

### 2) Site Records
Site-specific success patterns (URLs, selectors, quirks) live in `sites/`.

### 3) Case Folders
Each run is captured under:

`playwright/runs/YYYY-MM-DD/<case-name>/`

The wrapper collects:
- the script you ran
- stdout/stderr log
- any new `/tmp/*.png`, `/tmp/*.txt`, `/tmp/*.json` created during the run
- `metadata.json`

## Running a case
Use the wrapper:

```bash
./scripts/playwright_run_case.sh \
  --case spotgamma-founders-notes \
  --script /tmp/playwright-spotgamma-dashboard-login-founders.js
```

By default it executes:

`~/.clawdbot/skills/playwright-skill/node run.js <script>`

If you need a different skill directory, pass `--skill-dir`.

## Notes
- Prefer `slowMo` + selector-based waits for SPAs.
- Never hardcode secrets in scripts; use env vars.
