---
tipo: azioni-pronte-recensioni
reparto: customer-success
data: 2026-07-14 11:11
fonte: Supabase REST live (`orders` + `store_reviews` + `reviews`) · `verifica-sensori.mjs` 11:11 (`supabase_rest=ok`)
stato: DRY-RUN — bozze pronte, NESSUN INVIO
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §3)
riferimento: playbook `consegne/customer-success/2026-07-01-playbook-recensioni.md`
---

# Recensioni post-consegna — pacchetto pronto (14/7 11:11 · playbook worker)

> **Verifica live 2026-07-14 11:11.** REST marketplace leggibile (`supabase_rest=ok`).
> **Consegne completate senza recensione: 0.** Nessun cliente reale da sollecitare oggi.

## Situazione reale (con fonte)

| Metrica | Valore | Fonte |
|---|---|---|
| Ordini totali in DB | **1** | REST 14/7 11:11 |
| Consegne completate (`delivery_status=DELIVERED`) | **0** | stesso |
| Consegne con `delivered_at` valorizzato | **0** | stesso |
| Recensioni negozio (`store_reviews`) | **0** | stesso |
| Recensioni prodotto (`reviews`) | **0** | stesso |
| **Consegne senza recensione da sollecitare** | **0** | nessun destinatario reale |

## Ordine zombie — NON contattare

| Campo | Valore |
|---|---|
| order_id | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Negozio | Pane Quotidiano |
| Totale | €19,05 COD |
| Stato | `delivery_status=CANCELED` · annullato 3/7 15:38 · `delivered_at` null |
| Contatto | 348 642 1766 — **non** inviare messaggio post-consegna |

Inviare «grazie + recensione» a un ordine annullato sarebbe inventato → blocco corretto.

---

## Messaggi pronti in AZIONI-PRONTE (nessun doppione)

| ID | Cosa | Gate |
|---|---|---|
| **A4** | Modello neutro grazie + recensione ([NEGOZIO]/[LINK]) | ordine **Consegnato** |
| **A13** | Touch 1 — feedback +3h da consegna | ordine-prova PQ Consegnato |
| **A14** | Touch 2 — link recensione +1g (solo se A13 = 👍) | feedback ≠ 👎 |
| **A27** | Indice ri-verifica playbook | aggiornato 14/7 11:11 |
| Email auto | `2026-07-11-template-email-recensione.md` | firma **#recensioni-trigger** |

**Regola d'oro:** Touch 2 recensione parte **solo se** Touch 1 ≠ negativo (FLUSSI §3).

---

## Sequenza alla prima consegna reale (Pane Quotidiano)

### Touch 1 · Feedback (+3h da Consegnato) · 🔴

**Canale:** WhatsApp/telefono dal profilo ordine · backup email/in-app

> Ciao! Sono Nicola di MyCity 👋
> Ti è arrivata la spesa da **Pane Quotidiano**? Spero pesto e kefir siano come al banco.
>
> Siamo appena nati e ogni tua parola conta. **Com'è andata?**
> 👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema
>
> Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.
> Grazie per aver scelto la bottega del quartiere 🧡

**Ramo 👎:** handoff @supporto — **NON** inviare Touch 2.

### Touch 2 · Richiesta recensione (+1 giorno, solo se 👍) · 🔴

> Buongiorno! Come promesso, ecco il link per lasciare **due righe su Pane Quotidiano** 🌟
> 👉 https://mycity-marketplace.com/orders/{ID-ORDINE-PROVA}/review
>
> Bastano 30 secondi: stelline + una frase vera.
> Sarebbe la **prima recensione verificata di MyCity a Piacenza** — grazie di cuore!

Sostituire `{ID-ORDINE-PROVA}` con l'UUID dell'ordine consegnato e **aprire il link LIVE** prima dell'invio.

---

## Cosa serve da Nicola

1. **Oggi:** niente — zero consegne, zero invii.
2. **Alla prima consegna PQ:** invio manuale A13 → se 👍 A14 (oppure firma **#recensioni-trigger** per automazione email).
3. **Gate operativo:** ordine-prova payout-test (accetta → consegna → payout) prima di qualsiasi messaggio cliente.

**Colore:** 🟢 preparazione/ri-verifica (questo giro) · 🔴 invio messaggio a cliente reale.
