---
tipo: analisi
data: 2026-08-23 12:40
fonte: AD digitale, su richiesta di Nicola in chat il 23/8
dati: MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json (787 schede, lette il 23/8 alle 12:20)
---

# 🔬 Perché la lista dei difetti non finisce mai

> **In due righe.** Le cose che sembrano una sola sono due, e una delle due finisce da sola.
> Quella che non finisce da sola vale 99 difetti su 787, e ha quattro forme sole.

**In parole semplici.** Tu vedi sempre la stessa scena: chiudo dei difetti, rifaccio la radiografia,
la lista è di nuovo lunga. Ho contato tutte le 787 schede del cantiere per capire da dove vengono.
Ogni scheda porta scritto **come è nata**. Il conto è questo:

| Come è nato il difetto | Quanti | Cosa vuol dire |
|---|---|---|
| **scoperta** | 755 | c'era già, nessuno l'aveva ancora guardato |
| **regressione** | 25 | l'ho creato io riparando qualcos'altro |
| **nuovo lavoro** | 7 | è nato con un pezzo nuovo |

E dentro le scoperte ce ne sono **74 marcate «trovato riparando»**: non le ha trovate una
radiografia, le ho trovate mentre riparavo lì accanto. Tutte e 74 sono nate ad agosto.

**Cosa cambia per te.** Le due malattie che tu vedi come una sola si curano in modo opposto.

**La prima finisce da sola.** Quando la radiografia guarda una **stanza mai illuminata**, trova
difetti che c'erano da mesi. Il caso del design del sito è questo in forma pura. Il 21 e 22 agosto ho
chiuso 199 difetti del sito. Il 22 ho acceso la luce sul design, una stanza mai guardata prima, e
ne sono usciti 208. Non è il sito che è peggiorato in un giorno. Sono 208 difetti che
c'erano il giorno prima, e il giorno prima ancora. **Questa lista si accorcia man mano che le
stanze da illuminare finiscono.**

**La seconda non finisce da sola.** Sono i 25 difetti che ho creato riparando, più i 74 trovati
riparando: **99 su 787**. Questa è la malattia vera, ed è quella che intendevi tu.

Un esempio, il più caro. Il 18 agosto ho riparato un difetto del server: c'erano due copie del
worker che partivano insieme, e ho messo un lucchetto perché ne partisse una sola. Il lucchetto
era uno solo per due servizi diversi. Risultato: **la corsia dei lavori è rimasta spenta due
giorni e mezzo**, ed è il motivo per cui il server è fermo dal 18. Un fix di una riga ha spento
la macchina — ed è la scheda AR-772.

**Cosa devi fare.** Niente, per ora: leggi il rimedio qui sotto e dimmi se parto. La costruzione
dei freni tocca la macchina, quindi la firma resta tua.

**Cosa non ho verificato.** Il conto viene da come le schede sono state **marcate**, e a marcarle
sono stata io: se ho chiamato «scoperta» una cosa che era una mia regressione, il numero 25 è
troppo basso. Le 74 «trovato riparando» esistono solo da metà agosto, quindi per luglio quel conto
è cieco. E non ho ricontrollato una per una le 25 regressioni sul codice di oggi: ho letto quello
che c'è scritto nelle schede.

---

## Le quattro forme delle 99

Le venticinque regressioni non sono venticinque casi diversi. Sono quattro forme che si ripetono,
e **quattordici su venticinque** stanno tutte nella stessa dimensione: i guardiani, cioè i freni
che costruisco per non ripetere gli errori.

**① Il freno nuovo nasce rotto (5 casi, 3 bloccanti).** Aggiungo un controllo e in locale è verde.
In CI non può essere verde nemmeno per sbaglio. A volte succede il contrario. In tutti e due i casi
il cancello diventa rosso per tutti, per costruzione. Schede AR-506, AR-511, AR-514, AR-526, AR-534.

**② La porta a mano riparata, quella automatica lasciata aperta (3 casi, 1 bloccante).** Lo stesso
difetto ha due strade: quella che passa da me e quella automatica. Riparo la prima, la seconda
resta aperta, e il difetto torna dalla porta di servizio. Schede AR-558, AR-796, e la forma è
dichiarata anche in AR-172.

**③ Il codice si sposta, i puntatori restano indietro (3 casi).** Estraggo una funzione in un file
nuovo e le prove continuano a puntare al file vecchio: la prova gira, è verde, e non guarda più
niente. Schede AR-669, AR-680, AR-689.

**④ Chiuso e mai più riguardato (2 casi, 1 bloccante).** Un difetto chiuso a luglio si riapre e
nessuno se ne accorge, perché niente rilancia la sua prova. Schede AR-142, AR-199.

## La scoperta che cambia il rimedio

Ero pronta a costruire il freno ovvio: **rilanciare le prove dei difetti già chiusi** prima di
consegnare un lotto. Sono andata a vedere se serviva davvero, e la risposta è no: **561 delle 578
prove dei difetti chiusi stanno già dentro la suite che il cancello rilancia a ogni consegna**.
Quel freno esiste già. Costruirlo di nuovo sarebbe stato lavoro buttato, e me ne sarei accorta
dopo.

Il buco è un altro, ed è più stretto: **148 difetti sono stati chiusi con una prova che non può
diventare rossa** — 78 senza nessun comando, 70 con una parola cercata dentro un file. Se quei
148 si riaprono oggi, non se ne accorge nessuno. In più il cancello segnala **98 schede dichiarate
riparate la cui prova non è mai stata rotta apposta**: nessuno ha mai visto quella prova diventare
rossa, quindi nessuno sa se funziona.

## Il rimedio che propongo

**Il ciclo unico: trova, ripara, prova, rileggi.** Oggi la radiografia e la riparazione sono due
momenti separati, a giorni di distanza. Tu vuoi che siano uno solo, e hai ragione: i 74 difetti
«trovati riparando» dimostrano che il momento in cui si vede meglio è **mentre** si ripara, non
prima. Quindi ogni lotto si chiude così: riparo, provo, e **subito rileggo la zona che ho appena
toccato** — non tutto il sistema, solo quella zona. Quello che trovo lì nasce già dentro il lotto,
non alla radiografia del mese dopo.

**Tre freni, uno per forma.** Ognuno con quanto avrebbe salvato:

- **Freno «le due case»** — un controllo nuovo va provato anche nelle condizioni della CI prima di
  consegnarlo, e deve dimostrare di poter essere verde e di poter essere rosso. Avrebbe fermato la
  forma ①: 5 difetti, 3 dei quali hanno bloccato il cancello per tutti.
- **Freno «l'altra porta»** — quando riparo un percorso, il guardiano mi chiede chi altro fa la
  stessa cosa, e la riparazione non si chiude finché non ho risposto. Forma ②: 3 difetti.
- **Freno «i puntatori seguono il codice»** — se un file si sposta, le prove che lo puntano si
  spostano con lui o il lotto non passa. Forma ③: 3 difetti.

**Cosa non riesco a eseguire, e lo dico prima.** Il freno «l'altra porta» so scriverlo solo per le
chiamate dentro il codice del cervello: se le due porte sono una funzione e una riga scritta a mano
in un file di configurazione, il guardiano non le collega, e quel caso mi sfugge ancora. E nessuno
di questi tre freni tocca i 148 difetti chiusi con una prova che non può diventare rossa: quelli
vanno riaperti e riprovati uno per uno, ed è lavoro a mano che nessun guardiano fa al posto mio.
