#!/usr/bin/env bash
set -euo pipefail

# Install Research pack tools into ~/.clawdbot/tools

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"   # .../packs/verticals
PACK_DIR="$ROOT_DIR/research"
SRC_TOOLS="$PACK_DIR/tools"
DEST="$HOME/.clawdbot/tools"

mkdir -p "$DEST"

echo "Installing research tools to: $DEST"

for t in youtube-search-api youtube-transcript yt-dlp; do
  if [[ ! -d "$SRC_TOOLS/$t" ]]; then
    echo "ERROR: missing tool dir $SRC_TOOLS/$t" >&2
    exit 2
  fi
  rm -rf "$DEST/$t"
  cp -R "$SRC_TOOLS/$t" "$DEST/$t"
  echo "- installed $t"
done

echo "Done."
echo "Note: depending on your Clawdbot installation, you may also maintain a tools index/registry."
