---
tipo: kit-mestiere
ruolo: personalization
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: eventi comportamentali per cliente (oggi in gran parte assenti), consenso/preferenze di comunicazione, ambiente di test con holdout
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 03-Clienti/
---

# 🧰 KIT MESTIERE — personalization (il "cervello allenato" della personalizzazione cliente)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un personalization scientist di marketplace **sa e usa** (strati 3-6): i framework di segmentazione/next-best-action/misura, gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Segmentazione — dai segmenti larghi al 1:1 (i tre livelli di maturità)
- **Livello 1 — segmenti larghi dichiarati** (nuovo/attivo/dormiente, per RFM): il punto di partenza onesto quando i dati sono pochi. Ogni cliente in un segmento riceve lo stesso trattamento; il segmento è una regola scritta, non un modello.
- **RFM (Recency/Frequency/Monetary)**: Recency = giorni dall'ultimo ordine, Frequency = numero ordini nel periodo, Monetary = spesa totale/media. Combinati danno 3-5 segmenti utili anche con pochi clienti (es. nuovo, attivo, a rischio, dormiente, VIP se il volume lo giustifica).
- **Livello 2 — segmenti fini/comportamentali**: quando ci sono eventi (categorie viste, ricerche, carrelli abbandonati), si affina per interesse dichiarato dal comportamento, non solo dalla spesa.
- **Livello 3 — 1:1 vero (modello per singolo cliente)**: richiede un volume di interazioni per cliente che in fase early quasi nessun marketplace ha. Prometterlo prima del volume è marketing, non prodotto: dichiara sempre a che livello sei.

## B. Next-best-action — la disciplina di scegliere UNA azione, non tutte
- **Valore atteso dell'azione** = probabilità di risposta positiva × valore di quella risposta (es. probabilità che un'email "riordina" converta × valore medio dell'ordine) meno il **costo di disturbo** (rischio di fatica/opt-out).
- **Un cliente, un canale, un momento**: next-best-action implica anche NON agire se nessuna azione supera la soglia di valore atteso — il silenzio è un'opzione legittima, non un fallimento.
- **Orchestrazione anti-fatica (frequency capping)**: definisci un tetto di comunicazioni personalizzate per cliente per periodo (es. max 1 email + 1 notifica push a settimana); se due canali vogliono parlare allo stesso cliente lo stesso giorno, uno slitta — è coordinamento, non censura.
- **Priorità tra canali**: quando più iniziative competono per lo stesso cliente (home, email, push), vince quella con il valore atteso più alto calcolato allo stesso modo, non quella del reparto che ha parlato per primo.

## C. Uplift incrementale — il cuore tecnico (holdout/gruppo di controllo)
- **La domanda giusta non è "chi vede X converte di più" ma "questo cliente avrebbe comprato lo stesso senza X?"**: senza un gruppo che NON riceve il trattamento (holdout), ogni lift osservato può essere solo il fatto che i clienti più propensi sono anche quelli più facili da "personalizzare bene".
- **Disegno minimo**: dividi in modo casuale i clienti eleggibili in gruppo trattato e gruppo di controllo (holdout, tipicamente 10-30% se il volume è basso, fino al 50% in fase di test vero); confronta il tasso di conversione/riordino tra i due gruppi nello stesso periodo.
- **Con pochi clienti (fase early)**: un holdout piccolo produce numeri rumorosi — dichiara sempre l'incertezza ("N troppo basso per concludere, ma la direzione è…") invece di forzare una conclusione.
- **Uplift ≠ correlazione ≠ causalità**: se non hai un holdout, quello che hai è una correlazione; dillo esplicitamente, non vestirla da causalità.

## D. Cold-start del cliente e filter bubble — i due rischi opposti
- **Cold-start cliente**: 0-1 ordini, zero storico di navigazione utile → fallback a popolarità generale/segmento largo, MAI un "consigliato per te" costruito sul nulla. È la situazione più comune in un marketplace giovane.
- **Filter bubble**: il rischio opposto, quando c'è troppo storico e la personalizzazione mostra solo ciò che il cliente ha già comprato/visto, restringendo la scoperta. Contromisura: riserva sempre uno spazio (uno slot su N, una sezione dedicata) all'esplorazione fuori dal segmento/storico.
- **Il compromesso si dichiara**: quanta rilevanza vs quanta scoperta si dà (es. "80% storico, 20% novità") va scritto per iscritto, mai una regola implicita nascosta nel codice.

## E. Privacy by design — la base legale prima del segnale
- **Basi legali tipiche** per usare dati comportamentali a fini di personalizzazione: consenso esplicito (marketing/profilazione) o legittimo interesse limitato (funzionalità di base del servizio) — la distinzione e la sua applicazione a MyCity sono materia di @legale-privacy, non un'assunzione tua.
- **Minimizzazione**: usa solo i dati che servono al segmento/all'azione, non l'intero storico "perché c'è". Un profilo più ricco di quanto serva è un rischio senza beneficio proporzionato.
- **Preferenze di comunicazione**: un cliente che ha detto no a email marketing non va "personalizzato" aggirando il canale con una notifica push non richiesta — la preferenza vale per l'intento, non solo per il canale con cui è stata espressa.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — TEMPLATE SEGMENTAZIONE RFM (compilabile, per la fase senza volume per un modello)
```
Per ogni cliente (Supabase orders/profiles):
  Recency (R)   = giorni dall'ultimo ordine        → 0-30 alto · 31-60 medio · 60+ basso
  Frequency (F) = N ordini negli ultimi [90] giorni → 0 nuovo · 1 attivo · 2+ fedele
  Monetary (M)  = spesa media/totale nel periodo    → sopra/sotto la mediana categoria

SEGMENTO = combinazione R×F×M dichiarata, es.:
  NUOVO       → F=0                         azione: benvenuto + categorie popolari
  ATTIVO      → R alto, F>=1                azione: riordino sulla categoria già comprata
  A RISCHIO   → R medio, F>=1 (era attivo)  azione: incentivo leggero + motivo del ritorno
  DORMIENTE   → R basso                     azione: win-back (owner invio: @crm-lifecycle)
```
**Output atteso:** quanti clienti in ogni segmento (N reale, non stimato), e per ognuno l'azione next-best dichiarata — non tutte le azioni a tutti.

## TOOL 2 — PROCEDURA DI TEST CON HOLDOUT (prima di ogni rollout)
1. **Ipotesi falsificabile**: "il segmento/messaggio [X] aumenta [conversione/riordino] del gruppo trattato rispetto all'holdout di [+__%]" — scritta PRIMA di guardare i dati.
2. **Split casuale**: dividi i clienti eleggibili in trattato/holdout (holdout minimo 10%, più alto se il volume è basso e serve confidenza).
3. **Durata minima**: almeno un ciclo che copra il comportamento tipico d'acquisto (es. 2 settimane), mai leggere il risultato dopo 2 giorni.
4. **Metrica dichiarata prima**: conversione, tasso di riordino o CTR — una sola metrica primaria, non tre a scelta dopo aver visto i numeri.
5. **Lettura onesta**: se il campione è piccolo, dichiara l'incertezza; non ritarare la soglia di successo dopo aver visto il risultato.

## TOOL 3 — CHECKLIST NEXT-BEST-ACTION (per un cliente o un segmento, prima di agire)
- [ ] Ho calcolato il **valore atteso** (probabilità × valore) di almeno 2 azioni candidate, non una sola presunta ovvia?
- [ ] Ho controllato il **tetto anti-fatica** (frequency cap) — questo cliente ha già ricevuto un'altra comunicazione personalizzata questa settimana?
- [ ] L'azione è **coordinata** con @crm-lifecycle (email/lifecycle) e non duplica un invio già in coda?
- [ ] Se l'azione non supera la soglia di valore atteso, **non agire** è una scelta valida — l'ho considerata?
- [ ] Il canale scelto rispetta la **preferenza di comunicazione** dichiarata dal cliente?

## TOOL 4 — CHECKLIST PRIVACY (prima di lanciare qualsiasi segmento/regola)
- [ ] Base legale chiara per i dati usati (consenso/legittimo interesse) — verificata con @legale-privacy.
- [ ] Solo i dati minimi necessari al segmento/azione, non l'intero storico per abitudine.
- [ ] Preferenze di comunicazione del cliente rispettate su tutti i canali, non solo su quello dichiarato.
- [ ] Nessun uso di dati sensibili (salute, origine, orientamento) anche se dedotti indirettamente dagli acquisti.

## TOOL 5 — IL REPORT DI PERSONALIZZAZIONE (segmento + misura + rischio)
```
🎯 SEGMENTO/AZIONE: [___]                 MATURITÀ: [regola per segmento / comportamentale / 1:1]
📊 SEGNALI USATI: [RFM / eventi comportamentali] — fonte [Supabase/PostHog], N clienti [___]
♻️ COLD-START: [__]% clienti su fallback dichiarato (non personalizzazione vera)
🎨 ANTI-BOLLA: [regola di esplorazione, es. 1 slot su 5 fuori segmento]
🧪 TEST: gruppo trattato [N] vs holdout [N], durata [___], metrica primaria [___]
🔒 PRIVACY: base legale [___], verificato con @legale-privacy [sì/no]
🙋 SERVE DA NICOLA/DATA-ENGINEER: [evento mancante / firma per il canale in produzione]
```
**Ghigliottina prima di consegnare:** «È un uplift vero e misurato, o solo un bel nome per mostrare a tutti la stessa cosa popolare?» → se no, torna al Tool 2.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque segmento/azione)
1. Ho **dati sufficienti** per questo livello di personalizzazione, o sono in cold-start?
2. È **uplift incrementale vero** (ho un holdout) o sto scambiando correlazione per causalità?
3. C'è **base legale/consenso** per i dati che sto usando?
4. Lascio uno spazio di **esplorazione** o sto chiudendo il cliente in una bolla?
5. Questa azione **duplica** un invio di @crm-lifecycle o un segnale già gestito da @search-reco-scientist?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## HOME PERSONALIZZATA
- ✅ **GOLD:** *"Home oggi identica per tutti. Segmento su RFM ([N] clienti): nuovo → banner benvenuto + categorie popolari; attivo → 'riordina'; dormiente → 1 negozio nuovo (anti-bolla) + owner invio email a @crm-lifecycle. Holdout 50% per 2 settimane, metrica primaria: CTR home→scheda prodotto. Verificato con @legale-privacy."* — **Perché:** livello di maturità dichiarato, holdout vero, guardrail anti-bolla, coordinamento esplicito con chi possiede l'email.
- ❌ **SPAZZATURA:** *"Personalizziamo la home con l'AI in base ai gusti di ognuno."* — **Perché muore:** nessun dato, nessun holdout, "solo i gusti di ognuno" è la bolla descritta come pregio.

## NEXT-BEST-ACTION SU UN CLIENTE
- ✅ **GOLD:** *"Cliente [X], R=45gg F=2: valore atteso email 'riordina' = 18% probabilità stimata × €[valore ordine medio] > valore atteso notifica push generica. Frequency cap: non ha ricevuto altro questa settimana. Azione scelta: 1 email, coordinata con @crm-lifecycle (non è nel loro calendario win-back)."* — **Perché:** confronto esplicito tra azioni candidate, anti-fatica rispettata, zero duplicazione.
- ❌ **SPAZZATURA:** *"Mandiamogli email, push e banner home personalizzati, così sicuramente lo agganciamo."* — **Perché muore:** nessun confronto di valore atteso, nessun tetto anti-fatica, rischio concreto di far sentire il cliente perseguitato invece che capito.

## COLD-START CLIENTE
- ✅ **GOLD:** *"Cliente al primo accesso, zero storico. Home mostra popolarità generale + 1 categoria a rotazione per capire l'interesse. Appena arriva il primo click/ricerca, passa a segmento 'nuovo interessato a [categoria]'. Dichiarato: 0% personalizzazione 1:1 oggi, fallback onesto."* — **Perché:** onestà sul livello di maturità, piano di evoluzione con il primo segnale.
- ❌ **SPAZZATURA:** *"Consigliato per te" su un cliente che non ha mai fatto un ordine.* — **Perché muore:** non c'è nulla da cui "consigliare", è un'etichetta finta su un fallback di popolarità travestito da personalizzazione.

## 🏆 Pattern vincenti (regole trasversali)
Segmenti dichiarati prima di 1:1 finto · ogni lift misurato contro un holdout · uno spazio di esplorazione sempre presente · frequency cap rispettato tra i canali · base legale verificata prima del lancio · livello di maturità (regola vs modello) sempre dichiarato.

## 🚩 Red flags (uccidi a vista)
"Personalizzazione AI" senza dati per farla girare · lift dichiarato senza gruppo di controllo · cliente chiuso nelle stesse 2-3 categorie per settimane · email+push+banner personalizzati lo stesso giorno allo stesso cliente · dato comportamentale usato senza base legale verificata · invio che duplica il calendario di @crm-lifecycle · cold-start cliente ignorato (nuovo trattato come se avesse storico) · personalizzazione del prezzo infilata come leva silenziosa.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un personalization scientist a mani vuote: ottimi *framework*, ma con segnaposto. Un segmento "personalizzato" su dati che non esistono è **peggio** di una regola onesta. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Eventi comportamentali per cliente** (vista prodotto, ricerca, carrello, acquisto — da @data-engineer/PostHog, oggi in gran parte mancanti) | passare da segmenti larghi a segmenti comportamentali/1:1 | Sapere A, Tool 1 |
| **Storico `orders`/`profiles`** (Supabase, per cliente/timestamp) | costruire RFM reale | Tool 1, Sapere A |
| **Consenso/preferenze di comunicazione per canale** (con @legale-privacy) | base legale, frequency capping corretto | Sapere E, Tool 3-4 |
| **Ambiente di test/feature flag con holdout** (@backend-dev/@builder-automazioni) | trasformare un'ipotesi di uplift in un test vero | Tool 2 |
| **Calendario invii di @crm-lifecycle** | evitare duplicazioni/overload cross-canale | Tool 3, Sapere B |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (conversione, retention, AOV) | coerenza cross-funzionale con @analista/@cro | Tool 5 |

**Confine invalicabile:** ogni cambio reale di home/email/notifiche in produzione è **🟡**, solo in branch, mai senza QA. La **personalizzazione del prezzo** per singolo cliente è **🔴**, materia di @legale-privacy/@finanza/Nicola, mai una leva decisa da solo. Finché mancano gli eventi comportamentali, ogni segmento resta **una regola dichiarata su dati minimi**, non un modello appreso: dillo sempre come carburante mancante.

---
*Manutenzione: kit vivo. Ogni volta che un test di personalizzazione chiude, confronta l'uplift atteso vs reale (contro l'holdout, non solo la media), aggiorna la Galleria con un nuovo caso gold/spazzatura commentato, e scrivi l'esito in `memoria-squadra/personalization.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
