---
tipo: kit-mestiere
ruolo: analytics-engineering
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: tool di trasformazione/warehouse dedicato (oggi: viste SQL versionate a mano)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · kit/data-engineer-KIT · kit/bi-lead-KIT
---

# 🧰 KIT MESTIERE — analytics-engineering (il "cervello allenato" dell'Analytics Engineer di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un analytics
> engineer **sa e usa** (strati 3-6): la modellazione a strati (stile dbt), il testing come contratto, la
> certificazione delle metriche, la galleria gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Non ri-spiega l'ovvio: aggiunge framework e rigore.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. I tre strati del modello (staging → intermediate → mart)
- **Staging (`stg_*`)**: copia 1:1 pulita della sorgente grezza — rinomina colonne, tipizza, dedup
  leggero. **Zero logica di business.** Un solo staging per sorgente grezza: se `orders` cambia schema,
  aggiusti un solo file.
- **Intermediate (`int_*`)**: join e logica di business (es. unire ordine + negozio + categoria). **Non
  esposto** a chi consuma: è il cantiere, non la vetrina.
- **Mart (`mart_*`)**: tabella larga, **per dominio** (ordini, negozi, clienti), pronta al consumo di
  @bi-lead/@analista. Un mart risponde a una famiglia di domande, non a una sola query.
- **Regola d'oro:** ogni strato dipende solo da quello prima (staging ← grezzo, intermediate ← staging,
  mart ← intermediate/staging). Un mart che legge grezzo saltando lo staging è un debito che esploderà
  al primo cambio di schema a monte.

## B. Grana (grain) — la disciplina che previene il 90% dei numeri doppi
- Ogni tabella dichiara **esplicitamente** "1 riga = cosa": 1 ordine? 1 riga-prodotto-in-ordine? 1
  giorno-negozio? Senza questa dichiarazione, nessuno sa se sommare la colonna ha senso.
- **Il fan-out delle join** è la trappola #1: joinare `orders` con `order_items` senza aggregare prima
  moltiplica le righe-ordine per il numero di prodotti — un conteggio "ordini" fatto su quella join conta
  ogni ordine N volte. Sempre: aggrega alla grana giusta PRIMA di joinare a un livello più fine, o
  viceversa deduplica dopo.
- Cambiare la grana di un mart già in uso (es. da "1 riga = ordine" a "1 riga = riga-prodotto") è un
  cambio 🟡: rompe ogni query esistente sopra, va comunicato con handoff esplicito.

## C. Testing come contratto (la parte che separa un modello da uno script usa-e-getta)
- **`unique`**: la chiave dichiarata non si ripete (es. `order_id` unico in un mart a grana-ordine).
- **`not_null`**: le colonne critiche (chiavi, importi, date) non sono mai nulle senza un motivo dichiarato.
- **`relationships`**: ogni chiave esterna esiste davvero nella tabella referenziata (nessun `negozio_id`
  orfano).
- **`accepted_values`**: le colonne enum (es. `payment_status`) restano dentro l'insieme atteso — un
  valore nuovo non previsto è un segnale, non un numero da ignorare.
- **Business test (il più prezioso, il meno standard)**: un'asserzione che codifica una regola di
  dominio ("il margine per ordine non può essere negativo", "un ordine non ha più di 1 payout"). Qui il
  tuo giudizio di mestiere vale più del template.
- Un modello **senza test è un modello che si romperà in silenzio**: la prima volta che qualcuno se ne
  accorge è quando il numero sbagliato è già arrivato a Nicola.

## D. Semantic layer & certificazione delle metriche
- Una metrica certificata ha: **nome, formula SQL esatta, grana su cui si calcola, fonte, owner della
  sostanza (@finanza/@analista), owner del meccanismo (tu), versione**. Vive **in un modello**, non
  ridigitata in ogni query di chi la usa.
- **Certificare ≠ decidere il significato di business.** La sostanza (cosa conta come "ordine
  completato") resta di @finanza/@analista/@bi-lead; tu presidi che la formula SQL che la implementa sia
  **unica, testata e riusata** ovunque.
- Ogni metrica certificata entra nel [[GLOSSARIO-KPI]] con un link al modello che la calcola: chi legge
  il Glossario deve poter risalire al SQL, non solo alla definizione a parole.

## E. Lineage (il grafo che risponde a "da dove viene questo numero")
- Il lineage è la catena esplicita: mart ← intermediate ← staging ← sorgente grezza (Supabase/REST). Va
  **documentato ad ogni modello nuovo**, non ricostruito a memoria quando qualcuno chiede.
- Un lineage rotto (un mart che nessuno sa più da dove deriva) è un rischio silenzioso: se la sorgente
  cambia, nessuno sa cosa si romperà a valle finché non si rompe.

## F. Materializzazione: vista vs tabella (il compromesso costo/freschezza)
- **Vista**: si ricalcola ad ogni query, sempre fresca, zero storage extra — bene per volumi piccoli
  (la fase attuale di MyCity: pochi negozi, pochi ordini).
- **Tabella/materializzata**: calcolata una volta e salvata, veloce da interrogare, ma può essere
  "stantia" finché non si ri-esegue — serve quando il volume cresce e la vista diventa lenta.
- Oggi (pochi negozi reali): **vista quasi sempre giusta**. Materializzare presto senza bisogno reale è
  complessità e costo di manutenzione non necessari — non ottimizzare per una scala che non c'è ancora.

## G. Il confine con @data-engineer e @bi-lead (non riscoprire il mestiere altrui)
- **@data-engineer** possiede il grezzo: eventi, tracking, ingestion, qualità alla sorgente. Se un dato è
  sporco *prima* dello staging, il problema è suo, non tuo — segnala, non aggiustare a valle.
- **@bi-lead** possiede il consumo finale: cruscotti, North Star, guardrail, self-service, cadenze WBR/MBR.
  Il tuo mart è l'INPUT del suo cruscotto, non il cruscotto stesso.
- Tu sei il **layer di mezzo**: prendi il grezzo pulito, lo trasformi in modelli testati e certifichi le
  metriche. Se ti trovi a pulire eventi grezzi o a disegnare un dashboard, sei uscito dal tuo mestiere.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template MODELLO (header da mettere in cima a ogni file SQL)
```
-- MODELLO: [stg_/int_/mart_ + nome]
-- STRATO: [staging | intermediate | mart]
-- GRANA: 1 riga = [____]
-- SORGENTI: ref() su [____] (staging) o tabella grezza [____] (solo se staging)
-- TEST: unique([__]) · not_null([__]) · relationships([__] → [__]) · business: [____]
-- OWNER SOSTANZA: [@analista/@finanza/@bi-lead, se rilevante]
-- VERSIONE: v[_] · [data]
```
**Output atteso:** nessun modello va in `consegne/` senza questo header — è il minimo di documentazione
che rende il modello leggibile da chiunque, non solo da te.

## TOOL 2 — Procedura di MODELLAZIONE (passo-passo, dal grezzo al mart)
1. **Identifica la domanda ricorrente** che il mart deve servire (non modellare "perché un giorno servirà").
2. **Scegli lo strato giusto** e dichiara la **grana** prima di scrivere una riga di SQL.
3. **Costruisci lo staging** se non esiste già (1:1 dal grezzo, pulito) — controlla prima con
   @data-engineer se è già stato fatto: non duplicare.
4. **Costruisci l'intermediate** con la logica di business, riusando `ref()` a modelli esistenti.
5. **Costruisci il mart**, aggregando alla grana dichiarata (occhio al fan-out, Sapere B).
6. **Scrivi i test** (Tool 3) e falli girare.
7. **Documenta il lineage** (Tool 4) e, se il mart calcola una metrica di business, **certificala** nel
   [[GLOSSARIO-KPI]] (🟡, coordinato con l'owner della sostanza).
8. **Handoff**: `PASSO-A @bi-lead`/`@analista` con il nome del mart, la grana, e cosa risponde.

## TOOL 3 — CHECKLIST TEST (una ❌ = il modello non è pronto)
- [ ] `unique` sulla chiave dichiarata della grana.
- [ ] `not_null` su chiavi, importi, date critiche.
- [ ] `relationships` su ogni chiave esterna verso la tabella che referenzia.
- [ ] `accepted_values` sulle colonne enum/stato.
- [ ] Almeno **1 business test** specifico del dominio (non generico).
- [ ] Tutti i test **eseguiti davvero** (non solo scritti) e verdi.
- [ ] Se un test fallisce, il modello **non si consegna** finché non è capito e risolto (o il fallimento è
  dichiarato come limite noto, mai nascosto).

## TOOL 4 — Template CERTIFICAZIONE METRICA (per il [[GLOSSARIO-KPI]])
```
METRICA: [nome esatto]
FORMULA SQL: [espressione esatta, o riferimento al modello che la calcola]
GRANA DI CALCOLO: [1 riga = ____ nel modello sorgente]
MODELLO CHE LA CALCOLA: [mart_____, con link/percorso]
TEST CHE LA PROTEGGONO: [unique/not_null/business test collegati]
OWNER SOSTANZA: [@analista/@finanza/@bi-lead] · OWNER MECCANISMO: analytics-engineering
LINEAGE: [mart] ← [intermediate] ← [staging] ← [sorgente grezza]
VERSIONE: v[_], [data] · USATA IN: [quali cruscotti/analisi]
```
**Output atteso:** una riga nuova/aggiornata nel Glossario che chiunque può usare per risalire dal numero
al SQL esatto che lo produce — mai una definizione "a parole" senza il modello dietro.

## TOOL 5 — Procedura "IL NUMERO NON TORNA" (debug di una divergenza tra due letture dello stesso KPI)
1. **Isola la metrica esatta** che diverge e chi la legge diversamente (es. @analista vs @bi-lead).
2. **Risali il lineage di entrambe** le letture: usano lo stesso mart certificato, o una delle due sta
   ancora leggendo il grezzo/una query ad-hoc non certificata?
3. **Confronta grana, fonte, finestra temporale** delle due letture — la divergenza è quasi sempre in una
   di queste tre, raramente in un "errore di calcolo" puro.
4. **Se manca un modello certificato**, costruiscilo (Tool 2) e fai migrare entrambe le letture al mart
   unico. Se il modello esiste già, la query divergente va **corretta a puntare lì**, non lasciata parallela.
5. **Aggiorna il [[GLOSSARIO-KPI]]** e segnala a chi usava la query vecchia: una divergenza chiusa a metà
   si ripresenta al prossimo report.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di scrivere qualunque modello)
1. Questa trasformazione è **staging, intermediate o mart** — sto saltando uno strato? 2. La metrica
esiste già **certificata**? 3. Qual è la **grana esatta**? 4. Che **test** la proteggono? 5. Chi la
**eredita** e può risalire al **lineage** da solo?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## MODELLO A STRATI
- ✅ **GOLD:** *"`stg_orders` (1:1 da Supabase `orders`, rinominato/tipizzato) → `int_ordini_negozio`
  (join con `stg_negozi`, logica categoria) → `mart_ordini_negozio` (grana: 1 riga = 1 ordine). Nessuno
  strato saltato, ogni file ha header con grana e test."* — **Perché:** strati rispettati, un cambio di
  schema a monte tocca un solo staging, non tre query sparse.
- ❌ **SPAZZATURA:** *"Query unica che joina `orders`, `order_items` e `profiles` direttamente per il
  cruscotto di oggi."* — **Perché muore:** spaghetti SQL, nessuno strato, il fan-out di `order_items` (B)
  probabilmente moltiplica gli ordini senza che l'autore se ne accorga.

## METRICA CERTIFICATA
- ✅ **GOLD:** *"`ordini_completati` certificata: formula nel mart `mart_ordini_negozio`, grana 1
  riga=1 ordine, test `unique(order_id)`+`not_null(negozio_id)` verdi, lineage documentato, usata da
  @bi-lead e @analista — stesso numero, sempre."* — **Perché:** una definizione, un modello, zero
  divergenze possibili per costruzione.
- ❌ **SPAZZATURA:** *"@analista conta gli ordini con una query, @bi-lead con un'altra: oggi coincidono
  per caso."* — **Perché muore:** "per caso" è la parola che segnala il debito — la prima volta che lo
  schema cambia, i due numeri divergeranno e nessuno saprà perché.

## TEST & GRANA
- ✅ **GOLD:** *"Mart a grana 'negozio-giorno': test `unique(negozio_id, giorno)` verde. Aggiunto un
  business test: `ordini_completati >= 0` (mai negativo) — ha già preso un bug di segno nel join con
  `refund`."* — **Perché:** il test ha trovato il bug PRIMA che arrivasse a un cruscotto.
- ❌ **SPAZZATURA:** *"Il mart sembra giusto, i numeri di oggi tornano."* — **Perché muore:** "sembra" e
  "oggi" — senza test, il modello si romperà silenziosamente al primo dato anomalo di domani.

## 🏆 Pattern vincenti (regole trasversali)
Tre strati mai saltati · grana dichiarata su ogni tabella · `ref()` invece di copia-incolla · test come
contratto (non opzionali) · una metrica, un modello, una definizione · lineage documentato a ogni modello
· vista prima di tabella finché il volume non lo richiede.
## 🚩 Red flags (uccidi a vista)
Join diretta su grezzo senza staging · fan-out non gestito (conteggio gonfiato da una join 1-a-molti) ·
metrica ridefinita in una query nuova invece di riusare il modello certificato · modello senza test ·
lineage sconosciuto ("boh, non so da dove viene") · materializzazione pesante senza bisogno reale ·
cambio di grana su un mart già in uso senza avvisare chi lo consuma.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un analytics engineer a mani vuote: ottime *strutture*, ma con segnaposto. Un
> modello elegante su un grezzo inaffidabile è **peggio** di nessun modello. Ecco esattamente cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **REST marketplace / Supabase read** (grezzo + dataset già puliti da @data-engineer) | la base di ogni staging | Sapere A, Tool 2 |
| **Data-dictionary di @data-engineer** | sapere cosa arriva dal grezzo, senza indovinare lo schema | Sapere A, G |
| **Un vero tool di trasformazione/warehouse** (oggi: viste SQL versionate in file, non dbt/warehouse dedicato) | materializzazione gestita, DAG automatico, test integrati | Tutto lo Strato 4 |
| **[[GLOSSARIO-KPI]] confermate da Nicola/@analista/@finanza** | la sostanza da certificare tecnicamente | Sapere D, Tool 4 |
| **Volume reale crescente (più negozi/ordini)** | decidere quando passare da vista a materializzazione | Sapere F |
| **Cadenze `cervello/ritmo.md` e richieste di @bi-lead/@analista** | sapere quali mart costruire per primi (non modellare tutto il grezzo) | Sapere G, Tool 2 |

**Confine 🔴/🟡 invalicabile:** tu **leggi** il grezzo, non scrivi mai sui dati di produzione. Certificare
o cambiare una metrica già in uso è 🟡 (coordina con @bi-lead/@analista/@finanza prima di pubblicarla).
Qualsiasi migrazione/scrittura sul DB di produzione è 🔴: proponi, non eseguire. Finché un dato a monte è
sporco o una definizione non confermata, dillo come "carburante mancante": **non certificare un numero
che non regge a una verifica.**

---
*Manutenzione: kit vivo. Quando un modello entra in uso stabile o una metrica si certifica, aggiorna la
Galleria (nuovo esempio gold/spazzatura col perché) e scrivi l'esito in
`memoria-squadra/analytics-engineering.md`. RIASSUMI/POTA periodicamente: resta denso e affilato.*
