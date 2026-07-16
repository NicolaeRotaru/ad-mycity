#!/usr/bin/env bash
# collega-claude.sh — configura Claude Code sul VPS headless e riavvia i worker.
# (Gemello di collega-cursor.sh — fix parity motore 2026-07-16.)
#
# Su VPS senza browser il metodo affidabile è il TOKEN HEADLESS: da una macchina qualsiasi
# dove sei loggato (anche il tuo PC) lancia `claude setup-token`, copia il token sk-ant-oat...
# e incollalo qui. In alternativa: ANTHROPIC_API_KEY (a consumo) o `claude login` interattivo.
#
# Uso:
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/collega-claude.sh
#   sudo bash .../collega-claude.sh --token sk-ant-oat...
#   sudo bash .../collega-claude.sh --api-key sk-ant-api...
#   CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat... sudo bash .../collega-claude.sh
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

REPO="${REPO:-/opt/mycity/ad-mycity}"
APP_USER="${APP_USER:-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
TOKEN_ARG=""
API_KEY_ARG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --token) TOKEN_ARG="${2:-}"; shift 2 ;;
    --api-key) API_KEY_ARG="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Uso: sudo bash collega-claude.sh [--token sk-ant-oat...] [--api-key sk-ant-api...]"
      echo "Configura CERVELLO_MOTORE=claude + credenziali nel .env, verifica auth, riavvia worker."
      exit 0
      ;;
    *) echo "Argomento sconosciuto: $1" >&2; exit 1 ;;
  esac
done

if [ "$(id -u)" -ne 0 ]; then
  echo "Esegui come root: sudo bash $0" >&2
  exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo " MyCity — Collega Claude Code (VPS headless) · $(ts)"
echo "═══════════════════════════════════════════════════════════"

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ Manca $ENV_FILE — esegui prima setup.sh" >&2
  exit 1
fi

# Installa claude se assente (pacchetto ufficiale, globale come in setup.sh)
if ! command -v claude >/dev/null 2>&1; then
  echo "▶ Installo Claude Code (npm -g @anthropic-ai/claude-code)…"
  npm install -g @anthropic-ai/claude-code || {
    echo "✗ Installazione Claude Code fallita. Vedi docs.anthropic.com/claude-code." >&2
    exit 1
  }
fi
echo "✓ claude installato: $(claude --version 2>/dev/null || echo '?')"

# Imposta CERVELLO_MOTORE=claude nel .env
if grep -q '^CERVELLO_MOTORE=' "$ENV_FILE" 2>/dev/null; then
  sed -i 's/^CERVELLO_MOTORE=.*/CERVELLO_MOTORE=claude/' "$ENV_FILE"
else
  echo 'CERVELLO_MOTORE=claude' >> "$ENV_FILE"
fi

# Credenziale: argomenti > env > credenziali login già sul disco > prompt
NEW_TOKEN="${TOKEN_ARG:-${CLAUDE_CODE_OAUTH_TOKEN:-}}"
NEW_API_KEY="${API_KEY_ARG:-}"
HA_LOGIN=0
CRED_FILE="$(sudo -u "$APP_USER" -H bash -lc 'echo "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.credentials.json"')"
if sudo -u "$APP_USER" -H bash -lc "[ -f '$CRED_FILE' ]"; then HA_LOGIN=1; fi

if [ -z "$NEW_TOKEN" ] && [ -z "$NEW_API_KEY" ] && [ "$HA_LOGIN" = 0 ]; then
  echo
  echo "Incolla il token headless di Claude (consigliato per VPS)."
  echo "Si genera con:  claude setup-token   (da una macchina dove sei già loggato, anche il PC)."
  echo "Deve iniziare con sk-ant-oat. [Invio vuoto = annulla]"
  read -r -p "CLAUDE_CODE_OAUTH_TOKEN: " NEW_TOKEN
fi

if [ -z "$NEW_TOKEN" ] && [ -z "$NEW_API_KEY" ] && [ "$HA_LOGIN" = 0 ]; then
  echo "✗ Nessuna credenziale fornita e nessun claude login sul disco." >&2
  echo "  Alternativa interattiva (una volta): sudo -u $APP_USER -H claude login" >&2
  echo "  Poi rilancia questo script per la verifica e il riavvio dei worker." >&2
  exit 1
fi

if [ -n "$NEW_TOKEN" ]; then
  case "$NEW_TOKEN" in
    sk-ant-oat*) ;;
    sk-ant-api*)
      echo "⚠ Questo sembra una API key (sk-ant-api), non un token setup-token: la salvo come ANTHROPIC_API_KEY." >&2
      NEW_API_KEY="$NEW_TOKEN"; NEW_TOKEN=""
      ;;
    *) echo "⚠ Il token non ha il prefisso atteso (sk-ant-oat). Provo comunque." >&2 ;;
  esac
fi

_scrivi_env() { # $1 = CHIAVE, $2 = valore
  if grep -q "^$1=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"
  else
    echo "$1=$2" >> "$ENV_FILE"
  fi
}
[ -n "$NEW_TOKEN" ] && _scrivi_env CLAUDE_CODE_OAUTH_TOKEN "$NEW_TOKEN"
[ -n "$NEW_API_KEY" ] && _scrivi_env ANTHROPIC_API_KEY "$NEW_API_KEY"
chown "$APP_USER:$APP_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"
if [ -n "$NEW_TOKEN$NEW_API_KEY" ]; then
  echo "✓ .env aggiornato (CERVELLO_MOTORE=claude + credenziale headless)"
else
  echo "✓ .env aggiornato (CERVELLO_MOTORE=claude — uso il claude login già presente sul disco)"
fi

# Verifica preflight (stesso ai_check del worker: motore + credenziali presenti)
echo "▶ Verifica autenticazione Claude…"
if ! sudo -u "$APP_USER" -H bash -lc "
  set -a; source '$ENV_FILE'; set +a
  export PATH=\"\$HOME/.local/bin:\$PATH\"
  . '$REPO/cervello/motore-ai.sh'
  ai_check
" 2>&1; then
  echo
  echo "✗ Preflight fallito. Controlla:" >&2
  echo "  1) Token generato con 'claude setup-token' (sk-ant-oat...), non scaduto" >&2
  echo "  2) In alternativa: sudo -u $APP_USER -H claude login" >&2
  exit 1
fi

echo "▶ Test risposta motore (max 90s)…"
if ! sudo -u "$APP_USER" -H bash "$REPO/cervello/vps/test-agent.sh"; then
  echo "✗ test-agent.sh fallito — vedi messaggio sopra (token scaduto? quota?)." >&2
  exit 1
fi

echo "▶ Riavvio worker…"
for svc in mycity-worker mycity-worker-chat; do
  if systemctl list-unit-files "$svc.service" >/dev/null 2>&1; then
    systemctl restart "$svc" || true
  fi
done
sleep 3

if systemctl is-active --quiet mycity-worker 2>/dev/null; then
  echo "✓ mycity-worker active (running)"
else
  echo "⚠ mycity-worker non active — controlla: journalctl -u mycity-worker -n 30 --no-pager" >&2
fi

echo
echo "═══════════════════════════════════════════════════════════"
echo " FATTO. Nei log deve comparire: Motore AI: claude (claude)."
echo " Scrivi qualcosa in chat nel Pannello per verificare."
echo "═══════════════════════════════════════════════════════════"
