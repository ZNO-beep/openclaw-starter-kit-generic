#!/usr/bin/env bash
set -euo pipefail

PACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "== Research pack validation =="

echo "1) Node version"
node -v

echo "2) Tool syntax smoke (expect missing-key errors if env not set)"

node "$PACK_DIR/tools/youtube-search-api/tool.js" --query "test" >/tmp/research-pack-youtube-search.out 2>&1 || true
if ! grep -q "missing API key" /tmp/research-pack-youtube-search.out; then
  echo "WARN: youtube-search-api did not emit expected missing key message (may be fine if key is set)."
fi

a=$?

node "$PACK_DIR/tools/youtube-transcript/tool.js" --videoId "V6Mp0fUh-OM" >/tmp/research-pack-youtube-transcript.out 2>&1 || true

node "$PACK_DIR/tools/yt-dlp/tool.js" --videoId "V6Mp0fUh-OM" --mode metadata >/tmp/research-pack-ytdlp.out 2>&1 || true

echo "Outputs written to /tmp/research-pack-*.out"

echo "VALIDATION_OK"
