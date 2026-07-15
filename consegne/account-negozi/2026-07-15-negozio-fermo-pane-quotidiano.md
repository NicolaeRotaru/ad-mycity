---
tipo: check-in-anti-churn
data: 2026-07-15 00:02
autore: AD digitale · @account-negozi
sentinella: negozio_fermo · firma c0b240c0-2a86-4218-9d0f-5154f08ff929
fonte_dati: Supabase REST live (verifica-sensori exit 0 · supervisione-negozi 15/7 00:02)
colore: 🟢 analisi · 🟡 contatto = firma Nicola
---

# Check-in anti-churn — Pane Quotidiano — 15/7/2026 00:02

## Verdetto in una riga

**Falso positivo confermato** — Pane Quotidiano non sta mollando: aspetta il primo ordine reale al **Venerdì Piacentini 17/7** (ritiro al banco). **Nessuna telefonata anti-churn nuova.** Usa la card già in coda **#ritiro-pq-vp17-checkin** (giovedì 16/7).

---

## Dati live (REST, 15/7 00:02)

| Metrica | Valore | Fonte |
|---|---|---|
| Negozi approvati LIVE | **1** (Pane Quotidiano) | `profiles?approval_status=approved` |
| Negozi demo (seed) | 16 | UUID `11111111…` — esclusi |
| Ordini ultimi 14 giorni | **0** | `orders?created_at≥2026-07-01` |
| Ordini totali storici | **1** | ordine `58094956…` |
| Ultimo ordine | 24/6/2026 · **CANCELED** 3/7 15:38 | `delivery_status=CANCELED` |
| Prodotti in catalogo | **258** | `supervisione-negozi.mjs --json` |
| Gap catalogo autofill | 494 campi (252 condizione + 242 unità) | supervisione 15/7 |

---

## Health score — Pane Quotidiano

| Dimensione | 13/7 | **15/7** | Nota |
|---|---|---|---|
| Relazione / contratto | 8/8 | **8/8** | Firmato 1/7, gestione diretta Nicola |
| Catalogo prodotti | ✅ 258 | ✅ 258 | Numeroso, bio/forno |
| Descrizione vetrina | ❌ | **✅** | `store_description` compilata |
| Foto negozio | ❌ | **⚠️ parziale** | `store_media` ha 1 immagine; `store_logo` ancora null |
| Città in scheda | ❌ | ❌ | `city` null — autofill proposto |
| Payout Stripe | ❌ | ❌ | `stripe_payouts_enabled=false`, mai testato |
| Ordini consegnati | 0 | 0 | North Star ancora **0** |
| Ordini ultimi 14g | 0 | 0 | Atteso pre-lancio |

**Punteggio vetrina: 4/8** (era 2/8 il 13/7 — visita o materiali hanno migliorato descrizione + 1 foto).  
**Punteggio relazione: 8/8** — nessun segnale di abbandono.

---

## Diagnosi (causa vera)

| Sintomo sentinella | Causa reale | Mossa |
|---|---|---|
| 0 ordini in 14g | Piattaforma non ancora aperta al pubblico; domanda = 0 | Post kefir + lista d'attesa (#post-kefir-estate-1407) |
| Negozio «fermo» | Attesa concordata (Nicola 6/7: «li conosco, aspettano») | **Non** telefonata «ci manchi» |
| Rischio reale | **No-value realized** se VP 17/7 passa senza ordini | Presidio al banco + check-in giovedì |

---

## Upsell catalogo (dopo 1° ordine, non prima)

| Priorità | Azione | Colore | Quando |
|---|---|---|---|
| 1 | Firma batch autofill «nuovo» + «pezzo» (494 campi) | 🟡 | Dopo VP se serve |
| 2 | Autofill città = Piacenza | 🟡 | Stesso batch |
| 3 | Carica `store_logo` dedicato (ora solo media generica) | 🟢 | Prossima visita |
| 4 | 5 prodotti faro con foto per home | 🟢 | Post-primo ordine |
| 5 | Espansione catalogo / promo bio (A7) | 🟢 | **Solo dopo** 1ª consegna |

---

## Cosa accodare — anti-doppione

| Decisione | Motivo |
|---|---|
| ❌ **Nessuna nuova telefonata anti-churn** | #25/#29 chiuse 6/7; ripetere infastidirebbe |
| ✅ **Usa #ritiro-pq-vp17-checkin** | Già in coda 14/7 — script VP 17/7 pronto |
| ✅ **Spingi domanda** | #post-kefir-estate-1407 (🔴 pubblicazione) |
| ⏳ **#antichurn-13lug** | Resta in attesa debrief visita 13/7 + nuovi negozi firmati |

**Script già pronto (giovedì 16/7, 0523 388601):**

> «Ciao, sono Nicola di MyCity. Venerdì sera c'è il Venerdì Piacentini — centro pieno. Ti va se passo da te al banco con il QR e restiamo lì un'oretta? I clienti ordinano e **ritirano da te** (la bici non è ancora pronta). Così proviamo il primo ordine vero insieme, senza stress di consegna a domicilio.»

**Aggiornamento salute da citare in chiamata (se utile):** «Ho visto che la descrizione del negozio online è a posto — grazie. Venerdì facciamo la prova dal vivo.»

---

## Re-verifica 12:56 (worker sentinella)

| Controllo | Esito |
|---|---|
| REST Supabase | ✅ ordini leggibili |
| Negozi fermi 14g | **1** — solo Pane Quotidiano |
| Accodamento sentinella | ⏭️ **saltato** — cooldown 24h, stessa firma `c0b240c0…` |
| Nuova azione anti-churn | ❌ **nessuna** — anti-doppione vs #ritiro-pq-vp17-checkin |
| Supervisione catalogo | 258 prodotti · 494 autofill proposti · logo PQ ancora mancante |

**Conclusione invariata:** falso positivo; mossa operativa = giovedì 16/7 check-in VP + venerdì presidio banco.

## Chiusura loop

✅ **Registrato 15/7 12:56** in `memoria-squadra/account-negozi.md` — scorecard verita/completezza/onesta/anti-doppione: 5/5.
