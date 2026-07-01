#!/usr/bin/env bash
# ritmo-ora.sh — lancia subito una cadenza del ritmo AD e segue i log.
# Uso: sudo bash cervello/vps/ritmo-ora.sh [mattino|sera|settimana]
set -euo pipefail

CADENZA="${1:-mattino}"
case "$CADENZA" in
  mattino|sera|settimana) ;;
  *) echo "Uso: $0 mattino|sera|settimana" >&2; exit 2 ;;
esac

systemctl start --no-block "mycity-ritmo-${CADENZA}.service"
echo "▶ Ritmo $CADENZA avviato. Log (Ctrl-C per uscire):"
exec journalctl -u "mycity-ritmo-${CADENZA}" -f
