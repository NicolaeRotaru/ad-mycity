## Summary

- Contenuto **«Domenica sera: fai il turno per la settimana»** (Pane Quotidiano) completato con grafiche SVG feed + storia in `consegne/content/assets/`.
- Il file consegna ha `titolo` + `data` fresca e sezione **Anteprima grafica** con immagini inline.
- Nuova route `/api/contenuti/asset` + anteprima immagini in **Diretta contenuti** (tab Contenuti del Pannello).
- Script Playwright `render-domenica-settimana.mjs` + template HTML per PNG ad alta risoluzione sul VPS (opzionale).

## Test plan

1. Mergia la PR e attendi deploy Pannello.
2. Apri **Diretta contenuti** → cerca «Domenica sera — fai il turno…» in cima (badge **nuovo**).
3. Clicca la scheda → devono comparire le due anteprime grafiche (feed + storia) oltre al testo del post.
4. (Opzionale VPS) `node cervello/content-factory/render-domenica-settimana.mjs` genera PNG in `consegne/content/assets/`.
