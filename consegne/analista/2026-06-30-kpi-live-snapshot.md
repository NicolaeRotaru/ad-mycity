# 📊 KPI live — snapshot 30/6/2026 20:10

> Fonte: Supabase marketplace `clmpyfvpvfjgeviworth` via REST (sola lettura). Query eseguite in questo giro.

## I 7 numeri (verificati live)

| # | KPI | Valore | vs giro 19:44 |
|---|---|---|---|
| 1 | Negozi approvati / payout-ready | **2 / 1** | = |
| 2 | Prodotti VERI faro (Garetti) pubblicati | **0** | = |
| 3 | Ordini creati | **1** (COD €19,05, 24/6) | = |
| 4 | Ordini pagati | **0** | = |
| 5 | Ordini consegnati | **0** | = |
| 6 | Payout testato | **0** | = |
| 7 | Buyer totali / nuovi 7g | **4 / 0** | = |

**Stallo:** 153,7 ore (~6,4 giorni) dall'ultimo evento reale (24/6 08:28 UTC).

## Dettaglio negozi

| Negozio | Approvato | Stripe charges | Stripe payouts | Prodotti available | Ordini |
|---|---|---|---|---|---|
| **Casa Linda** | ✅ | ✅ | ✅ | 18 (+ 7 draft, 1 sold) | 0 |
| **Pane Quotidiano** | ✅ | ❌ | ❌ | 5 | 1 (zombie €19,05) |

## Carrelli attivi (`user_carts` con items)

Almeno **1 carrello con 3 items** (Pane Quotidiano) aggiornato il 24/6; altri con items fermi dal 16-29/5. Nessun recupero avviato.

## Pipeline vendite

- **407** lead `merchants_leads.outreach_status=to_contact`
- **0** recensioni in `reviews`
- **0** iscritti newsletter (non verificato questo giro)

## Attività ultimi 7 giorni

Solo eventi del 24/6: creazione ordine zombie + update prodotti. Nessun nuovo buyer dal 16/6.

## Diagnosi @analista

Il business resta **congelato al 100% decisionale**: infrastruttura REST risponde, Casa Linda payout-ready, numeri identici al giro delle 19:44. Collo di bottiglia = **3 firme 🔴 + ok transazione Casa Linda + sblocco ordine zombie**.
