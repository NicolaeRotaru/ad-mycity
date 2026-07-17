---
data: 2026-07-18 00:05
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (128 giri)
---

# Diagnosi cassa / runway — 18 luglio 2026

**Situazione invariata dal 14/7: Stripe funziona (legge 0€), manca solo `BURN_MENSILE_EUR` nel .env del VPS — senza quel numero il runway resta "sconosciuto" da 128 giri.**

Vedi diagnosi completa: `2026-07-16-diagnosi-cassa-runway.md` (stessa analisi, stessi passi).

## Unica cosa che serve da Nicola

Scrivi nel `.env` del VPS:
```
BURN_MENSILE_EUR=XXXX
```
dove `XXXX` = spesa mensile totale (VPS + Vercel + Cursor + domini + altro fisso).

Anche una stima va bene — serve un numero per non volare ciechi.

**Card già in coda:** 🟡 `#burn-mensile-env` — accodata 2026-07-17. Non serve ri-accodare.

---
*Fonti: sentinella `cassa_sconosciuta` · 128 giri senza BURN_MENSILE_EUR · AR-039/AR-016*
