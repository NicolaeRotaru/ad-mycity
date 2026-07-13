## Summary
- Aggiunte al registro-realtà le 8 scelte ragionate mancanti (6 trattorie visita 13/7 + Peretti + Amendolara) e aggiornato Garetti.
- Nuovo guardiano `registro-scelte-check.mjs` (AR-103): a ogni giro verifica che i dossier vendite con prospect `scelta_ragionata` siano nel registro — altrimenti vincolo HARD al motore.
- Regola esplicita in `auto-analisi.md`: sync registro obbligatorio nello stesso giro del dossier.

## Perché
Il Pannello (Auto-coscienza) mostra solo `registro-realta.json`. La macchina aveva analizzato 9+ prospect in `consegne/vendite/` ma ne mostrava 2 — lista incompleta senza bug UI.

## Come provare
1. `node cervello/registro-scelte-check.mjs` → exit 0, messaggio ✅
2. Apri Auto-coscienza nel Pannello → «Scelte ragionate» = 10 voci (inclusi Garetti, Tigellabella, Peretti…)
3. Rimuovi temporaneamente un'entità dal registro e rilancia il check → exit 1 con elenco mancanti
