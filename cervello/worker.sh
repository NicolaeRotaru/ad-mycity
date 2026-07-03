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

# AR-089: router costo — instrada un compito col router scegliModello (cervello/banco-ai.mjs) invece di
# usare sempre il motore premium. Stampa "modello|tier|collegato(1/0)". Se node/router falliscono torna
# vuoto → il chiamante resta sul premium (nessuna rottura). NON esegue AI: DECIDE soltanto.
router_scegli_modello() {
  ROUTER_COMPITO="$1" node --input-type=module 2>/dev/null <<'NODE' || true
import { scegliModello } from "./cervello/banco-ai.mjs";
const s = scegliModello(process.env.ROUTER_COMPITO || "");
process.stdout.write([s.modello, s.tier, s.collegato ? "1" : "0"].join("|"));
NODE
}

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

# Riavvio richiesto dal Pannello (bottone «Riavvia worker» → impostazioni.worker:riavvia = on).
# La coda NON si perde: i lavori stanno in Supabase e recupera_lavori_orfani() rimette in
# coda gli eventuali in_corso al riavvio. Il flag viene spento PRIMA dell'exec (niente loop).
maybe_riavvia_da_pannello() {
  local flag
  flag="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.worker:riavvia&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  if printf '%s' "$flag" | grep -q '"valore":"on"'; then
    echo "[$(ts)] Riavvio richiesto dal Pannello — spengo il flag e ricarico il worker." >&2
    curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
      -H "Prefer: resolution=merge-duplicates,return=minimal" \
      -d "{\"chiave\":\"worker:riavvia\",\"valore\":\"off\",\"updated_at\":\"$(date -Iseconds)\"}" \
      >/dev/null 2>&1 || true
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
        # AR-099: niente risoluzione cieca a favore del remoto. Prima, su conflitto, il worker prendeva
        # SEMPRE la versione remota e cancellava il 'FATTO' appena scritto → l'azione risultava non-eseguita,
        # con rischio
        # di DOPPIO invio reale. Strategia sicura: abortisci il merge e RIAPPLICA il solo commit del worker
        # sopra il remoto (rebase). Se il rebase entra in vero conflitto → abortisci e NON forzare nulla:
        # la sync si riprova al prossimo lavoro (il lavoro non si perde, niente overwrite cieco).
        git merge --abort 2>/dev/null || true
        if ! git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null; then
          git rebase --abort 2>/dev/null || true
          echo "[$(ts)] Worker: conflitto memoria non auto-risolvibile — sync rimandata (nessun overwrite cieco)." >&2
          exec 9>&-
          return 1
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

# --- PROTEZIONE ANTI-VELENO DELLA CODA -----------------------------------------------------------
# Sintomo storico: "il worker si impalla ogni volta che ci sono >2 lavori in coda". Causa radice:
# il loop prende SEMPRE il lavoro in_attesa PIÙ VECCHIO (FIFO stretto) e non aveva alcun limite di
# tentativi. Un lavoro "avvelenato" — tipicamente un `giro` (pipeline pesante da 45 min) che fa cadere
# il worker (timeout/OOM/restart) PRIMA di scrivere l'esito — restava in testa alla coda: al riavvio
# veniva rimesso in_attesa e ripescato all'infinito (crash-loop), tenendo bloccati TUTTI i lavori dietro.
# Fix: al riavvio i lavori interrotti/scaduti diventano ERRORE (dead-letter) invece di essere riprovati
# per sempre → la coda si sblocca DA SOLA e non si ri-intasa. I lavori chiusi restano visibili e
# ri-approvabili dal Pannello (nessuna perdita silenziosa).

# Soglie (override da .env). In minuti.
SOGLIA_ORFANO_MIN="${WORKER_SOGLIA_ORFANO_MIN:-60}"      # in_corso orfano più vecchio di così → dead-letter subito
SOGLIA_GIRO_MIN="${WORKER_SOGLIA_GIRO_MIN:-120}"         # un `giro` è puntuale: in coda da >2h = scaduto (dati cambiati)
SOGLIA_ABBANDONO_MIN="${WORKER_SOGLIA_ABBANDONO_MIN:-2880}"  # qualsiasi altro lavoro fermo da >48h = abbandonato

# Minuti trascorsi da un timestamp ISO (robusto: se il parse fallisce torna 0 = "recente", non chiude nulla).
_eta_min() {
  local t="$1" epoch
  epoch="$(date -d "$t" +%s 2>/dev/null || echo 0)"
  [ "$epoch" -gt 0 ] 2>/dev/null && echo $(( ( $(date +%s) - epoch ) / 60 )) || echo 0
}

# Chiude un lavoro in ERRORE (dead-letter) con una nota leggibile per Nicola.
_dead_letter() {
  local id="$1" nota="$2" body
  body="$(jq -n --arg r "$nota" '{stato:"errore", risultato:$r}')"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 || true
}

# 1) ORFANI in_corso: a worker appena avviato NESSUN lavoro è in esecuzione, quindi ogni "in_corso" è un
#    orfano (il processo che lo eseguiva è morto). Diamo UNA sola seconda chance ai freschi/leggeri; i già
#    ritentati (marker nel risultato) o troppo vecchi → dead-letter, per rompere il crash-loop.
recupera_lavori_orfani() {
  local orfani row id tipo agg ris eta
  orfani="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_corso&select=id,tipo,updated_at,risultato&order=updated_at.asc" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$orfani" | jq -c '.[]?' 2>/dev/null | while read -r row; do
    id="$(printf '%s' "$row" | jq -r '.id // empty')"; [ -z "$id" ] && continue
    tipo="$(printf '%s' "$row" | jq -r '.tipo // "?"')"
    agg="$(printf '%s' "$row" | jq -r '.updated_at // empty')"
    ris="$(printf '%s' "$row" | jq -r '.risultato // ""')"
    eta="$(_eta_min "$agg")"
    if printf '%s' "$ris" | grep -q '\[recuperato' || [ "$eta" -gt "$SOGLIA_ORFANO_MIN" ] || [ "$tipo" = "giro" ]; then
      echo "[$(ts)] Orfano $id ($tipo, ${eta}min): già ritentato/scaduto → DEAD-LETTER (errore) per sbloccare la coda." >&2
      _dead_letter "$id" "[worker] Lavoro interrotto (worker caduto mentre lo eseguiva) e già ritentato o troppo vecchio (${eta} min) → chiuso in errore per NON bloccare la coda. Ri-approva dal Pannello se serve."
    else
      echo "[$(ts)] Orfano $id ($tipo, ${eta}min): 2ª chance → in_corso → in_attesa (marcato recuperato)." >&2
      local body
      body="$(jq -n --arg r "[recuperato 1x $(ts)] $ris" '{stato:"in_attesa", risultato:$r}')"
      curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 || true
    fi
  done
}

# 2) SCADUTI in_attesa: un `giro` fermo da >SOGLIA_GIRO_MIN non ha più valore (è puntuale) ed è il veleno
#    n.1 (il più pesante) → chiudilo. Qualsiasi altro lavoro fermo da >SOGLIA_ABBANDONO_MIN = abbandonato.
scarta_lavori_scaduti() {
  local vecchi row id tipo creato eta soglia
  vecchi="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&select=id,tipo,created_at&order=created_at.asc" "${AUTH[@]}" 2>/dev/null || true)"
  printf '%s' "$vecchi" | jq -c '.[]?' 2>/dev/null | while read -r row; do
    id="$(printf '%s' "$row" | jq -r '.id // empty')"; [ -z "$id" ] && continue
    tipo="$(printf '%s' "$row" | jq -r '.tipo // "?"')"
    creato="$(printf '%s' "$row" | jq -r '.created_at // empty')"
    eta="$(_eta_min "$creato")"
    if [ "$tipo" = "giro" ]; then soglia="$SOGLIA_GIRO_MIN"; else soglia="$SOGLIA_ABBANDONO_MIN"; fi
    if [ "$eta" -gt "$soglia" ]; then
      echo "[$(ts)] Scaduto $id ($tipo, ${eta}min > ${soglia}): DEAD-LETTER (errore)." >&2
      _dead_letter "$id" "[worker] Lavoro '$tipo' rimasto in coda ${eta} min (oltre la soglia ${soglia}) → scaduto, chiuso in errore. Ri-approva dal Pannello se serve ancora."
    fi
  done
}

recupera_lavori_orfani
scarta_lavori_scaduti

# Auto-recovery: il DB memoria ha i campi tentativi/riprova_dopo? (migration pannello/sql/lavori-retry.sql)
# Se sì, il worker PROGRAMMA i ritentativi dei lavori falliti e SALTA quelli che aspettano il
# reset quota/backoff. Se no (DB non ancora migrato), degrada al comportamento classico
# (fallito → errore, riprova manuale) senza rompersi.
HAS_RETRY_COLS=0
_retry_probe="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?select=riprova_dopo&limit=1" "${AUTH[@]}" 2>&1 || true)"
if ! printf '%s' "$_retry_probe" | grep -qiE 'does not exist|PGRST|could not find|column'; then
  HAS_RETRY_COLS=1
  echo "[$(ts)] Auto-recovery ON (campi tentativi/riprova_dopo presenti)."
else
  echo "[$(ts)] Auto-recovery OFF (manca la migration lavori-retry.sql) — i falliti restano 'errore' (riprova manuale)." >&2
fi

while true; do
  maybe_reload_worker
  maybe_riavvia_da_pannello
  battito_worker
  # Kill-switch: se nel Pannello l'AD e' in PAUSA, non eseguire nulla.
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    sleep "$INTERVALLO"; continue
  fi

  # Prendi il prossimo lavoro in coda. Con l'auto-recovery attivo, SALTA quelli che stanno
  # aspettando l'ora di ritentativo (riprova_dopo nel futuro) → non bruciano i tentativi a vuoto.
  if [ "$HAS_RETRY_COLS" = 1 ]; then
    now_z="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&or=(riprova_dopo.is.null,riprova_dopo.lte.$now_z)&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  else
    riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  fi
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
  ROUTER_COMPITO_JOB=""   # AR-089: reset per-lavoro del compito-router (default = ragionamento/premium)

  # 1) segna "in_corso"
  curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
    -d '{"stato":"in_corso"}' >/dev/null 2>&1 || true

  # 2) costruisci il prompt (come worker.ps1)
  if [ "$tipo" = "esegui-azione" ]; then
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). $richiesta

Usa cervello/esegui-azione.mjs sul canale indicato (LIVE se AZIONI_LIVE=1, altrimenti dry-run).
Se il canale è github/PR: node cervello/esegui-azione.mjs github-merge ad-mycity|mycity <numeroPR>
(oppure node cervello/git-merge.mjs --repo ... --pr ...).
Poi aggiorna MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md (riga -> stato ✅ FATTO) e appendi la traccia in DECISIONI.md.
Restituisci a Nicola, in chiaro, COSA e' partito (canale, destinatario) o, se in dry-run, cosa partirebbe."
  elif [ "$tipo" = "metabolizza" ]; then
    meta_prompt="$(cat "$SCRIPT_DIR/metabolizza.md" 2>/dev/null || echo "Metabolizza la conversazione.")"
    prompt="$meta_prompt

## Conversazione da metabolizzare
$richiesta

Esegui la metabolizzazione seguendo le istruzioni sopra. NON produrre risposte per Nicola — aggiorna solo i file di memoria."
    # AR-091/AR-089: la metabolizzazione è lavoro di volume (riassumere/estrarre), NON ragionamento →
    # non deve girare sempre sul premium senza gate. La instradiamo al modello economico via il router
    # costo scegliModello 'testi-volume'; se l'adattatore economico non è collegato → fallback premium.
    ROUTER_COMPITO_JOB="testi-volume"
  elif [ "$tipo" = "giro" ]; then
    # Pipeline COMPLETA: allinea codice + AI + push memoria-ad (come giro.sh manuale).
    # AR-019: un giro dalla CODA è ON-DEMAND (Nicola l'ha chiesto dal Pannello) → forza il giro pieno,
    # scavalcando il delta-gate. Il throttling "niente di nuovo → salta" vale solo per la cadenza fissa
    # del timer (mycity-giro.timer), non per i giri richiesti a mano.
    export GIRO_FORCE=1
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
  else
    prompt="Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro e restituisci un risultato chiaro e azionabile per Nicola, rispettando 🟢🟡🔴:

$richiesta"
  fi

  # 3) esegui col motore AI (Cursor/Claude), con TIMEOUT (un lavoro impallato non blocca il worker per sempre).
  skip_sync="${skip_sync:-0}"
  if [ "${skip_sync:-0}" != 1 ]; then
    to="${WORKER_TIMEOUT:-900}"
    # AR-089: instrada il compito col router costo (scegliModello/banco-ai.mjs) invece di usare SEMPRE il
    # premium. I lavori di ragionamento restano su Claude (giusto); volume/metabolizza vanno all'economico
    # se la sua chiave è collegata e c'è l'adattatore-mani (AI_ECON_CMD). Altrimenti fallback premium.
    compito_router="${ROUTER_COMPITO_JOB:-ragionamento}"
    router_out="$(router_scegli_modello "$compito_router")"
    modello_scelto="${router_out%%|*}"
    collegato_scelto="$(printf '%s' "$router_out" | cut -d'|' -f3)"
    node cervello/banco-ai.mjs "$compito_router" --log >/dev/null 2>&1 || true   # AR-089: misura l'uso reale in routing.json
    ai_build_cmd
    if [ -n "$modello_scelto" ] && [ "$modello_scelto" != "claude" ] && [ "$collegato_scelto" = "1" ] && [ -n "${AI_ECON_CMD:-}" ]; then
      echo "[$(ts)] Lavoro $id ($compito_router): instradato al modello economico ($modello_scelto) dal router costo."
      read -r -a _econ_cmd <<< "$AI_ECON_CMD"
      out="$(timeout --kill-after=30s "$to" "${_econ_cmd[@]}" "$prompt" 2>&1)"; rc=$?
    else
      [ "$compito_router" != "ragionamento" ] && echo "[$(ts)] Lavoro $id: router → ${modello_scelto:-?} ma adattatore economico non collegato → fallback premium." >&2
      out="$(timeout --kill-after=30s "$to" "${AI_CMD[@]}" "$prompt" 2>&1)"; rc=$?
    fi
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
    # AR-091: gate di VALORE sulla metabolizzazione (prima scattava a OGNI chat, raddoppiando il costo
    # anche per un saluto). Sotto la soglia minima di caratteri non c'è nulla da imparare → non accodarla.
    meta_min_caratteri="${META_MIN_CARATTERI:-160}"
    if [ "$(( ${#richiesta} + ${#out} ))" -lt "$meta_min_caratteri" ]; then
      echo "[$(ts)] Metabolizzazione saltata per lavoro $id (chat < ${meta_min_caratteri} caratteri — niente da imparare)."
    else
      meta_body="$(jq -n \
        --arg richiesta "$(jq -n --arg c "$richiesta" --arg r "$out" \
          '{conversazione:$c, risposta_ad:$r}')" \
        '{stato:"in_attesa",tipo:"metabolizza",richiesta:$richiesta,esperto:"metabolizzazione"}')"
      curl -fsS -X POST "$SUPABASE_URL/rest/v1/lavori" "${AUTH[@]}" \
        -d "$meta_body" >/dev/null 2>&1 \
        && echo "[$(ts)] Metabolizzazione accodata per lavoro $id." \
        || echo "[$(ts)] Metabolizzazione: non riesco ad accodare (proseguo)." >&2
    fi
  fi

  # 3d) AUTO-RECOVERY: se il lavoro è fallito, chiedi alla retry-policy se ritentarlo DA SOLO
  #     (quota/transitori = provato non-partito → sicuro, anche per le 🔴) o fermarti (azione reale
  #     interrotta a metà → lascia 'errore' e attendi il "Riprova" manuale). Fonte unica della regola:
  #     cervello/retry-policy.mjs (stessa logica che usa la sentinella).
  retry_quando=""; retry_tent=""; motivo_retry=""
  if [ "$stato" = "errore" ] && [ "$HAS_RETRY_COLS" = 1 ]; then
    tent_ora="$(printf '%s' "$riga" | jq -r '.[0].tentativi // 0' 2>/dev/null || echo 0)"
    decis="$(RP_TIPO="$tipo" RP_TENTATIVI="$tent_ora" RP_RISULTATO="$out" \
      timeout 20s node "$SCRIPT_DIR/retry-policy.mjs" decidi 2>/dev/null || echo '{}')"
    if [ "$(printf '%s' "$decis" | jq -r '.azione // "stop"' 2>/dev/null)" = "ritenta" ]; then
      retry_quando="$(printf '%s' "$decis" | jq -r '.quandoISO // empty' 2>/dev/null)"
      retry_tent="$(printf '%s' "$decis" | jq -r '.tentativi // empty' 2>/dev/null)"
      motivo_retry="$(printf '%s' "$decis" | jq -r '.motivo // "ritento"' 2>/dev/null)"
      echo "[$(ts)] Lavoro $id fallito → auto-retry #$retry_tent alle $retry_quando ($motivo_retry)." >&2
    fi
  fi

  # 4) riscrivi l'esito. Se la policy ha deciso un ritentativo → torna 'in_attesa' con riprova_dopo
  #    (il worker lo salta finché non scatta l'ora, così NON perdi il lavoro e NON bruci quota).
  #    Altrimenti scrivi il VERO stato (fatto|errore): un fallito non risulta "fatto", resta
  #    visibile a Nicola e le azioni reali 🔴 non si perdono in silenzio.
  if [ -n "$retry_quando" ]; then
    body="$(jq -n --arg r "$out" --argjson t "${retry_tent:-1}" --arg q "$retry_quando" --arg m "${motivo_retry:-ritento}" \
      '{stato:"in_attesa", tentativi:$t, riprova_dopo:$q, risultato:($r + "\n[auto-retry] tentativo " + ($t|tostring) + " programmato per " + $q + " — " + $m)}')"
    curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 \
      && echo "[$(ts)] Lavoro $id: ri-programmato (tentativo $retry_tent alle $retry_quando)." \
      || echo "[$(ts)] Lavoro $id: non sono riuscito a programmare il ritentativo." >&2
  else
    body="$(jq -n --arg stato "$stato" --arg risultato "$out" '{stato:$stato, risultato:$risultato}')"
    curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" -d "$body" >/dev/null 2>&1 \
      && echo "[$(ts)] Lavoro $id: $stato." \
      || echo "[$(ts)] Lavoro $id: non sono riuscito a riscrivere il risultato." >&2
  fi

  # Dopo un giro, giro.sh potrebbe aver allineato worker.sh da main → ricarica al giro dopo.
  [ "$tipo" = "giro" ] && maybe_reload_worker
  stamp_worker_info
done
