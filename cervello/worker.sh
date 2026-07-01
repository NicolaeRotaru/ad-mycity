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

WORKER_SCRIPT="$SCRIPT_DIR/worker.sh"
export WORKER_LOADED_MTIME="${WORKER_LOADED_MTIME:-$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo 0)}"

# Se giro.sh ha allineato il codice da main, worker.sh su disco è più nuovo del processo in RAM → ricarica.
maybe_reload_worker() {
  local now_mtime
  now_mtime="$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo 0)"
  if [ "$now_mtime" != "$WORKER_LOADED_MTIME" ]; then
    echo "[$(ts)] worker.sh aggiornato su disco — ricarico il processo (fix da main attivi)." >&2
    exec bash "$WORKER_SCRIPT"
  fi
}

# Versione pipeline per diagnosi Pannello (legacy = agent diretto, niente push memoria-ad).
worker_pipeline_tag() {
  if grep -q 'bash "\$SCRIPT_DIR/giro.sh"' "$WORKER_SCRIPT" 2>/dev/null; then
    echo "giro-pipeline-v2"
  else
    echo "legacy-agent-direct"
  fi
}

stamp_worker_info() {
  local tag pipeline
  pipeline="$(worker_pipeline_tag)"
  tag="$(git log -1 --format=%h -- "$WORKER_SCRIPT" 2>/dev/null || echo "?")"
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:pipeline\",\"valore\":\"$pipeline\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:codice_rev\",\"valore\":\"$tag\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
}

# --- Sync conflict-safe delle scritture del vault sul ramo memoria-ad ---
# Il worker edita i file del vault (AZIONI-IN-ATTESA → FATTO, DECISIONI). Senza questo, il giro successivo
# faceva 'checkout -f' e le cancellava (data loss + rischio doppio invio reale). Qui le rendiamo DUREVOLI
# subito, sotto lo STESSO lock del giro (niente race) e con push NON-force (rebase) per non sovrascrivere il giro.
branch="${GIT_BRANCH:-memoria-ad}"
LOCK="$REPO/.git/mycity-sync.lock"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity VPS}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)
# Ritorna 0 se push ok o niente da inviare; 1 se push fallito; 2 se lock non ottenuto.
sync_vault() {
  if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
    echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN/GIT_REPO mancanti nel .env — memoria NON pubblicata su GitHub." >&2
    return 3
  fi
  local url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
  local sync_rc=0
  exec 9>"$LOCK"
  if ! flock -w 120 9; then
    echo "[$(ts)] Worker: lock git occupato — sync vault rimandata." >&2
    exec 9>&-
    return 2
  fi
  git add -A "${MEM_DIRS[@]}" 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    exec 9>&-
    return 0
  fi
  git "${GIT_ID[@]}" commit -q -m "worker: lavoro ${id:-?} ($(ts))" 2>/dev/null || true
  local ok=0
  for a in 1 2 3; do
    if git fetch "$url" "$branch" 2>/dev/null; then
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
  exec 9>&-
  if [ "$ok" = 1 ]; then
    if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
      curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
        -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=minimal" \
        -d "{\"chiave\":\"memoria-ad:ultimo_push\",\"valore\":\"$(date -Iseconds)\",\"updated_at\":\"$(date -Iseconds)\"}" \
        >/dev/null 2>&1 || true
    fi
    return 0
  fi
  echo "[$(ts)] Worker: push del vault fallito (riprovo al prossimo lavoro)." >&2
  return 1
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

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ⚠️  GIT_PUSH_TOKEN/GIT_REPO mancanti: i giri NON potranno pubblicare su memoria-ad." >&2
else
  # Test rapido autenticazione GitHub (sola lettura).
  _git_test="$(git ls-remote "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git" HEAD 2>&1 | head -1 || true)"
  if [ -z "$_git_test" ]; then
    echo "[$(ts)] ⚠️  GIT_PUSH_TOKEN non valido o scaduto — push memoria-ad fallirà." >&2
  fi
fi

echo "[$(ts)] Worker AD avviato (pipeline: $(worker_pipeline_tag)). Controllo la coda ogni ${INTERVALLO}s."
stamp_worker_info

# Battito: il Pannello legge worker:ultimo per capire se il cervello è acceso.
battito_worker() {
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:ultimo\",\"valore\":\"$(date -Iseconds)\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
}

# Dopo un restart systemd i lavori restano «in_corso» ma nessun processo li esegue più.
# Rimettiamoli in coda così il worker non resta in sleep 5s per sempre.
recupera_lavori_orfani() {
  local orfani id tipo
  orfani="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=id,tipo,updated_at&order=updated_at.asc" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$orfani" | jq -c '.[]?' 2>/dev/null | while read -r row; do
    id="$(printf '%s' "$row" | jq -r '.id // empty')"
    tipo="$(printf '%s' "$row" | jq -r '.tipo // "?"')"
    [ -z "$id" ] && continue
    echo "[$(ts)] Recupero lavoro orfano $id ($tipo): in_corso → in_attesa (worker riavviato)." >&2
    curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
      -d '{"stato":"in_attesa"}' >/dev/null 2>&1 || true
  done
}

recupera_lavori_orfani

while true; do
  maybe_reload_worker
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

  skip_sync=0
  stato=""
  out=""

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
    # Pipeline COMPLETA: allinea codice + AI + push memoria-ad (come giro.sh manuale).
    export GIRO_EXTRA_INSTRUCTION="Restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1)."
    to="${WORKER_TIMEOUT_GIRO:-2700}"   # 45 min — allineato al timeout chat del Pannello
    out="$(timeout --kill-after=60s "$to" bash "$SCRIPT_DIR/giro.sh" 2>&1)"; rc=$?
    skip_sync=1
    if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
      stato="errore"; out="$out
[worker] TIMEOUT giro dopo ${to}s — interrotto."
    elif [ "$rc" -eq 2 ]; then
      stato="errore"; out="$out
[worker] Memoria scritta in locale ma PUSH su memoria-ad FALLITO. Controlla GIT_PUSH_TOKEN sul VPS."
    elif [ "$rc" -ne 0 ]; then
      stato="errore"; out="$out
[worker] giro.sh uscito con rc=$rc (motore AI o preparazione fallita)."
    else
      stato="fatto"
    fi
  elif [ "$tipo" = "sync-vps" ]; then
    to="${WORKER_TIMEOUT_SYNC:-300}"
    out="$(timeout --kill-after=30s "$to" bash "$SCRIPT_DIR/sync-vps.sh" 2>&1)"; rc=$?
    skip_sync=1
    if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
      stato="errore"; out="$out
[worker] TIMEOUT sync-vps dopo ${to}s — interrotto."
    elif [ "$rc" -ne 0 ]; then
      stato="errore"; out="$out
[worker] sync-vps.sh uscito con rc=$rc (install-sync-vps.sh eseguito come root?)."
    else
      stato="fatto"
    fi
  else
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro e restituisci un risultato chiaro e azionabile per Nicola, rispettando 🟢🟡🔴:

$richiesta"
  fi

  # 3) esegui col motore AI (Cursor/Claude), con TIMEOUT (un lavoro impallato non blocca il worker per sempre).
  skip_sync="${skip_sync:-0}"
  if [ "${skip_sync:-0}" != 1 ]; then
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
  fi

  # 3b) Se è andato bene, rendi DUREVOLI subito le scritture del vault (chat/azioni, non giro).
  if [ "$stato" = "fatto" ] && [ "$skip_sync" != 1 ]; then
    sync_rc=0
    sync_vault || sync_rc=$?
    if [ "$sync_rc" = 1 ] && [ "$tipo" = "esegui-azione" ]; then
      stato="errore"
      out="$out
[worker] Azione eseguita ma push memoria-ad fallito — la riga AZIONI potrebbe non essere visibile nel Pannello."
    fi
  fi

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

  # Dopo un giro, giro.sh potrebbe aver allineato worker.sh da main → ricarica al giro dopo.
  [ "$tipo" = "giro" ] && maybe_reload_worker
  stamp_worker_info
done
