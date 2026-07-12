#!/usr/bin/env bash
# collega-cursor.sh — configura Cursor CLI sul VPS headless e riavvia i worker.
#
# Su VPS senza browser, agent login spesso NON persiste: il metodo affidabile è la
# User API Key (cursor.com/dashboard → API Keys). NON usare Admin API Keys.
#
# Uso:
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/collega-cursor.sh
#   sudo bash .../collega-cursor.sh --api-key key_xxxxxxxx
#   CURSOR_API_KEY=key_xxx sudo bash .../collega-cursor.sh
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M:%S'; }

REPO="${REPO:-/opt/mycity/ad-mycity}"
APP_USER="${APP_USER:-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
API_KEY_ARG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --api-key) API_KEY_ARG="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Uso: sudo bash collega-cursor.sh [--api-key key_...]"
      echo "Configura CERVELLO_MOTORE=cursor + CURSOR_API_KEY nel .env, verifica auth, riavvia worker."
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
echo " MyCity — Collega Cursor (VPS headless) · $(ts)"
echo "═══════════════════════════════════════════════════════════"

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ Manca $ENV_FILE — esegui prima setup.sh" >&2
  exit 1
fi

# Installa agent se assente
if ! sudo -u "$APP_USER" -H bash -lc 'export PATH="$HOME/.local/bin:$PATH"; command -v agent' >/dev/null 2>&1; then
  echo "▶ Installo Cursor CLI (agent) per $APP_USER…"
  sudo -u "$APP_USER" -H bash -lc 'curl https://cursor.com/install -fsS | bash' || {
    echo "✗ Installazione agent fallita." >&2
    exit 1
  }
fi

VER="$(sudo -u "$APP_USER" -H bash -lc 'export PATH="$HOME/.local/bin:$PATH"; agent --version 2>/dev/null || echo ?')"
echo "✓ agent installato: $VER"

# Imposta CERVELLO_MOTORE=cursor nel .env
if grep -q '^CERVELLO_MOTORE=' "$ENV_FILE" 2>/dev/null; then
  sed -i 's/^CERVELLO_MOTORE=.*/CERVELLO_MOTORE=cursor/' "$ENV_FILE"
else
  echo 'CERVELLO_MOTORE=cursor' >> "$ENV_FILE"
fi

# API key: argomento > env > prompt
NEW_KEY="${API_KEY_ARG:-${CURSOR_API_KEY:-}}"
if [ -z "$NEW_KEY" ]; then
  echo
  echo "Incolla la User API Key di Cursor (cursor.com/dashboard → API Keys)."
  echo "Deve iniziare con key_ — NON usare Admin API Keys."
  read -r -p "CURSOR_API_KEY: " NEW_KEY
fi

if [ -z "$NEW_KEY" ]; then
  echo "✗ Nessuna API key fornita. Senza key su VPS headless il worker non parte." >&2
  echo "  Alternativa fragile: sudo -u $APP_USER -H bash -lc 'NO_OPEN_BROWSER=1 agent login'" >&2
  exit 1
fi

case "$NEW_KEY" in
  key_*|cur_*|crsr_*) ;;
  *)
    echo "⚠ La key non ha il prefisso atteso (key_/cur_/crsr_). Se è una Admin key, NON funzionerà." >&2
    ;;
esac

if grep -q '^CURSOR_API_KEY=' "$ENV_FILE" 2>/dev/null; then
  sed -i "s|^CURSOR_API_KEY=.*|CURSOR_API_KEY=$NEW_KEY|" "$ENV_FILE"
else
  echo "CURSOR_API_KEY=$NEW_KEY" >> "$ENV_FILE"
fi
chown "$APP_USER:$APP_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "✓ .env aggiornato (CERVELLO_MOTORE=cursor + CURSOR_API_KEY)"

# Verifica autenticazione reale (non solo riga nel file)
echo "▶ Verifica autenticazione Cursor…"
if ! sudo -u "$APP_USER" -H bash -lc "
  set -a; source '$ENV_FILE'; set +a
  export PATH=\"\$HOME/.local/bin:\$PATH\"
  . '$REPO/cervello/motore-ai.sh'
  ai_check
" 2>&1; then
  echo
  echo "✗ Autenticazione fallita. Controlla:" >&2
  echo "  1) User API Key (non Admin) da cursor.com/dashboard → API Keys" >&2
  echo "  2) Rete VPS → curl -sI https://api2.cursor.sh | head -3" >&2
  echo "  3) agent --api-key \"\$KEY\" status (come utente mycity)" >&2
  exit 1
fi

echo "▶ Test risposta motore (max 90s)…"
if ! sudo -u "$APP_USER" -H bash "$REPO/cervello/vps/test-agent.sh"; then
  echo "✗ test-agent.sh fallito — vedi messaggio sopra." >&2
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
echo " FATTO. Scrivi qualcosa in chat nel Pannello per verificare."
echo "═══════════════════════════════════════════════════════════"
