# Checklist — Prima transazione end-to-end Casa Linda

> Preparato: **2026-06-30 17:17** · @vendite + @operations + @finanza · 🟢 checklist · 🔴 esecuzione

## Perché Casa Linda

Verificato live Supabase 30/6 17:17:
- `is_approved=true`
- **`stripe_payouts_enabled=true`** (unico negozio con payout attivo)
- 18 prodotti `available` nel catalogo
- 0 ordini effettivi finora

## 10 passi (ordine consigliato)

| # | Passo | Chi | Colore |
|---|---|---|---|
| 1 | Scegli **1 prodotto vero** dal catalogo Casa Linda (non seed) e verifica prezzo/disponibilità | @vendite | 🟢 |
| 2 | Conferma slot consegna e zona coperta | @operations | 🟢 |
| 3 | **Firma le 3 decisioni di lancio** (Stripe, commissione 12%, fee) se non già fatto | Nicola | 🔴 |
| 4 | Ordine-test: Nicola o buyer di fiducia, pagamento **COD o carta** (1 transazione reale) | @operations | 🔴 |
| 5 | Negozio accetta → prepara → rider ritira | @operations | 🟡 |
| 6 | Consegna + conferma in app | @operations | 🟡 |
| 7 | Verifica `payment_status=PAID` e `delivery_status=DELIVERED` | @analista | 🟢 |
| 8 | Payout-test verso Casa Linda (1€ o importo reale, da stornare se test) | @finanza | 🔴 |
| 9 | Telefonata feedback al buyer | @customer-success | 🟡 |
| 10 | Aggiorna STATO + celebra il primo ciclo completo | @AD | 🟢 |

## Blocchi attuali

- Nessun ordine pagato/consegnato/payout testato nel DB (confermato live).
- Stallo attività: **~153h** dall'ultimo evento (24/6 08:28).
- Senza passo 3 e 4, il marketplace resta a zero operativo.

## Esito atteso

Primo ciclo **ordine → pagato → consegnato → payout** documentato → prova vivente per onboarding altri negozi + bando ER.
