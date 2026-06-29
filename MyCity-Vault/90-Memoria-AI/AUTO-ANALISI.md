---
data: 2026-06-29 11:30
tipo: auto-analisi
fonte: AD digitale — cancello di serietà (verifica avversariale)
---

# 🔬 Auto-analisi del giro — 2026-06-29 11:30

## Voto di fiducia: 88 / 100 — trend ▲ (da 87)
+1 punto: dati Supabase riverificati live su tutte le tabelle rilevanti (profiles, orders, order_items,
activity_events, user_carts, abandoned_carts, merchants_leads), radar intelligence aggiornato con fonti
citate (bando ER confermato 22gg, Ex Scuderie 🆕, Venerdì Piacentini record, meteo 37°C), 3 file
intelligence aggiornati, nuova opportunità (bando ER) accodata come 🟡. Nessuna entità introdotta senza
fondamento. Non è 100 perché Stripe e PostHog restano ciechi, i buchi di mercato sono ancora a ~70%, e lo
stallo a ~125h resta non sbloccabile dalla macchina (tutte le azioni sono 🔴).

## Errori per gravità

### Bassa — Stallo a ~125h osservato ma non sbloccabile dalla macchina
La macchina documenta lo stallo da 3 giri consecutivi ma tutte le azioni per sbloccarlo (transazione Casa
Linda, ordine zombie) sono 🔴 in attesa di firma. Il valore della macchina è fare, non solo osservare.
**Azione:** escalato come priorità 🔴 n.1 in STATO e briefing.

### Bassa — Buchi di mercato a confidenza ~70% da 3 giri
Gastronomia centro, delivery diurno, regalo locale restano ipotesi non blindate (manca listino-fee Glovo +
dati ordini food interni). **Azione:** dichiarati come ipotesi con confidenza esplicita + carburante mancante.

Nessun errore medio/grave. Nessuna entità inventata, nessun numero orfano, nessuna 🔴 travestita da 🟢.

## Grounding delle entità (3 strade)
- **DB Memoria** → `confermato` (riverificato 29/6).
- **Casa Linda** → `confermato` (seller approvato, payout attivo acct_1TcI1vIb6nEnAk4o, 26 prodotti).
- **Pane Quotidiano** → `confermato` (seller approvato, Stripe acct_1TifANEq35Z9pThc, payout non attivo).
- **Garetti** → `scelta_ragionata` (prospect, fondato su campo-aperto-faro.md + fatti pubblici, non nel DB).
- **Ex Scuderie** → `scelta_ragionata` 🆕 (3 spazi food approvati dal Comune, fonte PiacenzaSera, pipeline futura).

## Domande per Nicola
1. 🔴 **Forzo la prima transazione con Casa Linda?** — 125h a zero, unico payout-ready. Se sì → vendite+operations su Casa Linda.
2. 🔴 **Sblocco l'ordine zombie €19,05?** — Fermo da 5 giorni, buyer nel limbo. Propongo nota al buyer + aggiornamento status.

## Salute della macchina
- **Supabase (marketplace):** ✅ ok, `ACTIVE_HEALTHY`, dati freschi 29/6 ~11:20.
- **Supabase (memoria):** ✅ ok, `xjljcsorpbqwttrejqte` ACTIVE_HEALTHY.
- **Stripe:** ⚪ non interrogato (MCP non collegato).
- **PostHog:** 🔴 non collegato.
- **Dati freschi:** ✅ sì. **Sensori attivi:** 2.

## Punti ciechi
- Stripe e PostHog non letti → incassi/payout e traffico non riconciliati.
- Buchi di mercato a ~70%: mancano dati food interni + listino-fee Glovo.
- Azioni offline di Nicola non visibili.

## Cosa miglioro al prossimo giro
- Interrogare Stripe (se MCP collegato).
- Produrre Kit Bando ER come azione concreta.
- Dimensionare buchi di mercato con dati order_items food.
- Verificare stato ordine zombie.
