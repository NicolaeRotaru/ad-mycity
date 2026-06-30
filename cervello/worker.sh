#!/usr/bin/env bash
# worker.sh — WORKER della coda "lavori" dell'AD MyCity (motore AI: Cursor 'agent' o Claude 'claude'), per VPS Linux.
# Equivalente Linux di worker.ps1. Prende i lavori "in_attesa" dalla memoria Supabase, li fa
# eseguire all'AD e ne riscrive il risultato. E' cio' che fa partire i "Approva" del Pannello.
# Lo tiene acceso systemd (cervello/vps/mycity-worker.service, Restart=always).
set -uo pipefail   # niente -e: il loop deve sopravvivere agli errori dei singoli lavori

# Fuso di Piacenza: gli orari scritti in memoria devono essere ora-di-parete italiana (non UTC).
export TZ="${TZ:-Europe/Rome}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO"

ENV_FILE="$SCRIPT_DIR/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

# Motore AI condiviso (Cursor 'agent' di default, oppure Claude 'claude'). Vedi cervello/motore-ai.sh.
. "$SCRIPT_DIR/motore-ai.sh"

ts() { date '+%H:%M:%S'; }

# --- Sync conflict-safe delle scritture del vault sul ramo memoria-ad ---
# Il worker edita i file del vault (AZIONI-IN-ATTESA → FATTO, DECISIONI). Senza questo, il giro successivo
# faceva 'checkout -f' e le cancellava (data loss + rischio doppio invio reale). Qui le rendiamo DUREVOLI
# subito, sotto lo STESSO lock del giro (niente race) e con push NON-force (rebase) per non sovrascrivere il giro.
branch="${GIT_BRANCH:-memoria-ad}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity (worker)}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
sync_vault() {
  [ -n "${GIT_PUSH_TOKEN:-}" ] && [ -n "${GIT_REPO:-}" ] || return 0
  local url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
  (
    flock 9
    git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
    if git diff --cached --quiet 2>/dev/null; then
      :   # niente da inviare
    else
      git "${GIT_ID[@]}" commit -q -m "worker: lavoro ${id:-?} ($(ts))" 2>/dev/null || true
      local ok=0
      for a in 1 2 3; do
        if git fetch "$url" "$branch" 2>/dev/null; then
          # MERGE (non rebase): i log del vault si fondono da soli (.gitattributes merge=union).
          # Se restano conflitti su file di CODICE (es. cervello/vps/SETUP-VPS.md) li risolviamo prendendo
          # la versione remota (theirs) e committiamo: così il push della memoria non si blocca mai.
          if ! git "${GIT_ID[@]}" merge --no-edit FETCH_HEAD 2>/dev/null; then
            local conflitti
            conflitti="$(git diff --name-only --diff-filter=U 2>/dev/null || true)"
            if [ -n "$conflitti" ]; then
              printf '%s\n' "$conflitti" | while IFS= read -r f; do
                [ -n "$f" ] && git checkout --theirs -- "$f" 2>/dev/null || true
              done
              git add -A 2>/dev/null || true
              git "${GIT_ID[@]}" commit --no-edit 2>/dev/null || git merge --abort 2>/dev/null || true
            else
              git merge --abort 2>/dev/null || true
            fi
          fi
        fi
        if git push "$url" "HEAD:${branch}" 2>/dev/null; then ok=1; break; fi
        sleep 2
      done
      [ "$ok" = 1 ] || echo "[$(ts)] Worker: push del vault fallito (riprovo al prossimo lavoro)." >&2
    fi
  ) 9>"$LOCK" || true
}

for dep in jq curl node; do
  if ! command -v "$dep" >/dev/null 2>&1; then
    echo "[$(ts)] Manca '$dep'. Esegui prima cervello/vps/setup.sh." >&2
    exit 1
  fi
done
# Motore AI (Cursor 'agent' o Claude 'claude'): deve essere installato e utilizzabile.
ai_check || { echo "[$(ts)] Motore AI non disponibile. Esegui prima cervello/vps/setup.sh." >&2; exit 1; }
echo "[$(ts)] Motore AI: $(ai_engine) ($(ai_cli_name))."
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo "[$(ts)] Mancano SUPABASE_URL e SUPABASE_SERVICE_KEY (progetto MEMORIA). Vedi cervello/vps/.env." >&2
  exit 1
fi

# Sanity check: SUPABASE_URL deve essere il progetto MEMORIA (ha tabella impostazioni), NON il marketplace.
_mem_check="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=chiave&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>&1 || true)"
if printf '%s' "$_mem_check" | grep -q 'PGRST205\|impostazioni.*not found\|Could not find the table'; then
  echo "[$(ts)] ERRORE: SUPABASE_URL punta al DB sbagliato (marketplace?)." >&2
  echo "[$(ts)]   URL attuale: $SUPABASE_URL" >&2
  echo "[$(ts)]   Serve il progetto MEMORIA (xjljcsorpbqwttrejqte), NON clmpyfvpvfjgeviworth." >&2
  echo "[$(ts)]   Copia SUPABASE_URL + SUPABASE_SERVICE_KEY da Vercel → aggiorna cervello/vps/.env → restart." >&2
  exit 1
fi

INTERVALLO="${WORKER_INTERVALLO:-5}"   # secondi tra un controllo e l'altro (basso = chat reattiva)
AUTH=(-H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")

echo "[$(ts)] Worker AD avviato. Controllo la coda 'lavori' ogni ${INTERVALLO}s."

# Battito: il Pannello legge worker:ultimo per capire se il cervello è acceso.
battito_worker() {
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:ultimo\",\"valore\":\"$(date -Iseconds)\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
}

while true; do
  battito_worker
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
  elif [ "$tipo" = "metabolizza" ]; then
    meta_prompt="$(cat "$SCRIPT_DIR/metabolizza.md" 2>/dev/null || echo "Metabolizza la conversazione.")"
    prompt="$meta_prompt

## Conversazione da metabolizzare
$richiesta

Esegui la metabolizzazione seguendo le istruzioni sopra. NON produrre risposte per Nicola — aggiorna solo i file di memoria."
  elif [ "$tipo" = "giro" ]; then
    giro_prompt="$(cat "$SCRIPT_DIR/giro.md" 2>/dev/null || true)"
    if [ -z "$giro_prompt" ]; then
      giro_prompt="Fai un GIRO DI PERLUSTRAZIONE come AD di MyCity (vedi cervello/giro.md)."
    fi
    prompt="$giro_prompt

## Istruzione aggiuntiva
$richiesta

Restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1). La memoria va sul ramo memoria-ad (mai solo su main)."
  else
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro e restituisci un risultato chiaro e azionabile per Nicola, rispettando 🟢🟡🔴:

$richiesta"
  fi

  # 3) esegui col motore AI (Cursor/Claude), con TIMEOUT (un lavoro impallato non blocca il worker per sempre).
  to="${WORKER_TIMEOUT:-900}"
  ai_build_cmd
  out="$(timeout --kill-after=30s "$to" "${AI_CMD[@]}" "$prompt" 2>&1)"; rc=$?
  if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
    stato="errore"; out="$out
[worker] TIMEOUT dopo ${to}s — lavoro interrotto."
  elif [ "$rc" -ne 0 ]; then
    stato="errore"; out="$out
[worker] motore $(ai_engine) ($(ai_cli_name)) uscito con rc=$rc."
  else
    stato="fatto"
  fi

  # 3b) Se è andato bene, rendi DUREVOLI subito le scritture del vault (prima del prossimo giro).
  [ "$stato" = "fatto" ] && sync_vault

  # 3c) Metabolizzazione: dopo una chat riuscita, accoda un lavoro interno che rilegge la
  #     conversazione e aggiorna la memoria (apprendimento, stato, decisioni). Invisibile a Nicola.
  #     Anti-loop: scatta solo per tipo=chat; il job creato ha tipo=metabolizza → nessun loop.
  if [ "$stato" = "fatto" ] && [ "$tipo" = "chat" ]; then
    meta_body="$(jq -n \
      --arg richiesta "$(jq -n --arg c "$richiesta" --arg r "$out" \
        '{conversazione:$c, risposta_ad:$r}')" \
      '{stato:"in_attesa",tipo:"metabolizza",richiesta:$richiesta,esperto:"metabolizzazione"}')"
    curl -fsS -X POST "$SUPABASE_URL/rest/v1/lavori" "${AUTH[@]}" \
      -d "$meta_body" >/dev/null 2>&1 \
      && echo "[$(ts)] Metabolizzazione accodata per lavoro $id." \
      || echo "[$(ts)] Metabolizzazione: non riesco ad accodare (proseguo)." >&2
  fi

  # 4) riscrivi il risultato col VERO stato (fatto|errore): un lavoro fallito NON risulta più "fatto"
  #    (così è visibile a Nicola e ri-approvabile, e le azioni reali 🔴 non si perdono in silenzio).
  body="$(jq -n --arg stato "$stato" --arg risultato "$out" '{stato:$stato, risultato:$risultato}')"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 \
    && echo "[$(ts)] Lavoro $id: $stato." \
    || echo "[$(ts)] Lavoro $id: non sono riuscito a riscrivere il risultato." >&2
done
