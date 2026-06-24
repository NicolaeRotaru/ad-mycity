# 📊 Metriche & KPI

> Vista **Data**. Unisce la mappa metriche di base e l'analisi KPI avanzata. Strumenti: **Supabase** (fonte di verità transazioni) + **PostHog** (comportamento, free). Collega a [[Finanza & Unit Economics]] · [[Strategia & Fossato]].

## ⭐ North Star Metric
**Ordini qualificati consegnati / settimana** = consegnati a **clienti unici**, **entro la finestra promessa**, **senza rimborso**, con **item-fill ≥90%**.

Perché: cattura tutti e 3 i lati del marketplace in un solo numero — c'è offerta (un negozio ha listato), c'è domanda (un cliente ha comprato), c'è evasione (consegnato bene). Conta sia il **grezzo** (volume) sia il **qualificato** (qualità); il gap tra i due è esso stesso un allarme.
- Input che la guidano: **WAC × frequenza × tasso completamento × % ordini batchabili**.
- Metrica di supporto early-stage (numeri piccoli): **% negozi attivi con ≥1 ordine negli ultimi 7gg** (misura se l'offerta è "viva").
- ❌ **Non** usare come NSM: GMV, download, n. negozi onboardati.

## 🎯 Funnel marketplace (con benchmark e dove si perde)
`Visita → Ricerca → Scheda prodotto → Carrello → Checkout → Pagamento → Evasione negozio → Consegna → Recensione → Riacquisto`

| Step | Benchmark / dove si perde |
|---|---|
| Visita → Ricerca | 60-75% |
| Ricerca → Scheda | 70-85% |
| Scheda → **Carrello** | 8-15% (~7-9% cumulato) → **1° dirupo** |
| Checkout → **Pagamento** | abbandono ~50-61% → **2° dirupo** |
| Consegna → Riacquisto | 30-45% |

Perdita **invisibile**: l'**item-fill** (ordine consegnato ma manca merce) distrugge il riacquisto senza apparire nel funnel.
Owner per step: [[Ricerca e Navigazione Catalogo]] → [[Scheda Prodotto]] → [[Carrello e Checkout]] → [[Pagamenti e Payout Venditori]] → [[Gestione Stato Ordine]] → [[Tracking Live Consegna]] → [[Recensioni e Rating Prodotti]] → [[Programma Referral]].

## 🔁 Retention per COORTE SETTIMANALE (la spesa è settimanale)
Target PMF: **W1 50% → W4 30% → W12 ≥25% e curva PIATTA**. Il segnale che conta è il **plateau** (flattening). Se la curva continua a scendere → **NON scalare** (secchio bucato).
- Churn clienti **<15%/mese** · churn negozi **<5%/mese** · **Quick Ratio >1,5**.

## 💶 Unit economics (le metriche-soldi → dettaglio in [[Finanza & Unit Economics]])
Take rate **15-25%** · **CM per ordine >€0** (la più importante, dipende dal batching) · **CAC per canale** (mai aggregato) · **LTV/CAC ≥3** · payback **<6 mesi**.

## 📋 KPI per area (→ [[Roadmap & Stato Prodotto]] · le aree in [[Area - Venditori]] ecc.)
- **Venditori** `#ebay`: n. negozi attivi (≥1 listing) · tempo onboarding (signup→primo prodotto live) · % negozi con ≥1 ordine/sett · GMV per negozio.
- **Catalogo** `#amazon`: n. prodotti pubblicati · search success rate (% ricerche con ≥1 risultato cliccato) · conversion scheda→carrello.
- **Consegna** `#glovo`: % ordini on-time · tempo medio consegna (ordine→porta) · tasso ordini falliti/annullati per cause logistiche.
- **Pagamenti** `#amazon #ebay`: checkout completion rate · tempo di payout al venditore · % pagamenti falliti/contestati.
- **Fiducia** `#amazon #ebay`: rating medio prodotti/venditori · % ordini con recensione · tasso reso/dispute · CSAT / tempo prima risposta.
- **Crescita** `#amazon`: MAU · retention 30gg · CAC vs LTV · % ordini da clienti di ritorno.
- **Ops** `#glovo`: ordini gestiti per operatore · tempo medio accettazione ordine dal negozio · % anomalie risolte <X min.

## 🗓️ Cruscotto settimanale per fase (una pagina, ogni lunedì)
- **Fase "primo ordine":** NSM · tasso completamento ≥85% · item-fill ≥90% · on-time ≥85% · repeat rate · problemi qualitativi (leggere ogni ordine).
- **Fase "cluster":** NSM (+10-20%/sett) · WAC · retention W4 ≥25% · % ordini batch ≥50% · CM/ordine >€0 · % negozi attivi ≥60%.
- **Fase "scala":** NSM · LTV/CAC ≥3 · payback <6 mesi · retention W12 plateau · churn negozi <5%.

## 📈 Leading vs lagging (guida sui leading)
- Churn clienti in arrivo → **tempo tra 1° e 2° ordine si allunga** (leading) prima che il repeat rate crolli (lagging).
- Churn negozi → tempo di accettazione ↑ / item-fill di quel negozio ↓.
- Unit economics → batch size ↓.

## 🛠️ Strumentazione giorno 1
5 eventi PostHog (`viewed_catalog`, `added_to_cart`, `started_checkout`, `purchase_completed`, `order_delivered`) + **UTM su ogni QR/link** + codici referral/negozio + tabella `orders` Supabase con tutti i timestamp (created/paid/accepted/picked_up/delivered + promised_window + items_ordered/fulfilled + batch_id) → ogni metrica è una query SQL. Cruscotto = Google Sheet, ~20 min/sett.

## 🧪 I primi 4 esperimenti
1. **Ordine minimo** (€15→20→25): arbitro = CM totale settimanale, non l'AOV.
2. **Prezzo consegna** (€2,90 vs €3,90 vs gratis sopra €30): elasticità + CM dopo batching.
3. **Slot stretti vs "appena pronto"**: massimizza batch size.
4. **Nudge 2° ordine** (sconto vs reminder vs nulla): % 2° ordine entro 14gg.
> Disciplina: 1 metrica di successo dichiarata prima, 1 cosa per volta, ≥2 settimane, guardrail su NSM/item-fill.

## 🔢 I 7 numeri che governano MyCity
NSM · retention coorte (plateau ≥25%) · % ordini batch (≥50-60%) · CM/ordine (>€0) · item-fill (≥90%) · WAC+repeat rate · LTV/CAC (≥3).
➡️ **Sequenza:** prima CM positivo (batching+minimo+fee), poi retention al plateau, **solo dopo** acquisisci/scala.

### Fonti
[a16z – 13 marketplace metrics](https://a16z.com/13-metrics-for-marketplace-companies/) · [Lenny – marketplace metrics](https://www.lennysnewsletter.com/p/the-most-important-marketplace-metrics) · [Shopify – cohort retention](https://www.shopify.com/ca/blog/cohort-retention-analysis) · [Cart abandonment by industry](https://www.clickpost.ai/blog/cart-abandonment-rate)

#metriche #kpi #data #mvp #priorità/alta
