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

# CORSIA VELOCE CHAT — la chiacchiera semplice va su un modello VELOCE (Sonnet), il lavoro
# difficile resta su Opus. Serve a rendere la chat del Pannello reattiva senza perdere qualità
# sui compiti che ragionano. L'ESCALATION è automatica: chat_e_complesso() fiuta i segnali di
# «compito difficile» (analisi, numeri, soldi, decisioni, pipeline pesanti, messaggi lunghi) →
# in quel caso NON usa il veloce, resta sul premium. Nel dubbio, sale su Opus (mai il contrario).
CHAT_MODELLO_VELOCE="${CHAT_MODELLO_VELOCE:-claude-sonnet-4-6}"

# Ritorna 0 (=complesso → premium/Opus) se la richiesta chat mostra segnali di lavoro pesante,
# 1 (=semplice → modello veloce) altrimenti. Volutamente PRUDENTE: al minimo dubbio → complesso.
chat_e_complesso() {
  local q; q="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  # Messaggio lungo = probabile ragionamento vero.
  [ "${#q}" -gt 280 ] && return 0
  # Parole-spia di compiti che ragionano o toccano soldi/decisioni/pipeline pesanti.
  case "$q" in
    *analiz*|*analisi*|*radiograf*|*audit*|*proiezion*|*forecast*|*prevision*|*strateg*|*scenario*|\
    *budget*|*spend*|*€*|*euro*|*margin*|*prezz*|*commission*|*fattur*|*payout*|*incass*|*bilancio*|\
    *campagn*|*ads*|*"contenuti pro"*|*"modalità mondiale"*|*decid*|*decision*|*valuta*|*conviene*|\
    *piano*|*negozi*|*onboard*|*sblocca*|*"cambia il sito"*|*modifica*|*design*|*bug*|*legale*|*contratt*|\
    *report*|*kpi*|*quanti*|*quanto*|*perché*|*perche*)
      return 0 ;;
  esac
  return 1
}

WORKER_SCRIPT="$SCRIPT_DIR/worker.sh"
export WORKER_LOADED_MTIME="${WORKER_LOADED_MTIME:-$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo 0)}"

# Ricarica SICURA del worker (worker-outage 2026-07-09). PRIMA di sostituire il processo con la
# versione su disco, verifica che quella versione PARSI (bash -n). Se è rotta (es. un errore di
# sintassi come *contenuti pro* senza virgolette) NON facciamo exec: teniamo in vita il processo
# BUONO già in RAM, alziamo un allarme visibile nel Pannello, e non ritentiamo a ogni giro (finché
# il file non cambia di nuovo). Così un worker.sh rotto non può PIÙ spegnere il cervello: al massimo
# resta in esecuzione la versione precedente, sana, e la chat continua a rispondere.
reload_worker_sicuro() {
  local motivo="$1"
  if bash -n "$WORKER_SCRIPT" 2>/dev/null; then
    echo "[$(ts)] $motivo — worker.sh valido, ricarico il processo." >&2
    # FIX loop-di-ricarica (worker-outage 2026-07-09, 2° episodio): allinea l'mtime "caricato" alla
    # versione che stiamo per eseguire, PRIMA dell'exec. Senza questo, il processo ricaricato eredita
    # il vecchio WORKER_LOADED_MTIME, vede il file su disco "più nuovo" e si ri-ricarica all'infinito
    # → il loop non raggiunge mai battito_worker → heartbeat congelato, worker bloccato. Fu proprio il
    # merge del fix a cambiare worker.sh e innescare questo difetto preesistente.
    export WORKER_LOADED_MTIME="$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo 0)"
    exec bash "$WORKER_SCRIPT"
  fi
  local errore; errore="$(bash -n "$WORKER_SCRIPT" 2>&1 | head -3 | tr '\n' ' ')"
  echo "[$(ts)] ⛔ RELOAD RIFIUTATO: worker.sh su disco NON parsa ($errore). Resto sulla versione sana in RAM." >&2
  # Non ritentare a ogni ciclo: aggiorna l'mtime visto così riproviamo solo se il file cambia ancora.
  WORKER_LOADED_MTIME="$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo "$WORKER_LOADED_MTIME")"
  # Allarme nel Pannello (best-effort): Nicola vede subito che un fix è arrivato rotto.
  curl -fsS -X POST \
    "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" "${AUTH[@]}" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:reload-rifiutato\",\"valore\":\"worker.sh rotto su disco — resto sulla versione sana · $(date '+%Y-%m-%d %H:%M')\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
}

# Se giro.sh ha allineato il codice da main, worker.sh su disco è più nuovo del processo in RAM → ricarica.
maybe_reload_worker() {
  local now_mtime
  now_mtime="$(stat -c %Y "$WORKER_SCRIPT" 2>/dev/null || echo 0)"
  if [ "$now_mtime" != "$WORKER_LOADED_MTIME" ]; then
    reload_worker_sicuro "worker.sh aggiornato su disco (fix da main)"
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
    reload_worker_sicuro "riavvio richiesto dal Pannello"
  fi
}

# Versione pipeline per diagnosi Pannello (legacy = agent diretto, niente push della memoria).
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

# --- Sync conflict-safe delle scritture del vault sul ramo unico main ---
# Il worker edita i file del vault (AZIONI-IN-ATTESA → FATTO, DECISIONI). Senza questo, il giro successivo
# faceva 'checkout -f' e le cancellava (data loss + rischio doppio invio reale). Qui le rendiamo DUREVOLI
# subito, sotto lo STESSO lock del giro (niente race) e con push NON-force (rebase) per non sovrascrivere il giro.
branch="${GIT_BRANCH:-main}"
LOCK="$REPO/.git/mycity-sync.lock"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
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
      curl -fsS --connect-timeout 10 --max-time 30 -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
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
_mem_check="$(curl -fsS --connect-timeout 10 --max-time 30 "$SUPABASE_URL/rest/v1/impostazioni?select=chiave&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" 2>&1 || true)"
if printf '%s' "$_mem_check" | grep -q 'PGRST205\|impostazioni.*not found\|Could not find the table'; then
  echo "[$(ts)] ERRORE: SUPABASE_URL punta al DB sbagliato (marketplace?)." >&2
  echo "[$(ts)]   URL attuale: $SUPABASE_URL" >&2
  echo "[$(ts)]   Serve il progetto MEMORIA (xjljcsorpbqwttrejqte), NON clmpyfvpvfjgeviworth." >&2
  echo "[$(ts)]   Copia SUPABASE_URL + SUPABASE_SERVICE_KEY da Vercel → aggiorna cervello/vps/.env → restart." >&2
  exit 1
fi

INTERVALLO="${WORKER_INTERVALLO:-5}"   # secondi tra un controllo e l'altro (basso = chat reattiva)
# ROOT-CAUSE FIX (worker-outage 2026-07-09): tutte le curl del worker giravano SENZA timeout.
# Una sola chiamata REST bloccata su un socket mezzo-aperto (rete che cade a metà, connessione TCP
# stabilita ma risposta mai arrivata) impiccava il loop PER SEMPRE: nessun `timeout` la copre e, con
# systemd Type=simple, il processo resta "attivo" → Restart=always non scatta mai. Il battito si
# congela e la coda si ferma (sintomo: worker:ultimo fermo, lavori in_attesa con tentativi=0).
# Difesa: --connect-timeout + --max-time su OGNI curl. Le metto in AUTH così valgono per tutte le
# chiamate autenticate (curl accetta opzioni e URL in qualsiasi ordine); le 2 curl senza AUTH
# (sanity-check memoria e stamp del push) le fisso a mano.
CURL_TIMEOUT=(--connect-timeout 10 --max-time 30)
AUTH=("${CURL_TIMEOUT[@]}" -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" -H "Content-Type: application/json")

# CORSIA del worker (Strada A, step 2). Due valori:
#   all  (default) → il worker fa tutto: chat, giro, ritmo, metabolizza, azioni.
#   chat           → worker DEDICATO che prende SOLO le chat. Si installa come 2° servizio
#                    (mycity-worker-chat.service) accanto a quello principale: così, anche mentre
#                    il worker "all" è impegnato in un giro da 45 minuti, le tue chat vengono
#                    risposte SUBITO dal worker-chat. Il claim atomico impedisce che i due prendano
#                    lo stesso lavoro. Chi resta "all" continua a gestire chat come fallback.
WORKER_LANE="${WORKER_LANE:-all}"

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ⚠️  GIT_PUSH_TOKEN/GIT_REPO mancanti: i giri NON potranno pubblicare la memoria su GitHub." >&2
else
  # Test rapido autenticazione GitHub (sola lettura).
  _git_test="$(git ls-remote "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git" HEAD 2>&1 | head -1 || true)"
  if [ -z "$_git_test" ]; then
    echo "[$(ts)] ⚠️  GIT_PUSH_TOKEN non valido o scaduto — il push della memoria fallirà." >&2
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

# Battito verso systemd (watchdog hardware del cervello). Se il .service ha WatchdogSec=N, systemd
# aspetta un WATCHDOG=1 entro N secondi: se il loop si impicca (qualsiasi causa, non solo curl),
# systemd ammazza e RIAVVIA il worker da solo — la rete di sicurezza che il 9/7 è mancata.
# No-op fuori da systemd (WATCHDOG_USEC assente) o se systemd-notify non c'è: non rompe nulla.
battito_systemd() {
  [ -n "${WATCHDOG_USEC:-}" ] || return 0
  command -v systemd-notify >/dev/null 2>&1 && systemd-notify WATCHDOG=1 2>/dev/null || true
}

# ── CHAT IN STREAMING (Strada A, step 2) ─────────────────────────────────────────────────────────
# Estrae il testo dagli eventi stream-json accumulati finora nel file $1. Salta le righe incomplete
# o non-JSON (fromjson? // empty) → non produce MAI testo sballato, al massimo un prefisso più corto.
# Priorità (una sola fonte, niente testo doppio): evento "result" finale → messaggi "assistant"
# completi → delta di testo ("stream_event"). Durante lo streaming esistono solo i delta.
_estrai_stream() {
  local f="$1" t
  t="$(jq -rR 'fromjson? // empty | select(.type=="result") | .result // empty' "$f" 2>/dev/null | tail -1)"
  [ -n "$t" ] && { printf '%s' "$t"; return; }
  t="$(jq -rR 'fromjson? // empty | select(.type=="assistant") | [.message.content[]? | select(.type=="text") | .text] | join("")' "$f" 2>/dev/null)"
  [ -n "$t" ] && { printf '%s' "$t"; return; }
  jq -rR 'fromjson? // empty | select(.type=="stream_event") | .event.delta.text // empty' "$f" 2>/dev/null | tr -d '\r'
}

# 📎 ALLEGATI CHAT: se la richiesta contiene righe "@ALLEGATO ... percorso=..." (foto/file caricati dal
# Pannello nello storage), le scarica in una cartella temporanea con la service key e stampa un blocco di
# istruzioni con i PERCORSI LOCALI, così Claude li apre con lo strumento Read (le foto le VEDE, i PDF/testi
# li legge). Best-effort e fail-safe: un download fallito è solo segnalato, non blocca mai la chat.
# Sicurezza: accetta solo il bucket previsto e caratteri di percorso sicuri (niente path-traversal/SSRF).
prepara_allegati_chat() {
  local testo="$1"
  printf '%s' "$testo" | grep -q '@ALLEGATO ' || return 0
  local dir="/tmp/mycity-allegati/${id:-chat}"
  rm -rf "$dir" 2>/dev/null || true
  mkdir -p "$dir" 2>/dev/null || return 0
  local out_block="" n=0 riga percorso nome tipo base local_path
  while IFS= read -r riga; do
    case "$riga" in *"@ALLEGATO "*) : ;; *) continue ;; esac
    percorso="$(printf '%s' "$riga" | sed -n 's/.*percorso="\([^"]*\)".*/\1/p')"
    nome="$(printf '%s' "$riga" | sed -n 's/.*nome="\([^"]*\)".*/\1/p')"
    tipo="$(printf '%s' "$riga" | sed -n 's/.*tipo="\([^"]*\)".*/\1/p')"
    case "$percorso" in chat-allegati/*) : ;; *) continue ;; esac
    printf '%s' "$percorso" | grep -qE '^chat-allegati/[A-Za-z0-9._/-]+$' || continue
    base="$(printf '%s' "${nome:-file}" | tr -c 'A-Za-z0-9._-' '_' | tail -c 80)"
    n=$((n + 1))
    local_path="$dir/${n}-${base}"
    if curl -fsS "${CURL_TIMEOUT[@]}" "$SUPABASE_URL/storage/v1/object/$percorso" \
      -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
      -o "$local_path" 2>/dev/null; then
      out_block="$out_block
- $local_path  (${tipo:-file})"
    else
      out_block="$out_block
- (download fallito per ${nome:-file})"
    fi
  done <<<"$testo"
  [ "$n" -eq 0 ] && return 0
  printf '%s' "
## File allegati (già scaricati sul disco — GUARDALI prima di rispondere)
Nicola ha allegato dei file a questo messaggio. Sono qui, aprili con lo strumento Read (le foto le vedi, i PDF/testi li leggi) e tienine conto:$out_block"
}

# Esegue la chat in streaming: mentre Claude genera, scrive la risposta PARZIALE su lavori.risultato
# (stato resta in_corso) così nel Pannello compare parola per parola. Popola le globali out, rc.
# FAIL-SAFE: se lo stream non dà testo (CLI che non supporta il formato) o esce male, si ricade
# sull'esecuzione normale (cattura piena) → la risposta finale è SEMPRE quella autorevole.
rispondi_chat_stream() {
  local to="$1" tmpf acc pidc cmd
  cmd=("${AI_CMD[@]}"); [ -n "${CHAT_MODELLO:-}" ] && cmd+=(--model "$CHAT_MODELLO")
  tmpf="$(mktemp)"
  timeout --kill-after=30s "$to" "${cmd[@]}" --output-format stream-json --verbose --include-partial-messages "$prompt" >"$tmpf" 2>/dev/null &
  pidc=$!
  while kill -0 "$pidc" 2>/dev/null; do
    sleep 1.5
    acc="$(_estrai_stream "$tmpf")"
    if [ -n "$acc" ]; then
      curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id" "${AUTH[@]}" \
        -d "$(jq -n --arg r "$acc" '{risultato:$r}')" >/dev/null 2>&1 || true
    fi
  done
  wait "$pidc"; rc=$?
  out="$(_estrai_stream "$tmpf")"
  rm -f "$tmpf"
  if [ -z "$out" ]; then
    # streaming non disponibile/vuoto → esecuzione normale, risposta finale garantita corretta.
    out="$(timeout --kill-after=30s "$to" "${cmd[@]}" "$prompt" 2>&1)"; rc=$?
  fi
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
    # AR-026 (sicurezza, prima di AZIONI_LIVE): un'AZIONE REALE approvata (esegui-azione|proposta)
    # interrotta a metà NON deve MAI ripartire da sola — potrebbe essere già partita (email/payout
    # inviati) ma non ancora marcata FATTO → riesecuzione = doppio invio. Regola IDENTICA a
    # retry-policy.mjs (MAI auto-retry per esegui-azione) e a sentinella-lavori.mjs (orfano azione →
    # 'errore, riapprova'). Solo il worker la violava dando a TUTTI i tipi la 2ª chance. Va sempre in
    # dead-letter con nota "riapprova": la firma di Nicola dal Pannello è l'unica ripartenza lecita.
    case " esegui-azione proposta " in
      *" $tipo "*)
        echo "[$(ts)] Orfano $id ($tipo, ${eta}min): AZIONE REALE interrotta → NON la ri-eseguo da sola (rischio doppio invio) → riapprova dal Pannello." >&2
        _dead_letter "$id" "[worker] Azione reale '$tipo' interrotta a metà (worker caduto mentre la eseguiva): potrebbe essere già partita → NON rieseguita in automatico per evitare un doppio invio. Riapprova dal Pannello se serve ancora."
        continue
        ;;
    esac
    # (fix "lascia il lavoro a metà") Prima il `giro` veniva SEMPRE cestinato (errore) al primo
    # riavvio del worker (il watch-main lo riavvia ogni volta che main avanza, uccidendo il giro
    # in corso). Ora il giro ha la STESSA seconda chance degli altri: il marker `[recuperato` +
    # SOGLIA_ORFANO_MIN evitano comunque il crash-loop, ma un giro interrotto UNA volta riparte
    # invece di morire a metà. (I tipi-azione sono già usciti sopra: qui restano solo i pre-esecuzione.)
    if printf '%s' "$ris" | grep -q '\[recuperato' || [ "$eta" -gt "$SOGLIA_ORFANO_MIN" ]; then
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
  battito_systemd
  # Kill-switch: se nel Pannello l'AD e' in PAUSA, non eseguire nulla.
  # FAIL-CLOSED (come AR-100 nel giro): se lo stato pausa NON è leggibile (errore transitorio sulla
  # query impostazioni), NON prendere lavori in questo ciclo — meglio un ciclo saltato che eseguire
  # un'azione reale mentre Nicola crede di aver messo in PAUSA. Prima il `|| true` rendeva il worker
  # fail-OPEN proprio nel componente che tocca il mondo (esegui-azione).
  _pausa_rc=0
  pausa="$(curl -fsS "$SUPABASE_URL/rest/v1/impostazioni?select=valore&chiave=eq.pausa&limit=1" "${AUTH[@]}" 2>/dev/null)" || _pausa_rc=$?
  if [ "$_pausa_rc" -ne 0 ]; then
    echo "[$(ts)] ⛔ PAUSA_FAIL_CLOSED: stato pausa non verificabile (rc=$_pausa_rc) — non prendo lavori in questo ciclo." >&2
    sleep "$INTERVALLO"; continue
  fi
  if printf '%s' "$pausa" | grep -q '"valore":"on"'; then
    sleep "$INTERVALLO"; continue
  fi

  # Prendi il prossimo lavoro in coda. Con l'auto-recovery attivo, SALTA quelli che stanno
  # aspettando l'ora di ritentativo (riprova_dopo nel futuro) → non bruciano i tentativi a vuoto.
  #
  # PRECEDENZA CHAT (Strada A — Claude Max nel Pannello): Nicola aspetta la risposta IN DIRETTA, quindi
  # una chat in attesa passa SEMPRE davanti a giro/ritmo/metabolizza (lavori di fondo). Prima si cercava
  # solo il più vecchio in assoluto (FIFO stretto): una metabolizzazione o un ritmo accodati prima della
  # tua domanda la facevano aspettare. Ora: prima si prova a prendere una chat; se non ce n'è, si prende
  # il più vecchio di qualsiasi tipo (i lavori di fondo continuano quando non stai chattando).
  if [ "$HAS_RETRY_COLS" = 1 ]; then
    now_z="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    _rtry="&or=(riprova_dopo.is.null,riprova_dopo.lte.$now_z)"
  else
    _rtry=""
  fi
  riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa&tipo=eq.chat${_rtry}&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
  if [ -z "$(printf '%s' "$riga" | jq -r '.[0].id // empty' 2>/dev/null)" ]; then
    if [ "$WORKER_LANE" = chat ]; then
      # Worker dedicato solo-chat: nessuna chat in attesa → non prende altri tipi, aspetta.
      sleep "$INTERVALLO"; continue
    fi
    riga="$(curl -fsS "$SUPABASE_URL/rest/v1/lavori?stato=eq.in_attesa${_rtry}&order=created_at.asc&limit=1" "${AUTH[@]}" 2>/dev/null || true)"
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

  # 1) CLAIM ATOMICO (compare-and-set): prendi il lavoro SOLO se è ANCORA in_attesa. Con
  #    return=representation la PATCH torna la riga solo se l'ha aggiornata QUESTO worker; se un altro
  #    consumer (2° worker, worker.ps1, o un lancio manuale) l'ha già presa fra il GET e qui, torna []
  #    → lo saltiamo. Senza il filtro stato=eq.in_attesa due worker eseguivano lo stesso lavoro due
  #    volte (doppio invio reale con AZIONI_LIVE=1). Niente più `|| true` che ingoiava il claim perso.
  claimed="$(curl -fsS -X PATCH "$SUPABASE_URL/rest/v1/lavori?id=eq.$id&stato=eq.in_attesa" "${AUTH[@]}" \
    -H "Prefer: return=representation" -d '{"stato":"in_corso"}' 2>/dev/null || true)"
  if [ -z "$(printf '%s' "$claimed" | jq -r '.[0].id // empty' 2>/dev/null)" ]; then
    echo "[$(ts)] Lavoro $id: claim perso (già preso da un altro worker o non più in_attesa) — salto." >&2
    continue
  fi

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
    # Pipeline COMPLETA: allinea codice + AI + push memoria su main (come giro.sh manuale).
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
[worker] Memoria scritta in locale ma PUSH su main FALLITO. Controlla GIT_PUSH_TOKEN sul VPS."
    elif [ "$rc" -ne 0 ]; then
      stato="errore"; out="$out
[worker] giro.sh uscito con rc=$rc (motore AI o preparazione fallita)."
    else
      stato="fatto"
    fi
  elif [ "${tipo#ritmo-}" != "$tipo" ]; then
    # AR-024: RECUPERO CADENZA. Una cadenza del battito (mattino|mezzogiorno|sera|settimana) saltata per
    # rate-limit si è ri-accodata qui (vedi ritmo.sh). La ri-esegue il worker così la retry-policy della
    # coda governa i ritentativi FINO al reset quota — invece di aspettare il timer di domani. ritmo.sh
    # fa da sé push memoria (come giro.sh) → skip_sync=1. RITMO_FROM_WORKER=1 impedisce il doppio-accodamento.
    sezione="${tipo#ritmo-}"
    export RITMO_FROM_WORKER=1
    to="${WORKER_TIMEOUT_GIRO:-2700}"
    out="$(timeout --kill-after=60s "$to" bash "$SCRIPT_DIR/ritmo.sh" "$sezione" 2>&1)"; rc=$?
    skip_sync=1
    if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
      stato="errore"; out="$out
[worker] TIMEOUT ritmo $sezione dopo ${to}s — interrotto."
    elif [ "$rc" -eq 2 ]; then
      stato="errore"; out="$out
[worker] Ritmo $sezione: memoria scritta in locale ma PUSH su main FALLITO. Controlla GIT_PUSH_TOKEN sul VPS."
    elif [ "$rc" -ne 0 ]; then
      stato="errore"; out="$out
[worker] ritmo.sh $sezione uscito con rc=$rc (motore AI o preparazione fallita)."
    else
      stato="fatto"
    fi
  elif [ "$tipo" = "chat" ]; then
    # CHAT IN DIRETTA (Strada A): Nicola sta parlando col suo AD nel Pannello. Prompt SNELLO e
    # conversazionale — niente rituale del "ciclo AD", niente lettura obbligata dell'intero vault:
    # si risponde alla domanda in modo diretto e utile, come Claude Max. Il personaggio resta (CLAUDE.md
    # è caricato dal progetto); qui diciamo solo COME rispondere → risposte pertinenti, non "cose inutili".
    prompt="Sei l'AD digitale di MyCity e stai parlando con Nicola nella chat del Pannello.
Rispondi in italiano, diretto, concreto e utile — è una conversazione vera, non un report.
Vai al punto: niente preamboli, niente rituali, niente analisi enormi se non te le chiede. Se ti serve un dato reale leggilo, altrimenti rispondi e basta.
Se proponi un'azione che tocca il mondo reale (soldi, email a clienti, deploy, prezzi, cancellazioni) NON eseguirla: proponila chiaramente e segna che serve la sua approvazione (🔴).

## Conversazione
$richiesta"
    # 📎 Se Nicola ha allegato foto/file, scaricali e di' a Claude di aprirli col Read.
    _alleg_block="$(prepara_allegati_chat "$richiesta")"
    [ -n "$_alleg_block" ] && prompt="$prompt
$_alleg_block"
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
    elif [ "$tipo" = "chat" ] && [ "$(ai_engine)" = claude ] && [ -z "${CERVELLO_MODELLO:-}" ]; then
      # CHAT = MASSIMA QUALITÀ (Strada A): il tuo Claude Max, modello forte (Opus), non più Sonnet.
      # La "corsia veloce" su Sonnet era la causa delle risposte "stupide/strane": la togliamo. La
      # velocità ora viene dalla PRECEDENZA in coda e dal prompt snello, non dal degradare il modello.
      # STREAMING (step 2): la risposta compare parola-per-parola. CHAT_STREAM=0 per spegnerlo senza
      # toccare il codice; CHAT_MODELLO opzionale per fissare un modello preciso (vuoto = premium).
      if [ "${CHAT_STREAM:-1}" = 1 ]; then
        echo "[$(ts)] Lavoro $id (chat): qualità massima + streaming."
        rispondi_chat_stream "$to"   # popola out, rc e scrive i parziali nel Pannello
      elif [ -n "${CHAT_MODELLO:-}" ]; then
        echo "[$(ts)] Lavoro $id (chat): qualità massima → $CHAT_MODELLO."
        out="$(timeout --kill-after=30s "$to" "${AI_CMD[@]}" --model "$CHAT_MODELLO" "$prompt" 2>&1)"; rc=$?
      else
        echo "[$(ts)] Lavoro $id (chat): qualità massima → modello premium."
        out="$(timeout --kill-after=30s "$to" "${AI_CMD[@]}" "$prompt" 2>&1)"; rc=$?
      fi
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
[worker] Azione eseguita ma push memoria fallito — la riga AZIONI potrebbe non essere visibile nel Pannello."
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
