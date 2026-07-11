#!/usr/bin/env bash
# trigger-build.sh — Triggera la GitHub Action deploy-pannello.yml via workflow_dispatch
# e poi fa git push per portare il commit su GitHub.
# Eseguire da /opt/mycity/ad-mycity con: bash cervello/vps/trigger-build.sh

set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$(dirname "${BASH_SOURCE[0]}")/.env"

if [ -f "$ENV_FILE" ]; then
  set -a; . "$ENV_FILE"; set +a
fi

TOKEN="${GIT_PUSH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "ERRORE: GIT_PUSH_TOKEN mancante nel .env"
  exit 1
fi

cd "$REPO_DIR"

echo "=== STEP 1: git push origin main con token ==="
# Imposta remote temporaneo con token, poi ripristina
SAFE_ORIGIN="https://github.com/NicolaeRotaru/ad-mycity.git"
AUTH_ORIGIN="https://${TOKEN}@github.com/NicolaeRotaru/ad-mycity.git"
git remote set-url origin "$AUTH_ORIGIN"
git push origin main 2>&1 && echo "PUSH OK" || echo "PUSH FALLITO (vedi sopra)"
git remote set-url origin "$SAFE_ORIGIN"
echo ""

echo "=== STEP 2: verifica ultimo commit su origin ==="
git ls-remote origin HEAD 2>&1 | head -3
echo ""

echo "=== STEP 3: workflow_dispatch (trigger manuale GitHub Action) ==="
RESP=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/NicolaeRotaru/ad-mycity/actions/workflows/deploy-pannello.yml/dispatches" \
  -d '{"ref":"main"}')
HTTP_STATUS=$(echo "$RESP" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESP" | grep -v "HTTP_STATUS:")
echo "Risposta: HTTP $HTTP_STATUS"
if [ "$HTTP_STATUS" = "204" ]; then
  echo "GitHub Action TRIGGERATA con successo (204 No Content = ok)"
elif [ "$HTTP_STATUS" = "422" ]; then
  echo "WARN: 422 — possibile che il workflow richieda solo push (non dispatch). Il push del STEP 1 dovrebbe bastare."
else
  echo "Body: $BODY"
fi
