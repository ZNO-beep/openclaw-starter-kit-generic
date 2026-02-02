# SECURITY (Read First)

This repository is a **public-ish starter kit** intended to be copied and customized.

## Never commit
- API keys, tokens, passwords, cookies
- Device identity / pairing state
- Session logs / chat logs / transcripts
- Personal information (names, addresses, phone numbers, emails)

## Runtime vs Template
- **Runtime home:** `~/.clawdbot/` (instance-specific). Do not copy or commit.
- **Template repo:** this repository. Safe, sanitized patterns only.

## How secrets are handled
All secrets must be provided via local environment (`~/.clawdbot/.env`) or a secrets manager.

If you discover a secret committed here:
1) rotate the secret immediately
2) remove it from git history (rewrite)
3) add a regression check to prevent recurrence
