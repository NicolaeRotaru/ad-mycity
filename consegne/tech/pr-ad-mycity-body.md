## Summary
- **Streaming live:** durante la risposta in corso, testo semplice (no Markdown) così i parziali non si spezzano a colonna; polling ogni 1s invece di 2s.
- **VPS sync:** `aggiorna-cervello.sh` riavvia anche `mycity-worker-chat` (prima solo il worker principale — il riavvio manuale non aggiornava il codice sul disco).

## Perché
Nicola ha riavviato il worker-chat ma lo streaming restava «tutto insieme» e i fix pallini (#340) non si vedevano: restart ≠ git pull; pallini = deploy Vercel, non worker.

## Come provare
1. Mergia e attendi deploy Vercel (~2 min).
2. Sul VPS: `sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh` (allinea codice + riavvia entrambi i worker).
3. Ctrl+F5 nel Pannello → Diagnosi → «Pipeline giro» deve mostrare **rev 1081be71** (o più recente).
4. Scrivi in chat: il testo deve crescere in orizzontale con ▍; apri chat con pallino → chiudi → 15s → pallino spento.
