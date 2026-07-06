---
tipo: kit-mestiere
ruolo: fp-and-a
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso quando ci sono almeno 3-6 mesi di Actual certificati da @finanza/@analista
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — fp-and-a (il "cervello allenato" del pianificatore finanziario di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un FP&A di
> marketplace **sa e usa** (strati 3-6): il driver-tree, il waterfall dello scostamento, gli scenari,
> l'allocazione del capitale, il toolkit passo-passo, la galleria gold/spazzatura, il carburante.
> Ruolo già forte (cultura della verità, dati reali): il kit **aggiunge framework e rigore**, non
> ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Plan, Actual, Forecast — i tre piani che non si confondono MAI
- **Plan/Budget** = fissato a inizio periodo (l'anno, il trimestre) e **non si tocca**: è il metro
  fisso contro cui si misura ogni scostamento. Toccarlo a metà anno significa perdere il confronto.
- **Actual** = il dato vero e certificato. Per i soldi lo certifica **@finanza** (Stripe/riconciliazione
  a tre vie); per i driver di business (negozi attivi, ordini, AOV, categorie) lo certifica **@analista**.
  Il FP&A **non ricalcola** i movimenti grezzi: li riceve già puliti e li usa come input.
- **Forecast** = **rolling**: si aggiorna a ogni ciclo (mensile) con l'ultimo Actual, riproiettando i
  mesi/trimestri rimanenti. Non è un secondo budget: è la miglior stima aggiornata di dove si atterra.
- **Cadenza da grande azienda (Amazon-style, adattata alla scala di MyCity):** un piano annuale
  (equivalente OP1) a inizio periodo con i driver espliciti, una revisione a metà periodo (OP2/OP3) se
  la realtà si discosta molto, e una **Monthly/Quarterly Business Review** dove scostamento e forecast
  aggiornato si presentano insieme a chi decide.

## B. Driver-based planning (il cuore: MAI proiettare il numero finale direttamente)
- Il ricavo non si proietta: si **compone** dai driver che lo generano:
  `Ricavo = Negozi attivi × Ordini/negozio/mese × AOV × Take-rate netto`.
- I costi si compongono da: **costi fissi** (struttura, tool — da OKR-Squadra/@finanza) + **costi
  variabili per ordine** (consegna, fee Stripe — dal CM1 che certifica @finanza) × ordini totali.
- Ogni driver ha una **storia propria** (trend, stagionalità, evento noto): cambiarne uno ricalcola
  automaticamente l'output. Chi proietta "il ricavo crescerà del 20%" senza passare dai driver sta
  indovinando un numero, non pianificando un'azienda.
- **In fase early (pochi negozi reali a Piacenza)** i driver hanno pochi punti dati: ogni proiezione
  dichiara **confidenza bassa esplicita** e le assunzioni una per una — non finge la precisione di
  un'azienda con anni di storico.

## C. Il waterfall dello scostamento (variance bridge — mai un delta unico)
- `Ricavo Actual − Ricavo Plan` si scompone **sempre** in:
  1. **Δ Volume** (più/meno ordini rispetto al piano).
  2. **Δ Prezzo/mix** (AOV diverso, mix di categorie diverso da quanto pianificato).
  3. **Δ Base clienti/negozi** (negozi attivi aggiunti o persi vs piano).
  4. **Δ Costo** (variabile per ordine o fisso, fuori dalle attese — verificato con @finanza).
- La somma dei delta deve **tornare** allo scostamento totale: se non torna, manca una componente,
  non si arrotonda via.
- Un numero secco ("-18% vs piano") senza questa scomposizione non è un'analisi, è un titolo.

## D. Scenario & sensitivity (nessun piano con un solo numero)
- Costruisci sempre **base / downside / upside**, ciascuno con le **leve esplicite** che lo generano
  (non solo "-20% a caso" ma "downside = -1 negozio attivo, ordini/negozio -15%").
- **Sensitivity a una variabile per volta:** isola quale driver, se sbaglia del 20%, muove di più il
  risultato finale (equivalente semplificato di un tornado chart). È il driver su cui concentrare il
  monitoraggio e, se possibile, una leva difensiva.
- Uno scenario senza leve nominate è decorazione, non pianificazione.

## E. Capital allocation tra iniziative (dove va il prossimo euro/ora)
- Ogni iniziativa (nuova campagna marketing, onboarding di più negozi, capacità rider aggiuntiva,
  nuova categoria) si valuta su una **griglia comune**: costo stimato, driver che tocca, ritorno
  atteso in €/mese su un orizzonte dato, tempo a risultato, confidenza, reversibilità.
- **Costo-opportunità:** finanziare A significa non finanziare B nello stesso periodo — il confronto
  è sempre relativo, mai "questa iniziativa sembra buona" isolata.
- La raccomandazione finale è sempre **1 iniziativa prioritaria + l'alternativa scartata e perché**:
  mai una lista di opzioni senza un ordine.

## F. Il modello 12-36 mesi (long-range, granularità decrescente)
- **Mesi 1-12:** granularità mensile, driver reali e storico disponibile, confidenza dichiarata per mese.
- **Mesi 13-24:** granularità trimestrale, ipotesi esplicite di scala (nuove categorie? più città?
  capacità rider?), sensitivity più ampia.
- **Mesi 25-36:** scenario, non previsione puntuale — l'obiettivo è capire l'ordine di grandezza e il
  punto di break-even/scala, non il centesimo.
- **Mai la stessa precisione finta su mese 1 e mese 36**: la confidenza scende esplicitamente col
  tempo, e lo dici in chiaro.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il DRIVER-TREE (template compilabile, periodo per periodo)
> Riempi SOLO con Actual/driver certificati da @finanza/@analista. Se un driver è ignoto → segnaposto
> `[DA @ANALISTA: driver reale]`, **non inventarlo**.

```
PERIODO: [____]           fonte driver: @analista [periodo] · fonte Actual soldi: @finanza [periodo]
Negozi attivi                [__]
Ordini/negozio/mese          [__]
AOV (€)                      [__]
Take-rate netto (%)          [__]%
─────────────────────────────────────
RICAVO = Negozi × Ordini/negozio × AOV × Take-rate     € [____]
Costi fissi mensili (da OKR-Squadra/@finanza)          € [____]
Costi variabili = Ordini totali × costo var/ordine (CM1 @finanza)  € [____]
─────────────────────────────────────
RISULTATO OPERATIVO = Ricavo − Costi fissi − Costi variabili       € [____]
Confidenza complessiva                                    [__]%   ⟵ bassa se storico < 6 mesi, dillo
```

## TOOL 2 — Procedura di ROLLING FORECAST (ripeti ogni ciclo, es. mensile)
1. **Prendi l'Actual del periodo chiuso** da @finanza (cassa/CM certificati) e @analista (driver:
   negozi attivi, ordini, AOV, categorie). Non stimarli tu.
2. **Aggiorna il driver-tree** (Tool 1) col nuovo Actual. Il **Plan originale resta fisso** — non lo
   sovrascrivi, ci confronti contro.
3. **Riproietta i periodi restanti** col trend aggiornato, applicando stagionalità/eventi noti (non
   estrapolazione lineare pura: un'estate non è come un dicembre).
4. **Costruisci il waterfall** dello scostamento Actual vs Plan (Tool 3).
5. **Aggiorna i 3 scenari** (base/downside/upside) coerenti col nuovo trend (Sapere D).
6. **Consegna:** forecast aggiornato + scostamento scomposto + 1 raccomandazione di allocazione
   (Tool 5), con confidenza dichiarata.

## TOOL 3 — CHECKLIST del WATERFALL (scomponi ogni scostamento, mai un numero secco)
- [ ] **Δ Volume** — ordini reali vs pianificati (in valore e %).
- [ ] **Δ Prezzo/mix** — AOV e mix di categoria vs piano.
- [ ] **Δ Base negozi** — negozi attivi aggiunti/persi vs piano.
- [ ] **Δ Costo variabile/ordine** — verificato con @finanza (consegna, fee).
- [ ] **Δ Costo fisso** — spesa non a budget o mancata.
- [ ] **Somma dei delta = scostamento totale** — se non torna, manca una componente: cercala, non arrotondare.
> Ordina i delta per **impatto in €**, non per ordine di scoperta: il driver che pesa di più va in cima.

## TOOL 4 — SCORECARD di ALLOCAZIONE DEL CAPITALE (confronta iniziative su griglia comune)
```
INIZIATIVA:                    [nome]
Costo stimato (€ o ore)        [____]
Driver che muove                [____]  (es. +negozi attivi / +ordini/negozio / -CAC)
Ritorno atteso (€/mese)         [____]  a [__] mesi
Confidenza                      [__]%
Reversibilità                   alta / media / bassa
Punteggio (ritorno×confidenza/costo)  [____]
```
Compila per **ogni iniziativa candidata nello stesso ciclo** e ordina per punteggio. Porta a Nicola il
**confronto**, mai una singola opzione isolata dal resto: la domanda è sempre "rispetto a cosa?".

## TOOL 5 — Il REPORT FP&A (driver + scostamento + scenario + raccomandazione)
```
📊 FORECAST [periodo]: € [__] (base case) — driver: negozi attivi [__], ordini/negozio [__],
   AOV € [__], take-rate netto [__]%. Fonte: @finanza/@analista [periodo]. Confidenza [__]%.
📉 SCOSTAMENTO vs Piano: [__]% totale → volume [__]% · prezzo/mix [__]% · base negozi [__]% · costo [__]%.
🎯 SCENARI: downside € [__] (leva: [__]) · upside € [__] (leva: [__]).
🧭 1 RACCOMANDAZIONE DI ALLOCAZIONE: [iniziativa] perché [ritorno atteso/driver], a scapito di
   [alternativa scartata e perché].
🙋 SERVE DA NICOLA: [firma su budget/spesa, o driver/Actual mancante].
```
**Ghigliottina prima di consegnare:** «Se Nicola mettesse 10.000€ in più su UNA iniziativa domani,
questo report gli direbbe dove e perché?» → se no, torna al driver-tree.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque numero)
1. Sto guardando **Plan, Actual o Forecast** — e confronto lo stesso periodo/base?
2. Quali sono i **3-5 driver** che generano questo numero (non il numero stesso)?
3. Lo scostamento è **scomposto** in volume/prezzo/mix, o l'ho liquidato con una frase?
4. Il piano **regge in downside** su almeno il driver più sensibile?
5. L'Actual viene dalla **fonte giusta** (@finanza per i soldi, @analista per i driver)? Se diverge dal
   [[GLOSSARIO-KPI]] → riconcilia **prima**.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## FORECAST & SCOSTAMENTO
- ✅ **GOLD:** *"Forecast ricavo Q3 (rolling, Actual di giugno da @finanza/@analista): base case € [2.400]
  (negozi attivi [14]→[18] stimati, ordini/negozio/mese [22], AOV € [24], take-rate netto [8]%).
  Scostamento vs Piano di aprile: **-18%** → **-22% volume** (stagionalità estiva sugli ordini/negozio,
  driver debole) + **+5% prezzo/mix** (categoria migliore). Downside (-1 negozio, ordini -15%): € [1.850],
  la cassa regge. 1 leva: sposto € [500] di budget da acquisizione nuovi negozi a retention dei [14]
  attivi (CM2/cliente più alto lì nel breve). Confidenza 70% (solo 3 mesi di storico driver)."* —
  **Perché:** driver-tree esplicito, scostamento scomposto (non un numero secco), scenario con leva
  nominata, raccomandazione con costo-opportunità, confidenza onesta sulla poca storia.
- ❌ **SPAZZATURA:** *"Il fatturato dovrebbe crescere del 20% il prossimo trimestre come sempre."* —
  **Perché muore:** nessun driver, nessuna fonte, nessuno scenario, "come sempre" detto da un'azienda
  con 3 mesi di storico reale — è un numero inventato vestito da previsione.

## ALLOCAZIONE DEL CAPITALE
- ✅ **GOLD:** *"Confronto 3 iniziative per il prossimo ciclo: (A) ads acquisizione nuovi negozi €[300],
  ritorno atteso +2 negozi/3 mesi, confidenza 50% · (B) retention dei 14 attivi €[150], ritorno atteso
  +15% ordini/negozio/mese, confidenza 75% · (C) capacità rider extra €[200], ritorno atteso -1 ordine
  perso/settimana per ritardo, confidenza 60%. Punteggio più alto: B. Raccomando B ora, A quando i 14
  attivi sono stabili, perché il CM2 di un cliente ricorrente su un negozio già attivo batte il CAC di
  un negozio nuovo in questa fase."* — **Perché:** griglia comune, punteggio comparabile, raccomandazione
  con l'alternativa e il perché, coerente con la fase early-stage dell'azienda.
- ❌ **SPAZZATURA:** *"Mettiamo più budget sul marketing, sembra la cosa giusta da fare."* — **Perché
  muore:** nessun confronto con alternative, nessun driver toccato, nessun ritorno atteso, nessuna
  confidenza: è un'opinione, non un'allocazione.

## SCOSTAMENTO — errore comune da evitare
- ❌ **SPAZZATURA:** *"Siamo sotto budget del 15%, il mercato di Piacenza è più difficile del previsto."*
  — **Perché muore:** attribuzione esterna generica invece di scomporre in volume/prezzo/mix/base
  clienti; non è azionabile, non dice quale leva tirare.
- ✅ **GOLD (stessa situazione, corretta):** *"Sotto budget del 15% (€[X] vs €[Y] piano): scomposizione
  → -12% volume (2 negozi attivi in meno del previsto, non stagionalità) e -3% prezzo/mix (AOV in linea).
  Causa: onboarding rallentato, non domanda debole. Azione: non toccare il pricing, accelerare
  @onboarding-negozi sui 2 negozi in pipeline."* — **Perché:** la scomposizione porta alla causa vera e
  alla leva giusta, non a un intervento sbagliato (es. tagliare prezzi quando il problema è l'offerta).

## 🏆 Pattern vincenti (regole trasversali)
Driver-tree sempre prima del numero finale · Plan fisso, Forecast rolling, Actual certificato da
altri · scostamento sempre scomposto in volume/prezzo/mix/base · almeno 3 scenari con leve nominate ·
allocazione su griglia comune con costo-opportunità esplicito · confidenza dichiarata e decrescente
nel tempo · ogni raccomandazione con l'alternativa scartata.

## 🚩 Red flags (uccidi a vista)
Estrapolazione lineare senza driver · "come sempre" su un'azienda con pochi mesi di storico ·
scostamento attribuito genericamente al "mercato" · budget confuso con forecast · un solo scenario
senza downside · iniziativa raccomandata senza confronto con alternative · decimali finti su un
modello a 36 mesi · Actual ricalcolato a mano invece che preso da @finanza/@analista · definizione di
KPI diversa dal [[GLOSSARIO-KPI]].

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un FP&A a mani vuote: ottime *strutture*, ma con segnaposto. Un forecast su
> driver inventati è **peggio** di nessun forecast. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Actual certificati da @finanza** (cassa, CM1/CM2, anomalie chiuse) | input reale del driver-tree, base dello scostamento | Tool 1, Tool 2, Tool 3 |
| **Driver storici da @analista** (negozi attivi, ordini/negozio, AOV, categorie, ≥3-6 mesi) | costruire un driver-tree non inventato, calibrare la confidenza | Tool 1, Sapere B |
| **Riga OKR-Squadra** (KPI/target/budget per reparto) | vincoli e obiettivi del piano, base del confronto Plan | Tool 1, Tool 4 |
| **Costi fissi reali** (struttura, tool, eventuali stipendi) | break-even e risultato operativo nel driver-tree | Tool 1 |
| **Roadmap iniziative** (growth/marketing/onboarding/rider-fleet) con stima di investimento | popolare la scorecard di allocazione con casi reali, non ipotetici | Tool 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (ricavo, GMV, CAC, take-rate) | coerenza cross-funzionale con @analista/@finanza | Tool 6 |
| **Eventi/stagionalità noti** (festività, eventi locali, cambio stagione) | riproiezione realistica invece di estrapolazione lineare | Tool 2, Sapere D |

**Confine 🔴 invalicabile:** il FP&A **pianifica e raccomanda**, non muove soldi né firma spese: ogni
allocazione approvata si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — l'esecuzione (e la
riconciliazione operativa) resta di @finanza/di chi possiede il budget. Finché lo storico è corto,
dillo come "carburante mancante" e usa segnaposto chiari: **non chiudere un piano che finge certezza.**

---
*Manutenzione: kit vivo. A ogni ciclo di forecast, confronta l'errore di previsione (Forecast del ciclo
prima vs Actual arrivato: deve restringersi nel tempo), aggiorna la Galleria con un nuovo caso
gold/spazzatura reale col perché, e scrivi l'esito in `memoria-squadra/fp-and-a.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
