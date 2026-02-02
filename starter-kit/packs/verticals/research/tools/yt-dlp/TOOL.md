---
name: yt_dlp
description: Wrapper around yt-dlp for YouTube/media metadata and caption retrieval. Default behavior is safe-by-default (skip media download unless explicitly enabled).
config:
  file: /Users/thomasassist/.clawdbot/tools/yt-dlp/config.json
---

# yt_dlp tool

## Purpose
Provide deterministic access to:
- video/page **metadata** (JSON)
- **subtitle/caption** discovery and download (including auto-subs when available)

This complements `youtube_transcript` (Supadata):
- Use **Supadata** for transcript retrieval/generation.
- Use **yt-dlp** as a robust fallback for caption files and media metadata.

## Installed binary
- `yt-dlp` (installed via Homebrew)

## Safety defaults
- Default is **no media download** (`--skip-download`) unless explicitly requested.

## Executable
- `.clawdbot/tools/yt-dlp/tool.js`

## Modes (CLI)
- `--mode metadata` (default): returns high-signal JSON metadata
- `--mode list-subs`: returns yt-dlp subtitle availability output (text)
- `--mode get-subs`: downloads subtitle files (still skips media download)

Safety:
- Default is `--skip-download`. To allow downloading media (not recommended), pass `--download`.

## Common commands (examples)

### Get metadata (JSON)
```bash
yt-dlp -J --skip-download "https://www.youtube.com/watch?v=<videoId>"
```

### List available subtitles
```bash
yt-dlp --list-subs --skip-download "https://www.youtube.com/watch?v=<videoId>"
```

### Download English subtitles (prefer auto-subs if needed)
```bash
yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "en" "https://www.youtube.com/watch?v=<videoId>"
```

## Failure modes
- Private/age-restricted videos may require cookies/auth.
- Some videos have no captions.

## Boundaries
- Do not download large media files unless explicitly instructed.
