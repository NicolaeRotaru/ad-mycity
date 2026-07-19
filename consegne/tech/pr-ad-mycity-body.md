## Summary
- Fix crash in `marketplace.mjs`: la variabile env `URL` ombreggiava il costruttore globale → autofill supervisione impossibile.
- Solo codice (1 file): niente conflitti memoria.

## Test plan
- [x] `node --check cervello/marketplace.mjs` OK
- [x] Rebase su main, merge-tree senza conflitti
- [ ] Merge → prossimi autofill supervisione funzionano
