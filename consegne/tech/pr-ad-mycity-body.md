## Summary
Chiude i 4 fix aperti nella casella **Chi impara da cosa** (chiusura-volano):

- **Sonda volano**: prima controlla calibrazione/esperimenti (business), poi i difetti architettura — niente falso allarme quando il cantiere si svuota.
- **Ponte quaderni→calibrazione**: `chiusura-loop registra` alimenta anche `calibrazione.mjs da-loop` (atteso→reale strutturato).
- **Sync proposte**: nuovo `sincronizza-proposte.mjs` nel giro — proposte già implementate non restano «da firmare».
- **Radiografia**: `allinea-scan-cantiere` chiude i finding quando la verifica nel codice passa (stesso schema PR #376).

## Test plan
- [ ] `node cervello/sincronizza-proposte.mjs` → proposte allineate
- [ ] `node cervello/allinea-scan-cantiere.mjs` → chiusura-volano: 0 finding aperti
- [ ] Pannello → Cervello → Area «Chi impara da cosa» → sintesi verde, nessuna scheda sotto
