---
data: 2026-07-18 14:31
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (137 giri)
---

# Diagnosi cassa / runway — 18 luglio 2026 (aggiornata 14:31)

**Situazione invariata dal 14/7: Stripe funziona (legge €0), manca solo `BURN_MENSILE_EUR` nel .env del VPS — senza quel numero il runway resta "sconosciuto" da 137 giri.**

## Cosa legge il sensore adesso

| Campo | Valore |
|-------|--------|
| Cassa Stripe (available + pending) | **€0** — account vuoto (nessun incasso reale ancora) |
| Burn mensile | **non impostato** (BURN_MENSILE_EUR assente dal .env VPS) |
| Runway | **sconosciuto** da 137 giri consecutivi |

Stripe è collegato e funziona — il €0 è corretto (nessun ordine reale consegnato ancora).

## Unica cosa che serve da Nicola

Dimmi il burn mensile netto (spesa fissa mensile: VPS + Vercel + Cursor + Supabase + domini + altro), poi aggiungo io nel `.env` VPS:
```
BURN_MENSILE_EUR=XXXX
```
e riavvio il worker (card `#riavvia-worker-env` già in coda).

Anche una stima è ok — serve un numero per non volare ciechi.

**Card già in coda:** 🟡 `#burn-mensile-env` — accodata 2026-07-17. Non serve ri-accodare.

---
*Fonti: cassa-runway.json · 137 giri senza BURN_MENSILE_EUR · AR-039/AR-016*
