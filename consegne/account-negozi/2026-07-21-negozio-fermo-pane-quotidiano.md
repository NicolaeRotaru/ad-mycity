---
tipo: check-in-anti-churn
data: 2026-07-21 00:01
autore: AD digitale · @account-negozi
sentinella: negozio_fermo · firma c0b240c0-2a86-4218-9d0f-5154f08ff929
fonte_dati: Supabase REST live (verifica-sensori exit 0 · query diretta 21/7 00:01)
colore: 🟢 analisi · 🟡 contatto = firma Nicola
---

# Check-in anti-churn — Pane Quotidiano — 21/7/2026 00:01

## Verdetto in una riga

**Non è abbandono** — relazione ok, Nicola li conosce. **Rischio vero:** **27 giorni** senza ordine consegnato, VP 17/7 passato **senza conversione**, catalogo **5 prodotti** e vetrina incompleta (no logo, indirizzo/telefono assenti nel DB). **Mossa oggi:** card **`#checkin-pq-postvp`** (già in coda, **scaduta** dal 20/7 mattina) — chiama o WhatsApp, fissa primo ordine con **ritiro al banco**.

---

## Dati live (REST, 21/7 00:01)

| Metrica | Valore | Fonte |
|---|---|---|
| Negozi approvati LIVE | **1** (Pane Quotidiano) | `profiles?approval_status=approved` |
| ID negozio | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | REST |
| Prodotti PQ in catalogo | **5** | kefir capra, kefir Berchtesgadener, hummus, pesto, pudding |
| Ordini ultimi 14 giorni | **0** | `orders?created_at≥2026-07-07` |
| Ordini totali storici PQ | **1** | 24/6/2026 · €19,05 · **CANCELED** 3/7 |
| Buyer registrati (role=buyer) | **4** | REST count |
| Payout Stripe | **OFF** | `stripe_payouts_enabled=false` |
| Logo / città / indirizzo / telefono in DB | **null** | Via Calzolai 25 · 0523 388601 solo in memoria/contratto |

---

## Health score — Pane Quotidiano (21/7)

| Dimensione | Stato | Nota |
|---|---|---|
| Relazione / contratto | **8/8** | Firmato 1/7 (12%/0€ eccezione), gestione diretta Nicola |
| Catalogo prodotti | **🔴 2/8** | Solo **5** prodotti — mancano pane, caffè/tazzina (#inserisci-tazzina-pq) |
| Descrizione vetrina | ✅ | `store_description` compilata |
| Logo negozio | ❌ | `store_logo` null |
| Indirizzo / città / telefono in DB | ❌ | Gap supervisione — autofill possibile post-ok |
| Payout testato | ❌ | Mai end-to-end |
| Ordini consegnati | **0** | Stallo **~27 giorni** dal 24/6 |
| VP 17/7 | ⚠️ | Passato **4 giorni fa** — zero ordini |

**Punteggio vetrina: 3/8** — pagina percepita sottile.  
**Punteggio relazione: 8/8** — attesa concordata, ma **time-to-first-value** ora critico.

---

## Diagnosi (causa vera vs sintomo sentinella)

| Sintomo | Causa reale | Mossa |
|---|---|---|
| 0 ordini in 14g | Piattaforma non aperta al pubblico + VP senza conversione + nessun ordine test | `#checkin-pq-postvp` **oggi** + `#ordine-test-pq` |
| Sentinella «negozio fermo» | Attesa concordata + finestra VP persa | Debrief VP, non telefonata generica «ci manchi» |
| 4 buyer, 0 pagati | Carrello samir €10 fermo dal 16/6 — flusso non provato | Primo ordine sblocca anche `#referral-porta-un-amico` |
| Pioggia 20–21/7 | Leva delivery quando bici pronta (~28/7+) | Intanto **ritiro al banco** |

---

## Upsell catalogo (priorità dopo debrief)

| # | Azione | Colore | Quando |
|---|---|---|---|
| 1 | Primo ordine reale (ritiro banco o test Nicola) | 🟡 | **Questa settimana** |
| 2 | Inserisci prodotti faro (pane, caffè/tazzina — #inserisci-tazzina-pq) | 🟡 | Chiedi prezzi in chiamata |
| 3 | Logo + foto prodotti reali | 🟢 | Visita o WhatsApp |
| 4 | Autofill città = Piacenza, indirizzo Via Calzolai, tel 0523 388601 | 🟡 | Dopo ok Nicola |
| 5 | Espansione catalogo oltre i 5 prodotti | 🟢 | **Dopo** 1° ordine |

---

## Cosa accodare — anti-doppione

| Decisione | Motivo |
|---|---|
| ❌ **Nessuna nuova card anti-churn** | `#checkin-pq-postvp` già in coda — aggiornata 21/7 |
| ✅ **Usa #checkin-pq-postvp** | Card **scaduta** (prevista lun 20/7 mattina) — priorità **alta** |
| ⏳ **#ordine-test-pq** | Subito dopo ok fornaio in chiamata |
| ⏳ **#post-meteo-pioggia-20lug** | Spinta domanda lato clienti (pioggia) |

**Script aggiornato (0523 388601 · Via Calzolai 25):**

> «Ciao [nome], ti disturbo un attimo. Com'è andato il Venerdì Piacentini venerdì scorso? C'era interesse al banco? Noi siamo pronti per il **primo ordine vero** — con questa pioggia ha senso portare a casa, ma se la bici non è ancora pronta proviamo subito un ordine con **ritiro da te**. Cosa ti serve da noi? Catalogo online (oggi ci sono solo 5 prodotti), QR in vetrina, qualcosa che non torna?»

**Cosa vuoi capire:**
1. Era al banco venerdì 17/7? Domande sul QR / MyCity?
2. Perché zero ordini (nessuno sapeva? catalogo corto?)
3. **Data concreta** per primo ordine test (ritiro) — tu o lui
4. Prezzo tazzina/caffè → sblocca #inserisci-tazzina-pq

---

## Chiusura loop

Registrato in `memoria-squadra/account-negozi.md` via `chiusura-loop.mjs registra`.
