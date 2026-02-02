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

### Recommended local workflow
Use the included helper to safely prompt and write secrets locally (no chat pasting):

```bash
bash starter-kit/core/scripts/set_secret.sh BRAVE_SEARCH_API_KEY
bash starter-kit/core/scripts/set_secret.sh SPOTGAMMA_USERNAME SPOTGAMMA_PASSWORD
```

If you discover a secret committed here:
1) rotate the secret immediately
2) remove it from git history (rewrite)
3) add a regression check to prevent recurrence
