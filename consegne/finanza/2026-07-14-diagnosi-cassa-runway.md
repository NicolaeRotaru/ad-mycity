---
data: 2026-07-14 03:25
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (96 giri)
---

# Diagnosi cassa / runway — 14 luglio 2026

## In una riga per Nicola

**Stripe funziona e legge 0€ in cassa; manca solo che tu dica quanto spendiamo al mese (`BURN_MENSILE_EUR`) — senza quel numero il runway resta «sconosciuto» da 96 giri.**

---

## Cosa abbiamo verificato (04:42, VPS)

| Pezzo | Stato | Prova |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ collegata | `verifica-sensori.mjs` → `stripe_api: balance API ok` |
| Cassa Stripe | **0 €** | `sensore-cassa.mjs` → available + pending = 0 |
| `BURN_MENSILE_EUR` | ❌ assente | env non impostato |
| Runway | **sconosciuto** | 96 giri consecutivi senza calcolo |
| Ordini pagati | 0 | nessun incasso marketplace in cassa |

**Correzione importante:** il messaggio vecchio diceva «collega STRIPE_SECRET_KEY» — **è fuorviante**. Stripe è già collegato da tempo. Il blocco reale è **solo il burn mensile**.

---

## Cosa succede quando imposti il burn

Formula: `runway_mesi = cassa_disponibile / burn_mensile`

Con cassa **0 €** oggi, appena imposti un burn > 0 il sensore calcolerà **runway = 0 mesi** → stato **critico** (< 3 mesi soglia) → allerta automatica 🔴 a finanza/Nicola.

Questo **non è un bug**: è la verità — senza incassi e con costi fissi, la cassa Stripe non copre il burn. Serve piano (taglio costi / primo ordine / fundraising), non nascondere il numero.

---

## Cosa serve da te (Nicola)

**Un solo numero:** quanto spende MyCity al mese in netto (€/mese), tutto incluso:

- VPS worker
- Vercel / Render
- Cursor / AI
- Domini, email, altro fisso

**Come si imposta (🟡 — tocca env VPS, serve tua firma):**

```bash
# Sul VPS, in vps/.env (o dove legge il worker):
BURN_MENSILE_EUR=XXXX
```

Poi riavvia il worker o aspetta il prossimo giro — `sensore-cassa.mjs` ricalcola da solo.

**Non inventiamo il numero:** senza fonte da te o da bilancio, resta vuoto (regola AD).

---

## Impatto business (oggi)

- **0 ordini pagati** → cassa Stripe = solo float/eventuali residui, non GMV
- **North Star ferma** da ~489h — il runway non è il collo di bottiglia operativo *oggi*; è il **rischio esistenziale** quando i costi fissi superano la cassa
- **Letargo** (`letargo.mjs`) non scala su runway ignoto — corretto, non allarme falso

---

## Fix macchina (✅ già su main)

1. Messaggio `sensore-cassa.mjs` distingue «Stripe ok, manca burn» vs «Stripe cieco»
2. Regola M6b in `sentinella-dati.mjs`: allerta 🟡 se `giri_sconosciuto ≥ 5` (chiude buco radiografia Opus 7/7)

---

## Raccomandazione AD

1. **Firma** l'azione in coda «Imposta il burn mensile» con il numero reale (anche approssimativo va bene per partire — si affina dopo)
2. **Dopo il burn:** se runway critico, valuta con @fp-and-a piano 90 giorni (primo ordine VP 17/7 > taglio AI > bandi)
3. **Non prioritario ora:** collegare PostHog, MARKETPLACE_SITE_URL — non sbloccano il runway

---

*Fonti: `cassa-runway.json` 14/7 04:42 · `sensore-cassa.mjs` + `verifica-sensori.mjs` exit 0 · `sensori-cecita.json` · regola AR-039/AR-016*
