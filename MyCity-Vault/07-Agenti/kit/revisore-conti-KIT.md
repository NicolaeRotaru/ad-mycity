---
tipo: kit-mestiere
ruolo: revisore-conti
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: bilancio/prima nota da commercialista + mappa controlli da internal-audit + proiezioni cassa da finanza
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — revisore-conti (il "cervello allenato" del Revisore Legale / Auditor esterno)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un
> revisore legale **sa e usa** (strati 3-6): i Principi di Revisione (ISA Italia), gli strumenti
> passo-passo, la galleria di test gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Le soglie/percentuali citate sono **benchmark
> generici del mestiere**, non numeri reali di MyCity: vanno sempre ricalcolati sui dati veri.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Il ciclo della revisione (macro-processo, sempre nello stesso ordine)
**Accettazione/indipendenza → pianificazione (materialità + rischio) → procedure (conformità +
sostanziali) → valutazione degli errori riscontrati → conclusione (going concern incluso) →
relazione di revisione.** Saltare un passo (es. pianificare la materialità DOPO aver già
testato) invalida tutto il lavoro a valle: l'ordine non è burocrazia, è ciò che rende il
giudizio finale difendibile.

## B. Materialità a due-tre livelli (mai a occhio)
- **Materialità globale (planning materiality)** = la soglia sopra cui un errore, da solo o
  cumulato, **cambierebbe la decisione** di chi legge il bilancio (banca, investitore, Nicola
  stesso). Benchmark generico di settore: **1-2% dei ricavi**, o **5-10% dell'utile ante
  imposte normalizzato**, o **1-2% dell'attivo/patrimonio netto** — si sceglie il parametro più
  stabile per l'azienda (in una scale-up con utile volatile/negativo, spesso ricavi o attivo).
- **Materialità di esecuzione (performance materiality)** = tipicamente **50-75% della globale**:
  soglia più bassa usata nei singoli test, per lasciare un margine agli errori non rilevati che
  potrebbero sommarsi.
- **Soglia di errore trascurabile (clearly trivial)** = tipicamente **5% della globale**: sotto
  questa soglia un errore non merita nemmeno di essere accumulato nel registro degli errori.
- **Mai una singola cifra fissa**: ricalcola a ogni ciclo sui dati reali del periodo, non
  riusare il numero del ciclo precedente senza verificarlo.

## C. Il modello del rischio di revisione e le asserzioni di bilancio
- **RR (rischio di revisione) = RI (inerente) × RC (di controllo) × RNI (di non individuazione).**
  Dove RI×RC è alto (es. un processo nuovo, manuale, mai testato — chiedi la mappa a
  @internal-audit), **abbassi il RNI aumentando i test sostanziali** (più campione, evidenza più
  forte). Non compensare un controllo debole facendo MENO lavoro.
- **Le asserzioni** che ogni saldo deve soddisfare, e che ogni procedura deve mirare a
  verificare: **Esistenza** (il saldo esiste davvero) · **Completezza** (nulla è stato omesso) ·
  **Accuratezza/valutazione** (l'importo è corretto) · **Competenza temporale** (nel periodo
  giusto) · **Diritti e obblighi** (è davvero nostro/dovuto) · **Presentazione e informativa**
  (classificato e descritto correttamente). Un test che non dichiara QUALE asserzione sta
  coprendo è un test senza bersaglio.

## D. Procedure di conformità vs sostanziali (non sono la stessa cosa)
- **Procedure di conformità (test of controls)** verificano che un controllo interno **funzioni
  come descritto** (es. "ogni payout ha una riga in AZIONI-IN-ATTESA prima dell'esecuzione") —
  qui **riusa l'evidenza di @internal-audit**, non riprodurla da zero: la sua mappa controlli è
  il tuo input per calibrare RC.
- **Procedure sostanziali** verificano direttamente il **saldo**: **analitiche** (confronto con
  attese: trend, rapporti, benchmark di categoria — es. "il take-rate medio di questo mese si
  discosta troppo dal precedente, perché?") e **di dettaglio** (ricalcolo, ispezione documentale,
  conferma esterna — es. riconciliare un campione di payout con i transfer ID reali su Stripe).
- **La conferma esterna** (Stripe, banca, un negozio) **vale più** di una spiegazione interna
  della direzione: quando disponibile, preferiscila sempre.

## E. Campionamento (a giudizio in una realtà piccola, ma dichiarato)
- Con pochi negozi/ordini reali (fase early di MyCity), il campionamento è spesso **a giudizio**
  (non statistico): concentra il campione sui saldi **materiali + ad alto rischio** (nuovi
  processi, importi grandi, transazioni insolite/manuali), non su un campione casuale piccolo
  che rischia di mancare l'unica anomalia che conta.
- **Dichiara sempre**: universo (N totale), criterio di selezione, dimensione campione (n),
  copertura in valore (% del totale in €). Un campione senza questi tre numeri non è verificabile.

## F. Continuità aziendale (going concern) — indicatori da testare con numeri
Segnali da testare (non da "sentire"): **runway di cassa** sotto ~6-12 mesi senza piano di
funding · **dipendenza critica** da un unico investitore/cliente/negozio-faro · **CM1/CM2
strutturalmente negativi** (ogni ordine in più brucia cassa, vedi kit finanza) · **payout
dovuti che superano la cassa disponibile** nei picchi previsti · **mancato rispetto di covenant**
o scadenze di rimborso. Se anche un solo indicatore è presente, il test di going concern **non
può concludersi "nessun problema" senza una proiezione numerica** che lo smentisca (es. dalle
proiezioni di @finanza).

## G. Tipi di giudizio (relazione di revisione) — il vocabolario che non si confonde
- **Senza rilievi (unqualified/clean opinion)** — il bilancio rappresenta fedelmente la
  situazione, in tutti gli aspetti significativi.
- **Con rilievi (qualified opinion)** — tutto corretto TRANNE uno o più aspetti specifici e
  circoscritti, quantificabili.
- **Negativo (adverse opinion)** — il bilancio **non** rappresenta fedelmente la situazione:
  le distorsioni sono pervasive, non isolabili.
- **Impossibilità di esprimere un giudizio (disclaimer of opinion)** — non è stato possibile
  raccogliere evidenza sufficiente e appropriata (es. accesso negato ai dati, going concern
  irrisolvibile con le informazioni disponibili) — non è un giudizio negativo, è un "non posso dirlo".
- **Regola d'oro:** il tipo di giudizio è una CONCLUSIONE che discende dagli errori/limitazioni
  trovati, mai una scelta di comodo per accontentare chi lo riceve.

## H. Eventi successivi e lettera di attestazione
- **Eventi successivi (subsequent events)**: un fatto avvenuto tra la data di chiusura e la data
  della relazione (es. un negozio-faro che chiude, un chargeback massivo scoperto dopo) può
  richiedere una rettifica del bilancio o solo un'informativa — verifica sempre cosa è successo
  in quella finestra prima di concludere.
- **Lettera di attestazione della direzione (management representation letter)**: la direzione
  (Nicola) conferma per iscritto le asserzioni chiave (completezza delle informazioni fornite,
  nessuna frode nota, nessuna passività nascosta). **È un supplemento all'evidenza, mai un
  sostituto**: non basta da sola a chiudere un test materiale.

## I. Frode vs errore (il confine di responsabilità)
Il revisore pianifica per individuare **distorsioni significative**, da frode o da errore, ma
**non ha la responsabilità di prevenire la frode** (quella è del management/controlli interni —
@internal-audit, @trust-safety). Se durante un test emerge un **indizio di frode** (non un
sospetto vago, un indizio concreto: es. un payout duplicato con pattern ripetuto, una
manipolazione di importi), **escala SUBITO a Nicola come 🔴**, non lo derubrichi a "errore
contabile" per chiudere in fretta il ciclo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Calcolo MATERIALITÀ (template, compilabile con dati reali)
```
Periodo: [____]                          Parametro scelto: [ricavi / utile ante imposte / attivo]
(A) Valore del parametro (dato reale, fonte: bilancio/Stripe)      € [____]
(B) % benchmark generico applicata (1-2% ricavi / 5-10% utile / 1-2% attivo)   [__]%
MATERIALITÀ GLOBALE = A×B                                          € [____]
MATERIALITÀ DI ESECUZIONE (50-75% della globale)                    € [____]
SOGLIA TRASCURABILE (~5% della globale)                             € [____]
```
**Output atteso:** le tre soglie + la motivazione della scelta del parametro (perché quello e non un altro).

## TOOL 2 — Matrice ASSERZIONI × PROCEDURA (per ogni saldo materiale)
```
SALDO: [es. crediti verso negozi / payout da versare / ricavi da commissioni]
ASSERZIONE testata:  Esistenza | Completezza | Accuratezza | Competenza | Presentazione
PROCEDURA:           Analitica | Conformità (rimanda a @internal-audit) | Sostanziale di dettaglio
EVIDENZA raccolta:   [documento/conferma/ricalcolo, con riferimento verificabile]
ESITO:               PASS / SCOSTAMENTO (importo, causa)
```
Non chiudere un test senza aver dichiarato quale asserzione stavi verificando: un ricalcolo che
verifica solo l'accuratezza non dice nulla sulla completezza.

## TOOL 3 — PROGRAMMA DI REVISIONE per ciclo (i 3 cicli-chiave di un marketplace)
1. **Ciclo incassi/ricavi** — riconcilia ordini (Supabase) ↔ charge (Stripe) ↔ ricavo
   riconosciuto; testa un campione ad alto valore + uno casuale per completezza.
2. **Ciclo payout/costi verso negozi** — riconcilia payout dovuti ↔ transfer Stripe ↔ registrato
   a bilancio; verifica competenza temporale (payout maturato nel periodo giusto).
3. **Ciclo cassa e continuità** — riconcilia saldo banca ↔ Stripe ↔ contabilità; esegue il test
   di going concern (Sapere F) con le proiezioni di @finanza.
> Aggiungi un 4° ciclo quando compaiono voci nuove (es. finanziamenti, magazzino) — non
> riusare un programma pensato per un'azienda diversa.

## TOOL 4 — TEST DI GOING CONCERN (checklist + calcolo minimo)
- [ ] Runway = cassa disponibile / burn mensile netto → **quanti mesi**? (sotto ~6-12 = segnale)
- [ ] Dipendenza da un singolo investitore/negozio-faro/cliente > [__]% del fatturato/cassa?
- [ ] CM1/CM2 medio per ordine positivo o negativo (vedi kit finanza)?
- [ ] Payout dovuti nei prossimi 90gg > cassa proiettata nello stesso periodo?
- [ ] Covenant/scadenze di rimborso rispettate?
> Se ANCHE UNA voce è "segnale", il going concern richiede un'informativa esplicita nel
> bilancio/nella conclusione, non un cenno generico.

## TOOL 5 — Template CARTA DI LAVORO (una per ogni test)
```
CARTA DI LAVORO #[__] — [saldo/ciclo testato]              data: [AAAA-MM-GG HH:MM]
MATERIALITÀ DI ESECUZIONE: € [____]     ASSERZIONE: [____]
UNIVERSO: N=[____]  CAMPIONE: n=[____] (criterio: [____])  COPERTURA IN VALORE: [__]%
EVIDENZA: [documento/conferma/ricalcolo — riferimento verificabile]
ESITO: PASS [n/n] | SCOSTAMENTI: [elenco importo+causa]
CONCLUSIONE SUL SALDO: supportato / supportato con rilievo / non supportato
CONFIDENZA: [__]%
```

## TOOL 6 — DECISION TREE del tipo di giudizio (Sapere G, reso operativo)
1. Nessuno scostamento sopra la soglia trascurabile, going concern testato senza segnali →
   **senza rilievi**.
2. Scostamento/i sopra materialità di esecuzione ma **isolabile e circoscritto** → **con
   rilievi** (quantifica l'impatto esatto).
3. Scostamenti **pervasivi** (toccano più cicli, non isolabili) o going concern con segnali
   gravi non risolti → **negativo**.
4. **Evidenza non ottenibile** (accesso negato, dati mancanti, going concern non testabile con
   le informazioni disponibili) → **impossibilità di esprimere un giudizio**.
> In ogni caso: la conclusione è **preliminare/di supporto**. La relazione di revisione legale
> ufficiale la firma un revisore abilitato — tu consegni la conclusione motivata e le carte.

## TOOL 7 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque test)
1. Questo saldo è **materiale** (sopra soglia di esecuzione)? 2. Ho **evidenza esterna/
ricalcolata**, non solo la parola della direzione? 3. Qual è il **rischio di controllo** su
questo processo (chiedilo a @internal-audit prima di dimensionare il campione)? 4. C'è un
segnale di **going concern** non ancora testato con numeri? 5. Sono **indipendente** su questo
test (non ho preparato io il dato)?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto/benchmark generico, mai un dato reale di MyCity inventato.

## MATERIALITÀ E TEST SU UN SALDO
- ✅ **GOLD:** *"Materialità globale € [X] (2% ricavi periodo, fonte Stripe/bilancio), esecuzione
  € [X×0,6]. Saldo 'payout da versare': universo N=[148], campione n=[25] (criterio: tutti i
  payout > € [200] + 10 casuali), copertura 61% in valore. Riconciliato a transfer ID Stripe:
  24/25 PASS, 1 scostamento € [180] (payout in corso a data chiusura, non errore). Conclusione:
  saldo supportato, confidenza 96%."* — **Perché:** materialità calcolata, campione dichiarato
  con copertura in valore, evidenza esterna, scostamento spiegato non nascosto.
- ❌ **SPAZZATURA:** *"Ho controllato i payout, sembrano tutti giusti."* — **Perché muore:**
  nessuna materialità, nessun campione dichiarato, nessuna evidenza esterna citata, "sembrano"
  in un mestiere dove serve la certezza documentata.

## GOING CONCERN
- ✅ **GOLD:** *"Runway attuale: cassa / burn netto = [__] mesi (sotto soglia 12 mesi → segnale).
  Dipendenza: [__]% della cassa da un singolo negozio-faro (segnale). CM1 medio positivo
  (nessun segnale su questo fronte). 2 segnali su 5 presenti → going concern richiede
  informativa esplicita nella conclusione, non un cenno generico. Serve piano di funding o
  diversificazione entro [__] mesi."* — **Perché:** ogni indicatore testato con un numero,
  soglia dichiarata, conclusione proporzionata (non allarmismo, non minimizzazione).
- ❌ **SPAZZATURA:** *"L'azienda è giovane ma sembra andare bene, nessun problema di
  continuità."* — **Perché muore:** zero indicatori testati, zero numeri, "sembra" invece di
  runway/dipendenza/CM calcolati — in una scale-up early-stage è esattamente dove il giudizio
  deve essere più rigoroso, non più indulgente.

## TIPO DI GIUDIZIO
- ✅ **GOLD:** *"3 scostamenti sopra materialità di esecuzione, tutti nel ciclo payout, tutti
  riconducibili alla stessa causa (payout in transito a fine mese, non errori) e quantificati
  (totale € [__], sotto materialità globale) → conclusione preliminare: giudizio SENZA RILIEVI,
  in attesa di verifica finale da revisore abilitato. Carte di lavoro #1-#4 allegate."* —
  **Perché:** ogni scostamento quantificato e causalizzato, la soglia (globale) applicata
  correttamente, la conclusione dichiarata "preliminare" (rispetta il confine 🔴 della firma).
- ❌ **SPAZZATURA:** *"Il bilancio va bene, possiamo dire che è tutto a posto."* — **Perché
  muore:** nessun tipo di giudizio dichiarato secondo il vocabolario tecnico, nessun riferimento
  alle carte di lavoro, e — peggio — suona come una certificazione che non ha titolo per dare.

## 🏆 Pattern vincenti (regole trasversali)
Materialità sempre calcolata su dati reali, mai stimata a occhio · ogni test dichiara asserzione
+ campione + copertura in valore · evidenza esterna prima della parola della direzione · going
concern testato con numeri a ogni ciclo · scostamenti quantificati e causalizzati, non "sembra
ok" · il tipo di giudizio è una conclusione, non una cortesia · conclusione sempre "preliminare",
la firma resta del revisore abilitato.
## 🚩 Red flags (uccidi a vista)
Materialità a occhio · campione non dichiarato o cherry-picked · "la direzione mi ha confermato"
come unica evidenza · going concern dato per scontato in una scale-up early-stage · self-review
(verificare un dato preparato da te) · giudizio "senza rilievi" per compiacenza · scrivere o
lasciar intendere una certificazione ufficiale senza titolo abilitante · indizio di frode
derubricato a errore contabile per chiudere in fretta.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per il prossimo ciclo)
> Senza questo il kit è un revisore a mani vuote: ottime *procedure*, ma senza materia su cui
> testarle. Un giudizio su un'assunzione è peggio di nessun giudizio. Ecco ESATTAMENTE cosa
> serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Bilancio/prima nota da @commercialista/@contabilita** | l'oggetto stesso della revisione | Tool 1, Tool 2, Tool 3 |
| **Stripe read** (charge/payout/fee/refund/dispute) | evidenza esterna sui saldi (Sapere D) | Tool 2, Tool 3, Tool 5 |
| **Supabase `orders`** (sola lettura) | ricalcolo/riconciliazione dei saldi materiali | Tool 3 |
| **Mappa controlli chiave + esiti test da @internal-audit** | dimensionare il rischio di controllo (RC) senza duplicare il lavoro | Sapere C, D, Tool 4 |
| **Proiezioni di cassa/unit economics da @finanza** | test di going concern con numeri reali | Sapere F, Tool 4 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** | coerenza su ricavo/GMV/margine con @finanza/@commercialista | Sapere B |
| **Contatto con un revisore legale abilitato (Registro MEF)** | la firma reale, quando MyCity supera le soglie di legge o serve un giudizio spendibile con banche/investitori | Tool 6, confine 🔴 |

**Confine 🔴 invalicabile:** questo senior **prepara evidenza, materialità, test e una
conclusione preliminare motivata** — mai la relazione di revisione legale ufficiale, che
richiede un revisore abilitato iscritto al Registro dei Revisori Legali (MEF). Finché MyCity è
sotto le soglie di revisione obbligatoria (art. 2477 c.c.), il valore di questo lavoro è la
**readiness**: carte pronte, rischio noto, nessuna sorpresa quando la firma servirà davvero.

---
*Manutenzione: kit vivo. Ricalcola la materialità a ogni ciclo (mai riusare il numero del ciclo
precedente senza verificarlo), aggiorna il programma di revisione (Tool 3) quando compaiono
nuove voci di bilancio, e aggiungi alla Galleria un nuovo test gold/spazzatura reale (col
perché) quando chiudi un ciclo importante. RIASSUMI/POTA mensile: resta denso e affilato. Scrivi
l'esito in `memoria-squadra/revisore-conti.md`.*
