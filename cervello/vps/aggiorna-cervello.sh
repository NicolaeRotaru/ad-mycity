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
  AGGIORNA_SKIP_RESTART=1 sudo -u "$APP_USER" -H env AGGIORNA_SKIP_RESTART=1 bash "$REPO/cervello/vps/aggiorna-cervello.sh"

  # AR-059: le unit systemd sono auto-modificabili come il codice → dopo l'allineamento
  # ri-propaga i file .service/.timer che differiscono da quelli installati e fai
  # 'systemctl daemon-reload', così i cambi di cadenza / nuovi timer diventano attivi
  # (senza reload systemd continua a leggere le vecchie unit). Solo root può scriverli.
  _units_changed=0
  for _u in "$REPO"/cervello/vps/mycity-*.service "$REPO"/cervello/vps/mycity-*.timer; do
    [ -f "$_u" ] || continue
    _name="$(basename "$_u")"
    if ! cmp -s "$_u" "/etc/systemd/system/$_name" 2>/dev/null; then
      cp "$_u" "/etc/systemd/system/$_name"
      echo "[$(ts)]   → unit aggiornata: $_name"
      _units_changed=1
    fi
  done
  if [ "$_units_changed" = 1 ]; then
    systemctl daemon-reload
    echo "[$(ts)] 🔧 Unit systemd ri-propagate + daemon-reload (cadenze aggiornate)."
  fi

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
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-98592323+NicolaeRotaru@users.noreply.github.com}"
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
fi

# Commit locali già fatti ma non pushati: pubblicali PRIMA del checkout -f (altrimenti si perdono).
if [ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "$branch" ]; then
  git fetch "$url" "$branch" 2>/dev/null || true
  _ahead_pre="$(git rev-list --count "FETCH_HEAD..HEAD" 2>/dev/null || echo 0)"
  if [ "${_ahead_pre:-0}" -gt 0 ] 2>/dev/null; then
    echo "[$(ts)] ▶ Push di ${_ahead_pre} commit pendenti su origin/${branch} (prima dell'allineamento)..."
    _ok_pre=0
    for _a in 1 2 3; do
      git fetch "$url" "$branch" 2>/dev/null \
        && { git "${GIT_ID[@]}" rebase FETCH_HEAD 2>/dev/null || git rebase --abort 2>/dev/null || true; }
      if git push "$url" "HEAD:${branch}" 2>&1; then
        echo "[$(ts)] ✓ Commit pendenti pubblicati su GitHub."
        _ok_pre=1; break
      fi
      sleep 3
    done
    [ "$_ok_pre" = 1 ] || echo "[$(ts)] ✗ Push commit pendenti fallito — controlla GIT_PUSH_TOKEN." >&2
  fi
fi

git fetch "$url" "$branch" 2>/dev/null \
  && git checkout -f -B "$branch" FETCH_HEAD 2>/dev/null \
  || git checkout -f -B "$branch" 2>/dev/null || true

# Fetch di main NON silenziato: se fallisce, FETCH_HEAD resterebbe quello di $branch (riga sopra)
# e l'"allineamento" diventerebbe un no-op silenzioso (allinea memoria-ad a se stesso). Fermiamoci.
if ! git fetch "$url" main; then
  echo "[$(ts)] ✗ ERRORE: git fetch main fallito — allineamento codice SALTATO (evito no-op silenzioso). Controlla rete/GIT_PUSH_TOKEN." >&2
else
  code_paths=()
  while IFS= read -r p; do
    case "$p" in MyCity-Vault|consegne|creativi|memoria-squadra) ;; *) code_paths+=("$p") ;; esac
  done < <(git ls-tree --name-only FETCH_HEAD)
  if [ "${#code_paths[@]}" -gt 0 ]; then
    # 1) Porta da main aggiunte + modifiche dei path di CODICE.
    git checkout FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null || true
    # 2) Propaga le CANCELLAZIONI: git checkout NON rimuove i file che main ha eliminato
    #    (es. cervello/vps/.env.save di AR-004) → restavano vivi sul ramo che serve il Pannello.
    #    Rimuoviamo esplicitamente i file presenti qui (HEAD) ma assenti su main (FETCH_HEAD).
    while IFS= read -r f; do
      [ -n "$f" ] && git rm -q -f --ignore-unmatch -- "$f" 2>/dev/null || true
    done < <(git diff --name-only --diff-filter=D HEAD FETCH_HEAD -- "${code_paths[@]}" 2>/dev/null)
    git "${GIT_ID[@]}" commit -q -m "aggiorna-cervello: allinea codice a main ($(ts))" 2>/dev/null || true
    echo "[$(ts)] Codice allineato a origin/main (incluse cancellazioni)."
  fi
fi

# AR-023: RICONCILIA IL CANTIERE appena il codice è allineato a main. È il percorso "immediato": watch-main
# rileva main avanzato (≈5 min), qui allineiamo il codice E chiudiamo i difetti il cui fix è ORA presente
# (prova verifica:{file,pattern}). La chiusura viene committata e pubblicata su memoria-ad dal push qui sotto
# → il Pannello non mostra più "in-corso" un fix già mergiato. Sola lettura del codice + bookkeeping memoria.
if command -v node >/dev/null 2>&1; then
  node cervello/auto-fix.mjs verifica --applica 2>&1 | tail -6 || true
  ac="MyCity-Vault/90-Memoria-AI/auto-coscienza"
  if [ -n "$(git status --porcelain "$ac" 2>/dev/null)" ]; then
    git add "$ac" 2>/dev/null || true
    git "${GIT_ID[@]}" commit -q -m "riconcilia: chiude difetti risolti nel codice ($(ts))" 2>/dev/null || true
    echo "[$(ts)] 🔧 Riconciliazione cantiere: difetti verificati chiusi (verranno pubblicati su ${branch})."
  fi
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

# Riavvio worker: solo root (mycity non ha sudo).
if [ -n "${AGGIORNA_SKIP_RESTART:-}" ]; then
  echo "[$(ts)] ✓ Allineamento completato."
  exit 0
fi

if [ "$(id -un)" != "root" ]; then
  echo "[$(ts)] ✓ Allineamento completato." >&2
  echo "[$(ts)]   Riavvio worker (come root): sudo systemctl restart mycity-worker" >&2
  exit 0
fi

echo "[$(ts)] ▶ Riavvio mycity-worker..."
systemctl restart mycity-worker
sleep 2
if systemctl is-active --quiet mycity-worker; then
  echo "[$(ts)] ✓ Worker attivo. Lancia «fai un giro» dal Pannello."
else
  echo "[$(ts)] ✗ Worker non partito — journalctl -u mycity-worker -n 30" >&2
  exit 1
fi
