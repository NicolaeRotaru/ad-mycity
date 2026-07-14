## Summary
Chiude l'ultimo finding aperto nella casella **Onestà sui numeri** (il codice era già su main via PR #378; mancava solo l'allineamento radiografia):

- **Finding prosa/sensori**: verifica corretta su `calibrazione.mjs` (`cmdValida` nel giro) → finding chiuso.
- **da-loop**: aggiunge `sensore_stato` e `banale` alle voci chiuse dal ponte quaderni→calibrazione.
- **Radiografia**: voto dimensione 75, stato ok, 4/4 finding chiusi.

## Test plan
- [ ] `node cervello/calibrazione.mjs valida` → exit 0
- [ ] Pannello → Cervello → «Onestà sui numeri» → nessuna scheda problema sotto
- [ ] Ctrl+Shift+R sulla Radiografia dopo merge
