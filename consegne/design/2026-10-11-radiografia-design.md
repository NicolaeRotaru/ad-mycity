---
data: 2026-10-11 23:10
tipo: radiografia-design
fonte_raw: consegne/design/2026-10-11-radiografia-design-raw.json
---

# Il design del sito: 72 difetti di ciò che si vede

**In due righe.** Di ciò che si vede, il più grave sono le foto dei prodotti che rischiano di uscire rotte. Il resto si ripara nel codice, con la card #205.

## In parole semplici

Questa volta il design non ha avuto una radiografia a parte. È stato guardato dentro la radiografia completa del marketplace dell'11 ottobre.

Qui ci sono solo i difetti di ciò che si vede: 72 su 307. Uno è bloccante, 19 sono gravi, 52 minori.

## Cosa cambia per te

Il più grave: le foto dei prodotti rischiano di uscire rotte, se Supabase resta sul piano gratuito. Per esempio, sulla scheda del Pesto Genovese di Pane Quotidiano tutte le foto passano dal servizio a pagamento: senza, il cliente vede un riquadro vuoto. Fra i gravi, metà del logo e il pulsante «Accedi» non si vedono nella testata.

## Cosa devi fare

Niente di diverso dal referto completo: la decisione sul piano di Supabase è nella card #204, il resto lo riparo io con la #205.

## Cosa non ho verificato

Il design l'ho fotografato sul sito acceso in locale, con un database vuoto. Il sito vero in un browser non l'ho visto: la rete di questa sessione lo blocca.

---

## Dettagli tecnici

Il racconto, l'ordine delle riparazioni e il dettaglio di ogni scheda stanno in `consegne/audit/2026-10-11-radiografia.md`.

| | Gravità | Area | Difetto |
|---|---|---|---|
| R8 | bloccante | immagini-media | Le foto di prodotti e negozi rischiano di uscire tutte rotte, perché il sito usa un servizio di Supabase che è solo a pagamento |
| R17 | grave | mobile-pwa | Chrome non trova il file che rende MyCity installabile: su Android l'app non si può mettere in Home |
| R21 | grave | mobile-pwa | Le etichette di spedizione con nome, indirizzo e telefono del cliente restano salvate sul dispositivo del negozio anche dopo l'uscita dall'account |
| R25 | grave | microcopy | L'email di rimborso promette i soldi sul metodo di pagamento entro 5-10 giorni anche a chi ha pagato in contanti e ha ricevuto credito MyCity |
| R30 | grave | microcopy | La pagina d'aiuto dei fattorini promette polizza pagata da noi, compenso a chilometri e bonifici a date fisse che il sito non fa, con un numero d'emergenza finto |
| R32 | grave | mobile-pwa | Se il GPS del fattorino perde il segnale, la pagina dice «posizione spenta» ma continua a mandarla, anche dopo la consegna |
| R35 | grave | accessibilita-visiva | Metà del logo e il pulsante «Accedi» nella testata hanno lo stesso colore dello sfondo e non si vedono |
| R52 | grave | stati-ui | Nel pannello admin rimesse, bonifici, reclami, assistenza e prodotti dicono «non c'è niente» quando in realtà non sono riusciti a leggere |
| R58 | grave | microcopy | Ai negozi diciamo «apri gratis, nessun costo mensile» in sei punti del sito, e poi chiediamo 50 euro al mese |
| R59 | grave | microcopy | Il numero di telefono +39 0523 000000 è finto: sta nella pagina Contatti e come numero d'emergenza dei fattorini |
| R61 | grave | flussi-conversione | Il «Drop del giorno» in home annuncia un prezzo scontato che la cassa non applica, e il codice del «Negozio del mese» può non esistere |
| R63 | grave | microcopy | La pagina Spedizioni mostra prezzi più bassi di quelli che fa pagare la cassa e scrive «gratis» dove si pagano sempre 3 euro di consegna |
| R64 | grave | microcopy | La pagina dell'unico negozio vero e l'errore di cassa offrono il «Ritiro in negozio», ma il servizio è spento |
| R65 | grave | microcopy | Nel carrello diciamo che ogni euro va ai negozi e che la nostra parte è solo la consegna, ma teniamo anche il 10% della merce |
| R66 | grave | microcopy | Ogni pagina promette la consegna in 30-60 minuti, ma in produzione non c'è nessun fattorino approvato |
| R67 | grave | microcopy | Promettiamo 5 euro di benvenuto (e 5 euro con la newsletter) che si tolgono da soli in cassa, ma in cassa non compaiono mai |
| R68 | grave | microcopy | Su ogni scheda prodotto c'è scritto «oppure con carta adesso», ma in produzione la carta non si può usare |
| R73 | grave | microcopy | Nelle schede prodotto vere compaiono «Vegano false», «Biologico true» e «Alt text», e il negozio vede spuntate caselle sbagliate |
| R88 | grave | navigazione-gerarchia | Home, piè di pagina e mappa per Google mettono in mostra categorie vuote: otto su nove non hanno prodotti |
| R89 | grave | stati-ui | La pagina Promozioni va in errore quando non c'è nessuna promozione attiva |
| R99 | minore | immagini-media | Dieci pagine si condividono su WhatsApp e Facebook senza immagine |
| R123 | minore | accessibilita-visiva | Sulla Dichiarazione di accessibilità i link per segnalare un problema si riconoscono solo dal colore |
| R126 | minore | flussi-conversione | Accesso e iscrizione mostrano pulsanti SPID e SMS che non funzionano e una seconda spunta dei Termini |
| R127 | minore | stati-ui | Il carrello scrive «Disponibile, consegna in 30-60 minuti» per prodotti esauriti, tolti o che non riesce a leggere |
| R131 | minore | stati-ui | La cassa vuota sembra una pagina rotta, diversa dal carrello vuoto |
| R133 | minore | flussi-conversione | Nella cassa gli esempi di indirizzo e telefono sono scritti come dati veri e sembrano già compilati |
| R138 | minore | stati-ui | Dopo il clic su «annulla l'iscrizione» si finisce sulla home e non si legge niente, né «fatto» né «non riuscito» |
| R146 | minore | microcopy | La conferma d'ordine non dice quando arriva né quanto pagare in contanti, e a chi ritira in negozio parla di rider |
| R147 | minore | microcopy | Nel buono regalo il nome con l'apostrofo esce con dei codici nell'oggetto: «Maria D&#39;Angelo ti ha regalato» |
| R150 | minore | stati-ui | Eventi e Negozio del mese dicono «non c'è niente» quando in realtà la lettura è fallita |
| R152 | minore | stati-ui | La bacheca del fattorino torna a dire «nessun ordine pronto» quando la lettura degli ordini liberi fallisce |
| R153 | minore | stati-ui | La rubrica indirizzi dice «Indirizzo salvato» anche quando il salvataggio fallisce, e svuota il modulo |
| R154 | minore | stati-ui | Le gift card comprate spariscono dalla pagina se la lettura fallisce: «Nessuna gift card ancora» |
| R155 | minore | stati-ui | Nella pagina notifiche basta un problema di rete per essere mandati alla pagina di accesso |
| R156 | minore | stati-ui | Quando la lettura dei prodotti fallisce, la pagina scrive «0 prodotti» o «Nessun prodotto» sopra il messaggio d'errore |
| R159 | minore | stati-ui | Una lista curata dice «Lista non trovata, forse è stata cancellata» mentre sta ancora caricando o se la rete cade |
| R160 | minore | stati-ui | Dopo cinque codici sbagliati la consegna si blocca per quindici minuti, ma il fattorino legge solo «Verifica fallita» |
| R162 | minore | microcopy | Il fattorino legge che la foto dei contanti è facoltativa, ma sopra i 50 euro la conferma viene rifiutata senza |
| R164 | minore | immagini-media | Il logo del negozio del mese in home torna a essere tagliato a quadrato |
| R165 | minore | immagini-media | L'anteprima di un prodotto condiviso su WhatsApp può restare col prezzo vecchio, o con l'immagine generica, per un anno |
| R171 | minore | flussi-conversione | «Vendi su MyCity» è solo un muro di accesso: niente prezzo, niente vantaggi, nessuna persona da contattare |
| R176 | minore | navigazione-gerarchia | Il menu del negoziante ha quattordici voci, fra cui sponsorizzate a pagamento e storie, per un fornaio solo |
| R179 | minore | stati-ui | Aprire una notifica non la segna come letta: il numerino sul campanello resta finché non si preme «segna tutte» |
| R197 | minore | stati-ui | Se la lettura del codice di consegna salta, il codice sparisce dalla pagina dell'ordine senza avviso e senza nuovo tentativo |
| R200 | minore | navigazione-gerarchia | Nel piè di pagina quattro link portano a stanze vuote: negozio del mese da votare, eventi, liste della community |
| R216 | minore | microcopy | La descrizione del negozio vero comincia a metà frase e promette pane e miele che online non vende |
| R221 | minore | microcopy | Ai negozianti diciamo «zero commissioni» e «apri gratis», poi chiediamo 50 euro al mese più il 10% |
| R222 | minore | microcopy | Al negoziante si mostrano numeri inventati: «i negozi completi vendono 3 volte di più», «i clienti abituali valgono 4 volte di più» |
| R224 | minore | microcopy | Domande frequenti e Spedizioni dicono che a negozio chiuso non si può ordinare, ma la cassa lascia prenotare per domani |
| R225 | minore | microcopy | L'email al negozio dice «accetta entro 15 minuti», ma il sito aspetta almeno tre ore o la fine della fascia |
| R226 | minore | microcopy | La descrizione della home su Google promette cinque reparti che il catalogo non ha |
| R228 | minore | microcopy | La home promette «arriva oggi in 30-60 minuti» anche quando nessun negozio è aperto |
| R229 | minore | microcopy | La pagina Guadagni promette al fattorino un bonus di 2 euro al giorno che nessuno gli paga |
| R230 | minore | microcopy | La scheda prodotto dice che consegna il negozio, i Termini e la cassa dicono MyCity |
| R232 | minore | microcopy | «I più venduti» promette i prodotti che vanno forte questa settimana, ma li ordina per numero di recensioni |
| R271 | minore | mobile-pwa | Il banner «Metti MyCity in schermata Home» non compare mai, su nessun telefono: il contatore delle visite resta fermo a 1 |
| R272 | minore | mobile-pwa | Il controllo contro lo zoom dell'iPhone ha un buco: i campi scritti a 13 pixel sfuggono, e la prova che doveva fermarli non li vede |
| R273 | minore | layout-responsive | Il modulo di recesso dentro i Termini di servizio allarga tutta la pagina sul telefono |
| R274 | minore | mobile-pwa | Quando la sessione scade da sola, il telefono perde le notifiche in silenzio e al nuovo accesso nessuno le riaccende |
| R275 | minore | layout-responsive | Su tablet e computer il fumetto «Dove ti consegniamo?» copre i titoli delle pagine |
| R276 | minore | layout-responsive | Su tablet e telefono girato la ricerca nella testata è così stretta che si legge solo «Ce» |
| R277 | minore | layout-responsive | Sui telefoni Android più diffusi la riga del carrello esce dal riquadro e la pagina scorre di lato |
| R278 | minore | mobile-pwa | Sull'iPhone il menu laterale del negoziante è più alto dello schermo, e «Esci» finisce sotto la barra di Safari o sopra la barra per tornare a Home |
| R290 | minore | microcopy | Accenti scritti con l'apostrofo o mancanti in email e testi per clienti e fattorini: «e' pronto», «citta'», «novita» |
| R291 | minore | microcopy | Gli errori dei moduli controllati dal server arrivano al cliente in inglese, per esempio «String must contain at most 120 character» |
| R292 | minore | stati-ui | Il pulsante per seguire il negozio si presenta con la scritta «Non lo so» mentre carica |
| R293 | minore | microcopy | In tanti punti l'euro è ancora scritto all'inglese: «€12.50», «€0 – €500+», «€ 2,50» |
| R294 | minore | microcopy | Le ore scritte dal server escono nell'ora di Londra: la pagina Stato dice 14:54 quando a Piacenza sono le 16:54 |
| R295 | minore | microcopy | Nell'email «il tuo ordine è pronto» il pulsante dice «Vedi l&#39;ordine» |
| R296 | minore | microcopy | Parole inglesi e da programmatore nell'interfaccia: «Rating minimo» nei filtri, «id_front caricato» al fattorino, errori del GPS in inglese |
| R297 | minore | microcopy | Quando il fornaio segna un prodotto esaurito, la scheda dice «questo prodotto non esiste» invece di «finito per oggi» |
| R298 | minore | microcopy | Un link con un ordinamento sconosciuto mostra il nome tecnico «search.sort…» |
