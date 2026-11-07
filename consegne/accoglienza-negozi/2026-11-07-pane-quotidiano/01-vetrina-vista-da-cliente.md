---
data: 2026-11-07 03:00
autore: ux-designer
oggetto: Pane Quotidiano visto da cliente di Piacenza (sito vero, solo pagine pubbliche)
---

# Pane Quotidiano: la vetrina vista da un cliente

Questo documento serve a capire cosa vede una cliente di Piacenza quando apre la pagina di Pane Quotidiano, e cosa sistemare prima del 15/11.

## In parole semplici

Ho aperto il sito vero come farebbe una cliente di Piacenza: prima da telefono, poi da computer. Ho guardato la pagina del negozio, i 5 prodotti, la ricerca e la categoria. La vetrina funziona e non ha errori tecnici. Ma oggi promette più di quello che il negozio vende, e due ricerche su tre non portano al negozio.

Un esempio. Ti serve il pane per cena e scrivi «pane» nella ricerca. Il caso che pesa di più: chi scrive «pane» nella ricerca trova 1 solo prodotto, l'hummus. Non il negozio, che si chiama Pane Quotidiano. E i 5 prodotti sono tutti latticini, sughi e creme bio. Nessun pane.

## Cosa cambia per te

Per il 15/11 (apertura del sito) la vetrina può prendere un cliente per bugiardo in tre punti. Si risolvono quasi tutti con testi e foto, senza toccare il codice.

- **La descrizione parla di miele e pane che non ci sono.** Dice «tra cui pane, miele biologico (acacia, tiglio, castagno, propoli)». I 5 prodotti in vendita sono kefir (2), hummus, pudding alla vaniglia e pesto. Chi arriva per il miele esce subito.
- **Il bollino «Prodotti locali» non regge.** Il kefir da 400 g è tedesco (la scheda dice «Origine: Germania»). Il pesto è «Artigiani del Madouri», un nome che fa pensare alla Liguria (mia deduzione, non verificata). Nessuno dei 5 è di Piacenza. Il bollino «Sostenibile» non ha nulla dietro, nei dati del negozio.
- **Tre prodotti su cinque non hanno ingredienti né allergeni.** Pudding, hummus e pesto non mostrano la sezione «Ingredienti e allergeni». La scheda del pudding parla di «latte bio». Gli allergeni veri non li scrivo io: vanno letti sull'etichetta o chiesti al negozio.

## Cosa devi fare

- Chiedere al negozio, quando lo vedi: ha o no il miele e il pane? Se non li ha, riscrivere la descrizione (proposta sotto). Decidi tu se togliere «Prodotti locali» e «Sostenibile».
- Far fare al negozio 3 foto delle etichette (pudding, hummus, pesto) per ricavare ingredienti e allergeni. Li inserisce il negozio, non io.
- Approvare la descrizione nuova qui sotto, prima che io la passi al negozio. Non l'ho mandata a nessuno.

## Cosa non ho verificato

- Ho guardato solo da visitatore, di notte (circa le 02:30 a Piacenza, sabato 7/11). Per questo ogni pagina dice «Chiuso ora». Non ho visto come cambia di giorno, né di domenica.
- Non ho letto le etichette dentro le foto dei prodotti: sono piccole e lontane. Nessun dato di legge è letto da lì. Ingredienti e allergeni li ho solo dove la scheda li mostra già (kefir 400 g).
- Non ho provato carrello, cassa, ordine, accesso o moduli. Quindi la frase di consegna l'ho letta, non provata.
- Non so se i prodotti sono davvero in negozio oggi (scorte tutte a 20, sembra un numero messo a mano).
- Telefono e indirizzo li confronto solo con il database, non con il negozio vero. Gli orari vengono da PagineGialle e vanno confermati.

## Dettagli tecnici

**Come ho guardato.** Playwright, Chromium senza testa, telefono 390x844 e computer 1280x900, lingua it-IT. Solo richieste GET a pagine pubbliche. Il banner dei cookie lo ho nascosto con uno stile locale per vedere la pagina: non ho cliccato nessun pulsante, quindi non ho dato né negato consensi. Una volta ho aperto la tendina «Ingredienti e allergeni» (solo lettura, avviene nel browser). Foto in `foto/` (48 file, nomi `pagina--mobile.png`, `--desktop.png`, `-intera` = pagina intera).

**Cosa funziona (da non toccare).** Pagina negozio 200 su telefono e computer, nessuna barra laterale, nessuna immagine rotta (tutte caricate). Orari mostrati identici al database: lun-mer 9-13 e 16:30-19:30, giovedì solo 9-13, venerdì chiude alle 19:00, sabato 9-13 e 16:30-19:30 con «OGGI», domenica «Chiuso». Indirizzo «Via Calzolai, 25, 29100 Piacenza PC» e telefono 0523388601 sono link veri (`tel:` e mappa Google). Il cliente vede subito che si paga alla consegna ed è scritto «Reso entro 14 giorni, esclusi i prodotti freschi». I prezzi sono 5,00 / 2,95 / 2,95 / 2,05 / 2,05 euro, uguali al database. La scheda «Venduto da» ha nome, indirizzo e telefono.

**Come lo si trova.**

| Percorso | Cosa trova il cliente | Voto |
|---|---|---|
| Home | Il negozio compare 2 volte, con «Chiuso · riapre alle 09:00» e «Nuovo negozio»; 5 prodotti in «Ultimi arrivati» | buono |
| Ricerca «pane» | 1 prodotto: Hummus (la parola è nel testo «condire pane e verdure»). Il negozio non compare | **rotto** |
| Ricerca «kefir» | 2 prodotti, quelli giusti | buono |
| Ricerca «hummus» | 1 prodotto, quello giusto | buono |
| Categoria Alimentari | Sottocategoria Latticini con 1 solo prodotto (kefir di capra), altri 4 sotto «Altri prodotti». Il sottogruppo «Panificio» è vuoto | medio |

Il cliente non vede un risultato «negozio» nella ricerca: cerca solo prodotti. Un nome negozio come «Pane Quotidiano» non si cerca per nome. Nota: l'indirizzo `/negozi` dà 404, la lista vera è `/stores`; l'ho solo provata io a caso, nessun link del sito porta a `/negozi`.

### Problemi trovati, uno per uno

Ordine: prima quello che costa clienti il 15/11. Confidenza: «vista» = ho letto/visto la pagina; «dedotta» = ragionamento mio.

**P1. Descrizione con prodotti che non esistono.** (vista, 100%)
- *Cosa vede il cliente:* «specializzata nella vendita di prodotti alimentari, tra cui pane, miele biologico (acacia, tiglio, castagno, propoli) e altri generi.» E sotto, 5 prodotti che non sono né pane né miele. Lo stesso testo è anche la descrizione nei risultati di Google (meta description).
- *Perché conta:* promette ciò che non c'è. Il primo ordine rischia di partire con un cliente deluso, e l'unico negozio vero deve fare buona prima impressione.
- *Correzione:* riscrivere. Proposta, da approvare e da far confermare al negozio: «Alimentari biologici di Via Calzolai, a Piacenza: kefir, hummus, pesto, budini e altri prodotti freschi e da dispensa.» Se il negozio vende davvero pane e miele ma non sono ancora caricati, la risposta giusta è caricarli, non togliere la frase. Da chiedere al negozio.

**P2. Il nome «Pane Quotidiano» e la ricerca «pane».** (vista, 100%)
- *Cosa vede:* cerca «pane», trova solo l'hummus. Niente pane, niente negozio. Il sottogruppo «Panificio» è vuoto.
- *Perché conta:* la parola «pane» è la ricerca più naturale per chi cerca un forno sotto casa. Il cliente conclude che MyCity non ha il pane, e non scopre il negozio.
- *Correzione:* se il negozio ha pane, caricarlo (1 foto, 1 prezzo). Se non lo ha, non c'è un trucco onesto: il nome resta, ma la descrizione (P1) deve dire cosa vende. Lato sito: la ricerca potrebbe mostrare anche i negozi per nome. È una modifica del sito, la passo a @frontend-dev come proposta, 🟡, non l'ho toccata.

**P3. Bollino «Prodotti locali».** (vista; origine tedesca vista sul kefir 400 g; il resto dedotto 80%)
- *Cosa vede:* il bollino «Prodotti locali» sotto la descrizione. Poi la scheda del kefir: «Origine: Germania». Il pesto è di una marca ligure.
- *Perché conta:* è la frase su cui si regge MyCity («negozi veri di Piacenza»). Se il primo controllo smentisce, perde fiducia tutto il negozio.
- *Correzione:* togliere il bollino finché non ci sono prodotti del territorio. Il bollino «Biologico» invece è coerente: tutti i 5 nomi dicono bio. Lo si può tenere.

**P4. Bollino «Sostenibile».** (dedotto 70%)
- *Cosa vede:* «Sostenibile» senza spiegazione. Sulle schede prodotto si leggono frasi come «brick TetraTop ecosostenibile» (kefir) e «carta sostenibile» (pesto): sono affermazioni sull'ambiente senza prova.
- *Perché conta:* è una dichiarazione ambientale vaga, a rischio di contestazione («greenwashing») e non verificabile. Parere legale da chiedere a @legale-privacy.
- *Correzione:* togliere il bollino e le due frasi «ecosostenibile / sostenibile» dalle descrizioni, a meno che il negozio non mostri un certificato.

**P5. Ingredienti e allergeni mancanti su 3 prodotti.** (visto, 100%)
- *Cosa vede:* kefir 400 g: sezione completa («Latte e derivati», ingredienti, frigorifero). Kefir di capra: ingredienti e conservazione, ma nessun allergene indicato, nonostante sia latte. Pudding, hummus, pesto: nessuna sezione.
- *Perché conta:* per un alimento il cliente allergico non può comprare senza. È anche un obbligo di informazione per chi vende cibo. Il parere formale va dato da @legale-privacy.
- *Correzione:* chiedere al negozio 3 foto delle etichette (fronte e retro) e inserire i dati letti, scrivendo «dalla foto dell'etichetta». Niente di compilato da me. Per il kefir di capra: aggiungere «Latte» come allergene, dopo conferma sull'etichetta.

**P6. Foto prodotto: sfondo grigio, prodotto piccolo.** (vista, 90%)
- *Cosa vede:* tutti i prodotti stanno su uno sfondo grigio sporco, centrati e piccoli. Nella scheda prodotto la foto è stretta e alta, con due fasce bianche ai lati. Il testo alternativo dice «su sfondo bianco», ma lo sfondo non è bianco. Le foto 2-4 sono gli altri lati della confezione e il kefir di capra ha le foto 3 e 4 uguali alle foto 1 e 2.
- *Perché conta:* nel confronto con altri prodotti (supermercati online) sembrano di bassa qualità. Non toglie fiducia da solo, ma non invoglia.
- *Correzione:* rifare le foto con un cartoncino bianco, vicino a una finestra, prodotto più grande nell'inquadratura. Chiedo a @designer un mini-tutorial di 3 righe da mandare al negozio, e tolgo i doppioni sul kefir di capra.

**P7. Cosa dice la copertina e il logo.** (vista, 95%)
- *Cosa vede:* copertina vera (interno del negozio: scaffali con barattoli e farine), scura e un po' sfocata; il logo è un quadrato con «PQ» (nessun logo caricato).
- *Perché conta:* la copertina dà l'idea di un vero negozio, ed è un punto di forza. Il logo con le iniziali è accettabile.
- *Correzione:* nessuna urgente. Se si fa una foto nuova, meglio una di giorno, con la porta e il banco. Il logo «PQ» può restare.

**P8. Bollino «Consegna rapida» e «Consegna oggi».** (vista; dedotta la promessa)
- *Cosa vede:* sulla pagina «Consegna rapida», «Consegna oggi», «Consegna a casa, all'ora che scegli». Di notte: «Chiuso ora». Nelle schede prodotto: «Il negozio è chiuso ora, riapre alle 09:00: in cassa scegli l'ora della consegna».
- *Perché conta:* il dato è onesto: dice che è chiuso e quando riapre. La parte da controllare è «consegna rapida (30-60 minuti)»: dipende dai fattorini disponibili al lancio, che non ho potuto verificare.
- *Correzione:* tenere il bollino solo se c'è un fattorino pronto il 15/11. Da chiedere a Nicola e a @operations.

**P9. Il blocco di testo sulla consegna.** (visto, 100%)
- *Cosa vede il cliente, sotto il prezzo, in 3 righe da telefono:* «Consegna MyCity 3,00 € una volta sola per tutto il carrello, all'ora che scegli in cassa; 1,00 € in più per ogni negozio in più e 1,00 € in più per ogni negozio dove spendi meno di 10,00 €; la consegna veloce 1,00 € in più, compresa se un negozio è sotto i 10,00 €».
- *Perché conta:* è una frase da 50 parole con quattro condizioni. Un cliente anziano non sa quanto pagherà. Il prodotto costa 2,05 euro e la consegna 3,00: il costo più grande è quello che si capisce meno.
- *Correzione:* mostrare due righe: «Consegna 3,00 € (1,00 € in più se ordini meno di 10 € da questo negozio)» e un link «Come si calcola». La modifica è sul sito: la propongo a @frontend-dev, 🟡/🔴 perché cambia un testo visibile ai clienti.

**P10. «Reso entro 14 giorni, esclusi i prodotti freschi».** (visto, 100%)
- *Cosa vede:* il cliente legge la frase di reso. Ma tutti e 5 i prodotti sono freschi o deperibili (kefir, hummus, pudding, pesto aperto).
- *Perché conta:* la frase fa sembrare possibile un reso che non lo è. Non è un errore di legge (è la formula corretta), ma crea una promessa vuota.
- *Correzione:* per i prodotti freschi scrivere: «Alimento fresco: non si restituisce. Se c'è un problema, scrivici e ti rimborsiamo». Da far approvare a @legale-privacy.

**P11. Bollini «Bio» sulle schede.** (visto)
- *Cosa vede:* il bollino verde «Bio» compare solo su kefir 400 g e kefir di capra. Pudding, hummus e pesto hanno «bio» nel nome ma non il bollino né «Biologico: Sì» nella tabella.
- *Perché conta:* incoerenza. Un cliente che filtra per «Bio» perde 3 prodotti su 5.
- *Correzione:* aggiungere l'attributo bio ai 3 prodotti, solo se il negozio conferma dall'etichetta («Bio» come marchio dell'UE).

**P12. Categorie diverse per lo stesso tipo di prodotto.** (visto)
- *Cosa vede:* kefir di capra sta in «Latticini & Formaggi»; kefir 400 g (anch'esso latte) sta in «Alimentari». Stesso tipo di prodotto, due posti.
- *Perché conta:* chi cerca per categoria vede 1 kefir su 2.
- *Correzione:* spostare il kefir 400 g (e il pudding, che è un dolce al latte) nelle sottocategorie giuste. È un dato del catalogo: lo propongo al negozio/Nicola.

### Percorsi riusciti (per completezza)
- Scheda prodotto da telefono: nome, prezzo con «IVA inclusa», «Paghi in contanti alla consegna», pulsanti «Aggiungi al carrello» e «Compra ora · paghi alla consegna» chiari, tutti sopra i 44 px.
- Nessun elemento va fuori dallo schermo (larghezza 390 = larghezza pagina).
- Recensioni: 0. La pagina dice «Sii il primo a recensire» e spiega che recensisce solo chi ha un ordine consegnato: onesto.

### Ordine di lavoro proposto (effetto atteso)
Misura finale: clienti che arrivano alla scheda e aggiungono al carrello. Dato di oggi: nel database ci sono solo 4 righe d'ordine storiche per questo negozio; non so di che ordini si tratti e non ho un dato di abbandono. Stime sotto: sensazione mia, non dato.
1. P1 + P3 + P4 (descrizione e bollini): 10 minuti di lavoro, nessun codice. Evita il primo cliente deluso.
2. P5 (allergeni): 3 foto del negozio. Evita un rischio per la salute e una contestazione.
3. P2 + P9 (ricerca e testo consegna): modifica del sito, tramite @frontend-dev.
4. P6, P11, P12: ritocchi di catalogo, col negozio.

Candore: non propongo di rifare la pagina. Le frizioni trovate sono di testo, foto e catalogo, non di layout. Chi le toglie è il negozio con me, non il design.

**Passaggi.** PASSO-A @legale-privacy: P4, P5, P10 (claim ambientale, allergeni, reso). PASSO-A @frontend-dev: P2 (ricerca per nome negozio), P9 (testo consegna). PASSO-A @designer: P6 (mini-guida foto). PASSO-A @operations: P8 (rider al lancio).

**Scorecard (RUBRICA-LIVELLI, 1-5).** Diagnosi sul flusso reale: 4. Evidenza (dati e immagini): 4. Esecuzione/artefatto: 4. Ownership del KPI: 3. Visione di sistema: 3. Idea nuova: 3. Assi più bassi: ownership del KPI e idea nuova (nessun dato di abbandono reale: con così pochi ordini non esiste).
