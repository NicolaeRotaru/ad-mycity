---
tipo: lista per Nicola
data: 2026-11-26 14:25
---

# Le voci che chiedono Nicola

## In parole semplici
Qui stanno i difetti che la macchina non può chiudere da sola: chiedono una tua risposta, una tua scelta o un tuo gesto.
Oggi sono 65 domande, 14 scelte o cose non di codice, e 89 falle riservate (binario privato, non qui).
Per esempio: una scelta di prodotto come «nascondere il riquadro del preventivo dopo l'accettazione».

## Cosa cambia per te
Niente finché non rispondi: queste voci restano aperte, le altre vanno avanti.

## Cosa devi fare
Quando vuoi, rispondi a quelle che ti interessano. Nessuna ferma il lavoro.

## Cosa non ho verificato
Che ogni domanda sia ancora attuale sul codice di oggi.

---

## Dettagli tecnici

### Scelte e non codice (dai riparatori)

- frontend-ux|il cliente legge «il tuo rider» e il negozio legge «cliente» al posto dei nomi, perché le due strade nuove per i nomi non esistono nel database vero
- architettura|il finto clienteavvisi è riscritto in quattro posti e la prova da 1033 righe mescola rotte, notte e una scansione del sorgente
- architettura|ferie salvate con l'editor di prima su 3 giorni o meno: il negozio resta aperto a qualunque ora
- deploy-sre|con il rilascio automatico acceso il ritorno indietro automatico non scatta quasi mai
- frontend-ux|lo scheletro del negozio impedisce il 404 vero sulle pagine dei negozi anche senza lo scheletro della radice
- immagini-media|next.config.js ammette ancora le immagini di placehold.co, che il sito non usa più
- architettura|gli strumenti degli sviluppatori portano altre 19 falle note, 10 alte, ma nessuna arriva al sito
- architettura|da controllare sui dati: un negozio che oggi ha salvato 7 giorni vuoti diventa chiuso sempre appena esce la modifica
- qa-flussi|le prove unitarie montano i componenti con react 18.3.1, ma il sito gira con il react 19.2 di next
- architettura|zod, resend, @sentry/nextjs, minimatch e glob, librerie che vanno nel sito, hanno 10 avvisi pubblici di npm audit (zod alto) che si chiudono solo con aggiornamenti che rompono
- deploy-sre|l'avviso «registratore degli errori acceso solo sul server» resta finché non si rifà il deploy
- microcopy|lo stesso invio del lotto ai rimasto senza risposta dice «scartalo e avviane un altro» a 3 minuti e «chiedi all'assistenza prima di avviarne un altro» a 24 ore
- qa-flussi|una migrazione che aggiunge una colonna non si può consegnare da sola: i tipi generati vanno rigenerati nello stesso commit
- api-backend|una notifica push presa dal giro del cron si perde per sempre se il giro muore prima di mandarla o ridarla

- R13-002 · la regola dei raggi della Card: va decisa prima di migrare 141 riquadri che appartengono ad altre parti del sito
- R13-011 · oggi nessun fattorino iscritto dal sito può essere approvato: aprire /rider/onboarding al fattorino in attesa, oppure togliere «Rider» dall'iscrizione
- R13-010 · il cliente già registrato che vuole fare il fattorino: una strada dal sito o il modulo contatti (la scheda d'aiuto sbagliata è già corretta)

### Prove comuni che chiedono la tua firma (la correzione è pronta, tolta dal ramo)

Una prova comune è un controllo che protegge più riparazioni insieme. Cambiarla chiede la tua firma, quindi la correzione è stata tolta e aspetta te.
- R04-011 · il reso con la nota del negozio: per stare verde la correzione cambia lo scenario della prova comune del reso (correzione nel commit 51fd671b, tolta con 2a477dd2). R04-013 era nello stesso commit: si rifà da sola nel giro dopo.
- R02-011 · l'esito di una recensione accolta parte solo quando la recensione non è più pubblicata: la correzione regge ma cambia una prova comune delle segnalazioni (correzione nel commit daecd9af, tolta con 23c3eb6f).

- R13-013 · la prova comune della schermata d'aiuto: la modifica esatta è nel referto di R13
- R12-002 · l'avvio del lotto del catalogo durante un'applicazione: oggi risponde 200, la correzione lo gira a 409 e cambia un caso della prova comune di R13 (modifica esatta nel referto di R12)

### Domande (campo domanda_per_nicola del registro)

- flussi-conversione|«vendi su mycity» è solo un muro di accesso: niente prezzo, niente vantaggi, nessuna persona da contattare
- navigazione-gerarchia|il menu del negoziante ha quattordici voci, fra cui sponsorizzate a pagamento e storie, per un fornaio solo
- deploy-sre|la copia «notturna» e il controllo «del mattino» partono con sette-otto ore di ritardo
- pagamenti-stripe|con la carta il fattorino viene pagato o no su un ordine rimborsato a seconda dell'orario del rimborso
- pagamenti-stripe|su un rimborso parziale al negozio si toglie una quota sbagliata, anche quando si rimborsa solo la consegna
- pagamenti-stripe|l'email «nuovo ordine» dice al negozio 19 euro, cioè la sua merce più la consegna di mycity, invece dei 15 della sua vendita
- privacy-legale|quando un negozio che ha venduto cancella l'account, partita iva, codice fiscale, ragione sociale e iban si cancellano subito, anche se servono ai conti per dieci anni
- privacy-legale|i termini promettono 30 giorni di preavviso via email prima di ogni modifica, ma la versione nuova è entrata in vigore il giorno stesso e nessuna email esiste
- privacy-legale|le copie notturne del database passano da github, che l'informativa non nomina, e non si dice quanto restano
- privacy-legale|il negozio continua a leggere telefono, indirizzo e note di casa dei clienti di tutti gli ordini passati, per dieci anni
- privacy-legale|le promozioni del negozio mostrano il prezzo barrato senza il prezzo più basso dei trenta giorni prima
- privacy-legale|la copia di sicurezza delle foto tiene per sempre anche quelle che la persona ha fatto cancellare
- privacy-legale|la posizione del fattorino quando preme sos resta salvata per sempre, e l'informativa non ne parla
- qa-flussi|un prodotto caricato da nicola per un negozio va in vendita subito, senza che il negoziante confermi prezzo e allergeni
- qa-flussi|il fattorino resta «online» per sempre: la mattina dopo il sito vende la consegna veloce anche se nessuno è in servizio
- qa-flussi|il negozio sospeso non vede più gli ordini aperti e non li può né preparare né rifiutare
- frontend-ux|il piè di pagina porta a sei profili social che nessuno ha confermato, e il nome non è quello usato dal marchio
- frontend-ux|la cassa non salva l'indirizzo: al secondo ordine il cliente riscrive tutto da capo
- rls-database|punti fedeltà e premio invito restano al cliente anche quando l'ordine viene rimborsato
- qa-flussi|se il cliente non ha il codice di consegna sotto mano, l'ordine non si chiude più: nessuna alternativa e nessun allarme
- privacy-legale|il negozio può mettere qualunque «prezzo pieno» barrato e il sito scrive «risparmi x €», senza guardare il prezzo più basso degli ultimi 30 giorni
- privacy-legale|chi cancella l'account perde il credito mycity senza avviso, anche quando quel credito è il rimborso di un reso o un buono regalo pagato
- privacy-legale|sulla commissione i termini dicono «10% iva esclusa», il codice trattiene il 10% del prezzo lordo, e né commissione né abbonamento vengono mai fatturati al negozio
- privacy-legale|il negozio accetta i termini con una sola spunta: foro di piacenza, limiti di responsabilità e sospensione non sono approvati per iscritto, quindi contro di lui non valgono
- privacy-legale|l'email di conferma d'ordine non è una conferma di contratto: niente prodotti, niente venditore, niente diritto di recesso
- ai-endpoints|due funzioni ai sono pubblicate ma nessuna pagina le usa: la bozza di risposta ai clienti e il riassunto delle recensioni
- pagamenti-stripe|la pagina di pagamento stripe obbliga il cliente a riscrivere tutto l'indirizzo di fatturazione
- pagamenti-stripe|nei resi parziali il negozio restituisce meno di quanto ha incassato su quel prodotto: la differenza la paga mycity
- pagamenti-stripe|se il cliente viene rimborsato dopo la consegna, al fattorino si riprendono i 3 euro senza dirglielo, e la sua pagina guadagni li mostra ancora «in arrivo»
- pagamenti-stripe|se la banca rifiuta un rimborso, il negozio viene pagato di nuovo anche se la merce gli è già tornata
- pagamenti-stripe|il credito mycity si spende solo pagando in contanti: chi paga con carta non può usare il buono regalo
- pagamenti-stripe|un solo metodo di pagamento elettronico: la carta, per scelta scritta nel codice
- privacy-legale|l'informativa non dice ai venditori che dati fiscali e incassi vanno comunicati all'agenzia delle entrate (dac7)
- privacy-legale|la coda delle email non si svuota mai
- qa-flussi|fra «il negozio ha accettato» e «consegnato» il cliente non ha nessuna via d'uscita
- ai-endpoints|un solo venditore può bruciare da solo il budget ai giornaliero di tutto il sito e lasciare gli altri negozi a «riprova domani»
- flussi-conversione|chi sceglie il ritiro in negozio non dice mai a che ora passa
- microcopy|il cambio di lingua è un interruttore finto: il sito accetta la scelta, la salva e poi la ignora
- deploy-sre|il ritorno indietro del rilascio riporta il codice ma non il database
- privacy-legale|l'avviso del bonifico da fare, con dentro l'email del cliente, resta fra le notifiche degli amministratori anche a bonifico pagato, e dal sito non si può cancellare
- qa-flussi|un negozio sospeso con il profilo pubblico acceso: cliente e fattorino non ne vedono più nome e indirizzo
- flussi-conversione|il confine dei 10 km è in linea d'aria, ma la bici va per strada: 10 km in linea d'aria possono essere 12-14 km da pedalare
- architettura|se manca la posizione del negozio o dell'indirizzo, il confine dei 10 km non scatta: l'ordine passa a qualunque distanza
- architettura|il codice «spedizione gratuita» sotto 30 € a negozio fa pagare parte della consegna (1 € su 20 €): il nome promette gratis
- architettura|col codice, sotto 30 € a negozio la piattaforma resta a zero e paga di tasca la commissione stripe di ogni addebito
- pagamenti-stripe|rimborso parziale con la carta prima dei bonifici: a negozio e fattorino va più di quanto resta del pagamento, su ogni spesa fino a 30 € col codice «spedizione gratuita»
- qa-flussi|con una fascia oraria l ordine passa anche senza nessun fattorino approvato: il controllo del fattorino vale solo per la veloce
- pagamenti-stripe|al negozio che si collega a stripe il sito chiede anche il permesso di incassare carte, che con questo schema non gli serve
- privacy-legale|il §4 dei termini dice che la consegna si rifà «come se avessi ordinato solo dai rimasti», ma col codice e il tetto non è così
- pagamenti-stripe|col codice e il tetto la piattaforma paga di tasca sua una parte dei bonifici, e nessuna prova guarda i bonifici dopo un annullo
- privacy-legale|con più negozi, l'ordine rimasto costa di più dopo l'accettazione (frutta da 13 a 15 euro) e il cliente non può tirarsi indietro
- pagamenti-stripe|l'euro torna sul credito prima della scrittura della fascia: se il negozio accetta in quell'istante, un annullo dopo rende 1 € in più
- pagamenti-stripe|se il negozio conferma mentre parte il rimborso, mycity perde 1 € a ogni corsa (scelta dichiarata, avviso agli admin)
- microcopy|la riga dice «il tempo per accettarlo è finito, si sta annullando» mentre l'ordine si può ancora accettare
- pagamenti-stripe|le due rotte accettano ancora le sei fasce di prima che nicola ha tolto
- architettura|per le fasce di domani non conta il ritiro di oggi: lunedì alle 17 «domani · 7:30–9:00» non si offre
- architettura|la cassa accetta un ordine che il negozio deve accettare entro lo stesso minuto
- frontend-ux|l'iscrizione obbliga il fattorino a caricare una sua polizza rc anche se va in bici
- architettura|con un indirizzo senza coordinate il confine dei 5 km non si controlla, e la veloce 30-60 min si vende a qualunque distanza
- architettura|veloce al confine dei 5 km: i 55 minuti contano la linea d'aria, sulla strada (6-7 km, lo dice constants.ts) sono circa 61
- pagamenti-stripe|«cliente assente» annulla e rimborsa con un tocco, senza traccia delle telefonate; il controllo dello stato vive solo nella rotta
- architettura|«ai per i negozi» spenta ferma anche l'ai dei clienti (riassunto recensioni, risposte, ordine da foto)
- api-backend|dopo la 184 il compenso del fattorino parte anche con un reclamo interno aperto: è un cambio non dichiarato nella migrazione
- privacy-legale|l'informativa privacy promette «ti rispondiamo entro un mese»: frase nuova che nicola deve approvare
- api-backend|un negozio storico sospeso senza partita iva non si può più riattivare, se nel profilo non è scritto chi l'aveva approvato

### Nate in questa campagna

