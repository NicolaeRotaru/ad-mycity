#!/usr/bin/env bash
# install-sync-vps.sh — Abilita sync VPS automatico post-merge (sudo NOPASSWD per mycity).
# Esegui SUL VPS come root, una tantum:
#   sudo bash /opt/mycity/ad-mycity/cervello/vps/install-sync-vps.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Esegui come root: sudo bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_USER="${APP_USER:-mycity}"
DEST="/etc/sudoers.d/mycity-sync-vps"

echo "▶ Install sync VPS (repo: $REPO, utente: $APP_USER)"

# Path assoluti nel sudoers devono combaciare col repo sul server.
sed "s|/opt/mycity/ad-mycity|$REPO|g" "$SCRIPT_DIR/mycity-sync-vps.sudoers" > /tmp/mycity-sync-vps.sudoers
chmod 440 /tmp/mycity-sync-vps.sudoers
visudo -cf /tmp/mycity-sync-vps.sudoers
install -m 440 /tmp/mycity-sync-vps.sudoers "$DEST"
rm -f /tmp/mycity-sync-vps.sudoers

echo "✓ Sudoers installato: $DEST"

# Test: mycity può lanciare aggiorna-cervello senza password?
if sudo -u "$APP_USER" sudo -n bash "$REPO/cervello/vps/aggiorna-cervello.sh" >/dev/null 2>&1; then
  echo "✓ Test NOPASSWD aggiorna-cervello.sh OK"
else
  echo "⚠ Test NOPASSWD fallito — controlla $DEST e i path" >&2
  exit 1
fi

echo ""
echo "Sync VPS attivo. Dopo ogni merge su main l'AD può accodare sync-vps (zero cmd per Nicola)."
echo "Prova manuale: sudo -u $APP_USER bash $REPO/cervello/sync-vps.sh"
