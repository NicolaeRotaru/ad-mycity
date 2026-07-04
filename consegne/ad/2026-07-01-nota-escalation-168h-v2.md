# Nota escalation — soglia 168h stallo

> **2026-07-01 02:17** · @AD · 🟢 (allerta interna, non messaggio esterno)

## Situazione
- Stallo ordine unico: **159,8h** (ordine COD €19,05 · Pane Quotidiano · 24/6)
- Soglia simbolica **168h (7 giorni): tra ~8,2 ore** (entro serata 1/7 / notte)
- Numeri business **=** al giro 00:17 — nessun miglioramento transazionale

## Cosa è cambiato dal giro 00:17 (contesto Nicola)
- ✅ **Foglio-firma lancio firmato** 1/7 01:02: contratto PQ 12% · payout-test **03/7** · Stripe **sandbox**
- ⏸️ **VP 3/7 rimandato** — priorità onboarding negozi **6/7**
- 🩻 **Radiografia marketplace:** 46 problemi (4 bloccanti pre-live) — Sprint 1 proposto 🟡

## Raccomandazione AD (non 🔴 automatica)
1. **Prima transazione reale:** decisione A/B su ordine zombie Pane Quotidiano (pacchetto pronto)
2. **Parallelo:** ok Nicola a **Sprint 1** (webhook + fee UI + rollback COD + RLS) prima di moltiplicare negozi LIVE
3. **Non** usare Casa Linda (demo)

## Se superiamo 168h senza transazione
- Briefing successivo: escalazione 🟡 a Nicola con opzioni binarie (accetta/annulla ordine + timeline Sprint 1)
- Nessun messaggio a clienti/negozi reali senza firma 🔴
