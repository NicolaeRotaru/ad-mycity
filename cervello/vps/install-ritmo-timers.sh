#!/usr/bin/env bash
# install-ritmo-timers.sh — Installa i timer del battito AD (mattino 08:00, sera 20:00, settimana ven 18:00).
# Da eseguire SUL VPS come root, dopo un aggiornamento del repo:
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/install-ritmo-timers.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Esegui come root: sudo bash $0" >&2
  exit 1
fi

ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

chmod +x "$ENV_DIR/ritmo-systemd.sh" "$ENV_DIR/ritmo-ora.sh" 2>/dev/null || true

for unit in \
  mycity-ritmo-mattino.service mycity-ritmo-mattino.timer \
  mycity-ritmo-sera.service mycity-ritmo-sera.timer \
  mycity-ritmo-settimana.service mycity-ritmo-settimana.timer
do
  cp "$ENV_DIR/$unit" "/etc/systemd/system/$unit"
  echo "  → $unit"
done

systemctl daemon-reload
systemctl enable mycity-ritmo-mattino.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer
systemctl start mycity-ritmo-mattino.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer

echo ""
echo "Timer ritmo attivi (fuso Europe/Rome):"
systemctl list-timers --no-pager | grep mycity-ritmo || true
echo ""
echo "Prova subito: sudo bash $ENV_DIR/ritmo-ora.sh mattino"
