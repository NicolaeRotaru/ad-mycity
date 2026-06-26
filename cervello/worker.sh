#!/usr/bin/env bash
# worker.sh — WORKER della coda "lavori" dell'AD MyCity (Claude Code, piano Max), per VPS Linux.
# Equivalente Linux di worker.ps1. Prende i lavori "in_attesa" dalla memoria Supabase, li fa
# eseguire all'AD e ne riscrive il risultato. E' cio' che fa partire i "Approva" del Pannello.
# Lo tiene acceso systemd (cervello/vps/mycity-worker.service, Restart=always).
set -uo pipefail   # niente -e: il loop deve sopravvivere agli errori dei singoli lavori

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

ts() { date '+%H:%M:%S'; }

for dep in claude jq curl node; do
  if ! command -v "$dep" >/dev/null 2>&1; then
    echo "[$(ts)] Manca '$dep'. Esegui prima cervello/vps/setup.sh." >&2
    exit 1
  fi
done
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo "[$(ts)] Mancano SUPABASE_URL e SUPABASE_SERVICE_KEY (progetto MEMORIA). Vedi cervello/vps/.env." >&2
  exit 1
fi

INTERVALLO="${WORKER_INTERVALLO:-30}"   # secondi tra un controllo e l'altro
AUTH=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")

echo "[$(ts)] Worker AD avviato. Controllo la coda 'lavori' ogni ${INTERVALLO}s."

while true; do
  # Kill-switch: se nel Pannello l'AD e' in PAUSA, non eseguire nulla.
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    sleep "$INTERVALLO"; continue
  fi

  riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  id="$(printf '%s' "$riga" | jq -r '.[0].id // empty' 2>/dev/null || true)"

  if [ -z "$id" ]; then
    sleep "$INTERVALLO"; continue
  fi

  tipo="$(printf '%s' "$riga" | jq -r '.[0].tipo // "analisi"')"
  richiesta="$(printf '%s' "$riga" | jq -r '.[0].richiesta // ""')"
  echo "[$(ts)] Lavoro $id ($tipo): $richiesta"

  # 1) segna "in_corso"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
    -d '{"stato":"in_corso"}' >/dev/null 2>&1 || true

  # 2) costruisci il prompt (come worker.ps1)
  if [ "$tipo" = "esegui-azione" ]; then
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). $richiesta

Usa cervello/esegui-azione.mjs sul canale indicato (LIVE se AZIONI_LIVE=1, altrimenti dry-run).
Poi aggiorna MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md (riga -> stato ✅ FATTO) e appendi la traccia in DECISIONI.md.
Restituisci a Nicola, in chiaro, COSA e' partito (canale, destinatario) o, se in dry-run, cosa partirebbe."
  else
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro e restituisci un risultato chiaro e azionabile per Nicola, rispettando 🟢🟡🔴:

$richiesta"
  fi

  # 3) esegui con Claude Code (Max). Cattura output (stdout+stderr).
  out="$(claude -p "$prompt" --permission-mode acceptEdits 2>&1 || true)"

  # 4) riscrivi il risultato (jq fa l'escape JSON in sicurezza)
  body="$(jq -n --arg stato "fatto" --arg risultato "$out" '{stato:$stato, risultato:$risultato}')"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 \
    && echo "[$(ts)] Lavoro $id completato." \
    || echo "[$(ts)] Lavoro $id: non sono riuscito a riscrivere il risultato." >&2
done
