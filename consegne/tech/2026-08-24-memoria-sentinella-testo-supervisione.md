---
tipo: descrizione-pr
data: 2026-08-24 13:40
---

# Aggiorna memoria sentinella/agenda intelligence + chiarisce il testo del report supervisione negozi

## In parole semplici
Due cose senza rischio: ho salvato lo stato aggiornato di due "sensori" della macchina (quali fonti
web sono vive e cosa deve ancora controllare l'intelligence) e ho riscritto tre frasi del report
"Supervisione negozi" per renderle più semplici da leggere a voce.

## Cosa cambia per te
Niente sul sito, niente su soldi o dati dei negozi. Solo: (1) la memoria interna della macchina
risulta aggiornata al 24/8 invece che al 14/8 e (2) il prossimo report di supervisione negozi che
leggerai avrà un'introduzione più chiara.

## Cosa devi fare
Nulla di urgente: puoi mergiare quando vuoi, o lasciarla in coda.

## Cosa non ho verificato
Non ho potuto far girare `node --check` sul file `supervisione-negozi.mjs` (i comandi node erano
bloccati dal permesso di questa sessione) — ho controllato a occhio il diff: sono solo stringhe di
testo dentro template literal già bilanciati, la struttura del codice non cambia.

---

## 🔧 Dettagli tecnici
File toccati:
- `cervello/fonti-salute.json` — timbro sentinella-fonti aggiornato 2026-08-14→2026-08-24, ambiente locale→cloud
- `cervello/intelligence-agenda.json` — 7 nuove fonti agenda (comune-imprese, cna-piacenza, glovo-piacenza, conad-consegna, ecc.), fonti_dovute 9→16
- `cervello/routing.json` — rotazione log chiamate router (rimossi log >30gg, aggiunti quelli del 24/8)
- `cervello/supervisione-negozi.mjs` — solo testo introduttivo del report (righe ~310-320), nessun cambio di logica/struttura

Cancello lotto: `git commit` bloccato una volta da AR-332 (commit diretto su main per file "codice"),
poi rifatto correttamente su branch dedicato.
