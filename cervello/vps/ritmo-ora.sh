#!/usr/bin/env bash
# ritmo-ora.sh — Lancia SUBITO una cadenza del ritmo (mattino | sera | settimana).
# Da eseguire SUL VPS (Linux), come root:
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/ritmo-ora.sh mattino
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/ritmo-ora.sh sera
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/ritmo-ora.sh settimana
set -euo pipefail

TIPO="${1:-}"
case "$TIPO" in
  mattino) UNIT=mycity-ritmo-mattino ;;
  sera) UNIT=mycity-ritmo-sera ;;
  settimana) UNIT=mycity-ritmo-settimana ;;
  *)
    echo "Uso: ritmo-ora.sh {mattino|sera|settimana}" >&2
    exit 1
    ;;
esac

ts() { date '+%Y-%m-%d %H:%M'; }

echo "[$(ts)] ▶ Ritmo $TIPO avviato. Log (Ctrl-C per uscire):"
systemctl start --no-block "${UNIT}.service"
exec journalctl -u "$UNIT" -f
