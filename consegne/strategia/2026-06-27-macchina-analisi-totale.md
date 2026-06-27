---
titolo: La macchina di analisi TOTALE — l'AD che ragiona come una multinazionale
data: 2026-06-27 17:05
autore: AD digitale
colore: 🟢
---

# 🧠 La macchina di analisi TOTALE
> Non "più numeri": un **sistema d'analisi** completo, perché all'AD non sfugga
> niente. Questo doc estende `2026-06-27-mappa-analisi-e-buchi.md`: lì i buchi
> immediati, qui l'**universo completo** + l'architettura che lo rende da multinazionale.

---

## 1. Il salto mentale: 4+1 ALTITUDINI (oggi viviamo solo sulla prima)
Una multinazionale analizza ogni cosa su 5 livelli. MyCity oggi sta quasi tutto al 1°.
1. **Descrittiva** — *cosa è successo*. (✅ ce l'abbiamo: i ~50 KPI del Pannello.)
2. **Diagnostica** — *perché*. Root-cause: l'ordine è sceso perché meteo? prezzo?
   un negozio fermo? (⚠️ solo nel giro, a mano.)
3. **Predittiva** — *cosa succederà*. Forecast domanda/incasso/churn a 7-30-90gg. (❌)
4. **Prescrittiva** — *cosa fare*, con simulazione del ritorno. (⚠️ azioni pronte sì,
   ma senza modello "se faccio X, succede Y".)
5. **Anticipatoria / foresight** — *cosa POTREBBE succedere*. Scenari, war-game,
   pre-mortem ("se Glovo taglia le fee?"). (❌ — è ciò che distingue un CEO.)
> Regola d'oro: ogni numero importante deve salire la scala fino alla 5. Oggi si ferma all'1.

## 2. La PIRAMIDE DELLE CADENZE (l'analisi giusta al tempo giusto)
- **Real-time / a evento** — anomaly detection, frodi, sito giù. (⚠️ solo soglie fisse)
- **Giornaliera** — battito, alert, piano del mattino/sera. (✅)
- **Settimanale** — review squadra, funnel, coorti. (⚠️ parziale)
- **Mensile** — strategia, P&L, unit economics, OKR. (⚠️ citata, non strutturata)
- **Trimestrale** — board review, market sizing, riallocazione capitale/sforzo. (❌)
- **Annuale** — budget, scenari, piano strategico. (❌)
> Oggi copriamo bene giorno+settimana. Mancano il **real-time intelligente** e il
> **trimestrale/annuale** (la testa strategica).

## 3. La MAPPA "NIENTE SFUGGE" — 12 funzioni di una multinazionale
Legenda: ✅ c'è · ⚠️ parziale · ❌ manca.

### 💶 A. Finanza & Tesoreria (CFO)
- ⚠️ Unit economics aggregata · ⚠️ Trend 30g + proiezione lineare
- ❌ **Margine di contribuzione per ordine** (ricavo − costo consegna − fee − rimborsi)
- ❌ **Cassa / runway / burn** (quanti mesi di autonomia)
- ❌ **Budget vs reale (varianza)** per reparto
- ❌ **Price/fee elasticity** (quanto possiamo muovere prezzi e commissioni)
- ❌ **Riconciliazione Stripe ↔ DB ↔ STATO.md** (una sola verità sui soldi)
- ❌ **Allocazione capitale/sforzo**: ranking ROI di TUTTE le iniziative aperte
- ❌ **Perdite per frode/chargeback** (tasso e trend)

### 📈 B. Crescita & Marketing
- ❌ **CAC per canale** + **rapporto LTV:CAC** (la metrica madre dell'efficienza)
- ❌ **Attribuzione**: da quale canale arriva ogni cliente/ordine
- ❌ **Funnel** home→prodotto→carrello→checkout→pagato, drop-off per passo
- ❌ **ROI/ROAS per campagna**
- ❌ **K-factor / referral loop** (motore di crescita organica)
- ❌ **Share of voice / brand awareness** a Piacenza
- ⚠️ SEO/organico (radar lo nomina, nessun dato)

### 🤝 C. Vendite (acquisizione negozi — B2B)
- ⚠️ Soglia "pochi negozi"
- ❌ **Pipeline & funnel vendite** (lead→contattato→onboarding→LIVE→primo ordine)
- ❌ **Win/loss analysis**: perché una bottega dice sì o no
- ❌ **Sales velocity** (giorni lead→LIVE) e **copertura per categoria/zona**
- ❌ **Domanda non soddisfatta**: ricerche a 0 risultati = categorie da reclutare

### 📦 D. Prodotto
- ✅ Radiografie codice/design (on-demand)
- ❌ **Adozione/uso feature** · ❌ **risultati A/B** · ❌ **time-to-value**
- ❌ **Search analytics** (cosa cercano e non trovano)
- ❌ **Prioritizzazione roadmap** (RICE) · ❌ **catalogo** (best-seller/mai-venduti)

### 🛵 E. Operations & Logistica
- ✅ Tempo medio consegna · ✅ in-corso · ✅ annullati
- ❌ **Cost-to-serve per ordine/zona** (il vero margine operativo)
- ❌ **Utilizzo rider / capacità nei picchi**
- ❌ **Demand forecasting** (prevedere i picchi e coprirli)
- ❌ **Efficienza dei giri** (densità, ordini per uscita)

### 🎧 F. Cliente / CX
- ⚠️ Media recensioni
- ❌ **NPS / CSAT / CES** · ❌ **churn analysis con le CAUSE**
- ❌ **Temi dei reclami** (sentiment testuale, non solo voto)
- ❌ **Esperienza del primo ordine** (il momento che decide la retention)

### 👥 G. Org & Persone (qui: la flotta di agenti)
- ⚠️ Budget AI
- ❌ **Produttività & ROI per reparto** (chi rende, chi brucia)
- ❌ **Calibrazione previsto-vs-reale** (chi stima bene → più autonomia)
- ❌ **Qualità del lavoro** (rubrica + valutatore indipendente, sistematico)
- ❌ **Skill-gap → crea nuovo agente** (meta-capacità)

### ⚖️ H. Rischio · Legale · Compliance · Trust
- ✅ Radiografia sicurezza/RLS/privacy (on-demand)
- ❌ **Concentration risk** (1 negozio/cliente/rider = X% del GMV → fragilità)
- ❌ **Business continuity / single point of failure** (Stripe? l'unico dev? un rider?)
- ❌ **Compliance CONTINUA** (GDPR, fatturazione, HACCP — non solo a richiesta)
- ❌ **Frodi & trust-safety** (account multipli, abuso resi, recensioni finte)
- ❌ **Rischio reputazionale** (cosa si dice di noi fuori)

### 🧭 I. Strategia & Corporate Development
- ⚠️ Radar competitor (parziale)
- ❌ **Market sizing & quota** (TAM/SAM/SOM Piacenza, quanto abbiamo preso)
- ❌ **War-gaming / scenari** (mosse dei concorrenti, nostre contromosse)
- ❌ **Moat / difendibilità** (perché non ci copiano)
- ❌ **Tracking OKR** (target aziendali vs reale, non solo per-reparto)

### 🗄️ J. Dati & BI (governance)
- ⚠️ Self-diagnosi macchina (cuore parziale)
- ❌ **Qualità del dato** (badge "dati non affidabili" già abbozzato nel codice)
- ❌ **Coerenza definizioni KPI** (GLOSSARIO-KPI: una metrica = una formula)
- ❌ **Anomaly detection STATISTICO** (deviazioni su QUALSIASI numero, non soglie fisse)

### 🌍 K. Macro / Esterno (PESTEL)
- ✅ Radar: meteo, eventi, concorrenti, bandi, ZTL (buona copertura)
- ⚠️ Mancano: inflazione/spesa locale, demografia, trend tecnologici strutturati

### 🎯 L. Volontà del proprietario (Nicola)
- ❌ **Analisi dei Piani / intenzioni** (primi negozi, mosse, scadenze) — vedi doc 1

## 4. Le NUOVE analisi più importanti (oltre quelle del primo doc)
In ordine di impatto per una multinazionale (e per noi, fase 0→1):
1. **LTV:CAC per canale** — la bussola della crescita: ogni euro speso, quanto torna.
2. **Margine di contribuzione per ordine/zona** — sapere quali ordini *perdono* soldi.
3. **Forecasting multi-scenario** (best/base/worst) su domanda, incasso, churn, cassa.
4. **Anomaly detection statistico** su tutte le metriche — non aspettare la soglia fissa.
5. **Concentration risk & single-point-of-failure** — cosa ci uccide se si rompe.
6. **War-gaming competitivo** — simulare le mosse di Glovo/CompraPiacenza e rispondere.
7. **Search analytics / domanda non soddisfatta** — oro puro per dire a vendite chi reclutare.
8. **Funnel + NPS/churn-reasons** — il perché del cliente, non solo il quanto.
9. **Allocazione sforzo/capitale** — ranking ROI di tutte le iniziative, dove spingere.
10. **Cost-to-serve & demand forecasting operativo** — margine e copertura rider reali.

## 5. I 3 PRINCIPI che la rendono "multinazionale" (non solo lista lunga)
1. **Una sola verità.** Tutti i numeri riconciliati (DB ↔ Stripe ↔ vault ↔ PostHog),
   un GLOSSARIO-KPI con una formula per metrica. Niente numeri divergenti in giro.
2. **Niente metrica orfana.** Ogni numero ha un **proprietario** (un reparto), una
   **soglia**, e un'**azione** quando si muove. Se un numero non innesca nulla, si toglie.
3. **Anomaly detection > soglie fisse.** La macchina impara il "normale" di ogni
   metrica e segnala le **deviazioni**, invece di aspettare regole assolute scritte a mano.
+ La spina dorsale: la **scala a 5 altitudini** (§1) applicata a OGNI numero che conta.

## 6. Come ci arriviamo (senza indigestione)
Non si costruiscono 40 analisi insieme. Si costruisce il **telaio** e poi si appendono:
- **Telaio:** un "data layer" che calcola coorti/segmenti una volta e li riusa
  (oggi ogni metrica riparte da zero); il GLOSSARIO-KPI; l'anomaly detector generico.
- **Poi le analisi**, in ondate: ① le 4 del primo doc → ② Finanza+Crescita (CAC/LTV,
  margine, funnel) → ③ Rischio+Strategia (concentration, war-game, forecast) → ④ Org+governance.

> Tutte 🟢 in analisi; 🟡/🔴 solo quando agiscono. Serve da Nicola: la rotta (da quale
> ondata partire) e la conferma su quali tabelle/fonti (products, Stripe payout, PostHog) sono leggibili.
