# yt_dlp — Examples & Usage Notes

This file provides agent-ready examples for the `yt_dlp` tool wrapper.

## When to use yt_dlp vs youtube_transcript
- Prefer **`youtube_transcript` (Supadata)** when you want:
  - transcript text quickly
  - transcript generation when no captions exist
- Use **`yt_dlp`** when you want:
  - robust caption/subtitle file downloads (VTT/SRT/etc.)
  - detailed media metadata
  - a deterministic fallback path if Supadata is rate-limited

## Safety defaults
- The wrapper defaults to **skip media download**.
- To allow media download (not recommended), pass `--download`.

## 1) Metadata (JSON)
Get high-signal metadata as structured JSON:

```bash
node ~/.clawdbot/tools/yt-dlp/tool.js \
  --videoId V6Mp0fUh-OM \
  --mode metadata
```

Typical fields returned:
- `title`, `uploader`, `duration`, `view_count`
- `subtitles`, `automatic_captions`

## 2) List subtitles / captions
List available subtitles and automatic captions:

```bash
node ~/.clawdbot/tools/yt-dlp/tool.js \
  --videoId V6Mp0fUh-OM \
  --mode list-subs
```

Notes:
- Output is returned as text in `output` (yt-dlp prints a table of available subtitle languages and formats).

## 3) Download subtitles (no media)
Download subtitle files while skipping the media download.

```bash
mkdir -p ~/.clawdbot/tools/yt-dlp/test-output
node ~/.clawdbot/tools/yt-dlp/tool.js \
  --videoId V6Mp0fUh-OM \
  --mode get-subs \
  --langs en \
  --outDir ~/.clawdbot/tools/yt-dlp/test-output
```

Expected result:
- A caption file is written, e.g.:
  - `V6Mp0fUh-OM.en.vtt`

## Troubleshooting
- If the video is private/age-restricted, yt-dlp may require cookies/auth.
- If there are no subtitles/captions, `list-subs` will show none and `get-subs` will fail.
- Some runs may require the deno-based JS challenge solver (installed as a dependency via brew).
