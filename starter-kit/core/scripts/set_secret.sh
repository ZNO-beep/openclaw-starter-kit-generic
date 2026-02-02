#!/usr/bin/env bash
set -euo pipefail

# set_secret.sh
# Safely prompt for one or more env vars and write them into ~/.clawdbot/.env
# - password-like vars (containing PASS, TOKEN, KEY, SECRET) are prompted with no-echo
# - updates are idempotent (replace existing key, else append)

ENV_FILE="$HOME/.clawdbot/.env"

usage() {
  cat <<'EOF'
Usage:
  set_secret.sh VAR1 [VAR2 ...]

Examples:
  # SpotGamma
  bash starter-kit/core/scripts/set_secret.sh SPOTGAMMA_USERNAME SPOTGAMMA_PASSWORD

  # Brave search
  bash starter-kit/core/scripts/set_secret.sh BRAVE_SEARCH_API_KEY

Notes:
- Writes to: ~/.clawdbot/.env
- Does not print secret values.
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" || $# -lt 1 ]]; then
  usage
  exit 0
fi

mkdir -p "$(dirname "$ENV_FILE")"
# Ensure file exists
: >> "$ENV_FILE"

is_secret_name() {
  local k="$1"
  [[ "$k" =~ (PASS|PASSWORD|TOKEN|API_KEY|KEY|SECRET) ]]
}

upsert_kv() {
  local key="$1"
  local val="$2"

  # Escape backslashes and ampersands for sed replacement
  local esc_val
  esc_val=$(printf '%s' "$val" | sed -e 's/[\\&]/\\&/g')

  if grep -qE "^${key}=" "$ENV_FILE"; then
    # Replace existing line
    sed -i.bak -E "s|^${key}=.*$|${key}=${esc_val}|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak" || true
  else
    printf '\n%s=%s\n' "$key" "$val" >> "$ENV_FILE"
  fi
}

for VAR in "$@"; do
  if is_secret_name "$VAR"; then
    printf "%s (hidden): " "$VAR" >&2
    read -r -s VALUE
    echo >&2
  else
    printf "%s: " "$VAR" >&2
    read -r VALUE
  fi

  if [[ -z "${VALUE}" ]]; then
    echo "Skipping ${VAR} (empty)" >&2
    continue
  fi

  upsert_kv "$VAR" "$VALUE"
  unset VALUE
  echo "Saved ${VAR} -> ${ENV_FILE}" >&2

done

echo "OK"