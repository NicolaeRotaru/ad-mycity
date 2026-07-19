---
data: 2026-07-19 13:11
tipo: diagnosi
reparto: finanza
origine: sentinella cassa_sconosciuta (159 giri, retry Pannello 13:10)
---

# Diagnosi cassa / runway — 19 luglio 2026

## In una riga per Nicola

**Stripe funziona e legge 0€; manca solo `BURN_MENSILE_EUR` nel `.env` del VPS — senza quel numero il runway resta «sconosciuto» da 159 giri. Non è un bug Stripe.**

---

## Cosa abbiamo verificato adesso (13:11, VPS)

| Pezzo | Stato | Prova |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ collegata | `verifica-sensori.mjs` exit 0 → `stripe_api: balance API ok` |
| Cassa Stripe (available + pending) | **0 €** | `sensore-cassa.mjs` 13:11 |
| `BURN_MENSILE_EUR` | ❌ assente | `grep -c` su `cervello/vps/.env` → 0 occorrenze |
| Runway | **sconosciuto** | 159 giri consecutivi (contatore AR-039) |
| Ordini pagati marketplace | 0 | coerente con cassa Stripe a zero |

**Correzione rispetto al messaggio generico «sensore cieco»:** il sensore **legge** Stripe. È «cieco» sul runway perché manca il denominatore (burn mensile), non perché Stripe non risponde.

---

## Cosa succede quando imposti il burn

Formula: `runway_mesi = cassa_disponibile / burn_mensile`

Con cassa **0 €** oggi, appena imposti un burn > 0 il sensore calcolerà **runway = 0 mesi** → stato **critico** (< soglia 3 mesi) → allerta automatica a finanza/Nicola.

Questo **non è un bug**: è la verità operativa — nessun incasso in cassa Stripe, costi fissi esistono. Serve piano (primo ordine / taglio costi / fundraising), non nascondere il numero.

---

## Cosa serve da te (Nicola) — una mossa

**Card già in coda:** 🟡 `#burn-mensile-env` (approvata 16–17/7, non ancora eseguita sul VPS).

Scegli il burn che rispecchia oggi:

| Opzione | Valore | Quando usarlo |
|---|---|---|
| A — solo costi tech attuali | `150` €/mese | VPS + Vercel + dominio + tool (senza stipendio fondatore) |
| B — burn Anno 1 proiettato | `3000` €/mese | include fondatore parziale + marketing (da vault fp-and-a) |

**Comando sul terminale VPS** (sostituisci 150 se il tuo numero è diverso):

```bash
echo "BURN_MENSILE_EUR=150" >> /opt/mycity/ad-mycity/cervello/vps/.env && sudo systemctl restart mycity-worker-chat.service
```

**Cosa cambia:** al giro successivo il Pannello mostra runway numerico (0 mesi con cassa attuale) invece del punto interrogativo; la sentinella `cassa_sconosciuta` si spegne.

**Se va bene:** @fp-and-a prepara piano cash (critico finché cassa = 0).

---

## Cosa NON serve

- ❌ Nuova PR codice — `sensore-cassa.mjs` e sentinella AR-039 già su main da PR #377
- ❌ Ricollegare Stripe — già ok da mesi
- ❌ Muovere denaro da parte della macchina — sola lettura

---

## Storico

| Data | Giri sconosciuto | Blocco |
|---|---|---|
| 14/7 | 98 | BURN assente (prima diagnosi) |
| 18/7 | 137 | invariato |
| **19/7 13:11** | **159** | invariato — unica azione = env burn |

---
*Fonti live: `node cervello/sensore-cassa.mjs` · `node cervello/verifica-sensori.mjs` exit 0 · `cassa-runway.json` · AR-016/AR-039*
