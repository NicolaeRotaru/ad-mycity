#!/usr/bin/env bash
# test-ritmo-prompt.sh — test leggero del ritmo (legge ritmo.md, NON esegue tutto il piano).
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/test-ritmo-prompt.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a
. "$REPO/cervello/motore-ai.sh"

TO="${TEST_RITMO_TIMEOUT:-120}"
ai_check || exit 1
[ -s "$REPO/cervello/ritmo.md" ] || { echo "✗ ritmo.md mancante"; exit 1; }

PROMPT="Sei l'AD digitale di MyCity. Leggi cervello/ritmo.md dal disco.
NON eseguire il piano: dimmi solo il titolo della prima sezione (PIANO DEL MATTINO) e la parola OK."

ai_build_cmd
echo "Test prompt ritmo (max ${TO}s)…"
echo "Comando: ${AI_CMD[*]}"
rc=0
out="$(timeout --kill-after=15s "$TO" "${AI_CMD[@]}" "$PROMPT" 2>&1)" || rc=$?
printf '%s\n' "$out" | tail -40
[ "$rc" -eq 0 ] && echo "✓ agent legge ritmo.md." || { echo "✗ fallito rc=$rc"; exit 1; }
