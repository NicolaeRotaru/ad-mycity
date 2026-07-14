## Summary
Chiude l'ultima scheda fantasma nella casella **Onestà sui numeri** — il pattern di verifica cercava `sensore_stato` nel file sbagliato.

- **Fix codice** (`calibrazione.mjs`): ogni esito `da-loop` porta `sensore_stato` + `banale` — niente auto-conferme al buio.
- **Conflitti risolti** (rebase su main 14/7 12:42): tenuto solo il fix codice; memoria/radiografia resta quella aggiornata dal worker.

## Test plan
- [ ] `node cervello/calibrazione.mjs valida` → exit 0
- [ ] Pannello → Radiografia → «Onestà sui numeri» → zero schede sotto
- [ ] Ctrl+Shift+R dopo merge
