#!/usr/bin/env bash
# recupera-lavori-orfani.sh — rimette in coda i lavori bloccati «in_corso» (es. dopo restart worker).
#   sudo -u mycity -H bash /opt/mycity/ad-mycity/cervello/vps/recupera-lavori-orfani.sh
set -uo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo "✗ SUPABASE_URL / SUPABASE_SERVICE_KEY mancanti nel .env" >&2
  exit 1
fi

AUTH=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")
orfani="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=id,tipo,updated_at" "${AUTH[@]}" 2>/dev/null || true)"
n="$(printf '%s' "$orfani" | jq 'length' 2>/dev/null || echo 0)"
if [ "${n:-0}" = 0 ] || [ "$n" = "null" ]; then
  echo "✓ Nessun lavoro orfano in_corso."
  exit 0
fi

printf '%s' "$orfani" | jq -c '.[]' | while read -r row; do
  id="$(printf '%s' "$row" | jq -r '.id')"
  tipo="$(printf '%s' "$row" | jq -r '.tipo')"
  echo "→ $id ($tipo): in_corso → in_attesa"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
    -d '{"stato":"in_attesa"}' >/dev/null
done
echo "✓ Fatto. Il worker riprenderà entro ~5s (o: sudo systemctl restart mycity-worker)."
