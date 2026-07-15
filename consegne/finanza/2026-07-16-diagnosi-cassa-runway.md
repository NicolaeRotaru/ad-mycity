---
data: 2026-07-16 00:02
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (112 giri)
---

# Diagnosi cassa / runway — 16 luglio 2026

## In una riga per Nicola

**Stripe ok, cassa 0€ — manca solo quanto spendiamo al mese (`BURN_MENSILE_EUR`). Senza quel numero il runway resta «sconosciuto» da 112 giri. Non serve altra PR codice.**

---

## Verifica 01:02 (VPS)

| Pezzo | Stato | Prova |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ | `verifica-sensori.mjs` → balance API ok |
| Cassa Stripe | **0 €** | `sensore-cassa.mjs` |
| `BURN_MENSILE_EUR` | ❌ assente | env VPS |
| Runway | **sconosciuto** | 112 giri |
| Ordini pagati | 0 | nessun incasso marketplace |

Blocco = **solo burn mensile mancante**, non Stripe cieco.

---

## Dopo che imposti il burn

`runway_mesi = cassa / burn_mensile`

Con cassa **0 €** e burn > 0 → **runway 0 mesi** (critico, sotto soglia 3 mesi). Verità, non bug.

---

## Cosa serve da te

Un numero: spesa mensile netta MyCity (VPS, Vercel/Render, AI, domini, email…).

```bash
# vps/.env sul VPS:
BURN_MENSILE_EUR=XXXX
```

Card già in coda: **#burn-mensile-runway** — non ri-accodare, firma con il numero (anche stima ok).

---

## Priorità oggi

Runway non blocca il VP 17/7. Prima: **chiama il fornaio** (#ritiro-pq-vp17-checkin). Burn serve a non volare ciechi sui costi fissi.

---

*Fonti: `cassa-runway.json` 16/7 01:02 · `sensore-cassa.mjs` + `verifica-sensori.mjs` exit 0*
