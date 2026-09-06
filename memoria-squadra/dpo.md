---
tipo: quaderno-memoria
reparto: dpo
bootstrap: 2026-07-14 02:31
---

# 🧠 Quaderno di dpo
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro 🟡/🔴.
> Formato: AAAA-MM-GG · contesto · scorecard 6 assi · atteso→reale · #tag

## Esiti
- (ancora vuoto — il primo ESITO si registra con: node cervello/chiusura-loop.mjs registra dpo "…" "…" "…" "…")
- 2026-09-06 18:59 · lotto sito, squadra 232: «scarica i miei dati» risolveva ogni sezione con `data ?? []`, quindi una lettura caduta usciva `[]` — identica a «non hai niente» — su un adempimento art. 15/20. Riparato su tutte e 45 le sezioni (non solo le 25 nuove) con un solo meccanismo: sezione caduta = `null` + `letture_fallite` + `export_completo:false` + nome file `-INCOMPLETO`; motivo tecnico nei log, non al cliente. Prova: 8 test, difetto rimesso → uscita 1 con 4 rossi, ripristinato → uscita 0. Lezione: nel codice `?? []` è il posto dove muoiono i diritti — un elenco vuoto e un guasto non possono avere la stessa faccia; e quando ripari una bugia, prova anche il contrario (il vuoto vero deve restare vuoto). #gdpr #diritto-di-accesso #accountability
