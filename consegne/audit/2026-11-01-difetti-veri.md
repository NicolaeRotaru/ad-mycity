---
data: 2026-11-01 11:47
tipo: elenco
fonte: AD digitale, dal registro del sito ripulito
richiesta: «voglio capire esattamente quanti e quali difetti ci sono davvero» e «fammi l'elenco di tutti i difetti» (Nicola, 1/11)
---

# I difetti veri del sito

**In breve:** i difetti aperti del sito sono 980, senza doppioni: 4 bloccanti, 80 gravi e 896 minori.
**Per te:** qui ci sono i conti per area e i bloccanti e i gravi uno per uno. I minori stanno nel foglio di calcolo.

## In parole semplici

Oggi i difetti aperti del sito sono **980**: 4 bloccanti, 80 gravi e 896 minori.
Sono quelli rimasti dopo aver tolto 73 doppioni e i difetti già riparati nel codice unito.
Un esempio: la fascia vuota nel piede delle pagine, dove c'era la newsletter, era scritta quattro volte con parole diverse. Adesso è una voce sola.
L'elenco intero, minori compresi, sta nel foglio di calcolo con lo stesso nome.

## Cosa cambia per te

Il Pannello mostra lo stesso numero, perché legge lo stesso registro.

## Cosa devi fare

Niente, per adesso. L'elenco serve a vedere dove sta il lavoro che resta.

## Cosa non ho verificato

I minori riparati li ho chiusi dopo un controllo sul codice, senza una prova automatica.
I gravi e i bloccanti invece si chiudono solo con una prova che gira.
Quelli segnati «forse già riparato» restano aperti per questo motivo.

---

## Quanti sono, area per area

| Area | Bloccanti | Gravi | Minori | In tutto |
|---|---:|---:|---:|---:|
| Schermate e usabilità | 0 | 14 | 150 | 164 |
| Struttura del codice | 0 | 1 | 113 | 114 |
| Flussi critici | 0 | 8 | 100 | 108 |
| Testi del sito | 0 | 3 | 86 | 89 |
| Logica del server | 0 | 5 | 78 | 83 |
| Pagamenti e bonifici | 0 | 13 | 65 | 78 |
| Privacy e testi legali | 1 | 6 | 66 | 73 |
| Messa online e affidabilità | 2 | 6 | 29 | 37 |
| Accessi e account | 1 | 6 | 24 | 31 |
| Assistente con l'intelligenza artificiale | 0 | 6 | 24 | 30 |
| Permessi del database | 0 | 4 | 22 | 26 |
| Dati e misure | 0 | 2 | 22 | 24 |
| Accessibilità | 0 | 0 | 24 | 24 |
| Caricamento ed errori a video | 0 | 0 | 21 | 21 |
| Velocità | 0 | 0 | 17 | 17 |
| Percorso d'acquisto | 0 | 1 | 11 | 12 |
| Coerenza del marchio | 0 | 1 | 11 | 12 |
| Telefono e app | 0 | 2 | 7 | 9 |
| Immagini | 0 | 1 | 7 | 8 |
| Navigazione | 0 | 1 | 7 | 8 |
| Impaginazione sui vari schermi | 0 | 0 | 6 | 6 |
| Caratteri | 0 | 0 | 6 | 6 |
| **In tutto** | **4** | **80** | **896** | **980** |

## Bloccanti: 4

### Messa online e affidabilità (2)

1. Ogni unione su main pubblica in produzione senza aspettare la CI
2. Il rilascio non applica le migrazioni

### Accessi e account (1)

1. Falla di sicurezza R7, sicurezza degli accessi: i dettagli solo in chat

### Privacy e testi legali (1)

1. Il sito non dice chi c'è dietro

## Gravi: 80

### Schermate e usabilità (14)

1. Il caricamento dei prodotti da file non legge i file salvati con Excel in italiano
2. Il pulsante SOS apre il 112 solo dopo aver aspettato GPS e rete
3. Lo Storico consegne dice al fattorino che ha guadagnato zero sulle spese sopra i 30 euro
4. L'amministratore approva i fattorini alla cieca
5. Le foto dell'iPhone (HEIC) adesso entrano davvero, ma nessuno le converte
6. In chat il negoziante vede «Utente» al posto del nome di ogni cliente
7. Nella testata le pillole «Ordini», «Consegne» e «Admin» hanno lo stesso colore dello sfondo
8. Se l'ordine viene annullato a GPS acceso, la posizione del fattorino continua a scriversi sull'ordine chiuso
9. Nella testata cuore, messaggi e campanella hanno lo stesso colore dello sfondo e non si vedono
10. La consolle SOS non mostra da quale consegna parte l'allarme
11. La pagina di richiesta reso accetta il ripensamento anche su ordini di pane
12. La fascia scelta in cassa cambia da sola col passare dell'ora e nessuna riga lo dice
13. Il caricamento da file mette in vendita prodotti senza il controllo di foto, descrizione e ingredienti
14. I termini dicono ancora «gestita da mycity» e il modulo di recesso ha come destinatario solo «mycity», senza persona né indirizzo

### Pagamenti e bonifici (13)

1. Il codice sconto di MyCity lo paga il negozio
2. Se il database sbaglia una scrittura durante un pagamento, il sito risponde a Stripe «tutto a posto» e Stripe non riprova più
3. Falla di sicurezza R83, pagamenti: i dettagli solo in chat
4. Se la banca contesta solo una parte del pagamento e MyCity vince, al negozio non torna la parte che gli…
5. Se il cliente viene rimborsato e poi contesta lo stesso pagamento in banca, quando MyCity vince il negozio e il…
6. Dopo un guasto, chiudere il reso con i passi normali registra due volte lo stesso rimborso, e al negozio la…
7. Quando la banca chiede solo informazioni su un pagamento, al negozio vengono ripresi i soldi e non tornano più
8. Se la risposta del database si perde dopo aver prenotato il rimborso dei contanti, l'ordine risulta rimborsato per intero senza…
9. Col codice «Spedizione gratuita», dopo un primo rifiuto che tocca il tetto, il secondo rifiuto non rifà il giro
10. Se insieme alla scrittura sul reso cade anche l'elenco dei rimborsi dell'ordine, «rimborsato» rimborsa la carta una seconda volta
11. Reso con la carta
12. Reso uscito su Stripe con risposta persa, ordine senza altri rimborsi
13. Gli ordini già fermati dal trigger della 063 restano con dispute_status OPEN

### Flussi critici (8)

1. Un fattorino con patente o assicurazione scaduta continua a prendere consegne, e il profilo gli dice solo «In scadenza»
2. Il cliente può scrivere al negozio, ma il negozio non viene mai avvisato e dal suo pannello non vede i messaggi
3. Nessuno vede l'orario di consegna scelto dal cliente
4. Le tre prove automatiche dell'acquisto vero sono vuote
5. Le email «ordine pronto» e «ordine consegnato» in produzione non partono mai
6. «Contatta il rider» chiama il numero del NEGOZIO, non del rider
7. Chiesto il reso, la richiesta sparisce
8. Nell'ultimo giorno di recesso e nel giorno dopo, la pagina fa compilare tutto il reso, IBAN compreso, e poi il…

### Accessi e account (6)

1. Chi chiede la nuova password dal computer e apre l'email dal telefono non riesce a cambiarla, e la pagina non dice perché
2. Falla di sicurezza R14, sicurezza degli accessi: i dettagli solo in chat
3. Falla di sicurezza R15, sicurezza degli accessi: i dettagli solo in chat
4. Il controllo all'ingresso chiude fuori chi aspetta l'approvazione
5. Il tetto di tre secondi del portiere puo bruciare la sessione di un cliente che era regolarmente dentro
6. Il rifiuto non fa partire il cronometro dei 90 giorni

### Assistente con l'intelligenza artificiale (6)

1. Il modello AI che legge le foto e scrive le schede si spegne il 30 novembre
2. Il negoziante chiede in chat di cambiare un prezzo, la chat risponde «Modifiche salvate» e il prezzo resta quello vecchio
3. L'AI può mettere un «prezzo pieno» barrato preso dal mercato, e la pagina mostra uno sconto che il negozio non…
4. Il tetto giornaliero di spesa AI in produzione non è condiviso
5. Se il negoziante spunta «le ho controllate», una lista ingredienti più lunga di 500 caratteri fa fallire la creazione di…
6. Nella chat Assistenza il negoziante approva una descrizione nuova senza poterla leggere, e al primo messaggio l'assistente riscrive tag e…

### Messa online e affidabilità (6)

1. Il controllo che confronta il database vero col codice non si è mai collegato, e il rilascio controllato cadrà sullo stesso indirizzo *(forse già riparato: manca la prova)*
2. Il riquadro «Venduto da» non compare in produzione
3. La regola che dovrebbe fermare il codice rosso esiste su GitHub ma è spenta, non guarda nessun ramo e aspetta…
4. Le foto di prodotti e negozi non sono in nessuna copia di sicurezza
5. Anche la prova mensile di ripristino della copia fallisce senza avvisare nessuno
6. Dopo un ritorno indietro, al rilascio dopo si può tornare di nuovo al rilascio rotto già scartato, e non a…

### Privacy e testi legali (6)

1. Chi vuole scaricare i propri dati o cancellarsi non ha nessuna strada che funzioni in produzione
2. Le segnalazioni di contenuti illeciti finiscono in un archivio che nessuno può aprire
3. Un quindicenne può iscriversi come rider
4. Le copie orfane già nel secchio kyc-docs prima di questa correzione restano
5. La pagina Contatti mostra «Sede
6. La cookie policy ora dice 6 mesi, ma quando il server rinnova la sessione riscrive il cookie di accesso per 400 giorni

### Logica del server (5)

1. L'SOS del fattorino non arriva davvero a nessuno
2. Con la carta, se la scrittura sul reso cade dopo il rimborso, «Rimborsa e chiudi» rimborsa di nuovo
3. L'esito motivato di una segnalazione non arriva né a chi ha segnalato né al venditore (DSA art. 16.5 e 17)
4. Se l'annullamento degli ordini già nati fallisce, la chiave si libera lo stesso e il tocco dopo crea il doppione
5. La funzione che muore fra l'ordine e gli articoli lascia la merce riservata senza nessuno che la liberi

### Permessi del database (4)

1. Il carrello rifiuta il codice di benvenuto a chi ha solo un ordine annullato
2. Un alimento caricato da file va in vendita senza allergeni né ingredienti, e il controllo del database guarda solo gli allergeni
3. La regola per riga della migrazione 001 lascia scrivere i prodotti dal browser, senza traccia ne' controllo di vendibilita'
4. L'approvazione di un negozio non pretende la partita iva, e chi e' gia' approvato non ha nessuna pagina per inserirla

### Testi del sito (3)

1. La pagina d'aiuto dei fattorini promette polizza pagata da noi, compenso a chilometri e bonifici a date fisse che il…
2. Il messaggio del freno promette «puoi annullare senza costi», ma appena il negozio accetta la fascia nuova l annullo non…
3. Il premio invito resta 5 euro di credito vero

### Dati e misure (2)

1. Il cruscotto del negoziante mostra meno soldi di quelli che riceve quando il cliente paga anche col credito MyCity
2. L'indirizzo d'ingresso intero esce dalla porta dei flag, dove il filtro nuovo non arriva

### Telefono e app (2)

1. Chrome non trova il file che rende MyCity installabile
2. Se il GPS del fattorino perde il segnale, la pagina dice «posizione spenta» ma continua a mandarla, anche dopo la consegna

### Coerenza del marchio (1)

1. Il titolo grande della home in produzione viene dal database e dice ancora «arriva a casa in 30-60 min» e «abbigliamento»

### Immagini (1)

1. Le tessere delle categorie in home sono foto d'archivio scritte a mano nel codice

### Navigazione (1)

1. Home, piè di pagina e mappa per Google mettono in mostra categorie vuote

### Percorso d'acquisto (1)

1. Chi abita appena oltre i 10 km, come a Podenzano o Rottofreno, scopre di essere fuori zona solo premendo «Ordina»

### Struttura del codice (1)

1. Due squadre hanno scritto lo stesso modulo di esportazione CSV due volte, e le due copie divergono gia' alla nascita

## Minori: 896

I minori sono tanti, e qui sarebbero mille righe da scorrere.
Stanno tutti nel foglio di calcolo qui accanto, insieme ai gravi e ai bloccanti, coi titoli interi e il file.

## Dettagli tecnici

- Registro: `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`, 2221 voci, aggiornato 2026-11-01 11:46.
- Le falle di sicurezza hanno solo il codice R: i dettagli stanno nel referto privato, mai nel deposito.
