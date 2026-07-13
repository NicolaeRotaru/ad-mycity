## Summary
- Archiviati 12 pacchetti pesanti intestati a Garetti (prospect non firmato) in `consegne/_archivio-prospect/garetti/`.
- Il guardiano `allocazione-check.mjs` torna verde: 16 asset su Pane Quotidiano (faro reale), 0 su Garetti.
- Nessun file di diario nel branch — solo lo spostamento in archivio.

## Perché
Il silo AR-006 bloccava ogni giro: 12 post/kit/SEO/PR su un negozio che non può incassare. Archiviare ≠ cancellare.

## Come provare
1. `node cervello/allocazione-check.mjs` → exit 0, «Allocazione sana»
2. I file Garetti sono in `consegne/_archivio-prospect/garetti/`, non più in `consegne/content/`
3. `consegne/content/PANE-QUOTIDIANO-pacchetto.md` resta il pacchetto attivo sul faro
