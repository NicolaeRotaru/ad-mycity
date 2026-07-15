---
data: 2026-07-15 02:02
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (106 giri)
---

# Diagnosi cassa / runway — 15 luglio 2026

## In una riga per Nicola

**Stripe funziona e legge 0€ in cassa; manca solo che tu dica quanto spendiamo al mese (`BURN_MENSILE_EUR`) — senza quel numero il runway resta «sconosciuto» da 107 giri.**

---

## Cosa abbiamo verificato (02:02, VPS)

| Pezzo | Stato | Prova |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ collegata | `verifica-sensori.mjs` → `stripe_api: balance API ok` |
| Cassa Stripe | **0 €** | `sensore-cassa.mjs` → available + pending = 0 |
| `BURN_MENSILE_EUR` | ❌ assente | env non impostato |
| Runway | **sconosciuto** | 107 giri consecutivi senza calcolo |
| Ordini pagati | 0 | nessun incasso marketplace in cassa |

**Non è un bug Stripe.** Il messaggio «collega STRIPE_SECRET_KEY» è fuorviante — Stripe è collegato da tempo. Blocco reale = **solo burn mensile mancante**.

---

## Cosa succede quando imposti il burn

Formula: `runway_mesi = cassa_disponibile / burn_mensile`

Con cassa **0 €** oggi, appena imposti un burn > 0 il sensore calcolerà **runway = 0 mesi** → stato **critico** (< 3 mesi soglia) → allerta automatica a finanza/Nicola.

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

## Azione già in coda

Card **🟡 #burn-mensile-runway** — «Imposta quanto spendiamo al mese per calcolare il runway» — già in Da approvare dal 14/7. **Non serve ri-accodare.** Basta firmare con il numero reale (anche stima va bene per partire).

---

## Impatto business (oggi)

- **0 ordini pagati** → cassa Stripe = solo float/eventuali residui, non GMV
- **North Star ferma** da ~500h — il runway non è il collo di bottiglia operativo *oggi*; è il **rischio esistenziale** quando i costi fissi superano la cassa
- **Letargo** (`letargo.mjs`) non scala su runway ignoto — corretto, non allarme falso

---

## Fix macchina (✅ già su main)

1. Messaggio `sensore-cassa.mjs` distingue «Stripe ok, manca burn» vs «Stripe cieco»
2. Regola M6b in `sentinella-dati.mjs`: allerta 🟡 se `giri_sconosciuto ≥ 5`

**Nessuna PR codice necessaria** per questo blocco.

---

## Raccomandazione AD

1. **Firma** card #burn-mensile-runway con burn reale (anche approssimativo)
2. **Dopo il burn:** se runway critico, valuta con @fp-and-a piano 90 giorni (primo ordine VP 17/7 > taglio AI > bandi)
3. **Priorità oggi:** domanda (post kefir) batte runway — ma il numero serve a non volare ciechi

---

*Fonti: `cassa-runway.json` 15/7 02:02 · `sensore-cassa.mjs` + `verifica-sensori.mjs` exit 0 · `sensori-cecita.json` · regola AR-039/AR-016*
