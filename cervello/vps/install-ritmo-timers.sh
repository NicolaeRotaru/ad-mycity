#!/usr/bin/env bash
# install-ritmo-timers.sh — copia e abilita i timer systemd del ritmo AD (root sul VPS).
# Uso: sudo bash /opt/mycity/ad-mycity/cervello/vps/install-ritmo-timers.sh
set -euo pipefail

REPO="${REPO:-/opt/mycity/ad-mycity}"
VPS_DIR="$REPO/cervello/vps"

if [ "$(id -un)" != "root" ]; then
  echo "Esegui come root: sudo bash $0" >&2
  exit 1
fi

chmod +x "$REPO/cervello/ritmo-run.sh" "$VPS_DIR/ritmo-ora.sh"

for unit in mycity-ritmo-mattino.service mycity-ritmo-mattino.timer \
  mycity-ritmo-sera.service mycity-ritmo-sera.timer \
  mycity-ritmo-settimana.service mycity-ritmo-settimana.timer; do
  cp "$VPS_DIR/$unit" "/etc/systemd/system/$unit"
done

systemctl daemon-reload
systemctl enable mycity-ritmo-mattino.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer
systemctl start mycity-ritmo-mattino.timer mycity-ritmo-sera.timer mycity-ritmo-settimana.timer

echo "✓ Timer ritmo attivi:"
systemctl list-timers | grep mycity-ritmo || true
