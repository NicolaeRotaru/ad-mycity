---
tipo: stato
aggiornato: 2026-08-27 11:40
fonte: AD digitale (giro, cervello/giro.md)
---

---

## I numeri chiave, come li ho misurati l'ultima volta

**Questa e' la base di partenza, non una misura di adesso.** I numeri qui sotto
vengono dall'ultima lettura vera del database, fatta il 24 agosto verso le 13:05
(query dirette MCP Supabase). Quando i sensori sono ciechi, i controlli automatici
leggono questa tabella invece di inventare un numero.

**Sta in cima apposta.** Prima era in fondo, dentro una voce di agosto, e
archiviando le voci vecchie sarebbe sparita — portandosi dietro il numero che
tre controlli usano per capire se l'attivita' e' ferma.

| Numero | Oggi (24/8 13:05) | Δ vs 21/8 20:31 | "Riuscito" | Note |
|---|---|---|---|---|
| Negozi REALI approvati | **1** (Pane Quotidiano) | = | ≥1 LIVE vero | 1 profilo `role='seller'` confermato query diretta 24/8 13:03 |
| Negozi con payout attivo | **0 reali** | = | 1 | PQ Stripe: charges/payouts/details_submitted tutti `false`, riverificato 24/8 13:04 |
| Prodotti VERI del faro pubblicati | **5** | = | ≥5 | confermato query diretta 24/8 13:03 |
| Ordini creati | **1** (annullato) | = | ≥1 valido | id `58094956`, €19,05, `payment_status=PENDING`/`delivery_status=CANCELED`, creato 24/6 08:28 — ultimo ordine tuttora quello |
| Ordini pagati | **0** | = | 1 | **North Star 0** · stallo **61 giorni** dal 24/6 (misurato 24/8 13:03, query MCP) · la pausa concordata con Nicola arriva al 24/8-1/9: scade oggi/domani |
| Ordini consegnati | **0** | = | 1 | nessuna consegna mai avvenuta |
| Payout testato | **0** | = | 1 | payout-test sandbox su ordine vero, non eseguibile finché Stripe PQ resta spento |
| Nuovi clienti reali | **8 profili** (1 negli ultimi 7g) | = | crescita | il nuovo resta `nicolarotaru2000@gmail.com` (20/8). Quasi certamente un test di Nicola. Nessun negozio nuovo. Nicola non ha ancora risposto |
| **Lead negozi nel DB** | **407** (fermi dal 24/5) | = | lavorarli | invariato, non ricontrollato oggi (fuori dal perimetro North-Star di questo giro) |
| **Sito pubblico** | **HTTP 503** | = | 200 | riverificato in diretta con WebFetch il 24/8 ~13:05: ancora giù, dominio non ancora spostato da Render a Vercel (card #155) |

---






> 🔬 **27/8 11:40 — Il metro di una prova diceva zero quando non aveva misurato.**
>
> **In parole semplici.** Altri 55 controlli finti sbloccati. Due non mordevano, e dietro c'erano due difetti veri.
>
> **Per esempio.** Un controllo misurava quanto e' leggibile una riga. Per farlo chiedeva a un altro programma. Quel programma non riusciva a ricevere il testo e rispondeva «non ho potuto leggerlo» — la risposta giusta. Ma chi lo interrogava capiva «zero problemi». Da quando e' nato quel controllo non guardava niente.
>
> **E riparandolo ne e' uscito un secondo.** Ho guardato il perimetro con la lente della sicurezza, eseguendo il codice invece di rileggerlo. C'e' un elenco che dice quali programmi si possono lanciare. Il controllo che tiene fuori i percorsi che escono dalla cartella guardava solo l'inizio del percorso: bastava mettere il salto all'indietro in mezzo per passare.
>
> **Cosa cambia per te.** I controlli finti scendono da 229 a 174. E l'elenco dei permessi non accetta piu' un percorso che esce di casa.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Il buco dell'elenco dei permessi non l'ho trovato usato da nessuno: i programmi lanciati davvero stanno tutti dentro. Per sfruttarlo servirebbe poter scrivere dentro il progetto, e chi ci riesce ha gia' altre strade. L'ho chiuso lo stesso perche' e' un elenco di permessi.
>
> **Dettagli tecnici.** AR-845 e AR-846 aperte e chiuse. Sedici grappoli, 52 mutazioni su 55 mordevano. Tetto `mutazioni_senza_esecutore` 229 → 174. Corretto anche un commento in `permessi-elenco.mjs` che spiegava la scelta con un esempio falso: misurato, zero lanci veri lo distinguono.

> 🏷️ **27/8 10:55 — Venti lavori finiti, contati come da fare.**
>
> **In parole semplici.** Ho trovato venti lavori finiti per davvero, con la prova che gira. Ogni contatore li leggeva come da fare. Diciotto perche' erano scritti con la parola di un altro elenco.
>
> **Per esempio.** In casa ci sono due elenchi di problemi: quello della macchina e quello del sito. Nel primo «finito» si dice in un modo solo. Nel secondo si puo' dire in tre. Chi ha lavorato su tutti e due nello stesso giorno ha usato la parola del secondo dentro il primo, e per la macchina quelle schede non erano finite.
>
> **Cosa cambia per te.** I problemi aperti scendono da 133 a 113. Ma conta di piu' un'altra cosa. Quelle schede stavano in una lista che qualcuno un giorno avrebbe riaperto, per finire un lavoro gia' finito.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Prima di cambiare uno stato ho rifatto girare tutte le prove: undici comandi per diciotto schede, tutti verdi. Quindi so che i fix ci sono. Quello che non so e' se la parola sbagliata sia finita anche in registri che non ho guardato. Nel cantiere della macchina, almeno, adesso non puo' piu' succedere.
>
> **Dettagli tecnici.** AR-844 aperta e chiusa. Chiuse anche AR-780 (bloccante) e AR-796, riparate il 23/8 e mai girate di stato, dopo aver tappato i buchi di prova che restavano. Le 18 in stato `riparato` portate a `chiuso` con la data del commit che le ha introdotte, presa da git. Freno nuovo `cervello/stati-che-nessuno-capisce.mjs`, tetto `stati_ignoti` a 0, montato nel cancello. 7 casi, 4 mutazioni rosse. Tasso di chiusura di agosto da 1,25 a 1,3.

> 🧵 **27/8 10:15 — Un controllo con tre regole ne applicava due.**
>
> **In parole semplici.** Altri 55 controlli finti sbloccati: 49 mordono, 6 no. Tutti e sei riparati. Il numero scende da 284 a 229.
>
> **Per esempio.** C'e' un guardiano che controlla se i programmi grossi della macchina possono partire. Ha tre regole. Le prime due erano provate da dodici casi. La terza dice una cosa sola: questo programma parte e poi muore subito dopo. Quella regola era collegata e non la provava nessuno. Si poteva togliere e restava tutto verde.
>
> **Cosa cambia per te.** Sei controlli veri adesso sono collegati per davvero. Il numero dei controlli finti e' sceso di 164 in una giornata: era 393 stamattina.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Restano 229 controlli. E ne dichiaro uno che da qui non posso provare fino in fondo: un pezzo di codice aveva l'indirizzo di casa scritto a mano, e su questa macchina quell'indirizzo e' quello giusto. Il danno si vedrebbe solo altrove — sul server. Meta' di quel controllo guarda il comportamento, meta' guarda il testo, ed e' scritto perche'.
>
> **Dettagli tecnici.** Undici grappoli. I sei riparati, per forma:
> · AR-780 e AR-743 — rilevatori collegati e mai provati.
> · AR-757, due volte — il percorso del freno compare due volte nel gancio del commit, e la ricerca trovava sempre l'altra.
> · AR-126 e AR-435 — in `prepara-giro`: i fatti letti dal registro, e la radice calcolata invece che scritta.
> Parametrizzata `guarda(cartella)` per poterla eseguire su un mondo finto. Tetto `mutazioni_senza_esecutore` 284 → 229.

> 🔗 **27/8 09:35 — Quattro regole scritte bene che non chiamava nessuno.**
>
> **In parole semplici.** Altri 56 controlli finti sbloccati: 62 mordono, 4 no. Le quattro non erano regole sbagliate. Erano regole giuste che nessuno interrogava.
>
> **Per esempio.** C'e' una regola che dice: se il cervello e' acceso ma non finisce piu' niente e ha lavoro in coda, suona l'allarme. Quella regola era provata quattro volte. Ma il pezzo che la chiama non lo provava nessuno: si poteva staccare, e tutte e quattro le prove restavano verdi. L'allarme non avrebbe mai suonato.
>
> **Cosa cambia per te.** Il numero dei controlli finti scende da 340 a 284. E adesso quattro regole vere sono collegate per davvero, non solo scritte.
>
> **Cosa devi fare.** Niente: e' lavoro sulla macchina.
>
> **Cosa non ho verificato.** Restano 284 controlli da guardare. E una cosa la dico contro di me: uno dei quattro buchi l'avevo appena creato io, scrivendo una prova che sembrava controllare una data e non controllava niente. L'ho visto solo perche' ho rotto il codice a mano invece di fidarmi del verde.
>
> **Dettagli tecnici.** Otto grappoli. I quattro: AR-366 (la chiamata a `vivoMaNonProduce` dentro `sentinella-dati`, provata ora con `valutaRegole`), AR-796 (estratto `dovePuntaLaScheda` da `auto-fix`), AR-807 due volte — il guardiano del campo visivo nel cancello, e il cartello della pulizia. Tetto `mutazioni_senza_esecutore` 340 → 284. Irrobustiti tre controlli di montaggio che una riga commentata soddisfaceva lo stesso.

> 🧪 **27/8 09:10 — Tre prove non guardavano niente, e non perche' fossero scritte male.**
>
> **In parole semplici.** Ho sbloccato altre 57 prove che risultavano verificate senza esserlo. Ne mordono 54. Le tre che restano sono la cosa interessante della giornata.
>
> **Per esempio.** Una di quelle tre difende questa regola: se la macchina non riesce a chiedere una cosa, deve dire «non lo so» invece di dire «va bene». La prova era scritta bene. Ma per arrivare a quel punto del codice serve che la domanda fallisca davvero — e qui la domanda funziona sempre. Quella riga non la eseguiva nessuno, quindi rompendola non cambiava niente.
>
> **Cosa cambia per te.** Il numero delle prove finte scende da 393 a 340, e scende soltanto. Ma soprattutto adesso so riconoscere una forma che prima mi sfuggiva: quando una prova non morde, la seconda domanda e' se quel pezzo di codice qui ci passa mai qualcuno.
>
> **Cosa devi fare.** Puoi leggere questa voce come un promemoria e basta: e' lavoro sulla macchina, non tocca ne' il sito ne' i negozi.
>
> **Cosa non ho verificato.** Restano 340 prove da controllare, e il ritmo di oggi non si puo' proiettare su quelle: i grappoli che ho preso puntavano a file di prova recenti e ben tenuti, e quelli sono i piu' facili. Quante delle 340 non guardino niente, non lo so.
>
> **Dettagli tecnici.** Quattro grappoli (`sorvegliante`, `prove-a-due-versi`, `cancello-stop`, `una-corsia-piena`), 57 mutazioni, 3 non mordevano. AR-550 era il collegamento nel cancello, non la funzione. AR-552 e AR-365 erano rami che l'ambiente non percorre, curati estraendo `statoFusioneDa` e `verdettoAllerta`. Tetto `mutazioni_senza_esecutore` 393 → 340. Lezione L-2026-0827-02, agganciata al gate del sorvegliante.

> 🚦 **27/8 08:15 — Erano sei, non ventisette. Contati bene, si chiudevano tutti oggi.**
>
> **In parole semplici.** Stamattina avevo scritto che nel giro c'erano 27 controlli da verificare. Li avevo contati per riga. Contandoli per controllo il numero e' sei, e sei si riparano in un pomeriggio invece di diventare un debito.
>
> **Per esempio.** Contando le righe accusavo anche chi fa la cosa giusta. Un controllo scritto bene ha due righe: una per «ti boccio» e una per «non ho potuto guardare». La prima riga, da sola, sembrava scoperta.
>
> **Cosa cambia per te.** Sei controlli del giro sapevano dire solo due cose su tre. Due tacevano quando non riuscivano a misurare, e il silenzio sembrava un via libera. Quattro dicevano la diagnosi come se l'avessero fatta. Il piu' caro era quello della stella polare: quando scatta riscrive il giro intero, e lo avrebbe riscritto per un sensore rotto. Adesso dicono tutti e tre le cose.
>
> **Cosa devi fare.** Niente di nuovo: la coda delle scelte non e' cambiata da stanotte.
>
> **Cosa non ho verificato.** Non ho fatto girare un giro vero: ho eseguito i blocchi da soli, con controlli finti che rispondono come voglio io. E c'e' una conseguenza che dichiaro invece di lasciartela scoprire: da adesso, se uno strumento e' rotto, il giro non puo' piu' saltare il lavoro dell'AI. Costa, ed e' voluto — dormire con uno strumento rotto costa di piu'.
>
> **Dettagli tecnici.** AR-843 chiusa. Il conto: 19 vincoli a mano, 3 col ramo del cieco, 10 su guardiani con uscita 2, 6 vivi — `senior-sola-lettura` e `ci-stato` legati a `-eq 1`, `test-cervello`, `chiusura-loop`, `calibrazione debito` e `north-star-check` legati a `-ne 0`. Tutti su `vincolo_da_rc`. Contatore `cervello/vincoli-senza-cieco.mjs`, tetto `vincoli_senza_cieco` a 0, montato in `cancello-lotto.mjs`. 12 casi, 4 mutazioni rosse. Ri-ancorata la prova a due versi di AR-158, terza ancora rotta oggi da uno spostamento di codice. Difetti aperti 115.

> 🧭 **27/8 07:35 — Un controllo che non aveva potuto guardare diceva lo stesso cosa aveva visto.**
>
> **In parole semplici.** Prima di svegliare l'AI, il giro fa girare dei controlli. Uno di questi guarda se lo sforzo sta andando su un negozio vero o su un'ipotesi. Ha tre risposte possibili: va bene, non va bene, non ho potuto guardare. Il giro ne leggeva solo due.
>
> **Per esempio.** Quando quel controllo non riusciva a misurare, all'AI arrivava lo stesso una frase. Diceva: «stai mettendo lo sforzo su un negozio che non e' confermato». Arrivava come regola non negoziabile, e nessuno l'aveva verificato. Un ordine sbagliato non viene ignorato: viene eseguito.
>
> **Cosa cambia per te.** Adesso quando quel controllo non ci vede lo dice con parole sue: ripara lo strumento, non fidarti di un verde che non c'e'. E la prova di tutto il pezzo non cerca piu' una parola in un file: prende il blocco vero e lo fa girare con tre risposte finte, guardando cosa arriva all'AI.
>
> **Cosa devi fare.** Niente. Le scelte in coda restano la #177, la #178 e la #175.
>
> **Cosa non ho verificato.** Nello stesso file ci sono 27 altri controlli che si scrivono il testo a mano come faceva questo. Per sapere se hanno lo stesso difetto bisogna leggerli uno per uno, e non l'ho fatto: non dico che siano sani e non dico che siano malati. Il conto e' scritto in una scheda aperta.
>
> **Dettagli tecnici.** AR-842 chiusa, AR-843 aperta. Le prove vacue di AR-079 e AR-081 sostituite da `cervello/test/il-verdetto-che-non-arriva-al-motore.test.mjs`: 15 casi che ritagliano da `giro.sh` i tratti veri e li eseguono con un `allocazione-check.mjs` finto a 0/1/2. Il blocco usa `guardiano` e `vincolo_da_rc` di `giro-esito.sh`. 4 mutazioni verificate rosse. Difetti aperti 116.

> 🏪 **27/8 06:40 — La macchina sa fare il primo lavoro che appartiene a un negozio.**
>
> **In parole semplici.** Fino a stamattina la macchina sapeva fare solo lavori suoi. Adesso sa fare un lavoro che appartiene a un negozio, e quel lavoro passa da una strada sola. Su quella strada le righe di un altro negozio vengono buttate via e contate, e le chiavi del negoziante non hanno un buco da cui entrare nel testo.
>
> **Per esempio.** Ho dato al costruttore due righe insieme, una del forno e una del fioraio. Nel testo che ne è uscito del fioraio non c'era niente: né il dato, né il nome. Poi ho finto che il fornaio incollasse la sua password dentro un messaggio: il testo non è partito affatto. Non è partito ripulito — non è partito.
>
> **Cosa cambia per te.** Il pezzo che tiene separati i negozi era scritto e provato da quattro giorni, e non lo usava nessuno. Adesso lo usa qualcuno, e chi verrà dopo non può girargli intorno: un lavoro di un negozio che la macchina non sa trattare si ferma da solo, con scritto perché.
>
> **Cosa devi fare.** Niente. Le scelte in coda restano tre: la #177, la #178 e la #175.
>
> **Cosa non ho verificato.** La separazione la fa il codice, non il database. Se una richiesta al database è scritta male, le righe di un altro negozio arrivano fino al filtro: vengono buttate e il numero si vede nel registro, ma sono uscite. Il muro dentro il database resta il buco aperto, e da qui non lo posso né provare né chiudere. E niente di tutto questo l'ho visto girare su un negozio vero: non esiste ancora un lavoro di bottega in coda.
>
> **Dettagli tecnici.** AR-839 chiusa. Porta in `cervello/bottega/testo-lavoro.mjs`, muro all'esecuzione in `cervello/worker-bottega.sh` (`bottega_muro`) chiamato da `worker.sh` prima del tetto di spesa. `TIPI_DI_BOTTEGA` ha il suo primo nome. 36 verifiche verdi, 8 mutazioni rosse, la prova ritaglia ed esegue i tratti veri di `worker.sh`. Aperta e chiusa nello stesso lotto AR-841 (ripiego se `mktemp` tace), trovata dalla radiografia in corsa. Lezione L-2026-0827-01. Difetti aperti 115.

> 🧹 **27/8 00:45 — Cominciato a pagare il debito delle prove finte: 42 sbloccate, un terzo non guardava niente.**
>
> **In parole semplici.** Due giri di bonifica sulle prove che risultavano verificate senza esserlo. Ne ho sbloccate 42 e fatte girare per davvero: 28 mordono, **14 no**. Di quelle 14 ne ho riparate cinque. Il tetto è sceso da 435 a 393, e scende soltanto.
>
> **Per esempio**, la più importante. C'era una regola che dice: un invio senza la tua firma non parte. La sua prova sembrava perfetta — chiamava il controllo vero con una firma vuota e pretendeva un no. Il no arrivava, ma da un altro controllo: il primo cancello è l'interruttore di emergenza, che senza credenziali blocca tutto prima ancora di guardare la firma. Quindi la regola sulla firma non la provava nessuno.
>
> **Cosa cambia per te.** Quella regola adesso ha una prova vera. E ho imparato una cosa che vale oltre il caso singolo: **un controllo che blocca tutto a monte può far sembrare provata una regola a valle che non lo è.** Il verde è vero, la ragione è un'altra.
>
> **Cosa devi fare.** Niente. Le due scelte in coda restano la #177 e la #178.
>
> **Cosa non ho verificato.** Restano nove schede scoperte, tutte con un nome. Quattro vogliono il server: parlano di orologi e configurazioni che da qui non posso far girare. Le altre cinque le ho lasciate per stanchezza, non per impossibilità.
>
> **Dettagli tecnici.** Lotti su AR-023..AR-087. Riparate AR-050, AR-051, AR-062, AR-067, AR-078 — quest'ultima estraendo `azioneIdUsabile` in una funzione pura. Restano AR-054, AR-056, AR-057, AR-059 (server), AR-071, AR-075, AR-077, AR-081, AR-082. Tetto `mutazioni_senza_esecutore` a 393.

> 🧪 **26/8 21:15 — Metà delle prove che dovevano dimostrare che le prove servono, non servivano.** La cosa più importante che ho trovato oggi.
>
> **In parole semplici.** Quando chiudo un difetto non basta scrivere una prova. Devo rompere la riparazione apposta e far vedere che la prova diventa rossa. Se non diventa rossa, quella prova non stava guardando niente. È il controllo che tiene in piedi tutti gli altri.
>
> Quel controllo lancia la prova passandole il **nome del file**. In 435 schede su 872, cioè più della metà, al posto del nome c'era una riga di comando intera. Allora cercava un file chiamato «node cervello/prove/eccetera», non lo trovava, e si arrabbiava. **E arrabbiarsi è esattamente il segnale che lui legge come «la prova è diventata rossa».** Risultato: verificate sempre, qualunque cosa succedesse.
>
> **Per esempio**, oggi ho scritto quindici prove nuove. Tutte e quindici risultavano verificate. Ne ho rotte cinque a mano, una per una, e cinque non se ne sono accorte: erano verdi per finta. Il numero grande l'ho misurato dopo.
>
> **Cosa cambia per te.** Per metà del registro, la frase «difetto chiuso, prova verificata» finora voleva dire soltanto «qualcuno ha scritto una riga». Quando ti dico che un difetto è chiuso con la sua prova, da adesso quella frase vale di nuovo.
>
> **Cosa devi fare.** Niente adesso. Il peggioramento è fermo: c'è un contatore, il numero di oggi è il tetto, e il cancello lo controlla a ogni consegna. Da adesso può solo scendere.
>
> **Cosa non ho verificato.** Le 435 vecchie restano da sistemare e non è un lavoro meccanico. Appena una prova si sblocca si scopre se guardava qualcosa: va fatto a pezzi, perché ogni pezzo può far uscire un difetto che credevamo chiuso. Quanti siano, non lo so ancora.
>
> **Una cosa buffa e istruttiva.** Mentre scrivevo il contatore ho fatto lo stesso errore: una delle mie cinque prove nuove puntava a un file che non esiste. L'ha beccata il contatore appena acceso, al primo giro.
>
> **Dettagli tecnici.** AR-840 aperta, bloccante. Contatore `cervello/mutazioni-senza-esecutore.mjs`, tetto `mutazioni_senza_esecutore` a 435 su 877 voci in `tetti-lotto.json`, montato in `cancello-lotto.mjs`. Tredici casi di prova su tredici verdi, 5 mutazioni rosse — fra cui una che toglie il guardiano dal cancello. Aperta anche AR-839, il muro fra i negozi dal lato del testo.

> 💶 **26/8 20:50 — Il tetto di spesa dei negozi aveva una porta e nessuno che ci passasse.** Consegna ③, il pezzo dopo il turno.
>
> **In parole semplici.** La macchina sapeva già fermare un negozio che ha finito il suo budget. Ma il numero di quanto aveva speso non lo contava nessuno: restava zero per sempre. Un tetto che nessuno alimenta non è un freno, è un cartello. Adesso ogni lavoro che la macchina fa viene addebitato al negozio giusto, e il conto lo legge chi decide se far partire il lavoro dopo.
>
> **Cosa cambia.** Un negozio che consuma troppo si ferma da solo. Si ferma lui, non gli altri.
>
> **Tre scelte, e le dico tutte e tre.** ① La misura è in gettoni di lavoro, non in euro. In casa non esiste nessun listino che li converta, e inventarlo sarebbe un numero senza fonte. ② Le stime non fanno scattare il tetto. Fermare un negozio con un conto che nessuno ha misurato è un freno appoggiato sul niente. ③ Uno zero misurato non esce dal contatore. Un negozio con sole stime ha misurato zero: è vero e non dice niente. Se quello zero uscisse coprirebbe un numero scritto a mano, cioè una cosa che il registro non sa.
>
> **La terza l'ha trovata una prova.** L'avevo scritta aspettandomi il risultato opposto.
>
> **Cosa non ho verificato.** Il tetto guarda una finestra di sei ore. È un freno sul ritmo di spesa, non un canone mensile: quello è un pezzo ancora da fare.
>
> **Dettagli tecnici.** AR-838 chiusa con prova a comando — `cervello/test/il-tetto-di-spesa-ha-chi-lo-alimenta.test.mjs`, 9 casi, 6 mutazioni rosse. Il negozio arriva da `AI_NEGOZIO`, che sta fra le variabili spente a ogni lavoro. Trovato riguardando il perimetro: la richiesta della spesa girava a ogni battito anche a coda vuota.

> 🛣️ **26/8 20:15 — Il turno fra i negozi c'era da tre giorni e non lo chiamava nessuno.** Consegna ③, la macchina delle botteghe.
>
> **In parole semplici.** La parte che decide «a quale negozio tocca adesso» era scritta e provata dal 23 agosto. Il worker vero, però, continuava a prendere il lavoro più vecchio della coda. Con un negozio solo va bene. Con quaranta che pagano il canone, il più lento li ferma tutti — e il tempo perso è di qualcuno che non c'entra. Adesso è collegata davvero.
>
> **Cosa cambia.** La consegna ③ non è più intatta: il meccanismo del turno è dentro e provato eseguendo il codice vero, non rileggendolo. Restano fuori due cose. Il muro dentro il database, che è rosso e da qui non si può provare. E il contatore della spesa per negozio, che è il pezzo dopo.
>
> **Quattro difetti veri li hanno trovati le prove, non la riletta.** ① La prima versione **avrebbe fermato la macchina intera** al primo giro: la coda di oggi è tutta del centro, che non ha un tetto di spesa dichiarato, e il freno delle botteghe l'avrebbe bloccata. ② La presa chiamata dentro una sottoshell perdeva la memoria del turno: sempre lo stesso negozio, in silenzio. ③ Un pezzo di codice ingoiava la risposta «non capisco quello che mi arrivi». Il worker restava fermo con la coda piena. Quel solo pezzo teneva rosse quattro prove di casa. ④ La finestra di 200 righe che avevo messo sulla coda **rimetteva dentro la fame che stavo togliendo**: un negozio con 200 lavori in attesa la riempie tutta e il lavoro di un altro diventa invisibile. L'ha trovata il controllo del perimetro, non io.
>
> **La cosa da ricordare.** Tre volte su tre, oggi, la mia prima spiegazione di un rosso era falsa. A smentirla è stata sempre una misura, mai una riletta.
>
> **Cosa non ho verificato.** Il turno l'ho provato con un database finto: che il worker VERO lo usi si vede al primo giro del server, che è fermo.
>
> **Dettagli tecnici.** Il muro nel database e' AR-802: resta 🔴 e da qui non e' provabile. Il contatore della spesa e' AR-838. Il pezzo che ingoiava la risposta era un `|| true`. AR-804 chiusa con prova a comando — `cervello/bottega/scelta-worker.mjs`, `cervello/worker-coda.sh`, `cervello/test/il-negozio-lento-non-ferma-gli-altri.test.mjs`. 12 casi, 9 mutazioni verificate rosse, cancello del lotto verde su 27 guardiani. PR #850. Aperte AR-837 e AR-838. Sul sito: ottavo difetto del design chiuso (l'assistenza non aveva nessuna maniglia per chi compra), PR #243, 11 controlli verdi.

> 🔁 **25/8 21:00 — Il controllo di fine turno chiedeva di ricontrollare lavoro già pubblicato. Da nove giorni c'era la cura scritta e ferma.** Richiesta tua: «fai la 749».
>
> **In parole semplici.** Quando un turno finisce, la macchina si ferma e fa una domanda: stai lasciando indietro un lavoro? Per rispondere confronta il lavoro con un punto di partenza. Quel punto si sposta avanti solo quando un turno si chiude senza problemi. Ma se il lavoro è già stato pubblicato, il confronto trova comunque tutto quello che c'è nel tronco. Allora il turno risulta sporco, e il punto non si sposta. Il giro dopo la lista è più lunga. **È successo 46 volte in sei giorni.**
>
> **Cosa cambia per te.** Se non c'è niente di non pubblicato, adesso il punto di partenza si riporta avanti da solo. Così la domanda smette di ripetersi a vuoto. Il controllo continua a fare il suo lavoro quando c'è lavoro vero.
>
> **La cosa che non mi aspettavo.** La cura era già scritta dal 16 agosto, in una richiesta rimasta ferma. Riguardandola prima di consegnarla ho visto che **era troppo larga**: spegneva il controllo anche quando sul disco c'era lavoro non ancora salvato. Cioè lo avrebbe indebolito proprio nel turno in cui serve. L'ho ristretta e ho aggiunto le prove del caso contrario.
>
> **Cosa devi fare.** Una firma sulla richiesta nuova. La vecchia, la 749, si chiude da sé come superata.
>
> **Cosa non ho verificato.** Il comportamento dal vivo sul server: la prova è tutta sui banchi di questa macchina. E come sempre, quello che ho riguardato l'ho riguardato io: qui non c'è stato un collaudatore diverso da chi ha costruito.
>
> **Dettagli tecnici.** Tre schede. AR-819 è il ciclo. AR-820 è il fix troppo largo, trovato dalla radiografia del perimetro. AR-821 è un errore di git ingoiato dentro la riparazione, trovato dalla spazzata dei fratelli. Toccati due programmi. In `cervello/cancello-stop.mjs`: `scegliPerimetro` e il punto che la chiama. In `cervello/collaudo.mjs`: `verdettoCollaudo`, `baseDelCollaudo`, `collaudoAlloStop`. Le prove: 125 casi su 125 verdi, 3 mutazioni su 3 che diventano rosse rompendo il fix apposta. Tolto anche un pezzo di codice morto, dimostrato inutile dalla mutazione che restava verde.

> 🩻 **25/8 19:55 — Adesso la radiografia gira DENTRO le riparazioni, non solo prima e dopo.** Richiesta tua: «entro il 29 agosto la macchina e il sito devono essere pronti, senza difetti». E: «fai la radiografia mentre risolvi i problemi, così non saltano fuori altri problemi se ne faccio un'altra separata».
>
> **In parole semplici.** Finora l'esame completo era un evento a parte. Si lanciava, usciva una lista, e per giorni si riparava quella lista. Nel frattempo nessuno riguardava i pezzi appena toccati. Da adesso un lavoro non si consegna se i file che ha toccato non sono stati riletti con l'occhio giusto. E riletti **dopo** l'ultima modifica, non prima.
>
> **Perché serviva, coi numeri.** La macchina lo aveva già scritto da sé in un suo registro: «per trovare problemi nuovi serve un esame nuovo; le riparazioni non riaprono da sole la lista». E il conto delle nascite, misurato il 23 agosto: su 787 schede del cantiere, 99 le ha create il riparare — una su otto. Il posto dove nascono più difetti era l'unico senza nessuno che guardasse.
>
> **Cosa cambia per te.** «Zero difetti aperti» comincia a voler dire quello che sembra. Prima era vero sulla lista e falso sul codice: un esame rifatto il giorno dopo avrebbe trovato roba nata durante le riparazioni. Ed è successo subito, alla prima prova vera. Riguardando sé stesso, il controllo nuovo ha trovato **tre difetti dentro di sé**. Uno: un comando che diceva di aver registrato e non registrava. Due: un percorso che usciva dalla cartella del progetto. Tre: chiedeva di riguardare un file che il lavoro aveva appena cancellato. Riparati tutti e tre prima della consegna.
>
> **Cosa devi fare.** Una firma sola: la richiesta di unione di questo lavoro. Da lì in poi il controllo parte da solo a ogni lavoro.
>
> **Cosa non ho verificato.** Sul **sito** il controllo esiste ma si lancia a mano. Il cancello automatico vive nella casa della macchina, e la fabbrica del sito non ce l'ha in mano. Quindi sul marketplace, fino al 29, la rilettura dipende da me che la lancio, non da un blocco. L'ho scritto come limite dentro la scheda, non come cosa fatta. Nessuna di queste prove è passata dal server: girano tutte qui, sulla macchina di questa sessione.
>
> **Dettagli tecnici.** `cervello/radiografia-in-corsa.mjs` cablato in `cancello-lotto.mjs` (passo «la radiografia del perimetro toccato»). Mappa in `cervello/dimensioni-radiografia.json`: tutte e 44 le lenti dei quattro esami (macchina, Cabina, sito, design), confrontate a ogni cancello con i workflow veri. Registro in `auto-coscienza/radiografia-in-corsa.json`, con l'impronta dei file. Schede AR-818 · AR-814 · AR-815 · AR-816, con la lezione `L-2026-0825-02` e il suo gate. Più AR-817, aperta: la prova instabile che fa uscire rossa la CI a caso. Le prove: 16 casi su 16 verdi, e 4 mutazioni su 4 che diventano rosse rompendo il fix apposta. Passo ⑥bis della skill `cantiere`.

> ⏰ **24/8 12:30 — Due rami avevano dato lo stesso numero a difetti diversi.**
>
> **In parole semplici.** I conflitti che avevi visto erano cinque. Tutti su registri che tengono
> il conto delle cose. Le due parti li avevano allungati ognuna per conto suo, quindi non c'era un
> lato da scegliere: li ho tenuti tutti e due, voce per voce.
>
> Unendo è saltata fuori una cosa peggiore. **Due numeri erano stati dati due volte.** Il ramo
> entrato nel tronco chiamava «797» e «798» due suoi difetti. Il mio ne chiamava così altri due,
> diversi. Unire per numero li avrebbe fatti sparire in silenzio.
>
> **Per esempio**, uno dei due miei è quello che spiega perché un programma esplodeva alla prima
> prova che incontrava. Con l'unione fatta a occhio, quella scheda oggi non ci sarebbe più: nessun
> errore, nessun avviso, solo una riga in meno.
>
> **Cosa cambia per te.** Le due richieste di unione sono aperte, verdi e senza conflitti: la
> macchina e il sito. Sulla macchina il cancello passa con ventiquattro controlli su ventiquattro.
> Sul sito passano tutti e undici.
>
> C'è anche una cosa buona uscita per caso. Il lavoro entrato nel tronco portava tre controlli
> nuovi, lasciati fermi di proposito perché mancavano due schede nel registro. Erano proprio quelle
> che la fusione ha portato. Ne ho messo di guardia uno, e alla prima corsa ha trovato un permesso
> morto lasciato dal mio stesso lavoro.
>
> **Cosa devi fare.** Una scelta sola, la stessa di ieri: sulle botteghe, prima strada o seconda.
> Se resti zitto prendo la prima. Poi c'è la card numero 169, sulla spedizione scritta gratis e poi
> fatta pagare: lì l'altra strada è una decisione di prezzo, quindi tua.
>
> **Cosa non ho verificato.** I tre controlli arrivati dall'altro ramo non li ho scritti io e non li
> ho riletti riga per riga: li ho fatti girare e ho guardato cosa dicono. E i numeri delle card non
> li ho rinumerati: nessuno dei due rami è ancora unito, quindi nessuno dei due è la verità. Chi
> unisce per secondo rinumera.
>
> **Dettagli tecnici.** Teste: ad-mycity `13414e0f6`, mycity `d5f77b8`. Cantiere 118 da fare su 802;
> sito 421 reperti, 185 aperti, 26 in corso. I miei due difetti rinumerati AR-809 e AR-810, riscritti
> in scheda, mutazione, file di prova, commento nel codice, DECISIONI e quaderno di reparto. La
> collisione dei numeri è registrata come AR-811, grave: il 3 agosto era già successa due volte in un
> giorno e nessuno l'aveva registrata. Il freno agganciato è `cervello/porte-gemelle.mjs`. Sul sito il
> lotto ⑨ ha rifatto il metro sugli errori ingoiati: 53 chiamate al database nell'area venditore, 15
> cieche, tutte riparate.
>
> 🔬 **24/8 12:05 — Tre freni costruiti, uno solo promosso: gli altri due li ha bocciati il collaudo.** Richiesta di Nicola: «parti con tutti e tre».
>
> **Cos'era il lavoro.** Tre freni contro le tre forme con cui il riparare crea difetti nuovi: il controllo che nasce già rotto, la porta a mano riparata mentre quella automatica resta aperta, il puntatore che resta indietro quando il codice si sposta.
>
> **Come è andata.** Quattro giri, trentun senior, e un collaudo affidato a chi non aveva costruito niente. **Tredici bocciature su quattordici collaudi**, e ogni costruttore aveva consegnato dicendo «fatto, tutto verde». Alla fine ne passa **uno**: le porte gemelle, promosso da due collaudatori indipendenti e agganciato al cancello. Montarlo toglie un rosso invece di aggiungerlo.
>
> **I due bocciati, col motivo.** Il freno delle due case ignora la cartella di lavoro che il cancello dichiara, quindi misura un comando diverso da quello vero: una riga compra il verde. Il freno dei puntatori funziona, ma quando ferma il cancello **non dice quale scheda l'ha rotto**. Stampa i primi quindici accusati, che sono i quarantasei vecchi. La scheda nuova resta in fondo e non si vede mai. Restano strumenti da lanciare a mano, dichiarati.
>
> **Cosa resta scritto.** Il metodo è nella skill `collaudo`, le venti scorciatoie misurate in `cervello/scorciatoie-note.md`, i referti interi in `consegne/audit/2026-08-23-collaudo-tre-freni/`. Il cantiere adesso prevede il collaudo indipendente al punto 7bis e le tre domande di Nicola al 7ter.
>
> **Cosa non ho verificato.** Niente di tutto questo l'ho visto girare sul server vero: le prove sono tutte su questa macchina e su copie usa-e-getta del progetto. E il metodo resta provato su un tipo solo di lavoro, i freni della macchina.
>
> **Dettagli tecnici.** Freno agganciato: `cervello/porte-gemelle.mjs`, riga dopo «spazzata dei fratelli» in `cancello-lotto.mjs`, con la voce tolta da `guardiani-motivi.json` (montato, sarebbe fantasma). Nel cantiere sono registrate tre schede: AR-796 per il promosso, AR-797 e AR-798 per i bocciati. In coda le card #172 e #173.

> ✅ **26/8 17:41 — La card 174 è finita. Il campo del negozio è diventato obbligatorio.**
>
> **In parole semplici.** La macchina delle botteghe dovrà servire tanti negozi con un programma solo. Perché funzioni, ogni lavoro nella coda deve dire a quale negozio appartiene. Da oggi è obbligatorio: una riga che non lo dice viene respinta dal database.
>
> **Cosa cambia per te.** Niente che tu debba fare. La coda ha 3.281 righe e nessuna è senza il negozio. Il primo comando era già dato il 25 agosto. Oggi ho dato il secondo, quello che avevo fermato apposta.
>
> **Cosa devi fare.** Niente su questa. La card **#174** è chiusa nella coda.
>
> **Cosa non ho verificato.** Ho provato il vincolo scrivendo io nel database, non guardando la macchina lavorare davvero. Il prossimo giro vero del server è la conferma che manca, e arriva da sola domani mattina. Se qualcosa si rompe lì, si torna indietro con una riga sola.
>
> **Perché l'avevo fermato, e cosa l'ha sbloccato.** La condizione che avevo scritto io nominava un posto solo, il Pannello. Ma nella coda scrivono in quattro punti, e tre stanno sul server. Darlo in quel momento avrebbe fatto fallire ogni ri-accodamento: chat, giri, report, sentinelle. Cioè il danno che la card diceva di voler evitare, causato dalla card stessa.
>
> A sbloccarlo non è stata una supposizione. La macchina scrive nella coda una volta al giorno verso le 11. Stamattina ha scritto cinque righe alle 11:01, e tutte e cinque portano il campo nuovo. Il server sta girando col codice giusto, e quello lo dicono i dati.
>
> **La prova.** Una riga scritta senza il negozio viene respinta. Una scritta col negozio passa. La riga di prova l'ho tolta subito e il conto è tornato identico, 3.281.
>
> **Dettagli tecnici.** Migrazione `lavori_negozio_id_obbligatorio` sul progetto `xjljcsorpbqwttrejqte` (la memoria, non il marketplace): `update ... where negozio_id is null` poi `alter column negozio_id set not null`. Dopo: 3.281 righe · 0 nulle · `is_nullable='NO'` · indice `lavori_negozio_id_idx` presente. Prova comportamentale in un blocco `do $$` che fallisce rumorosamente se il vincolo non morde. Ritorno indietro: `alter table public.lavori alter column negozio_id drop not null;`

> 🚪 **26/8 08:25 — Il controllo che protegge il codice avvisa ma non ferma: dieci lavori su 141 sono entrati senza un verde.**
>
> **In due righe.** Il controllo automatico che protegge il codice funziona, ma il suo «no» non ferma nessuno: dieci modifiche su 141 sono entrate senza il suo via libera. Ho riparato quattro cose. Tre delle quattro me le ero fatte da solo. La quinta è la serratura, e quella è una scelta che tocca a te: card #177.
>
> **In parole semplici.** Prima che una modifica entri nel codice buono gira un controllo automatico. Ricontrolla tutto: le prove, i conti, i guardiani. Quel controllo funziona bene. Il problema è che il suo «no» non ferma niente. È come un cartello «lavori in corso» senza transenna.
>
> **Cosa cambia per te.** Sono andato a contare. Dal 4 agosto a oggi sono entrate 141 modifiche nel codice buono, e dieci sono passate senza il via libera. In nove casi il controllo aveva detto no. Nel decimo non l'aveva proprio vista. Dieci su 141 fa il 7%, cioè circa una ogni due settimane. Non ti sto dicendo che quelle dieci fossero sbagliate. Ti sto dicendo che oggi nessuno le distingue.
>
> **Cosa devi fare.** Scegliere se dare la serratura a quel controllo. Card **#177** in coda, con tre strade e quella che consiglio. Non l'ho scelta io perché costa: se il controllo diventa obbligatorio e il codice buono è rosso per conto suo, non si può unire nemmeno la correzione che lo rimetterebbe verde.
>
> **Cosa non ho verificato.** L'impostazione com'è messa adesso non l'ho letta. GitHub non me la fa vedere da qui, mi risponde di no. Il «non è obbligatorio» lo deduco dal comportamento, non dall'averlo visto scritto: nove unioni sono passate col controllo rosso, e se fosse obbligatorio non avrebbero potuto. E non so se quelle dieci fossero giuste o sbagliate una per una, perché i registri di quelle giornate GitHub li ha già cancellati. Del tetto di tempo che ho messo sulla chiamata a GitHub ho controllato la forma, non il comportamento: non ho ricreato il caso con GitHub lento.
>
> **Come ci sono arrivato.** Ero partito convinto di sapere il difetto: «il controllo non parte quando la richiesta di unione la apre la macchina». L'ho misurato prima di ripararlo, e la misura mi ha dato torto. 140 richieste su 141 il controllo le aveva viste eccome. Il difetto non c'era, e il guardiano che stavo per costruire avrebbe protetto da niente. Quest'altro è saltato fuori dallo stesso conto, e non lo cercavo.
>
> **Le altre due cose riparate.** La prima è il comando che dà i numeri alle schede dei difetti. Cercava il numero libero in due posti: qui e nel codice buono. Ma un numero preso da un'altra sessione non è ancora nel codice buono. Vive per ore su un ramo aperto, invisibile a tutti e due. Cioè non guardava proprio la finestra in cui lo scontro si può ancora evitare. Sono due le collisioni del 25 agosto, e la prima l'ho scoperta solo perché un conto non tornava.
>
> La seconda è una fuga di chiave che avevo creato io stesso poche ore prima. L'ho trovata riguardando il mio lavoro con la lente «cosa succede se». Passavo la chiave di GitHub come argomento di un comando. Gli argomenti di un comando li legge chiunque abbia accesso alla stessa macchina.
>
> **Poi il cancello mi ha fermato, e ha fatto bene.** Le due lezioni di oggi hanno spinto l'archivio della memoria oltre il megabyte con cui viene servito. Il potatore ha detto che non poteva fare niente, e sono andato a vedere perché.
>
> Il 20 agosto è nata una parola nuova. Serve a dire «questa lezione l'ho ritirata di proposito». Non l'ha imparata nessuno: il potatore contava quelle quindici lezioni come ancora vive. Venti chilobyte che nessuno poteva più togliere. L'archivio stava a 702 byte dal muro già prima che arrivassi io. C'era anche uno strumento nato apposta per accorgersene, un mese fa, e non lo eseguiva nessuno.
>
> **E l'ultima me la sono fatta da solo mezz'ora fa.** Ho montato il conto delle unioni dentro il giro. Così facendo ho messo una chiamata a internet dentro il battito della macchina, senza tetto di tempo. Con GitHub lento il giro non fallisce: resta fermo lì. L'ho trovata riguardando quello che avevo appena scritto.
>
> **Dettagli tecnici, uno per riga.**
>
> AR-830: i rami aperti diventano la terza fonte in `prossimo-ar.mjs`. Nata AR-824. L'ho rinumerata perché un'altra sessione ha unito lo stesso numero su main venti minuti dopo che l'avevo preso io. Quel pezzo che resta è AR-831. AR-825: il cancello non è un controllo richiesto su main. AR-826: la chiave sulla riga di comando. AR-827: `ritirata` era una parola con un solo scrittore e nessun lettore. Cura: una funzione `lezioniSpente` accanto a quella che diceva chi è vivo. E il metro `conteggiPrivatiDelleLezioni` affilato e montato su una prova che gira sul repo vero. AR-828: i due tetti di tempo su curl. Strumento nuovo `node cervello/entrate-senza-cancello.mjs [--tetto 10]`, sola lettura, ⚪ dichiarato quando la chiave non c'è. Lezioni L-2026-0826-01 e L-2026-0826-02. Sette mutazioni, tutte provate rosse con `non-vacuita.mjs`. Radiografia del perimetro registrata su `rischio-sicurezza-se`: 2 file, 1 trovato.

> ⏰ **23/8 11:50 — La data zero è il 29 agosto, non il 29 settembre. Sei giorni, non trentotto.** Correzione di Nicola in chat: «29 agosto» e «va finito tutto quello che ho detto».
>
> **Cosa è cambiato.** Ieri sera avevo registrato il 29 settembre. Oggi Nicola ha corretto: la data è il **29 agosto 2026**. Restano **sei giorni più oggi**. Le quattro cose restano tutte e quattro: i difetti della macchina, i difetti del design del sito, il worker per le botteghe da costruire, il design della parte venditore mai lavorato.
>
> **Il conto vero.** 103 difetti aperti della macchina (più 10 da riverificare) e 208 del design del sito fanno **311 difetti** in sette giorni contando oggi: **44 al giorno**, festivi compresi. Il ritmo misurato finora è **8,4 al giorno**. Cinque volte meno. E le due costruzioni non sono in quel conto.
>
> **Il muro prima di tutto.** Il server è fermo dal 18 agosto alle 06:50. Finché è giù non si alza nessuna cadenza da sola. Un piano a 44 difetti al giorno con la macchina spenta non è un piano. Tre firme moltiplicano tutto il resto. La #168 riaccende il server. La #154 mette le chiavi mancanti su Vercel, quelle che tengono ferma la cassa. La #155 sposta il dominio, che punta ancora al server vecchio.
>
> **Cosa non ho verificato.** Il conto dei difetti l'ho letto dai file del cantiere alle 09:05 di oggi, non ho riaperto i difetti uno per uno. I 208 del design li ha trovati un esame del codice riga per riga. Non so se il server è ancora fermo adesso: l'ultima traccia è del 22 agosto alle 20:41.
>
> **Dettagli tecnici.** Fatto `cantiere.scadenza-zero` aggiornato alle 11:45 con `coerenza-fatti.mjs registra` e la caccia sul valore vecchio. Guardiano verde, exit 0 su 1310 file vivi. Piano dei sei giorni in `MyCity-Vault/90-Memoria-AI/PIANO-29-AGOSTO.md`.

> 🎨 **22/8 16:05 — Radiografia del design: 208 problemi veri, e due impediscono di caricare le foto.** Richiesta di Nicola in chat: «ora fai la radiografia del design».
>
> **Il conto.** Undici dimensioni in sola lettura sul ramo principale del sito, ognuna con un senior che cerca e un secondo che smonta: **208 problemi confermati** — 2 bloccanti, 86 gravi, 120 minori. Di questi 205 chiedono di toccare il codice, 3 si risolvono dai contenuti configurabili senza ripubblicare.
>
> **I due bloccanti hanno la stessa radice.** Il magazzino delle immagini accetta un file solo se la **prima cartella** del percorso è l'identificativo di chi carica (per gli amministratori c'è una sola eccezione, la cartella `home`). Tre punti del sito caricano invece in cartelle che si chiamano `store-media`, `events` e `shop`: il magazzino li rifiuta. Risultato: **un negoziante non riesce a mettere la copertina alla sua vetrina**, e dall'amministrazione non si caricano le copertine di Eventi e Negozio del mese. Nello stesso progetto ci sono già due file che usano il percorso giusto e lo spiegano nel commento.
>
> **Le gravi che costano di più.** Il carrello con due negozi scrive «Gratis*» sulla spedizione e intanto mette 9,80 € nel totale · le vetrine dicono «spedizione gratuita» mentre su ogni consegna a domicilio si pagano 3 € di «Consegna MyCity» · la scheda prodotto promette «carta o contanti alla consegna» ma la carta alla consegna non esiste · dopo un ordine riuscito il pulsante di conferma torna attivo, quindi **si può ordinare due volte** · carrello e cassa scrivono «Il tuo carrello è vuoto» prima che parta il programma, anche quando è pieno · dopo le 20:00 l'ordine parte con una fascia di consegna già passata · al muro dell'accesso si perdono codice sconto, metodo di pagamento e fascia, e al ritorno il totale è più alto · sul telefono, nella scheda prodotto, **nome e prezzo arrivano dopo** il riquadro del negozio, «Segnala» e la partita IVA · la chat di assistenza esiste ma il cliente non ha nessun modo di aprirla.
>
> **Cosa non ho verificato.** Non ho aperto nessuna pagina in un browser: questa radiografia legge il codice. I conti sui pixel sono calcoli fatti leggendo le classi, con la larghezza del carattere stimata: la direzione è giusta, la cifra esatta va confermata a schermo. Non ho toccato niente — l'audit è in sola lettura, trova e non ripara. Le tre voci «config» non le ho provate sul pannello vero.
>
> **Come.** 22 esperti, nessuno fallito, 11 dimensioni: layout e adattamento · coerenza col marchio · tipografia · accessibilità visiva · stati dell'interfaccia · immagini e media · esperienza da telefono · flussi di acquisto · testi dell'interfaccia · navigazione e gerarchia visiva · velocità percepita. Chi trova non conferma: ogni elenco è passato da un secondo esperto con la regola «nel dubbio scarta». Referto: `consegne/design/2026-08-22-radiografia-design.md`.

> 🧹 **22/8 14:10 — La radiografia del sito è a zero: tutti e centonovantanove i difetti sono chiusi. E dentro gli ultimi novantanove ce n'era uno che minore non era.** Richiesta di Nicola in chat: «risolvi anche i 99 minori».
>
> **Il conto, dall'inizio.** Il 21 agosto la radiografia aveva trovato 199 difetti: 12 bloccanti, 88 gravi, 99 minori. Stamattina alle 9:20 erano chiusi i 100 che pesano. Adesso sono chiusi anche i 99 piccoli. **Aperti: zero.**
>
> **La cosa più grossa non era piccola: la copia notturna del database non partiva più.** Ogni notte alle 02:17 un lavoro copia tutto il database e lo mette al sicuro, cifrato. È la rete che sta sotto a tutto il resto. Il programma che fa la copia si ferma se il database è più recente di lui, e installava «qualunque versione ci sia nel computer di turno»: la sedici. Il database vero — letto oggi con lo strumento di Supabase — gira la **diciassette**. Quindi la copia falliva, e falliva di notte, dove non guarda nessuno. Adesso la versione è scritta dentro il lavoro, con un controllo che lo ferma se il programma installato è quello sbagliato.
>
> **Le altre che si vedono.** ① Nella chat del prodotto al negoziante arrivava il **diario di bordo** dell'assistente («cerco sul web», «ho trovato tre schede simili») invece della risposta. ② Quello che la gente scrive nella **casella di ricerca** partiva così com'era verso il sistema di analisi negli Stati Uniti, email e numeri d'ordine compresi. ③ Nella tua tabella delle coorti il mese in corso mostrava «0%», che si legge «non è tornato nessuno», mentre la verità era «il mese non è ancora finito»: adesso c'è un trattino. ④ Il freno anti-abuso scattava **dopo** il controllo del login, quindi mille tentativi finti facevano mille domande al database prima di prendersi mille rifiuti.
>
> **🔴 Due cose che solo tu puoi fare**, accodate come carte. La prima: aprire Supabase → Settings → Database → Backups e scrivere cosa c'è davvero (che piano, se c'è il ripristino al minuto, quante copie giornaliere). Sono cinque minuti e chiudono quattro righe vuote nel documento del ripristino. La seconda: i **dati del titolare** — nome, indirizzo, partita IVA, PEC — che l'informativa privacy legge da nove variabili mai dichiarate. Adesso sono dichiarate ma vuote, e l'informativa esce col nome generico «MyCity». Vanno messe **prima** di ripubblicare, perché entrano nel sito quando viene ricompilato.
>
> **Il freno che ho lasciato.** Sedici prove nuove in questi ultimi tre lotti, e ognuna diventa rossa se il suo difetto torna. Otto le ho verificate **al contrario**: rimesso il difetto, guardata la prova diventare rossa, rimesso il codice com'era.
>
> **Cosa non ho verificato.** Niente di tutto questo l'ho visto girare in produzione. Non ho mai parlato con l'AI vera: in tutte le prove il modello è finto. Le pagine non le ho viste a schermo, ho letto il codice. E la copia notturna non l'ho vista riuscire: so che la versione adesso è quella giusta, il resto lo dirà stanotte.
>
> **Verificato:** 1136 prove unitarie verdi, 17 file di prova sul database verdi, controllo dei tipi pulito, lint senza errori. Niente in produzione: il lavoro è sul ramo `claude/marketplace-100-difetti-c62gmv` del sito. Referto: `consegne/audit/2026-08-22-marketplace-99-minori.md`.

> 🚚 **22/8 09:56 — Il sito era su Vercel, ma lavorava ancora come se fosse su Render. E due cose che solo tu puoi fare tengono ferma la cassa.** Richiesta di Nicola in chat: «ho cambiato il server da render a vercel, fai un'analisi completa e profonda e cambia tutto quello che c'è da cambiare».
>
> **La differenza che nessuno aveva tradotto.** Su Render c'era **una macchina accesa**, sempre la stessa, con la sua memoria. Su Vercel non c'è una macchina: c'è una funzione che si accende quando arriva qualcuno e si spegne appena ha finito. L'indirizzo era cambiato a luglio, il modo di lavorare no — e quasi tutto quello che ho trovato viene da lì.
>
> **Le cinque cose riparate nel codice del sito.** ① Le funzioni giravano a **Washington** mentre il database sta a **Parigi**: ogni domanda al database attraversava l'Atlantico e tornava, una volta per query. L'ho letto nel registro dei rilasci, campo `regions`: la produzione dice `iad1` (Washington), l'anteprima costruita dal ramo nuovo dice `cdg1` (Parigi) — il prima e il dopo, su due rilasci veri. *(Correzione delle 10:20: prima qui avevo scritto «provato guardando l'intestazione x-vercel-id». Quell'intestazione NON lo prova: il suo primo pezzo segue chi chiama, non dove gira la funzione. Me ne sono accorto chiamando l'anteprima e leggendo iad1 su un rilascio che gira a Parigi. La conclusione non cambia, cambia come si controlla.)* Adesso girano a Parigi, stessa città del database. ② I **lavori periodici** — mandare le email, pagare i negozi, scadere i carrelli — li faceva partire un servizio esterno gratuito, nato perché su Render il cron si pagava a parte. Ora li fa Vercel, che li ha inclusi. ③ Cinque di quelle nove rotte rispondevano **solo al POST**, e Vercel bussa solo in GET: sarebbero partite tutte prendendosi un «metodo non ammesso» — il giro risulta andato, e non ha fatto niente. ④ Nessun lavoro dichiarava **quanto può durare**: oltre il tetto la funzione viene tagliata a metà, senza un errore da nessuna parte. ⑤ Il **freno anti-abuso** contava su una memoria che non esiste più: «dieci tentativi al minuto» adesso sono dieci per ogni copia, e quante copie ci sono lo decide il traffico.
>
> **La cosa più brutta l'ho vista guardando l'HTML che il sito serviva davvero.** Ogni pagina diceva a Google che il suo indirizzo ufficiale è `http://localhost:3000` — il computer di chi sviluppa — e ogni link condiviso mostrava l'anteprima rotta. Il sito rispondeva 200 e sembrava a posto. Ho messo un paracadute nel codice: se l'indirizzo non è configurato, adesso usa quello che Vercel dichiara da solo invece di localhost.
>
> **🔴 Le due cose che il codice non può fare, e sono le più care.** Sono le carte **#154** e **#155**.
>
> La prima: **mancano delle chiavi fra le variabili su Vercel**, e una è quella con cui il sito scrive nel database quando ci avvisa Stripe che un cliente ha pagato. Senza, **un pagamento riuscito non diventa un ordine**. Non è un'ipotesi: nei registri della produzione fra il 18 e il 21 agosto ci sono **70 errori** con dentro il nome di quella chiave.
>
> La seconda: **il dominio `mycity-marketplace.com` punta ancora all'indirizzo di Render** (`216.24.57.1`). Il sito nuovo funziona — l'ho aperto, risponde — ma vive a `mycity-phi.vercel.app`, che non conosce nessuno. Il trasloco è finito, il cartello con l'indirizzo è rimasto sulla porta vecchia. È anche il motivo per cui la sentinella del sito è cieca da 146 giri: sta misurando Render.
>
> **Il freno che ho lasciato.** Una prova nuova diventa rossa se qualcuno aggiunge un lavoro periodico senza agganciarlo a Vercel, se una rotta smette di rispondere al GET (anche solo commentando la riga), o se sparisce la regione o il tetto di durata. Provato rompendo ognuna delle quattro cose, una alla volta, e guardandola diventare rossa.
>
> **Cosa non ho verificato.** Non ho potuto aprire il pannello di Vercel: so che quelle due chiavi mancano perché il sito **si comporta** come se mancassero, non perché ho letto la lista — potrebbero mancarne altre più silenziose. Che `216.24.57.1` sia di Render l'ho dedotto dall'indirizzo pubblico di Render e dalla storia, non da un pannello Render. E non ho aperto nessuna pagina in un browser: le prove sono girate qui.
>
> **Verificato:** 979 prove verdi sul sito, typecheck pulito, lint senza errori, build di produzione riuscita. Memoria coerente, 0 cacce aperte. Niente è andato in produzione: il lavoro è nei due rami `claude/render-to-vercel-migration-hf0nyj`.

> 🔴 **21/8 21:22 — I due bloccanti più cari adesso sono chiusi sul database VERO, non solo nel codice.** Nicola in chat: «fai la 151 e la 152».
>
> **Prima di toccare ho misurato, e non erano teorici.** Sul database di produzione `accumula_rimborso` risultava chiamabile **senza account**, insieme ad altre cinque funzioni potenti. È il numero che il sito sottrae dai guadagni mostrati al negozio. E tutte e tre le funzioni del codice di consegna portavano ancora il confronto che con un valore vuoto non sa dire di no.
>
> **Applicata in tre blocchi, controllando dopo ognuno**, come la carta prometteva. ① I permessi: sei funzioni su sei chiuse a chi non ha l'accesso, il server continua a poterle usare, i numeri di vendita restano visibili a chi ha fatto l'accesso. ② Il codice di consegna: tutte e tre fermano il valore vuoto per nome e usano il confronto che risponde sempre. ③ La funzione nuova che disfa un rimborso quando la banca lo rifiuta, usabile solo dal server.
>
> **Il conto: dieci controlli su dieci verdi**, letti dal database vero dopo l'ultimo blocco.
>
> **La consegna veloce di Pane Quotidiano è accesa.** Nicola ha scelto di accenderla, non di togliere l'interruttore. Una riga sola, da spento ad acceso, e la vetrina pubblica lo vede. Il valore di prima era spento: è la strada del ritorno.
>
> **Dei quindici bloccanti della radiografia di oggi ne resta aperto uno solo**, il rilascio automatico prima dei controlli — carta #141, dove l'ordine dei passi conta.
>
> **Cosa non ho verificato.** Non ho lanciato il file di prova SQL contro la produzione: quel file crea ordini e utenti finti, e non si fa sul database di un'azienda. Ho verificato leggendo i permessi veri e le definizioni vere delle funzioni, che è quello che il file misura. E non ho provato niente dal browser: il sito vero non risponde dal 30 luglio.

> 🔁 **21/8 20:31 — Passaggio lampo, stato identico al giro delle 18:03: 1 ordine (0 pagati), 8 profili, 1 negozio con vetrina, 5 prodotti. Macchina in SOPRAVVIVENZA, quota AI 191% (era 151% alle 16:27).**

> 🔧 **21/8 20:25 — Cantiere chiuso sui difetti che fermano qualcuno: tredici riparati su quindici, ognuno con la sua prova.** Nicola in chat: «ok 148».
>
> **Come li ho chiusi.** Per ogni difetto ho prima scritto una prova che diventa **rossa** finché il difetto c'è. Poi ho riparato. Poi ho guardato la stessa prova diventare verde. Nessuno è chiuso perché «ho cambiato il codice»: è chiuso perché un comando che prima falliva adesso passa.
>
> **I due del database li ho provati dal vivo.** Ho ricostruito lo schema da zero su un database locale, 126 modifiche su 126 applicate. Il codice di consegna a sei cifre si aggirava davvero: mandando un valore vuoto la funzione rispondeva «va bene» e l'ordine risultava consegnato. Adesso quello stesso tentativo viene respinto. Tredici controlli verdi, che senza la riparazione erano nove rossi.
>
> **Cosa ho riparato, in parole semplici.** ① Le funzioni potenti del database non sono più chiamabili senza un account. ② Il codice di consegna vuoto non passa più. ③ Il rimborso con carta adesso riaddebita la quota del negozio, e un rifiuto della banca non blocca più l'ordine per sempre. ④ Il doppio clic al momento di pagare non fa più due ordini. ⑤ Chi annulla un ordine pagato con carta riprende i suoi soldi. ⑥ Il pulsante SOS del fattorino si può premere, e il giro guidato non si apre più mentre stai pagando. ⑦ Chi ha detto no ai cookie non finisce più nel programma di statistiche, e ogni acquisto si conta una volta sola. ⑧ Il riempimento automatico del catalogo non può più toccare i prezzi.
>
> **La promessa di consegna adesso è una sola.** Nicola ha risposto: **30-60 minuti**. Riscritte 36 frasi in 28 file. Tolto il riquadro che al momento di pagare mostrava due tempi diversi. Le pagine spedizioni e domande frequenti adesso dicono la verità: l'ora parte da quando il negozio conferma, dentro l'orario di apertura, e a negozio chiuso parte il giorno dopo.
>
> **I due che restano, e perché.** Il primo sono i due buchi del database: il codice della riparazione è scritto, ma sul sito vero si chiudono solo quando la applichi — è la carta **#152**. Il secondo è il rilascio automatico che parte prima dei controlli: era già in coda come **#141**, e lì l'ordine dei passi conta, quindi non l'ho toccato.
>
> **Cosa non ho verificato.** Non ho aperto nessuna pagina in un browser. Il sito vero risponde ancora 503 da tre settimane (carta #146), quindi nulla di questo è stato provato su produzione. Tutte le prove sono girate qui.
>
> Il lavoro è nella richiesta di unione **#236** del sito, ramo `claude/marketplace-radiografia-design-9kj69c`. Niente è andato in produzione.

> 🌙 **21/8 18:03 — Report della sera. Business invariato, ma è la giornata con più riparazioni fatte sul codice del sito finora: registro difetti da 29 aperti a 3.**
>
> **I 7 numeri chiave** (via MCP Supabase, query diretta 18:02): ordini totali **1** (invariato), ordini pagati **0** (invariato), ultimo ordine 2026-06-24 (annullato, invariato), profili totali **8** (invariato da ieri sera), negozi con vetrina **1** (Pane Quotidiano, invariato), prodotti disponibili **5** (invariato). Stallo North Star **58 giorni**, dentro la pausa concordata fino al 24/8-1/9.
>
> **Il lavoro vero di oggi: cantiere di riparazione sul sito e sulla sicurezza.** Chiuse le card `#36` e `#37` (due falle di sicurezza ferme da 23 giorni, verificate risolte sul database vero) e `#140` (migrazione applicata: la vetrina dei negozi era sparita, ora torna a mostrarli). Accesa la prova gratuita in CI che verifica i permessi (card `#139`): ha trovato subito due difetti reali che nessun controllo saltato poteva vedere. Acceso il plugin di metodi di lavoro "superpowers" per la macchina, con un primo errore corretto in giornata.
>
> **Restano da firmare:** `#134` (il database non ha nessuna copia di sicurezza — servono due chiavi) · `#141` (dire ai controlli automatici che il sito lo pubblica Vercel, non più Render) · `#142` (comando da dieci secondi per rendere permanente il lavoro di oggi) · `#137`/`#138`/`#136` dal lotto precedente · la pratica pagamenti di Pane Quotidiano (`#62`), il vero blocco al primo incasso.

> 🔬 **21/8 16:20 — Radiografia completa del sito, codice e grafica insieme: 351 problemi veri, 15 che fermano qualcuno.** Richiesta di Nicola in chat: «fai una radiografia completa e profonda del marketplace, con la parte di design compresa».
>
> **Il conto.** Codice, 13 dimensioni: **199** problemi (12 bloccanti, 88 gravi, 99 minori), contro i 245 del 18 agosto. Grafica e percorsi, 11 dimensioni: **152** (4 bloccanti, 67 gravi, 81 minori). I bloccanti distinti sono **15**, non 16: il pulsante SOS del fattorino è stato trovato da due dimensioni diverse del design.
>
> **La cosa che conta più del numero: i dodici bloccanti del codice NON sono quelli del 18 agosto.** Quelli erano stati chiusi tutti, e il referto delle 3:30 di stamattina lo scrive: zero aperti. Questi sono nuovi, o mai visti dalle prime due visite. La lista si accorcia (262 → 245 → 199) ma il fondo non si svuota.
>
> **I quattro che pesano di più.** ① Chiunque, senza account, può marcare un ordine come «già rimborsato», e quel campo è il sottraendo dei guadagni mostrati al negozio. ② Il codice di consegna a sei cifre si aggira mandando un valore vuoto, e la consegna sblocca bonifico al negozio e paga al fattorino. ③ Un rimborso con carta non riaddebita mai la quota del negozio: la differenza la mette MyCity, e non è il caso raro (il bonifico parte 1 ora dopo la consegna, resi e reclami arrivano dopo). ④ Il pulsante SOS del fattorino è coperto in pieno da quello dell'assistenza: stesse coordinate, stesso livello, e sul telefono non si può premere.
>
> **Prove eseguite da me, non impressioni:** `tsc --noEmit` 0 errori · `vitest run` **943 verdi su 943** (114 file) · `next lint` 0 errori e 95 avvisi, **tutti di accessibilità** (52 etichette scollegate dal loro campo). Nessuna pagina aperta in un browser: tutto è letto nel codice e nel database.
>
> **Difetto della macchina trovato strada facendo:** i sei workflow in `.claude/workflows/` non partono su questo motore, perché hanno gli `import` sopra il blocco `meta`. Le due radiografie sono girate da copie generate al volo con gli stessi mansionari. Registrato come AR-780, non riparato: toccarlo è auto-modifica, quindi firma tua.
>
> **In coda per te:** **#148** (via libera al cantiere sui 15 bloccanti) · **#147** (quale promessa di consegna è vera, 30-60 minuti o 24-48 ore: oggi la home dice una cosa e il resto del sito un'altra).
>
> Referti: `consegne/audit/2026-08-21-radiografia.md` · `consegne/design/2026-08-21-radiografia-design.md`.

> 🔧 **2026-08-25 16:31 — Lotto 61. Nicola ha guardato il diff e ha visto quello che il guardiano non vedeva.**
>
> **In parole semplici.** Nicola ha detto: «secondo me stai facendo delle cavolate perché il diff è
> +22.000 e -15.000». Aveva ragione. Tre registri risultavano riscritti da cima a fondo con dentro le
> stesse identiche cose: le chiavi di 519 voci su 535 solo messe in fila diversa, e l'elenco dei
> difetti riordinato. Circa 12.900 cancellazioni che non cancellavano niente.
>
> **Cosa cambia per te.** La richiesta #835 era illeggibile, e leggerla è il motivo per cui te la
> mando. Rimesso l'ordine, il ramo è passato da +21.002/-14.266 a +8.129/-1.393 senza perdere una
> voce: 803 difetti, 535 lezioni, 805 mutazioni prima e dopo. L'hai unita il 25/8.
>
> Poi il pezzo che conta: **esisteva già un guardiano apposta per questa cosa, ed era verde.**
> `forma-json.mjs` è nato il 30 luglio per i file riscritti tutti per cambiarne una riga.
> Misurava solo l'indentazione. E l'indentazione non era cambiata.
>
> **Per esempio** una lezione qualsiasi del registro. Prima elencava «id, testo, tag». Dopo elencava
> «reparto, fonte, gate». Stessi campi, stessi valori, nemmeno una parola diversa — eppure per git è
> una riga cancellata e una riaggiunta. Moltiplicato per 519 voci su 535.
>
> I modi di riscrivere un file per intero sono tre: l'indentazione, l'ordine delle chiavi, l'ordine
> delle voci. Ne guardava uno, quello del giorno in cui è nato. È AR-813, ed è la lezione di AR-807
> applicata al guardiano scritto per curarla.
>
> **Cosa devi fare.** Guardare la nuova richiesta di unione e dirmi se va bene. Tutto il lavoro resta
> dentro la macchina: non tocca il sito, non muove un euro, non scrive a nessuno.
>
> **Cosa non ho verificato.** Non ho letto il database in questo giro: i numeri qui sopra restano
> quelli misurati il 24 agosto alle 13:05 e non sono una misura di adesso. E non so ancora **cosa**
> abbia rimescolato quelle voci durante la fusione: ho tolto il sintomo e messo il freno che lo
> intercetta, non ho trovato la mano che l'ha fatto.

## Passaggi precedenti

> 🔧 **22/8 20:25 — Lotto 49. Il metro sotto-contava di un terzo, e la macchina lo sapeva.**
>
> **In parole semplici.** Alcuni strumenti con cui la macchina si misura non potevano bocciare
> nessuno. Uno contava nove errori e ne vedeva sei. Un altro promuoveva tutti e centoventi i
> mansionari. Adesso possono dire di no, e infatti lo dicono.
>
> **Cosa cambia per te.** I numeri che leggi nella Cabina sull'apprendimento erano gonfiati: nove
> esperimenti risultavano «misurati» senza essere mai partiti. Adesso dicono il vero. E il metro dei
> mansionari, che ti diceva «120 su 120 a posto», ora te ne segnala 82 da sistemare.
>
> **Cosa devi fare.** Guardare la richiesta di unione e decidere se va bene. Nient'altro: nessuna
> azione sul mondo reale, nessuna spesa, nessun messaggio a nessuno.
>
> **Cosa non ho verificato.** Quante altre prove siano scritte sulla presenza del difetto invece che
> sulla capacità di riconoscerlo. Per contarle serve prima un guardiano che le sappia vedere, e non
> c'è. E il typecheck del Pannello qui non gira: manca l'installazione delle librerie.
>
> ---
>
> Malattia del lotto: **un metro che non può fallire**. Quattro corsie in parallelo più il lavoro
> dell'AD, ognuna coi suoi file, nessuna autorizzata a toccare i registri condivisi.
>
> **Il caso che dà il nome al lotto.** Nel registro degli esperimenti nove schede su dieci dicevano
> «misurato». La loro stessa nota diceva un'altra cosa: che il cancello non era mai partito. Cioè il
> volano contava come imparate delle cose mai successe. Esempio vero: EXP-004 diceva «misurato» e
> sotto scriveva «il post non è mai stato pubblicato».
>
> **La regola per riconoscerli c'è dal 15 agosto, e ha una casa sola.** Ma il programma che doveva
> contarli non la chiamava: se n'era scritta una copia in casa propria. Le due non erano d'accordo.
> La copia ne vedeva **sei**, la casa unica **nove**. Tre esperimenti erano invisibili proprio al metro
> che doveva contarli. E il metro stampava un numero preciso: è così che un errore del genere
> sopravvive. La copia privata è stata cancellata, non corretta.
>
> **Il secondo giro ha trovato il buco vero, e non era nel difetto.** I nove li avevo corretti a mano.
> Il correttore non lo chiamava nessuno nella macchina viva. Riparare la porta a mano e lasciare
> aperta quella automatica è il modo più sicuro di far tornare un difetto da solo. Adesso il guardiano
> degli esperimenti corregge da sé, e **dichiara** quali etichette ha corretto.
>
> **Il metro dei mansionari, prima, promuoveva tutti: 120 su 120.** Contava quattro titoli che il
> modello di partenza garantisce per costruzione. Adesso ne passano **38**. Gli 82 bocciati non sono
> peggiorati stanotte: erano così, e nessuno li poteva vedere.
>
> **Due difetti nuovi, nati guardando.** ① Ci sono prove verdi **solo finché il difetto c'è**:
> pretendono che la bugia sia ancora sul disco. Curarla le fa diventare rosse. Il banco puniva chi
> guarisce. Le tre trovate sono riscritte. ② Il timbro che marca ogni misura scriveva «ho guardato zero
> cose» su chi non dichiarava quanto aveva guardato. La difesa che impedisce a una sessione cieca di
> calpestare i numeri veri del server confronta proprio quel numero: confrontava zeri.

> 🔁 **21/8 16:27 — Passaggio di verifica lampo, stato identico al giro delle 14:40 (nessuna riscrittura pesante: macchina in SOPRAVVIVENZA, quota AI 151%).**


> 🩺 **21/8 16:05 — La macchina è ferma dal 18 mattina, e cinque dei dodici pallini rossi erano guasti miei. Quelli li ho chiusi.**
>
> Nicola manda lo schermo della Cabina: dodici organi rossi. Rifatta la visita dal vivo, i dodici non
> sono dodici problemi: **otto hanno un padre solo**, cioè il server che ha smesso di lavorare
> **lunedì 18 agosto alle 8:55** — settantasette ore senza un giro, un piano del mattino, un report
> della sera. Da qui il server non lo tocco: è la **carta 🔴 #143**, con la diagnosi e i comandi già
> scritti. Quegli otto si spengono da soli quando riparte.
>
> **Gli altri cinque erano difetti di codice, e sono chiusi con una prova che diventa rossa se
> tornano.** ① Il controllo che cerca le chiavi finite nel repo era **spento** da giorni senza dirlo:
> la spazzata dei referti cancellava un file dal disco e lasciava che git continuasse a nominarlo, e
> chi cercava di aprirlo si dichiarava cieco. ② La pubblicazione della memoria si era inceppata:
> **422 rinvii di fila**, tutti verdi, perché l'uscita di sicurezza si spegneva per un solo file di
> codice lasciato a metà — già successo il 30 luglio, 1716 rinvii e 31 ore. Ora l'attesa ha un tetto.
> ③ La macchina non riusciva più a provare sé stessa: la suite ci metteva **822 secondi** contro un
> tetto di 300, perché due prove aspettavano tre minuti a testa un programma già morto. Adesso sono
> **316 secondi, verde**. ④ Il percorso del vecchio PC Windows era **rientrato** nel codice: Nicola
> l'aveva fatto togliere il 4 luglio chiedendo di impedire che riaccadesse, e il guardiano che doveva
> impedirlo non era mai stato scritto. Adesso c'è, e gira a ogni giro. ⑤ Nelle risposte lunghe che
> ti mando mancava quasi sempre il pezzo che dice **di quanto fidarti** — cosa non ho provato. Il
> freno c'era per la chat, non per i messaggi che scrive il server: adesso c'è da tutte e due le
> parti.
>
> **Cosa mi ha corretto il collaudo, e va detto.** La prima stesura del quinto rispondeva «non manca
> niente» anche quando il controllo non era riuscito a partire: un verde regalato. Me l'ha
> contestato un guardiano di casa, non io. Ora dice due cose separate: se ha misurato, e cosa manca.
>
> **La cosa da ricordare:** tre di questi quattro non erano errori, erano **verdi ripetuti** — un
> «riprovo da solo» senza limite. Una macchina che rimanda all'infinito è indistinguibile da una
> macchina ferma.
>
> Referto: `consegne/salute/2026-08-21-1418-claude.md` · ramo `claude/risolvi-tutti-problemi-nddcnp`.

> 🔁 **21/8 14:40 — Giro completo. Business invariato (1 ordine, 0 pagati, stallo dentro la pausa concordata), ma due card di sicurezza da 3 settimane erano già risolte e nessuno l'aveva segnato.**
>
> **I 7 numeri chiave** (via MCP Supabase, query dirette 14:29-14:31): ordini totali **1** (invariato), ordini pagati **0** (invariato), ultimo ordine 2026-06-24 (annullato, invariato), profili totali **8** (▲ da 7 — nuovo il 20/8 15:57, email `nicolarotaru2000@gmail.com`, quasi certamente un account di prova di Nicola stesso, non un cliente reale — nessun negozio nuovo), negozi con vetrina **1** (Pane Quotidiano, invariato), pratica pagamenti Stripe di Pane Quotidiano **ancora tutta spenta** (`charges_enabled`/`payouts_enabled`/`details_submitted` = false, invariato), sensori **9 ok / 3 ciechi per motivo noto** (PostHog spento per scelta, sito 503 per migrazione Vercel, Telegram non configurato — nessuna cecità nuova).
>
> **Il lavoro vero di questo giro: ho riverificato sul database reale, non sulla carta, le tre card di sicurezza aperte dal 29/7** (`#36` pulsante ordini, `#37` 4 falle RLS, `#38` 5 fughe di soldi) per capire se il grande lotto di riparazioni del 20-21/8 (migrazioni 107-124) le avesse già chiuse senza che nessuno lo controllasse. Risultato: **`#36` e `#37` erano già completamente risolte** — le ho chiuse — e **`#38` per due quinti** (compenso rider protetto, coupon restituito dopo checkout abbandonato; restano da verificare nel codice doppia-vendita, payout su spedizione gratis, reclamo che blocca per sempre). Dettaglio tecnico in [[AZIONI-IN-ATTESA]] card #36/#37/#38, esito registrato nel quaderno `@security` (`memoria-squadra/security.md`).
>
> **Perché conta:** senza questa verifica, `CHECKLIST-NICOLA.md` ti avrebbe chiesto ancora la firma su due lavori già fatti — tempo tuo sprecato su un problema che non c'è più. La checklist è stata rigenerata (era ferma dal 17/8, oltre i 2 giorni della regola).
>
> **Restano aperte, invariate:** 7 PR sul repo `ad-mycity` tutte rosse sullo stesso controllo (`test-cervello.mjs`, bloccato anche in questa sessione dai permessi) · card `#62` (pagamenti Pane Quotidiano, il vero blocco al primo incasso) · card `#140/#141/#139/#138/#137/#134/#142` dal lotto del 20-21/8, tutte in attesa di firma.


> 🏁 **21/8 03:30 — Gli ultimi difetti del sito sono chiusi. Da 29 aperti a 3, e tutti e tre sono lavori a metà con un perché scritto.**
>
> Dei ventinove rimasti: **cinque erano già riparati** e nessuno l'aveva segnato (cancellazione account dall'admin, ripartizione dello sconto in contanti, rimborso parziale prima del pagamento, prezzo riletto in cassa, sconto ritiro scritto due volte). **Ventuno chiusi oggi. Tre restano a metà**, e sono difetti che non si chiudono senza qualcosa che non ho: aprire il sito in un browser (83 e 168) o toccare la produzione (229).
>
> **Il difetto nuovo, più grosso di tutti quelli sulla lista: la vetrina dei negozi non mostrava nessun negozio.** Trovato riparando il riquadro della home. La migrazione 108b aveva messo sulla vetrina pubblica i due booleani di stato pagamento — servono al bollino «Verificato». La 112 ha ricreato la vista senza, rimandando alla 114, dove non sono mai arrivati. **Sei pagine li chiedono** (elenco negozi, negozi vicini, pagina negozio, riquadro home, scheda venditore, vetrina home) e il database rifiuta la richiesta intera quando una colonna manca: quelle pagine non ricevevano un negozio senza bollino, **non ricevevano niente**. Riparato nella 124, con controllo SQL che diventa rosso se qualcuno li toglie ancora.
>
> **Le cinque riparazioni sui soldi.** ① Il fattorino non veniva pagato per **nessuna** consegna in contanti: ora trattiene il compenso dall'incasso e rimette il resto. ② Il ritiro in negozio non arrivava mai a «consegnato»: ora lo chiude il venditore col codice del cliente, e sul contante l'ordine finisce in `CASH_IN_STORE` invece di generare un bonifico a un negozio che ha già incassato. ③ Il rimborso divideva per due basi diverse: su un ordine da 50 euro con 20 di credito toglieva al negozio **15 euro invece di 9**, e un ordine coperto per intero da gift card non era rimborsabile affatto. ④ Contestazione vinta: tornava in coda solo il negozio, il fattorino restava «stornato» per sempre — e la chiave di idempotenza avrebbe restituito il bonifico già stornato a entrambi. ⑤ Ordine in contanti da due negozi: gli avvisi partivano dentro il ciclo, quindi il primo negozio riceveva la posta di un ordine poi cancellato.
>
> **Le misure, non le impressioni.** Pagine servite dalla cache: **da 2 a 96 su 203** (misurato con due build vere; la causa era una riga che leggeva la lingua del browser a ogni caricamento). Righe della rotta del webhook: **da 1002 a 178**, gli otto mestieri divisi in `lib/stripe/webhook/`. Colonne nei tipi del database: **da 191 a 740** (il generatore leggeva una sola colonna per istruzione e perdeva `seller_payout_cents`). Prove: **933 verdi** (erano 876), **otto file di controlli SQL**, fra cui uno nuovo che percorre la catena dell'ordine dall'inizio alla fine.
>
> **Restano a Nicola:** **#140** applicare la migrazione 124 (senza, la vetrina resta vuota) · **#141** far partire il rilascio solo a controlli verdi · **#139** un Supabase di prova · più le carte già in coda #137, #134, #136.
>
> Referto: `consegne/audit/2026-08-21-marketplace-ultimi-difetti.md` · ramo `claude/marketplace-bugs-njlgi8`.

> 🎯 **20/8 17:00 — I quattro bloccanti: tre chiusi, uno spento. Restano 29 aperti su 245, un solo bloccante.** Nicola ha risposto a tutti e quattro in chat e ho messo le risposte nel codice (`mycity#229`).
>
> **① Il compenso del fattorino e' 3 euro fissi**, non piu' 2,50 + 1,20 al km. Era il difetto dei soldi: sopra i 30 euro la spedizione e' gratis, restavano solo i 3 euro di fee di consegna, e bastavano fino a **420 metri**. Adesso la fee copre il compenso da sola, sempre. Prova su 6 subtotali per 3 distanze: col vecchio calcolo **15 casi scoperti**, verificato.
>
> **② I fattorini si approvano dal pannello.** La causa vera NON era la bonifica della 114: misurato sul database, i profili seller/rider sono due e Pane Quotidiano e' approvato regolarmente. Il fermo era un fattorino iscritto il **25 maggio** e mai approvato, perche' i pulsanti comparivano solo accanto ai negozi. L'endpoint sapeva gia' farlo. **Il clic resta a Nicola** — carta #137.
>
> **③ Niente partita IVA finta.** Nicola: «non c'e' ancora una partita IVA attiva, la attivo quando raggiungero i 5000 euro; per il responsabile di privacy sono io: Nicolae Rotaru». Le quattro pagine leggono la fonte unica: senza dati veri la riga non si stampa affatto. Il referente non e' dichiarato DPO, perche' quella nomina non c'e'. Il guardiano guardava una porta sola: ora scandisce **ogni pagina del sito** piu' il pie' di pagina.
>
> **④ Il ritiro in negozio e' messo da parte** — l'opzione intera, non il solo sconto, perche' il motivo di Nicola («non ne ho ancora parlato con i negozi») vale per l'opzione e perche' togliendo solo la percentuale il vicolo cieco restava. **Non e' riparato: e' spento.** Il difetto torna il giorno in cui si riaccende, ed e' l'unico bloccante ancora aperto nel registro.
>
> **Conti:** registro 207 riparati · 29 aperti (**1 bloccante**, 15 gravi, 13 minori) · **876 prove verdi** (erano 860) · typecheck pulito · lint 0 errori.
>
> **Restano a Nicola:** #137 (approvare il fattorino), #134 (i due segreti del backup), #136 (una domanda: la spedizione del cliente resta a distanza o diventa fissa?).

> ✅ **20/8 14:40 — Il database vero e' allineato al codice: applicata anche la 123.** Nicola in chat: «applica la 123», dopo aver unito `mycity#228` alle 14:25. Registrata come `presa_ordine_dal_fattorino`. **Prima:** la funzione non c'era, e il codice gia' online la chiamava. **Dopo:** `prendi_ordine` esiste, gira coi permessi del proprietario, ha il percorso di ricerca fissato, e la puo' chiamare solo chi e' entrato — **l'anonimo no**. Provata dal vivo su un utente che non e' un fattorino: risponde `NON_FATTORINO` senza toccare niente.
>
> **Gli otto pezzi del lotto, contati sul database vero:** bacheca senza recapiti ✅ · le due notifiche con la categoria ✅ · tetto sponsorizzati ✅ · sconti in una chiamata ✅ · vetrine per negozio ✅ · **4 chiavi esterne su 4 a `SET NULL`** ✅ · doppio clic in contanti ✅ · presa dell'ordine ✅. La policy del fattorino e' `rider_id = auth.uid()`, cioe' la stretta regge: la falla dei recapiti resta chiusa. L'unico ordine vero e' intatto, zero righe di prova rimaste.
>
> **La carta #135 e' chiusa. Resta una firma sola: #134**, i due segreti del backup. Piu' i quattro bloccanti che aspettano un numero o una scelta di Nicola.

> 🔧 **20/8 13:30 — La migrazione 122 e' applicata al database vero, e ha scoperto un errore mio.** Nicola in chat: «applica la migrazione 122». Applicata a blocchi, uno per uno, con la verifica dopo ognuno (`radiografia_20_agosto_01` … `_07` nel registro Supabase, progetto `clmpyfvpvfjgeviworth`, Postgres 17.6). **Prima:** nessuno dei sette pezzi esisteva, 4 chiavi esterne a `CASCADE`. **Dopo:** vista `ordini_disponibili_rider` creata con 0 colonne sensibili e `anon` escluso · le due funzioni di notifica scrivono `category` · tetto sponsorizzati provato dal vivo, **60 su 65** visualizzazioni e **10 su 20** clic (righe di prova cancellate) · `product_active_discounts` e `store_cards` create, e `store_cards` risponde **4 prodotti su 5 veri** per Pane Quotidiano · **4 chiavi esterne a `SET NULL`, 0 rimaste a `CASCADE`** · `cod_checkout_attempts` creata.
>
> **L'errore:** la stretta sulla lettura degli ordini rompe la **presa dell'ordine da parte del fattorino**. In PostgreSQL anche il `WHERE` di un `UPDATE` passa dalle regole di lettura: su un ordine libero `rider_id` e' vuoto, la riga risulta non sua, l'aggiornamento trova zero righe. Misurato su un database ricostruito dalle migrazioni: **bacheca 1 riga, presa 0 righe**. Il fattorino vede l'ordine e si sente rispondere «gia' preso da un altro». Oggi il danno e' zero (**0 fattorini approvati**, 1 ordine annullato a giugno), diventa reale col primo fattorino.
>
> **Rimedio pronto, non applicato:** migrazione **123** con la funzione fidata `prendi_ordine`, piu' sei controlli nuovi (`06-il-fattorino-prende-l-ordine.test.sql`) rossi senza e verdi con. Richiesta `mycity#228`. Cancelli: **124 migrazioni su 124** da zero, 6 file SQL su 6 verdi, 860 prove verdi, typecheck pulito. Carta **#135** in coda.
>
> **Restano due firme:** #135 (applicare la 123) e #134 (parola d'ordine del backup).

> ✅ **20/8 12:27 — Nicola ha unito tutte e due le richieste.** `mycity#227` (le cento riparazioni, 10 commit) e `ad-mycity#777` (registro, referto, coda). La carta **#132 e' chiusa**. Il marketplace si pubblica da solo a ogni unione su `main` (`autoDeploy: true` in `render.yaml`): il codice nuovo e' **gia' in produzione**.
>
> **Attenzione, uno strascico vero:** la migrazione **122 non e' ancora applicata** al database. Il codice online chiede la vista `ordini_disponibili_rider`, che nel database non esiste: la **bacheca del fattorino resta vuota** e lui vede solo gli ordini che ha gia' preso. Le altre riparazioni della 122 hanno tutte un ripiego verificato nel codice (`store_cards` su `/stores` e `/near`, `product_active_discounts` in `lib/promotions.ts`, `cod_checkout_attempts` nel pagamento alla consegna): funzionano come prima, senza rompersi. Oggi il danno e' zero perche' non c'e' nessun ordine da prendere; diventa un problema al primo ordine vero. La carta **#133 e' salita di urgenza** ed e' stata riscritta con questa conseguenza dentro.
>
> **Restano due firme:** #133 (applicare la 122) e #134 (parola d'ordine del backup).

> 🛠️ **20/8 11:30 — Cento difetti del sito riparati (lotto 2 sul referto del 18 agosto).** Richiesta di Nicola in chat: «risolvi 100 difetti del marketplace nel modo migliore ed efficiente che riesci». Gli aperti passano da **141 a 32** (4 bloccanti, 15 gravi, 13 minori). Otto dei 141 erano gia' a posto dal lotto del 19: verificati nel codice, marcati `gia_riparato_prima`, non ricontati. Ramo `claude/marketplace-100-bugs-jpl7hw` sul repo del marketplace, 10 commit. Cancelli: `tsc` pulito · `next lint` 0 errori (95 avvisi a11y preesistenti, erano 96) · **860 prove verdi su 860** (erano 800) · schema ricostruito da zero su Postgres 16, **123 migrazioni su 123** applicate · 5 file di controlli SQL verdi, fra cui uno nuovo che diventa **rosso senza la migrazione 122** (il fattorino legge il telefono di un ordine non suo). Referto: `consegne/audit/2026-08-20-marketplace-100-riparazioni.md`. **Tre firme accodate:** #132 (unire la richiesta), #133 (applicare la 122 — azione separata dal merge), #134 (parola d'ordine del backup: senza, da stanotte il backup non parte, per scelta). I 4 bloccanti che restano aspettano un numero o un dato di Nicola, non codice.
>
> **Il business e' invariato** e non e' stato ri-misurato in questo passaggio: questo e' un lotto di riparazioni sul codice, non un giro. Vale l'ultima misura sotto.

> 🔁 **18/8 06:41 — Giro richiesto in chat, 11 minuti dopo il passaggio 06:30. Riverificato dal vivo (SQL diretto `orders`/`profiles` + `verifica-sensori.mjs` + `coerenza-fatti.mjs` + `ci-stato.mjs`): stato bit-per-bit identico.** `orders`: 1 riga, 0 pagati, ultimo 2026-06-24 (annullato) — stallo North Star 55 giorni, dentro la pausa concordata fino al 24/8-1/9. Pane Quotidiano: `charges_enabled`/`payouts_enabled`/`details_submitted` ancora tutti `false`. Stesse 6 PR rosse per colpa propria (#761/#754/#753/#749/#741/#735). `coerenza-fatti.mjs` ✅ 39 fatti, 0 cacce. `test-cervello.mjs` bloccato dall'allowlist di sessione (card #104/#42), non ritentato oltre un colpo. Nessuna riscrittura dei JSON pesanti (freschi da 11 minuti, dati identici), nessun sub-agente lanciato: disciplina RISPARMIO, coerente col vincolo North Star.
>
> **Mossa n.1, invariata.** Coda in ordine di età/impatto: **#62/#116** (pratica pagamenti Pane Quotidiano — il vero blocco al 1° ordine pagato) · **#104/#42** (permessi VPS che sbloccano gli script diagnostici da qui) · **#36/#37/#38** (sicurezza/marketplace, 20+ giorni) · **#92** (radiografia completa arretrata, >10gg) · **6 PR croniche rosse** (#761/#754/#753/#749/#741/#735, stesso pattern test-del-cervello) · domande aperte senza risposta: #113 (letargo), #117 (ritmo dei giri), #121 (esperimenti), #105 (margine test-cervello), #109 (come riparare le PR croniche) — non le riformulo di nuovo qui.

> 🔁 **18/8 06:30 — Giro completo (`cervello/giro.md`) richiesto in chat/sessione, dopo il ritmo del mattino (06:12). Business riverificato dal vivo con query SQL dirette: invariato.**
> `orders`: 1 riga totale, 0 pagati, 0 negli ultimi 7gg, ultimo ordine 2026-06-24 08:28 (stesso ordine annullato, mai un ordine vero) — stallo North Star **55 giorni**, dentro la pausa concordata fino al 24/8-1/9. `profiles`: 7, di cui 1 solo con `store_name` (Pane Quotidiano), pratica pagamenti Stripe ancora tutta spenta (`stripe_charges_enabled`/`stripe_payouts_enabled`/`stripe_details_submitted` = false) — nessun negozio nuovo, nessun movimento sul vero blocco. Sensori tutti verdi (`verifica-sensori.mjs`, 06:27) salvo i due cronici noti (sito 503 per migrazione Vercel, PostHog spento su tua decisione). `coerenza-fatti.mjs` ✅ 39 fatti, 0 cacce aperte. `ci-stato.mjs`: **6 PR aperte, 6 rosse per colpa propria** (nuova da stanotte: #761, memoria — si aggiunge a #754/#753/#749/#741/#735). Livello letargo **migliorato a RISPARMIO** (era SOPRAVVIVENZA ieri sera 16:35), quota AI **26%** della finestra rolling (era 288%) — sessione fresca, salute macchina 4/100 invariata, cassa Stripe disponibile €0. `sonda-volano.mjs` e `north-star-check.mjs --gate` restano bloccati dall'allowlist in questa sessione (stesso buco della card #104/#42) — non ritentati oltre un colpo. Nessuna azione nuova accodata: lo stato business è identico a ieri sera e le proposte già in coda restano valide senza bisogno di essere ripetute.
>
> **Mossa n.1, invariata.** Coda in ordine di età/impatto: **#62/#116** (pratica pagamenti Pane Quotidiano — il vero blocco al 1° ordine pagato) · **#104/#42** (permessi VPS che sbloccano gli script diagnostici da qui) · **#36/#37/#38** (sicurezza/marketplace, 20+ giorni) · **#92** (radiografia completa arretrata, >10gg) · **6 PR croniche rosse** (#761/#754/#753/#749/#741/#735, stesso pattern test-del-cervello) · domande aperte senza risposta: #113 (letargo), #117 (ritmo dei giri), #121 (esperimenti), #105 (margine test-cervello), #109 (come riparare le PR croniche).

> 🔁 **17/8 16:35 — Giro completo richiesto in chat (nuova sessione), ~2 ore dopo il passaggio 14:28. Business riverificato dal vivo con query SQL dirette: invariato.**
> `orders`: 1 riga totale, 0 pagati, 0 negli ultimi 7gg, ultimo ordine 2026-06-24 08:28 (stesso ordine annullato, mai un ordine vero) — stallo North Star **54 giorni**, dentro la pausa concordata fino al 24/8-1/9. `profiles`: 7, di cui 1 solo con `store_name` (Pane Quotidiano) — nessun negozio nuovo. In questa sessione gli script diagnostici **funzionano di nuovo in parte**: `verifica-sensori.mjs` (REST/Stripe/Resend/n8n/Pannello ok, PostHog spento per scelta, sito 503 noto, Telegram assente), `coerenza-fatti.mjs` (✅ 39 fatti, 0 cacce aperte), `ci-stato.mjs` (5 PR aperte, tutte e 5 rosse per colpa propria: #754/#753/#749/#741/#735, tutte falliscono anche su "test-del-cervello") sono girati senza blocco. Restano invece bloccati (stesso buco delle card #104/#42, ancora aperte): `test-cervello.mjs`, `freschezza-intelligence.mjs` — non posso confermarli dal vivo, solo dedurli dal segnale indiretto di `ci-stato.mjs`. **Novità vera del passaggio:** il controllo TEST (`test-cervello.mjs`) è appena entrato nell'elenco dei "cronici" (rosso da 3 giri, AR-687) — accodata la card **#119**, unica card mancante tra i 10 controlli cronici segnalati (gli altri 9 hanno già una card: #93/#94/#95/#96/#97/#99/#101/#113/#116). Livello letargo **peggiorato a SOPRAVVIVENZA** (era RISPARMIO alla card #113 di 3 giri fa; quota AI 288% della finestra rolling), salute macchina 4/100, cassa Stripe disponibile €0. Nessuna riscrittura dei JSON pesanti già freschi (16:28-16:29, dati identici), nessun sub-agente lanciato, nessun nuovo lavoro sulla macchina — coerente col vincolo north-star.
>
> **Sulla domanda di ritmo (card #117, ~26 passaggi ieri sera):** non la ripropongo una seconda volta nei file — resta lì, in attesa della tua risposta quando vuoi darla. La segnalo di nuovo solo in chat, non qui.
>
> **Mossa n.1, invariata.** Coda in ordine di età/impatto: **#104/#74/#42** (le righe di permesso mancanti — sbloccano test-cervello, gate-veri, sonda-volano, freschezza-intelligence da qui) · **#36/#37/#38** (sicurezza/marketplace, 19+ giorni) · **#62/#116** (pratica pagamenti Pane Quotidiano — il vero blocco al 1° ordine pagato) · **5 PR croniche rosse** (#754/#753/#749/#741/#735, tutte con lo stesso sintomo test-cervello) · **#118** (merge PR #753, in attesa firma).

> 🔁 **17/8 14:28 — Giro completo richiesto in chat, ~23 minuti dopo l'ultima verifica automatica (14:05/14:26). Business riverificato dal vivo via query SQL dirette: invariato.**
> `orders`: 1 riga totale, 0 pagati, ultimo ordine 2026-06-24 08:28 — stallo North Star **54+ giorni**, dentro la pausa concordata fino al 24/8-1/9. `profiles` con `store_name`: solo Pane Quotidiano, Stripe ancora tutto spento (`charges_enabled`/`payouts_enabled`/`details_submitted` = false, come al 10/8). Nessun nuovo negozio in DB. `delta-gate.json` conferma indipendentemente: firma identica alla baseline, 0 giri saltati. Livello letargo **SOPRAVVIVENZA** (quota AI 278% all'ultima lettura, salute macchina 4) e con `test-cervello.mjs`/`coerenza-fatti.mjs`/gli altri script diagnostici bloccati in questa sessione dall'allowlist di `.claude/settings.local.json` (stesso buco delle card #104/#74/#42, aperte da 5-12 giorni), applico la disciplina già in uso da ~42 passaggi oggi: verifica live sì, nessuna riscrittura dei JSON pesanti già freschi (14:26), nessun sub-agente, nessun nuovo lavoro sulla macchina — coerente col vincolo north-star ("solo azioni verso il 1° ordine pagato").
>
> **Ripeto un'ultima volta, senza riformularla ancora nei file automatici, la domanda posta ~6 volte oggi (10:22, 10:39, 11:08, 11:25, 12:42) e mai risposta:** vuoi che continui a rieseguire un giro completo ogni volta che viene chiesto in chat a pochi minuti di distanza, anche quando la verifica dal vivo conferma stato identico? Oppure preferisci un intervallo minimo (es. non ripetere se l'ultima verifica ha meno di N minuti ed è invariata)? Non è un problema tecnico: è una scelta di ritmo che spetta a te.
>
> **Mossa n.1, invariata.** Coda ferma, in ordine di età: **#108** (sblocco server, 19+ ore, serve VPS) · **#104/#74/#42** (le 5 righe Write→Edit in `.claude/settings.local.json` che bloccano gli script diagnostici da qui, 12+ giorni, serve VPS) · **#36/#37/#38** (sicurezza/marketplace, 19+ giorni) · **#62/#116** (pratica pagamenti Pane Quotidiano — il vero blocco al 1° ordine pagato) · **#118** (comunicato stampa, aspetta 2 citazioni vere da Nicola). Nessuna di queste si sblocca con altra analisi: servono solo le tue azioni/risposte sopra elencate.

> 🔎 **17/8 14:05 — PLAYBOOK Intelligence settimanale (17-23/8): trovato un circuito welfare aziendale locale già attivo a Piacenza.**
> "Piacenza Pay" (gestito da 360Welfare + Confindustria/Confapi/Confesercenti/Confcommercio Piacenza, presentato 9/10/2025) fa arrivare ai negozi i buoni pasto/welfare dei dipendenti — gratis per il negozio, adesione via piacenzapay@360welfare.it. È lo stesso meccanismo che `CONTESTO_BUSINESS.md` §5 chiama "il fossato competitivo" di MyCity (welfare aziendale, previsto per la Fase 2). Doppia lettura: **opportunità immediata** (Pane Quotidiano potrebbe aderirci oggi, indipendente da MyCity — card 🟡 **#120** accodata) e **rischio strategico** da tenere a mente per quando si costruirà il segmento welfare (novembre, §6): a Piacenza quel pezzo è già presidiato da un attore nazionale specializzato. Aggiunto anche un secondo fatto verificato (istruttoria Antitrust 6/5/2026 su Glovo/Deliveroo per messaggi ingannevoli sui rider) a rinforzo dell'argomento di pitch già pronto. Dettaglio completo, fonti e confidenza: `Briefing/2026-08-17-intelligence.md`. Nessuna azione business eseguita oggi: negozi in pausa fino al 24/8-1/9, coerente col vincolo Nicola.

> 🔁 **17/8 12:42 — Giro completo richiesto in chat, 14 minuti dopo il passaggio 12:28. Business invariato. È il ~41° passaggio odierno sullo stesso stato.**
> Riverificato dal vivo: `verifica-sensori.mjs` (REST ok, 1 ordine, mcp_stripe cieco da 3 giri — non blocca), `coerenza-fatti.mjs` (✅ coerente, 38 fatti, 0 cacce), `ci-stato.mjs` (stesse 3 PR rosse per colpa propria #749/#741/#735). Nulla di nuovo rispetto al passaggio 12:28: niente riscrittura dei JSON pesanti di `auto-coscienza/` (dati identici, scritti minuti fa), nessun sub-agente, nessun radar/analista/intelligence lanciato — per disciplina SOPRAVVIVENZA. Livello LETARGO: **SOPRAVVIVENZA**, quota AI **236%** — nuovo record di oggi (era 206% alle 12:28), salute macchina 4/40.
>
> **Segnalo di nuovo a Nicola in chat (non nei file, per non ripetere una domanda senza risposta):** questo è il ~41° giro completo richiesto oggi sullo stesso stato di business invariato dal 24/6, a distanza di 8-20 minuti l'uno dall'altro. Ogni passaggio, anche ridotto al nucleo vitale, consuma quota AI — ora al 236% della finestra. Propongo a Nicola di decidere se continuare così o darmi un intervallo minimo tra un giro completo e l'altro quando lo stato è verificato identico.
>
> **Mossa n.1, invariata.** Coda: **#62/#116** (pratica pagamenti Pane Quotidiano, il vero blocco), le 3 card 🔴 di sicurezza/marketplace (#36/#37/#38, 19+ giorni), **#108** (sblocco server, pending Nicola), **#104** (permessi jolly), 3 PR croniche rosse.

> 🔁 **17/8 12:28 — Giro richiesto in chat, 20 minuti dopo il passaggio 12:08. Business invariato. È il ~40° passaggio odierno sullo stesso stato.**
> Riverificato dal vivo: sensori ok (REST, Stripe, Resend, n8n, Pannello), sito 503 noto, coerenza-fatti ✅, CI stesse 3 PR rosse (#749/#741/#735). Novità reale: 4 playbook worker (12:15-12:26) hanno girato da soli — controllati uno per uno, nessuno produce azione nuova (Anti-churn e Recupero carrelli: 0 trovato, coerente con negozi_fermi=0/carrelli=null; Dati-come-servizio: nessuna proposta; Fedeltà di rete: ri-accodata la card #116, 6ª volta, stesso gate invariato dal 10/8). Livello letargo SOPRAVVIVENZA, quota AI **206%** — nuovo record di oggi (era 169%). Nessuna riscrittura dei JSON pesanti (freschi da 1-2 minuti), nessun sub-agente. Stallo North Star invariato a 54 giorni, dentro la pausa concordata fino al 24/8-1/9.
>
> **Mossa n.1, invariata.** Coda: **#62/#116** (pratica pagamenti Pane Quotidiano, il vero blocco), le 3 card 🔴 di sicurezza/marketplace (#36/#37/#38, 19+ giorni), **#108** (sblocco server, pending Nicola), **#104** (permessi jolly), 3 PR croniche rosse.

> 🔁 **17/8 12:08 — Giro richiesto in chat, 8 minuti dopo il ritmo di mezzogiorno (12:05). Business invariato. È il ~39° passaggio odierno sullo stesso stato.**
> Riverificato dal vivo. `verifica-sensori.mjs` conferma REST ok, 1 ordine. `coerenza-fatti.mjs` conferma memoria coerente. `ci-stato.mjs` conta 4 PR rosse per colpa propria (#752, #749, #741, #735), invariate. Livello letargo SOPRAVVIVENZA. Quota AI **169%**, la più alta di oggi. Per questo nessuna riscrittura dei JSON pesanti (freschi da 1-2 minuti, dati identici) e nessun sub-agente. Stallo North Star invariato a 54 giorni, dentro la pausa concordata fino al 24/8-1/9.
>
> **Mossa n.1, invariata.** Coda: **#62** (pratica pagamenti Pane Quotidiano, il vero blocco), le 3 card 🔴 di sicurezza/marketplace (#36/#37/#38, 19+ giorni), 4 PR croniche rosse (#752/#749/#741/#735), **#42** (permesso jolly).
>
> **Nota sul collaudo di fine turno (AR-532):** il cancello ha segnalato regressioni su `RITMO.md`, mai toccato in questo turno, e ha contato "67 file" contro una base (`d884a3679d4`) datata 06:42, ore prima dell'inizio di questa sessione. Verificato con `git diff --stat` (senza base, contro HEAD): il contributo reale di questo turno è 4 file, Briefing/2026-08-17.md, questo file, SALA-OPERATIVA.md, più `sensori-cecita.json` riscritto da `verifica-sensori.mjs`. Stesso schema già confermato 48 volte in [[project-cancello-stop-base-commit-vecchio]].

> 🕛 **17/8 12:00 — Punto di mezzogiorno (cadenza ufficiale di ritmo.md).** Riprese le 3 priorità del Piano del mattino (06:05): tutte e tre ancora aperte, nessuna sbloccata (`#108` sblocco server, `#36`/`#37`/`#38` sicurezza 19gg, `#104` permessi 12gg). Business riverificato dal vivo con `verifica-sensori.mjs` (REST, 1 ordine) e `coerenza-fatti.mjs` (✅ coerente): identico al passaggio 11:40, stallo North Star **54 giorni**, dentro la pausa concordata fino al 24/8-1/9. Nessuna correzione di rotta necessaria: nessuna urgenza nuova. Novità minima: il worker ha fatto un altro recupero automatico di scritture pendenti proprio a mezzogiorno (commit `e306d8297`). Blocco completo in [[RITMO]], dettaglio priorità in "Prossime priorità" più sotto.

> 🔁 **17/8 11:40 — Nuova sessione di chat, giro completo. Business riverificato dal vivo, invariato: ~36°-37° passaggio odierno sullo stesso stato.**
> `verifica-sensori.mjs` (REST ok, 1 ordine) + `coerenza-fatti.mjs` (✅ memoria coerente) + `ci-stato.mjs` (stesse 3 PR rosse #749/#741/#735): identico bit-per-bit. **Difetto vero trovato e riparato:** `AUTO-ANALISI.md` era fermo alle 10:22 mentre il suo json gemello era già a 11:25 — desincronizzati, causa del vincolo HARD `freschezza-cadenze` mostrato in apertura sessione. Risincronizzati. Livello letargo: SOPRAVVIVENZA, quota AI **123%** (era 93% alle 11:25) — nessuna riscrittura dei JSON pesanti (freschi, dati identici), nessun sub-agente.
>
> **Non ripropongo per la quinta volta la domanda sul ritmo dei giri nei file automatici** (posta 10:22, 10:39, 11:08, 11:25, mai risposta): la richiamo in chiaro nella risposta a Nicola in chat.
>
> **Mossa n.1, invariata.** Coda: **#62** (pratica pagamenti Pane Quotidiano — il vero blocco), le 3 card 🔴 di sicurezza/marketplace (#36/#37/#38, 19 giorni), le 3 PR croniche rosse (#749/#741/#735), **#42** (permesso jolly).


---

> 📦 **Le voci piu' vecchie sono nell'archivio.** Questo file era arrivato a
> 168.335 caratteri. Sopra i 200.000 il controllo che tiene leggibili
> i testi non riesce a leggerlo intero, quindi su questo file smetteva di
> proteggerlo. Le 34 voci piu' vecchie stanno in
> `MyCity-Vault/90-Memoria-AI/Archivio/STATO-archivio.md`, spostate senza
> riscrivere niente.
