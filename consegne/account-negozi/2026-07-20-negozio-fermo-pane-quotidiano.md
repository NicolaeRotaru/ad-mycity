---
tipo: check-in-anti-churn
data: 2026-07-20 00:01
autore: AD digitale · @account-negozi
sentinella: negozio_fermo · firma c0b240c0-2a86-4218-9d0f-5154f08ff929
fonte_dati: Supabase REST live (verifica-sensori exit 0 · sentinella-dati 20/7 00:01)
colore: 🟢 analisi · 🟡 contatto = firma Nicola
---

# Check-in anti-churn — Pane Quotidiano — 20/7/2026 00:01

## Verdetto in una riga

**Non è abbandono** — relazione ok, Nicola li conosce. **Rischio vero:** VP 17/7 passato **senza ordini** (North Star ancora **0**); catalogo PQ **solo 5 prodotti** live. **Mossa oggi:** card **#checkin-pq-postvp** (già in coda) — debrief venerdì + fissare primo ordine (ritiro al banco o test Nicola).

---

## Dati live (REST, 20/7 00:01)

| Metrica | Valore | Fonte |
|---|---|---|
| Negozi approvati LIVE | **1** (Pane Quotidiano) | `profiles?approval_status=approved` |
| ID negozio | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | REST |
| Prodotti PQ in catalogo | **5** (kefir, hummus, pesto, pudding…) | `products?seller_id=eq.c0b240c0…` → count **0-4/5** |
| Prodotti marketplace totali | 258 | quasi tutti negozi demo (`11111111…`) |
| Ordini ultimi 14 giorni | **0** | `orders?created_at≥2026-07-06` |
| Ordini totali storici PQ | **1** | 24/6/2026 · **CANCELED** |
| Clienti iscritti | 23 | baseline STATO |
| Payout Stripe | **OFF** | `stripe_payouts_enabled=false` |

---

## Health score — Pane Quotidiano (20/7)

| Dimensione | Stato | Nota |
|---|---|---|
| Relazione / contratto | **8/8** | Firmato, gestione diretta Nicola — non churn |
| Catalogo prodotti | **🔴 2/8** | Solo **5** prodotti visibili (non 258 — quelli erano demo) |
| Descrizione vetrina | ✅ | `store_description` compilata |
| Logo negozio | ❌ | `store_logo` null |
| Indirizzo / città / telefono in DB | ❌ | Tutti null — Via Calzolai 25 / 0523 388601 solo in memoria |
| Payout testato | ❌ | Mai end-to-end |
| Ordini consegnati | **0** | Stallo **~26 giorni** dal 24/6 |
| VP 17/7 | ⚠️ | Finestra passata — **nessun ordine registrato** |

**Punteggio vetrina: 3/8** — pagina percepita **sottile** (5 prodotti, no logo).  
**Punteggio relazione: 8/8** — attesa concordata, ma **time-to-first-value** ora critico.

---

## Diagnosi (causa vera vs sintomo sentinella)

| Sintomo | Causa reale | Mossa |
|---|---|---|
| 0 ordini in 14g | Piattaforma non ancora aperta al pubblico + VP senza conversione | Check-in oggi + ordine test (#ordine-test-pq) |
| «Negozio fermo» | Attesa concordata **+** finestra VP persa | Debrief venerdì, non telefonata «ci manchi» |
| Catalogo «258» in memoria vecchia | Conteggio globale demo — **PQ ha 5 prodotti** | Espansione catalogo post-primo ordine |
| Meteo pioggia da oggi | Leva delivery quando bici pronta (~28/7+) | Post #post-meteo-pioggia-20lug + ritiro banco intanto |

---

## Upsell catalogo (priorità dopo debrief)

| # | Azione | Colore | Quando |
|---|---|---|---|
| 1 | Primo ordine reale (ritiro banco o test Nicola) | 🟡 | **Oggi/settimana** |
| 2 | Inserisci prodotti faro mancanti (pane, caffè/tazzina — #inserisci-tazzina-pq) | 🟡 | In chiamata chiedi prezzi |
| 3 | Logo + foto prodotti reali | 🟢 | Visita o WhatsApp |
| 4 | Autofill città = Piacenza, indirizzo Via Calzolai | 🟡 | Dopo ok Nicola |
| 5 | Espansione catalogo oltre i 5 prodotti attuali | 🟢 | **Dopo** 1° ordine |

---

## Cosa accodare — anti-doppione

| Decisione | Motivo |
|---|---|
| ❌ **Nessuna nuova card anti-churn** | **#checkin-pq-postvp** già in coda (18/7) — aggiornata 20/7 |
| ✅ **Usa #checkin-pq-postvp** | Timing: lunedì 20/7 mattina = **oggi** |
| ✅ **Spingi domanda** | #post-meteo-pioggia-20lug · #post-domenica-settimana-1907 |
| ⏳ **#ordine-test-pq** | Dopo check-in se fornaio ok |

**Script aggiornato (0523 388601 · Via Calzolai 25):**

> «Ciao [nome], com'è andata venerdì al Venerdì Piacentini? Sei riuscito a stare al banco? C'era interesse? Con le piogge che arrivano oggi/domani il delivery ha senso — intanto possiamo provare un ordine con ritiro da te. Cosa ti serve ancora da noi? Catalogo online, QR, qualcosa che non torna?»

**Cosa vuoi capire:**
1. Era al banco venerdì? Ha visto gente / domande?
2. Perché zero ordini (nessuno sapeva? QR? catalogo troppo corto?)
3. Data per primo ordine test (ritiro) — tu o lui fa ordine prova (#ordine-test-pq)
4. Prezzo tazzina/caffè se vuoi sbloccare #inserisci-tazzina-pq

---

## Chiusura loop

Registrato in `memoria-squadra/account-negozi.md` via `chiusura-loop.mjs registra`.
