---
tipo: azioni-pronte-recensioni
reparto: customer-success
data: 2026-07-23 12:20
fonte: Supabase MCP live · query diretta orders/reviews/store_reviews/rider_reviews
stato: DRY-RUN — bozze pronte, NESSUN INVIO fino a prima consegna reale
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3)
origine: playbook:recensioni (RIPROVA da Nicola dal Pannello 2026-07-23 09:29, riapprovazione della card 2026-07-23 12:17)
---

# Recensioni post-consegna — aggiornamento 23/7 12:20

> **9ª esecuzione identica di fila** (1/7, 14/7, 15/7, 16/7, 17/7, 18/7, 19/7, 20/7, oggi 23/7).
> **Consegne completate senza recensione: 0.** Nessun invio da fare ADESSO — situazione invariata dal 20/7.

## Snapshot live (Supabase MCP · fonte diretta)

| Metrica | Valore | Fonte |
|---|---|---|
| Ordini totali in DB | **1** | `orders` — query diretta 23/7 12:20 |
| Consegne completate (`delivery_status=DELIVERED`) | **0** | stesso |
| Recensioni negozio (`store_reviews`) | **0** | stesso |
| Recensioni prodotto (`reviews`) | **0** | stesso |
| Recensioni rider (`rider_reviews`) | **0** | stesso |
| **Da sollecitare oggi** | **0** | nessun destinatario reale |

## Ordine in DB — NON contattare

| Campo | Valore |
|---|---|
| order_id | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Stato | **CANCELED** · `delivered_at` null · annullato 3/7 |
| Totale | €19,05 COD |

Inviare «grazie + recensione» su un ordine annullato sarebbe inventato → blocco corretto (confermato invariato dal 20/7).

## Messaggi già pronti in [[AZIONI-PRONTE]] (ri-verificati, non ri-timestampati: nessun cambiamento reale)

| ID | Cosa | Gate |
|---|---|---|
| A4 | Modello neutro grazie + recensione ([NEGOZIO]/[LINK]) | ordine **Consegnato** |
| A13 | Touch 1 feedback (+3h) — istanza Pane Quotidiano | ordine-prova PQ **Consegnato** |
| A14 | Touch 2 link recensione (+1g, solo se 👍) | A13 positivo |

## Esito playbook · 23/7 12:20

- ✅ VERIFICATO live: 0 consegne completate, 0 recensioni (negozio/prodotto/rider), 0 destinatari — 9ª conferma identica
- ⏳ ZERO INVII: nessuna card nuova (inventare destinatario = vietato)
- 🩻 **Segnale per l'AD:** questo playbook gira in loop dal 1/7 senza mai trovare lavoro reale da fare, perché la causa radice (0 consegne reali) non cambia da solo — va tenuto in pausa finché non scatta il trigger reale (primo ordine consegnato), non ri-eseguito a vuoto ogni giorno. Stesso pattern già segnalato su finanza/sensore-cassa (8ª diagnosi identica).
- 🙋 **SERVE DA NICOLA:** il vero sblocco è il primo ordine reale consegnato → `#ordine-test-pq` (in coda dal 18/7) o l'inserimento del primo negozio con ordini veri. Fino ad allora, questa card può restare ferma senza essere ri-accodata ogni giorno.

**Colore:** 🟢 verifica (fatta, nessuna scrittura) · 🔴 invio (resta bloccato, nessun destinatario reale).
