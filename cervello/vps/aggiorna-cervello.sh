#!/usr/bin/env bash
# aggiorna-cervello.sh — allinea il CODICE da main sul VPS e riavvia il worker.
# Il worker gira come utente «mycity»: i comandi git DEVONO essere di mycity, mai di root.
#
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M'; }

REPO="${REPO:-/opt/mycity/ad-mycity}"
APP_USER="${APP_USER:-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"

if [ "$(id -un)" = "root" ]; then
  echo "[$(ts)] ▶ Fix permessi repo → $APP_USER, poi allineamento senza root."
  chown -R "$APP_USER:$APP_USER" "$REPO"
  AGGIORNA_SKIP_RESTART=1 sudo -u "$APP_USER" -H bash "$REPO/cervello/vps/aggiorna-cervello.sh"
  echo "[$(ts)] ▶ Riavvio mycity-worker..."
  systemctl restart mycity-worker
  sleep 2
  if systemctl is-active --quiet mycity-worker; then
    echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
  else
    echo "[$(ts)] ✗ Worker non partito — journalctl -u mycity-worker -n 30" >&2
    exit 1
  fi
  exit 0
fi

cd "$REPO"
[ -f "$ENV_FILE" ] && set -a && . "$ENV_FILE" && set +a

branch="${GIT_BRANCH:-memoria-ad}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity VPS}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN e GIT_REPO obbligatori nel .env" >&2
  exit 1
fi

# Verifica permessi .git (errore tipico: aggiornamenti fatti come root).
if ! test -w "$REPO/.git/config" 2>/dev/null; then
  echo "[$(ts)] ERRORE: .git/config non scrivibile da $(id -un)." >&2
  echo "  Esegui come root: sudo chown -R $APP_USER:$APP_USER $REPO" >&2
  exit 1
fi

url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"

echo "[$(ts)] ▶ Allineamento codice da main (vault intatto) come $(id -un)..."
exec 9>"$LOCK"
flock -w 120 9

if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  git add -A 2>/dev/null || true
  git "${GIT_ID[@]}" commit -q -m "recupero: scritture pendenti ($(ts))" 2>/dev/null || true
  git push "$url" "HEAD:${branch}" 2>/dev/null && echo "[$(ts)] Recuperate scritture vault pendenti." || true
fi

git fetch "$url" "$branch" 2>/dev/null \
  && git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null \
  || git checkout -f -B "$branch" 2>/dev/null || true

git fetch "$url" main 2>/dev/null
code_paths=()
while IFS= read -r p; do
  case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
done < <(git ls-tree --name-only FETCH_HEAD)
if [ "${#code_paths[@]}" -gt 0 ]; then
  git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null || true
  git "${GIT_ID[@]}" commit -q -m "aggiorna-cervello: allinea codice a main ($(ts))" 2>/dev/null || true
  echo "[$(ts)] Codice allineato a origin/main."
fi

git fetch "$url" "$branch" 2>/dev/null || true
_ahead="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
if [ "${_ahead:-0}" -gt 0 ] 2>/dev/null; then
  echo "[$(ts)] ▶ Push di ${_ahead} commit su origin/${branch}..."
  _ok=0
  for _a in 1 2 3; do
    git fetch "$url" "$branch" 2>/dev/null \
      && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
    if git push "$url" "HEAD:${branch}" 2>/dev/null; then
      echo "[$(ts)] ✓ Memoria/codice pubblicati su GitHub (ramo ${branch})."
      _ok=1; break
    fi
    sleep 3
  done
  [ "$_ok" = 1 ] || echo "[$(ts)] ✗ Push fallito — controlla GIT_PUSH_TOKEN." >&2
fi

exec 9>&-

_rev="$(git log -1 --format=%h -- cervello/worker.sh 2>/dev/null || echo "?")"
if grep -q 'bash "\$SCRIPT_DIR/giro.sh"' cervello/worker.sh 2>/dev/null; then
  echo "[$(ts)] Pipeline worker: giro-pipeline-v2 (rev $_rev) ✓"
else
  echo "[$(ts)] WARN: worker ancora legacy?" >&2
fi
if grep -q '\--trust' cervello/motore-ai.sh 2>/dev/null; then
  echo "[$(ts)] motore-ai: --trust presente ✓"
else
  echo "[$(ts)] WARN: motore-ai senza --trust." >&2
fi

# Riavvio worker (serve root).
if [ -n "${AGGIORNA_SKIP_RESTART:-}" ]; then
  echo "[$(ts)] ✓ Allineamento completato (restart saltato)."
  exit 0
fi

if command -v systemctl >/dev/null 2>&1 && systemctl is-enabled mycity-worker >/dev/null 2>&1; then
  if [ "$(id -un)" != "root" ]; then
    echo "[$(ts)] ▶ Riavvio mycity-worker (serve root)..."
    sudo systemctl restart mycity-worker
  else
    systemctl restart mycity-worker
  fi
  sleep 2
  if systemctl is-active --quiet mycity-worker; then
    echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
  else
    echo "[$(ts)] ✗ Worker non partito — journalctl -u mycity-worker -n 30" >&2
    exit 1
  fi
else
  echo "[$(ts)] ✓ Allineamento completato."
fi
