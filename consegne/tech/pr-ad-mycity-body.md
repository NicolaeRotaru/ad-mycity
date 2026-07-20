## Summary
Promuove il controllo **obiettivo principale (1° ordine pagato)** da guardiano soft a **vincolo HARD di allocazione** nel giro (AR-113).

- `north-star-check.mjs`: legge lo stallo da STATO, soglia giorni (`NORTH_STAR_GIORNI_GATE`, default 3), flag `--gate` per il giro, segnale `north-star` per freschezza.
- `giro.sh`: usa `--gate` e passa `NORTH_STAR_VINCOLO` al motore («solo azioni che avvicinano il 1° ordine»).
- Chiude difetto **AR-113** in cantiere (verifica automatica).

## Test plan
- [ ] `bash -n cervello/giro.sh`
- [ ] `node cervello/north-star-check.mjs --gate` → exit 1 con stallo ~26 gg (STATO attuale)
- [ ] `node cervello/test/north-star-gate.mjs`
- [ ] `node cervello/auto-fix.mjs verifica` → AR-113 risolto
- [ ] Dopo merge: prossimo giro mostra vincolo north-star nel prompt AD
