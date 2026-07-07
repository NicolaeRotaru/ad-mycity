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

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --help|-h)
      echo "Usage: watch-main.sh [--force]"
      echo "  Confronta origin/main con l'ultimo SHA visto; se avanzato → aggiorna-cervello.sh"
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

if ! git fetch "$url" main 2>/dev/null; then
  echo "[$(ts)] watch-main: fetch main fallito." >&2
  segnale "errore" "fetch main fallito (token scaduto o rete)"
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
if ! AGGIORNA_SKIP_RESTART=1 bash "$REPO/cervello/vps/aggiorna-cervello.sh"; then
  echo "[$(ts)] watch-main: aggiorna-cervello.sh FALLITO." >&2
  segnale "errore" "allineamento fallito su ${REMOTE_SHA:0:7} — controlla journalctl"
  exit 1
fi
echo "$REMOTE_SHA" > "$SHA_FILE"
echo "[$(ts)] watch-main: allineamento completato."
segnale "ok" "allineato a main ${REMOTE_SHA:0:7}"

# Exit 2 = allineamento fatto, root deve riavviare il worker. Ma se erano SOLO file di memoria
# (AR-027), il codice è invariato → exit 0 (nessun riavvio).
if [ "$SOLO_MEMORIA" = 1 ]; then
  echo "[$(ts)] watch-main: erano solo file di memoria — codice invariato, NON riavvio il worker."
  segnale "ok" "solo memoria allineata (${REMOTE_SHA:0:7}) — nessun riavvio"
  exit 0
fi
if [ -n "${WATCH_MAIN_FROM_ROOT:-}" ]; then
  exit 2
fi
echo "[$(ts)]   Riavvio worker (root): sudo systemctl restart mycity-worker"
exit 0
