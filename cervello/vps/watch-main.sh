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
  WATCH_MAIN_FROM_ROOT=1 sudo -u "$APP_USER" -H env WATCH_MAIN_FROM_ROOT=1 bash "$REPO/cervello/vps/watch-main.sh" "$@"
  rc=$?
  if [ "$rc" -eq 2 ]; then
    echo "[$(ts)] ▶ Riavvio mycity-worker..."
    systemctl restart mycity-worker
    sleep 2
    systemctl is-active --quiet mycity-worker && echo "[$(ts)] ✓ Worker attivo." || echo "[$(ts)] ✗ Worker non partito." >&2
  fi
  exit "$rc"
fi

cd "$REPO"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN/GIT_REPO mancanti." >&2
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
  exit 0
fi

if [ -z "$LAST_SHA" ] && [ "$FORCE" != 1 ]; then
  echo "$REMOTE_SHA" > "$SHA_FILE"
  echo "[$(ts)] watch-main: primo avvio — memorizzato ${REMOTE_SHA:0:7} (usa --force per allineare subito)."
  exit 0
fi

echo "[$(ts)] watch-main: main avanzato ${LAST_SHA:0:7} → ${REMOTE_SHA:0:7} — allineo codice..."
AGGIORNA_SKIP_RESTART=1 bash "$REPO/cervello/vps/aggiorna-cervello.sh"
echo "$REMOTE_SHA" > "$SHA_FILE"
echo "[$(ts)] watch-main: allineamento completato."

exec 9>&-

# Exit 2 = allineamento fatto, root deve riavviare il worker.
if [ -n "${WATCH_MAIN_FROM_ROOT:-}" ]; then
  exit 2
fi
echo "[$(ts)]   Riavvio worker (root): sudo systemctl restart mycity-worker"
exit 0
