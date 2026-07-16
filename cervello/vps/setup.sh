#!/usr/bin/env bash
# setup.sh — Installa il "cervello" di MyCity su un VPS Linux (Debian/Ubuntu), ACCANTO a cio'
# che c'e' gia' (es. un trading bot spento): NON cancella nulla di esistente.
# Va eseguito come root (o con sudo). E' idempotente: puoi rilanciarlo.
#
# Cosa fa:
#   - crea l'utente di servizio 'mycity' (se manca)
#   - installa git, jq, curl, Node LTS e il MOTORE AI (Claude Code 'claude' di default, o Cursor CLI 'agent')
#   - clona il repo in /opt/mycity/ad-mycity (o fa git pull se gia' c'e')
#   - prepara cervello/vps/.env da .env.example (se manca)
#   - installa e abilita le unit systemd (giro ogni 2h + worker sempre acceso)
# Motore: CERVELLO_MOTORE=claude (default) | cursor. Es:  CERVELLO_MOTORE=cursor GIT_TOKEN=... bash setup.sh
# (Allineato a motore-ai.sh: Claude è il motore principale — decisione Nicola 2026-07-10.)
# Poi restano 2 passi MANUALI (li stampa alla fine): la chiave del motore e i segreti in .env.
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

echo "== 4) Motore AI =="
# Motore di default: Claude Code ('claude'). CERVELLO_MOTORE=cursor per usare Cursor CLI ('agent').
MOTORE="${CERVELLO_MOTORE:-claude}"
if [ "$MOTORE" = "cursor" ]; then
  echo "   Motore scelto: Cursor CLI ('agent')."
  if ! command -v agent >/dev/null 2>&1; then
    # Installer ufficiale Cursor CLI (vedi cursor.com/docs/cli). Installa nel profilo dell'utente che lo lancia.
    sudo -u "$APP_USER" -H bash -lc 'curl https://cursor.com/install -fsS | bash' || {
      echo "   ATTENZIONE: installazione di Cursor CLI fallita. Installala a mano (curl https://cursor.com/install -fsS | bash) e rilancia." >&2
    }
  fi
  sudo -u "$APP_USER" -H bash -lc 'command -v agent >/dev/null 2>&1 && echo "   $(agent --version 2>/dev/null || echo "agent installato")"' || true
else
  echo "   Motore scelto: Claude Code ('claude')."
  if ! command -v claude >/dev/null 2>&1; then
    # Nome pacchetto ufficiale di Claude Code. Se cambia, vedi docs.anthropic.com/claude-code.
    npm install -g @anthropic-ai/claude-code || {
      echo "   ATTENZIONE: installazione di Claude Code fallita. Installalo a mano e rilancia." >&2
    }
  fi
  command -v claude >/dev/null 2>&1 && echo "   $(claude --version 2>/dev/null || echo 'claude installato')"
fi

echo "== 5) Repo in $APP_DIR =="
mkdir -p /opt/mycity
if [ -d "$APP_DIR/.git" ]; then
  # Aggiorna il remote col token (repo privato) e riallinea il CODICE a origin/$REPO_BRANCH (di solito main).
  # RAMO UNICO (Fase 2): codice e memoria vivono entrambi su 'main'; il giro committa/pusha con
  # rebase non-force sotto lock, quindi il riallineamento non perde il vault. Niente '|| true' muto: logghiamo.
  git -C "$APP_DIR" remote set-url origin "$CLONE_URL"
  if git -C "$APP_DIR" fetch origin "$REPO_BRANCH" 2>/dev/null \
     && git -C "$APP_DIR" checkout -f "$REPO_BRANCH" 2>/dev/null \
     && git -C "$APP_DIR" reset --hard "origin/$REPO_BRANCH" 2>/dev/null; then
    echo "   codice aggiornato a origin/$REPO_BRANCH"
  else
    echo "   WARN: aggiornamento del codice fallito (controlla rete/token/permessi)." >&2
  fi
else
  git clone --branch "$REPO_BRANCH" "$CLONE_URL" "$APP_DIR"
fi
# Il working clone tiene il remote col token, cosi' giro.sh (pull+push del vault) funziona sul privato.
chown -R "$APP_USER":"$APP_USER" /opt/mycity
chmod -R go-rwx "$APP_DIR/.git" 2>/dev/null || true   # protegge il token nel .git/config

# AR-004: perimetro segreti ATTIVO — attiva il pre-commit hook versionato (.githooks/) su questo clone,
# così ogni commit (anche manuale) passa dallo scan-segreti prima di entrare nella storia.
sudo -u "$APP_USER" git -C "$APP_DIR" config core.hooksPath .githooks 2>/dev/null || true
chmod +x "$APP_DIR/.githooks/"* 2>/dev/null || true

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

echo "== 7) Codice del marketplace (per radiografia/audit/tech) =="
# Scarica una COPIA in SOLA LETTURA del repo del marketplace, così l'AD può analizzarlo.
# Best-effort: se fallisce (rete/repo), il setup continua comunque.
MKT_DIR="$(grep -E '^MARKETPLACE_REPO=' "$ENV_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2-)"
MKT_DIR="${MKT_DIR:-/opt/mycity/marketplace}"
if sudo -u "$APP_USER" env \
     MARKETPLACE_REPO="$MKT_DIR" \
     MARKETPLACE_GIT_REPO="$(grep -E '^MARKETPLACE_GIT_REPO=' "$ENV_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2-)" \
     MARKETPLACE_BRANCH="$(grep -E '^MARKETPLACE_BRANCH=' "$ENV_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2-)" \
     node "$APP_DIR/cervello/collega-marketplace.mjs"; then
  echo "   marketplace collegato in $MKT_DIR"
else
  echo "   WARN: collegamento del marketplace fallito (riprova: node cervello/collega-marketplace.mjs)." >&2
fi

echo "== 8) Unit systemd =="
for unit in mycity-giro.service mycity-giro.timer mycity-worker.service mycity-monitora.service mycity-monitora.timer; do
  cp "$ENV_DIR/$unit" "/etc/systemd/system/$unit"
done
systemctl daemon-reload
systemctl enable mycity-giro.timer mycity-worker.service mycity-monitora.timer >/dev/null 2>&1 || true
echo "   unit installate e abilitate (NON ancora avviate): giro (2h) + worker + monitoraggio web (giornaliero)."
echo "   Per il battito quotidiano (mattino/sera/settimana): sudo bash $ENV_DIR/install-ritmo-timers.sh"

cat <<EOF

============================================================
 QUASI FATTO. Restano 2 passi MANUALI:

 1) Collega il motore AI:
    • Claude (default) — un comando fa tutto (token headless + verifica + riavvio worker):
        sudo bash $APP_DIR/cervello/vps/collega-claude.sh
      (il token si genera con 'claude setup-token' da una macchina dove sei già loggato;
       in alternativa login interattivo una volta: sudo -u $APP_USER -H claude login)
    • Cursor (se CERVELLO_MOTORE=cursor):
        sudo bash $APP_DIR/cervello/vps/collega-cursor.sh
      (chiave User API da cursor.com/dashboard → API Keys)

 2) Inserisci i segreti:
      sudo -u $APP_USER nano $ENV_DIR/.env
    (CLAUDE_CODE_OAUTH_TOKEN o CURSOR_API_KEY, SUPABASE memoria, GIT_PUSH_TOKEN, GIT_REPO/GIT_BRANCH)

 Poi accendi tutto:
      systemctl start mycity-worker.service
      systemctl start mycity-giro.timer
      systemctl start mycity-monitora.timer    # monitoraggio web continuo (Ondata 3, giornaliero 06:30)
      # prova subito un giro e un monitoraggio:
      systemctl start mycity-giro.service && journalctl -u mycity-giro -n 30 --no-pager
      systemctl start mycity-monitora.service && journalctl -u mycity-monitora -n 30 --no-pager

 Per fermare tutto:  systemctl stop mycity-worker mycity-giro.timer mycity-monitora.timer
============================================================
EOF
