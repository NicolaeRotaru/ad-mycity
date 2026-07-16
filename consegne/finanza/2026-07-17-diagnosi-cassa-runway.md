---
data: 2026-07-17 00:23
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (113 giri)
---

# Diagnosi cassa / runway — 17 luglio 2026

**Situazione invariata dal 14/7: Stripe funziona (legge 0€), manca solo `BURN_MENSILE_EUR` nel .env del VPS — senza quel numero il runway resta "sconosciuto" da 113 giri.**

Vedi diagnosi completa: `2026-07-16-diagnosi-cassa-runway.md` (stessa analisi, stessi passi).

## Unica cosa che serve da Nicola

Scrivi nel `.env` del VPS:
```
BURN_MENSILE_EUR=XXXX
```
dove `XXXX` = spesa mensile totale (VPS + Vercel + Cursor + domini + altro fisso).

Anche una stima va bene — serve un numero per non volare ciechi.

**Card già in coda:** 🟡 `#burn-mensile-runway` dal 14/7 — non serve ri-accodare.

---
*Fonti: `cassa-runway.json` 17/7 00:23 · runway sconosciuto da 113 giri (AR-039/AR-016)*
