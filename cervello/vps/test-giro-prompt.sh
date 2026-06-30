#!/usr/bin/env bash
# test-giro-prompt.sh — simula il prompt del giro (legge giro.md dal disco), max 3 min.
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-giro-prompt.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a
. "$REPO/cervello/motore-ai.sh"

TO="${TEST_GIRO_TIMEOUT:-180}"
ai_check || exit 1
[ -s "$REPO/cervello/giro.md" ] || { echo "✗ giro.md mancante"; exit 1; }

PROMPT="Sei l'AD digitale di MyCity. Leggi cervello/giro.md dal disco.
NON eseguire tutto il giro: dimmi solo le prime 3 righe del file e la parola OK."

ai_build_cmd
echo "Test prompt giro (max ${TO}s)…"
rc=0
out="$(timeout --kill-after=15s "$TO" "${AI_CMD[@]}" "$PROMPT" 2>&1)" || rc=$?
printf '%s\n' "$out" | tail -30
[ "$rc" -eq 0 ] && echo "✓ agent legge il repo." || { echo "✗ fallito rc=$rc"; exit 1; }
