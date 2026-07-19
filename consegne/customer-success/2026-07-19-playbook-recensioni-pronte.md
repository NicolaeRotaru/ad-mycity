---
tipo: azioni-pronte-recensioni
reparto: customer-success
data: 2026-07-19 12:54
fonte: Supabase REST live · verifica-sensori.mjs ✅ · query diretta orders/reviews/store_reviews
stato: DRY-RUN — bozze pronte, NESSUN INVIO fino a prima consegna reale
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3)
origine: playbook:recensioni (RIPROVA Nicola 19/7 10:52)
---

# Recensioni post-consegna — aggiornamento 19/7 12:54

> **Verifica live 2026-07-19 12:54.** North Star = 0 consegne completate.
> **Consegne completate senza recensione: 0.** Nessun invio da fare ADESSO.

## Snapshot live (REST · fonte unica)

| Metrica | Valore | Fonte |
|---|---|---|
| Ordini totali in DB | **1** | `orders` REST 19/7 12:54 |
| Consegne completate (`delivery_status=DELIVERED`) | **0** | stesso |
| Recensioni negozio (`store_reviews`) | **0** | stesso |
| Recensioni prodotto (`reviews`) | **0** | stesso |
| **Da sollecitare oggi** | **0** | nessun destinatario reale |

## Ordine in DB — NON contattare

| Campo | Valore |
|---|---|
| order_id | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Stato | **CANCELED** · `delivered_at` null |
| Totale | €19,05 COD |
| Telefono | 348 642 1766 |

Inviare «grazie + recensione» a un ordine annullato sarebbe inventato → blocco corretto.

## Messaggi già in AZIONI-PRONTE (ri-timestampati 19/7 12:54)

| ID | Cosa | Gate |
|---|---|---|
| **A4** | Modello neutro grazie + recensione ([NEGOZIO]/[LINK]) | ordine **Consegnato** |
| **A13** | Touch 1 feedback (+3h) — istanza Pane Quotidiano | ordine-prova PQ **Consegnato** |
| **A14** | Touch 2 link recensione (+1g, solo se 👍) — `/orders/{UUID}/review` | A13 positivo |
| **A27** | Indice ri-verifica playbook (questo giro) | — |

Link recensione corretto (verificato nel codice): `https://mycity-marketplace.com/orders/{UUID-ORDINE}/review`

## Automazione futura (già in coda)

| Card | Azione | Stato |
|---|---|---|
| `#recensioni-trigger` | Email Resend auto «grazie + link recensione» dopo ogni consegna | 🟡 in [[AZIONI-IN-ATTESA]] |

## Esito playbook · 19/7 12:54

- ✅ VERIFICATO live: 0 consegne completate, 0 recensioni, 0 destinatari
- ✅ AGGIORNATO: [[AZIONI-PRONTE]] A4/A13/A14/A27 ri-timestampati
- ⏳ ZERO INVII: nessuna card 🔴 nuova (inventare destinatario = vietato)
- 🙋 SERVE DA NICOLA: primo ordine reale → `#ordine-test-pq` → poi A13→A14 o firma `#recensioni-trigger`

**Colore:** 🟢 ri-verifica · 🔴 invio (solo su consegna reale + feedback ≠ negativo).
