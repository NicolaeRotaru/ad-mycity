---
data: 2026-08-03 22:20
titolo: Le tre macchine — come sarà MyCity quando è finita
per: Nicola
tipo: visione del risultato finale + piano in 4 fasi
stato: proposta — nessuna riga di codice scritta, nessun euro impegnato
colore: 🟢 (documento di studio) — ogni fase esecutiva è 🟡/🔴 e parte solo con la firma di Nicola
---

# 🏗️ Le tre macchine

> **La frase da ricordare:** oggi c'è **una macchina che fa tutto**. Domani ce ne saranno
> **tre, ognuna con un mestiere solo**: una che dirige l'azienda, una che manda avanti il
> marketplace, una che lavora dentro i negozi dei commercianti — e quest'ultima **è una
> sola per tutti i negozi**, non una per ciascuno.

---

## Parte 1 — Come si vede il risultato finale

### Una giornata, quando sarà finita

**Ore 7:00.** Nicola apre la Cabina sul telefono. Non trova un elenco di lavori: trova
**tre semafori**, uno per macchina, e sotto **quattro card da firmare** — non quaranta.

**Ore 7:04.** Il semaforo del **marketplace** è giallo. Non deve indagare: sotto c'è
scritto perché, con i numeri e la fonte. *«Ieri 34 ordini (+6). Due negozi hanno il
catalogo fermo da 9 giorni. Ho riscritto 61 schede prodotto e le ho pubblicate (🟡 —
già fatto, reversibile). Ti chiedo una firma sola: alzare la soglia della spedizione
gratis da 25 a 29 € per due settimane, su 3 negozi. Se va bene, il margine per ordine
sale di ~0,80 €; se va male, torno indietro in un click.»* Questo referto **non l'ha
scritto l'AD**: l'ha scritto la macchina che manda avanti il marketplace. L'AD l'ha
letto, ci ha messo la faccia e l'ha portato a Nicola.

**Ore 7:06.** Il semaforo del **servizio ai negozi** è verde. *«41 negozi serviti.
Ieri: 388 risposte ai clienti, 112 prezzi aggiornati, 63 post pubblicati, 9 avvisi
"sta finendo". Costo AI: 214 €. Incasso canoni: 1.230 €. Un negozio ha sforato il suo
tetto ed è in pausa — l'ho avvisato, decide lui se alzarlo.»* Nicola qui **non firma
niente**: quello che succede dentro un negozio lo firma il negoziante.

**Ore 7:10 — chiude il telefono.** L'azienda ha lavorato tutta la notte in tre posti
diversi. A lui sono arrivate quattro decisioni, non quattromila fatti.

### Il disegno

```
                       NICOLA
              una Cabina · una coda di firme
                          ▲
             referti ogni giorno │ richieste di firma 🔴
                          │
        ╔═════════════════╧═════════════════════════════╗
        ║  ①  CENTRO OPERATIVO — l'AD dell'AZIENDA      ║
        ║  strategia · soldi · squadra · memoria unica  ║
        ║  NON tocca il sito · NON parla coi clienti    ║
        ╚════════╤════════════════════════════╤═════════╝
        mandato ▼│▲ referto          mandato ▼│▲ referto
    ╔════════════╧═══════════╗   ╔════════════╧══════════════════╗
    ║  ②  PIAZZA             ║   ║  ③  BOTTEGA                   ║
    ║  manda avanti IL       ║   ║  il SERVIZIO ai negozianti    ║
    ║  MARKETPLACE           ║   ║  UNA macchina · N negozi      ║
    ║  una per città         ║   ║  ogni negoziante firma casa   ║
    ╚════════════╤═══════════╝   ╚════════════╤══════════════════╝
       chiavi in │scrittura        per conto  │del singolo negozio
                 ▼                            ▼
        mycity-marketplace.com      🥖 🥩 💐 🧀 … × 41
```

### Chi è chi, in una riga

| | Nome | Il suo mestiere | Se sbaglia, il danno è | Chi firma i suoi 🔴 |
|---|---|---|---|---|
| ① | **CENTRO** | dirigere l'azienda | una decisione sbagliata | Nicola |
| ② | **PIAZZA** | mandare avanti il marketplace | il sito, non l'azienda | Nicola (via CENTRO) |
| ③ | **BOTTEGA** | lavorare dentro i negozi | un negozio, non gli altri 40 | **il negoziante** |

*(Perché tre nomi nuovi: «worker» oggi significa già un'altra cosa — il processo che
gira sul VPS e svuota la coda `lavori`. Se chiamiamo worker anche il servizio ai
negozianti, tra un mese non ci capiamo più. CENTRO, PIAZZA, BOTTEGA sono il vocabolario.)*

---

## Parte 2 — Le tre macchine, una per una

### ① CENTRO — quello che resta qui
È questo repo, **alleggerito**. Tiene solo ciò che non si delega:
- strategia e priorità (dove giocare, dove no);
- i soldi dell'azienda: margini, cassa, budget, banche, bandi;
- i 120 senior e il loro governo (mansionari, guardiani, apprendimento);
- **la memoria unica dei fatti** e la Cabina di Nicola;
- il **mandato** che dà alle altre due, e il giudizio sui loro referti.

Cosa **smette** di fare: aprire il codice del sito, leggere le tabelle riga per riga,
rispondere ai clienti di un negozio. È il guadagno vero — oggi una macchina sola si
porta in testa tutto insieme e si affolla.

### ② PIAZZA — la macchina del marketplace
Fa a tempo pieno quello che oggi l'AD fa a mezzo servizio: catalogo, vetrine, prezzi
dentro l'intervallo deciso, ordini e consegne, bug del sito, anteprime, salute della
piattaforma. Due differenze grosse rispetto a oggi:

1. **Ha le chiavi in scrittura.** Oggi l'AD è cieco in scrittura: può solo proporre e
   aspettare. La PIAZZA scrive davvero. E le chiavi vivono lì e **solo** lì — il CENTRO
   non le possiede, così un errore del CENTRO non può toccare il sito.
2. **Si replica per città.** Piacenza è una PIAZZA. Parma sarà una seconda PIAZZA:
   stesso codice, dati e memoria propri, stesso mandato. Aprire una città non richiede
   di riscrivere niente.

### ③ BOTTEGA — il servizio venduto ai negozianti
Un impiegato digitale per ogni commerciante: risponde ai suoi clienti, tiene il suo
catalogo, scrive i suoi post, gli dice cosa sta finendo e quanto ha incassato oggi.
Lui lo usa dal telefono o da WhatsApp, **mai da un terminale**.

> 🔗 **Non è un'idea nuova: è la linea di ricavo #2 che Nicola ha già definito il 29/7.**
> Il *cosa si vende* e a *quanto* esiste già — tre piani **99 / 299 / 699-999 €/mese**
> più un pilot founder a **149 €/mese bloccato** (fatti `pricing.worker-negozi` e
> `pilot.worker-negozi`; dettaglio in
> `consegne/strategia/2026-07-29-listino-worker-negozi.md`). Questo documento non
> ridiscute il listino: aggiunge **come è fatta la macchina** che lo eroga. E resta
> valido `worker-negozi.stato`: linea **definita ma non costruita**, nessuna mossa
> commerciale finché non è Nicola ad aprirla.

---

## Parte 3 — Il cuore: **una** macchina per **tutti** i negozi

### Perché NON una per negozio
Una copia a testa sembra la strada facile ed è la trappola:
- **costo** — 40 processi accesi, 40 database, 40 backup, 40 log da guardare;
- **manutenzione** — ogni miglioria da ricopiare 40 volte; e alla quarantesima le copie
  non sono più uguali: è così che nascono i bug che nessuno riesce a riprodurre;
- **guasti** — 40 macchine sono 40 cose che si rompono in 40 modi diversi;
- **prezzo** — se ogni cliente ti costa una macchina, il canone non regge.

### La regola madre
> **Quello che è UGUALE per tutti è codice, e si scrive una volta sola.
> Quello che è DIVERSO per ognuno è un DATO, e sta in una riga col nome del negozio.**

Non si duplica **mai** la macchina per personalizzarla: si compila una **scheda**.

| Uguale per tutti (una copia sola) | Diverso per ognuno (una scheda + uno spazio suo) |
|---|---|
| cervello e mansionari degli agenti | **profilo**: chi è, cosa vende, orari, tono, cosa non dire mai |
| le procedure (rispondi, aggiorna, pubblica) | **memoria**: cosa ha imparato su quel negozio e sui suoi clienti |
| guardiani, cancelli 🟢🟡🔴, registro azioni | **chiavi**: i suoi account, in cassaforte cifrata |
| il motore AI e il routing dei costi | **permessi**: cosa quel commerciante gli lascia fare da solo |
| | **budget**: quanto può consumare al mese |

### I sei meccanismi che lo rendono possibile
1. **`negozio_id` su ogni riga, ovunque.** Nessuna tabella senza. Ogni lavoro nasce già
   marchiato col negozio a cui appartiene.
2. **Il muro dentro il database (RLS).** Non è il buon senso dell'AI a tenere separati i
   dati: è il **database che rifiuta** di restituire le righe di un altro negozio. Anche
   se l'AI sbagliasse la domanda, non le arriva niente. È lo stesso meccanismo che il
   marketplace già usa perché un venditore veda solo i suoi ordini: **da riusare, non da
   inventare.**
3. **Una coda sola, ma a corsie.** Come oggi (`lavori` su Supabase), con in più il
   `negozio_id`. Il worker prende i lavori **a turno tra i negozi**, non in ordine di
   arrivo: un negozio che ne accoda 200 non lascia gli altri 40 ad aspettare. Ognuno ha
   la sua quota e il suo interruttore.
4. **Contesto isolato per lavoro.** Parte un lavoro → si carica **solo** la scheda e la
   memoria di quel negozio. Il testo del lavoro non contiene mai una riga di un altro
   negozio: non è una regola da rispettare, è **come il lavoro viene costruito**.
5. **Segreti mai nel discorso.** Le chiavi del negoziante stanno in cassaforte, vengono
   montate per la durata del lavoro e non entrano mai nel testo che l'AI legge o scrive.
6. **Il guasto resta dentro una casa.** Timeout, tentativi finiti, negozio che va in
   loop: si spegne **quella** corsia, gli altri 40 non se ne accorgono. Il worker di oggi
   ha già imparato a farlo sui lavori orfani — si riusa quella cura.

### Il negoziante numero 41 non fa nascere una macchina: fa nascere una riga
Venti minuti di intervista (è già il mestiere del senior `onboarding-negozi`), si apre
il suo spazio di memoria e la sua cassaforte, si sceglie cosa può fare da solo. Da quel
momento la stessa macchina lo serve come serve gli altri quaranta.

### Il vantaggio che ripaga tutto
Una miglioria si scrive **una volta** e la mattina dopo **ce l'hanno tutti**. E ogni
negozio insegna agli altri — ma solo come **regola anonima** (*«rispondere sotto i 30
minuti raddoppia il riordino»*), mai come dato: **i dati di un negozio non escono da
casa sua nemmeno per imparare.**

### I due rischi veri, e il freno di ciascuno
- **Il testo dei clienti non è un ordine.** Messaggi, recensioni e schede possono
  contenere frasi messe lì apposta per farsi obbedire dall'AI. Regola dura: quel testo è
  **materiale**, mai un comando. Gli ordini arrivano solo dal mandato.
- **Il conto che esplode.** Un negozio che chiede troppo consuma soldi veri: tetto
  mensile per negozio, avviso a metà, **stop automatico**. È il freno costi che il CENTRO
  ha già, esteso per negozio.

---

## Parte 4 — Come si parlano le macchine

Non a chiacchiere. Il rapporto tra due macchine è fatto di **quattro cose sole**:

1. **Il mandato** (scende) — obiettivi del periodo, KPI di cui rispondi, budget, cosa
   fai da sola 🟢, cosa fai avvisando 🟡, cosa non tocchi mai 🔴.
2. **Il referto** (sale) — a ogni giro uno stato **strutturato**: numeri con la fonte,
   cosa ho fatto, cosa si è rotto, cosa chiedo. **Il CENTRO legge il referto, non il
   marketplace.**
3. **L'escalation** (sale e si ferma da Nicola) — un 🔴 nato in PIAZZA non lo firma la
   PIAZZA né il CENTRO: sale nell'**unica** coda di firme, con scritto chi lo chiede,
   cosa cambia, cosa succede se va bene.
4. **L'interruttore** (scende, sempre) — il CENTRO può fermare le altre quando vuole, ma
   **non entra in casa loro**: non scrive nella loro memoria e non ha le loro chiavi.
   *Chi comanda non esegue, chi esegue non firma.*

Con la BOTTEGA vale lo stesso schema con **una differenza sostanziale**: il capo
operativo di ogni negozio è il **negoziante**, non Nicola. Il CENTRO governa il
*servizio* (prezzo, qualità, cosa è vietato ovunque); il negoziante governa *casa sua*.
Altrimenti Nicola finirebbe a firmare 400 card al giorno e il sistema morirebbe lì.

---

## Parte 5 — I cinque confini che non si passano mai
1. Un negozio non vede **mai** i dati di un altro. Le statistiche si fanno aggregate.
2. Una macchina **non scrive** nella memoria di un'altra: si parla per mandati e referti.
3. Le chiavi di scrittura sul marketplace stanno **solo** in PIAZZA. I soldi e le firme
   dell'azienda stanno **solo** nel CENTRO.
4. **Una sola coda di firme** per Nicola. Il negoziante firma solo il suo negozio.
5. Nessuna macchina **modifica se stessa** senza firma umana. Vale già oggi; con tre
   macchine vale di più.

---

## Parte 6 — Il piano: quattro fasi, e come si vede che una è finita

> Regola del piano: **ogni fase serve a qualcosa anche se ci si ferma lì.** Nessuna fase
> è «infrastruttura che servirà poi».

### Fase 1 — Una porta sola verso il marketplace  ·  *nessuna macchina nuova*
**Cosa si costruisce.** Tutte le scritture verso il marketplace passano da **un punto
solo**, con permessi propri e log proprio. Il pezzo esiste già in embrione
(`cervello/marketplace.mjs aggiorna` + `supervisione-negozi.mjs`): va reso l'unica strada.

**Come si vede che è finita:** ① un guardiano fallisce se una scrittura verso il
marketplace nasce **fuori** da quella porta; ② ogni scrittura lascia una riga di log con
chi, cosa, quando, e come si torna indietro; ③ una prova di mutazione: si rompe la porta
apposta e il guardiano deve diventare rosso.

**Guadagno anche fermandosi qui:** un solo punto da sorvegliare invece di molti.
**Peso:** giorni, non settimane. **Colore:** 🟡.

### Fase 2 — Staccare la PIAZZA
**Cosa si costruisce.** Repo suo, memoria sua, worker suo, Cabina sua. Il CENTRO smette
di leggere le tabelle del marketplace e comincia a leggere **il referto**.

**Come si vede che è finita:** ① il CENTRO fa un giro intero **senza mai toccare** il
database del marketplace; ② la PIAZZA consegna il referto ogni giorno, con numeri e
fonte; ③ un 🔴 nato in PIAZZA arriva nella Cabina di Nicola scritto in italiano, con
*cosa cambia* e *se va bene*; ④ l'interruttore del CENTRO ferma davvero la PIAZZA (si
prova, non si assume).

**Quando:** dopo la migrazione a Vercel e con abbastanza vita sul marketplace da
giustificare una macchina a tempo pieno. **Peso:** settimane. **Colore:** 🟡 (🔴 il giorno
in cui riceve le chiavi in scrittura).

### Fase 3 — BOTTEGA pilota: **un** negozio, ma già multi-negozio
**Cosa si costruisce.** Il servizio vero, con un solo cliente. `negozio_id`, muro nel
database e corsie si mettono **dal primo giorno**, anche col cliente numero uno.
*Aggiungerli dopo, su dati già mescolati, è il lavoro più caro e più pericoloso che esista.*

**Come si vede che è finita:** ① si crea un **secondo negozio finto** e si prova che non
riesce a vedere niente del primo — provato, non dichiarato; ② il negoziante firma dal
telefono e la cosa succede; ③ il tetto di spesa scatta davvero (si prova sforandolo di
proposito); ④ un lavoro che va in loop non ferma l'altro negozio; ⑤ **il costo AI di un
mese di quel negozio è misurato** — il prezzo esiste già (99/299/699-999 €/mese), quello
che manca è sapere **quanto margine lascia**.

**Quando:** quando è **Nicola ad aprire la linea** (`worker-negozi.stato`) e c'è un
commerciante che il servizio lo chiede. **Colore:** 🟡/🔴.

### Fase 4 — Il servizio a canone, e la seconda città
**Cosa si costruisce.** 5-10 negozi paganti sul listino **già definito il 29/7** (con il
pilot founder a 149 €/mese bloccato come porta d'ingresso), contratto e firma del
negoziante. Poi la seconda città = **una seconda PIAZZA**, stesso codice.

**Come si vede che è finita:** ① il decimo negozio entra senza che nessuno tocchi il
codice; ② i canoni coprono il costo AI **e** il costo del VPS con margine; ③ una miglioria
scritta una volta compare su tutti i negozi il giorno dopo; ④ Parma parte senza riscrivere
niente. **Colore:** 🔴 (soldi veri, contratti).

---

## Parte 7 — Il collaudo finale: le sette prove
Quando **tutte e sette** passano, l'architettura è finita. Non prima.

1. Il CENTRO fa un giro intero senza aprire il marketplace: legge referti.
2. Un secondo negozio finto **non riesce** a leggere i dati del primo.
3. Un negozio che va in loop non rallenta gli altri.
4. Nicola apre la Cabina e vede **una** coda di firme, non tre.
5. Il negoziante firma casa sua; Nicola non è mai coinvolto in una card di negozio.
6. Il CENTRO ferma la PIAZZA con un interruttore — e la PIAZZA si ferma davvero.
7. Una miglioria scritta una volta è viva su tutti i negozi entro 24 ore.

---

## Parte 8 — Cosa resta umano
Le trattative vere coi commercianti, la fiducia, la responsabilità legale, il prezzo del
servizio, le scommesse di visione. Le tre macchine **preparano**; Nicola decide.

---

## Parte 9 — Quando farlo davvero (e perché non oggi)
Questa è la forma giusta per MyCity **a 40 negozi e 2 città**. Oggi c'è **un negozio
reale** (Pane Quotidiano) e il **sito è fermo dal 30/7** in attesa della migrazione a
Vercel: costruire tutto adesso sarebbe lavoro pesante su un'ipotesi — ed è esattamente
l'errore che il cancello di allocazione della macchina esiste per impedire.

**Raccomandazione dell'AD:**
- **Fase 1 adesso** — costa poco, serve comunque, e non dipende da quante botteghe ci sono;
- **Fase 2 dopo Vercel** e i primi negozi che incassano;
- **Fase 3 quando sei tu ad aprire la linea** — vale ancora la tua regola del 29/7:
  nessuna mossa commerciale sul Worker ai negozi finché non la apri;
- **Fase 4 quando la Fase 3 ha un mese di costi misurati.**

## Parte 10 — Le tre decisioni che restano a Nicola
1. **Partiamo con la Fase 1?** È l'unica che ha senso oggi: giorni di lavoro, serve
   comunque, e non dipende da quante botteghe ci sono.
2. **Il margine del canone BOTTEGA.** Il prezzo c'è già ed è tuo (99/299/699-999 + pilot
   a 149). Quello che **nessuno sa ancora** è quanto costa in AI servire un negozio per
   un mese: finché non lo misuriamo sul pilota, il margine di quel listino è un'ipotesi.
   Non è una domanda da rispondere ora — è la prima cosa che la Fase 3 deve produrre.
3. **Quanto può fare la BOTTEGA da sola in casa di un negoziante** — è la scelta che
   decide se il servizio è utile o è un giocattolo da approvare tutto a mano.
