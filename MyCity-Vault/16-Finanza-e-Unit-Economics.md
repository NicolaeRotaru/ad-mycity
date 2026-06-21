# 💶 16 — Finanza & Unit Economics (vista CFO)

> Sintesi azionabile. 🟢 fonte · 🟡 assunzione da validare · 🔴 dato critico da raccogliere. Collega a [[09-Ricerca-Mercato-e-Numeri]] · [[23-Metriche-e-KPI]].

## Il conto che decide tutto: contribution margin per ordine
Assunzioni 🟡: AOV €50 · commissione 12% (€6) · fee consegna €3,50 · costo rider €7/giro · packaging €1,20 · Stripe €1,37.
Ricavo/ordine = **€9,50**. Costo variabile non-rider = **€2,57**.

| Ordini/giro | Costo rider/ordine | **CM/ordine** |
|---:|---:|---:|
| 1 | €7,00 | **−€0,07** 🔴 perde |
| 2 | €3,50 | **+€3,43** |
| 3 | €2,33 | **+€4,60** |
| 5 | €1,40 | **+€5,53** |

➡️ **L'ordine singolo perde. Il margine nasce dal batching.** Target operativo: **4-6 ordini/giro**. Regola: **≥2 ordini/giro o non consegni**.

## Break-even
Costi fissi Anno 1 ~€4.000/mese (fondatore parz. pagato + marketing). CM medio ~€5,18.
→ Break-even ≈ **160 ordini/sett** ≈ **~150-320 clienti attivi** (secondo la frequenza). 
✅ **Non servono 1000 clienti per il pareggio: ne bastano ~150-320.** I 1000 sono il punto in cui MyCity genera cassa.

## Architettura ricavi (il margine è nel MIX, non nella commissione)
Anno 1: commissione ~55% · fee consegna ~30% · resto. A regime aggiungere **abbonamento, box DOP spediti, welfare B2B, fee promozione negozi** (margine quasi puro). Un marketplace di sola commissione+consegna NON chiude (vedi Cortilia: 45M€ ricavi, −7,6M€).

## Proiezione 3 anni 🟡
| | Anno 1 | Anno 2 | Anno 3 |
|---|---:|---:|---:|
| Negozi | 8 | 30 | 70 |
| Clienti attivi | 250 | 900 | 2.500 |
| GMV | €325k | €1,72M | €6,44M |
| Ricavi MyCity | €62k | €360k | €1,48M |
| EBITDA | −€26k | −€25k | **+€330k** |

## Capitale e runway
Fabbisogno fino al break-even: **~€120-180k**. Coprire **a tasso zero/fondo perduto PRIMA dell'equity**: Smart&Start + ON Tasso Zero + bandi ER ([[12-Bandi-e-Finanziamenti]]). Equity solo in Anno 3 a valutazione alta. Con €150k e burn ~€3-4k/mese → >30 mesi di autonomia. **Il rischio non è il runway, è la frequenza.**

## Le 3 leve di redditività (in ordine)
1. **Ordini/giro (densità)** — l'unica che porta il CM da negativo a +€5.
2. **Take rate / mix** — +3 punti commissione = +30% CM; abbonamenti e promo = margine puro.
3. **AOV × frequenza** — la frequenza guida l'LTV.

## KPI finanziari (target)
CM/ordine **≥ +€4** · CAC **< €30** · LTV cliente fedele **~€400** · **LTV/CAC ≥ 3** (stima MyCity ~16:1 se frequenza settimanale regge) · payback < 12 mesi.

## 🔴 Da raccogliere prima di scalare
Frequenza reale di riacquisto (la metrica che può uccidere) · AOV reale (crolla sotto €45) · ordini/giro reali · WTP negozi/clienti · costo rider reale post-CCNL.

### Fonti
[Cortilia 2024 −7,6M€](https://www.alimentando.info/cortilia-crescita-del-fatturato-ma-perdita-ancora-pesante-7-641-159-euro/) · [Stripe Connect pricing](https://stripe.com/connect/pricing) · [Route density −20/30%](https://cigotracker.com/blog/route-density-profitability/) · [LTV/CAC seed benchmark](https://qubit.capital/blog/ltv-cac-benchmarks-ecommerce-seed-rounds)

#finanza #unit-economics #cfo #priorità/alta
