# PR #842 — NicolaeRotaru/ad-mycity

**In parole semplici:** un controllo automatico che gira a fine turno (il "cancello dello Stop") verifica che ogni strumento usato dalla macchina abbia una guardia che lo sorveglia. Oggi ha segnalato `WebSearch` (la ricerca sul web) come "nessuno lo controlla" — falso allarme: `WebSearch` legge solo testo da internet, non scrive niente nel sito né nella memoria, esattamente come `WebFetch` (che apre una singola pagina), già escluso da tempo per lo stesso motivo. Questa PR aggiunge `WebSearch` alla stessa lista di eccezioni («ESENZIONI» nella mappa di copertura degli strumenti), così il controllo smette di dare quel falso allarme.

## 🔧 Dettagli tecnici
- **Repo:** NicolaeRotaru/ad-mycity
- **Branch:** `fix/websearch-esenzione-copertura` → `main`
- **URL:** https://github.com/NicolaeRotaru/ad-mycity/pull/842
- **Titolo:** fix: censisce WebSearch in ESENZIONI (mappa-copertura)
- **Creato:** 2026-08-24 13:57 (Europe/Rome)

## Merge
🔴 **Non mergeare da solo.** Nicola approva dal Pannello → `node cervello/git-merge.mjs --repo ad-mycity --pr 842`

## Anteprima
Vercel Preview se configurato sul repo ad-mycity.
