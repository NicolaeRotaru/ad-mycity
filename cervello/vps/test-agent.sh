#!/usr/bin/env bash
# test-agent.sh — verifica che Cursor agent funzioni sul VPS (headless).
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-agent.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

. "$REPO/cervello/motore-ai.sh"

TO="${TEST_AGENT_TIMEOUT:-90}"

echo "=== Test motore AI MyCity ==="
echo "Motore: $(ai_engine) ($(ai_cli_name))"
echo "HOME=$HOME  PATH=$PATH"

if [ -z "${CURSOR_API_KEY:-}" ]; then
  echo "✗ CURSOR_API_KEY mancante nel .env" >&2
  echo "  cursor.com/dashboard → API Keys → aggiungi a cervello/vps/.env" >&2
  exit 1
fi
echo "CURSOR_API_KEY: ${CURSOR_API_KEY:0:7}… (${#CURSOR_API_KEY} caratteri)"

if ! ai_check; then exit 1; fi

cli="$(ai_cli_name)"
if command -v "$cli" >/dev/null 2>&1; then
  echo "Versione $cli: $($cli --version 2>/dev/null || echo '?')"
fi

if grep -q '\--trust' "$REPO/cervello/motore-ai.sh" 2>/dev/null; then
  echo "motore-ai.sh: --trust presente ✓"
else
  echo "⚠ motore-ai.sh SENZA --trust — esegui aggiorna-cervello.sh" >&2
fi

ai_build_cmd
echo "Comando: ${AI_CMD[*]}"
echo "Attendo risposta (max ${TO}s)…"
echo "---"

rc=0
out="$(timeout --kill-after=10s "$TO" "${AI_CMD[@]}" "Rispondi SOLO con la parola OK, nient'altro." 2>&1)" || rc=$?
printf '%s\n' "$out"

if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  echo "✗ TIMEOUT dopo ${TO}s — agent non risponde." >&2
  echo "  Possibili cause: rete VPS→Cursor bloccata, CURSOR_API_KEY scaduta, API Cursor giù." >&2
  echo "  Prova: curl -sI https://api2.cursor.sh | head -3" >&2
  exit 1
fi
if [ "$rc" -ne 0 ]; then
  echo "✗ agent fallito (rc=$rc)" >&2
  exit 1
fi
echo "✓ agent risponde correttamente."
