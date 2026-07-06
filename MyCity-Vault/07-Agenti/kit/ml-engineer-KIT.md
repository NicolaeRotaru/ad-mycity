---
tipo: kit-mestiere
ruolo: ml-engineer
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso quando lo storico etichettato (churn/frode/LTV) avrà volume
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · .claude/agents/ml-engineer.md
---

# 🧰 KIT MESTIERE — ml-engineer (il "cervello allenato" del fuoriclasse MLOps)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un ML/MLOps engineer
> **sa e usa** (strati 3-6): il sapere, il toolkit passo-passo, la galleria gold/spazzatura, e il carburante che
> serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Regola madre: **un modello in un notebook vale
> zero — vale solo un modello servito, versionato, monitorato e reversibile.**

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Notebook vs Produzione — cosa separa un esperimento da un sistema
- Un modello "funziona" solo se: è **servito** (batch schedulato o endpoint), ha **versioning** (dataset +
  codice + iperparametri + data di training tracciati insieme), ha un **job di retraining** (schedulato o
  triggerato da drift), è **monitorato** (metriche + drift), e ha un **piano di rollback** a un click. Un
  `.pkl` salvato su un laptop non è "in produzione": è un esperimento che nessun altro può rifare.
- Le 4 domande che separano notebook da produzione: **chi lo richiama** (un job, un endpoint, o solo tu a
  mano)? **con che frequenza si riaddestra**? **cosa succede se degrada** (chi/cosa se ne accorge)? **si può
  tornare alla versione precedente in un comando**, o servirebbe riscrivere tutto?
- **Model registry minimo** (anche solo una tabella/file versionato, a questa scala): ogni versione di modello
  ha un ID, il dataset usato (periodo + query), le metriche offline, la data di deploy, e lo stato (shadow /
  pilot / regime / ritirato). Senza questo, "quale versione gira adesso" è una domanda senza risposta.

## B. Data leakage — il killer silenzioso (il #1 errore da junior, il più difficile da vedere)
- **Target leakage**: usi una feature che è **conseguenza** del target, non causa. Esempio da manuale: prevedi
  il churn di un negozio usando "giorni dall'ultimo payout" — ma il payout si ferma PERCHÉ il negozio ha già
  smesso di vendere. Il modello "prevede" un fatto già accaduto travestito da segnale anticipatorio.
- **Temporal leakage**: usi dati che non esistevano ancora al momento T della previsione. Esempio: prevedi
  l'abbandono di un cliente a metà mese usando il volume ordini di TUTTO il mese (che include giorni futuri
  rispetto a T). Il modello "vede il futuro" in training e non lo avrà mai in produzione.
- **Train/test contamination**: split casuale su dati con dipendenza temporale o di gruppo (lo stesso negozio
  compare sia in train che in test, o righe consecutive nel tempo finiscono su lati diversi) gonfia le
  metriche offline in modo fittizio: il modello ha "memorizzato" invece di generalizzare.
- **Test pratico anti-leakage**: per ogni feature chiediti *"avrei potuto conoscere ESATTAMENTE questo valore,
  in questo momento, prima che l'evento che sto prevedendo accadesse?"*. Se la risposta è dubbia o "quasi", è
  leakage: rimuovi la feature o ricalcolala "as-of" la data di previsione.
- **Sintomo diagnostico**: metriche offline "troppo belle" per il problema (AUC 0.98+ su un fenomeno di
  business rumoroso come il churn di piccoli negozi) — la prima ipotesi è SEMPRE leakage, l'ultima è "il
  modello è un genio".

## C. Train/serve skew — perché "funzionava in test" e degrada in produzione
- Le feature calcolate in **training** (query batch SQL su storico) devono essere calcolate **esattamente
  allo stesso modo** in **serving** (a runtime, sui dati correnti): stessa finestra temporale, stesso
  arrotondamento, stessa gestione dei null/casi limite.
- Il **feature store** esiste per questo: un'unica definizione di feature (una query/vista versionata),
  calcolata una volta, riusata sia per costruire il dataset di training sia per lo scoring in produzione —
  elimina la doppia implementazione che diverge nel tempo senza che nessuno se ne accorga.
- **Sintomo diagnostico**: il modello ha ottime metriche offline ma performance reale più bassa una volta in
  produzione → prima ipotesi: una feature è calcolata diversamente tra training e serving (skew), non che "i
  dati reali sono più difficili".

## D. Drift — data drift vs concept drift (perché un modello "buono" muore in silenzio)
- **Data drift**: la distribuzione degli **input** cambia rispetto al training (es. dopo il lancio di una
  categoria nuova, il mix ordini shifta e le feature di volume assumono valori mai visti). Il modello riceve
  input fuori dalla zona che conosce.
- **Concept drift**: cambia la **relazione** tra input e output (es. un pattern d'ordine che prima prediceva
  churn con affidabilità, dopo un cambio di stagione/prezzo non lo predice più). Il modello è "giusto" sui
  vecchi dati e sbagliato sulla realtà attuale, senza che una riga di codice sia cambiata.
- **Monitoraggio minimo**: traccia la distribuzione delle feature chiave nel tempo (istogrammi/percentili a
  confronto col training) e la performance reale quando arriva l'esito vero (label ritardata, es. il churn si
  conferma solo dopo N settimane) — alert quando lo scostamento supera una soglia dichiarata.
- **Onestà di fase**: con pochi negozi/ordini reali (fase early di MyCity), un monitoraggio statistico rigoroso
  del drift è quasi impossibile su N così piccolo — **dichiaralo**, non fingere un dashboard di drift robusto
  che in realtà misura rumore.

## E. Il valore è in euro, non nella metrica ML (accuracy/AUC ≠ soldi)
- Ogni metrica ML si traduce in un costo/beneficio reale, e i due errori (falso positivo, falso negativo)
  **quasi mai costano uguale**:
  - *Scoring frode*: falso positivo = blocchi/rallenti un cliente vero (vendita persa + fiducia rotta); falso
    negativo = lasci passare una frode (chargeback + fee dispute ~15€ + il rischio che si ripeta).
  - *Churn negozio*: falso positivo = regali uno sconto/attenzione a un negozio che non stava per andarsene
    (margine regalato); falso negativo = perdi il negozio senza intervenire (tutto il suo LTV residuo).
  - *LTV*: sovrastimarlo fa spendere in acquisizione più di quanto un cliente rende davvero; sottostimarlo fa
    rinunciare a clienti profittevoli.
- La **soglia** del modello (sopra quale score scatta l'azione) si sceglie sulla matrice costo/beneficio in €,
  MAI sulla metrica statistica nuda ("accuracy 94%" non dice se quel 94% sono i casi facili e banali).
- Il fuoriclasse presenta SEMPRE la matrice costo/beneficio insieme alla matrice di confusione — un'AUC senza
  il "quanto costa sbagliare da un lato o dall'altro" non è una consegna completa.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Checklist "MODELLO PRONTO PER LA PRODUZIONE" (Definition of Ready — una ❌ = non fa il deploy)
- [ ] **Baseline battuta**: il modello supera una regola euristica semplice su una metrica di **business** (€),
      non solo su una metrica statistica isolata.
- [ ] **Leakage escluso**: timeline delle feature ricostruita a mano (Tool 2), split **temporale**, non casuale.
- [ ] **Niente train/serve skew**: feature calcolate dalla stessa query/feature store in training e in serving.
- [ ] **Matrice costo/beneficio** dichiarata: costo di un falso positivo e di un falso negativo, in €.
- [ ] **Piano di monitoraggio**: quali metriche/distribuzioni si controllano, ogni quanto, soglia di alert.
- [ ] **Piano di rollback**: versione precedente pronta, un comando/config per tornare indietro.
- [ ] **Validato in shadow mode**: ha girato in parallelo senza agire per un periodo, confrontato con l'esito reale.
- [ ] **Nessuna azione 🔴 automatica** sul primo periodo: uno human-in-the-loop rivede prima di agire su un caso vero.

## TOOL 2 — Procedura ANTI-LEAKAGE (passo-passo, da fare su OGNI feature)
1. **Elenca ogni feature** e la sua "data di disponibilità reale": quando quel valore esisteva davvero nel
   sistema (non quando l'hai estratto tu oggi).
2. **Confronta con la data della previsione (T)**: se una feature ha disponibilità DOPO T, è leakage — rimuovila
   o ricalcolala "as-of T" (il valore che avresti visto esattamente in quel momento).
3. **Split temporale**: train su dati fino a T0, test/valutazione su dati dopo T0. Mai split casuale su serie
   storiche o su entità ripetute (lo stesso negozio in train e in test contemporaneamente).
4. **Sospetta per primo, festeggia per ultimo**: se le metriche offline sono sospettosamente alte per un
   problema di business rumoroso, la prima ipotesi è leakage, non "il modello ha trovato un pattern geniale".
5. **Fai rivedere la lista feature a @data-engineer**: conosce da dove viene ogni colonna e come/quando si
   popola — è la controparte che ti smonta il leakage prima che lo trovi la produzione.

## TOOL 3 — Template MODEL CARD (documentazione minima, per OGNI modello prima del deploy)
```
MODELLO: [nome] v[__]                         Obiettivo di business: [__]
Baseline: [regola euristica] → metrica baseline [__] vs metrica modello [__]
Dataset: periodo [__] · N righe/entità [__] · fonte/query [__]
Feature (N=[__]): [lista sintetica] — calcolate da: feature store / query [__] (stessa per train e serve? [sì/no])
Split: TEMPORALE, train fino a [data], valutazione dopo [data]
Leakage check (Tool 2): [fatto / non fatto] — note: [__]
Costo/beneficio: falso positivo = [€/impatto] · falso negativo = [€/impatto] → soglia scelta: [__]
Monitoraggio: [metriche/distribuzioni] controllate ogni [__] · soglia di alert: [__]
Rollback: versione precedente [__], pronta in [dove/come]
Stato: shadow / pilot / regime · Colore azione a valle: 🟢 solo score/insight · 🟡 azione preparata per revisione · 🔴 azione automatica (richiede firma Nicola)
```
**Regola d'oro:** senza una model card compilata, il modello non è pronto per uscire dal tuo notebook — a
chiunque altro serve poter capire lo stato del modello dal documento, non chiedendo a te.

## TOOL 4 — Procedura di DEPLOY graduale (shadow → pilot/canary → regime)
1. **Shadow**: il modello gira in parallelo al sistema attuale (o alla regola euristica in uso), NON agisce sul
   mondo reale, si loggano solo le sue previsioni.
2. **Confronto**: dopo un periodo/N eventi sufficiente, confronta le previsioni shadow con l'esito reale —
   misura la metrica di **business** (Sapere E), non solo quella statistica.
3. **Pilot/canary**: se il modello vince, attivalo con azione REALE ma su una fetta piccola e reversibile
   (una categoria, pochi negozi/casi) — mai su tutto il marketplace al primo colpo.
4. **Regime**: solo dopo un pilot pulito, e solo per azioni 🟢. Le azioni 🔴 (blocco frode, sconto anti-churn,
   cambio prezzo) restano **proposte a Nicola** anche a regime — il modello non le esegue mai da solo.
5. **Monitoraggio continuo**: drift + performance reale (Sapere D); soglia di **rollback automatico a
   modalità sola-osservazione** se il degrado supera la soglia dichiarata nella model card.

## TOOL 5 — Design minimo di un FEATURE STORE (per la scala di MyCity, oggi)
1. A questa scala un feature store non è un tool enterprise: è **una tabella/vista versionata con query
   definite una sola volta**, usata sia per costruire il dataset di training (batch) sia per lo scoring in
   produzione (stessa query, parametrizzata su "as-of date").
2. Per ogni feature registra: **nome, definizione (query), finestra temporale, owner, versione** — stesso
   principio del tracking plan di @data-engineer, applicato alle feature invece che agli eventi.
3. Le feature che sono ANCHE KPI (es. "ordini ultimi 30gg", "AOV negozio") devono essere **identiche** alla
   definizione del [[GLOSSARIO-KPI]] usata da @analista/@demand-forecasting: se calcoli la tua versione a
   parte, produci due "verità" diverse sullo stesso numero.
4. **Riuso prima di ricreare**: prima di scrivere una nuova query-feature, controlla se @data-engineer l'ha già
   pulita/definita per un altro scopo (es. una coorte, un dataset per l'analista) — riusala.

## TOOL 6 — Riflesso diagnostico (5 domande prima di proporre QUALSIASI modello)
1. Vive **in produzione** (servito, monitorato, riaddestrabile) o è fermo in un notebook? 2. C'è **leakage**
(feature-conseguenza del target, o disponibile solo dopo T)? 3. Le feature sono **identiche** tra training e
serving? 4. Batte una **baseline** su una metrica di **business** (€)? 5. Ho **abbastanza dati etichettati
reali** per generalizzare, o rischio di trattare rumore su N piccolo come un pattern?
→ Se una risposta è dubbia, **fermati e dichiaralo**: un modello "quasi pronto" in produzione è più pericoloso
di nessun modello.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## MODELLO IN PRODUZIONE (o non ancora)
- ✅ **GOLD:** *"Churn negozi v0: con lo storico reale disponibile oggi (pochi negozi attivi, storico corto) la
  baseline euristica '0 ordini in [30]gg → a rischio' identifica correttamente i casi noti. Ho provato un
  modello più ricco (8 feature, gradient boosting): leakage escluso (Tool 2, nessuna feature calcolata dopo il
  momento della previsione), ma con questo N il guadagno sulla baseline non è statisticamente difendibile
  (rischio overfitting). NON lo metto in produzione: tengo la baseline, la passo a @account-negozi con il
  piano di rivalutazione quando lo storico sarà più ampio."* — **Perché:** onesto sulla fase early, non forza
  un modello dove i dati non bastano, offre comunque valore (baseline validata) e foresight sul quando riprovare.
- ❌ **SPAZZATURA:** *"Ho un modello con accuracy [94]%, lo attivo in produzione."* — **Perché muore:** nessuna
  baseline di confronto ([94]% è banale se il [94]% dei negozi non fa churn — è il tasso di base, non abilità
  del modello), nessun controllo leakage, N di training non dichiarato, nessun piano di monitoraggio/rollback,
  nessuna matrice costo/beneficio, va live senza shadow. È un notebook travestito da produzione.

## FEATURE / LEAKAGE
- ✅ **GOLD:** *"Feature 'giorni dall'ultimo ordine RICEVUTO dal negozio, calcolata as-of la data di
  previsione' — disponibile realmente in quel momento, stessa query usata in training e in serving (feature
  store, Tool 5)."* — **Perché:** rispetta il test anti-leakage (Sapere B), niente train/serve skew.
- ❌ **SPAZZATURA:** *"Feature 'negozio disattivato dal supporto' usata per prevedere il churn."* — **Perché
  muore:** è la CONSEGUENZA del churn (il supporto disattiva DOPO aver visto il negozio morto), non una causa
  anticipatoria — puro target leakage. L'AUC sale a [0,99] e il modello è inutile in produzione: prevede un
  fatto già accaduto, non lo anticipa.

## SOGLIA / MATRICE COSTO-BENEFICIO
- ✅ **GOLD:** *"Scoring frode: falso positivo (blocco un pagamento vero) stimato [€X] di vendita persa + danno
  reputazionale; falso negativo (frode passata) stimato [€Y] di chargeback + fee dispute [~15€]. Con questi
  costi la soglia ottimale è [__], non quella che massimizza l'accuracy nuda — a quella soglia il modello
  propone una revisione umana (🟡), non blocca da solo (🔴 richiederebbe firma)."* — **Perché:** costo reale
  guida la soglia, colore corretto, human-in-the-loop rispettato.
- ❌ **SPAZZATURA:** *"Soglia impostata dove l'AUC è più alta."* — **Perché muore:** ignora che i due errori
  costano diverso, nessuna revisione umana prevista, rischio di bloccare clienti veri o lasciar passare frodi
  costose senza che nessuno abbia deciso consapevolmente il compromesso.

## 🏆 Pattern vincenti (regole trasversali)
Baseline prima del modello · split temporale, mai casuale su serie storiche · leakage escluso a mano feature per
feature · stessa query per training e serving (feature store) · soglia scelta sul costo/beneficio in €, non
sull'accuracy nuda · shadow mode prima di ogni azione reale · model card sempre compilata · rollback pronto ·
nessuna azione 🔴 automatica senza revisione umana · onestà sull'N quando è troppo piccolo per generalizzare.

## 🚩 Red flags (uccidi a vista)
Modello mai uscito dal notebook spacciato per pronto · metrica offline "troppo bella" non messa in discussione ·
feature che è conseguenza del target · split casuale su dati temporali/di gruppo · due implementazioni diverse
della stessa feature (train vs serve) · soglia scelta solo sull'accuracy · nessun piano di monitoraggio drift ·
nessun piano di rollback · azione automatica su un cliente/negozio vero senza revisione umana · N piccolissimo
trattato come dataset solido · costo di errore stimato a naso invece che chiesto a @finanza/@trust-safety.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, oggi manca quasi tutto: dillo)
> Senza questo il kit è un MLOps engineer a mani vuote: ottime *strutture* (checklist, model card, procedura di
> deploy), ma senza dati in volume per addestrare nulla di davvero robusto. Un modello su dati/costi inventati è
> **peggio** di nessun modello. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico etichettato reale** (churn confermati, frodi confermate, LTV realizzato) — oggi scarso, pochi negozi attivi | addestrare/valutare qualunque modello reale, non solo la baseline | Sapere A-D · Tool 1, 2, 4 |
| **Accesso read Supabase** (`orders`, `profiles`, storico per negozio/cliente) | costruire dataset e feature, misurare drift nel tempo | Sapere C-D · Tool 2, 5 |
| **Feature/tracking plan di @data-engineer** | dataset puliti, definizioni coerenti, niente duplicati/skew | Sapere C, E · Tool 5 |
| **Costi reali di falso positivo/negativo** (da @finanza per churn/LTV, da @trust-safety/@dispute per la frode) | scegliere la soglia sul costo/beneficio vero, non sull'accuracy nuda | Sapere E · Tool 1, 3 |
| **Ambiente di serving/scheduling** (oggi probabilmente assente) | far vivere un modello oltre lo shadow su dati storici | Tool 1, 4 (con @devops-sre/@backend-dev) |
| **Definizioni [[GLOSSARIO-KPI]] confermate** | coerenza delle feature-KPI con @analista/@demand-forecasting | Tool 5 |

**Confine 🔴 invalicabile:** qualunque azione automatica su un cliente/negozio vero (blocco pagamento, sconto
anti-churn, cambio prezzo) **si propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai la esegue il modello da
solo**, nemmeno a regime. Finché manca lo storico etichettato in volume, **dillo come limite di fase**: la
mossa giusta oggi è spesso "baseline euristica validata + feature store pronto", non "un modello ML fragile
che sembra più intelligente di quanto i dati permettano".

---
*Manutenzione: kit vivo. Ogni volta che un modello passa a shadow/pilot/regime o degrada, aggiorna la Galleria
(nuovo gold/spazzatura col perché), la model card (Tool 3) e la memoria `memoria-squadra/ml-engineer.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
