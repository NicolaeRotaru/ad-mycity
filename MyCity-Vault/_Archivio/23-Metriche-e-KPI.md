# 📊 23 — Metriche & KPI (vista Head of Data)

> Strumenti: **Supabase** (fonte di verità transazioni) + **PostHog** (comportamento, free). Collega a [[04-Metriche]] · [[16-Finanza-e-Unit-Economics]].

## North Star (confermata, affinata)
**Ordini qualificati consegnati / settimana** = consegnati a clienti unici, **entro la finestra promessa, senza rimborso, con item-fill ≥90%**. Conta sia il grezzo (volume) sia il qualificato (qualità); il gap è esso stesso un allarme.
Input che la guidano: WAC × frequenza × tasso completamento × % ordini batchabili.
❌ Non usare come NSM: GMV, download, n. negozi onboardati.

## Funnel (con benchmark e dove si perde)
Visita → Ricerca (60-75%) → Scheda (70-85%) → **Carrello (8-15% → ~7-9% cumulato, 1° dirupo)** → Checkout → **Pagamento (abbandono ~50-61%, 2° dirupo)** → Evasione negozio → **Consegna** → Recensione → Riacquisto (30-45%).
Perdita invisibile: **item-fill** (ordine consegnato ma manca merce) → distrugge il riacquisto senza apparire nel funnel.

## Retention per COORTE SETTIMANALE (la spesa è settimanale)
Target PMF: W1 50% → W4 30% → **W12 ≥25% e curva PIATTA**. Il segnale che conta è il **plateau** (flattening). Se la curva continua a scendere, **NON scalare** (secchio bucato).
Churn clienti <15%/mese · churn negozi <5%/mese · Quick Ratio >1,5.

## Unit economics
Take rate 15-25% · **CM per ordine >€0** (la più importante, dipende dal batching) · CAC **per canale** (mai aggregato) · **LTV/CAC ≥3** · payback <6 mesi.

## Cruscotto settimanale per fase (una pagina, ogni lunedì)
- **Fase "primo ordine":** NSM · tasso completamento ≥85% · item-fill ≥90% · on-time ≥85% · repeat rate · problemi qualitativi (leggere ogni ordine).
- **Fase "cluster":** NSM (+10-20%/sett) · WAC · retention W4 ≥25% · % ordini batch ≥50% · CM/ordine >€0 · % negozi attivi ≥60%.
- **Fase "scala":** NSM · LTV/CAC ≥3 · payback <6 mesi · retention W12 plateau · churn negozi <5%.

## Leading vs lagging (guida sui leading)
Churn clienti in arrivo → **tempo tra 1° e 2° ordine si allunga** (leading) prima che il repeat rate crolli (lagging). Churn negozi → tempo accettazione ↑ / item-fill di quel negozio ↓. Unit economics → batch size ↓.

## Strumentazione giorno 1
5 eventi PostHog (`viewed_catalog`, `added_to_cart`, `started_checkout`, `purchase_completed`, `order_delivered`) + UTM su ogni QR/link + codici referral/negozio + tabella `orders` Supabase con tutti i timestamp (created/paid/accepted/picked_up/delivered + promised_window + items_ordered/fulfilled + batch_id) → ogni metrica è una query SQL. Cruscotto = Google Sheet, 20 min/sett.

## I primi 4 esperimenti
1. **Ordine minimo** (€15→20→25): arbitro = CM totale settimanale, non l'AOV.
2. **Prezzo consegna** (€2,90 vs €3,90 vs gratis sopra €30): elasticità + CM dopo batching.
3. **Slot stretti vs "appena pronto"**: massimizza batch size.
4. **Nudge 2° ordine** (sconto vs reminder vs nulla): % 2° ordine entro 14gg.
> Disciplina: 1 metrica di successo dichiarata prima, 1 cosa per volta, ≥2 settimane, guardrail su NSM/item-fill.

## I 7 numeri che governano MyCity
NSM · retention coorte (plateau ≥25%) · % ordini batch (≥50-60%) · CM/ordine (>€0) · item-fill (≥90%) · WAC+repeat rate · LTV/CAC (≥3).
➡️ Sequenza: prima CM positivo (batching+minimo+fee), poi retention al plateau, **solo dopo** acquisisci/scala.

### Fonti
[a16z – 13 marketplace metrics](https://a16z.com/13-metrics-for-marketplace-companies/) · [Lenny – marketplace metrics](https://www.lennysnewsletter.com/p/the-most-important-marketplace-metrics) · [Shopify – cohort retention](https://www.shopify.com/ca/blog/cohort-retention-analysis) · [Cart abandonment by industry](https://www.clickpost.ai/blog/cart-abandonment-rate)

#metriche #kpi #data #priorità/alta
