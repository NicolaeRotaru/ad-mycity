---
tipo: kit-mestiere
ruolo: dispatch
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (indirizzi/slot/rider attivi)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · 04-Prodotto-Ops/Operazioni & Logistica.md · 02-Aree/Area - Consegna.md
---

# 🧰 KIT MESTIERE — dispatch (il "cervello allenato" del fuoriclasse del routing)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere del routing, gli strumenti passo-passo, la galleria di piani-giro, e il carburante.
> Leggilo come la tua testa da 15 anni di dispatch last-mile (Glovo/Amazon Flex). Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse del dispatch SA davvero)

## A. Densità prima di tutto — la legge n°1 del last-mile
- **Il costo non è il numero di ordini: è il numero di fermate disperse.** 4 ordini sulla stessa via = ~1 giro
  efficiente; 4 ordini in 4 quartieri = 4 mezzi-giri sprecati. Il km tra le fermate (l'ultimo miglio) è il
  vero costo, non la consegna in sé. → **Batcha sempre per prossimità**, è la leva con il ROI più alto.
- **La metrica che governa tutto: drop per giro (drop density).** Un dispatch sano fa 3-5+ consegne per giro
  in zona densa (centro storico); sotto le 2 drop/giro stai bruciando rider. Se un giro ha 1 sola fermata,
  o l'ordine è urgentissimo o hai sbagliato batch.
- **La densità non è uniforme: è a grappoli.** Gli ordini si addensano per via/palazzo/orario (il venerdì
  sera in centro, il pranzo negli uffici). Mappa i grappoli ricorrenti: la densità di domani la prevedi, non
  la subisci. Una zona "calda" ricorrente diventa una **regola di zonizzazione**, non un calcolo da rifare.

## B. Lo slot è un vincolo DURO — la densità è l'obiettivo, lo slot è il muro
- **Puoi accorpare solo ordini compatibili per finestra di consegna.** Mettere uno slot 13:00 con uno 15:00
  nello stesso giro fa **slittare il primo**: è l'errore più costoso (reclamo + cibo freddo + rimborso).
  Regola ferrea: **prima filtra per slot compatibile, POI ottimizzi la densità dentro lo slot.**
- **La gerarchia dei vincoli (in ordine):** (1) finestra di consegna promessa → (2) capacità/carico del mezzo
  → (3) zona di partenza del rider → (4) km della sequenza. Non si "ottimizzano i km" violando (1). La
  domanda-ghigliottina del mestiere: **«Sto risparmiando km a costo di sfondare uno slot?»** → se sì, rifai.
- **Slot stretto = batch piccolo, accetta la perdita di densità.** Quando la finestra è imminente, meglio un
  giro meno denso ma puntuale che un batch grasso che arriva in ritardo. La puntualità batte i km, sempre.
- **Buffer di servizio:** ogni fermata costa tempo morto (parcheggio + citofono + consegna + ripartenza:
  ~3-6 min reali in centro). Il tempo-giro non è solo guida: km/velocità + n_fermate × tempo-fermata. Un
  piano che ignora il tempo-fermata sottostima e fa sfondare lo slot.

## C. La sequenza è un problema del commesso viaggiatore (TSP)
- **Ordina le fermate per percorso più corto rispettando le finestre, NON per ordine d'arrivo dell'ordine.**
  Servire #1 perché è arrivato prima, poi tornare indietro per #5 che era sulla strada, è lo zigzag che brucia
  km e minuti. La sequenza giusta è geografica + temporale.
- **TSP con finestre (VRPTW):** non basta il giro più corto in assoluto; dev'essere il più corto **che rispetta
  ogni slot**. A volte la fermata vicina va servita dopo perché la sua finestra apre più tardi.
- **Euristica pratica (senza solver):** parti dal negozio, vai alla fermata più vicina compatibile col tempo,
  poi alla successiva più vicina, e così via (nearest-neighbor); poi guarda se scambiare due fermate accorcia
  il giro (2-opt mentale: "se inverto B e C zigzago di meno?"). 2-3 ritocchi e hai un ottimo locale buono.
- **La fermata fuori rotta la ISOLI o la SPOSTI di giro.** Un ordine che fa deviare tutto il giro di 3 km per
  servire un quartiere lontano non va forzato dentro: o gli dedichi un mini-giro, o lo sposti allo slot
  successivo se la stessa zona si ripopola (vedi GOLD in galleria). Subirlo è un autogol.

## D. Batching ordini — l'arte di comporre il giro
- **Le 3 chiavi di batch (in cascata):** slot compatibile → quartiere/zona → via/grappolo fine. Prima
  spacchetti per slot, dentro ogni slot raggruppi per zona, dentro la zona ordini per via.
- **Dimensione del batch = min(capacità mezzo, fermate servibili nello slot, drop-target).** Cargo-bike porta
  di più ma è più lenta nei trasferimenti lunghi; scooter è agile su distanze. Non riempire un batch oltre
  ciò che lo slot consente di consegnare in tempo: un batch troppo grande sfonda la finestra dell'ultima fermata.
- **Compatibilità merce:** caldo vs freddo vs fragile. Non batchare un gelato con un giro lungo di 6 fermate;
  la merce sensibile va in cima alla sequenza o su giro dedicato. (Coordina con @operations sullo stato pronto.)

## E. Bilanciamento del carico rider — livella, non "dividi a testa"
- **Meglio 3 rider all'80% che 2 al 120% (ritardi) e 1 al 20% (spreco).** L'obiettivo non è "ogni rider porta
  qualcosa": è **utilizzo bilanciato** vicino alla capacità senza sforare. Un rider già carico ma vicino batte
  uno scarico ma lontano (il trasferimento a vuoto è costo puro).
- **Abbina per: zona di partenza × carico attuale × capacità mezzo × finestra.** Il rider giusto al batch giusto.
- **Cut-off e saturazione:** quando gli ordini di uno slot superano la capacità della flotta, il giro **non si
  ottimizza** — si segnala. Candore PRIMA: «slot 13:00 saturo, servono +1 rider o cut-off» a @rider-fleet e
  all'AD. Nessun routing salva uno slot senza capacità: il piano-giri perfetto su flotta insufficiente è un'illusione.

## F. Gli indicatori del mestiere (il tuo cruscotto)
- **Drop per giro** (consegne/giro) — più alto = più denso/efficiente. **Km per consegna** = km_totali ÷ consegne
  — più basso = meglio. **% ordini dentro lo slot promesso** — il KPI-guardiano (non scende mai per fare km).
  **Utilizzo rider** = carico/capacità, livellato. **Tempo-giro reale** = guida + (fermate × tempo-fermata).
- **La regola d'oro del dispatch:** **densità e puntualità vincono INSIEME**. Spremere km a costo di un ritardo,
  o riempire un giro a costo di una fermata fredda, è il contrario del mestiere. Il giro perfetto è denso **e** in orario.

## G. L'aggancio MyCity (dove il sapere diventa il NOSTRO)
Piacenza è una **città piccola e densa**: il centro storico è un grappolo naturale (via Roma, Mazzini, Cavour,
Piazza Duomo a pochi minuti l'uno dall'altro) → densità alta a basso km, è il nostro vantaggio strutturale.
Le zone esterne (Farnesiana, Besurica, Borgotrebbia) sono i punti dove la densità crolla: lì lo slot-per-microzona
e l'accorpamento contano di più. La **cargo-bike** è l'arma del centro (zona pedonale, parcheggio zero). Ogni piano
deve poter rispondere SÌ a: *«un dispatch lead di Glovo firmerebbe questo giro?»*.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Metodo di BATCHING (raggruppa in cascata: slot → zona → via)
1. **Estrai** gli ordini aperti con: indirizzo, zona, **slot/finestra**, stato (pronto?), created_at.
2. **Spacchetta per slot compatibile** — un bucket per finestra (13:00, 13:30, 15:00…). Mai mischiare bucket.
3. Dentro ogni slot, **raggruppa per zona/quartiere** (Centro, Farnesiana, Besurica…).
4. Dentro ogni zona, **ordina per via/grappolo** (gli ordini sulla stessa via o palazzo vanno insieme).
5. **Taglia ogni batch** a `min(capacità mezzo, fermate servibili nello slot, drop-target)`. Se avanza → batch 2.
6. **Marca le fermate fuori rotta** (zona isolata, 1 sola fermata lontana): candidate a mini-giro o a slittamento.
> Output: una lista di batch, ognuno con slot · zona · ordini · stima drop. Questo è l'input dei giri (Tool 2).

## TOOL 2 — Costruzione del GIRO OTTIMO (sequenza TSP con finestre)
1. **Punto di partenza:** il negozio/hub di quel batch.
2. **Nearest-neighbor:** dalla partenza, vai alla fermata **più vicina compatibile** con la sua finestra; ripeti.
3. **2-opt mentale:** scorri la sequenza, cerca due fermate che invertite **accorciano** il giro (tolgono uno
   zigzag) senza violare slot. Applica lo scambio migliore. Ripeti 1-2 volte.
4. **Controllo finestre:** verifica che ogni fermata sia servita DENTRO il suo slot (somma guida + tempo-fermata
   cumulati). Se l'ultima sfonda → togli una fermata (al batch successivo) o accorcia altrove.
5. **Stima km e tempo-giro:** km_sequenza + (n_fermate × tempo-fermata). Annota entrambi: servono al confronto.
> Output: sequenza ordinata + km + tempo + "tutte le finestre rispettate? sì/no".

## TOOL 3 — Checklist di ASSEGNAZIONE ordine → rider
- [ ] **Slot:** il rider è libero/compatibile con la finestra del batch? (no sovrapposizioni che fanno slittare)
- [ ] **Zona di partenza:** il rider parte da/vicino alla zona del batch? (no trasferimento a vuoto lungo)
- [ ] **Carico attuale:** il rider ha capacità residua? (non oltre 100% → ritardi)
- [ ] **Mezzo giusto:** cargo-bike per centro/zona pedonale o batch grande; scooter per distanze/zone esterne.
- [ ] **Merce:** caldo/freddo/fragile compatibile con la durata del giro? (gelato ≠ giro da 6 fermate)
- [ ] **Bilanciamento:** dopo l'assegnazione i rider restano livellati (~80%)? (no 1 al 120% e 1 al 20%)
- [ ] **Fuori rotta gestito:** la fermata isolata è in mini-giro o slittata, non forzata dentro?
> Una casella ❌ = l'assegnazione non è pronta. Sistemala prima di proporla.

## TOOL 4 — Calcolo DROP-PER-GIRO e KM-PER-CONSEGNA (il cruscotto, sempre)
- **Drop per giro** = n_consegne_del_giro. Target sano: **≥3 in zona densa**, ≥2 ovunque. Sotto 2 → ribatcha.
- **Km per consegna** = km_totali_del_giro ÷ n_consegne. Più basso meglio. Confronta tra le varianti (Tool 5).
- **% in-slot** = consegne_in_orario ÷ totali. **Guardiano: non scende mai sotto target per fare km/densità.**
- **Utilizzo rider** = carico ÷ capacità. Livellato attorno all'80% sulla flotta. Annota chi è scarico/sovraccarico.
> Dichiara questi 4 numeri per ogni piano: sono la prova che il giro è buono, non un'opinione.

## TOOL 5 — Il LOOP "2-3 raggruppamenti → scegli" (NON consegni il primo batch che torna in mente)
1. Genera **≥2-3 raggruppamenti diversi**: (a) per via/grappolo fine, (b) per quartiere, (c) per slot-poi-zona.
2. Per ognuno, costruisci i giri (Tool 2) e calcola **km totali, drop/giro, tempo, % in-slot** (Tool 4).
3. **Critica ciascuno:** rispetta TUTTI gli slot? bilancia i rider? la sequenza è la più corta? c'è una fermata
   fuori rotta non gestita? un rider mandato per 1 solo ordine accorpabile?
4. **Tieni quello che un dispatch lead di Glovo firmerebbe.** Scarta chi fa densità a costo di un ritardo
   (annota PERCHÉ scartato → va in memoria). Ghigliottina: *«risparmio km sfondando uno slot?»* → se sì, rifai.
5. **Raffina 2-3 round:** accorpa l'ultimo ordine isolabile · raddrizza la sequenza (2-opt) · livella i rider.
6. Consegna **solo ora**: batch + rider + sequenza + km/tempo/drop, e **dichiara perché questo batte gli altri**.

## TOOL 6 — Protocollo SLOT SATURO / CAPACITÀ INSUFFICIENTE (candore prima)
1. Conta le fermate-slot vs capacità reale della flotta in quella finestra.
2. Se domanda > capacità → **NON forzare il routing** (genererebbe ritardi a catena).
3. Prepara la segnalazione: *«Slot [X] saturo: [N] ordini, capacità [M]. Opzioni: +1 rider (🔴 costo) /
   cut-off ordini oltre [M] / allargare la finestra (🔴 cambia promessa).»* → a @rider-fleet + AD.
4. Accoda l'azione 🔴 in `AZIONI-IN-ATTESA.md`. Niente si perde, niente parte senza firma.

## TOOL 7 — Estrazione dei dati reali (Supabase, SOLA LETTURA)
- **Ordini aperti:** `orders` → indirizzo, zona, slot/finestra, delivery_status, created_at (filtra solo aperti
  e dello slot in lavorazione: contesto leggero, non ricaricare tutto).
- **Rider:** attivi, zona di partenza, carico attuale, mezzo (se la tabella esiste; altrimenti dichiaralo mancante).
- **Aree/slot:** zone e finestre di consegna definite. Proponi assegnazioni, **non scrivere mai sul DB**.
> Se mancano indirizzi precisi o il carico reale dei rider → **fermati e procuralo**: piano su zone approssimate
> manda un rider a vuoto. Densità vera richiede dati veri (vedi Strato 6).

---
# 🖼️ STRATO 5 — GALLERIA (piani-giro gold/spazzatura, col PERCHÉ)
> Modella, non copiare. Ogni voce: PIANO · PERCHÉ funziona/muore (il principio).

## ✅ GOLD — densità + slot + sequenza + gestione fuori-rotta
- **6 ordini → 2 giri.** *Giro A* (rider Luca, cargo-bike): #1-#3-#5 tutti Centro storico slot 13:00, sequenza
  via Roma → via Mazzini → Cavour, **2,1 km, 3 drop, dentro promessa**. *Giro B* (rider Sara, scooter): #2-#4
  Farnesiana slot 13:30; #6 isolato Besurica → **proposto slittare al giro delle 15:00** (stessa zona si
  ripopola, niente vuoto). *Perché è gold:* densità reale sfruttata, slot rispettati, sequenza corta (no zigzag),
  e la fermata fuori rotta è **gestita** (slittata) invece di subìta. Drop/giro alto, km/consegna basso, 100% in-slot.

## ✅ GOLD — slot stretto, accetta meno densità per la puntualità
- **3 ordini centro slot 13:00 (finestra imminente) + 2 ordini centro slot 14:00.** Non li unisco in un giro
  grasso da 5: faccio il giro 13:00 da 3 (puntuale) e il giro 14:00 da 2 separato. *Perché:* unire avrebbe fatto
  sfondare lo slot 13:00 per spremere km. **La puntualità batte i km**: meno denso ma 100% in orario.

## ✅ GOLD — regola di zonizzazione (altitudine L4, non solo il puzzle di oggi)
- *«Il venerdì sera gli ordini si addensano in zona universitaria via X-Y-Z: pre-assegno un rider cargo a
  quel grappolo dalle 19:00.»* — distillata in `memoria-squadra/dispatch.md`. *Perché:* trasforma un calcolo
  ripetuto in una **regola** → i giri di domani partono buoni di default. Questo è il salto L7.

## ❌ SPAZZATURA — "dividi a testa"
- *«Dividiamo gli ordini tra i rider disponibili così partono prima.»* *Perché muore:* ignora densità, slot e
  sequenza; "una testa = uno" **massimizza km e ritardi**. È l'opposto del dispatch: tanti mezzi-giri a vuoto.

## ❌ SPAZZATURA — slot incompatibili nello stesso giro
- *«#1 (slot 13:00) e #6 (slot 15:00) sono nella stessa zona, li metto nello stesso giro.»* *Perché muore:* per
  servire #6 si fa slittare #1 → reclamo, cibo freddo, rimborso. **Lo slot è un vincolo duro**, la zona viene dopo.

## ❌ SPAZZATURA — sequenza a zigzag
- *«Servo nell'ordine in cui sono arrivati: #1 via Roma, #2 Farnesiana, #3 via Cavour (di nuovo centro).»*
  *Perché muore:* va in centro, esce a Farnesiana, **torna** in centro → km e tempo raddoppiati. Ordina per
  geografia+finestra (Tool 2), non per created_at.

## ❌ SPAZZATURA — rider per 1 solo ordine accorpabile
- *«Mando Luca per #4 subito.»* — ma #4 era sulla stessa via di #2 e #5 dello stesso slot. *Perché muore:* un
  giro da 1 drop quando ne bastava 1 da 3. **Drop/giro a terra**, km/consegna alle stelle.

## 🏆 Pattern vincenti distillati (regole trasversali)
Densità prima di tutto · slot = muro (filtra prima, ottimizza dopo) · sequenza geografica+temporale (no zigzag) ·
fuori rotta isolata/slittata · livella i rider (~80%) · candore PRIMA sullo slot saturo · la regola di zona batte il calcolo ripetuto.
## 🚩 Red flags (uccidi a vista)
"dividi a testa" · slot diversi nello stesso giro · sequenza per ordine d'arrivo · drop/giro < 2 senza motivo ·
rider scarico + rider sovraccarico · km ottimizzati ignorando la finestra · piano su zone approssimate senza indirizzi reali · scrivere sul DB invece di proporre.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: stima la densità ma non la **garantisce** (manda rider a
> vuoto). Ecco ESATTAMENTE cosa serve e dove si aggancia nel toolkit:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Indirizzi/zone esatti** degli ordini | batch per via/grappolo, no zone approssimate | Tool 1 (batching), Tool 7 |
| **Slot/finestre reali** di consegna | filtro per slot compatibile (vincolo duro) | Tool 1, Tool 2 (finestre) |
| **Rider attivi** (zona di partenza, carico, mezzo) | abbinamento ordine→rider + bilanciamento | Tool 3, Tool 4 |
| **Geocodifica/distanze reali** (matrice km/tempo) | sequenza TSP vera, non stimata "a occhio" | Tool 2 (sequenza), Tool 4 (km) |
| **Tempo-fermata reale** (parcheggio+citofono+consegna) | tempo-giro affidabile → no slot sfondati | Tool 2 (controllo finestre) |
| **Dati storici di densità** (grappoli per via/orario) | regole di zonizzazione (altitudine L4-L7) | Galleria GOLD-zona, memoria |
| **Capacità reale flotta per slot** | rilevare slot saturo PRIMA che esploda | Tool 6 (slot saturo) |

Finché manca, **NON inventare e NON consegnare un compromesso**: dichiara la confidenza ("densità certa,
distanza stimata senza geocodifica") e chiedi il carburante a Nicola come leva che alza il tetto da 8 a 10.

---
*Manutenzione: questo kit è vivo. Ogni volta che un giro pianificato torna col dato reale (drop/giro, km/consegna,
% in-slot, rider a vuoto), aggiorna la Galleria (nuovo gold/spazzatura col perché) e gli schemi di densità in
`memoria-squadra/dispatch.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
