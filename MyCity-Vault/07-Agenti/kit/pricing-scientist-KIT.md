---
tipo: kit-mestiere
ruolo: pricing-scientist
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico ordini con volumi sufficienti per stimare curve, costi di consegna reali per zona/categoria
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — pricing-scientist (il "cervello allenato" della scienza dei prezzi di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pricing
> scientist di marketplace **sa e usa** (strati 3-6): i framework di elasticità/WTP, gli strumenti
> passo-passo per commissioni/fee/soglie, la galleria gold/spazzatura, e il carburante che serve.
> Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Willingness-to-pay (WTP) ed elasticità — i due assi di ogni decisione di prezzo
- **WTP (willingness-to-pay)** = il prezzo massimo che un negozio/cliente accetterebbe per il valore
  percepito, non per il costo che sosteniamo. Si stima da: comparabili di mercato, comportamento osservato
  (a che soglia iniziano ad abbandonare il carrello), test diretti (A/B a prezzi diversi).
- **Elasticità al prezzo (E)** = %variazione della quantità domandata / %variazione del prezzo.
  - `|E| > 1` → **elastico**: un piccolo aumento di prezzo fa crollare la domanda (commodity, molte
    alternative). Rischioso alzare qui.
  - `|E| < 1` → **anelastico**: la domanda regge anche con prezzo più alto (valore percepito alto, poca
    alternativa, urgenza). Qui c'è margine per alzare senza perdere volume.
  - In un marketplace locale early-stage con **pochi ordini reali**, l'elasticità NON si stima con
    precisione statistica: si stima con un **range** (es. "probabilmente tra -0.5 e -1.2, dato benchmark
    di settore + prime osservazioni"), mai con un numero secco spacciato per certezza.
- **Prezzo psicologico e framing**: soglie percettive (€9,90 vs €10), framing di una commissione ("tratteniamo
  12%" vs "a te resta l'88%"), ancoraggio (mostrare il prezzo "prima" e "dopo" sconto). Cambiano l'accettazione
  senza cambiare il numero reale — usali per la comunicazione, mai per nascondere un aumento vero.
- **Due lati, due curve**: nel marketplace la WTP del **negozio** (quanto accetta di pagare in commissione
  per l'accesso a nuovi clienti) e la WTP del **cliente finale** (quanto accetta di pagare per prodotto +
  consegna) sono **indipendenti e vanno modellate separatamente**. Ottimizzare una senza guardare l'altra
  è l'errore più comune (es. commissione più alta → negozio alza il prezzo esposto → cliente elastico
  abbandona → il ricavo netto scende su entrambi i fronti).

## B. Fee di consegna dinamica (il modello Glovo/Uber)
- La fee di consegna "giusta" **non è piatta**: varia per **distanza**, **densità di ordini nella zona/ora**
  (più ordini vicini = costo marginale di consegna più basso, fee può scendere), **domanda/offerta rider**
  (poche persone disponibili in un picco = fee sale per razionare/incentivare), **categoria** (un ordine
  food caldo ha vincoli di tempo diversi da un pacco secco).
- **Surge/picco**: alzare la fee nei picchi (pranzo, sabato pomeriggio) non è solo per coprire il costo
  extra di rider: è anche un segnale di scarsità che modula la domanda quando l'offerta di consegna è
  tesa. Va comunicato con trasparenza (mai "fee nascosta").
- **Il pavimento della fee = costo marginale reale di consegna** (da @finanza/@operations); sotto quel
  pavimento, ogni consegna in più **brucia** margine. Il soffitto = WTP del cliente per quella consegna
  (oltre il quale abbandona il carrello o sceglie il ritiro in negozio).

## C. Soglia "spedizione gratis" — la leva comportamentale, non il costo
- La soglia funziona perché **spinge il cliente ad aggiungere un articolo in più** per superarla: è una
  leva sull'AOV (average order value), non un regalo di consegna.
- **Dove metterla**: leggermente **sopra** l'AOV attuale (regola empirica di settore: 15-30% sopra l'AOV
  medio) — abbastanza vicina da essere raggiungibile con un piccolo sforzo, abbastanza lontana da spingere
  ad aggiungere qualcosa. Una soglia troppo bassa (sotto l'AOV) non cambia comportamento, la regala e basta;
  una soglia troppo alta scoraggia (sembra irraggiungibile, il cliente rinuncia del tutto).
- **Il costo reale della soglia**: ogni ordine che la supera "costa" alla piattaforma/negozio la consegna
  gratuita — va confrontato col **guadagno incrementale** (margine sull'articolo aggiunto per superare la
  soglia). Se il margine sull'articolo extra è superiore al costo di consegna regalato, la soglia è un
  moltiplicatore di ricavo netto, non un costo.
- **Segmentazione**: soglie diverse per categoria (food con margine più sottile vs non-food) sono legittime
  e spesso più efficaci di una soglia unica per tutto il marketplace.

## D. Commissioni ai negozi — il prezzo dell'accesso al mercato
- La commissione è il prezzo che il negozio paga per: **traffico** (clienti che non avrebbe da solo),
  **infrastruttura** (pagamenti, logistica, vetrina), **fiducia del brand marketplace**. Non è "quanto ci
  serve per stare in piedi": è quanto il negozio percepisce di ricevere in cambio.
- **Elasticità della retention negozi**: un aumento di commissione troppo brusco o non comunicato bene
  spinge il negozio migliore (quello con più alternative: vendita diretta, altri canali) a uscire per
  primo — è il rischio di **selezione avversa**: restano i negozi con meno alternative, spesso quelli con
  meno traffico. Ogni proposta di aumento va pesata contro questo rischio.
- **Scaglioni invece di un numero unico**: commissione decrescente al crescere del volume (fedeltà premiata)
  o commissione differenziata per categoria (categorie ad alto margine reggono commissioni più alte di
  categorie a margine sottile) sono strutture più sofisticate di un tasso piatto — e più difendibili quando
  un negozio chiede "perché io pago di più".
- **Trasparenza contrattuale**: ogni cambio di commissione tocca un accordo col negozio → è materia per
  @legale-privacy (comunicazione, preavviso, eventuali clausole), non un aggiustamento silenzioso lato sistema.

## E. Progettare un test di prezzo (A/B, prima di rendere permanente qualsiasi cambio)
- **Ipotesi falsificabile**: scrivi PRIMA cosa ti aspetti ("la soglia a €X aumenta l'AOV del Y% sulla
  categoria Z") e la soglia di successo — non ri-tarare il traguardo dopo aver visto i dati.
- **Disegno**: A/B (metà utenti/negozi/categorie a prezzo nuovo, metà a prezzo attuale) quando i volumi lo
  permettono; **rollout incrementale a step** (una categoria, poi due) quando i volumi sono bassi (fase
  early di MyCity) e un vero A/B non avrebbe potere statistico.
  - Ricorda: se ci sono ordini piattaforma-tests (in-house) o pattern anomali, escludili dal calcolo prima
    di dichiarare l'effetto.
- **Durata**: abbastanza lunga da coprire un ciclo completo (settimana intera almeno, meglio 2-4 settimane)
  per non confondere un giorno anomalo con l'effetto del prezzo.
- **Metriche da leggere insieme, mai una sola**: conversione, AOV, tasso di abbandono carrello, ricavo
  netto (non lordo), e — a 60-90 giorni — retention del negozio/cliente coinvolto.
- **Significatività con pochi dati**: con volumi bassi (fase early), dichiara sempre l'incertezza
  ("N piccolo, effetto indicativo non conclusivo") invece di trattare un delta di 3 ordini come una legge.

## F. Effetto a lungo termine — il test che separa scienza da opportunismo
- Un prezzo/fee/commissione più alto può migliorare il ricavo del **mese corrente** e:
  - spingere un negozio a lasciare il marketplace nei mesi successivi (perso il ricavo futuro, non solo
    quello attuale);
  - abituare il cliente a percepire MyCity come "cara" e a comprare altrove la volta dopo;
  - aumentare il tasso di abbandono carrello (visibile solo se lo si traccia, non nel ricavo del giorno).
- **Regola pratica**: ogni proposta di prezzo dichiara sia l'effetto atteso a 7-14 giorni (ricavo/
  conversione) sia il rischio a 60-90 giorni (retention negozio/cliente) — mai solo il primo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — STIMA DI ELASTICITÀ/WTP (quando mancano dati sufficienti per una stima statistica pulita)
1. **Raccogli i comparabili**: benchmark di settore per categoria simile (etichettati come benchmark
   generico, mai come dato MyCity) + eventuali osservazioni dirette (a che punto un cliente ha abbandonato
   il carrello, cosa hanno detto i negozi in trattativa).
2. **Dichiara un range, non un punto**: "elasticità stimata tra [a] e [b], confidenza [__]% — dato
   [reale/benchmark], N=[__] osservazioni".
3. **Testa la sensibilità della raccomandazione**: se l'elasticità reale fosse all'estremo peggiore del
   range, la proposta reggerebbe ancora? Se no, la proposta è troppo fragile: restringi l'intervento o
   aggiungi un test prima del rollout pieno.
4. **Output**: range di elasticità + fonte + confidenza + "la raccomandazione regge anche nel caso peggiore? sì/no".

## TOOL 2 — DISEGNO DEL TEST DI PREZZO/FEE/SOGLIA (prima di ogni cambio 🔴)
```
IPOTESI: [prezzo/fee/soglia] a [nuovo valore] → atteso [effetto] su [metrica] di [+/- __%]
CAMPIONE: [categoria/zona/segmento coinvolto] · gruppo di controllo: [sì/no, quale]
DURATA: [__] settimane (minimo 1 ciclo completo, meglio 2-4)
METRICHE DA LEGGERE INSIEME: conversione · AOV · tasso abbandono carrello · ricavo netto (non lordo)
SOGLIA DI SUCCESSO (dichiarata PRIMA): [___] — non ritarata dopo aver visto i dati
RISCHIO A 60-90 GIORNI: effetto atteso su retention negozio/cliente coinvolto
COLORE: 🔴 (tocca prezzo/fee/commissione reale) → proponi in AZIONI-IN-ATTESA, non eseguire senza firma
```

## TOOL 3 — CALCOLO SOGLIA "SPEDIZIONE GRATIS" (per categoria)
1. Prendi l'**AOV reale** della categoria (fonte: analista/Supabase `orders`, periodo dichiarato).
2. Soglia candidata = AOV × [1,15 – 1,30] (range di partenza da benchmark di settore, da tarare col test).
3. Stima il **margine sull'articolo incrementale** che il cliente aggiungerebbe per superare la soglia
   (categoria simile, margine medio) e confrontalo col **costo di consegna regalato**.
4. Se margine incrementale > costo consegna regalato → soglia probabilmente a somma positiva: proponi il
   test (Tool 2). Se il dato manca → dillo come carburante mancante, non stimare il costo di consegna a caso.

## TOOL 4 — VALUTAZIONE CAMBIO COMMISSIONE (i due lati, sempre insieme)
```
LATO NEGOZIO: commissione attuale [__]% → proposta [__]%
  · rischio di uscita (negozi con alternative forti: vendita diretta, altri canali)? [alto/medio/basso] perché [___]
  · comunicazione/preavviso necessario (coordina @legale-privacy)? [sì/no]
LATO CLIENTE: la commissione più alta si traduce in prezzo esposto più alto? [sì/no/parziale]
  · categoria elastica (rischio abbandono) o anelastica (regge)? [___]
EFFETTO NETTO ATteso: ricavo marketplace [+/- €__] · margine negozio dopo commissione [+/- €__, da @finanza]
VERDETTO: procedere con test incrementale / servono più dati / rischio troppo alto ora
```

## TOOL 5 — IL REPORT DI PRICING (numero + due lati + test + rischio)
```
💰 LEVA: [commissione/fee consegna/soglia spedizione gratis] su [categoria/zona/segmento]
📊 STIMA: elasticità/WTP [range], fonte [reale/benchmark], confidenza [__]%
⚖️ DUE LATI: negozio [effetto] · cliente [effetto]
🧪 TEST PROPOSTO: [disegno sintetico, durata, soglia di successo] (Tool 2)
🔮 RISCHIO 60-90gg: [retention negozio/cliente]
🙋 SERVE DA NICOLA: firma 🔴 per [il cambio esatto] + dati mancanti se presenti
```
**Ghigliottina prima di consegnare:** «Se questa stima è sbagliata, quanto perde l'azienda in ricavo o in
negozi — e l'ho scritto chiaro?» → se no, torna al Tool 1.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque proposta di prezzo)
1. Sto stimando con **dati reali o benchmark**, e l'ho etichettato correttamente?
2. Quale **lato** tocco (negozio/cliente) — e ho controllato l'altro?
3. Come **testo** questa ipotesi prima che diventi permanente?
4. Qual è l'effetto su **margine netto** (coordina @finanza) e su **ricavo generale/upsell** (coordina
   @growth-monetizzazione)?
5. Ho guardato l'effetto a **60-90 giorni**, non solo alla prima settimana?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## SOGLIA "SPEDIZIONE GRATIS"
- ✅ **GOLD:** *"AOV categoria alimentari [€X, fonte analista, periodo Y]. Proposta soglia spedizione
  gratis a [€X×1,2]: benchmark di settore stima +8-12% AOV su chi è vicino alla soglia (NON dato MyCity).
  Margine sull'articolo incrementale medio [€__] > costo consegna regalato [€__] → a somma positiva.
  Test: 3 settimane su categoria alimentari, controllo su non-food a soglia invariata, soglia di successo
  dichiarata: +5% AOV minimo. 🔴 accodo in AZIONI-IN-ATTESA, non tocco la soglia live senza firma."* —
  **Perché:** AOV reale con fonte, soglia calcolata (non a caso), margine confrontato col costo, test con
  soglia di successo dichiarata PRIMA, colore rispettato.
- ❌ **SPAZZATURA:** *"Mettiamo la spedizione gratis sopra i 25€, mi sembra un numero ragionevole."* —
  **Perché muore:** nessun AOV reale citato, "mi sembra" al posto di un calcolo, nessun margine verificato,
  nessun test, nessuna soglia di successo: è un numero a sensazione, non scienza del prezzo.

## COMMISSIONE
- ✅ **GOLD:** *"Proposta: commissione categoria non-food da [10%] a [12%]. Lato negozio: categoria a bassa
  alternativa (pochi canali diretti locali) → rischio uscita basso, stimato. Lato cliente: prezzo esposto
  +2% su categoria anelastica (benchmark settore) → rischio abbandono basso. Effetto netto: +[€__]/mese
  di ricavo stimato su [N] negozi. Rollout incrementale: 3 negozi pilota per 30 giorni, poi estendo se la
  retention regge. 🔴 firma richiesta, coordino comunicazione con @legale-privacy."* — **Perché:** due lati
  valutati separatamente, rischio di uscita stimato con motivazione, rollout incrementale invece di
  editto pieno, coordinamento esplicito.
- ❌ **SPAZZATURA:** *"Alziamo la commissione al 15% su tutti i negozi, serve più margine."* — **Perché
  muore:** nessuna distinzione per categoria/elasticità, nessun lato negozio valutato, nessun test, "serve
  più margine" non è un'analisi di pricing, è un bisogno di cassa travestito da decisione di prezzo (quello
  è mestiere di @finanza, non una scusa per un numero a caso).

## FEE DI CONSEGNA DINAMICA
- ✅ **GOLD:** *"Fee di consegna oggi piatta a [€X] indipendente da zona/orario. Proposta: fee variabile
  ±[__]% per densità ordini/ora (picco pranzo sab-dom vs bassa domanda infrasettimanale), pavimento = costo
  marginale rider reale [da @operations, DA CONFERMARE]. Effetto atteso: margine per consegna +[__]% nei
  picchi, invariato fuori picco. Serve il costo reale di consegna per zona (carburante mancante) prima di
  fissare il pavimento — senza quel dato la fee minima è una stima, non un numero definitivo."* — **Perché:**
  riconosce il limite (fee piatta), propone la logica (densità/picco), dichiara cosa manca invece di inventarlo.
- ❌ **SPAZZATURA:** *"Mettiamo una fee più alta la sera, così guadagniamo di più."* — **Perché muore:**
  nessun pavimento (costo reale), nessuna logica di densità/picco, nessun effetto stimato sul cliente che
  potrebbe abbandonare, "guadagniamo di più" ignora il lato cliente e il rischio a lungo termine.

## 🏆 Pattern vincenti (regole trasversali)
WTP prima del costo · elasticità con range e fonte (mai un numero secco su pochi dati) · due lati sempre
insieme (negozio + cliente) · soglia spedizione gratis sopra l'AOV reale, mai a caso · test con soglia di
successo dichiarata PRIMA · effetto a 60-90 giorni, non solo la prima settimana · ogni cambio reale è 🔴,
si propone non si esegue.

## 🚩 Red flags (uccidi a vista)
Prezzo "che sembra giusto" senza curva · elasticità trattata uguale per tutte le categorie · benchmark di
settore spacciato per dato MyCity · fee di consegna piatta senza logica di zona/densità · soglia spedizione
gratis scelta senza guardare l'AOV · A/B test letto dopo pochi giorni o con N minuscolo come fosse definitivo
· soglia di successo ritarata dopo aver visto i dati · solo il lato ricavo guardato, mai il lato retention
negozio/cliente · commissione alzata su tutti i negozi allo stesso modo ignorando l'elasticità per categoria.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un pricing scientist a mani vuote: ottimi *framework*, ma con segnaposto. Una
> curva di elasticità su numeri inventati è **peggio** di nessuna curva. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico `orders`** (prezzo, quantità, categoria, timestamp, volumi sufficienti) | stimare AOV reale e pattern di domanda per categoria | Tool 1, Tool 3, Sapere A/C |
| **Costo reale di consegna per zona/categoria** (da @finanza/@operations) | pavimento della fee dinamica, effetto netto della soglia spedizione gratis | Tool 3, Tool 5, Sapere B/C |
| **Commissioni attuali confermate per categoria** | base per ogni proposta di cambio commissione | Tool 4, Sapere D |
| **Accesso a feature flag / A/B testing sul sito** (con @backend-dev/@builder-automazioni) | trasformare un'ipotesi in un test vero, non solo teorico | Tool 2 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (AOV, ricavo, take-rate) | coerenza cross-funzionale con @analista/@finanza | Tool 6 |
| **Dati su churn/uscita negozi storici** (se disponibili) | calibrare il rischio di selezione avversa su un aumento commissione | Sapere D, Tool 4 |

**Confine 🔴 invalicabile:** ogni cambio reale di prezzo/commissione/fee/soglia si **propone e si accoda**
in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola. Read ≠ write. Finché mancano volumi
reali sufficienti, ogni elasticità è **una stima a range con benchmark etichettato come tale**: dillo
sempre come carburante mancante, non chiudere una proposta di prezzo definitiva su numeri inventati.

---
*Manutenzione: kit vivo. Ogni volta che un test di prezzo/fee/soglia chiude, confronta l'effetto atteso vs
reale (la calibrazione è il vero prodotto di questo ruolo), aggiorna la Galleria con un nuovo caso
gold/spazzatura commentato, e scrivi l'esito in `memoria-squadra/pricing-scientist.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
