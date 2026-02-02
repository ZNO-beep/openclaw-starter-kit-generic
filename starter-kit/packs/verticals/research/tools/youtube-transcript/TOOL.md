---
name: youtube_transcript
description: Fetch or generate a YouTube transcript via Supadata. Supports videos with existing captions and can generate transcripts when none exist (mode=auto/generate).
config:
  file: /Users/thomasassist/.clawdbot/tools/youtube-transcript/config.json
  env:
    - SUPADATA_API_KEY
---

# youtube_transcript tool

## Purpose
Turn a YouTube video into **machine-readable text** for analysis, summarization, and idea extraction.

Supadata provides:
- access to existing YouTube transcripts
- the ability to generate transcripts when no transcript exists (depending on plan/endpoint behavior)

## Executable
- `.clawdbot/tools/youtube-transcript/tool.js`

## Inputs (CLI flags)
- `--videoId` or `--url` (required)
- `--mode` (optional): `auto|native|generate`
  - `auto` (default): try existing transcript, else generate
  - `native`: only return existing transcript
  - `generate`: generate transcript
- `--lang` / `--language` (optional): e.g. `en`

## Outputs
JSON with:
- `transcript` (raw transcript payload; sometimes an array of segments)
- `transcriptText` (best-effort concatenated plain text)
- `segments` (optional)
- `raw` (full Supadata response)

## Failure modes & mitigations
- `unauthorized` (401): check `SUPADATA_API_KEY`
- `limit-exceeded` (429): throttle; consider batch endpoints
- `transcript-unavailable` (206): rerun with `--mode auto` or `--mode generate`

## Notes
- This tool is intentionally separate from `youtube_search`.
