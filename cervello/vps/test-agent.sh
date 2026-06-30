#!/usr/bin/env bash
# test-agent.sh — verifica che Cursor agent funzioni sul VPS (headless).
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-agent.sh
set -euo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

. "$REPO/cervello/motore-ai.sh"

echo "=== Test motore AI MyCity ==="
echo "Motore: $(ai_engine) ($(ai_cli_name))"
echo "HOME=$HOME  PATH=$PATH"

ai_check || exit 1

ai_build_cmd
echo "Comando: ${AI_CMD[*]}"
echo "---"

out="$("${AI_CMD[@]}" "Rispondi SOLO con la parola OK, nient'altro." 2>&1)"; rc=$?
printf '%s\n' "$out"
if [ "${rc:-0}" -ne 0 ]; then
  echo "✗ agent fallito (rc=${rc}) — controlla CURSOR_API_KEY su cursor.com/dashboard" >&2
  exit 1
fi
echo "✓ agent risponde correttamente."
