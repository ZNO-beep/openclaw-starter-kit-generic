---
name: youtube_search
description: Search YouTube for videos about OpenClaw/Clawdbot (or any topic) using the YouTube Data API v3. Returns high-signal fields (title, channel, publish time, url, videoId) and supports time filtering and result limits.
config:
  file: /Users/thomasassist/.clawdbot/tools/youtube-search-api/config.json
  env:
    - GOOGLE_API_KEY
---

# youtube_search tool

## What this tool is for
Use this tool when you need to **find relevant YouTube videos**, especially newly published ones, for later transcript extraction and review.

## Why this tool exists (agent ergonomics)
- Avoids returning huge, low-signal payloads.
- Returns human-meaningful identifiers first (titles, channel names, publish times) while still including `videoId` for follow-on calls.
- Encourages narrow/iterative searches to reduce token waste.

## Interface
### Executable
- `tool.js` (node script): `.clawdbot/tools/youtube-search-api/tool.js`

### Inputs (CLI flags)
- `--query` (string, required): search keywords.
- `--maxResults` (int, optional, default 25, max 25): **per-page** size (YouTube API max is 25).
- `--pages` (int, optional, default 2, max 10): number of pages to fetch (uses `nextPageToken`).
- `--maxTotal` (int, optional, default 50, max 500): soft cap on total returned results (across pages).
- `--publishedAfter` (RFC3339 string, optional): only return videos after this time.
- `--publishedBefore` (RFC3339 string, optional): only return videos before this time.
- `--published-today` (flag, optional): shorthand for `publishedAfter = start-of-today (UTC)`.
- `--order` (string, optional, default `date`): `date|relevance|viewCount|rating`.
- `--safeSearch` (string, optional, default `none`): `none|moderate|strict`.

### Outputs
Returns an array of:
- `title`
- `channelTitle`
- `publishedAt`
- `videoId`
- `url`
- `description` (short)

## Examples
Search for new OpenClaw videos published in the last 24h:
- `query`: "OpenClaw"  
- `publishedAfter`: (now-24h in RFC3339)  
- `order`: "date"  

## Failure modes & mitigations
- **Invalid API key / quota exceeded**: return a clear error and suggest checking Google Cloud console quotas and key restrictions.
- **No results**: suggest broader query terms ("ClawdBot", "Moltbot") or removing publishedAfter.

## Notes
- Transcript retrieval is intentionally out of scope; pair with a separate `youtube_transcript` tool.
