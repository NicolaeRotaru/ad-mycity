---
data: 2026-10-30 00:09
tipo: analisi-esperienza-cliente
fonti:
  - testo delle 11 pagine vere, letto il 2026-10-29 20:15 attraverso Vercel, copiato in consegne/design/2026-10-29-pagine-testo/
  - fotografie delle stesse 11 pagine, telefono 390×844 e computer 1440×900, copiate in consegne/design/2026-10-29-foto-pagine/
  - materiale grezzo delle 14 aree, dei benchmark e dei giudizi a occhio, in consegne/design/2026-10-29-esperienza-cliente-raw.json
  - variabili di produzione su Vercel, solo i nomi, rilette il 2026-10-30 00:25
  - database del sito letto in sola lettura il 2026-10-29 20:13
  - codice del sito, ramo main, commit 0df5557 del 2026-10-29 18:12
  - registro dei fatti, voce consegna.promessa (cambiata la sera del 2026-10-29: vale il registro, il referto non ripete i numeri)
---

# Il sito visto da chi compra: siamo al livello di Amazon e Glovo?

## In parole semplici

**In due righe.** Non ancora. Lo scheletro del sito ha quasi tutti i pezzi dei migliori, ma più della metà sono sotto il loro livello. Quello che il cliente vede oggi è povero, e su consegna, reso e classifiche dice il falso. Le prime mosse costano minuti od ore, e diverse si fanno dal pannello senza toccare il codice.

Mi hai chiesto se il marketplace, visto da chi compra, ha i requisiti di Amazon, eBay, Deliveroo e Glovo. Parlo solo di ciò che il cliente vede e tocca, non della velocità del server. Questo referto serve a dirti cosa c'è, cosa manca e da dove partire.

Ho messo insieme quattro fonti. La prima: 14 analisi, una per area, ognuna rifatta da un collaudatore che doveva smontarla. La seconda: tre ricerche sui migliori, con le fonti. La terza: quattro giudizi a occhio sulle foto delle pagine vere, ricontrollati da uno scettico. La quarta: il codice del sito e il database letto il 29 ottobre alle 20:13.

La risposta è no, non ancora. Su 191 requisiti controllati, 13 sono al livello dei migliori, cioè circa 1 su 15. Altri 112 ci sono ma sotto livello, 14 mancano, 51 oggi fanno danno.

Ho dato due voti, perché il sito ha due facce. Lo scheletro, cioè come è costruito, prende in media 5,3 su 10. Quello che il cliente vede oggi, con 9 prodotti, prende 3,3 su 10.

Un esempio concreto. Giovedì 29 ottobre alle 20:15 il kefir di capra di Pane Quotidiano costa 2,95 €. Nella vetrina del negozio c'è scritto «Chiuso ora» e, subito sotto, «Consegna oggi». In cima alla pagina il sito promette «Consegna in 30-60 min». Il negozio aveva chiuso alle 13.

## Cosa cambia per te

- **Non serve rifare il sito, serve ripararlo.** Su 191 requisiti, 92 dipendono solo da come è costruito, 6 solo dal catalogo, 93 da tutti e due. Aggiungere prodotti, da solo, non basta.
- **Il danno passa quasi sempre dallo scheletro.** Dei 51 requisiti che fanno danno, uno solo dipende soltanto dal catalogo. Per esempio, cancellare il negozio di prova pulisce la vetrina di oggi. Ma il sito non sa ancora distinguere un negozio di prova da uno vero.
- **Le prime mosse sono piccole.** Cancellare il negozio di prova, far leggere il marchio intero, portare la merce in cima: minuti od ore ciascuna.
- **Tutto questo conta solo se la cassa registra gli ordini.** Oggi non lo fa, perché su Vercel manca la chiave del database. L'ho ricontrollato il 30 ottobre alle 00:25: in produzione ci sono 12 impostazioni, e la chiave non c'è. È il passo che viene subito dopo la cancellazione del negozio di prova, nella carta del giorno della chiave. Finché manca, nessuna delle mosse qui sotto porta un ordine.

## Cosa devi fare

Una cosa per prima: lancia il comando che cancella il Panificio Demo, la carta già pronta. Il sì l'hai dato il 27 ottobre alle 15:20, manca solo il comando. Tocca a te perché cancella dati veri.

Poi una conferma, quando vuoi. Vuoi che il cliente nuovo confermi l'ordine con un codice, invece di creare una password? Tocca la registrazione, quindi la firma è tua.

La regola della consegna non te la richiedo: l'hai decisa la sera del 29 ottobre, e sta nel registro dei fatti. Per esempio, un negozio con 15 euro di spesa paga 3 euro con la fascia oraria e 4 con la veloce. Entra nel codice con la sua ondata del sito.

Una cosa da sapere, senza fretta. Il modulo del negozio permette ancora di scegliere «usato» come condizione del prodotto. Il documento di business dice di non costruire mai l'usato. Propongo di togliere quella scelta dal modulo: è una piccola modifica al codice.

Le modifiche dal pannello cambiano la home vera: sono gialle, cioè si fanno e ti avviso subito.

## Cosa non ho verificato

- **Il sito vero non l'ho aperto.** La rete di questa sessione blocca il suo indirizzo. Testi e foto delle 11 pagine sono stati presi attraverso Vercel, il 29 ottobre alle 20:15.
- **Nelle foto il programma della pagina era spento**, cioè il JavaScript. Le file di prodotti, la barra «Aggiungi», il numero sul carrello e le categorie compaiono solo dopo il caricamento: quelle parti le ho ricostruite dal codice.
- **Le foto dei prodotti non si scaricano da qui.** La qualità delle 5 foto di Pane Quotidiano non l'ha vista nessuno.
- **I siti dei concorrenti non si aprono da qui.** I confronti vengono da tre ricerche sul web con le fonti, e dal mestiere. Alcune descrizioni di schermate dei concorrenti vanno ricontrollate a mano.
- **Nessuna prova con persone vere.** Niente telefono vero, niente lettore di schermo. I tocchi contati sono stime fatte leggendo il codice.
- **Il database non l'ho riletto io.** Uso la lettura del 29 ottobre alle 20:13.
- **La cassa l'ho ricontrollata solo dalle impostazioni.** La chiave manca, l'ho visto. Un ordine di prova non l'ho fatto.
- **Non so se il regalo dei 100 punti è già stato spento a mano.** Nel codice del database c'è ancora. La mossa 9 vale solo se è ancora acceso.
- **Lo stesso difetto compare in più aree.** Il marchio dimezzato, per esempio, è contato in quattro aree. I 191 sono controlli, non 191 problemi diversi.

## La pagella

Due voti per ogni area, da 1 a 10. Il voto del **guscio** dice com'è costruito il sito, e vale anche quando ci saranno 50 negozi e 2.000 prodotti. Il voto del **contenuto** dice cosa vede oggi il cliente, con 2 negozi e 9 prodotti.

| Area | Guscio | Contenuto | In una riga |
|---|---|---|---|
| La prima impressione | 5,5 | 3 | Titolo forte e locale. Sul telefono però la prima schermata è solo testo, con promesse di consegna diverse. |
| Muoversi veloce | 5,5 | 3 | Barra in basso e «+» da app vera. Il menu porta a pagine vuote. |
| Trovare le cose | 4,5 | 3 | Buoni i suggerimenti sui prodotti. Non perdona i refusi, e cambiare l'ordine fa sparire prodotti. |
| Le schede nelle liste | 5,5 | 2,5 | Una scheda sola, fatta bene. Mancano formato, prezzo al chilo e quando arriva. |
| La scheda prodotto | 6 | 4 | Da computer somiglia ad Amazon. Sul telefono prezzo e pulsante restano sotto lo schermo. |
| La vetrina del negozio | 5 | 3,5 | Copertina da bottega. A negozio chiuso promette «Consegna oggi», e il costo non c'è. |
| Carrello e cassa | 5 | 4 | Carrello solido. L'ultimo passo chiede registrazione e posta. |
| Fiducia | 5 | 3 | Recensioni solo da chi ha comprato. Ma reso e consegna promessi in modo falso. |
| Voglia di comprare | 5 | 1,5 | Pezzi buoni nel cassetto. Oggi aprono la vetrina prodotti di prova senza foto, con le medaglie. |
| Il vestito visivo | 5,5 | 4 | Colori caldi e caratteri con personalità. Ogni pagina ha i suoi pulsanti e i suoi titoli. |
| Sul telefono | 6 | 4,5 | Base da app vera. Manca la barra col totale del carrello. |
| Dopo l'acquisto | 5 | 2,5 | Il riordino funziona. La home non riconosce chi torna, e a chi si iscrive il sito promette 5 € che la cassa non dà. |
| Sembrare vivo | 4,5 | 2 | Il punto più debole: dai menu, quasi 9 pagine su 10 sono vuote. |
| Chiaro per tutti | 6 | 5 | Moduli fatti bene. Testo spesso piccolo, e «Accedi» invisibile in testata. |
| **Media delle 14 aree** | **5,3** | **3,3** | |

I quattro giudizi a occhio sulle foto vanno nella stessa direzione: 5,5 la rifinitura, 5 la chiarezza, 5 la spinta all'acquisto, 4 la voglia di comprare.

## La risposta alla tua domanda

**Hai tutti i requisiti? No.** I pezzi ci sono quasi tutti, ma pochi sono al livello dei migliori. Ecco come stanno i 191 requisiti controllati.

| Come sta | Quanti | Su 191 |
|---|---|---|
| ✅ Al livello dei migliori | 13 | circa il 7% |
| 🟡 C'è, ma sotto livello | 112 | circa il 59% |
| ⬜ Manca | 14 | circa il 7% |
| 🔴 C'è, ma oggi fa danno | 51 | circa il 27% |
| ⚪ Non verificabile da qui | 1 | i profili social |

**Cosa dipende dal sito e cosa dal catalogo.** È la distinzione che decide chi lavora.

| Dipende da | Requisiti | Di questi fanno danno | Di questi mancano |
|---|---|---|---|
| Solo il guscio, cioè il sito | 92 | 11 | 9 |
| Solo il contenuto, cioè il catalogo | 6 | 1 | 0 |
| Tutti e due | 93 | 39 | 5 |

- **Il guscio** si ripara col codice o col pannello. Per esempio: la scheda che non dice quando arriva, la barra del carrello senza totale, la ricerca che non perdona i refusi. Con 2.000 prodotti resterebbero uguali.
- **Il contenuto** si ripara senza codice, con lavoro in negozio. Per esempio: le foto, il volto del titolare, le prime recensioni.
- **Tutti e due**: le pagine vuote nascono da un catalogo piccolo, ma diventano danno perché il sito le mostra lo stesso.

**Le sei cose che chiedevi, una per una.** Media delle aree che le riguardano.

| La tua domanda | Aree | Guscio | Contenuto |
|---|---|---|---|
| Si capisce subito? | prima impressione, vestito, chiaro per tutti | 5,7 | 4 |
| Ci si muove veloce? | muoversi, ricerca, telefono | 5,3 | 3,5 |
| Ci si fida? | fiducia, sembrare vivo | 4,8 | 2,5 |
| Viene voglia di comprare? | voglia, schede, scheda prodotto, vetrina | 5,4 | 2,9 |
| Si compra senza fatica? | carrello e cassa | 5 | 4 |
| Si torna? | dopo l'acquisto | 5 | 2,5 |

Il punto più debole è la fiducia: 4,8 il guscio e 2,5 il contenuto. Sul contenuto è pari con il ritorno, anche lui a 2,5. Oggi il cliente trova pagine vuote, un negozio di prova e classifiche senza dati dietro. L'area singola più bassa resta la voglia di comprare, con 1,5 sul contenuto.

## Le mosse

Dieci mosse, in ordine di effetto sulla voglia di comprare e sulla velocità. Ognuna è passata per le cinque domande del documento di business:

- quale abitudine cambia
- a chi serve, e cosa incassa nel primo mese
- se rompe un paletto
- se aggiunge fatica
- se si vede in cassa in 2-4 settimane

Le corsie sono quattro: contenuto, pannello, codice, decisione tua.

Le mosse vanno fatte una alla volta, nell'ordine. Tutte insieme sarebbero le «dodici funzioni in parallelo» che il documento di business vieta.

### 1. Cancella il negozio di prova

- **Cosa:** lanciare il comando già pronto che cancella il Panificio Demo, i suoi 4 prodotti e il suo account.
- **Perché:** i suoi 4 prodotti senza foto sono i più recenti del catalogo, pubblicati il 5 settembre. Le file della home li mettono per primi, con la scritta «Foto in arrivo». «Trending ora» dà a tre di loro le medaglie #1, #2 e #3. Sulla sua vetrina si legge «Account DIMOSTRATIVO per test interni».
- **Chi lo fa meglio:** Amazon, Etsy e Glovo tengono i negozi di prova in un ambiente separato, che il cliente non vede mai.
- **Sforzo:** minuti.
- **Corsia:** decisione tua. È rossa, perché cancella dati veri.
- **Le 5 domande:** le passa tutte. Il cliente si fida al primo sguardo, e Pane Quotidiano sale in testa a ogni fila. Nessun paletto, nessuna fatica, si vede dal giorno dopo.

### 2. Metti la merce nella prima schermata

- **Cosa:** dal pannello della home, i prodotti salgono sopra le categorie e il sottotitolo diventa una riga vera. Nel codice, il riquadro del negozio con 3 prodotti si vede anche sul telefono. Sulla scheda prodotto la barra «Aggiungi · 2,95 €» compare subito.
- **Perché:** sul telefono il primo prodotto arriva dopo circa 1.500 punti di scorrimento, quasi due schermate da 844. È una stima fatta dal codice, a pagina caricata. Sulla scheda del kefir il prezzo sta a 970 punti e «Aggiungi al carrello» a 2.277.
- **Chi lo fa meglio:** Amazon da telefono mette prodotti con foto e prezzo subito sotto la ricerca. Glovo apre con categorie e negozi già fotografati.
- **Sforzo:** minuti dal pannello, poche ore di codice.
- **Corsia:** pannello e codice.
- **Le 5 domande:** le passa. Accorcia la strada fino al primo «+», quindi l'effetto in cassa arriva presto.

### 3. Nascondi gli scaffali vuoti e le classifiche finte

- **Cosa:** subito dal pannello, «I più amati · Prodotti che vanno forte» diventa «Appena arrivati dalle botteghe», e si spegne «Trending ora». Nel codice, una regola sola: categorie, voci di menu e tessere compaiono solo se portano a prodotti veri. «Ricerche popolari» diventa «Prova a cercare», con kefir, hummus e pesto.
- **Perché:** in home 5 tessere di categoria su 6 portano a pagine vuote. Dai menu si raggiungono circa 84 pagine, e fra 69 e 73 sono vuote. «Più venduti» promette «quello che va forte questa settimana in città», con 1 ordine in tutta la storia, annullato. «Regali» tiene solo prodotti da 12 € in su, e il più caro del catalogo costa 8,50 €.
- **Chi lo fa meglio:** Glovo mostra solo i reparti che consegnano al tuo indirizzo. Amazon scrive «più venduto» solo dalle vendite vere, Etsy dà «Bestseller» solo dopo un volume di vendite.
- **Sforzo:** minuti dal pannello, qualche giorno di codice.
- **Corsia:** pannello e codice.
- **Le 5 domande:** le passa, a una condizione. Va fatta come un meccanismo solo, non come cinque pezzi separati.
- **Già deciso in parte:** «categorie vuote nascoste» l'hai firmato il 26 ottobre, ed è nel pacchetto della vetrina della seconda ondata del sito. Lì va aggiunto il resto: menu, tessere della home, classifiche. Attenzione all'albero delle categorie più ampio che hai chiesto il 29 ottobre. Senza questa regola, ogni sottocategoria nuova è uno scaffale vuoto in più.

### 4. Fai leggere il marchio intero, e «Accedi»

- **Cosa:** dare il colore bianco al logo e ai due «Accedi» della testata. Poi allargare la prova automatica che controlla i colori della testata, così il difetto non torna.
- **Perché:** su tutte le 11 pagine si legge solo «My». «City» è rosso mattone su fondo rosso mattone. Sul computer sparisce anche «Accedi», e chi è già cliente rischia di premere «Registrati». Era stato trovato l'11 ottobre: è aperto da 18 giorni.
- **Chi lo fa meglio:** Amazon e Glovo hanno il logo con i colori fissati una volta sola. Nessuna regola della pagina lo può cambiare.
- **Sforzo:** minuti, più qualche ora per la prova.
- **Corsia:** codice.
- **Le 5 domande:** le passa tutte.

### 5. Fai confermare l'ordine con un codice, senza uscire dalla cassa

- **Cosa:** quando il cliente nuovo preme «Ordina», scrive la sua email e riceve un codice di 6 cifre, da scrivere nella stessa pagina. Il nome si prende dall'indirizzo appena scritto. In più, due riparazioni da poche ore: chi entra con Google torna in cassa e non in home, e dalla registrazione «Accedi» riporta alla cassa.
- **Perché:** la home promette «Account solo per confermare». Oggi, dalla scheda prodotto, un cliente nuovo fa circa 15 fra tocchi e campi. Riscrive il nome e deve uscire dal sito per aprire la posta. Con 1 ordine in tutta la storia, quasi chiunque compri passa di qui.
- **Chi lo fa meglio:** Uber Eats fa entrare con un codice di 4 cifre, senza password. Etsy e i negozi Shopify fanno comprare come ospite con la sola email.
- **Un numero:** il 19% dei clienti abbandona un ordine perché deve creare un account. Viene da un sondaggio di Baymard su 1.026 adulti statunitensi.
- **Sforzo:** qualche giorno.
- **Corsia:** decisione tua, poi codice. Tocca la registrazione, quindi prima del via guardano @security e @legale-privacy.
- **Le 5 domande:** tocca il paletto «nessun login» del documento di business, ma lo alleggerisce invece di romperlo. Il codice via SMS o WhatsApp costa a messaggio: si decide dopo, a parte.

### 6. Una promessa di consegna sola, e «ordina ora per domani» a negozio chiuso

- **Cosa:** la regola del 29 ottobre l'hai già confermata. Prima la cassa la applica. Poi una frase sola, nata dallo stesso calcolo della cassa, va su striscia, home, piè di pagina, vetrine e anteprime. A negozio chiuso la vetrina dice «Chiuso · ordina ora, arriva domani dalle 9». La scelta dell'orario offre solo fasce in cui il negozio è aperto. La fascia scelta la vede anche il negozio, nell'ordine e nell'email: oggi la legge solo la pagina del fattorino.
- **Perché:** nella prima schermata del telefono il sito dice due volte «30-60 min» e due volte «in giornata». Pane Quotidiano è aperto 38,5 ore su 168: per il 77% del tempo la scheda dice solo «chiuso». Il giovedì mattina la cassa propone da sola le 15-18, quando il negozio è chiuso. Dalle 19:30 di sabato a mezzanotte non si può ordinare per niente.
- **Chi lo fa meglio:** Amazon calcola una data sola e la ripete uguale su scheda, carrello e cassa. Glovo scrive «Chiuso · apre alle 9 · Programma l'ordine».
- **Un numero:** il 41% dei siti mostra la velocità della spedizione invece della data, e chi la legge si blocca a fare il conto. Lo misura Baymard nei test sulla cassa.
- **Sforzo:** qualche giorno, dopo che la regola è entrata nella cassa.
- **Corsia:** codice. Le promesse pubbliche le rilegge @legale-privacy.
- **Le 5 domande:** le passa. Cambia un'abitudine vera, «la sera prenoto la spesa di domattina», e serve subito a panetterie e alimentari. Da controllare con @operations: le consegne in proprio devono coprire la fascia 9-12.

### 7. Metti il volto di chi sta al banco

- **Cosa:** dal pannello, Pane Quotidiano diventa il «Negozio del mese» di novembre, con una foto vera del titolare e due righe sue. Si riscrive anche la descrizione del negozio. Nel codice, la foto del Negozio del mese si vede anche sul telefono.
- **Perché:** oggi il negozio è la sigla «PQ», senza logo, senza storia, senza il nome di una persona. La descrizione comincia con la minuscola e parla di pane e miele, che online non ci sono. È l'unica cosa che Amazon non può copiare, e oggi è vuota.
- **Chi lo fa meglio:** Etsy mette in ogni negozio foto e storia del venditore. Airbnb mette il volto dell'host su ogni annuncio.
- **Sforzo:** mezz'ora in negozio per raccogliere foto e parole, poche ore di codice.
- **Corsia:** contenuto e pannello, più poche ore di codice.
- **Le 5 domande:** le passa se il lavoro lo fa MyCity e il negoziante approva l'anteprima su WhatsApp. Pubblicare foto e nome di una persona vera è rosso: firma tua e consenso scritto del titolare. Punto debole: l'effetto in cassa è indiretto, e va misurato.

### 8. Tieni il totale del carrello sotto il pollice

- **Cosa:** dalla prima aggiunta, una barra fissa sopra le schede in basso: «Carrello · 2 articoli · 5,90 €». Sulla card il «+» diventa «− 1 +».
- **Perché:** oggi, dopo il «+», compare per 2 secondi un avviso in alto, lontano dal pollice e senza totale. Per sapere quanto spendi devi aprire il carrello.
- **Chi lo fa meglio:** Glovo, Deliveroo e Uber Eats tengono in basso «Vedi carrello» col totale. Baymard lo mette nelle sue regole per la spesa online: dopo il primo tocco, «Aggiungi» diventa un selettore della quantità.
- **Sforzo:** qualche giorno.
- **Corsia:** codice.
- **Le 5 domande:** le passa. Quando entrerà la regola nuova della consegna, la stessa barra potrà dire quanto manca perché una spesa piccola non costi 1 euro in più.

### 9. Togli le promesse che il sito non mantiene

- **Cosa:** spegnere i 100 punti regalati a ogni iscritto e l'avviso «Hai €5 di sconto». Togliere l'etichetta «Ritiro in negozio». Sui freschi, al posto di «Reso entro 14 giorni», una garanzia vera da decidere.
- **Perché:** ogni nuovo iscritto riceve «Hai €5 di sconto… si applicano automaticamente al checkout». La cassa però non legge i punti, e la carta che hai firmato il 26 ottobre dice niente regali in euro al lancio. Il ritiro in negozio è spento. La pagina dei resi esclude da sola gli alimentari freschi, come il kefir da frigorifero.
- **Chi lo fa meglio:** Amazon scrive «Non restituibile» su alcuni alimentari e non mostra mai un premio che non paga. Glovo, per il cibo, usa «Problemi con l'ordine», con foto e rimborso.
- **Sforzo:** poche ore per i testi. Spegnere i 100 punti tocca il database.
- **Corsia:** codice, più un comando sul database che firmi tu. La scelta sui regali in euro l'hai già fatta il 26 ottobre. Soldi e database restano rossi, i testi li rilegge @legale-privacy.
- **Le 5 domande:** le passa, e protegge la fiducia. La garanzia sul fresco invece tocca i soldi: chi paga il rimborso, il negozio o MyCity, lo decidi tu.

### 10. Fai condividere prodotti e negozi su WhatsApp

- **Cosa:** un pulsante «Condividi» accanto al cuore sulla scheda prodotto e in cima alla vetrina. Sul telefono apre il menu di condivisione, dal computer apre WhatsApp col testo pronto. Nell'anteprima il prezzo diventa «2,95 €» invece di «€2.95».
- **Perché:** oggi non c'è né sul prodotto né sul negozio. L'anteprima con foto e prezzo è già pronta. WhatsApp è il canale naturale del cittadino, e novembre è la stagione dei regali.
- **Chi lo fa meglio:** Amazon mette l'icona di condivisione sulla foto: due tocchi e sei su WhatsApp. Etsy mette il tasto subito sotto le foto.
- **Sforzo:** poche ore.
- **Corsia:** codice.
- **Le 5 domande:** le passa. A condividere è il cliente, quindi il paletto «WhatsApp mai spam» resta rispettato.

### Cosa ho lasciato fuori dalle dieci, e perché

- **La ricerca che perdona i refusi.** Serve davvero con 2.000 prodotti, oggi con 9 conta poco.
- **L'ordine dei risultati calcolato nel database.** Questo difetto si vede già oggi: «kefir capra» con «Prezzo crescente» dà zero prodotti. Ma la cura cambia una funzione del database, che è rossa. Va in fila subito dopo le dieci.
- **Il box anti-spreco.** È nel piano della fase 1, il ritiro in negozio è spento, e su una spesa piccola la consegna costa quanto il box. Lo decidi tu.
- **L'ordine da regalare, col biglietto scritto in bottega.** Prima va chiesto a Pane Quotidiano se lo scrive lui a mano: è fatica in più per il negoziante.
- **Le collezioni di Natale.** Servono negozi da regalo veri, come enoteche e fiorai. Una pagina non riempie un buco di assortimento.
- **Il prezzo al chilo sulle schede.** È probabilmente un obbligo di legge: prima lo conferma @legale-privacy.
- **La partita IVA di MyCity in fondo a ogni pagina.** Il 20 agosto hai scritto che la apri quando MyCity arriva a 5.000 €. Il documento di business però mette la partita IVA visibile fra i vincoli di legge dell'e-commerce. Quanto rischia chi vende senza mostrarla, lo valuta @legale-privacy.

## Cosa fa già bene

- **Lo stile ha carattere.** Terracotta, crema e senape, titoli in Fraunces: sembra una bottega, non un supermercato. È uguale su tutte le 11 pagine.
- **La scheda prodotto da computer copia lo schema di Amazon.** Foto a sinistra, informazioni al centro, cassa a destra col pulsante giallo.
- **Ogni scheda nelle liste ha un «+» grande quanto un dito.** Aggiunge senza cambiare pagina, come su Glovo.
- **Costo e pagamento si leggono prima del carrello.** Sulla scheda del kefir c'è già «Consegna MyCity 3,00 € per negozio» e «Paghi in contanti alla consegna».
- **La cassa è corta.** Cinque campi, con città e CAP già scritti, e il totale resta fisso in basso.
- **La barra a schede in basso fa sentire un'app.** Ha il numero sul carrello, e sparisce in cassa per non coprire il pulsante.
- **Mentre carica, il sito mostra sagome della forma giusta.** Succede su ricerca, negozio, carrello e cassa, invece di uno schermo bianco.
- **La ricerca suggerisce dopo 2 lettere,** con foto, prezzo e negozio.
- **«Riordina» rilegge i prezzi di oggi** e non raddoppia il carrello al doppio tocco. Oggi in produzione servono 4-5 tocchi dalla scheda «Ordini». Diventano 3 quando la fila «Ordina di nuovo» torna in home.
- **Le recensioni le scrive solo chi ha ricevuto il prodotto.** È una regola più severa di quella di Amazon. L'ho letta nel codice del database, non provata in produzione.
- **Il doppio tocco su «Ordina» non crea due ordini.**
- **Niente stelle vuote, e nessuna promessa di consegna gratis.**

## Area per area

Legenda dello stato: ✅ al livello · 🟡 c'è ma sotto livello · ⬜ manca · 🔴 c'è ma fa danno · ⚪ non verificabile. «Mossa N» rimanda alle mosse qui sopra.

### 1. La prima impressione · guscio 5,5 · contenuto 3

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| In 5 secondi si capisce cos'è e perché conviene | 🟡 | Etsy, Deliveroo | foto del telefono | Tenere il titolo, sottotitolo di una riga |
| Il primo gesto è dire dove sei | 🔴 | Glovo, Deliveroo | codice | Togliere «Mostriamo i negozi che consegnano al tuo CAP»: quel CAP non lo legge nessuno |
| Ricerca sempre in vista | 🟡 | Amazon | codice, foto | A campo vuoto, nomi di prodotti veri |
| Categorie grandi da scorrere col pollice | 🔴 | Glovo | pagina vera | Mossa 3 |
| Merce vera nella prima schermata | 🟡 | Amazon | foto del telefono | Mossa 2 |
| Una sola azione principale | 🟡 | Deliveroo | foto | Un pulsante solo, con un oggetto concreto |
| Prova sociale senza numeri finti | 🔴 | Etsy, Airbnb | codice, database | Mossa 3 |
| Natale e regali a novembre | 🟡 | Amazon, Etsy | codice, database | Banner regali acceso solo con merce da regalo |
| Niente sezioni vuote o in caricamento | 🟡 | Amazon | pagina vera | Togliere i 3 riquadri vuoti della home |
| I volti dei negozianti | 🟡 | Airbnb | codice | Mossa 7 |
| Testata che non ruba lo schermo | ✅ | Amazon | foto misurata | Sul telefono, togliere la striscia che scorre |
| Il marchio si legge intero | 🔴 | Amazon | foto e pixel | Mossa 4 |
| Una promessa di consegna uguale ovunque | 🔴 | Amazon | foto | Mossa 6 |
| Costo di consegna prima del carrello | 🟡 | Glovo | pagina vera | Scriverlo anche in home e in vetrina |
| Niente negozi di prova in vetrina | 🔴 | Etsy | database | Mossa 1 |

### 2. Muoversi veloce · guscio 5,5 · contenuto 3

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Barra fissa in basso col numero sul carrello | ✅ | Glovo | codice, foto | Icona della vetrina per «Negozi» |
| Testata compatta, ricerca a portata | 🟡 | Amazon | foto | Sul telefono resta attaccata solo la ricerca |
| Menu senza voci vuote o doppie | 🔴 | Glovo | codice, pagine vere | Mossa 3 |
| Categorie su due piani, col percorso in alto | 🟡 | Amazon | foto della scheda | Sulla scheda: Home, Alimentari, Latticini |
| Tornando indietro ritrovi lista e filtri | 🟡 | Etsy | codice | Filtri salvati nell'indirizzo anche in categoria |
| Aggiungere senza lasciare la pagina | 🟡 | Uber Eats | codice | Mossa 8 |
| Scorciatoie per chi torna | 🟡 | Amazon | codice | «Visti di recente» anche in home |
| Stesso nome per la stessa cosa | 🔴 | Amazon | pagine vere | Un glossario di 10 parole del sito |
| Nessun vicolo cieco | 🔴 | Etsy | codice | Un modello solo di pagina vuota, con prodotti veri sotto |
| Ricerca che risponde mentre scrivi | 🟡 | Amazon | foto della ricerca | La parola cercata resta nella casella |
| L'indirizzo si dice una volta | 🔴 | Uber Eats | codice | Il CAP scelto riempie già la cassa |
| Cose da comprare nel primo schermo | 🟡 | Amazon | pagina vera | Mossa 2 |
| Primo ordine senza uscire dal sito | 🟡 | Uber Eats | codice | Mossa 5 |
| Comandi da 44 punti | 🟡 | Apple, Google | codice | Quantità della scheda da 36 a 44 punti |

### 3. Trovare le cose · guscio 4,5 · contenuto 3

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Suggerimenti con foto e prezzo | 🟡 | Amazon | codice | Logo e aperto o chiuso sulla riga del negozio |
| Refusi e sinonimi | 🟡 | Amazon, eBay | prova su un database separato | Correttore che lavora parola per parola |
| Ricerche recenti e popolari | 🔴 | Amazon | codice, prova | Mossa 3 |
| Ogni risultato dice negozio e quando arriva | 🟡 | Glovo | codice | Sotto il prezzo, «Consegna oggi» o «domani» |
| Negozi fra i risultati | 🟡 | Glovo | codice | Fila «Negozi che lo vendono» in cima |
| Filtri utili per una città | 🟡 | Amazon | codice, foto | Filtri per negozio e per Bio |
| Nessun filtro porta al vuoto | 🔴 | eBay | pagina vera | Numero accanto a ogni scelta, scelte a zero nascoste |
| Cambiare l'ordine non toglie prodotti | 🔴 | eBay | prova ripetuta fuori produzione | Ordine e filtri dentro la ricerca del database |
| Zero risultati con proposte vere | 🟡 | Amazon | codice | «Forse cercavi» con la parola corretta |
| Cercare dentro un negozio | 🟡 | Deliveroo | codice | Stessa riparazione del database, conta da 200 prodotti in su |
| Filtri comodi sul telefono | 🟡 | Amazon | codice | «Mostra 3 prodotti» scritto sul pulsante |
| La parola cercata resta | 🟡 | eBay | foto | La barra legge la parola dall'indirizzo della pagina |
| Solo negozi veri nei risultati | 🔴 | Etsy | database | Mossa 1 |
| Ricerca nelle parole chiave e nella marca | 🔴 | Amazon | codice | Indicizzare le parole chiave che l'AI del sito scrive già |
| Misura delle ricerche finite a vuoto | 🟡 | grandi marketplace | codice | Registrare il numero giusto di risultati |

### 4. Le schede nelle liste · guscio 5,5 · contenuto 2,5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Foto grande e coerente | 🟡 | Glovo | codice | Prima guardare le 5 foto vere |
| Prezzo che salta all'occhio | 🟡 | Amazon | codice | Prezzo nero più grande, «+» a contorno |
| Formato e prezzo al chilo | ⬜ | Esselunga online | codice, database | «200 g · 14,75 €/kg» sotto il nome |
| Nome su 2 righe | ✅ | Glovo | codice | Niente |
| Da quale negozio viene | 🔴 | Etsy | codice, database | Logo o volto del negozio, iniziali colorate se manca |
| «+» che diventa contatore | 🟡 | Glovo | codice | Mossa 8 |
| Pochi badge, tutti veri | 🟡 | Etsy | codice, database | Bio e DOP sulla scheda, barrato solo con lo storico |
| Esaurito a colpo d'occhio | 🟡 | Amazon | codice | Foto grigia e prodotto in fondo |
| Voto e numero di recensioni | ⬜ | Etsy | codice | Stelle da 3 recensioni in su |
| Due colonne uguali ovunque | 🟡 | Deliveroo | codice, foto | «Trending» e Preferiti sulla griglia unica |
| Una scheda sola in tutto il sito | 🟡 | Amazon | codice | Variante compatta al posto delle 6 fatte a mano |
| Senza foto, mai in vetrina | 🟡 | Amazon | database | Nelle file scelte, solo prodotti fotografati |
| Quando arriva, scritto sulla scheda | ⬜ | Amazon, Glovo | codice | Etichetta «Arriva oggi» o «Domani dalle 9» |
| Titoli di sezione veri | 🔴 | Etsy | codice, database | Mossa 3 |

### 5. La scheda prodotto · guscio 6 · contenuto 4

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Prezzo e «Aggiungi» nella prima schermata | 🟡 | Glovo | foto misurata | Mossa 2 |
| Pulsante attaccato in basso da subito | 🟡 | Deliveroo | codice | Barra visibile dall'apertura |
| Quando arriva, anche a negozio chiuso | 🔴 | Amazon | pagina vera | Mossa 6 |
| Varianti col loro prezzo | 🟡 | Amazon | codice | Bloccare le varianti di peso finché manca il loro prezzo |
| Galleria con zoom e foto vere | 🟡 | Etsy | database | Togliere i 2 doppioni del kefir |
| Allergeni, ingredienti, produttore | 🟡 | supermercati online | pagina vera | Riga «Contiene: latte», dati letti dall'etichetta |
| Chi vende, col suo volto | 🟡 | Etsy | pagina vera | Usare la foto della bottega che c'è già |
| Recensioni, e cosa dire a zero | 🔴 | Amazon | codice | Modulo solo a chi ha ricevuto il prodotto |
| Chiedere al negozio prima di comprare | 🟡 | Amazon | codice | «Chiedi su WhatsApp» col testo già scritto |
| Altro dallo stesso negozio | 🔴 | Glovo | codice | «Altro da Pane Quotidiano, stessa consegna» |
| Reso giusto per quel prodotto | 🔴 | Amazon | pagina vera | Mossa 9 |
| Condividi su WhatsApp | ⬜ | Etsy | codice | Mossa 10 |
| Niente testi tecnici o fuori luogo | 🟡 | Glovo | foto, codice | Via «Condizione: Nuovo» sul cibo e «Non lo so» |
| Conferma chiara dopo «Aggiungi» | 🟡 | Deliveroo | codice | «Vai al carrello» col totale, nella barra in basso |
| Prezzo al chilo accanto al prezzo | ⬜ | Amazon | codice | Quantità netta come numero, conto automatico |
| «Paghi alla consegna» vicino al pulsante | ✅ | Amazon | pagina vera | Una volta sola sul computer |

### 6. La vetrina del negozio · guscio 5 · contenuto 3,5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Copertina, logo e volto | 🟡 | Etsy | foto, codice | Blocco «Chi c'è al banco» sotto il nome |
| Aperto o chiuso adesso, e quando riapre | 🔴 | Google Maps | foto delle 20:15 | Mossa 6 |
| Costo e tempi di consegna in alto | ⬜ | Uber Eats | codice | Riga sotto il nome, calcolata come in cassa |
| Voto del negozio, e cosa mostrare a zero | 🟡 | Uber Eats | pagina vera | Nascondere «Recensioni · 0» |
| Menu del negozio attaccato in alto | ⬜ | Deliveroo | codice, stile di produzione | Subito: il pannello orari che si vede sempre va nascosto davvero |
| Cercare dentro il negozio | ✅ | Glovo | foto | Sotto i 10 prodotti, niente filtri |
| «+» e carrello col totale | 🟡 | Uber Eats | codice | Mossa 8 |
| Storia del negozio e distanza | 🟡 | Google Maps | pagina vera | «A 900 metri da te», col calcolo che esiste già |
| Seguire e condividere | ⬜ | Etsy | codice | «Segui» e «Condividi» in testata |
| Etichette vere | 🔴 | Deliveroo | pagina vera | Mossa 9 |
| Prodotti nella prima schermata | 🟡 | Glovo | foto misurata | Copertina più bassa, etichette su una riga |
| Chiamare o scrivere con un tocco | 🟡 | Google Maps | codice | «Chiama» in testata, WhatsApp se il negozio ce l'ha |
| Arrivare da un link WhatsApp o dal QR | 🟡 | Shopify | codice | «Indietro» porta a «Tutti i negozi» |

### 7. Carrello e cassa · guscio 5 · contenuto 4

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Carrello sempre visibile col totale | 🟡 | Deliveroo | codice | Mossa 8 |
| Costo di consegna prima della cassa | 🟡 | Uber Eats | pagina vera | la vetrina scrive un costo fisso per negozio |
| «Ti mancano X € per evitare il supplemento» | ⬜ | Deliveroo | codice | Insieme alla regola nuova della consegna |
| Cambiare quantità nel carrello | ✅ | Glovo | codice | «Annulla» dopo «Rimuovi» |
| Cassa in una pagina, pochi campi | ✅ | Amazon | codice | Nascondere il codice sconto: i codici sono spenti dal 27 ottobre, e l'esempio «BENVENUTO10» oggi non vale |
| Comprare senza registrazione | 🔴 | Uber Eats | codice | Mossa 5 |
| Indirizzo salvato, zona controllata subito | 🟡 | Glovo | codice | Salvare l'indirizzo al primo ordine |
| Orari solo quando il negozio è aperto | 🔴 | Glovo | codice | Mossa 6 |
| Contanti detti con fiducia | 🟡 | app di consegna | codice | Bottoni «Importo esatto · 10 € · 20 €» |
| Carrello con più negozi | 🟡 | Amazon | codice | Una riga per negozio, con la sua fascia |
| Conferma che dice quando arriva | 🔴 | Amazon | codice | «Arriva domani tra le 9 e le 12, tieni pronti 5,95 €» |
| Errori accanto al campo | 🟡 | Amazon | codice | Rifiuti del server sotto il campo giusto |
| Prezzi uguali fra carrello e cassa | ✅ | Amazon | codice | Niente |
| Pulsante finale con l'importo | ✅ | Amazon | codice | Niente |
| Rassicurazioni vere vicino al pulsante | 🔴 | Amazon | codice | La riga del carrello: «alcuni prodotti sono esclusi» |

### 8. Fiducia · guscio 5 · contenuto 3

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Recensioni, con l'invito dopo la consegna | 🟡 | Deliveroo | codice | Stelle cliccabili nell'email, mai già messe a 5 |
| Volti e storie | 🟡 | Etsy | codice | Mossa 7 |
| Garanzia adatta al fresco | 🔴 | Glovo | pagine vere | Mossa 9 |
| Ragione sociale e partita IVA visibili | 🟡 | eBay | pagina vera | Chiederle al negozio, per MyCity decide il legale |
| Assistenza in un tocco | 🟡 | Glovo | codice | Accendere il WhatsApp già costruito, con un numero vero |
| Promesse coerenti | 🔴 | Glovo | foto | Mossa 6 |
| Niente dati finti | 🔴 | Amazon | database | Mossa 1 |
| Segni di vita solo se veri | 🔴 | Etsy | codice | Via «Spesso comprati insieme» senza acquisti dietro |
| Resi scritti per il cibo | 🟡 | Amazon | pagina vera | In cima due casi: freschi e resto |
| Bollino «verificato» con un senso | 🟡 | Airbnb | codice | «Visitato di persona da MyCity», con la data |
| Profili social vivi | ⚪ | marchi locali | non apribili | Tenere solo quelli che esistono |

### 9. Voglia di comprare · guscio 5 · contenuto 1,5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Merce con foto nel primo schermo | 🟡 | Deliveroo | stima dal codice | Mossa 2 |
| Foto appetitose e coerenti | 🟡 | Uber Eats | database | Foto fatte da MyCity, uno stile solo |
| Etichette di popolarità vere | 🔴 | Deliveroo | database | Mossa 3 |
| Collezioni di stagione | 🔴 | Etsy | codice, database | Riusare le Liste curate che esistono già |
| Offerte vere e a tempo | 🔴 | Amazon | database | Nascondere «Promozioni» quando sono zero |
| Box e pacchetti | ⬜ | Too Good To Go | ricerca nel codice | Prima il conto: la consegna pesa quanto il box |
| Storia del prodotto | 🟡 | Eataly | pagina vera | «Perché lo teniamo», detto dal negoziante |
| Suggerimenti che alzano lo scontrino | 🔴 | Glovo | codice | Una fila sola, onesta, dello stesso negozio |
| Ispirazione che si compra | 🟡 | Instacart | database | Prima lista: «Merenda sana in 5 minuti» |
| Identità che Amazon non può copiare | 🟡 | Etsy | ricerca nel codice | Una firma sola: «La spesa che tiene viva la città» |
| Fretta onesta | 🟡 | Too Good To Go | codice | «Sfornato oggi», acceso da WhatsApp |
| Mai scaffali vuoti | 🔴 | Glovo | database | Mossa 3 |
| Regalare facile | ⬜ | Etsy | ricerca nel codice | Casella «È un regalo» con biglietto |

### 10. Il vestito visivo · guscio 5,5 · contenuto 4

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Logo intero | 🔴 | Amazon | foto, stile | Mossa 4 |
| Un colore per «aggiungi», uguale ovunque | 🟡 | Deliveroo | codice, foto | Terracotta in tutti i passi d'acquisto |
| Risposta a ogni tocco | 🟡 | Glovo | codice | Pulsanti che si schiacciano sotto il dito |
| Personalità propria | 🟡 | Etsy | foto | Via scintille e macchie sfocate |
| Gerarchia dei caratteri | 🟡 | Airbnb | codice | Sette misure di testo con un nome |
| Pieno e vuoto | 🟡 | Glovo | foto | Sezione a zero: una riga, oppure sparisce |
| Coerenza fra le pagine | 🟡 | Deliveroo | foto, codice | Sagome al posto della rotellina su 3 pagine |
| Rifinitura | 🟡 | Apple | foto | «città» con l'accento |
| Foto in un formato unico | 🟡 | Amazon | database | Segnaposto nel carattere del marchio |
| Angoli, ombre e bordi | 🟡 | Airbnb | codice | Tre raggi d'angolo e due ombre |
| Un solo bordo sinistro | 🟡 | Apple | foto | Un margine laterale unico |
| Anteprima su WhatsApp nel vestito giusto | 🟡 | Airbnb | codice | Carattere del marchio, prezzo all'italiana |
| Icone con un significato fisso | 🟡 | Uber Eats | foto | Il pacco solo per gli ordini |

### 11. Sul telefono · guscio 6 · contenuto 4,5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Barra in basso comoda col pollice | ✅ | Glovo | codice, foto | «Negozi» acceso anche sulle vetrine |
| Totale del carrello a vista | 🟡 | Uber Eats | codice | Mossa 8 |
| Pannelli che salgono dal basso | 🟡 | Uber Eats | codice | Maniglia, e chiusura trascinando giù |
| Foto da ingrandire col pizzico | 🟡 | Amazon | codice | Zoom dentro la foto ingrandita |
| Niente scorrimento laterale per sbaglio | 🟡 | Amazon | codice | Righe del carrello che vanno a capo |
| Tastiera giusta per ogni campo | ✅ | Glovo | codice | Niente |
| Mettere il sito nella schermata Home | 🟡 | Starbucks | pagina vera | Spenta al lancio per tua scelta del 26 ottobre: oggi niente. Quando la riaccendi, prima due riparazioni piccole, perché l'invito non compare mai |
| Sagome di attesa e risposta ai tocchi | 🟡 | Amazon | foto | Stato «premuto» sul pulsante base |
| Tasto indietro del telefono | 🟡 | Amazon | codice | Indietro chiude prima la foto ingrandita |
| Condividere su WhatsApp | ⬜ | Amazon | codice | Mossa 10 |
| Zone sicure dell'iPhone | ✅ | Apple | codice | Provarle su un iPhone vero |
| Testata leggibile | 🔴 | Amazon | foto | Mossa 4 |
| Prima schermata con cose da comprare | 🟡 | Amazon | foto | Mossa 2 |
| Il tasto «Cerca» apre la tastiera | 🟡 | Amazon | codice | Cursore già nel campo, ricerche recenti sotto |
| Con poco campo non si rompe | ✅ | Glovo | codice | Tempo massimo di 3-4 secondi |
| Avvisi sullo stato dell'ordine | 🟡 | Deliveroo | codice | Chiederli subito dopo l'ordine |

### 12. Dopo l'acquisto · guscio 5 · contenuto 2,5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Stato dell'ordine chiaro | 🟡 | Uber Eats | codice | Una frase per stato, con l'ora |
| Quando arriva davvero | 🔴 | Amazon | codice | La fascia scelta al posto di «30-60 min» |
| Un avviso a ogni passo | 🟡 | Uber Eats | codice | Email «il fattorino sta arrivando» |
| Ricomprare con un tocco | 🟡 | Amazon | codice | Chiudere la finestra deve voler dire annullare |
| La lista della spesa settimanale | 🟡 | Cortilia su Amazon | codice | «La mia spesa», con «Riordina tutto» |
| Recensione in 10 secondi | 🟡 | Amazon | codice | Stelle vuote all'inizio |
| Aiuto dentro l'ordine | 🔴 | Glovo | codice | Togliere «Invia un messaggio», che non fa niente |
| La home riconosce chi torna | 🟡 | Glovo | pagina vera | Rimettere «Ordina di nuovo» dal pannello |
| Ricevuta chiara | 🟡 | Amazon | codice | Un numero d'ordine solo |
| Promemoria per riordinare | ⬜ | Amazon | codice | Un messaggio qualche giorno dopo la consegna, solo con consenso |
| Inviti e punti senza soldi finti | 🔴 | Amazon | codice | Mossa 9 |

### 13. Sembrare vivo · guscio 4,5 · contenuto 2

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Categorie vuote nascoste | 🔴 | Glovo | codice | Mossa 3 |
| Pagine collezione piene e diverse | 🔴 | Etsy | codice | Ognuna compare sopra una soglia |
| Mai un account di prova in pubblico | 🔴 | Shopify | database | Mossa 1 |
| Niente prodotti senza foto in vetrina | 🔴 | Amazon | codice | Anche l'importazione da file chiede la foto |
| La home promette solo ciò che c'è | 🔴 | Goldbelly | foto | Sottotitolo: il fresco delle botteghe del centro |
| Pochi negozi, raccontati bene | 🟡 | Goldbelly | foto | Mossa 7 |
| Lista d'attesa onesta | ⬜ | Deliveroo | ricerca nel codice | «Quale negozio vorresti trovare?» |
| Nessuna pagina vuota dal menu | 🔴 | Glovo | conto sul codice | Prova automatica che conta le pagine vuote |
| Classifiche solo con dati | 🔴 | Etsy | pagina vera | Spegnere «Trending» dal pannello |
| Pagine vuote che non promettono il futuro | 🔴 | Amazon | codice | Via «di continuo», «ogni settimana», «ogni venerdì» |
| Sagome di attesa proporzionate | 🟡 | Amazon | foto | Al massimo una schermata di sagome |

### 14. Chiaro per tutti · guscio 6 · contenuto 5

| Requisito | Stato | Chi lo fa meglio | Prova | Proposta |
|---|---|---|---|---|
| Testo da leggere di almeno 16 punti | 🟡 | GOV.UK | codice | Minimo fisso sul percorso d'acquisto |
| Ogni scritta si legge | 🔴 | GOV.UK | foto, stile | Mossa 4, più «IVA inclusa» più scura |
| Bersagli grandi per il dito | 🟡 | Apple | codice | Quattro pezzi portati a 44 punti |
| Parole di tutti i giorni | 🟡 | GOV.UK | pagine vere | «Quantità» invece di «Q.tà», «fattorino» invece di «rider» |
| Parola accanto all'icona | 🟡 | Amazon | codice | «Filtri» scritto anche sul telefono |
| Niente dietro il passaggio del mouse | 🟡 | GOV.UK | codice | Togliere SPID e SMS spenti dall'accesso |
| Errori che dicono cosa fare | 🟡 | GOV.UK | codice | Telefono: «per esempio 333 123 4567» |
| Moduli corti, senza uscire | 🟡 | Uber Eats | codice | Mossa 5 |
| Con la tastiera si vede dove sei | 🟡 | GOV.UK | codice | Prova di 20 minuti con la sola tastiera |
| Ingrandire senza rompere | 🟡 | GOV.UK | codice | Misure in scala invece che fisse |
| La stessa cosa detta allo stesso modo | 🔴 | Amazon | foto | Mossa 6 |
| Conferma che resta abbastanza | 🟡 | Glovo | codice | Avvisi in basso, almeno 6 secondi |
| Aiuto di una persona | 🟡 | Amazon | piè di pagina vero | Telefono della scheda da toccare per chiamare |
| Un controllo che impedisce agli errori di tornare | 🟡 | GOV.UK | prova automatica | Scheda prodotto e cassa dentro il controllo |

---

## Dettagli tecnici

### Per riprendere in una sessione nuova

`consegne/design/2026-10-29-come-riprendere.md`: le dieci mosse collegate alle schede del registro del sito, il file da cui parte ognuna, la prova che dice «fatto», lo strumento delle foto (`cervello/foto-pagine-vere.mjs`) e il motore per rimisurare (`consegne/design/2026-10-29-strumenti/`).

### Da dove vengono i dati

- Codice: `/home/user/mycity`, ramo main, commit `0df5557` (2026-10-29 18:12 +0100). Sola lettura.
- Pagine vere: testo in `consegne/design/2026-10-29-pagine-testo/*.txt`, foto in `consegne/design/2026-10-29-foto-pagine/*.png` (come sono state fatte: `come-sono-state-fatte.txt` nella stessa cartella). Gli HTML interi sono rimasti nella scratchpad della sessione `da22efc2…`. Prese attraverso Vercel il 2026-10-29 20:15 (il dominio `mycity-phi.vercel.app` è bloccato dalla rete della sessione).
- Materiale grezzo collaudato (14 aree, 3 benchmark, giudizi a occhio): `consegne/design/2026-10-29-esperienza-cliente-raw.json`. I conteggi per stato e per strato li ho ricalcolati da lì il 2026-10-30 00:30: tornano.
- Chiave di servizio su Vercel: `filter_project_envs` sul progetto `mycity`, solo i nomi, 2026-10-30 00:25. In produzione 12 variabili, nessuna è `SUPABASE_SERVICE_ROLE_KEY` (carta #154, giorno della chiave #210).
- Mossa 1: la carta #201 porta la nota del 27/10 15:20 («il comando è qui sotto, pronto») e la storia del 26/10 («toglierlo prima della chiave»). La #210 mette il Panificio Demo come primo dei passi del giorno della chiave.
- Mossa 3: la scelta «categorie vuote nascoste» del 26/10 è in `consegne/audit/2026-10-28-ondata2-preparazione.md` (riga «Vetrina», 3 gravi); l'albero più ampio è la risposta del 29/10 00:08 in AZIONI-IN-ATTESA.
- Costo dell'analisi (`node cervello/conto-token.mjs --workflow wf_b52be27a-121`): 40 agenti misurati, 2.934 turni; 11,3 milioni di token senza le letture dalla cache, 457 milioni contandole. Due agenti sono stati rifatti dopo il riavvio della macchina della sessione (29/10 21:54).
- Database: lettura in sola lettura del 2026-10-29 20:13 (9 prodotti, 2 negozi, 0 recensioni, 0 storie, 1 ordine del 24/6 annullato, 0 visite nelle 24 ore, `shop_of_month` vuota, 0 liste, 1 evento scaduto, 0 promozioni attive, 0 prezzi barrati).
- Registro dei fatti: `registro-fatti.json → consegna.promessa`. Durante l'analisi (29/10 20:13) valeva la regola delle 16:13. La sera del 29/10 Nicola l'ha cambiata (letta alle 22:21, compenso del fattorino alle 23:04, richiesta di unione #899; il codice è nell'ondata 14 del sito). Il referto non ripete la regola altrove: vale il registro. Per questo non la richiedo a Nicola, anche se il collaudo della prima impressione lo proponeva.
- Materiale: 14 aree analizzate da senior e collaudate, 3 ricerche di benchmark (Amazon/eBay; Glovo/Deliveroo/Uber Eats/Just Eat; Etsy/Shopify/Too Good To Go/ShopAppy/Miconex/Faire più Baymard, NN/g, Spiegel), 4 lenti sull'occhio più uno scettico (42 osservazioni confermate, cioè 33 problemi e 9 pregi; 7 scartate).

### Una correzione al materiale

- Lo scettico scriveva che «la cassa offre solo la fascia oraria». Non è così: `components/checkout/DeliverySlotPicker.tsx:79-85` mostra la mattonella «Adesso · Express» (30-60 min) dalle 8 alle 21, allo stesso prezzo. Il prezzo resta 3 € fissi (`lib/constants.ts:123 PLATFORM_DELIVERY_FEE_CENTS = 300`). Quindi: la consegna veloce c'è già, ma senza il +1 € della regola del 29/10. Il +1 € sotto i 10 € non è nel codice (Grep `supplement|sotto i 10`: zero).
- A negozio chiuso «Adesso» resta accendibile e viene rifiutato solo alla conferma (`app/api/orders/cod/route.ts:662-663` via `lib/store-hours.ts:208`). PASSO-A @tech, area cassa.

### Come ho contato

- 191 = somma dei requisiti rimasti dopo i collaudi nelle 14 aree (15+14+15+14+16+13+15+11+13+13+16+11+11+14).
- Stato: 13 al livello, 112 sotto, 14 mancanti, 51 dannosi, 1 non verificabile.
- Strato: 92 solo guscio, 6 solo contenuto, 93 entrambi. Dannosi per strato: 11 / 1 / 39. Mancanti: 9 / 0 / 5.
- Medie: guscio 74/14 = 5,29; contenuto 45,5/14 = 3,25.
- Doppioni fra aree (stessa causa, più lenti): logo dimezzato in 4 aree (prima impressione, vestito, telefono, chiaro); promessa di consegna in 4 (prima impressione, scheda, fiducia, chiaro); Panificio Demo in 4 (prima impressione, ricerca, fiducia, sembrare vivo); etichette di popolarità in 4 (prima impressione, schede, voglia, sembrare vivo).

### Prove principali, area per area

**Prima impressione**
- Pillola CAP che promette un filtro inesistente: `components/LocationPill.tsx:166` e `:126-127`; l'evento `mc:location-change` (`:67`) non ha ascoltatori (Grep su tutto il repo). La regola dei 5 km è già scritta a `:198-200`.
- Tessere categoria: `components/CategoryShowcase.tsx:68`, `:111`; ordine `lib/queries/catalogo.ts:110-114`; in `prod/home.html` le 9 categorie hanno `sort_order:0`, `featured:false`, `image_url:null`. Sottotitolo «Le categorie più cercate»: `HomeSectionRenderer.tsx:212`.
- Riquadro negozio solo da computer: `components/home/HeroStoreCard.tsx:108` (`hidden md:flex`); Negozio del mese nascosto sul telefono: `ShopOfMonthHero.tsx:78`.
- Tre riquadri vuoti in home: `HomeSectionRenderer.tsx:408-417`.
- Riserva della vetrina in cima: `migrations/124_radiografia_21_agosto.sql:375-377` (negozio approvato più recente se manca il negozio del mese).

**Muoversi veloce**
- Barra in basso: `lib/ui/schede-in-fondo.ts:88-103` (icona `Package` per «Negozi» a `:100`, la stessa di «Ordini» a `:93`); `components/MobileTabBar.tsx:55-63`, `:122-126`.
- Testata non attaccata sul telefono: `components/Navbar.tsx:118` (`relative md:sticky`); `autoFocus` spento: `components/SearchBar.tsx:34`.
- Destinazioni scritte nel codice: `components/CategoryBar.tsx:21-29`. Regali vuota anche per costruzione: `app/regali/RegaliClient.tsx:20`, `:27-32`; `lib/queries/griglia-prodotti.ts:150-157`.
- Vicolo cieco della categoria vuota: `app/category/[slug]/page.tsx:311-347`, `:519`; `messages/it.json:102`.
- Filtri solo in memoria: `app/category/[slug]/page.tsx:79-86`; `components/StoreProductExplorer.tsx:31-37`; `app/stores/page.tsx:181-184`.
- «Compra ora» sul telefono a circa 2.330 punti (foto della pagina intera del kefir); barra dopo 422 punti: `components/StickyAddToCart.tsx:66-67`.

**Trovare le cose**
- Refusi: `migrations/129_il_catalogo_si_vede_senza_account.sql:166-170` (`search_tsv @@ websearch_to_tsquery … OR p.name % q`, soglia 0,3). Prova su Postgres 16 separato: «chefir» 0,12, «kefyr» 0,09, «keffir» 0,15 → 0 risultati.
- Ordine che toglie prodotti: `lib/queries/griglia-prodotti.ts:132` (ricerca intelligente solo con «Rilevanza»), `:180` (`ilike`); «kefir capra» da 1 a 0. Ordine contato come filtro: `app/search/page.tsx:197`.
- Taglio ai 96 prima dei filtri: `griglia-prodotti.ts:132-138`, `:177-187`; nella vetrina `:178` (fiducia 80%, letto non eseguito).
- Ricerche popolari scritte a mano: `components/SearchBar.tsx:19`, `:300`.
- Parole chiave scritte dall'AI e ignorate: `app/api/ai/seo/route.ts:31`; indice solo su nome e descrizione: `migrations/027_growth_engagement_foundations.sql:366-370`.
- Misura sbagliata delle ricerche: `components/ProductGrid.tsx:207`, `:410-425` (react-query 5, `keepPreviousData`).

**Schede nelle liste**
- `components/ProductCard.tsx:168`, `:182` (`object-cover`); prezzo a 16 px `:265`, `:271` (ricetta #650 ancora da riparare); voto dichiarato e mai usato `:29-30` contro `:51-54`; avviso di 2 secondi `:101-102`.
- Unità di prezzo che la griglia non legge: `lib/products/schema.ts:13-37`, `lib/queries/griglia-prodotti.ts:77`.
- Sei schede fatte a mano: `SimilarProducts.tsx:74-95`, `RecentlyViewed.tsx:53-74`, `CartUpsell.tsx:72-107`, `SponsoredCarousel.tsx:107-124`, `TrendingNow.tsx:64-105`, `FrequentlyBoughtTogether.tsx:73-110`.
- Classifiche: `HomeSectionRenderer.tsx:233-261`; `TrendingNow.tsx:49-52`, `:84-92`; riserva `lib/queries/fasce-prodotti.ts:63-76`; `app/piu-venduti/page.tsx:14`, `:21-23`.

**Scheda prodotto**
- Prima schermata: `app/product/[id]/page.tsx:550`, `:721`, `:777`, `:976`; prezzo a circa 970 punti, «Aggiungi al carrello» a circa 2.277 (foto).
- Chiuso e disponibile insieme: `components/ui/DeliveryCutoff.tsx:122-123`; `page.tsx:994`; conto alla rovescia fisso alle 18: `lib/delivery.ts:8`.
- Varianti senza prezzo: `lib/database.types.ts:1688-1697`; `lib/category-attributes.ts:50`, `:89`, `:105`, `:132`; `components/seller/ProductForm.tsx:947-957`. PASSO-A @tech (tocca i soldi, probabilità bassa oggi).
- Modulo recensioni a tutti, database solo a chi ha ricevuto: `page.tsx:1133-1190` contro `migrations/093_reviews_no_self_review.sql:18-34`; errore `lib/errors.ts:18`. Stelle già a 5: `page.tsx:115`.
- Reso 14 giorni fisso: `page.tsx:824-829`, `lib/promesse-pubbliche.ts:264`; contro `app/returns/page.tsx:69`.
- «Spesso comprati insieme» senza dati: `components/products/FrequentlyBoughtTogether.tsx:72`, `:19-25`.
- Prezzo all'inglese nell'anteprima: `app/product/[id]/opengraph-image.tsx:26`.
- «Usato» ancora selezionabile dal negozio: `lib/products/schema.ts` (`CONDITION_LABELS`), contro CONTESTO_BUSINESS §7.

**Vetrina del negozio**
- «Consegna oggi» a negozio chiuso: `components/store-sections/HeroSection.tsx:57-61`, `:146-150`; giorno preso dall'orologio locale `:54`.
- Pannello «Info & orari» sempre visibile: `SectionRenderer.tsx:212`, `:215`; in `main.css` `[hidden]…{display:none}` al byte 4667 prima di `.grid{display:grid}` al byte 11328.
- Etichetta «Ritiro in negozio»: `lib/store-customization.ts:111`, `HeroSection.tsx:236-247`, contro `lib/constants.ts:98` (`RITIRO_IN_NEGOZIO_ATTIVO = false`). Era R64 dell'11/10.
- Copertina alta 240 px: `components/store-sections/misure-vetrina.ts:23`. Anteprima con «30-60 min»: `app/store/[id]/opengraph-image.tsx:81`.

**Carrello e cassa**
- Google che riporta in home: `components/ui/AuthShell.tsx:137-138`, `app/auth/callback/route.ts:26-31`. Registrazione che perde la strada: `app/sign-up/page.tsx:330`, `:338`.
- Sconto pagato dal negozio: `lib/ordini/prezzi.ts:182-185`, `app/api/orders/cod/route.ts:955-959`, `lib/stripe/client.ts:420-429`; BENVENUTO10 in `migrations/014_mvp_sprint.sql:172`. I codici sono spenti nel database dal 2026-10-27 12:01 (carta #214, `DECISIONI.md` voce 2026-10-27 11:00, nota in fondo a `lib/funzioni-al-lancio.ts`): il paletto 1 si tocca solo se si riaccendono, e prima va deciso chi paga lo sconto. Il campo in cassa mostra ancora «es. BENVENUTO10» (`components/checkout/CouponInput.tsx:63`).
- Fascia che il negozio non vede: la leggono solo `app/rider/page.tsx:127` e `lib/ordini/scadenza-accettazione.ts:100`.
- Conferma: `app/orders/[id]/page.tsx:319`, `:325`, `:347`; email `lib/email/templates.ts:128-145`.
- Indirizzo mai salvato dalla cassa: solo `app/profile/addresses/page.tsx:84-89` scrive `user_addresses`.

**Fiducia**
- Recensioni anti-falso: `migrations/061_p0_security_rls_state_machine_reviews.sql:368-379`, `093…:18-34`.
- «Ordinato N volte» che somma pezzi e annullati: `components/ui/SocialProof.tsx:27-38`; regole di lettura `migrations/002_categories_and_extras.sql:68-93` (fiducia 80%).
- Partita IVA: `components/products/VendutoDa.tsx:40-50`; `components/Footer.tsx:340-353`; `lib/legal/titolare.ts:136-137`.
- WhatsApp d'aiuto costruito e spento: `components/Footer.tsx:264-276`, `lib/contatto-whatsapp.ts`, `.env.example:140`.
- Bollino verificato legato a Stripe: `lib/store-trust.ts:12-15`; promesse `app/about/page.tsx:68`, `AuthShell.tsx:45`.

**Voglia di comprare**
- `trending_product_ids_24h` = 0 righe il 29/10; i 4 prodotti Demo datati 5/9, quelli di Pane Quotidiano 16/6.
- Liste curate esistenti e vuote: `app/lists/page.tsx:177-179`; `migrations/036_curated_lists_and_indices.sql:23`.
- Promozioni: `app/promozioni/page.tsx:106-107`. Regalo: solo `app/checkout/page.tsx:1352` (note per il rider); buoni spenti `lib/funzioni-al-lancio.ts:35`.
- Doppioni del kefir: `…1781623482327-vgqw90-1000062973.jpg` e `…1781623526683-n38abv-1000062973.jpg` (44 s di distanza), idem per `…1000062974.jpg`.

**Vestito visivo**
- Logo: `app/globals.css:194`; `components/Navbar.tsx:127-128`, `:217-218`, `:144`, `:245`. Campionamento pixel: colore di fondo (160,59,37) in 221 campioni su 250 a destra di «My». Era R35 dell'11/10.
- Pulsanti spenti illeggibili: `app/product/[id]/page.tsx:1043` (circa 3,3:1), `components/StickyAddToCart.tsx:171` (circa 2,3:1), `app/checkout/page.tsx:1585`.
- Rossi di serie fuori tavolozza: 70 usi in 17 file (es. `app/cart/page.tsx:518`, `components/OrderTimeline.tsx:26-30`).
- Rotellina: `app/stores/page.tsx:274`, `app/categorie/page.tsx:41`, `app/category/[slug]/page.tsx:119`. Refuso: `app/stores/page.tsx:263` (R290).

**Telefono**
- Manifest nel corpo: in `prod/home.html` `</head>` a 6.776 e `rel="manifest"` a 47.170 (prodotto 7.560 / 131.367, negozio 7.852 / 145.446); `app/layout.tsx:93`, `:100`.
- Invito «Metti in Home» mai mostrato: `components/PWAInstallBanner.tsx:96` (contatore fermo a 1), soglia `:32`; `lib/hooks/index.ts:32-35`. L'app installabile è fra le funzioni spente al lancio (carta #209, `registro-fatti.json → prodotto.spente-al-lancio`): le due riparazioni servono solo quando Nicola la riaccende. La nota in fondo a `lib/funzioni-al-lancio.ts` dice invece che il banner «si vede ancora»: le due letture del codice non coincidono.
- Indietro: `useCloseOnBack` usato solo in `MobileAccountSheet.tsx:29` e `SupportChatModal.tsx:64`.
- Avvisi d'ordine attivabili solo da `app/profile/settings/page.tsx:538`.

**Dopo l'acquisto**
- Home di produzione senza la sezione «reorder» (carico RSC in `prod/home.html`: hero, categories, popularProducts, howItWorks, nearbyStores, 4 uuid, 3 null).
- 100 punti a ogni iscritto: `migrations/029…:11-50` (`trg_profile_welcome_bonus`); la cassa non li legge (`lib/email/templates.ts:638`); promesse `app/orders/page.tsx:271`, `app/sign-up/page.tsx:215`. Contro la carta #209 (registro-fatti, `prodotto.spente-al-lancio`).
- Email «Ti avvisiamo appena parte» senza seguito: `lib/email/templates.ts:200`; trigger `migrations/150…:104-107`.
- «Invia un messaggio» che chiude e basta: `components/orders/ContactSheet.tsx:120-128`; chat senza avviso al negoziante: `app/api/chat/messages/route.ts:19-42`.

**Sembrare vivo**
- Import CSV senza foto e già in vendita: `app/seller/products/import/page.tsx:139-149` (oggi la pagina è spenta al lancio: `CARICAMENTO_DA_FILE_ACCESO = false`, `lib/funzioni-al-lancio.ts:67`, letto a `import/page.tsx:288`; il rischio torna quando si riaccende); API admin `app/api/admin/products/route.ts:119-124`; il modulo invece la pretende `components/seller/ProductForm.tsx:650-653`.
- Pagine vuote dal piè di pagina: `app/shop-of-month/page.tsx:167`, `app/events/page.tsx:168-169`, `app/lists/page.tsx:235`.
- Elettronica promessa a Google: `app/category/[slug]/layout.tsx:15`, `:35`.
- Sagome sovradimensionate: `components/ProductGrid.tsx:498`; 6 negozi in vetrina `lib/queries/vetrina-negozi.ts:41`.

**Chiaro per tutti**
- Misure del testo nel lato cliente: text-sm 550, text-xs 284, text-2xs 8, misure da 9-11 px scritte a mano 60; 158 misure fisse in pixel.
- Contrasti ricalcolati: «IVA inclusa» `#78716C` su `#FBF7F0` = 4,49:1; suggerimento grigio `#9ca3af` su bianco = 2,54:1; bordo `#e5e7eb` = 1,24:1.
- Bersagli piccoli: `app/product/[id]/page.tsx:1012`, `:1020` (36 px); `components/cart/CartUpsell.tsx:103` (32 px); X dei filtri circa 28 px `app/search/page.tsx:404`, `:439`.
- Controllo automatico: `.github/workflows/ci.yml:629`, verde nel run 40919078266 (2026-10-29 17:12 UTC); guarda 4 pagine (`tests/e2e/11-a11y-percorso-acquisto.spec.ts:57-62`) e non vede il contrasto 1:1.

### I numeri dei migliori, con la fonte

| Dato | Fonte | Affidabilità |
|---|---|---|
| 70,19% dei carrelli abbandonati in media | Baymard via contentsquare.com/guides/cart-abandonment/stats/ | secondaria |
| Prima causa di abbandono: costi in più, 48% (2024) o 39% (altra base) | emarketer.com, baymard.com/blog/reduce-cart-abandonment | secondaria / primaria |
| 19% abbandona per l'account obbligatorio (1.026 adulti USA) | baymard.com/blog/current-state-of-checkout-ux | primaria |
| 42% dei siti chiede l'account prima dell'ordine | baymard.com/research-articles/delayed-account-creation | primaria |
| 41% dei siti mostra la velocità invece della data | baymard.com/blog/shipping-speed-vs-delivery-date | primaria |
| 56% guarda prima le foto, 42% cerca le dimensioni nelle foto | baymard.com/blog/in-scale-product-images | primaria |
| 53% cerca apposta le recensioni negative | baymard.com/research-articles/respond-to-negative-user-reviews | primaria |
| Con 5 recensioni +270% di probabilità d'acquisto rispetto a zero | spiegel.medill.northwestern.edu (2017, retailer di regali) | primaria, campione specifico |
| Voto che convince di più: fra 4,2 e 4,5 | Spiegel con PowerReviews | primaria, sponsorizzata |
| Cassa media: 5,1 passaggi e 11,3 campi, ne bastano 8 | baymard.com/blog/checkout-flow-average-form-fields | primaria |
| Deliveroo mostra il voto solo dopo 10 ordini valutati | help.deliveroo.com, articolo 6258682 | primaria |
| Uber Eats, consegna prioritaria +1,49/4,99 £ | uber.com/gb/en/blog/understanding-fees-and-arrival-time | primaria |
| Tempo come intervallo riduce la delusione nei ritardi | aisel.aisnet.org/pacis2022/88 | primaria |
| Foto su metà del menu: +13% di vendite | rapporto DoorDash 2026 via snappr.com | secondaria |
| 58-60% aggiunge prodotti per la spedizione gratis | studi UPS 2013-2016 | secondaria, datata |
| Too Good To Go Italia 2025: 7,8 milioni di pasti, 26.000 negozi | toogoodtogo.com/it/press | dichiarata dall'azienda |
| 35% dei ricavi Amazon dalle raccomandazioni | stima McKinsey 2013 | NON confermata: non usarla |

### Gli scartati dai collaudatori

In tutto 30: 23 dai collaudi delle aree, 7 dallo scettico delle foto.

- **Requisiti interi tolti (5):** il test A/B della home, che il cliente non vede; il tasto «Cerca» che apre la tastiera, confronto non verificabile e assorbito nelle ricerche recenti; «Ordina di nuovo» dentro la vetrina, già coperto da home e ordini; il prezzo della consegna veloce, oggi uguale a 3 € e doppione; la navigazione per densità, doppione di altri due requisiti.
- **Affermazioni corrette o tolte (18):** fra le altre, «Non lo so» come difetto fisso (è un lampo durante il caricamento); «tutti i prodotti costano fra 2,05 e 5,00 €» (vale solo per Pane Quotidiano, il miele Demo costa 8,50 €); «Glovo cliente nuovo circa 10 tocchi» (non verificabile); «la prova sociale è onesta per costruzione» (somma pezzi e annullati, e il pubblico non la vede); il dato «40% contro 5%» sulle risposte in app (senza fonte); «le notifiche push su iPhone sono impossibili» (il manifest c'è); «la home mostra Bentornato/a» (non in produzione); «Visti di recente salvati nel telefono» (sono sul server, solo con accesso); «le liste sono pubbliche di curatori» (sono personali); «nessun avviso torna-disponibile» (esiste, ma non scatta); il WhatsApp d'aiuto «inesistente» (è costruito e spento); il segno della tastiera «al livello» (abbassato).
- **Scettico delle foto (7):** la scheda del negozio del mese «sotto le spunte» sul telefono (è nascosta del tutto); la regola di consegna del 26/10 citata come vigente (superata il 29/10); il prodotto più caro a 5 € e il cesto sopra i 12 € (sono 8,50 € e 10,90 €); le ricerche pronte «da aggiungere» (esistono già, finte); la testata minima in cassa segnata rossa (è gialla); «Più venduti» ordinato a caso (è l'ordine di partenza); i pallini della galleria sul computer (solo sul telefono).

### Targhe

- Carta #201 Panificio Demo: `AZIONI-IN-ATTESA.md:314`, accodata 2026-10-10 12:05, sì di Nicola 2026-10-27 15:20, comando pronto.
- Carta #154 chiave di servizio su Vercel: `AZIONI-IN-ATTESA.md:748`; STATO del 28/10: cassa ferma, circa 5.400 errori in 7 giorni quasi tutti da quella chiave. Ordine dichiarato: prima #201, poi #154, solo col via dell'AD.
- Carta #210 «il giorno della chiave»: la sequenza #201 → #154 citata in «Cosa cambia per te».
- Carta #209 funzioni spente al lancio (firmata 2026-10-26): fra queste l'app installabile, i codici sconto, inviti e punti, il caricamento da file.
- Regola AR-102: tempi e prezzi della consegna si leggono solo da `registro-fatti.json`.
- Radiografia design dell'11/10 ancora aperte: R35 (logo), R64 (ritiro), R66 e R228 (30-60 min), R88 (categorie vuote), R232 (più venduti), R277 (sbordo del carrello), R290 (refuso «citta'»).
