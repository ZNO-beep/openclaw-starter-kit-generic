# Migration Map (Personal Repo ➜ Generic Starter Kit)

This document maps artifacts from the personal workspace/repo (`Thomas_Clawd_Holland`) into the **3-bucket model** for the public-ish starter kit.

## Buckets

### Bucket 1 — Core (portable baseline)
Shared scaffolding used by most installs.

### Bucket 2 — Packs (vertical/persona overlays)
Domain-specific or persona-specific additions.

### Bucket 3 — Upstream-managed / Runtime-only
Not copied into the template repo. Installed from upstream or exists only in runtime state (`~/.clawdbot`).

---

## Summary decisions
- **Runtime state (`~/.clawdbot` contents such as identity, devices, sessions, logs)** is *never* migrated into the generic repo.
- **Custom tools/skills** that are broadly useful should be packaged as packs and installed via scripts.
- **Playwright automation foundation** lives in Core (already migrated).

---

## Inventory (from personal repo)

> NOTE: Paths below refer to the personal repo tree cloned at `/tmp/thomas-clawd-personal`.

### A) Core candidates (portable, generic)
| Source path | What it is | Destination | Action |
|---|---|---|---|
| `playwright/README.md` | Playwright playbook | `starter-kit/core/playwright/README.md` | **DONE** (copied) |
| `playwright/templates/*` | Playwright templates | `starter-kit/core/playwright/templates/` | **DONE** (copied) |
| `scripts/playwright_run_case.sh` | Run wrapper + artifact capture | `starter-kit/core/scripts/playwright_run_case.sh` | **DONE** (copied) |
| `docs/claude-cli-opus-4.5.md` | Claude CLI notes | `starter-kit/core/playbooks/claude_cli.md` | TODO: sanitize/copy |
| `openclaw_agent_best_practices_notes.md` | agent/orchestration notes | `starter-kit/core/playbooks/agent_best_practices.md` | TODO: sanitize/copy |

### B) Packs (recommended)

#### Research / Media vertical pack (YouTube)
| Source path | What it is | Destination pack | Action |
|---|---|---|---|
| `agents/openclaw_youtube_video_search.js` | Custom agent script | `packs/verticals/research/` | TODO: create pack + migrate |
| `clawdbot-home/.clawdbot/tools/youtube-search-api/*` | Tool implementation + config/docs | `packs/verticals/research/tools/youtube-search-api/` | TODO: migrate sanitized |
| `clawdbot-home/.clawdbot/tools/youtube-transcript/*` | transcript tool | `packs/verticals/research/tools/youtube-transcript/` | TODO |
| `clawdbot-home/.clawdbot/tools/yt-dlp/*` | yt-dlp tool + examples | `packs/verticals/research/tools/yt-dlp/` | TODO |
| `clawdbot-home/.clawdbot/skills/youtube-research-playbook/*` | playbook skill | **Upstream-managed** (prefer install) OR `packs/verticals/research/skills/youtube-research-playbook/` | Decide: vendor vs install |

#### Finance vertical pack
| Source path | What it is | Destination pack | Action |
|---|---|---|---|
| `sites/spotgamma.md` | Site record (contains specifics) | `packs/verticals/finance/site-records/spotgamma.md` | **DONE (sanitized)** |
| `founders_notes_cron.sh` | automation script | `packs/verticals/finance/scripts/` | TODO: sanitize + generalize |
| `tmp/*market_brief*` | generated outputs | Not migrated | Ignore (example artifacts only) |

#### Productivity / Ops pack (optional)
| Source path | What it is | Destination pack | Action |
|---|---|---|---|
| `clawdbot-home/.clawdbot/Python/check_gmail_unread_and_notify.py` | Gmail unread notifier | `packs/verticals/productivity/scripts/` | TODO: sanitize |
| `clawdbot-home/.clawdbot/state/gmail_unread_watch_gonow.json` | runtime state | Not migrated | Runtime-only |

### C) Upstream-managed / runtime-only (do NOT migrate)
| Source path | What it is | Why not migrated |
|---|---|---|
| `clawdbot-home/.clawdbot/identity/*` | device identity/auth | instance-specific, sensitive |
| `clawdbot-home/.clawdbot/devices/*` | paired devices | instance-specific, sensitive |
| `clawdbot-home/.clawdbot/agents/*/sessions/*` | session stores | instance-specific, sensitive |
| `clawdbot-home/.clawdbot/memory/main.sqlite` | runtime memory db | instance-specific |
| `memory/*.md` (personal repo) | personal logs | contains personal context |
| `USER.md`, `SOUL.md`, `MEMORY.md` | personal identity/persona | replace with generic persona packs |
| `.env` values | secrets | never commit |

---

## Next concrete migration steps
1) Create missing packs:
   - `packs/verticals/research/`
   - `packs/verticals/productivity/` (optional)
2) For each pack, migrate **only**:
   - docs (TOOL.md/SKILL.md)
   - code without secrets
   - configs as `.template` or `.example`
3) Add pack install scripts that copy tools/skills into `~/.clawdbot`.
4) Extend `validate.sh` to validate pack functionality.

