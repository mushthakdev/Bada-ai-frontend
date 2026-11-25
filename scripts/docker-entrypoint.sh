#!/bin/sh
set -eu

# Prefer API_URL, then NEXT_PUBLIC_API_URL (Cloud Run runtime env).
RAW="${API_URL:-${NEXT_PUBLIC_API_URL:-}}"
# strip trailing slashes
API_URL_VALUE=$(printf '%s' "$RAW" | sed 's|/*$||')

mkdir -p /app/public
if [ -n "$API_URL_VALUE" ]; then
  ESCAPED=$(printf '%s' "$API_URL_VALUE" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf 'window.__BADA_API_URL="%s";\n' "$ESCAPED" > /app/public/bada-runtime.js
  echo "[bada] runtime API URL → ${API_URL_VALUE}"
else
  printf 'window.__BADA_API_URL=undefined;\n' > /app/public/bada-runtime.js
  echo "[bada] runtime API URL unset (build-time NEXT_PUBLIC_API_URL will be used)"
fi

exec "$@"
