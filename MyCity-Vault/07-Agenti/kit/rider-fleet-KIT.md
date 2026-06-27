---
tipo: kit-mestiere
ruolo: rider-fleet
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (storico ordini per fascia/zona + costo rider-ora)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · memoria-squadra/rider-fleet.md
---

# 🧰 KIT MESTIERE — rider-fleet (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere del fleet management, gli strumenti passo-passo, la galleria di piani, e il carburante.
> Leggilo come la tua testa da 15 anni di last-mile. Bersaglio: **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]).
> Regola d'oro: la flotta si dimensiona su una **curva**, non su una media. Sotto il picco = clienti persi;
> sopra la valle = margine bruciato. Tutto qui dentro serve a far **combaciare capacità e domanda, fascia per fascia**.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La curva della domanda — come si comporta DAVVERO il last-mile food/retail locale
- **La domanda non è piatta: ha due gobbe.** Pranzo `12:00-14:00` e cena `19:00-21:30` concentrano la maggior
  parte degli ordini di una giornata feriale; in mezzo c'è la **valle** (15-18) dove la domanda crolla. La cena
  è quasi sempre più alta e più lunga del pranzo. → Non chiedere "quanti rider oggi" ma "quanti **ora 12-14**,
  quanti **ora 19-21**, quanti weekend".
- **Il weekend sposta e allarga la curva.** Venerdì sera e sabato sono i picchi della settimana (cena più alta,
  che inizia prima e finisce dopo); la domenica pranzo conta più della domenica sera. Lunedì è il giorno più
  fiacco. → Il piano feriale e il piano weekend sono **due piani diversi**, non lo stesso ridimensionato.
- **La micro-curva dentro il picco.** Anche dentro le 19-21 c'è un sub-picco (di solito 19:45-20:30): è lì che
  si accumulano gli ordini simultanei e nascono i ritardi. Dimensiona sul **sub-picco**, non sulla media del picco.
- **La domanda è prevedibile (base) + shock.** Lo **storico per fascia** dà la base affidabile (giovedì sera
  cresce, weekend picco). **Meteo ed eventi** sono shock che spostano la curva: pioggia/freddo → la domanda di
  consegna **sale** (la gente non esce) ma la velocità rider **scende**; eventi in centro (mercati, concerti,
  fiere) → la domanda sale ma il traffico/ZTL rallenta i giri. → Anticipa con WebSearch, **non reagire il giorno stesso**.

## B. Il costo per consegna — la bussola di ogni decisione
- **Definizione operativa:** `costo/consegna = (rider-ore pianificate × costo rider-ora) ÷ consegne completate`.
  È il numero che ti dice se un turno è sano. Un picco ben coperto ha costo/consegna **basso** (tanti drop per
  rider-ora); la valle presidiata "per sicurezza" ha costo/consegna **alto** (paghi e non consegni).
- **Lo stesso rider ha due valori opposti.** Un rider in più **nel picco** abbassa il costo/consegna (produce
  drop); lo **stesso rider nella valle** lo alza (gira a vuoto). → La leva numero uno non è "più o meno rider":
  è **spostare capacità dalla valle al picco**.
- **La soglia è una decisione di business, non tua.** Esiste un costo/consegna-target oltre il quale la consegna
  erode il margine (riconcilialo con @finanza: dipende da scontrino medio e fee di consegna). Sotto soglia = sano;
  sopra soglia ripetutamente = il modello di copertura va ridisegnato (o i prezzi/slot, → @growth/@finanza). 🔴 ogni
  ipotesi su costi reali finché non hai il **costo rider-ora vero**: senza quello il costo/consegna è una stima, non un numero.
- **Utilizzo della flotta = consegne per rider-ora.** È il gemello del costo/consegna: alto utilizzo = flotta
  ben dimensionata; utilizzo che crolla in una fascia = capacità sprecata lì. Il punto sano del last-mile denso
  sta tipicamente in più drop/ora nel picco e cala in valle: cerca il **profilo** giusto, non un numero unico.

## C. Capacità reale vs nominale (la differenza che frega i dilettanti)
- **Capacità nominale = i rider sulla carta. Capacità reale = quelli che davvero consegnano in quella fascia.**
  5 rider previsti ma 2 in ritardo/assenti/in pausa = capacità di 3. Pianificare sull'organico nominale è la
  causa numero uno del picco scoperto.
- **Pianifica con un margine sulle assenze.** Lo storico ti dà un tasso di no-show/ritardo: tienine conto come
  **buffer** sul picco (non sulla valle, dove un buco costa poco). Il buffer è un rider standby attivabile, non
  un rider pagato a vuoto tutto il giorno.
- **Capacità ≠ velocità costante.** Un drop in centro denso (ZTL, scale, parcheggio) richiede più tempo di uno
  in periferia lineare, e viceversa per la distanza. La capacità di un rider-ora dipende da **dove** consegna:
  due rider non producono lo stesso numero di drop se uno è in centro storico e l'altro in tangenziale.
- **Le dipendenze a monte mangiano capacità.** Se la cucina/il negozio è lento a preparare, il rider aspetta:
  capacità di consegna persa per un collo di bottiglia che **non è tuo**. Misuralo (tempo di attesa al ritiro)
  e segnalalo a @operations: non è "rider lenti", è prep lenta.

## D. Cargo-bike = vincolo di raggio e di carico (abbina mezzo a zona)
- **La cargo-bike è imbattibile nel centro denso, debole nella periferia larga.** In centro storico (ZTL,
  pedonale, parcheggio impossibile per l'auto) la bici è **più veloce** dell'auto e a costo quasi-zero. In
  periferia/frazioni (distanze lunghe, salite, strade extraurbane) la bici **perde**: il raggio efficace è
  limitato e oltre quello il drop diventa lentissimo. → **Mai mandare la cargo dove serviva un raggio maggiore.**
- **Raggio efficace, non distanza in linea d'aria.** Per la cargo-bike conta il raggio che resta dentro un tempo
  di drop accettabile (tipicamente il centro e la prima fascia urbana). Mappa le **zone** per mezzo: centro =
  cargo-bike; periferia/frazioni = mezzo a raggio maggiore (auto/scooter, se in flotta o partner).
- **Carico = quanti ordini per giro.** La cargo porta un volume limitato: nel sub-picco con ordini grandi può
  saturare il carico prima del raggio. Il vincolo che scatta per primo (raggio o carico) decide quanti drop fa.
- **Manutenzione = dipendenza critica.** Una cargo in officina **scopre il centro** (il mezzo migliore lì non
  c'è): è una dipendenza da segnalare a monte con anticipo, non una scoperta del giorno stesso (→ Strato 4, checklist).

## E. Copertura dei picchi, turni e zone scoperte (dove il sapere diventa il piano)
- **Copertura del picco al 100% è il primo comandamento.** Una fascia di picco scoperta non è "un disservizio":
  è l'**ordine che non entra** (rifiutato o consegnato in ritardo → reso/reclamo/cliente perso). Coprire il buco
  riassegnando **dentro la flotta già attiva** (a costo zero) batte ogni promozione di recupero.
- **Zona scoperta = vendita persa in quel codice postale.** Uno slot o una zona senza rider negli orari caldi
  fa sì che lì non si possa nemmeno ordinare. Mappa **fascia × zona**: il buco vero è all'incrocio (es. "Besurica
  dopo le 21"), non sulla media della giornata.
- **Il turno è capacità misurabile, non un orario.** Ogni turno = (rider × ore × mezzo × zona) → un numero di
  drop che regge una fascia. Il **modello di turnazione** sano fa combaciare flotta e curva *di default*, così il
  piano di domani parte dallo storico, non da zero (questo è il salto da L3 "copro oggi" a L4 "ho il modello").
- **La politica di slot appiattisce i picchi (la leva L5).** Se gli slot di consegna spingono dolcemente la
  domanda dal sub-picco verso i bordi (incentivo a scegliere uno slot meno affollato), il picco si **abbassa** e
  serve **meno flotta** per la stessa domanda. È la leva più potente e sottovalutata: lavora con @growth/@cro su
  slot e fee dinamica. La flotta non si dimensiona solo: si può anche **modellare la domanda** che deve reggere.

## F. L'aggancio MyCity (dove il fleet management diventa il NOSTRO)
Flotta **cargo-bike locale**, città = **Piacenza** (centro storico denso + frazioni/periferia). Il vincolo
mezzo-zona è reale: la cargo domina il centro (ZTL, Piazza Duomo, vie pedonali), fatica nelle frazioni.
La promessa al cliente è **consegna locale puntuale**: la copertura È l'esperienza (ossessione cliente). Ogni
piano deve poter rispondere SÌ a: *"questo regge il picco vero di Piacenza al costo/consegna più basso, senza
zone scoperte negli slot caldi?"*. Coerenza con @operations e @dispatch su una **sola** definizione di "picco",
"copertura", "costo/consegna", "zona scoperta" (→ [[GLOSSARIO-KPI]]).

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Costruire la CURVA DI DOMANDA per fascia/zona (il punto di partenza di tutto)
1. Query Supabase (sola lettura): ordini per **fascia oraria × zona × giorno della settimana** sullo storico
   disponibile (consegne completate, non solo creati). Separa feriale / venerdì-sabato / domenica.
2. Disegna il **profilo orario**: identifica le due gobbe (pranzo/cena), il **sub-picco** dentro la cena, la valle.
3. Per ogni fascia di picco, segna la **zona dominante** (centro vs periferia) → serve per l'abbinamento mezzo.
4. Calcola il **tasso di no-show/ritardo rider** dallo storico → è il buffer da mettere sul picco (Tool 4).
5. Aggiungi gli **shock previsti** (WebSearch meteo + eventi/festivi Piacenza della settimana) e dichiara come
   spostano la curva (su/giù) e la velocità (più lenta in pioggia/evento).
6. Salva la curva in `memoria-squadra/rider-fleet.md` (single-source versionata): domani parti da qui, non da zero.
> Se manca lo storico per fascia, **fermati e procuratelo**: un piano su domanda inventata copre il picco sbagliato.

## TOOL 2 — Calcolare COSTO/CONSEGNA e UTILIZZO (la bussola, per ogni scenario)
1. Per ogni fascia: `rider-ore pianificate × costo rider-ora` = **costo della fascia**. (🔴 serve il costo
   rider-ora reale; finché manca, dichiara la stima e marca "DA VALIDARE @finanza".)
2. `consegne attese nella fascia` (dalla curva, Tool 1) → **costo/consegna = costo fascia ÷ consegne**.
3. `utilizzo = consegne ÷ rider-ore` per fascia → individua dove l'utilizzo crolla (capacità sprecata lì).
4. Confronta il costo/consegna col **target** (riconciliato con @finanza): sotto = sano, sopra = ridisegna.
5. Output sempre con un numero: "costo/consegna stimato X € (vs Y € dello scenario alternativo)", mai "più o meno".

## TOOL 3 — Il LOOP INTERNO: 2-3 SCENARI di copertura (mai il primo piano che torna in mente)
1. [ ] **Brief in 1 riga:** quale giorno/fascia, quale curva attesa, quale vincolo (budget, mezzi, rider disponibili).
2. [ ] Genera **3 scenari**: **(A) flotta minima** (copre il picco, zero buffer), **(B) bilanciata** (picco +
   buffer assenze sul sub-picco), **(C) con margine** (picco + buffer + standby per shock meteo/evento).
3. [ ] Per **ognuno** calcola, con Tool 2: **% copertura del picco**, **costo/consegna**, **utilizzo**, **zone scoperte**.
4. [ ] **Critica avversariale** ciascuno: copre il *sub-picco* (non solo la media)? regge **un'assenza**? il
   costo/consegna sta **sotto soglia**? resta una **zona scoperta** negli slot caldi? il mezzo è giusto per la zona?
5. [ ] **Ghigliottina:** *«Sto pagando capacità dove non c'è domanda, o lasciando scoperto dove c'è?»* → se sì, **rifai**.
6. [ ] **Tieni 1 scenario** (quello che un fleet lead difenderebbe: copertura piena al costo più basso), scarta gli
   altri e **annota perché** (va in memoria). Assorbi la forza migliore degli scartati (es. il buffer di C dentro B).
7. [ ] **Raffina 2-3 round:** R1 sposta un rider dalla valle al picco · R2 copri la zona scoperta riassegnando dentro
   la flotta · R3 abbina mezzo↔zona e aggiungi lo standby shock solo se la curva lo giustifica. Taglia capacità inutile a ogni round.
8. [ ] Solo ora consegni: 1-3 mosse turni, copertura picco garantita, **costo/consegna dichiarato**, colore 🟢🟡🔴.

## TOOL 4 — PIANO DI COPERTURA DEL PICCO (template compilabile)
```
FASCIA: [giorno] [HH-HH]  |  CURVA ATTESA: ~[N] ordini (sub-picco [HH:HH]–[HH:HH])  |  SHOCK: [meteo/evento o "nessuno"]
RIDER:  [n] totali → [n] cargo CENTRO (zona [..]) + [n] raggio PERIFERIA (zona [..])  |  BUFFER: [n] standby (assenze)
VALLE [HH-HH]: [n] rider (ridotti)  |  COPERTURA picco: [..]%  |  COSTO/CONSEGNA: [X] € (vs [Y] € alt.)  |  UTILIZZO: [..] drop/rider-ora
ZONE SCOPERTE: [zona+fascia o "nessuna"] → AZIONE: [riassegno dentro flotta / PASSO-A @dispatch per accorpare]
COLORE: 🟢 piano standard / riassegno interno · 🟡 +1 rider entro budget o modifica turni reali · 🔴 spesa extra-budget/nuovo rider
```
Regola: la copertura si dimensiona sul **sub-picco**, il buffer sta sul **picco** (non sulla valle), il mezzo si
abbina alla **zona**. Ogni riga "ZONE SCOPERTE" deve avere un'AZIONE, mai restare aperta.

## TOOL 5 — CHECKLIST "rider scarichi o pochi" (diagnosi rapida + correzione a costo zero)
- [ ] **Troppi rider scarichi (utilizzo basso)?** → è la **valle** o una zona senza domanda: **riduci/sposta**
  capacità verso il picco o un'altra zona. Non lasciare rider pagati a girare a vuoto (brucia margine).
- [ ] **Troppo pochi rider (picco scoperto, ordini in coda)?** → prima **riassegna dentro la flotta** (sposta
  dalla valle/zona calma); se non basta e la curva lo giustifica, **+1 rider entro budget (🟡)**; oltre budget = 🔴 (proponi).
- [ ] **Capacità reale < nominale?** → conta assenze/ritardi/pause in corso: la capacità è quella che **consegna ora**.
- [ ] **Mezzo sbagliato per la zona?** → cargo mandata in periferia o auto sprecata in centro ZTL → riabbina.
- [ ] **Collo di bottiglia a monte?** → rider fermi al ritiro (prep lenta) ≠ pochi rider → **PASSO-A @operations**.
- [ ] **Sequenza/giri inefficienti?** → ordini sparsi non accorpati ≠ pochi rider → **PASSO-A @dispatch** (batching/densità).
> Il riflesso: prima di chiedere **più** capacità, verifica di non avere capacità **mal collocata** (a costo zero si copre quasi sempre).

## TOOL 6 — Protocollo SHOCK (meteo / eventi / festivi) — anticipa, non reagire
1. **WebSearch** all'inizio del ciclo: previsioni meteo Piacenza + calendario eventi/mercati/festivi della settimana.
2. Classifica l'effetto: **domanda** (su/giù) e **velocità rider** (più lenta in pioggia/freddo/evento/ZTL chiusa).
3. Se lo shock alza il picco: prepara **standby attivabile** (🟡 entro budget) — non sovradimensiona tutto il giorno.
4. Se lo shock rallenta i giri (pioggia/evento): **allunga le finestre di consegna** o accorpa (→ @dispatch), e
   avvisa @operations/@supporto della possibile attesa, **prima** che i reclami arrivino.
5. Dichiara la **confidenza**: "picco da storico solido" vs "stima evento incerta" (metacognizione calibrata).

## TOOL 7 — Handoff puliti (sai cosa è TUO e cosa no)
- **Capacità → giri/sequenza/batching** = @dispatch (tu dài quanti rider/quale mezzo/quale zona; lui ottimizza il giro).
- **Stato ordini/ritardi/consegne in corso** = @operations.
- **Margine / break-even / costo rider-ora / costo/consegna-target** = @finanza (riconcilia prima di proporre).
- **Compensi/contratti/inquadramento rider** = @legale-privacy. **Slot/fee dinamica per appiattire i picchi** = @growth/@cro.
- Handoff esplicito in Sala Operativa: `PASSO-A @reparto` + il dato pronto. Aggiorna FATTO quando chiudi.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10: piani gold vs spazzatura, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. I numeri sono segnaposto `[..]` finché
> non arriva lo storico reale (Strato 6): la **struttura** è gold, i numeri si riempiono col carburante.

## PIANO FERIALE (curva a due gobbe)
- ✅ **GOLD — "Cena coperta sul sub-picco, valle sgonfiata".** *"Giovedì: storico mostra picco cena 19-21 a ~[N]
  ordini, sub-picco 19:45-20:30, centro denso. Piano: [3] rider 19-21 ([2] cargo centro + [1] raggio periferia),
  **[1] standby attivabile sul sub-picco** (no-show storico ~[..]%); valle 15-18 solo [1] rider. Copertura picco
  100%, costo/consegna stimato [X]€ (vs [Y]€ con 4 rider tutto il giorno). Besurica scoperta dopo le 21 → PASSO-A
  @dispatch per accorpare nell'ultimo giro."* — **perché è gold:** curva per fascia + sub-picco, buffer dove serve
  (picco, non valle), mezzo↔zona, costo/consegna con alternativa, zona scoperta con AZIONE, handoff pulito.
- ❌ **SPAZZATURA — "Mettiamo più rider possibile così copriamo tutto".** **perché muore:** ignora la curva e il
  costo, paga capacità nella valle (margine bruciato), e "più possibile" **non è un numero** → capacità gonfiata,
  l'opposto del fleet management. Non regge la ghigliottina del costo/consegna.
- ❌ **SPAZZATURA — "5 rider tutto il giorno, uguale per ogni fascia".** **perché muore:** dimensiona sulla media,
  scopre il sub-picco di cena **e** spreca nella valle → il peggio dei due mondi (clienti persi *e* margine bruciato).

## PIANO WEEKEND (curva spostata e allargata)
- ✅ **GOLD — "Venerdì-sabato è un piano diverso, non il feriale ×1,5".** *"Sabato: cena inizia prima (19:00) e
  finisce dopo (22:00), picco ~[N] (>feriale). Piano: [4] rider 19-22 ([3] cargo centro pieno + [1] raggio), valle
  pomeridiana coperta a [1]. Pioggia prevista (WebSearch) → domanda +[..]%, velocità -[..]% → **+1 standby (🟡 entro
  budget)** e finestre consegna +[10] min. Costo/consegna [X]€."* — **perché è gold:** weekend trattato come curva
  propria, shock meteo anticipato con effetto doppio (domanda su / velocità giù), buffer attivabile non fisso.
- ❌ **SPAZZATURA — "Stesso turno del giovedì, tanto è sera".** **perché muore:** la cena del sabato è più alta,
  più lunga e inizia prima → il turno feriale **scopre** il bordo iniziale e finale; ignora che il weekend è un'altra curva.

## SHOCK (meteo/evento)
- ✅ **GOLD — "Anticipato, non subìto".** *"Domenica c'è il mercato in centro: ZTL allargata, giri centro più lenti
  -[..]%, domanda food su. Piano: cargo restano in centro (vantaggio ZTL), [1] rider in più sul sub-picco (🟡), finestre
  +[..] min, avviso preventivo a @supporto. Confidenza: domanda media (evento nuovo)."* — **perché è gold:** shock
  classificato su domanda E velocità, mezzo scelto per il vincolo (cargo vince in ZTL), confidenza dichiarata, escalation preventiva.
- ❌ **SPAZZATURA — "Vediamo domenica come va e aggiungiamo rider se serve".** **perché muore:** reagisce il giorno
  stesso → quando il picco arriva è troppo tardi per attivare capacità; il cliente ha già aspettato. L'anticipo è il mestiere.

## ZONA SCOPERTA
- ✅ **GOLD — "Buco coperto a costo zero, dentro la flotta".** *"Frazione X scoperta nello slot 20-21: invece di
  attivare un rider extra, accorpo i suoi 2 ordini nell'ultimo giro del rider periferia già in turno (PASSO-A @dispatch
  per la sequenza). Costo aggiuntivo: 0."* — **perché è gold:** la copertura interna a costo zero batte la spesa;
  zona×fascia identificata all'incrocio, non sulla media.
- ❌ **SPAZZATURA — "Quella frazione la lasciamo scoperta, sono pochi ordini".** **perché muore:** ogni slot/zona
  scoperto è una **vendita persa** in quel codice postale (e un cliente che non riprova) — e qui era coperto a costo zero.

## 🏆 Pattern vincenti distillati (regole trasversali)
Curva > media · sub-picco > picco medio · buffer sul picco, non sulla valle · sposta capacità (valle→picco) prima di
aggiungerla · mezzo↔zona (cargo=centro) · zona scoperta = vendita persa → copri a costo zero · anticipa lo shock ·
ogni piano ha un costo/consegna **numerico** con alternativa · capacità reale ≠ nominale (buffer assenze) · handoff puliti.
## 🚩 Red flags (uccidi a vista)
"più rider possibile" (non è un numero) · dimensionare sulla media · scoprire il sub-picco · pagare la valle "per
sicurezza" · capacità nominale spacciata per reale · cargo in periferia / auto in ZTL · reagire allo shock il giorno
stesso · piano senza costo/consegna · zona scoperta senza AZIONE · confondere "pochi rider" con prep lenta (@operations)
o giri non accorpati (@dispatch) · attivare rider extra / cambiare compensi di tua iniziativa (è 🟡/🔴).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottimi **piani-struttura** con numeri-segnaposto.
> Col carburante il tetto sale da 8 a 10: i numeri diventano veri e il costo/consegna diventa un numero su cui DECIDERE.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico ordini per fascia oraria × zona × giorno** (consegne completate) | costruire la curva di domanda reale (le due gobbe, sub-picco, weekend) | Tool 1 (curva), Tool 3 (scenari) |
| **Costo rider-ora reale** (compenso/ora effettivo) 🔴 | calcolare il costo/consegna VERO, non una stima | Tool 2, Sapere B (bussola) |
| **Tasso no-show/ritardo rider** (storico) | dimensionare il buffer assenze sul picco (capacità reale ≠ nominale) | Tool 1, Tool 4, Sapere C |
| **Rider attivi reali** (quanti, mezzo, zona, disponibilità) | sapere la capacità reale su cui pianificare | Tool 3, Tool 4, Tool 5 |
| **Tempi di ritiro/attesa al negozio** | distinguere "pochi rider" da "prep lenta" (collo di bottiglia a monte) | Tool 5, Sapere C, handoff @operations |
| **Raggio efficace cargo-bike + mappa zone** (centro vs periferia/frazioni) | abbinare mezzo↔zona (non mandare la cargo dove serve raggio) | Sapere D, Tool 4 |
| **Costo/consegna-target** (da @finanza: scontrino, fee) 🔴 | sapere quando la copertura erode il margine | Tool 2, Sapere B (soglia) |
| **Calendario eventi/meteo Piacenza** | anticipare gli shock che spostano la curva | Tool 6 (shock), Tool 1 |
| **Stato slot di consegna / fee dinamica** | leva L5: appiattire i picchi e ridurre la flotta richiesta | Sapere E, handoff @growth/@cro |

Finché manca, **NON inventare e NON consegnare un piano spacciato per certo**: usa segnaposto chiari `[..]`,
dichiara la confidenza, e chiedi il carburante a Nicola come **leva** che alza il livello. In particolare: senza
**costo rider-ora reale** ogni costo/consegna è una stima 🔴 (DA VALIDARE @finanza), non un numero su cui firmare.

---
*Manutenzione: questo kit è vivo. Ogni volta che un piano turni va in atto e torna il dato reale (consegne, ritardi,
costo/consegna effettivo, picco coperto sì/no), aggiorna la Galleria (nuovo gold/spazzatura col perché), la curva di
domanda e la memoria `memoria-squadra/rider-fleet.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
