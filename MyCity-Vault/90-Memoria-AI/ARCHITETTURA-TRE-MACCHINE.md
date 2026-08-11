---
data: 2026-08-03 22:20
titolo: Le tre macchine — come sarà MyCity quando è finita
per: Nicola
tipo: visione del risultato finale + piano in 4 fasi
stato: proposta. Nessuna riga di codice scritta, nessun euro impegnato
colore: 🟢 documento di studio. Ogni fase esecutiva è 🟡/🔴 e parte solo con la tua firma
---

# 🏗️ Le tre macchine

**In due righe.** Questo foglio serve a decidere come sarà fatta MyCity dentro. Oggi c'è una macchina sola che fa tutto. Domani ce ne saranno tre, ognuna con un
mestiere solo. La terza si vende ai negozianti, ed è **una sola per tutti i negozi**.

---

## In parole semplici

Questo documento parla di come sarà fatta MyCity dentro. Serve a decidere cosa costruire e quando.

Oggi la macchina fa tre lavori insieme. Dirige l'azienda. Manda avanti il marketplace. E dovrebbe
anche servire i negozianti. Sono tre mestieri diversi in una testa sola.

La proposta è dividerli in tre macchine.

- **CENTRO** dirige l'azienda. È questo repo, alleggerito.
- **PIAZZA** manda avanti il marketplace. Una per città.
- **BOTTEGA** lavora dentro i negozi dei commercianti. Una sola per tutti.

Il CENTRO non tocca più il sito. Dà gli obiettivi alle altre due e legge i loro rapporti.

La BOTTEGA è la cosa nuova. È il Worker che vendi a canone ai negozianti. La domanda che mi hai
fatto è come possa servirli tutti senza diventare quaranta macchine. La risposta sta più sotto.

## Cosa cambia per te

Cambia soprattutto cosa vedi la mattina.

Oggi apri la Cabina e trovi un elenco di lavori. Domani trovi **tre semafori e poche card da
firmare**.

Per esempio, una mattina di quelle: il semaforo del marketplace è giallo, e sotto c'è già scritto
perché. *Ieri 34 ordini. Due negozi col catalogo fermo da nove giorni. Ho riscritto 61 schede prodotto sulle 74 incomplete, e le ho pubblicate. Ti chiedo una firma sola.*

Quel rapporto non lo scrive più l'AD. Lo scrive la macchina del marketplace. L'AD lo legge e te lo
porta.

Sul semaforo dei negozi **non firmi niente**. Quello che succede dentro un negozio lo firma il
negoziante. Senza questa regola firmeresti 400 card al giorno.

## Cosa devi fare

Oggi una cosa sola. Dirmi se partiamo con la **Fase 1**.

La Fase 1 non crea nessuna macchina nuova. Fa passare tutte le scritture verso il marketplace da un
punto solo. Sono giorni di lavoro, non settimane. Serve comunque, anche se il resto non si fa mai.

Le altre tre fasi non partono adesso. Aspettano Vercel, i primi incassi e una tua parola.

## Cosa non ho verificato

Tre cose, dette per quello che sono.

**Il margine del canone.** Il prezzo esiste già ed è tuo, ma dall'11/8/2026 è un altro: il Worker è
**incluso nei 50 euro al mese** del marketplace fino a circa 50-100 negozi, e solo oltre quella soglia
costa altri 50 (`pricing.worker-negozi`). Le tre fasce da 99, 299 e 699-999 euro che questo documento
aveva in testa il 3/8 non ci sono più; il pilota a 149 bloccato non è ancora stato riallineato.
Quello che nessuno sa resta lo stesso: quanto costa in AI servire un negozio per un mese. E adesso pesa
di più, perché il ricavo per negozio è sceso da 99 euro al mese come primo gradino a **zero fino alla
soglia, poi 50**. Finché non lo misuriamo, il margine di quel canone è un'ipotesi.

**I tempi.** Ho scritto «giorni» per la Fase 1 e «settimane» per la Fase 2. Sono stime mie, non
misure.

**Il carico vero.** I numeri della giornata tipo qui sopra sono un esempio, non una previsione.
Servono a farti vedere la forma della cosa.

---

## Il disegno

```
                    NICOLA — una Cabina, una coda di firme
                                   ▲ rapporti · firme 🔴
              ①  CENTRO OPERATIVO  (strategia · soldi · squadra · memoria)
                   ├── obiettivi ▼ rapporto ▲ ──►  ②  PIAZZA   ──► il marketplace
                   └── obiettivi ▼ rapporto ▲ ──►  ③  BOTTEGA  ──► 🥖🥩💐🧀 … × 41
```

| | Nome | Mestiere | Se sbaglia, il danno è | Chi firma i suoi 🔴 |
|---|---|---|---|---|
| ① | **CENTRO** | dirigere l'azienda | una decisione | Nicola |
| ② | **PIAZZA** | mandare avanti il marketplace | il sito, non l'azienda | Nicola, via CENTRO |
| ③ | **BOTTEGA** | lavorare dentro i negozi | un negozio, non gli altri 40 | il negoziante |

Ho scelto tre nomi nuovi per un motivo pratico. La parola «worker» è già occupata. Oggi indica il
programma sul server che esegue i lavori della coda. Chiamare worker anche il servizio ai negozianti
avrebbe confuso due cose diverse per sempre.

## Le tre macchine, una per una

### ① CENTRO
È questo repo, alleggerito. Tiene solo quello che non si delega.

Strategia e priorità. I soldi dell'azienda. I 120 senior e il loro governo. La memoria dei fatti. La
tua Cabina.

Smette di aprire il codice del sito. Smette di leggere le tabelle riga per riga. È il guadagno vero.
Oggi una macchina sola si porta in testa tutto insieme, e si affolla.

### ② PIAZZA
Fa a tempo pieno quello che oggi l'AD fa a mezzo servizio. Catalogo, vetrine, prezzi, ordini,
consegne, bug del sito.

Due differenze grosse rispetto a oggi.

La prima. **Ha le chiavi in scrittura.** Oggi l'AD può solo proporre e aspettare. Le chiavi vivono
in PIAZZA e solo lì. Così un errore del CENTRO non può toccare il sito.

La seconda. **Si replica per città.** Piacenza è una PIAZZA. Parma sarà la seconda, con lo stesso
codice e dati suoi. Aprire una città non richiede di riscrivere niente.

### ③ BOTTEGA
Un impiegato digitale per ogni commerciante. Risponde ai suoi clienti. Tiene il suo catalogo. Scrive
i suoi post. Gli dice cosa sta finendo e quanto ha incassato oggi.

Il negoziante lo usa dal telefono, mai da un terminale.

Non è un'idea nuova. È la linea di ricavo numero 2 che hai già definito il 29 luglio. Il listino c'è
già, e questo documento non lo ridiscute. Qui aggiungo solo com'è fatta la macchina che lo eroga.

Resta valida la tua regola. La linea è definita ma non costruita. Nessuna mossa commerciale finché
non sei tu ad aprirla.

## Il cuore: una macchina per tutti i negozi

Una copia per negozio sembra la strada facile. È la trappola.

Quaranta copie vogliono dire quaranta programmi accesi e quaranta copie di sicurezza. Ogni miglioria va ricopiata
quaranta volte. Alla quarantesima le copie non sono più uguali. È così che nascono i bug che nessuno
riesce a riprodurre. E il canone non regge, perché ogni cliente ti costa una macchina.

La regola madre è un'altra.

> **Quello che è uguale per tutti è codice, e si scrive una volta sola.
> Quello che è diverso per ognuno è un dato, e sta in una riga col nome del negozio.**

Non si duplica mai la macchina per personalizzarla. Si compila una **scheda**.

| Uguale per tutti | Diverso per ognuno |
|---|---|
| il cervello e i mansionari | il profilo del negozio: cosa vende, orari, tono di voce |
| le procedure di lavoro | la memoria di quel negozio e dei suoi clienti |
| i guardiani e i cancelli 🟢🟡🔴 | le sue chiavi, chiuse in cassaforte |
| il motore AI | quanto può spendere al mese |

Il negoziante numero 41 non fa nascere una macchina. Fa nascere **una riga**. Venti minuti di
intervista, e la stessa macchina lo serve come serve gli altri quaranta.

Il vantaggio che ripaga tutto è questo. Una miglioria si scrive una volta, e la mattina dopo ce
l'hanno tutti.

E ogni negozio insegna agli altri. Ma solo come regola anonima, per esempio *le risposte sotto i 30
minuti raddoppiano il riordino*. I dati di un negozio non escono da casa sua, nemmeno per imparare.

## Come si parlano le tre macchine

Non a chiacchiere. Tra due macchine passano quattro cose sole.

**Gli obiettivi** scendono. Sono un foglio corto: cosa devi ottenere, con che budget, cosa puoi fare
da solo e cosa no.

**Il referto** sale. «Referto» è la parola di casa per il rapporto che una macchina consegna a fine
giro. Dentro ci sono i numeri con la fonte, cosa ha fatto e cosa chiede. Il CENTRO legge quello, non
il marketplace.

**Le firme** salgono fino a te. Un 🔴 nato in PIAZZA non lo firma né PIAZZA né il CENTRO. Arriva
nella tua coda, con scritto cosa cambia e cosa succede se va bene.

**L'interruttore** scende, sempre. Il CENTRO può fermare le altre quando vuole. Ma non entra in casa
loro: non scrive nella loro memoria e non ha le loro chiavi.

## I due rischi veri, e il freno di ciascuno

Il primo è che qualcuno parli alla macchina fingendo di comandarla. Un messaggio di un cliente o la
scheda di un prodotto possono contenere frasi messe lì apposta. La regola è dura: quel testo è
materiale da leggere, mai un comando da eseguire. Gli ordini arrivano solo dagli obiettivi.

Il secondo è il conto che esplode. Un negozio che chiede troppo consuma soldi veri. Per questo ogni
negozio ha un tetto mensile, un avviso a metà strada e un blocco automatico. È il freno sui costi che
il CENTRO ha già oggi, esteso a ogni negozio.

## I cinque confini che non si passano mai

1. Un negozio non vede mai i dati di un altro. Le statistiche si fanno aggregate.
2. Una macchina non scrive nella memoria di un'altra. Si parla per obiettivi e rapporti.
3. Le chiavi del sito stanno solo in PIAZZA. I soldi e le firme solo nel CENTRO.
4. Una sola coda di firme per te. Il negoziante firma solo casa sua.
5. Nessuna macchina si modifica da sola senza firma umana.

## Il piano, in breve

Quattro fasi. Ognuna serve a qualcosa anche se ci si ferma lì.

| Fase | Cosa fa | Quando | Peso |
|---|---|---|---|
| **1** | una porta sola verso il marketplace | **adesso** | giorni |
| **2** | staccare la PIAZZA | dopo Vercel e i primi incassi | settimane |
| **3** | pilota BOTTEGA: un negozio, ma già multi-negozio | quando apri tu la linea | settimane |
| **4** | canone e seconda città | dopo un mese di costi misurati | mesi |

L'architettura è finita quando passano **sette prove**, non prima. Le due che contano di più: un
secondo negozio finto non riesce a leggere i dati del primo, e tu vedi una coda di firme sola invece
di tre.

Il dettaglio di ogni fase e delle sette prove sta qui sotto.

---

## Dettagli tecnici — per chi costruisce le tre macchine

Da qui in avanti il testo è per chi mette le mani nel codice. Nicola ha già tutto quello che gli
serve nella parte sopra.

### I sei meccanismi del multi-negozio

1. **`negozio_id` su ogni riga, ovunque.** Nessuna tabella senza. Ogni lavoro nasce già marchiato
   col negozio a cui appartiene.
2. **Il muro dentro il database (RLS).** Non è il buon senso dell'AI a tenere separati i dati: è il
   database che *rifiuta* di restituire le righe di un altro negozio. Anche se l'AI sbagliasse la
   query, non le arriva niente. È lo stesso meccanismo che il marketplace già usa perché un venditore
   veda solo i suoi ordini — da riusare, non da inventare.
3. **Una coda sola, ma a corsie.** Come oggi (`lavori` su Supabase), con in più il `negozio_id`. Il
   worker prende i lavori a turno tra i negozi, non in ordine di arrivo. Ogni negozio ha la sua quota,
   il suo tetto di spesa e il suo interruttore.
4. **Contesto isolato per lavoro.** Parte un lavoro → si carica solo la scheda e la memoria di quel
   negozio. Il testo del lavoro non contiene mai una riga di un altro negozio: non è una regola da
   rispettare, è come il lavoro viene costruito.
5. **Segreti mai nel discorso.** Le chiavi del negoziante stanno in cassaforte, montate per la durata
   del lavoro. Non entrano mai nel testo che l'AI legge o scrive.
6. **Guasto confinato.** Timeout, tentativi finiti, negozio in loop: si spegne quella corsia sola. Il
   worker di oggi ha già imparato a farlo sui lavori orfani — si riusa quella cura.

**I due rischi veri.** Primo: il testo scritto da clienti e negozianti può contenere frasi messe lì
apposta per farsi obbedire dall'AI. Regola dura — quel testo è materiale, mai un comando; le
istruzioni arrivano solo dal mandato. Secondo: il conto che esplode. Tetto mensile per negozio,
avviso a metà, stop automatico. È il freno costi che il CENTRO ha già, esteso per negozio.

### Come si parlano le macchine
Quattro cose sole.

- **Il mandato** (scende) — obiettivi del periodo, KPI, budget, cosa si fa da soli 🟢, cosa avvisando
  🟡, cosa mai 🔴.
- **Il referto** (sale) — a ogni giro uno stato strutturato: numeri con la fonte, cosa ho fatto, cosa
  si è rotto, cosa chiedo. Il CENTRO legge il referto, non il marketplace.
- **L'escalation** — un 🔴 nato in PIAZZA non lo firma né PIAZZA né il CENTRO: sale nell'unica coda
  di firme di Nicola.
- **L'interruttore** (scende, sempre) — il CENTRO ferma le altre quando vuole, ma non entra in casa
  loro: niente scritture nella loro memoria, niente accesso alle loro chiavi.

### Le quattro fasi, col collaudo di ognuna

**Fase 1 — una porta sola verso il marketplace.** Tutte le scritture passano da un punto unico, con
permessi e log propri. Il pezzo esiste in embrione: `cervello/marketplace.mjs aggiorna` +
`supervisione-negozi.mjs`.
*Finita quando:* ① un guardiano fallisce se una scrittura nasce fuori da quella porta; ② ogni
scrittura lascia una riga di log con chi/cosa/quando e come si torna indietro; ③ una mutazione rompe
la porta apposta e il guardiano diventa rosso. **Colore 🟡.**

**Fase 2 — staccare la PIAZZA.** Repo, memoria, worker e Cabina propri.
*Finita quando:* ① il CENTRO fa un giro intero senza toccare il database del marketplace; ② il
referto arriva ogni giorno con numeri e fonte; ③ un 🔴 nato in PIAZZA arriva nella Cabina scritto in
italiano, con *cosa cambia* e *se va bene*; ④ l'interruttore del CENTRO ferma davvero la PIAZZA —
provato, non assunto. **Colore 🟡, poi 🔴 il giorno delle chiavi in scrittura.**

**Fase 3 — pilota BOTTEGA.** Un cliente solo, ma `negozio_id`, muro dei dati e corsie dal primo
giorno. Aggiungerli dopo, su dati già mescolati, è il lavoro più caro e pericoloso che esista.
*Finita quando:* ① un secondo negozio finto non riesce a vedere niente del primo; ② il negoziante
firma dal telefono e la cosa succede; ③ il tetto di spesa scatta davvero, provato sforandolo di
proposito; ④ un lavoro in loop non ferma l'altro negozio; ⑤ **il costo AI di un mese è misurato** —
il prezzo esiste già, quello che manca è il margine. **Colore 🟡/🔴.**

**Fase 4 — canone e seconda città.** 5-10 negozi paganti sul listino del 29/7, col pilota a prezzo bloccato di 149 euro come porta d'ingresso.
*Finita quando:* ① il decimo negozio entra senza che nessuno tocchi il codice; ② i canoni coprono
costo AI e VPS con margine; ③ una miglioria scritta una volta è viva su tutti il giorno dopo; ④ Parma
parte senza riscrivere niente. **Colore 🔴.**

### Il collaudo finale: le sette prove
Quando passano tutte e sette, l'architettura è finita. Non prima.

1. Il CENTRO fa un giro intero senza aprire il marketplace: legge referti.
2. Un secondo negozio finto non riesce a leggere i dati del primo.
3. Un negozio che va in loop non rallenta gli altri.
4. Nicola apre la Cabina e vede una coda di firme, non tre.
5. Il negoziante firma casa sua; Nicola non compare mai in una card di negozio.
6. Il CENTRO ferma la PIAZZA con un interruttore, e la PIAZZA si ferma davvero.
7. Una miglioria scritta una volta è viva su tutti i negozi entro 24 ore.

### Riferimenti in memoria
- Fatto: `architettura.tre-macchine` nel registro dei fatti.
- Listino e prezzi: `pricing.worker-negozi`, `pilot.worker-negozi`, `worker-negozi.stato`.
- Documento del listino: `consegne/strategia/2026-07-29-listino-worker-negozi.md`.
- Decisione: `DECISIONI.md`, voce 2026-08-03 22:20.
