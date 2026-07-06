---
tipo: kit-mestiere
ruolo: search-relevance
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: log di ricerca/zero-result (oggi in gran parte assenti), conferma con @backend-dev del motore di ricerca in uso
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 04-Prodotto-Ops/
---

# 🧰 KIT MESTIERE — search-relevance (il "cervello allenato" della qualità di ricerca)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un search
> relevance engineer di marketplace **sa e usa** (strati 3-6): i framework di query understanding,
> gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La pipeline di query understanding — stadi separati, debuggabili uno per uno
Una query passa per stadi distinti prima di diventare un set di candidati; separarli rende ogni
fallimento diagnosticabile ("a quale stadio si è persa questa query?") invece di un'unica scatola nera:
1. **Normalizzazione**: minuscolo, accenti tolti o normalizzati ("perché"↔"perche"), spazi multipli,
   punteggiatura. Un bug qui rompe silenziosamente tutto ciò che viene dopo.
2. **Tokenizzazione**: la query diventa parole/termini separati.
3. **Stopword removal**: si tolgono le parole "vuote" (articoli, preposizioni comuni) — **con cautela**:
   alcune preposizioni cambiano il significato (vedi Sapere D, trappola "senza").
4. **Stemming/lemmatizzazione italiana**: "formaggi"→"formaggio", "panini"→"panino" — riduce le varianti
   morfologiche a una radice comune, altrimenti singolare/plurale sono trattati come parole diverse.
5. **Correzione refusi (typo-tolerance)**: distanza di edit (Levenshtein) tra la query e i termini noti
   del catalogo/dizionario, entro una soglia dichiarata.
6. **Espansione sinonimi**: termine scritto → termini canonici/varianti equivalenti (compresi i nomi
   locali/dialettali di Piacenza).
7. **Estrazione intento/attributo**: la query contiene una categoria, un brand, un attributo (es. "bio",
   "senza glutine")? Va riconosciuto ed eventualmente trasformato in un filtro implicito, dichiarato.
Il risultato di questa pipeline è il **set di candidati corretto** — da qui in poi è mestiere di
@search-reco-scientist decidere l'ordine.

## B. Zero-result: la metrica nord e le sue due cause radicalmente diverse
- **Zero "vero" (gap di catalogo)**: il prodotto/servizio cercato **non esiste su nessun negozio
  MyCity**. Non è un bug di ricerca: è un segnale di **domanda insoddisfatta** — materia di
  @category-manager/@vendite (opportunità di catalogo), non tua da "risolvere" con un trucco di ricerca.
- **Zero "risolvibile" (pipeline fallita)**: il prodotto **esiste**, ma la query non l'ha trovato per un
  refuso non corretto, un sinonimo mancante, uno stemming mancato, o un filtro applicato troppo a monte
  che ha escluso tutto. Questo è il tuo lavoro: trovare lo stadio che ha fallito e correggerlo.
- **Come distinguerli**: prova la query "ripulita a mano" (corretta, senza filtri) contro il catalogo. Se
  trova qualcosa → era risolvibile, il bug è nella pipeline. Se non trova nulla nemmeno così → è un gap
  di catalogo reale, segnalalo e basta, non inventare un fix che non esiste.
- **Non tutti gli zero-result pesano uguale**: ordina per **volume di query simili** (una famiglia intera
  di refusi/sinonimi mancanti) prima che per singolo caso curioso.

## C. Tolleranza ai refusi (typo-tolerance) — il compromesso che va tarato, non indovinato
- **Distanza di edit (Levenshtein)**: quante modifiche (inserimento/cancellazione/sostituzione di un
  carattere) separano la query scritta dal termine noto. Soglia tipica per parole di media lunghezza:
  **distanza 1** perdona un refuso singolo ("mozzarela"→"mozzarella" è distanza 1); soglie più larghe
  aumentano il rischio di falsi positivi (parole diverse che si "confondono" tra loro) — **benchmark
  generico da validare sui termini reali del catalogo MyCity, non da assumere**.
- **La soglia dipende dalla lunghezza della parola**: su parole corte (3-4 lettere) anche distanza 1 può
  generare falsi positivi assurdi (es. "vino"→"vino" ok, ma con soglia troppo larga rischi di far
  matchare parole corte non correlate); su parole lunghe (>6-7 lettere) una distanza 1-2 è quasi sempre
  sicura.
- **Refusi italiani tipici**: doppie consonanti scambiate (mozzarela/mozzarrella), accenti mancanti
  (perche/pere invece di perché), lettere scambiate su tastiera. Un dizionario di correzioni comuni per
  categoria (es. alimentare) batte una regola generica.
- **Verifica sempre i falsi positivi**: prima di alzare una soglia, prova la nuova soglia contro **altre**
  query legittime del catalogo — se "olio" inizia a matchare "aglio" per colpa di una soglia troppo
  larga, hai risolto un problema creandone un altro peggiore (risultati sbagliati > zero risultati,
  perché lo zero-result è onesto, un risultato sbagliato inganna).

## D. Sinonimi e varianti locali — il lessico che i clienti scrivono davvero
- **Sinonimi standard**: variazioni di registro o regionali di un prodotto ("grana"↔"parmigiano",
  "pomodori"↔"pomodoro") — vanno raccolti dai **log reali**, non immaginati a tavolino.
- **Varianti dialettali/locali**: a Piacenza certi prodotti hanno nomi locali che non stanno in nessun
  dizionario standard (es. specialità di salumeria con nome del territorio). Vanno raccolti parlando coi
  negozi/@vendite, non inventati da un elenco generico "italiano".
- **Trappola delle stopword sull'intento**: una parola come "senza" (in "pane senza glutine", "senza
  zucchero") **cambia il significato della query** — è un'esclusione, non rumore. Trattarla come stopword
  e rimuoverla rompe l'intento del cliente e può fargli trovare esattamente il contrario di ciò che
  cercava. Lo stesso vale per "con"/"no"/negazioni in generale: vanno riconosciute, non buttate via.
- **Sinonimi asimmetrici**: "the query A implica B" non sempre implica il contrario. Es. chi cerca
  "formaggio" può accettare "grana" tra i risultati, ma chi cerca uno specifico "grana padano DOP" non
  vuole vedersi proporre "formaggio" generico come primo risultato — quello però è già territorio di
  ranking/rilevanza fine, da coordinare con @search-reco-scientist.

## E. Filtri e faccette — la navigazione non deve mai finire in un vicolo cieco
- **Il facet count deve essere vero**: se un filtro mostra "12" ma applicandolo il risultato è 0 (dato
  stale, o conteggio calcolato su un sotto-insieme diverso da quello attualmente filtrato), il cliente
  perde fiducia nell'intera ricerca, non solo in quel filtro.
- **Combinazioni di filtri**: due filtri singolarmente validi possono, combinati, produrre sempre zero
  risultati (es. categoria X + "disponibile ora" fuori dall'orario di nessun negozio di quella
  categoria). Vanno testate le combinazioni più comuni, non solo i filtri isolati.
- **Filtro vs query**: un filtro applicato troppo a monte nella pipeline (prima della normalizzazione/
  tolleranza refusi) può azzerare risultati che altrimenti esisterebbero — l'ordine degli stadi conta.

## F. Soddisfazione della ricerca — oltre il conteggio secco di zero-result
- **Riformulazione nella sessione**: stessa query, poi una query simile subito dopo, stessa sessione =
  segnale di ricerca fallita anche se la seconda query ha trovato qualcosa (il primo tentativo è comunque
  costato tempo e fiducia al cliente).
- **Query→nessun click**: risultati mostrati ma nessun click = intento non capito bene o risultati non
  pertinenti (zona di confine con @search-reco-scientist: la query aveva il set giusto ma nell'ordine
  sbagliato, o il set stesso non era pertinente?).
- **Il confine con il ranking**: se il set di candidati è corretto e completo ma nessuno clicca, il
  sospetto si sposta sull'ordine (@search-reco-scientist); se il set stesso è sbagliato/incompleto, il
  problema è query understanding (tuo).

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — DIAGNOSI ZERO-RESULT (decision tree, prima di proporre qualunque fix)
```
1. Prendi la query ESATTA come scritta dal cliente (non la versione "pulita" che hai in testa).
2. Prova la query "ripulita a mano" (refusi corretti, sinonimi applicati, senza filtri) sul catalogo:
   → TROVA QUALCOSA?  SÌ → è ZERO RISOLVIBILE. Vai al passo 3.
                        NO → è ZERO VERO (gap di catalogo). Segnala a @category-manager/@vendite. STOP.
3. Isola lo STADIO che ha fallito nella pipeline reale (Sapere A):
   [ ] normalizzazione (accenti/maiuscole)   [ ] stopword (ha tolto una parola che cambiava senso?)
   [ ] stemming (singolare/plurale non riconosciuto)   [ ] typo-tolerance (soglia troppo stretta)
   [ ] sinonimi (mancava la coppia)   [ ] filtro applicato troppo a monte
4. Verifica se questa query è UN CASO ISOLATO o la punta di una FAMIGLIA (query simili nello stesso log).
5. Proponi il fix allo stadio giusto + verifica i falsi positivi su almeno 10-20 altre query del catalogo.
```

## TOOL 2 — COSTRUZIONE DIZIONARIO SINONIMI (solo da log reali, mai a tavolino)
```
Per ogni voce, tutte le colonne sono obbligatorie — se manca la fonte, non è ancora una voce valida:
| Termine canonico | Sinonimo/variante osservato | Fonte (query log / negozio / @vendite) | Volume (N query) | Categoria |
```
**Regola:** zero voci "perché mi sembrava logico" — ogni sinonimo ha una fonte verificabile. Se hai
un'ipotesi ma non ancora la conferma nei log, tienila in una colonna "DA VERIFICARE", non promuoverla.

## TOOL 3 — TARATURA TOLLERANZA REFUSI (typo-tolerance) — passo-passo
```
1. Fissa la soglia di partenza per fascia di lunghezza parola (es. 3-4 lettere: nessuna tolleranza o
   dizionario di correzioni esplicite; 5+ lettere: distanza edit 1).
2. Applica la soglia a TUTTE le query del campione zero-result: quante si sarebbero risolte?
3. Applica la STESSA soglia a un campione di query che GIÀ funzionavano: quante iniziano a restituire
   risultati SBAGLIATI (falsi positivi)? Se il numero è vicino a zero, avanti; se cresce, restringi.
4. Documenta la soglia scelta + il tasso di falsi positivi accettato, non lasciarla "nel codice" senza spiegazione.
```

## TOOL 4 — AUDIT FILTRI/FACCETTE (nessun vicolo cieco)
```
[ ] Ogni filtro singolo, applicato da solo su ogni categoria, produce almeno 1 risultato quando dovrebbe?
[ ] Le combinazioni di filtri più usate (top N dai log, o le più ovvie: categoria+disponibilità,
    categoria+prezzo) sono state testate una per una?
[ ] Il facet count mostrato PRIMA di cliccare corrisponde al risultato REALE dopo il click?
[ ] Se un filtro produce zero risultati in una combinazione, il filtro si disabilita/segnala PRIMA che
    il cliente lo clicchi, invece di mostrare silenziosamente una pagina vuota?
```
**Output atteso:** lista delle combinazioni-vicolo-cieco trovate + fix proposto (disabilita filtro
incompatibile, oppure correggi il conteggio) → 🟡 passa a @frontend-dev/@backend-dev per l'implementazione.

## TOOL 5 — IL REPORT DI SEARCH RELEVANCE (zero-result + causa + fix)
```
🔎 PERIODO/FONTE: [___] (log ricerca, N query totali, N uniche a zero-result)
📊 TASSO DI ZERO-RESULT: [__]% (definizione da [[GLOSSARIO-KPI]])
🧩 FAMIGLIE IDENTIFICATE (ordinate per volume):
   1. [famiglia] → causa: [stadio pipeline] → fix: [___] → falsi positivi verificati: [___]
   2. [famiglia] → ...
🗂️ GAP DI CATALOGO REALI (segnalati, non "risolti"): [query] → @category-manager/@vendite
🎨 FILTRI/FACCETTE: [vicoli ciechi trovati, se presenti] (Tool 4)
🙋 SERVE DA NICOLA/DATA-ENGINEER: [log mancanti / conferma motore di ricerca in uso / firma per il cambio in produzione]
```
**Ghigliottina prima di consegnare:** «Se il cliente scrivesse la query più sciatta e onesta possibile,
la troverebbe con questo fix — senza farmi comparire anche cose che non c'entrano?» → se no, torna al Tool 1.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque fix di ricerca)
1. Questo zero-result è **catalogo vuoto davvero** o **pipeline fallita**?
2. Se pipeline: a **quale stadio** esattamente ha fallito?
3. Il sinonimo/refuso che sto per aggiungere è **osservato nei log**, non immaginato?
4. È un **caso isolato** o la punta di una **famiglia**?
5. Ho verificato i **falsi positivi** su altre query prima di allargare una soglia/regola?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## ZERO-RESULT: REFUSO NON CORRETTO
- ✅ **GOLD:** *"Query 'mozzarela' (e 3 varianti simili: 'mozzarrella', 'mozarella') → zero risultati,
  [N] occorrenze nel log delle ultime 2 settimane. Query 'ripulita a mano' → trova 2 negozi che vendono
  mozzarella: è ZERO RISOLVIBILE, non gap di catalogo. Causa: stadio typo-tolerance, soglia attuale non
  perdona refusi su parole con doppia consonante. Fix: correzione esplicita nel dizionario per questa
  famiglia + verifica su 15 altre query del catalogo alimentare, zero falsi positivi trovati."* —
  **Perché:** distingue zero vero da risolvibile con una prova, isola lo stadio, generalizza a una
  famiglia, verifica i falsi positivi prima di proporre.
- ❌ **SPAZZATURA:** *"La ricerca di 'mozzarela' non trova niente, probabilmente il prodotto manca."* —
  **Perché muore:** non ha provato la query corretta, ha concluso "manca il prodotto" senza verificare,
  ha scaricato la colpa sul catalogo quando il problema era suo.

## SINONIMI LOCALI
- ✅ **GOLD:** *"Dal log ricerca: [N] clienti cercano 'salame piacentino' e trovano risultati parziali
  (solo negozi che hanno scritto esattamente così nel nome prodotto); altri [n] negozi vendono lo stesso
  salume ma lo hanno catalogato come 'salame nostrano' o 'salame DOP'. Fonte: confermato con @vendite che
  sono lo stesso prodotto. Aggiungo la coppia sinonimo nel dizionario (Tool 2), fonte = log + conferma
  umana, non supposizione."* — **Perché:** sinonimo nato da un log reale + verifica umana, non da un
  elenco generico, documentato con fonte.
- ❌ **SPAZZATURA:** *"Ho aggiunto tutti i sinonimi regionali che mi venivano in mente per i salumi
  piacentini."* — **Perché muore:** nessuna fonte, nessun volume, rischio di sinonimi mai cercati da
  nessuno o — peggio — sbagliati (prodotti diversi scambiati per uguali).

## FILTRI CHE PORTANO A VICOLO CIECO
- ✅ **GOLD:** *"Categoria 'gastronomia' + filtro 'disponibile ora' produce zero risultati tra le 13 e le
  15 (pausa pranzo di quasi tutti i negozi della categoria) — non è un bug isolato, è strutturale in
  quella fascia oraria. Propongo a @frontend-dev di mostrare 'nessun negozio aperto ora, riprova dopo le
  15' invece di una pagina vuota indistinguibile da 'categoria inesistente'."* — **Perché:** ha trovato
  la combinazione vicolo-cieco, capito la causa strutturale (non un bug ma un fatto orario), proposto un
  fix UX invece di lasciare l'ambiguità.
- ❌ **SPAZZATURA:** *"A volte la ricerca con i filtri non trova niente, capita."* — **Perché muore:**
  "a volte", "capita" — nessuna causa, nessuna combinazione identificata, nessuna proposta.

## 🏆 Pattern vincenti (regole trasversali)
Zero vero ≠ zero risolvibile, sempre verificato con la query ripulita a mano · ogni sinonimo ha una fonte
nei log o una conferma umana, mai a tavolino · ogni soglia di tolleranza refusi verificata contro i falsi
positivi prima di allargarla · le negazioni ("senza", "no") non sono stopword · i filtri non finiscono mai
in un vicolo cieco silenzioso · si risolve la famiglia, non la singola query · confine chiaro con
@search-reco-scientist (candidati giusti = tuo, ordine = suo).

## 🚩 Red flags (uccidi a vista)
Zero-result etichettato "il prodotto non c'è" senza aver provato la query corretta · dizionario sinonimi
senza fonte · "senza"/negazioni trattate come rumore e rimosse · tolleranza refusi tarata senza controllo
dei falsi positivi · filtro/faccetta che porta a zero risultati senza dirlo prima · fix che risolve un
caso e ne ignora dieci simili nello stesso log · proposta di "motore di ricerca intelligente" nuovo senza
aver verificato con @backend-dev cosa gira oggi.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un search relevance engineer a mani vuote: ottimi *framework*, ma con
> segnaposto. Un dizionario di sinonimi "ottimizzato" su query immaginate è **peggio** di nessun
> dizionario. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Log query di ricerca** (`search_performed`, con esito zero/non-zero — da @data-engineer/PostHog, oggi in gran parte mancanti) | costruire il dizionario sinonimi e diagnosticare le famiglie di zero-result su dati veri | Tool 1, Tool 2, Tool 5 |
| **Conferma di cosa gira oggi** dietro al box di ricerca (ILIKE semplice? full-text search Postgres? `pg_trgm`? — da @backend-dev, non assumere) | sapere quale stadio della pipeline esiste davvero oggi e dove intervenire | Sapere A, Tool 1, Tool 3 |
| **Catalogo prodotti reale** (nomi, categorie, attributi, per negozio) | vedere dove i sinonimi mancano e distinguere zero vero da risolvibile | Sapere B, Tool 1 |
| **Canale con @vendite/negozi** per i nomi locali/dialettali dei prodotti | i sinonimi regionali che nessun dizionario standard contiene | Sapere D, Tool 2, Galleria |
| **Dati su riformulazioni in sessione** (stessa sessione, query simile ravvicinata) | misurare la soddisfazione di ricerca oltre il solo conteggio zero-result | Sapere F |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (tasso di zero-result, riformulazione) | coerenza cross-funzionale con @analista/@search-reco-scientist | Tool 5 |

**Confine invalicabile:** ogni cambio reale nel codice/config di ricerca (sinonimi, soglie, indice) è
**🟡**, solo in branch, mai in produzione senza QA. Escludere di fatto un negozio/categoria dai risultati
(anche via una stopword o un filtro) è **🔴**, materia di @trust-safety/@account-negozi. Finché mancano i
log reali, ogni sinonimo o soglia resta **una supposizione dichiarata**, mai spacciata per dato osservato.

---
*Manutenzione: kit vivo. Ogni volta che un fix di ricerca va live, confronta il tasso di zero-result
atteso vs reale (e i falsi positivi, non solo il caso che volevi risolvere), aggiorna la Galleria con un
nuovo caso gold/spazzatura commentato, e scrivi l'esito in `memoria-squadra/search-relevance.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
