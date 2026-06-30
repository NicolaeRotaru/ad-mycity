#!/usr/bin/env bash
# aggiorna-cervello.sh — allinea il CODICE da main sul VPS e riavvia il worker.
# NON tocca il vault (memoria-ad). Esegui come root dopo merge su main o se la Diagnosi
# mostra pipeline «legacy-agent-direct» o push memoria-ad assente.
#
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M'; }

REPO="${REPO:-/opt/mycity/ad-mycity}"
cd "$REPO"

ENV_FILE="$REPO/cervello/vps/.env"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

branch="${GIT_BRANCH:-memoria-ad}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-ad@mycity.local}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-AD MyCity VPS}"
GIT_ID=(-c user.email="$GIT_AUTHOR_EMAIL" -c user.name="$GIT_AUTHOR_NAME")
LOCK="$REPO/.git/mycity-sync.lock"
MEM_DIRS=(MyCity-Vault consegne creativi memoria-squadra)

if [ -z "${GIT_PUSH_TOKEN:-}" ] || [ -z "${GIT_REPO:-}" ]; then
  echo "[$(ts)] ERRORE: GIT_PUSH_TOKEN e GIT_REPO obbligatori nel .env" >&2
  exit 1
fi

url="https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${GIT_REPO}.git"

echo "[$(ts)] ▶ Allineamento codice da main (vault intatto)..."
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

exec 9>&-

_rev="$(git log -1 --format=%h -- cervello/worker.sh 2>/dev/null || echo "?")"
if grep -q 'bash "\$SCRIPT_DIR/giro.sh"' cervello/worker.sh 2>/dev/null; then
  echo "[$(ts)] Pipeline worker: giro-pipeline-v2 (rev $_rev) ✓"
else
  echo "[$(ts)] WARN: worker ancora legacy — fetch main fallito?" >&2
fi

echo "[$(ts)] ▶ Riavvio mycity-worker..."
systemctl restart mycity-worker
sleep 2
if systemctl is-active --quiet mycity-worker; then
  echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
else
  echo "[$(ts)] ✗ Worker non partito — controlla: journalctl -u mycity-worker -n 30" >&2
  exit 1
fi
