#!/usr/bin/env bash
# setup.sh — Installa il "cervello" di MyCity su un VPS Linux (Debian/Ubuntu), ACCANTO a cio'
# che c'e' gia' (es. un trading bot spento): NON cancella nulla di esistente.
# Va eseguito come root (o con sudo). E' idempotente: puoi rilanciarlo.
#
# Cosa fa:
#   - crea l'utente di servizio 'mycity' (se manca)
#   - installa git, jq, curl, Node LTS e Claude Code (CLI 'claude')
#   - clona il repo in /opt/mycity/ad-mycity (o fa git pull se gia' c'e')
#   - prepara cervello/vps/.env da .env.example (se manca)
#   - installa e abilita le unit systemd (giro ogni 2h + worker sempre acceso)
# Poi restano 2 passi MANUALI (li stampa alla fine): 'claude login' e i segreti in .env.
set -euo pipefail

GIT_REPO="${GIT_REPO:-NicolaeRotaru/ad-mycity}"   # owner/repo (il repo e' PRIVATO)
GIT_TOKEN="${GIT_TOKEN:-${GIT_PUSH_TOKEN:-}}"     # PAT GitHub (Contents: read/write)
REPO_BRANCH="${REPO_BRANCH:-main}"
APP_USER="mycity"
APP_HOME="/home/$APP_USER"
APP_DIR="/opt/mycity/ad-mycity"

# Repo privato -> serve un token per clonare/pullare via HTTPS (la password non e' piu' accettata).
if [ -z "$GIT_TOKEN" ]; then
  echo "ERRORE: il repo $GIT_REPO e' privato: serve un Personal Access Token." >&2
  echo "Rilancia cosi':  GIT_TOKEN=il_tuo_PAT bash $0" >&2
  exit 1
fi
CLONE_URL="https://x-access-token:${GIT_TOKEN}@github.com/${GIT_REPO}.git"

if [ "$(id -u)" -ne 0 ]; then
  echo "Esegui come root:  sudo bash setup.sh" >&2
  exit 1
fi

echo "== 1) Utente di servizio '$APP_USER' =="
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd -m -d "$APP_HOME" -s /bin/bash "$APP_USER"
  echo "   creato."
else
  echo "   esiste gia'."
fi

echo "== 2) Pacchetti di base (git, jq, curl) =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git jq curl ca-certificates

echo "== 3) Node LTS =="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt-get install -y nodejs
fi
echo "   node $(node -v)"

echo "== 4) Claude Code (CLI 'claude') =="
if ! command -v claude >/dev/null 2>&1; then
  # Nome pacchetto ufficiale di Claude Code. Se cambia, vedi docs.anthropic.com/claude-code.
  npm install -g @anthropic-ai/claude-code || {
    echo "   ATTENZIONE: installazione di Claude Code fallita. Installalo a mano e rilancia." >&2
  }
fi
command -v claude >/dev/null 2>&1 && echo "   $(claude --version 2>/dev/null || echo 'claude installato')"

echo "== 5) Repo in $APP_DIR =="
mkdir -p /opt/mycity
if [ -d "$APP_DIR/.git" ]; then
  # Aggiorna il remote col token (repo privato) e pulla.
  git -C "$APP_DIR" remote set-url origin "$CLONE_URL"
  git -C "$APP_DIR" pull --ff-only || true
else
  git clone --branch "$REPO_BRANCH" "$CLONE_URL" "$APP_DIR"
fi
# Il working clone tiene il remote col token, cosi' giro.sh (pull+push del vault) funziona sul privato.
chown -R "$APP_USER":"$APP_USER" /opt/mycity
chmod -R go-rwx "$APP_DIR/.git" 2>/dev/null || true   # protegge il token nel .git/config

echo "== 6) File dei segreti (.env) =="
ENV_DIR="$APP_DIR/cervello/vps"
if [ ! -f "$ENV_DIR/.env" ]; then
  cp "$ENV_DIR/.env.example" "$ENV_DIR/.env"
  chown "$APP_USER":"$APP_USER" "$ENV_DIR/.env"
  chmod 600 "$ENV_DIR/.env"
  echo "   creato $ENV_DIR/.env (da compilare)."
else
  echo "   $ENV_DIR/.env esiste gia' (non lo tocco)."
fi

echo "== 7) Unit systemd =="
for unit in mycity-giro.service mycity-giro.timer mycity-worker.service; do
  cp "$ENV_DIR/$unit" "/etc/systemd/system/$unit"
done
systemctl daemon-reload
systemctl enable mycity-giro.timer mycity-worker.service >/dev/null 2>&1 || true
echo "   unit installate e abilitate (NON ancora avviate)."

cat <<EOF

============================================================
 QUASI FATTO. Restano 2 passi MANUALI:

 1) Collega il piano Max (login interattivo, una volta sola):
      sudo -u $APP_USER -H claude login
    (apri l'URL mostrato, incolla il codice)

 2) Inserisci i segreti:
      sudo -u $APP_USER nano $ENV_DIR/.env
    (SUPABASE memoria, GIT_PUSH_TOKEN, GIT_REPO/GIT_BRANCH)

 Poi accendi tutto:
      systemctl start mycity-worker.service
      systemctl start mycity-giro.timer
      # prova subito un giro:
      systemctl start mycity-giro.service && journalctl -u mycity-giro -n 30 --no-pager

 Per fermare tutto:  systemctl stop mycity-worker mycity-giro.timer
============================================================
EOF
