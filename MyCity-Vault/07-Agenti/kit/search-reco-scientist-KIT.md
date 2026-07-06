---
tipo: kit-mestiere
ruolo: search-reco-scientist
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: eventi di tracking su ricerca/click (oggi in gran parte assenti), volumi ordini sufficienti per co-acquisto
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 04-Prodotto-Ops/
---

# 🧰 KIT MESTIERE — search-reco-scientist (il "cervello allenato" del ranking di ricerca e raccomandazioni)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un search &
> recommendations scientist di marketplace **sa e usa** (strati 3-6): i framework di ranking/cold-start,
> gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La funzione di ranking — tre ingredienti che non vanno mai confusi
- **Match testuale/di intento** = quanto il prodotto/negozio corrisponde alla query (nome, categoria,
  descrizione). È il pavimento: se non c'è match, non importa quanto sia "buono" il risultato altrove.
- **Segnali di business** = quanto il risultato è "buono" in assoluto, indipendentemente dal cliente:
  disponibilità (in stock, negozio attivo), freschezza del catalogo (ultimo aggiornamento), valutazioni/
  recensioni se esistono, completezza della scheda prodotto.
- **Segnali di personalizzazione** = quanto è rilevante per QUEL cliente specifico (storico acquisti,
  categorie viste). Utile solo quando c'è abbastanza storico del cliente — altrimenti è cold-start cliente
  (vedi B) e si torna ai primi due ingredienti.
- **La pipeline tipica** (candidate generation → ranking → re-ranking): prima si genera un insieme di
  candidati pertinenti alla query (match testuale/categoria), poi si ordinano per punteggio, poi si
  applicano regole di business (diversità, cold-start boost, esclusioni) come ultimo passo — separare
  questi tre stadi rende il sistema debuggabile ("perché questo è primo?" si risponde stadio per stadio).

## B. Cold-start — il problema strutturale di un marketplace giovane
- **Cold-start prodotto**: mai venduto, zero click, zero segnale di popolarità → si affida solo al match
  testuale + categoria + eventuale prezzo relativo alla categoria. Va **temporaneamente favorito** (boost
  a tempo) per raccogliere le prime impressioni/click, altrimenti non uscirà mai dal cold-start.
- **Cold-start negozio**: appena onboardato, zero storico ordini/recensioni → non va penalizzato per
  "mancanza di prova sociale" nei primi N giorni (boost temporaneo dichiarato), ma nemmeno favorito a
  tempo indeterminato (altrimenti il vecchio problema si sposta solo su chi arriva prima nel boost).
- **Cold-start cliente**: primo accesso, zero storico → niente personalizzazione possibile, si torna a
  popolarità generale + diversità di categoria per capire cosa interessa (poi si personalizza appena c'è
  anche un solo segnale, es. una ricerca o un click).
- **La regola pratica in fase early di MyCity**: con pochi negozi e pochi ordini reali, **quasi tutto il
  catalogo è in cold-start permanente** se non si interviene: il rischio non è il singolo prodotto nuovo,
  è che l'intero marketplace giovane si comporti come "vecchio e stabile" quando non lo è. Dichiara sempre
  il boost cold-start come regola esplicita con una scadenza (es. "primi 30 giorni o prime 20 vendite"),
  mai un privilegio permanente non dichiarato.

## C. "Chi ha comprato X ha comprato anche Y" — dal content-based al collaborative filtering
- **Collaborative filtering (co-acquisto)**: pattern “chi ha comprato X ha comprato anche Y” costruito
  sui co-acquisti reali. Statisticamente affidabile solo sopra una **soglia minima di co-occorrenze** (in
  letteratura si parla tipicamente di decine di co-occorrenze per coppia prima di fidarsi — benchmark
  generico, va validato sui volumi reali di MyCity, non assunto). Sotto soglia: rumore.
- **Content-based (fallback onesto)**: quando il volume non basta, si raccomanda per **similarità di
  attributi** — stessa categoria, stesso negozio, prezzo comparabile, tag comuni. È meno "intelligente" ma
  onesto: non finge un pattern comportamentale che i dati non supportano.
- **Ibrido (la meta a tendere)**: quando il volume cresce, si combinano i due — content-based come base
  sempre presente, collaborative filtering aggiunto sopra soglia dove i dati lo permettono, categoria per
  categoria (una categoria puo avere volume sufficiente prima di un'altra).
- **Popolarità come ultimo fallback**: se non c'è nulla — né contenuto comparabile né storico —
  "i più venduti nella categoria" è meglio di uno slot vuoto, ma va sempre etichettato come tale (non
  spacciato per raccomandazione personalizzata).

## D. CTR, conversione, bias di posizione, exploration/exploitation
- **CTR ≠ conversione**: un titolo/foto che genera click non genera per forza un acquisto. Ottimizzare sul
  CTR da solo produce un catalogo "clickbait": misura sempre almeno un passo più a valle (aggiunta al
  carrello, acquisto) prima di dichiarare che un cambio di ranking "funziona".
  Confusi = il ranking impara solo a confermare sé stesso.
- **Bias di posizione**: i clienti cliccano di più i primi risultati indipendentemente dalla qualità. Se
  si allena un ranking sui click grezzi senza correggere per posizione, si rafforza chi era già primo a
  prescindere dal merito. Anche senza un modello ML, ricordalo quando si leggono i dati di click: "questo
  prodotto ha più click perché è migliore o perché era il primo?".
- **Exploration/exploitation**: mostrare sempre i risultati "sicuri" massimizza la conversione immediata
  ma non fa mai emergere se un'alternativa nuova sarebbe stata migliore. Riservare uno spazio (anche
  piccolo, es. 1 slot su 10) all'esplorazione di prodotti/negozi meno mostrati è come si costruisce il
  segnale di domani, specialmente in fase early con poco storico.

## E. Diversità vs precisione — il ranking non è solo "il più pertinente vince"
- **Diversità nei risultati**: se le prime 10 posizioni sono tutte varianti dello stesso prodotto dello
  stesso negozio, il cliente vede meno scelta reale anche se ogni singolo risultato è pertinente. Un passo
  di **re-ranking per diversità** (es. non più di 2-3 risultati consecutivi dallo stesso negozio) migliora
  l'esperienza senza sacrificare troppa rilevanza.
- **Equità tra negozi (fairness)**: un ranking che finisce per far vedere sempre gli stessi 2-3 negozi (per
  accumulo storico, non per qualità attuale) è un rischio sia di esperienza (cliente vede sempre le stesse
  cose) sia commerciale (i negozi esclusi non hanno mai una possibilità reale — rischio di churn negozi,
  materia condivisa con @account-negozi/@vendite).
- **Il trade-off si dichiara, non si nasconde**: ogni scelta di quanto "spazio" dare a diversità/cold-start
  rispetto a pura precisione va scritta esplicitamente (es. "80% del punteggio da rilevanza, 20% da
  boost diversità/cold-start") — mai una black-box senza pesi dichiarati.

## F. Misurare un cambio di ranking — test prima di rendere permanente
- **Ipotesi falsificabile**: "ranking v2 aumenta il tasso di aggiunta-al-carrello sui risultati di ricerca
  del [+X%]" — dichiarata PRIMA di guardare i dati.
- **A/B quando il traffico basta**: metà ricerche a ranking attuale, metà a ranking nuovo, si confronta
  CTR **e** conversione a valle (mai solo CTR).
- **Rollout incrementale quando il traffico non basta** (fase early): si cambia una categoria alla volta,
  si osserva per un periodo che copra almeno un ciclo settimanale completo, prima di estendere.
- **Metriche da leggere insieme**: CTR sui primi risultati, tasso di conversione da ricerca, zero-result
  rate (query senza risultati — segnale anche per @search-relevance), distribuzione dei negozi/prodotti
  mostrati (per il controllo diversità/fairness).
- **Con pochi dati, dichiara sempre l'incertezza**: un delta di 5 click non è un trend, è rumore — dillo,
  non concludere.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — FORMULA DI RANKING v1 (rule-based, per la fase senza dati di click sufficienti)
```
PUNTEGGIO(prodotto|query) =
    match_testuale(query, nome+categoria+descrizione)      × peso [___] (obbligatorio: filtro minimo)
  × disponibilità (in stock = 1, esaurito = 0 o forte penalità)
  × freschezza_catalogo (aggiornato di recente = boost lieve, >60gg fermo = penalità lieve)
  × boost_cold_start (negozio/prodotto entrato negli ultimi [30] giorni → +[__]%, CON SCADENZA dichiarata)
  × valutazione/recensioni (se esistono; assenti = neutro, MAI penalità per mancanza di recensioni in cold-start)
DIVERSITÀ: non più di [2-3] risultati consecutivi dallo stesso negozio nei primi [10]
```
**Output atteso:** i pesi dichiarati per iscritto (non solo nel codice), la scadenza del boost cold-start,
e la dichiarazione esplicita "questa è una regola v1, non un modello appreso" finché mancano i dati.

## TOOL 2 — DIAGNOSI COLD-START (prima di lanciare qualsiasi ranking/reco)
1. **Prodotto**: ha mai avuto una vendita/un click tracciato? No → applica boost temporaneo dichiarato.
2. **Negozio**: da quanti giorni è live? Sotto la soglia (es. 30gg) → boost temporaneo; sopra, il boost
   decade automaticamente (altrimenti il "temporaneo" diventa un privilegio permanente non dichiarato).
3. **Cliente**: ha uno storico (ricerche/acquisti)? No → niente personalizzazione, usa popolarità +
   diversità di categoria; sì → introduci gradualmente segnali personalizzati.
4. **Verifica avversariale**: "un negozio onesto arrivato ieri, con questa regola, in che posizione esce
   per una query pertinente?" Se la risposta è "invisibile", il cold-start non è gestito: correggi prima di consegnare.

## TOOL 3 — SCELTA DEL LIVELLO DI RACCOMANDAZIONE (in base al volume reale)
```
Conta le co-occorrenze prodotto-prodotto negli ordini reali (Supabase `orders`), per categoria:
  SE co-occorrenze per coppia < soglia minima dichiarata (valida per categoria, non generica)
     → USA content-based (stessa categoria/negozio/attributi simili), dichiaralo come tale
  SE co-occorrenze >= soglia E N ordini della categoria è robusto
     → USA collaborative filtering per quella categoria, dichiara N e la soglia usata
  SE non c'è NÉ contenuto comparabile NÉ storico
     → USA popolarità di categoria come ultimo fallback, etichettata "più venduti", non "consigliato per te"
```
**Output atteso:** per ogni categoria, quale livello si sta usando oggi e cosa serve per salire di livello
(più volume, più prodotti comparabili).

## TOOL 4 — DISEGNO DEL TEST DI RANKING/RECO (prima di ogni cambio in produzione)
```
IPOTESI: ranking/reco [versione] su [query/categoria] → atteso [effetto] su [CTR e/o conversione] di [+/-__%]
METODO: A/B (se traffico sufficiente) / rollout incrementale per categoria (se traffico basso)
DURATA: almeno 1 ciclo settimanale completo
METRICHE INSIEME: CTR primi risultati · conversione a valle (carrello/acquisto) · zero-result rate ·
                   distribuzione negozi mostrati (diversità/fairness)
SOGLIA DI SUCCESSO (dichiarata PRIMA): [___] — non ritarata dopo aver visto i dati
COLORE: 🟡 (cambia l'ordinamento reale nel codice) → branch + QA, comunicare l'impatto sui negozi
```

## TOOL 5 — IL REPORT DI RANKING/RECO (segnali + cold-start + test)
```
🔎 QUERY/CATEGORIA: [___]        MATURITÀ SISTEMA: [regola rule-based / content-based / collaborative]
📊 SEGNALI USATI: match testuale [peso] · disponibilità [peso] · freschezza [peso] · cold-start [regola+scadenza]
♻️ COLD-START: prodotto [gestito? come] · negozio [gestito? come] · cliente [gestito? come]
🎨 DIVERSITÀ: [regola anti-monopolio, es. max N consecutivi stesso negozio]
🧪 TEST PROPOSTO: [metodo, durata, soglia di successo] (Tool 4)
🙋 SERVE DA NICOLA/DATA-ENGINEER: [evento di tracking mancante / firma per il cambio in produzione]
```
**Ghigliottina prima di consegnare:** «Un negozio onesto arrivato ieri ha una possibilità reale di
comparire con questa logica?» → se no, torna al Tool 2.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque proposta di ranking/reco)
1. Ho **dati sufficienti** per un modello, o sono in cold-start e uso una regola dichiarata?
2. Sto ottimizzando la **conversione reale**, non solo il CTR?
3. Il ranking è **equo verso i negozi** (non premia solo chi ha più storico a prescindere dal merito attuale)?
4. C'è **diversità** sufficiente nei primi risultati?
5. Ho un modo dichiarato di **misurare** il cambio prima del rollout pieno?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## RANKING DI RICERCA
- ✅ **GOLD:** *"Ricerca 'pane' oggi ordina per data di inserimento (di fatto penalizza i negozi nuovi,
  anche se non dichiarato come regola). Proposta v1: punteggio = match testuale (peso alto, filtro minimo)
  × disponibilità in stock (obbligatorio) × boost +[__]% ai negozi entrati negli ultimi 30gg (scadenza
  dichiarata) × penalità lieve se il catalogo non è aggiornato da 60+ giorni. Diversità: max 2 risultati
  consecutivi dallo stesso negozio. Zero eventi di click tracciati oggi → chiedo a @data-engineer
  `search_result_click`/`search_result_add_to_cart` prima di andare oltre la regola v1."* — **Perché:**
  regola dichiarata (non un algoritmo finto), cold-start gestito con scadenza, diversità esplicita, il
  passo successivo (misurare) è chiaro e non saltato.
- ❌ **SPAZZATURA:** *"Mettiamo un algoritmo di ricerca intelligente che impara dai comportamenti."* —
  **Perché muore:** nessun dato citato, nessuna gestione del cold-start, promette apprendimento senza
  segnale da cui imparare — è marketing del ranking, non ranking.

## RACCOMANDAZIONI "CHI HA COMPRATO X"
- ✅ **GOLD:** *"Categoria alimentari: [N] ordini totali, co-occorrenze pane+formaggio osservate [n] volte
  — sotto la soglia minima per un collaborative filtering affidabile. Uso content-based: 'prodotti simili'
  = stessa categoria + stesso negozio + fascia di prezzo comparabile, etichettato 'altri prodotti di
  questo negozio', non 'chi ha comprato questo ha comprato anche'. Quando gli ordini della categoria
  supereranno [soglia], rivaluto il passaggio a collaborative filtering vero."* — **Perché:** onesto sul
  livello di maturità, soglia dichiarata, etichetta veritiera verso il cliente, piano di evoluzione chiaro.
- ❌ **SPAZZATURA:** *"'Chi ha comprato questo ha comprato anche' basato sui 3 ordini che abbiamo."* —
  **Perché muore:** N troppo piccolo per qualunque pattern, nessuna soglia dichiarata, spaccia rumore per
  comportamento reale — rischia di consigliare accoppiamenti assurdi con sicurezza finta.

## COLD-START NUOVO NEGOZIO
- ✅ **GOLD:** *"Negozio [X] onboardato 3 giorni fa, zero ordini, zero recensioni. Applico boost cold-start
  +[__]% per 30 giorni o fino a [__] vendite (quello che arriva prima), poi il boost decade
  automaticamente. Verifica avversariale: con la formula attuale il negozio compare in posizione [__] su
  una query pertinente della sua categoria — visibile, non invisibile. Segnalo ad @account-negozi di
  monitorare se, passato il boost, il negozio regge senza."* — **Perché:** boost esplicito e a tempo,
  verifica avversariale fatta davvero, handoff al reparto che segue la retention del negozio.
- ❌ **SPAZZATURA:** *"I negozi nuovi si fanno vedere da soli quando hanno abbastanza recensioni."* —
  **Perché muore:** nessun piano, il negozio nuovo non avrà mai recensioni se non viene mai mostrato — è
  un ciclo che si autoalimenta contro di lui, non una strategia.

## 🏆 Pattern vincenti (regole trasversali)
Match testuale come pavimento, non come tutto · cold-start dichiarato ed esplicito, con scadenza · CTR mai
scambiato per conversione · collaborative filtering solo sopra soglia di volume, altrimenti content-based
onesto · diversità nei primi risultati come regola, non caso · ogni cambio di ranking testato prima del
rollout pieno · pesi e regole dichiarati per iscritto, mai una black-box.

## 🚩 Red flags (uccidi a vista)
"Algoritmo AI" annunciato senza dati per farlo girare · negozio nuovo invisibile per sempre · pattern di
co-acquisto costruito su una manciata di ordini · CTR ottimizzato senza guardare la conversione a valle ·
primi 10 risultati tutti dello stesso negozio/variante · boost cold-start senza scadenza (diventa
favoritismo permanente non dichiarato) · bias di posizione ignorato nella lettura dei click · cambio di
ranking in produzione senza un modo dichiarato di misurarlo · boost pagato infilato nel ranking organico
senza passare da @retail-media.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un search & recommendations scientist a mani vuote: ottimi *framework*, ma con
> segnaposto. Un ranking "ottimizzato" su dati che non esistono è **peggio** di una regola onesta.
> Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Eventi di tracking ricerca/click** (`search_performed`, `search_result_click`, `search_result_add_to_cart` — da @data-engineer/PostHog, oggi in gran parte mancanti) | misurare CTR/conversione reali, uscire dalla fase "solo regole" | Tool 4, Tool 5, Sapere D/F |
| **Storico `orders`** (prodotto, categoria, negozio, timestamp, volumi sufficienti) | stimare co-occorrenze per il collaborative filtering per categoria | Tool 3, Sapere C |
| **Campi catalogo reali** (disponibilità, categoria, data ultimo aggiornamento, eventuali recensioni) | i segnali di business del ranking v1 | Tool 1, Sapere A |
| **Accesso a feature flag/ambiente di test** (con @backend-dev/@builder-automazioni) | trasformare un'ipotesi di ranking in un test vero, non solo teorico | Tool 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (conversione, CTR, AOV) | coerenza cross-funzionale con @analista/@cro | Tool 6 |
| **Dati su churn/uscita negozi e su onboarding** (da @account-negozi/@vendite) | calibrare durata e soglia del boost cold-start negozio | Sapere B, Tool 2 |

**Confine invalicabile:** ogni cambio dell'ordinamento reale nel codice del sito è **🟡**, solo in branch,
mai in produzione senza QA — e va comunicato perché sposta chi si vede prima tra i negozi. Ogni boost
pagato/prodotto sponsorizzato è **🔴**, materia di @retail-media/@finanza, mai una leva decisa da solo
dentro il ranking organico. Finché mancano gli eventi di tracking, ogni raccomandazione di ranking resta
**una regola dichiarata**, non un modello appreso: dillo sempre come carburante mancante.

---
*Manutenzione: kit vivo. Ogni volta che un test di ranking/reco chiude, confronta l'effetto atteso vs
reale (CTR e conversione, non solo il primo), aggiorna la Galleria con un nuovo caso gold/spazzatura
commentato, e scrivi l'esito in `memoria-squadra/search-reco-scientist.md`. RIASSUMI/POTA mensile: resta
denso e affilato.*
