## Summary

Chiude i 7 fix dell'area **Sensori e dati reali** nella radiografia del Pannello:

- Cabla `sentinella-fonti.mjs` nel giro (controllo fonti web a costo zero)
- Aggiunge regole sentinella per fonti morte e sensore-cassa «sconosciuto» da troppi giri
- Estende `verifica-automazione` (timer VPS, battito occhi, stop loop sul segnale verifica)
- Azzera `ultimo_errore` quando un sensore torna ok
- Rimuove il fallback errato su radar-fattori in sentinella-fonti

## Test plan

- [ ] `node cervello/sentinella-fonti.mjs` → exit 0
- [ ] `node cervello/verifica-automazione.mjs` → nessun loop segnale verifica
- [ ] `node cervello/allinea-scan-cantiere.mjs` → salute-sensori-dati: 0 aperti
- [ ] Dopo merge: Radiografia › Sensori e dati reali → zero schede sotto
