---
tipo: kit-mestiere
ruolo: demand-forecasting
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico ordini più lungo + calendario eventi/meteo verificato da intelligence
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — demand-forecasting (il "cervello allenato" del demand planner di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un demand planner
> senior (Amazon In-Stock, Ocado fresh, dark-store planning) **sa e usa** (strati 3-6): i modelli mentali sulla
> previsione, gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Nota di realtà: MyCity è in fase early, pochi negozi con storico
> utile — il kit installa il **metodo corretto anche su dati piccoli**, non finge dati che non ci sono.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le metriche di errore che contano (mai un forecast senza queste)
- **MAPE (Mean Absolute Percentage Error)** = media di `|reale − previsto| / reale` sul periodo. È il metro
  standard per confrontare modelli diversi: più basso, meglio è. Un MAPE del 15% su un forecast settimanale di
  categoria è già un buon risultato per un marketplace locale early-stage (benchmark generico di settore per
  retail a corto storico: 15-30% è normale, sotto 10% è raro senza anni di dati).
- **Bias (errore medio con segno)** = media di `(previsto − reale)`, senza valore assoluto. Se è sistematicamente
  positivo o negativo, il modello sbaglia sempre nella stessa direzione: è un **difetto strutturale da
  correggere**, non un rumore da coprire con più scorta.
- **Baseline naive** = il confronto obbligatorio prima di qualunque modello più complesso: "stessa settimana
  scorsa" o "media mobile delle ultime 4 settimane". Se il tuo modello non batte questo, non ha valore aggiunto.
- **Intervallo di confidenza, non punto singolo.** Un forecast onesto è un range ("15-17 ordini, 80% di
  confidenza"), non un numero secco: il punto singolo nasconde l'incertezza reale, specialmente su N piccolo.

## B. Newsvendor / scorte-obiettivo asimmetriche (il cuore del mestiere sul fresco)
- Il problema classico del "giornalaio": quanto stock tenere quando il costo di **rottura** (vendita persa +
  fiducia) e il costo di **sovrastock** (scarto, capitale immobilizzato) sono diversi tra loro.
- **Regola pratica:** se il costo di rottura > costo di sovrastock (es. cliente che se ne va da un concorrente),
  la scorta-obiettivo va sopra la previsione media. Se il costo di sovrastock > costo di rottura (fresco a
  shelf-life corta, deperibile in 1-2 giorni), la scorta-obiettivo va **vicino o sotto** la previsione media:
  meglio rischiare un cliente in più in coda che buttare merce ogni settimana.
- **Sul fresco l'asimmetria è quasi sempre a favore di scorte più basse**: il costo dello scarto è certo e
  immediato, il costo della rottura è probabilistico e spesso recuperabile (il cliente torna il giorno dopo).
  Trattare fresco e non-deperibile con lo stesso buffer è l'errore #1 del junior.
- **Formula guida (qualitativa, da adattare con costi reali):** scorta-obiettivo cresce con il rapporto
  (costo rottura / (costo rottura + costo sovrastock)). Più questo rapporto è vicino a 1, più conviene
  sovra-scortare; più è vicino a 0, più conviene sotto-scortare.

## C. Decomposizione della domanda (separa i pezzi prima di sommarli)
Domanda osservata = **Trend** (crescita/calo strutturale, es. più clienti nel tempo) + **Stagionalità/calendario**
(giorno della settimana, mese, festività ricorrenti — prevedibile e ripetuta) + **Evento esogeno** (meteo, fiera,
sagra, promozione — non ricorre a calendario fisso, va verificato caso per caso) + **Rumore** (variazione
casuale non spiegabile, più grande quanto più N è piccolo).
- Non sommare tutto in un "+30% perché sabato + bel tempo + forse trend": **isola ogni componente**, dichiara
  quale hai misurato e quale hai stimato, e con quale confidenza.
- Gli eventi esogeni (meteo, eventi in città) **non li stimi tu**: sono il dominio di @intelligence. Tu li
  **richiedi** e li **incorpori** come driver con la fonte citata.

## D. Segnale vs rumore su N piccolo (la trappola dell'early-stage)
- Con poche decine di ordini a settimana, un salto del +50% può essere **normale varianza statistica**, non un
  trend. Prima di dichiarare un pattern, confronta la deviazione osservata con la deviazione storica: se rientra
  nella variabilità già vista, è rumore, non segnale.
- **Regola pratica:** servono almeno 4-6 cicli comparabili (es. 4-6 sabati) prima di fidarsi di un pattern
  settimanale; per un pattern stagionale/festivo servono più anni di storico, che MyCity oggi non ha — quindi
  ogni previsione su un evento raro va dichiarata a **bassa confidenza** ed etichettata come tale.

## E. Shelf-life e lead time (il ponte tra previsione e scorta reale)
- **Shelf-life** = quanto dura il prodotto prima di essere invendibile. **Lead time** = quanto tempo serve al
  negozio per rifornirsi. Se lead time > shelf-life del ciclo di vendita, ogni riordino "extra" rischia lo
  scarto prima ancora di essere venduto: la scorta-obiettivo deve rispettare questo vincolo, non solo la media
  di vendita prevista.
- Categorie diverse hanno vincoli diversi: freschissimo (pane, gastronomia, 1-2 giorni) vs deperibile medio
  (salumi/formaggi, settimane) vs non deperibile (conserve, non-food, mesi/anni). Il rigore forecast va dove
  il vincolo è più stretto.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template FORECAST per negozio/categoria (compilabile)
```
FORECAST — negozio: [____]   categoria: [____]   periodo: [____]   fonte storico: [Supabase orders, N settimane]
(A) Media storica (stesso giorno/periodo, ultime N settimane)     [____] unità/ordini   (dev.std [__])
(B) Baseline naive (stessa settimana scorsa o media mobile 4 sett) [____]   ⟵ l'avversario da battere
(C) Componente stagionalità/calendario (giorno/mese/festività)     [+/− __]%   fonte: pattern storico interno
(D) Componente evento esogeno (meteo/evento)                       [+/− __]%   fonte: @intelligence, [link/data]
(E) Forecast puntuale = A × (1+C) × (1+D)                          [____]
(F) Intervallo di confidenza (80%)                                 [____] – [____]
(G) MAPE del modello su ultime 4 previsioni testate (se esistono)  [__]%   vs baseline naive [__]%
─────────────────────────────────────
Confidenza dichiarata: [__]%   (bassa se N corto o evento raro non confermato)
```
**Output atteso:** intervallo (non un punto), confronto con la baseline, MAPE se disponibile, fonte di ogni componente.

## TOOL 2 — Procedura calcolo errore (MAPE/bias) e confronto vs naive
1. Prendi le previsioni passate (se esistono) e i valori reali dello stesso periodo.
2. Calcola `errore% = (previsto − reale) / reale` per ogni osservazione.
3. **MAPE** = media di `|errore%|` → misura quanto sbagli in media, indipendentemente dalla direzione.
4. **Bias** = media di `errore%` (con segno) → se sistematicamente positivo/negativo, il modello ha un difetto
   strutturale (es. ignora sempre il weekend): correggi il modello, non aggiungere buffer.
5. Ripeti lo stesso calcolo per la **baseline naive**: se il tuo modello ha un MAPE più alto della naive, torna
   al tavolo da disegno — la complessità in più non sta pagando.
6. **Se non hai previsioni passate da valutare** (primo forecast su una categoria), dichiaralo e parti dalla
   baseline naive come primo numero, con confidenza esplicitamente più bassa.

## TOOL 3 — CHECKLIST scorte-obiettivo per categoria (passa ogni voce)
- [ ] Ho classificato la categoria: **freschissimo / deperibile medio / non deperibile**?
- [ ] Ho stimato (anche qualitativamente, con @finanza se serve il dato preciso) il **costo di rottura** vs il
      **costo di sovrastock** per QUESTA categoria?
- [ ] La scorta-obiettivo riflette l'asimmetria (fresco → verso il basso; alta rottura/basso deperimento →
      verso l'alto), non un buffer uguale per tutti?
- [ ] Ho verificato che **lead time di riordino ≤ shelf-life** residua alla consegna? Se no, segnalalo come
      rischio strutturale (non risolvibile solo col forecast).
- [ ] Ho dichiarato l'**intervallo**, non solo un numero?

## TOOL 4 — Procedura di richiesta dato esterno a @intelligence
1. **Non stimare tu** l'effetto di un evento/meteo: identifica la data/periodo e la categoria interessata.
2. Chiedi esplicitamente in Sala Operativa: `@intelligence: mi serve conferma su [evento/meteo] per [data],
   impatto atteso su [categoria] a Piacenza — con fonte e ≥2 riscontri se possibile`.
3. Ricevuta la risposta, **citala come fonte** nel forecast (non la assorbi come "so per certo che...").
4. Se @intelligence non ha una fonte verificata, il forecast usa **solo** trend + stagionalità interna, e lo
   scenario "con evento" resta un'ipotesi a bassa confidenza dichiarata separatamente.

## TOOL 5 — Il REPORT FORECAST (numero + rischio + azione)
```
📈 FORECAST [categoria/negozio/zona], periodo [__]: previsto [X-Y] (baseline naive: [Z]). MAPE modello [__]%
    (vs naive [__]%). Confidenza [__]%.
📦 SCORTA-OBIETTIVO: [____] unità (asimmetria: [fresco→verso il basso / alta rottura→verso l'alto], perché [__]).
⚠️ RISCHIO: [rottura di stock probabile su... / rischio scarto su... ], entro [data].
🧭 FONTE EVENTO ESTERNO (se presente): [@intelligence, link/data] oppure "nessuno, solo trend+stagionalità interna".
🙋 SERVE DA NICOLA/NEGOZIO: [conferma scorta / dato costo reale mancante].
```
**Ghigliottina prima di consegnare:** «Se un negozio ordinasse SOLO su questo numero, andrebbe in rottura o in spreco?»

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque forecast)
1. Ho **storico sufficiente** (settimane, non giorni) per separare segnale da rumore? 2. Il numero **batte la
baseline naive**? 3. Ho **separato** trend/stagionalità/evento, o li ho mescolati a naso? 4. Il costo di
**rottura vs sovrastock** è simmetrico per questa categoria (quasi mai sul fresco)? 5. Il dato esterno viene da
**@intelligence verificato**, o l'ho ipotizzato io?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto o esempio
> plausibile, non un dato MyCity reale finché non è verificato sullo storico vero.

## FORECAST SETTIMANALE SU FRESCO
- ✅ **GOLD:** *"Pane Quotidiano, categoria pane fresco, sabato prossimo: media storica 12 ordini/sabato
  (6 settimane, dev.std 3) = baseline naive 12. Sabato precede una festività: pattern interno su 3 occorrenze
  comparabili +25/+40% (confidenza 55%, da confermare con @intelligence su questa festività specifica).
  Forecast: 15-17 (intervallo 80%). Scorta-obiettivo: 17 + buffer 10% (shelf-life 1 giorno, niente oltre).
  MAPE modello ultime 4 settimane: 14% vs 22% naive."* — **Perché:** batte la naive, intervallo dichiarato,
  fonte dell'evento etichettata come "da confermare", buffer coerente con la shelf-life cortissima.
- ❌ **SPAZZATURA:** *"Sabato vende sempre di più, facciamo il 30% di scorta in più per sicurezza."* —
  **Perché muore:** nessuna baseline, nessun intervallo, "30%" senza fonte né rapporto costo-rottura/scarto,
  ignora che è un prodotto a shelf-life di 1 giorno dove il sovrastock si butta.

## RISCHIO ROTTURA DI STOCK
- ✅ **GOLD:** *"Categoria [X] a [negozio Y]: trend +8%/settimana su 5 settimane (non rumore: dev.std storica
  è ±3%, quindi +8% è un segnale reale). Al ritmo attuale, lo stock attuale copre 4 giorni, il lead time di
  riordino è 3 giorni → rischio rottura BASSO se si riordina entro domani, ALTO se si aspetta oltre. Azione:
  segnalare al negozio oggi."* — **Perché:** trend validato contro la varianza storica, lead time confrontato
  con la copertura, rischio quantificato con una soglia temporale chiara.
- ❌ **SPAZZATURA:** *"Le vendite stanno salendo, rischiamo di finire la merce."* — **Perché muore:** nessun
  numero, nessun confronto con la varianza normale, nessun lead time, nessuna soglia temporale: non è
  azionabile, è un'impressione.

## SEGNALE VS RUMORE SU N PICCOLO
- ✅ **GOLD:** *"Gli ordini di [categoria] sono passati da 4 a 7 in un giorno (+75%). Ma la deviazione storica
  di questa categoria è ±3 ordini/giorno su base giornaliera: un salto di 3 unità rientra nella normale
  variabilità. Non dichiaro un trend con un solo punto dato — servono almeno 4-5 giorni comparabili prima di
  concludere. Confidenza sul 'trend': 20%, è più probabile rumore."* — **Perché:** non prende un singolo
  numero per un trend, confronta con la varianza storica, dichiara bassa confidenza onestamente.
- ❌ **SPAZZATURA:** *"Gli ordini sono raddoppiati ieri, è chiaramente un trend in crescita, prepariamoci."* —
  **Perché muore:** un solo giorno preso come trend, nessun confronto con la variabilità normale, nessuna
  cautela su N=1.

## 🏆 Pattern vincenti (regole trasversali)
Batti sempre la baseline naive prima di fidarti di un modello più complesso · intervallo, mai un punto secco ·
scorte-obiettivo asimmetriche (specie sul fresco) · separa trend/stagionalità/evento/rumore · l'evento esterno
si chiede a @intelligence, non si inventa · dichiara MAPE e confidenza · lead time vs shelf-life sempre
verificato prima di proporre una scorta.
## 🚩 Red flags (uccidi a vista)
Forecast senza intervallo · nessun confronto con la baseline naive · buffer di sicurezza uguale per fresco e
non-deperibile · trend dichiarato da 1-2 punti dati · effetto meteo/evento inventato senza fonte · bias
sistematico coperto con più scorta invece che corretto nel modello · scorta-obiettivo che ignora il lead time
di riordino del negozio · MAPE mai calcolato ("funziona, mi pare").

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un planner a mani vuote: ottimo *metodo*, ma con pochissimi dati su cui applicarlo.
> Un forecast su storico inventato è peggio di nessun forecast. Ecco esattamente cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico ordini per negozio/categoria/data** (Supabase `orders`, il più lungo possibile) | baseline, MAPE, decomposizione della domanda | Tool 1, Tool 2, Sapere C-D |
| **Dataset pulito** (via @data-engineer: niente duplicati/outlier/timezone sfasati) | previsioni non falsate da errori a monte | Tool 1, Tool 2 |
| **Calendario eventi + dati meteo verificati** (via @intelligence, con fonte e data) | la componente "evento esogeno" del forecast | Tool 1 (D), Tool 4 |
| **Shelf-life reale per categoria/prodotto** (da onboarding-negozi/negozio) | la scorta-obiettivo non supera mai la finestra di vendita | Sapere E, Tool 3 |
| **Lead time di riordino reale del negozio** | verifica che il riordino arrivi in tempo utile | Sapere E, Tool 3 |
| **Costo di rottura vs costo di sovrastock per categoria** (da @finanza) | l'asimmetria della scorta-obiettivo (newsvendor) | Sapere B, Tool 3 |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (ordine completato, categoria, zona) | coerenza cross-funzionale con @analista | Tool 6 |

**Confine invalicabile:** il forecast è sempre 🟢 (consiglio, sola lettura). Non tocchi ordini, prezzi o
magazzino reale — la scorta-obiettivo la applica il negozio o il senior competente. Finché manca lo storico
lungo o il dato esterno verificato, **dillo come "carburante"**: un intervallo ampio ma onesto vale più di un
numero preciso e inventato.

---
*Manutenzione: kit vivo. Ogni volta che un periodo forecast chiude, confronta previsto vs reale (calcola MAPE
reale), aggiorna la Galleria con un nuovo esempio gold/spazzatura reale e scrivi l'esito in
`memoria-squadra/demand-forecasting.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
