#!/usr/bin/env bash
# ritmo-systemd.sh — wrapper per i timer systemd (stesso ambiente del test manuale).
# systemd EnvironmentFile può alterare valori con $ — qui ricarichiamo .env come fa il worker.
set -uo pipefail

TIPO="${1:-}"
case "$TIPO" in mattino|sera|settimana) ;; *)
  echo "Uso: ritmo-systemd.sh {mattino|sera|settimana}" >&2
  exit 1
  ;;
esac

REPO="${REPO:-/opt/mycity/ad-mycity}"
ENV_FILE="$REPO/cervello/vps/.env"
export TZ="${TZ:-Europe/Rome}"
export HOME="${HOME:-/home/mycity}"
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac

if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

ts() { date '+%Y-%m-%d %H:%M'; }
echo "[$(ts)] ritmo-systemd: avvio $TIPO (user=$(id -un), home=$HOME)" >&2
if [ -n "${CURSOR_API_KEY:-}" ]; then
  echo "[$(ts)] CURSOR_API_KEY: ${CURSOR_API_KEY:0:8}… (${#CURSOR_API_KEY} caratteri)" >&2
else
  echo "[$(ts)] WARN: CURSOR_API_KEY non impostata dopo source .env" >&2
fi

exec bash "$REPO/cervello/ritmo.sh" "$TIPO"
