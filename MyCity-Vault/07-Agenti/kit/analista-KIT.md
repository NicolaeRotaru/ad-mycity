---
tipo: kit-mestiere
ruolo: analista
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso lunedì (dati Supabase + PostHog puliti)
collegato: [[GLOSSARIO-KPI]] · [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · .claude/agents/analista.md
---

# 🧰 KIT MESTIERE — analista (il "cervello allenato" del fuoriclasse)

> Il mansionario (SCHEDA MESTIERE + Carta) dice *chi sei* e *come ragioni* (strati 1-2): coorti>medie,
> driver-tree, riflesso diagnostico, loop di rigore, confidenza %. **Questo kit NON ripete quello.** Aggiunge
> ciò che un L7 *sa a memoria e applica a riflesso*: i modelli quantitativi precisi, i pattern SQL pronti,
> le soglie statistiche da tenere in testa, e i template che rendono ogni numero scommettibile. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]) = corretto + azionabile + calibrato.

---
# 📚 STRATO 3 — SAPERE (il modello quantitativo del marketplace, a memoria)

## A. La gerarchia dei KPI: dalla North Star al driver-tree (non guardare mai il top-line da solo)
- **North Star di un marketplace a domicilio = ordini completati ricorrenti** (clienti che riordinano), non
  GMV grezzo né iscritti. Il GMV può salire per un picco una tantum (un evento, un grosso ordine) mentre la
  salute peggiora. La North Star deve correlare con *valore creato per il cliente* e *ricavo ripetibile*.
- **Il driver-tree canonico (impararlo, scenderci sempre):**
  - `GMV = ordini completati × AOV`
  - `ordini = clienti attivi × frequenza d'ordine` *oppure* `sessioni × conversione`
  - `clienti attivi = nuovi (acquisizione) + tornati (retention) − persi (churn)`
  - `Ricavo MyCity = GMV × take-rate − costi variabili (consegna, payment, refund)`
  - `Margine di contribuzione/ordine = ricavo − (costo consegna + fee Stripe + refund/chargeback medio)`
  → Quando un numero si muove, **non commentare il top-line**: scendi finché trovi il *singolo* driver che
  ha cambiato. "GMV −12%" non è un'analisi; "GMV −12% perché la frequenza è scesa da 1.8 a 1.4 ordini/cliente
  mentre AOV e nuovi clienti sono stabili" è l'inizio di un'analisi.

## B. Il funnel AARRR (Pirata) — dove cade la gente, in ordine
- **Acquisition** (arriva) → **Activation** (primo valore: 1° ordine completato) → **Retention** (torna) →
  **Referral** (porta altri) → **Revenue** (paga/margine). Ogni stadio ha il suo tasso e il suo denominatore.
- **Regola del collo di bottiglia:** ottimizza lo stadio col tasso più basso *moltiplicato per il volume che
  ci passa*. Migliorare del 50% uno stadio dove passano 20 persone vale meno che migliorare del 5% dove ne
  passano 2000. Il funnel si lavora dove il prodotto `passaggio × leva` è massimo.
- **Activation è il momento-verità del marketplace:** la differenza tra chi riordina e chi sparisce si gioca
  quasi tutta nel *primo ordine* (consegna puntuale, prodotto giusto, esperienza). Misura sempre
  `% di chi fa il 2° ordine entro 30g del 1°` — è il predittore più forte del LTV.

## C. Coorti > medie (il principio che separa l'analista dal report)
- **Una media è un'allucinazione statistica** quando la distribuzione è bimodale o skewed — e nei marketplace
  lo è *sempre*: pochi clienti fedeli + tanti one-shot. "AOV medio €28" può non descrivere *nessun* cliente
  reale. Spacchetta per: **coorte di acquisizione** (settimana/mese del 1° ordine), **canale** (referral vs
  ads vs organico), **segmento** (frequenza, RFM), **geografia/negozio**.
- **La curva di retention per coorte è la diagnosi di product-market-fit:**
  - **si appiattisce su un plateau > 0** (es. dal mese 2 resta ~25%) → c'è un nucleo che torna = PMF, secchio
    con fondo. Investi in acquisizione: ciò che entra resta in parte.
  - **decade verso lo zero** → secchio bucato: ogni euro di acquisizione cola via. **Smetti di versare,
    tappa il buco** (activation, consegna, assortimento) prima di scalare l'acquisizione.
- **Confronta coorti gemelle, non te-stesso-nel-tempo:** la coorte di marzo vs aprile allo *stesso* mese-di-vita
  (M1 vs M1), non "marzo vs aprile" calendario — altrimenti confondi maturità con performance.

## D. LTV, CAC e unit economics (la matematica che decide se scalare)
- **LTV ≈ margine di contribuzione per ordine × frequenza annua × anni di vita** (o, più pulito,
  `margine/ordine × ordini-vita attesi dalla curva di retention`). **LTV si costruisce dalla coorte**, non
  da una formula astratta: è l'area sotto la curva di retention × margine, non un numero inventato.
- **Le regole-soglia da tenere in testa (benchmark, NON verità MyCity — vanno verificate sui dati reali):**
  - `LTV/CAC ≥ 3` = sano · `< 1` = stai pagando i clienti per andarsene · `> 5` spesso = sotto-investi in crescita.
  - **CAC payback < 12 mesi** (ideale < 6 per cassa fragile early-stage): in quanti mesi il margine recupera il CAC.
  - **Contribution margin per ordine > 0** è la pre-condizione: se ogni ordine perde soldi, il volume peggiora le cose.
  → A early-stage MyCity questi numeri saranno **instabili e rumorosi** (N piccolo): riportali con confidenza
  bassa e range, non come punti secchi.

## E. Statistica di sopravvivenza per un analista (cosa è segnale, cosa è rumore)
- **N piccolo = rumore che domina.** Regola pratica da tenere a mente: sotto **~30 eventi** per gruppo non
  concludere un trend; un `−40% su 5 ordini` (da 5 a 3) è la normale oscillazione di Poisson, non un calo.
  Per una proporzione, l'incertezza va circa come `±1/√N`: con N=25 il margine d'errore è ~±20 punti. **Dichiara
  sempre N e, su N piccolo, di' esplicitamente "non concludibile" invece di raccontare una storia.**
- **Significatività ≠ rilevanza.** Un test A/B "significativo" su un effetto dello 0.3% può essere inutile per
  il business; un effetto grande ma non-significativo (poco campione) merita *più dati*, non una decisione. Per
  un A/B chiediti tre cose: **dimensione dell'effetto**, **N per braccio**, **durata** (≥1 ciclo settimanale
  completo, per non sbilanciarsi sul giorno-della-settimana). Niente "peeking" che ferma il test appena vince.
- **Correlazione ≠ causa — il riflesso di refutazione.** Prima di dire "X ha causato Y" passa i 3 filtri:
  (1) **confondente** — c'è una terza variabile (stagione, festività, promo, meteo PC) che muove entrambi?
  (2) **causalità inversa** — è Y che causa X? (3) **selezione/survivorship** — guardo solo i sopravvissuti?
  Quando non puoi randomizzare, il massimo onesto è "associazione, con questa confidenza", non "causa".
- **Simpson's paradox & mix-shift (la trappola che imbarazza i senior):** l'aggregato può muoversi al
  *contrario* di ogni segmento solo perché è cambiato il **mix** (es. la conversione totale scende mentre sale
  in ogni canale, perché è cresciuto il peso del canale che converte meno). **Prima di spiegare un delta
  aggregato, scomponi per segmento e controlla se è un mix-shift.** È la causa #1 di conclusioni sbagliate.

## F. Confidenza calibrata (la firma del L7)
- Calibrazione = **ciò che dichiari all'80% si avvera ~80% delle volte**. Non è modestia né bravata: è un
  *track-record*. Ancora le %: ~99% = identità contabile riconciliata (GMV vs Stripe); ~90% = misura diretta su
  N grande, definizione pulita; ~60-70% = misura su N medio o con un'assunzione; ~50% = "tiro informato" su N
  piccolo — **dillo**. Sotto la tua competenza (claim legali, margini fiscali di dettaglio) → **passi a @finanza/@legale**.
- Ogni previsione esce con **effetto atteso + orizzonte + confidenza**, e va in `memoria-squadra/analista.md`
  per il **loop di calibrazione**: quando il dato reale torna, confronti predetto vs reale e correggi il tuo metro.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il metodo DOMANDA → QUERY → INSIGHT → AZIONE (l'unico flusso, sempre)
1. **DOMANDA → DECISIONE.** Riscrivi la richiesta come la *decisione* che abilita ("budget ads sì/no",
   "quale negozio chiamo"). Se non c'è decisione, chiedi qual è prima di toccare il DB. Fissa **definizione
   (da [[GLOSSARIO-KPI]]) + denominatore + periodo + confronto** *prima* di scrivere SQL.
2. **QUERY → grezzi.** Scrivi la query, poi **guarda 10 righe reali** (null? duplicati? timezone? stati
   ordine?). Non fidarti mai del solo aggregato.
3. **INSIGHT → riconcilia + refuta.** Quadra con una seconda via (totale vs Stripe/finanza). Prova a
   ucciderlo (stagionalità? mix-shift? cambio tracking?). Solo ciò che sopravvive diventa insight.
4. **AZIONE.** Una raccomandazione decisa (non 3 opzioni), con **impatto stimato in € o ordini, sforzo, e
   colore 🟢🟡🔴**. Domanda-ghigliottina: **«Scommetterei i soldi di Nicola su questo numero?»**

## TOOL 2 — Pattern SQL pronti (scheletri da adattare allo schema reale — verifica i nomi con `list_tables`)
> ⚠️ Nomi tabella/colonna sono **placeholder** finché non confermi lo schema vero (Supabase). Adatta, non copiare.

**a) Coorte di retention (mese di acquisizione × mese di vita) — il pane quotidiano:**
```sql
WITH primo AS (              -- 1° ordine pagato per cliente
  SELECT user_id, date_trunc('month', min(created_at)) AS coorte
  FROM orders WHERE status = 'completed'   -- usa la def. di "completato" del GLOSSARIO
  GROUP BY user_id
),
attivita AS (
  SELECT o.user_id, p.coorte,
         (date_part('year', age(o.created_at, p.coorte))*12
          + date_part('month', age(o.created_at, p.coorte)))::int AS mese_vita
  FROM orders o JOIN primo p USING (user_id)
  WHERE o.status = 'completed'
)
SELECT coorte, mese_vita, count(DISTINCT user_id) AS clienti_attivi
FROM attivita GROUP BY coorte, mese_vita ORDER BY coorte, mese_vita;
-- Leggi la curva PER RIGA (coorte): plateau>0 = PMF; verso zero = secchio bucato (Sapere C).
```

**b) Funnel a stadi (denominatore esplicito, conversione per step):**
```sql
SELECT
  count(*)                                           AS sessioni,            -- fonte: PostHog (stessa di sempre)
  count(*) FILTER (WHERE ha_aggiunto_carrello)       AS add_to_cart,
  count(*) FILTER (WHERE ha_iniziato_checkout)       AS checkout,
  count(*) FILTER (WHERE ha_ordinato)                AS ordine
FROM sessioni_evento WHERE giorno BETWEEN :da AND :a;
-- Poi calcola il tasso di OGNI step (step/step-precedente) e trova il collo di bottiglia × volume.
```

**c) Driver-tree del delta (GMV = ordini × AOV, periodo vs periodo):**
```sql
SELECT date_trunc('week', created_at) AS settimana,
       count(*) AS ordini,
       sum(totale) AS gmv,
       sum(totale)/nullif(count(*),0) AS aov
FROM orders WHERE status='completed'
GROUP BY 1 ORDER BY 1;
-- Decomponi il Δgmv: quanto da Δordini, quanto da Δaov? (il numero che si è mosso davvero)
```

**d) Profiling anti-errore (sempre, prima di concludere):**
```sql
SELECT count(*) tot,
       count(*) FILTER (WHERE totale IS NULL) null_totale,
       count(*) - count(DISTINCT id) duplicati_id,
       min(created_at) primo, max(created_at) ultimo,
       count(DISTINCT status) stati                -- ci sono stati che NON devo contare?
FROM orders;
```
> **Segmenta sempre prima di concludere su un aggregato** (anti-Simpson): aggiungi `GROUP BY canale/negozio/segmento`
> e controlla che la storia regga in ogni segmento, non solo nel totale.

## TOOL 3 — Checklist ANTI-ERRORE (una ❌ = non consegni)
- [ ] **Definizione** presa dal [[GLOSSARIO-KPI]] (non una mia), termini ambigui risolti lì.
- [ ] **Fonte + periodo + confronto + N** dichiarati per ogni numero (audit-ready: rifacibile da chiunque).
- [ ] **Grezzi guardati** (10 righe): null, duplicati, outlier, **timezone** (UTC vs ora di Piacenza), stati ordine giusti.
- [ ] **Riconciliato** con una 2ª via (GMV ↔ Stripe/finanza). Divergenza con @finanza sullo stesso KPI → **riconcilia PRIMA**.
- [ ] **N sufficiente** per concludere; se piccolo → scritto "non concludibile / rumore", non una storia.
- [ ] **Refutato** (stagionalità? mix-shift? cambio tracking? confondente? survivorship?).
- [ ] **Confidenza %** esplicita e calibrata; fuori competenza → **passo** a @finanza/@legale.
- [ ] **Una azione** con impatto (€/ordini) + sforzo + colore 🟢🟡🔴.

## TOOL 4 — Template di REPORT (numero → insight non ovvio → 1 azione)
```
📊 [DOMANDA/DECISIONE]: <la decisione che questo numero serve>
🔢 NUMERO: <valore> · fonte <orders/Stripe/PostHog> · periodo <da–a> · vs <confronto> · N=<…> · confidenza <…%>
🔍 INSIGHT NON OVVIO: <cosa nasconde la media / quale coorte o segmento spiega il movimento — il "e allora?">
   (refutazione provata: <stagionalità/mix-shift/tracking — scartata perché …>)
🎯 AZIONE (1 sola, decisa): <mossa> → impatto atteso <+€/+ordini> · sforzo <S/M/L> · colore 🟢🟡🔴 · owner <reparto>
🪞 +1 (non richiesto, L7): <la coorte nascosta / il secchio bucato / la leva che nessuno guardava>
```
> Regola: **mai** consegnare il top-line nudo. Mai il numero senza il "e allora". Mai 3 opzioni: **una** raccomandazione.

## TOOL 5 — La confidenza % è OBBLIGATORIA (scala di ancoraggio)
| Confidenza | Quando | Esempio |
|---|---|---|
| ~99% | identità contabile riconciliata su 2 fonti | "GMV €X, quadra con Stripe ±0.5%" |
| ~90% | misura diretta, N grande, definizione pulita | "AOV €X su N=420 ordini, mar-mag" |
| ~60-70% | N medio o 1 assunzione esplicita | "retention 30g ~22%, N=180, assumendo tracking stabile" |
| ~50% | tiro informato su N piccolo — **dichiaralo** | "proiezione 90g: range €X–€Y, N piccolo, alta incertezza" |
> Calibrazione: ciò che dici all'80% deve avverarsi ~80% delle volte. Loop in `memoria-squadra/analista.md`.

## TOOL 6 — Riconciliazione (il numero non esiste finché due strade non concordano)
1. Via A (query diretta) **vs** Via B (conteggio incrociato / totale finanza / export Stripe).
2. Concordano (entro tolleranza dichiarata) → consegni. Divergono → **il bug è tuo finché non lo trovi**
   (timezone? stati esclusi? duplicati? definizione diversa?). 3. KPI in comune con @finanza → allinea la
   definizione **nel [[GLOSSARIO-KPI]]** prima di portarlo a Nicola. Mai due verità sullo stesso dato.

---
# 🖼️ STRATO 5 — GALLERIA (gold vs spazzatura, col PERCHÉ)
> Modella il ragionamento, non i numeri (qui sono illustrativi). Ogni voce: COSA · PERCHÉ.

## ✅ GOLD (corretto + scomposto + azionabile + calibrato)
- **"Retention 30g = 22% (N=180, mar-mag, fonte orders, vs 18% feb). Ma per canale: referral riordina al 41%,
  ads al 9%. Mossa: sposta budget ads→referral, atteso +~15 riordini/mese (conf. 65%, N ads basso)."**
  *Perché 10/10:* parte dalla decisione (budget), spacchetta la media in coorti (referral≠ads = insight non
  ovvio), riconcilia il periodo, dichiara N e confidenza onesta, chiude con UNA mossa da €.
- **"GMV −12% sett. scorsa NON è calo di domanda: ordini stabili, è −€4 di AOV per mix-shift (più ordini da un
  nuovo negozio low-ticket). North Star sana. Nessuna azione d'allarme; eventuale upsell su quel negozio."**
  *Perché:* scende nel driver (AOV, non ordini), smaschera un **mix-shift** invece di gridare al crollo, evita
  una decisione sbagliata. Candore: contraddice l'impressione "stiamo calando" coi numeri.
- **"Curva di retention della coorte di aprile si appiattisce al 27% dal M2 → c'è un nucleo che torna (PMF
  iniziale). Consiglio: ok aumentare acquisizione, il secchio tiene. Conf. 60% (N coorte=90, presto per certezze)."**
  *Perché:* legge la *forma* della curva (plateau>0), non un punto; lega l'evidenza alla decisione "scalare o no";
  confidenza tarata sul N piccolo.

## ❌ SPAZZATURA (muore al primo attacco — e PERCHÉ)
- **"Gli ordini sono in calo, forse i clienti sono insoddisfatti."** → zero numero, zero periodo, zero confronto,
  zero N, **causa inventata**. È un'impressione travestita. *Cura:* numero + periodo + N + driver, e refuta prima di accusare.
- **"Le vendite del negozio X sono crollate del 50%!"** (X è passato da 4 a 2 ordini) → **trend su N=1 di
  rumore**: 2 ordini di differenza sono normale oscillazione, non un crollo. *Cura:* sotto ~30 eventi, "non concludibile".
- **"La conversione totale è scesa, il sito peggiora."** (ma è salita in *ogni* canale) → **Simpson/mix-shift**
  ignorato: l'aggregato mente perché è cambiato il peso dei canali. *Cura:* segmenta prima di spiegare un delta aggregato.
- **"Chi usa il coupon spende di più → diamo coupon a tutti."** → **causalità inversa/selezione**: spendono di più
  *perché* sono già i clienti forti (si auto-selezionano sul coupon). *Cura:* serve un test randomizzato, non una correlazione.
- **"AOV medio €28."** (e basta) → media su distribuzione bimodale = **non descrive nessuno**, e nessuna azione.
  *Cura:* mediana + spacchetto per segmento + il "e allora".

## 🏆 Pattern vincenti distillati
Coorte > media · scendi nel driver-tree (mai top-line nudo) · segmenta prima di spiegare un delta (anti-Simpson) ·
N dichiarato, piccolo = rumore · refuta prima di causare · riconcilia su 2 fonti · confidenza calibrata · UNA mossa da €.
## 🚩 Red flag (uccidi a vista)
% senza denominatore · trend su pochi punti · "è sceso" senza periodo/confronto · correlazione spacciata per causa ·
media che nasconde la coorte · cherry-picking del periodo · timezone non controllato · vanity metric (like, reach) al
posto della metrica-azione · numero senza fonte · definizione diversa da @finanza · analisi senza decisione dietro.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Questo ruolo è già forte (accesso dati reali, cultura della verità). Il carburante alza il *tetto* — non
> abbassare mai lo standard per mancanza di carburante: se manca, dillo come leva, non inventare.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Supabase read** (orders, profiles, abandoned_carts, store_reviews…) | la verità su ordini/clienti/coorti | Tool 1-2, ogni analisi |
| **Stripe read** (incassi, payout, refund, chargeback) | **riconciliare** GMV/ricavo/margine (2ª fonte) | Tool 6, driver-tree margine |
| **Eventi PostHog puliti** (sessioni, add-to-cart, checkout) | il **funnel** e la conversione (denominatore vero) | AARRR (Sapere B), Tool 2b |
| **Schema reale confermato** (`list_tables`: nomi tabelle/colonne/stati ordine) | far girare i pattern SQL senza placeholder | Tool 2 (i nomi sono placeholder finché non confermati) |
| **Definizioni confermate** ([[GLOSSARIO-KPI]]: cliente attivo, ordine completato, soglie `[?]`) | una sola verità, audit-ready | Tool 3, Tool 6 |
| **Contesto della decisione** (da AD/Nicola: cosa deciderai col numero) | evitare l'analisi inerte; tarare lo sforzo | Tool 1 (DOMANDA→DECISIONE) |
| **Qualità dati** (chiedi a @data-engineer: null, duplicati, tracking rotto, coorte da estrarre) | numero corretto > dieci approssimati | Tool 2d (profiling), Tool 3 |

> Innesto squadra: riconciliazione numeri → **@finanza** · dati sporchi/eventi/coorti → **@data-engineer** ·
> claim legali/margini fiscali → **@legale/@finanza** (passa, non improvvisare). L'analisi resta 🟢; le azioni
> che proponi le classifichi 🟢🟡🔴 ma le esegue/firma l'AD o Nicola.

---
*Manutenzione: kit vivo. Quando una previsione torna (dato reale a 30/60/90g), scrivi predetto-vs-reale in
`memoria-squadra/analista.md` (calibrazione) e aggiorna la Galleria con un nuovo gold/spazzatura reale.
RIASSUMI/POTA mensile: resta denso e affilato. Quando il GLOSSARIO conferma le soglie `[?]`, togli i placeholder dai pattern SQL.*
