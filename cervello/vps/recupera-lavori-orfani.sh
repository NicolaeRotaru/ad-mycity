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

# AR-624 — la decisione di CHI si può rimettere in coda non sta più qui dentro: è condivisa con il
# bottone del Pannello (pannello/src/lib/recupero-lavoro.ts), e un test le tiene allineate.
# Prima di questa riga questo script prendeva OGNI lavoro in_corso — anche un'azione reale interrotta
# a metà, che tornava prendibile e ripartiva da sola senza la firma di Nicola.
. "$(dirname "${BASH_SOURCE[0]}")/../lib-recupero.sh"

AUTH=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")
# `worker_owner` può mancare se la migrazione non è passata: in quel caso si riprova senza.
orfani=""
for sel in "id,tipo,updated_at,worker_owner" "id,tipo,updated_at"; do
  orfani="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=$sel" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$orfani" | jq -e 'type == "array"' >/dev/null 2>&1 && break
done
n="$(printf '%s' "$orfani" | jq 'length' 2>/dev/null || echo 0)"
if [ "${n:-0}" = 0 ] || [ "$n" = "null" ]; then
  echo "✓ Nessun lavoro orfano in_corso."
  exit 0
fi

riaccodati=0; riapprova=0; vivi=0
while read -r row; do
  [ -z "$row" ] && continue
  id="$(printf '%s' "$row" | jq -r '.id')"
  tipo="$(printf '%s' "$row" | jq -r '.tipo // ""')"
  owner="$(printf '%s' "$row" | jq -r '.worker_owner // ""')"
  eta="$(_recupero_eta_min "$(printf '%s' "$row" | jq -r '.updated_at // ""')")"
  case "$(_recupero_decisione "$tipo" "$owner" "$eta")" in
    riapprova)
      echo "→ $id ($tipo): AZIONE REALE interrotta → NON la rimetto in coda (potrebbe essere già partita). Riapprovala dal Pannello."
      riapprova=$((riapprova + 1)) ;;
    lascia)
      echo "→ $id ($tipo, ${eta}min, owner=$owner): la sta eseguendo un worker → LASCIO stare."
      vivi=$((vivi + 1)) ;;
    *)
      echo "→ $id ($tipo, ${eta}min): in_corso → in_attesa"
      curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
        -d '{"stato":"in_attesa"}' >/dev/null
      riaccodati=$((riaccodati + 1)) ;;
  esac
done < <(printf '%s' "$orfani" | jq -c '.[]')

echo "✓ Fatto: $riaccodati rimessi in coda · $riapprova azioni reali da riapprovare a mano · $vivi vivi lasciati stare."
echo "  Il worker riprenderà entro ~5s (o: sudo systemctl restart mycity-worker)."
