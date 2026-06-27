#!/usr/bin/env bash
# giro-ora.sh — Lancia SUBITO un giro di perlustrazione + auto-analisi sul VPS.
# Prima di analizzare, il giro SINCRONIZZA automaticamente il codice nuovo da 'main'
# (pannello, cervello, agenti) — i merge appena pushati entrano qui, senza 'git pull' a mano.
# Da eseguire SUL VPS (Linux), come root:
#     sudo bash /opt/mycity/ad-mycity/cervello/vps/giro-ora.sh
# Esce con Ctrl-C dopo che il giro è finito: il giro NON viene interrotto (gira come servizio).
set -euo pipefail

ts() { date '+%Y-%m-%d %H:%M'; }

echo "[$(ts)] ▶ Avvio SUBITO giro + auto-analisi (il codice nuovo da main si sincronizza all'inizio del giro)..."
# --no-block: fa partire il servizio (Type=oneshot) senza aspettare la fine, così possiamo seguire i log live.
systemctl start --no-block mycity-giro.service

echo "[$(ts)] ▶ Log in diretta (Ctrl-C per smettere di seguire; il giro continua in background):"
echo "        Al termine cerca il nuovo briefing in MyCity-Vault/90-Memoria-AI/Briefing/ e AUTO-ANALISI.md,"
echo "        oppure guardalo nel Pannello (ramo memoria-ad)."
exec journalctl -u mycity-giro -f
