#!/usr/bin/env bash
# install-ritmo-timers.sh — Installa i timer del battito AD
# (mattino 06:00 · mezzogiorno 12:00 · sera 18:00 · settimana ven 15:00, fuso Europe/Rome).
# Da eseguire SUL VPS come root, dopo un aggiornamento del repo:
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/install-ritmo-timers.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Esegui come root: sudo bash $0" >&2
  exit 1
fi

ENV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for unit in \
  mycity-ritmo-mattino.service mycity-ritmo-mattino.timer \
  mycity-ritmo-mezzogiorno.service mycity-ritmo-mezzogiorno.timer \
  mycity-ritmo-sera.service mycity-ritmo-sera.timer \
  mycity-ritmo-settimana.service mycity-ritmo-settimana.timer \
  mycity-sentinella.service mycity-sentinella.timer
do
  cp "$ENV_DIR/$unit" "/etc/systemd/system/$unit"
  echo "  → $unit"
done

systemctl daemon-reload
systemctl enable mycity-ritmo-mattino.timer mycity-ritmo-mezzogiorno.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer mycity-sentinella.timer
systemctl start mycity-ritmo-mattino.timer mycity-ritmo-mezzogiorno.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer mycity-sentinella.timer

echo ""
echo "Timer ritmo attivi (fuso Europe/Rome):"
systemctl list-timers --no-pager | grep mycity-ritmo || true
echo ""
echo "Prova subito: sudo bash $ENV_DIR/ritmo-ora.sh mattino"
