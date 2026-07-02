#!/usr/bin/env bash
# sync-vps.sh — Allinea codice da main e riavvia worker (post-merge 🟡).
# Chiamabile dall'utente mycity sul VPS (usa sudo NOPASSWD da install-sync-vps.sh).
set -euo pipefail

export TZ="${TZ:-Europe/Rome}"
ts() { date '+%Y-%m-%d %H:%M'; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGG="$SCRIPT_DIR/vps/aggiorna-cervello.sh"

if [ ! -f "$AGG" ]; then
  echo "[$(ts)] ERRORE: $AGG non trovato" >&2
  exit 1
fi

if [ "$(id -un)" = "root" ]; then
  bash "$AGG"
  exit $?
fi

if sudo -n bash "$AGG" 2>/dev/null; then
  echo "[$(ts)] ✓ Sync VPS completato (codice main + worker riavviato)."
  exit 0
fi

echo "[$(ts)] Sync VPS: sudo NOPASSWD non configurato." >&2
echo "  Esegui una tantum come root: sudo bash $SCRIPT_DIR/vps/install-sync-vps.sh" >&2
exit 1
