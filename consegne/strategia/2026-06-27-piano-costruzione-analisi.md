---
titolo: Piano di costruzione della macchina di analisi — sequenza in 6 ondate
data: 2026-06-27 17:45
autore: AD digitale
colore: 🟢
stato: DA APPROVARE
---

# 🏗️ Piano unico — come costruiamo la macchina di analisi (6 ondate)

> Sintesi operativa dei 3 doc di strategia (mappa-buchi · macchina-totale · radar-totale).
> Ordine guidato da **dipendenze** (prima il telaio, poi ciò che vi si appende) e da
> **valore/costo** (prima i quick win su dato già pronto). Ogni analisi è 🟢 finché
> *analizza*; diventa 🟡/🔴 solo quando *agisce* sul mondo.

---

## Principio di sequenza
1. **Prima le fondamenta** (Ondata 0): senza una "sola verità" e un data-layer riusabile,
   ogni analisi sopra nasce fragile e si contraddice.
2. **Poi i quick win** (Ondata 1): massimo valore, dato già disponibile, costo basso.
3. **Poi soldi/crescita → esterno → testa strategica → governo** (Ondate 2-5).
> Si appende un'analisi nuova solo quando il suo "gancio" (telaio/dato/fonte) è pronto.

---

## ONDATA 0 — Le FONDAMENTA (il telaio) · costo medio · 🟢/🟡
Obiettivo: una sola verità, dati riusabili, e la certezza che la macchina giri.
| # | Analisi/strumento | Cosa fa | Dipende da | Sblocca |
|---|---|---|---|---|
| 0.1 | **GLOSSARIO-KPI** | una metrica = una formula, un proprietario | — | tutto |
| 0.2 | **Data-layer riusabile** | coorti/segmenti/ordini calcolati una volta, riusati | accesso DB | 1.2,1.3,2.* |
| 0.3 | **Riconciliazione & qualità dato** | DB↔Stripe↔STATO.md; badge "dati non affidabili" 🟡 | Stripe MCP | fiducia nei numeri |
| 0.4 | **Motore anomaly (statistico)** | deviazioni su QUALSIASI metrica, non soglie fisse | 0.2 | alert intelligenti |
| 0.5 | **Self-diagnosi macchina** | cron? memoria? briefing freschi? budget? sentinelle? | — | che tutto giri |
| 0.6 | **Motore di monitoraggio web** | "mani" di lettura continua delle fonti (builder) | ok Nicola | Ondata 3 |

## ONDATA 1 — QUICK WIN (dato già pronto, alto valore) · costo basso · 🟢
| # | Analisi | Perché ora | Dato |
|---|---|---|---|
| 1.1 | **Intenzioni di Nicola (Piani)** | allinea l'AD a te, pre-prepara il materiale (la tua idea) | vault |
| 1.2 | **Retention / coorti / LTV** | la verità della crescita, costo ~zero | orders(user_id) |
| 1.3 | **Health per negozio** | sblocca account-negozi, protegge l'asset critico | orders.seller |
| 1.4 | **Pattern temporali** | ore/giorni di punta → push e copertura rider | orders.created_at |

## ONDATA 2 — SOLDI & CRESCITA · costo medio · 🟢
| # | Analisi | Perché | Dipende da |
|---|---|---|---|
| 2.1 | **CAC per canale + LTV:CAC** | la bussola dell'efficienza | 1.2, attribuzione |
| 2.2 | **Funnel di conversione** | dove si abbandona → CRO | PostHog paths |
| 2.3 | **Margine di contribuzione per ordine/zona** | quali ordini perdono soldi | 0.2, cost-to-serve |
| 2.4 | **Catalogo + search analytics** | best-seller, mai-venduti, domanda non soddisfatta | products/order_items* |
| 2.5 | **Cassa / runway / burn** | mesi di autonomia (fase 0→1) | finanza |

## ONDATA 3 — ESTERNO TOTALE (radar bidirezionale) · costo medio · 🟢/🟡
| # | Analisi | Cosa aggiunge |
|---|---|---|
| 3.1 | **Radar IN/OUT + leve in uscita** | la metà mancante: cosa MyCity può influenzare |
| 3.2 | **Catene indirette (2°-3° ordine)** | univ./logistica/Po-PM10/bollette/sport/parrocchie |
| 3.3 | **Competitor tracking strutturato** | snapshot prezzi/fee/zone/promo nel tempo |
| 3.4 | **Brand & reputation monitoring** | cosa si dice di noi e dei negozi (Google/social/gruppi) |
| 3.5 | **Calendario-città unico** | eventi/sagre/sport/meteo/ZTL a 7-30gg → picchi |
| 3.6 | **Grafo d'influenza** | da lista a mappa di nodi e frecce |

## ONDATA 4 — TESTA STRATEGICA (foresight) · costo medio-alto · 🟢
| # | Analisi | Perché |
|---|---|---|
| 4.1 | **Forecasting multi-scenario** | domanda/incasso/churn/cassa best-base-worst |
| 4.2 | **War-gaming competitivo** | "se Glovo taglia le fee?" → contromosse |
| 4.3 | **Concentration risk / SPOF** | dipendenza da 1 negozio/cliente/rider/fornitore |
| 4.4 | **Allocazione sforzo/capitale** | ranking ROI di tutte le iniziative |
| 4.5 | **Market sizing & quota** | TAM/SAM/SOM Piacenza, quanto abbiamo preso |

## ONDATA 5 — GOVERNO & QUALITÀ · costo medio · 🟢
| # | Analisi | Perché |
|---|---|---|
| 5.1 | **Produttività & ROI per reparto** | chi rende, chi brucia budget |
| 5.2 | **Calibrazione previsto-vs-reale** | chi stima bene → più autonomia |
| 5.3 | **Pre-mortem di sistema (gate)** | prima di ogni 🟡/🔴: cosa si rompe a valle |
| 5.4 | **Qualità sistematica** | rubrica + valutatore indipendente sul lavoro importante |

---

## Dipendenze critiche (il percorso)
`0.1+0.2 → 1.2/1.3 → 2.1/2.3` · `0.6 → 3.*` · `0.4 → anomaly su interno+esterno` ·
`1.2 → 2.1 (serve LTV per LTV:CAC)` · `2.3 ← cost-to-serve (operations)`.

## Serve da Nicola (conferme, prima di partire)
- ✅ Via libera al piano e da quale ondata partire (consiglio: **Ondata 0 + 1.1 in parallelo**,
  perché 1.1 non dipende dal telaio e ti dà valore subito).
- 🔑 Conferma fonti leggibili dalla chiave di sola lettura: **`products`/`order_items`** (per 2.4),
  **Stripe payout** (per 0.3), **PostHog paths** (per 2.2).
- 🔌 Ok ad attivare le "mani" di lettura web (builder-automazioni) per l'Ondata 3.
- 💶 Le analisi sono 🟢; le **azioni** che ne nascono (PR, contatti, sponsor, spese) restano 🔴.

## Come lo eseguiamo
Ogni ondata = un blocco di lavoro con i senior giusti (analista/finanza/data-engineer per
i numeri; intelligence/builder per il web; security per gli accessi). Output sempre doppio:
**analisi nel vault** + **card nel Pannello**. A fine ondata: spot-check di qualità prima di passare oltre.
