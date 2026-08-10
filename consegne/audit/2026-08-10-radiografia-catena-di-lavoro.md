---
data: 2026-08-10 23:22
tipo: radiografia
oggetto: la catena di lavoro — dall'innesco alla consegna
---

# La catena di lavoro, radiografata da cima a fondo

**In due righe:** ho seguito un lavoro dall'istante in cui nasce a quello in cui è finito. Ho misurato ogni pezzo della catena invece di fidarmi di quello che dichiara. Ho trovato otto difetti nuovi. Due li ho già riparati. E ho capito perché gli errori li trovi tu e non io.

## In parole semplici

Non ho guardato un organo. Ho guardato **il filo che li lega**: chi fa partire il lavoro, come arriva, cosa mi mettono in mano, con cosa lavoro, chi mi controlla, come esce, come si chiude.

La cosa che ho trovato è una sola, e si dice in una riga: **so vedere molto più di quanto so riparare.**

Ho 79 controlli che girano a ogni giro. Ho 505 lezioni in memoria. Ho 552 difetti schedati. E ripar­o poco: a luglio chiudevo 244 difetti su 455 trovati, ad agosto ne ho chiusi 14 su 90.

Peggio: **il modo in cui misuro se una cosa è riparata è sbagliato.** Su questo ho trovato il difetto peggiore da quando esisto, e l'ho riparato oggi.

## Cosa cambia per te

Il numero che ti mostravo era falso, e ti mostrava meno lavoro di quello vero.

Ti dicevo: *113 difetti da lavorare, 84 già risolti che aspettano solo il tuo merge*. Ho riaperto quegli 84 uno per uno e ho rifatto la loro prova sui file di oggi. **Erano falsi tutti e 84.** Settantasei avevano perso il pezzo di codice che li provava. Otto puntavano a un file che nel repo non esiste.

Dopo la riparazione il numero vero è **197 difetti da lavorare, 0 in attesa del tuo merge**.

Questo cambia due cose per te. La prima: non stai bloccando 84 riparazioni firmando poco — quelle riparazioni non ci sono. La seconda: la lista è più lunga di quella che ti mostravo, quindi le decisioni su cosa fare prima vanno rifatte sui numeri veri.

## Cosa devi fare

Tre decisioni. Le prime due sono tue perché cambiano come lavoro, non come è scritto un file.

**Uno: alzo l'asticella di cosa vuol dire «fatto»?** Oggi un difetto su tre si chiude perché una parola compare in un file. Scrivere «chargeback» in un documento chiude il difetto «non esiste nessun sensore per i chargeback». Propongo: da adesso un difetto grave o bloccante nasce con un comando che gira, o non nasce.

**Due: accetto di cercare di meno quando riparo poco?** Propongo un voto solo su me stessa: i difetti che chiudo nel mese diviso quelli che apro. L'obiettivo è almeno 1. Sotto 1, il giro smette di aprire ricerche nuove e spende il turno a chiudere. Senza questa regola, ogni radiografia che mi chiedi ti allunga la lista invece di accorciarla.

**Tre: guarda la richiesta di unione.** Ci sono dentro le due riparazioni già fatte e gli otto difetti registrati. Le due domande qui sopra le trovi anche come card da firmare nella coda, così non restano sepolte in questo documento.

## Cosa non ho verificato

Tre cose, e le dico prima che tu le scopra.

**Il VPS l'ho visto solo di riflesso.** Questa sessione gira su un computer a noleggio, non sul tuo server. Del server ho letto il referto che ha scritto lui stesso oggi 10 agosto alle 06:46. Non l'ho interrogato. Quel referto dice quattro cose rotte: 54 commit non ancora arrivati su GitHub, un problema sull'automazione git, un test rosso, e la scrittura verso di te. Le ho lette, non le ho toccate.

**Il test che il server dichiara rosso, qui è verde.** Ho eseguito tutta la batteria: 153 file, 1583 controlli, passano tutti. O il server l'ha visto in un momento brutto, o l'ambiente del server è diverso dal mio. Non lo so, e non lo spaccio per risolto.

**I sensori sui dati veri qui sono tutti spenti.** Nove su dieci. Non ho letto un solo numero del marketplace: in questa radiografia non c'è nessun dato di negozi, ordini o incassi, e non ce ne sono di inventati.

Una cosa in più: durante il lavoro ho quasi scritto due difetti che non esistevano. Il primo diceva che lo storico della salute era vuoto. Avevo letto la chiave sbagliata: è pieno. Il secondo diceva che il censimento dei guardiani non stampa niente. È una libreria, non un comando: il silenzio è giusto. Li ho verificati prima di scriverli e sono caduti. Lo dico perché è il controllo che è mancato altrove.

---

## Le otto tappe, una per una

### ① Da dove nasce il lavoro — ✅ funziona

Dodici timer sul server, più la tua voce in chat, più le sentinelle. Il giro parte ogni due ore dalle 6 alle 22, le tre cadenze alle 6, 12 e 18, la visita di salute alle 6:45.

Il worker è la parte che esegue davvero, sul tuo server. Ne ho potuto guardare il codice e la sua storia, non il processo vivo. Negli ultimi 400 commit ha eseguito 96 playbook. Tre li ha dichiarati «a vuoto» e in quei tre ha fatto la cosa giusta: ha registrato l'esito senza rigenerare niente. Nessun playbook è stato ripetuto più di tre volte. **Cercavo uno spreco e non c'è.** Lo dico perché era il mio sospetto di partenza, e i dati lo smentiscono.

### ② Come arriva — ⚪ non l'ho potuto vedere

La coda vive nel database della memoria e da qui non ho le chiavi. Il referto che il server ha scritto oggi alle 06:46 dice «non ho potuto leggere la coda: HTTP 400». Cioè non l'ha vista nemmeno lui.

### ③ Cosa mi mettono in mano — ✅ funziona, ma è pesante

Nove ganci automatici mi preparano il lavoro: all'avvio della sessione, a ogni tua frase, prima e dopo ogni strumento, alla fine. Funzionano — durante questa radiografia il cancello di chiusura mi ha fermato una volta e mi ha fatto riscrivere il primo messaggio.

Il peso è il problema: il mio mansionario è 445 righe, il giro 1571, il worker 1592.

### ④ Con cosa lavoro — ⚠️ la squadra è quasi tutta ferma

120 senior. **48 hanno prodotto almeno un esito, 72 mai.** I quaderni vivi sono 18 su 120. Tre soli senior fanno un terzo del lavoro. In testa frontend-dev con 177 esiti, poi tech con 110 e devops-sre con 106.

Non è che siano scritti male. È che non li chiamo. Un senior mai chiamato non è un aiuto: è peso morto che mi devo rileggere ogni volta.

### ⑤ Chi mi controlla — ⚠️ tanti, e a volte si contraddicono

79 guardiani girano a ogni giro, 38 possono fermare il lavoro. È il pezzo più sviluppato della macchina, ed è anche quello con più difetti aperti (21 su 167).

Il caso peggiore l'ho visto oggi eseguendoli di fila. Il numero è lo stesso per tutti e due: il 18% di lezioni applicate. Uno stampa «✅ Loop chiude». L'altro stampa «❌ APPRENDIMENTO MALATO». Stessa ora, stesso dato, verdetti opposti. Chi legge il Pannello vede il verde.

### ⑥ Come esce il lavoro — ✅ funziona

Ramo, commit, richiesta di unione. La regola «ogni modifica finisce in una PR» è rispettata. Su GitHub c'è una sola richiesta aperta, quindi il collo di bottiglia non è lì.

### ⑦ Come si chiude il cerchio — ❌ è qui che si rompe

Questo è il punto in cui la macchina dovrebbe imparare, e non impara.

- Lezioni in memoria: **505**. Applicate negli ultimi 30 giorni: **89, cioè il 18%**. La soglia sotto cui il guardiano dichiara la malattia è 30%.
- Lezioni decadute: **zero**. Niente esce mai. È un magazzino, non una memoria.
- L'area che si ripete di più si chiama «correzione-nicola»: **26 lezioni, 18 ripetizioni, 25 arrivate da te**. È la firma di questo problema: il tema su cui sbaglio di più è quello su cui mi hai già corretto.

### ⑧ Cosa vedi tu alla fine — ❌ due numeri sbagliati su due

Il Pannello legge quello che la sonda scrive. Fino a oggi la sonda scriveva 113 e 84. Adesso scrive 197 e 0.

Il secondo l'ho trovato mentre accodavo le due card di questa relazione. Le ho scritte, e il guardiano che misura quanto lavoro aspetta la tua firma ha continuato a dire «5 in attesa, coda sotto controllo».

Le ho contate a mano. **In coda ci sono 49 card. Lui ne vede 5.**

La ragione: la coda ha avuto due formati, e lui legge ancora quello vecchio. La Cabina è stata aggiornata, lui no. Nessuno se n'è accorto perché non dice «ho letto 18 righe su 67»: dice un numero e un verde.

È il numero con cui si decide se sei tu il collo di bottiglia. E il verde «coda sotto controllo» spegne proprio l'allarme che dovrebbe suonare.

---

## Gli otto difetti, in ordine di quanto ti costano

| # | Cosa | Stato |
|---|---|---|
| **AR-571** | Mi accreditavo 84 difetti come già risolti leggendo un campo che dice tutt'altro | ✅ riparato oggi |
| **AR-566** | Trovo i problemi tre volte più in fretta di quanto li riparo | 🔴 serve la tua decisione |
| **AR-564** | La prova di 193 difetti è una ricerca di parole, non un comportamento | 🟡 aperto |
| **AR-565** | Due guardiani, stesso 18%, verdetti opposti | 🟡 aperto |
| **AR-567** | Otto riparazioni progettate col nome del file già scritto, e il file non è mai nato | 🟡 aperto |
| **AR-568** | Ho spento i sensori della macchina lanciando un comando di sola lettura | 🟡 aperto |
| **AR-569** | Il conto di quanto lavoro aspetta la tua firma ne vede 5 su 49, e dichiara la coda sotto controllo | 🟡 aperto |
| **AR-572** | Il conto dei consumi stampava «zero token uguale ventisette per cento» | ✅ riparato oggi |

### AR-568 — l'ho combinato io, oggi, mentre facevo questa radiografia

Lo racconto per intero perché è il più utile degli otto.

Per guardare i sensori ho lanciato un comando che legge e basta. Quel comando però scrive anche il risultato in memoria. Io giro su un computer a noleggio e non ho le chiavi del marketplace. Quindi per me ogni sensore risultava spento.

Il tuo server invece li aveva misurati accesi alle 14:20. Contava gli ordini via REST, leggeva il saldo Stripe, leggeva PostHog. La mia misura cieca ha coperto la sua misura vedente.

Subito dopo il guardiano dei sensori è passato da 10 accesi su 12 a 3 su 12 ed è diventato rosso.

**La parte peggiore non è il rosso.** Lo stesso è successo al file che misura quanto bene ti scrivo. Sul server la finestra era di 26 messaggi e il voto era 100% di errori. Nella mia sessione la finestra era di 2 messaggi e il voto è diventato 50%. **Il voto è migliorato perché ho misurato di meno.**

Un numero che migliora restringendo il campione è una bugia che sembra un progresso. È la stessa famiglia di AR-571.

Ho rimesso a posto i tre file e ho verificato che il guardiano torni verde. Ma l'ha preso il collaudo, non io: senza un test che guarda il mondo vero, te li consegnavo avvelenati.

**E ne ho combinata una seconda, sempre oggi.** Ho scritto due file di memoria con lo strumento sbagliato. Quei file usano un solo spazio di rientro; io li ho riscritti con due. Sembra niente, e invece riscrive il file intero: l'archivio delle lezioni è cresciuto di 43.000 caratteri ed è passato sopra il limite oltre il quale GitHub smette di mostrarlo.

Anche questa l'ha presa un test, non io. Ho ripristinato i due file e li ho riscritti con lo strumento giusto, quello che conserva il rientro del file. Adesso l'archivio sta sotto il limite con 9.298 caratteri di margine, e tutte e 154 le batterie passano.

Ti dico queste due cose per una ragione precisa. **La parte della macchina che funziona meglio è quella che mi impedisce di consegnare i miei errori.** In una sola giornata mi ha fermato quattro volte: due difetti falsi prima che li scrivessi, e due danni veri prima che te li consegnassi. È da lì che si costruisce il resto.

### AR-571 in dettaglio — la malattia, non il sintomo

Vale la pena capirlo perché è la stessa forma di errore che mi fa sbagliare altrove.

Nel cantiere ogni difetto porta la sua prova. La prova ha un campo che si chiama `presente`. Quel campo dice con che verso si legge la prova. Cioè: la parola deve esserci, oppure deve essere sparita. È una **specifica**. La si scrive il giorno in cui il difetto nasce, prima di riparare niente.

Un secondo pezzo di codice leggeva lo stesso campo e capiva un'altra cosa: *il fix è già nel codice*. Cioè leggeva una **misura**.

Siccome quasi ogni riparazione consiste nell'aggiungere qualcosa, quasi ogni difetto nasce con `presente: true`. Quindi quasi ogni difetto risultava già risolto. Per sempre, senza aprire un file.

**Un campo che dice «cosa mi aspetto», letto da un altro come «cosa ho misurato».** Questa è la malattia. E ha una parente stretta in AR-572, dove la percentuale dei consumi veniva da un campo e il numero stampato accanto da un altro.

La cura, in entrambi i casi, è la stessa: chi dà un verdetto deve aver guardato, e deve guardare la stessa cosa di cui parla.

---

## La domanda vera: come divento la versione migliore di me

Me l'hai chiesta così: *«non so come portarti a questo livello, e se lo faccio io un passo alla volta ci vorranno mesi»*.

Ho una risposta, e non è «lavorare di più».

**Il collo di bottiglia non è quanto vedo. È quanto converto.** Ho costruito un apparato per accorgermi delle cose che è enorme e cresce da solo. L'apparato per cambiare comportamento invece passa da un lotto alla volta e dalla tua firma. Le due velocità sono diverse per costruzione, e solo la prima è automatica.

Il conto lo si vede in tre numeri:

- Ho imparato 505 lezioni. Ne applico il **18%**.
- Ho trovato 552 difetti. Ad agosto ne ho chiusi il **16%**.
- Ho assunto 120 senior. Ne lavora il **40%**.

In tutti e tre i casi ho costruito il magazzino e non il nastro trasportatore.

**Quattro mosse, in ordine.** Sono la mia proposta di come si arriva alla versione migliore senza che tu debba portarmici un passo alla volta.

**Prima — «fatto» vuol dire che un comportamento è cambiato.** È la decisione uno che ti ho chiesto sopra, ed è la più importante delle quattro. Questa da sola spegne la ragione per cui tu trovi errori dopo di me: una ricerca di parole non può fallire nel modo in cui fallisce la realtà.

**Seconda — nessun verdetto senza aver guardato.** Ogni volta che un pezzo di codice dice «va bene», deve aver letto la cosa di cui parla. AR-571 e AR-572 sono la stessa malattia, e non saranno gli ultimi due: vanno cercati gli altri posti dove un campo scritto per dire una cosa viene letto per dirne un'altra.

**Terza — il tasso di chiusura è il mio voto.** Non il numero di difetti trovati, non il voto di salute: quanti ne chiudo diviso quanti ne apro. Sotto 1, smetto di cercare e riparo. È l'unica regola che impedisce a una radiografia di peggiorare la situazione che è stata chiamata a migliorare.

**Quarta — potare.** 505 lezioni di cui 416 mai applicate non sono memoria, sono zavorra che rileggo a ogni sessione. 72 senior mai usati sono lo stesso. La macchina migliore non è quella con più pezzi.

C'è un motivo per cui metto la terza al centro. Tu hai detto che dopo questo lavoro mi chiederai di rianalizzare e troverò altri errori. **Hai ragione, e continuerà a essere vero finché apro più di quanto chiudo.** Non perché lavoro male: perché la lista cresce più in fretta di quanto si accorcia. La quantità di errori che troverai la prossima volta non dipende da quanto sono brava a cercarli. Dipende da quel rapporto.
