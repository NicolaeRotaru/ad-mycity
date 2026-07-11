#!/usr/bin/env bash
# watch-main.sh — se origin/main è avanzato, allinea il codice sul VPS (aggiorna-cervello.sh).
# Timer consigliato: mycity-watch-main.timer (ogni 5 min).
#
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/watch-main.sh
#   sudo bash .../watch-main.sh --force    # allinea anche al primo avvio
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M'; }

REPO="${REPO:-/opt/mycity/ad-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
APP_USER="${APP_USER:-mycity}"
FORCE=0
RESTART_NOW=0   # default: reload GRAZIOSO del worker (mai un kill a metà lavoro). --restart-now = hard.

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --restart-now) RESTART_NOW=1 ;;
    --help|-h)
      echo "Usage: watch-main.sh [--force] [--restart-now]"
      echo "  Confronta origin/main con l'ultimo SHA visto; se avanzato → aggiorna-cervello.sh"
      echo "  Default: reload GRAZIOSO del worker (flag worker:riavvia — riparte TRA un lavoro e l'altro)."
      echo "  --restart-now: riavvio HARD immediato (systemctl) — può interrompere un lavoro in corso."
      exit 0
      ;;
  esac
done

if [ "$(id -un)" = "root" ]; then
  chown -R "$APP_USER:$APP_USER" "$REPO" 2>/dev/null || true
  # rc=2 dal figlio = "allineato, riavvia il worker": è un successo, non un errore.
  # L'assegnazione con || evita che set -e uccida il wrapper prima di gestire rc.
  rc=0
  WATCH_MAIN_FROM_ROOT=1 sudo -u "$APP_USER" -H env WATCH_MAIN_FROM_ROOT=1 bash "$REPO/cervello/vps/watch-main.sh" "$@" || rc=$?
  if [ "$rc" -eq 2 ]; then
    # GATE DI SINTASSI PRIMA DEL RIAVVIO (worker-outage 2026-07-09): non riavviare MAI il worker in
    # una versione di worker.sh che non parsa — riavvieremmo un cervello morto (crash-loop). Se è
    # rotta, NON tocchiamo il worker (resta su la versione sana già in esecuzione) e lo diciamo forte.
    if ! bash -n "$REPO/cervello/worker.sh" 2>/dev/null; then
      echo "[$(ts)] ⛔ NON riavvio: worker.sh appena allineato NON parsa. Tengo su la versione in esecuzione." >&2
      bash -n "$REPO/cervello/worker.sh" 2>&1 | head -3 >&2 || true
      exit 1
    fi
    echo "[$(ts)] ▶ Riavvio mycity-worker..."
    systemctl restart mycity-worker
    sleep 2
    systemctl is-active --quiet mycity-worker && echo "[$(ts)] ✓ Worker attivo." || echo "[$(ts)] ✗ Worker non partito." >&2
    exit 0
  fi
  exit "$rc"
fi

cd "$REPO"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

# Segnale per il Pannello/sentinelle: chiave automazione:watch-main nella tabella impostazioni.
segnale() {
  local esito="$1" dettaglio="$2"
  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then return 0; fi
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"automazione:watch-main\",\"valore\":\"$esito · $dettaglio · $(ts)\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1 || true
}

# 🔑 CAUSA-RADICE dei «lavori morti a metà» (azioni approvate finite in «da riapprovare»): quando main
# avanzava con un cambio di CODICE, watch-main faceva `systemctl restart mycity-worker` — un kill HARD
# (SIGTERM) che interrompeva il lavoro IN CORSO (giro/chat/azione approvata). L'azione reale interrotta
# NON riparte da sola (giustamente: rischio doppio invio) → resta ferma in errore/«riapprova». AR-027
# aveva già tolto il riavvio per i push di SOLA memoria; qui chiudiamo anche i push di codice.
#
# Reload GRAZIOSO: invece di ammazzare il worker, alziamo il flag `worker:riavvia` (lo STESSO del bottone
# «Riavvia worker» del Pannello). Il worker lo raccoglie in cima al suo loop — cioè SOLO tra un lavoro e
# l'altro — e si ri-exec da solo con il codice già allineato su disco: nessun lavoro interrotto, coda mai
# persa. Ritorna 0 se il flag è stato scritto, 1 altrimenti (SUPABASE assente → il chiamante fa fallback).
richiedi_riavvio_worker() {
  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then return 1; fi
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/impostazioni?on_conflict=chiave" \
    -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "{\"chiave\":\"worker:riavvia\",\"valore\":\"on\",\"updated_at\":\"$(date -Iseconds)\"}" \
    >/dev/null 2>&1
}

# Decide COSA fare dopo un allineamento: "nessuno" (era solo memoria → codice invariato), "hard"
# (--restart-now: riavvio immediato richiesto a mano) o "grazioso" (default: reload tra un lavoro e
# l'altro). Pura, senza effetti collaterali → testabile in isolamento (test/watch-main-reload-grazioso.bats).
decidi_azione_riavvio() {
  local solo_memoria="$1" restart_now="$2"
  if [ "$solo_memoria" = 1 ]; then echo "nessuno"; return; fi
  if [ "$restart_now" = 1 ]; then echo "hard"; return; fi
  echo "grazioso"
}

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN/GIT_REPO mancanti." >&2
  segnale "errore" "GIT_PUSH_TOKEN/GIT_REPO mancanti nel .env"
  exit 1
fi

url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"
SHA_FILE="$REPO/.git/mycity-watch-main-sha"
LOCK="$REPO/.git/mycity-sync.lock"

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "[$(ts)] watch-main: lock git occupato — salto."
  exit 0
fi

# ⏱️ TIMEOUT (radiografia 2026-07-11, difetto E1): senza timeout un fetch appeso su un socket
# mezzo-aperto teneva il LOCK GIT per sempre → niente più allineamenti né sync memoria, e nessun
# watchdog copre uno `oneshot`. Con `timeout` il fetch molla dopo WATCH_FETCH_TIMEOUT (default 60s):
# il lock si libera, il prossimo giro del timer riprova. rc 124/143 = timeout → trattato come fetch fallito.
if ! timeout "${WATCH_FETCH_TIMEOUT:-60}" git fetch "$url" main 2>/dev/null; then
  echo "[$(ts)] watch-main: fetch main fallito (o timeout)." >&2
  segnale "errore" "fetch main fallito (token scaduto, rete, o timeout)"
  exit 1
fi

REMOTE_SHA="$(git rev-parse FETCH_HEAD 2>/dev/null || true)"
LAST_SHA=""
[ -f "$SHA_FILE" ] && LAST_SHA="$(cat "$SHA_FILE" 2>/dev/null || true)"

if [ -z "$REMOTE_SHA" ]; then
  echo "[$(ts)] watch-main: SHA remoto non disponibile." >&2
  exit 1
fi

if [ "$REMOTE_SHA" = "$LAST_SHA" ]; then
  echo "[$(ts)] watch-main: main invariato (${REMOTE_SHA:0:7})."
  segnale "ok" "main invariato (${REMOTE_SHA:0:7})"
  exit 0
fi

# AR-027: NON riavviare il worker per i push fatti dal VPS stesso. Col ramo unico (Fase 2) il
# giro/worker committano la MEMORIA su main ~9-13 volte/giorno: prima ogni push faceva avanzare main →
# watch-main riavviava il worker uccidendo il giro/chat in corso (10-20 kill/giorno, causa-radice dei
# lavori morti a metà). Ora: se il commit remoto è ESATTAMENTE il nostro HEAD locale, l'abbiamo
# prodotto noi → aggiorna solo lo SHA visto ed esci, nessun allineamento e nessun riavvio.
LOCAL_HEAD="$(git rev-parse HEAD 2>/dev/null || true)"
if [ -n "$LOCAL_HEAD" ] && [ "$REMOTE_SHA" = "$LOCAL_HEAD" ]; then
  echo "$REMOTE_SHA" > "$SHA_FILE"
  echo "[$(ts)] watch-main: main = HEAD locale (push del VPS stesso, ${REMOTE_SHA:0:7}) — nessun riavvio."
  segnale "ok" "main = push del VPS (${REMOTE_SHA:0:7})"
  exit 0
fi

if [ -z "$LAST_SHA" ] && [ "$FORCE" != 1 ]; then
  echo "$REMOTE_SHA" > "$SHA_FILE"
  echo "[$(ts)] watch-main: primo avvio — memorizzato ${REMOTE_SHA:0:7} (usa --force per allineare subito)."
  exit 0
fi

# AR-027 (2° caso): se un ALTRO ambiente ha pushato SOLO file di memoria (vault/consegne/creativi/
# memoria-squadra) e nessun file di CODICE, allineo il repo ma NON riavvio il worker: il codice è
# invariato, riavviare ucciderebbe un lavoro in corso per niente. Stessa whitelist della sync del worker.
BASE_SHA="$LAST_SHA"; [ -z "$BASE_SHA" ] && BASE_SHA="$LOCAL_HEAD"
SOLO_MEMORIA=0
if [ -n "$BASE_SHA" ] && ! git diff --name-only "$BASE_SHA" "$REMOTE_SHA" 2>/dev/null \
     | grep -qvE '^(MyCity-Vault|consegne|creativi|memoria-squadra)/'; then
  SOLO_MEMORIA=1
fi

echo "[$(ts)] watch-main: main avanzato ${LAST_SHA:0:7} → ${REMOTE_SHA:0:7} — allineo codice..."
# RILASCIA il lock PRIMA di chiamare aggiorna-cervello.sh: quel copione prende lo STESSO
# lock da solo — tenerlo qui creava un deadlock (aspettava 120s e falliva sempre).
exec 9>&-
_agg_rc=0
AGGIORNA_SKIP_RESTART=1 bash "$REPO/cervello/vps/aggiorna-cervello.sh" || _agg_rc=$?
if [ "$_agg_rc" -eq 3 ]; then
  # rc=3 = lavoro VIVO su un branch (una chat sta preparando una PR): l'allineamento è solo
  # RIMANDATO. Non segniamo lo SHA come visto → si riprova al prossimo giro (5 min). Non è un
  # errore: niente allarme rosso nel Pannello.
  echo "[$(ts)] watch-main: allineamento rimandato (lavoro in corso su un branch) — riprovo al prossimo giro."
  segnale "ok" "allineamento rimandato: lavoro vivo su un branch (${REMOTE_SHA:0:7} in attesa)"
  exit 0
elif [ "$_agg_rc" -ne 0 ]; then
  echo "[$(ts)] watch-main: aggiorna-cervello.sh FALLITO." >&2
  segnale "errore" "allineamento fallito su ${REMOTE_SHA:0:7} — controlla journalctl"
  exit 1
fi
echo "$REMOTE_SHA" > "$SHA_FILE"
echo "[$(ts)] watch-main: allineamento completato."
segnale "ok" "allineato a main ${REMOTE_SHA:0:7}"

# Codice allineato: ora il worker deve girare col codice nuovo. Ma NIENTE kill a metà lavoro.
case "$(decidi_azione_riavvio "$SOLO_MEMORIA" "$RESTART_NOW")" in
  nessuno)
    # AR-027: erano SOLO file di memoria → codice invariato → nessun riavvio.
    echo "[$(ts)] watch-main: erano solo file di memoria — codice invariato, NON riavvio il worker."
    segnale "ok" "solo memoria allineata (${REMOTE_SHA:0:7}) — nessun riavvio"
    exit 0
    ;;
  hard)
    # Escape hatch MANUALE (--restart-now): riavvio hard immediato — può interrompere un lavoro in corso.
    echo "[$(ts)] watch-main: --restart-now → riavvio HARD del worker (può interrompere un lavoro in corso)."
    segnale "ok" "allineato ${REMOTE_SHA:0:7} — riavvio hard richiesto (--restart-now)"
    if [ -n "${WATCH_MAIN_FROM_ROOT:-}" ]; then exit 2; fi
    echo "[$(ts)]   Riavvio worker (root): sudo systemctl restart mycity-worker"
    exit 0
    ;;
  grazioso)
    # DEFAULT: reload grazioso via flag worker:riavvia. Il worker riparte tra un lavoro e l'altro,
    # senza uccidere il lavoro in corso → le azioni approvate non finiscono più in «da riapprovare».
    if richiedi_riavvio_worker; then
      echo "[$(ts)] watch-main: reload grazioso richiesto (flag worker:riavvia) — il worker riparte tra un lavoro e l'altro, senza ucciderne uno a metà."
      segnale "ok" "allineato ${REMOTE_SHA:0:7} — reload grazioso worker (nessun kill)"
    else
      # SUPABASE non raggiungibile: non posso alzare il flag → fallback al riavvio hard (raro).
      echo "[$(ts)] watch-main: flag worker:riavvia non scritto (SUPABASE assente?) — fallback riavvio hard." >&2
      segnale "warn" "allineato ${REMOTE_SHA:0:7} — flag reload non scritto, fallback hard"
      if [ -n "${WATCH_MAIN_FROM_ROOT:-}" ]; then exit 2; fi
    fi
    exit 0
    ;;
esac
