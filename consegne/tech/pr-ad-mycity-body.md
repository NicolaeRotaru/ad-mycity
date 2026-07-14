## Summary
- Dopo il merge della PR #370 (stampo 120/120), la casella «Come pensa l'AD» mostrava ancora 6 problemi perché i finding della radiografia non erano segnati come chiusi.
- Esteso `allinea-scan-cantiere.mjs`: se un finding ha blocco `verifica` e il fix è confermato nel codice, lo chiude automaticamente (come già fa `auto-fix` sul cantiere).
- Eseguito allineamento: i 6 problemi di `vettori-installati` risultano chiusi; la casella mostra solo la sintesi verde.

## Test plan
- [ ] Merge su main → refresh Pannello → Radiografia macchina → «Come pensa l'AD»: nessuna scheda problema sotto la sintesi.
- [ ] `node cervello/allinea-scan-cantiere.mjs` → output con `chiusi_verifica` coerente, exit 0.
- [ ] `node cervello/stampo-check.mjs` → `120/120 senior completi`.
