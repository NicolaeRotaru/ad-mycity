---
data: 2026-08-13 10:20
---

# Radiografia di tutta la macchina — e la notte che l'ha messa alla prova

**In due righe:** la flotta di controllo è morta a metà notte senza avvisare. Ho salvato il lavoro già fatto e ho eseguito le prove una per una. La scoperta più grossa: la contabilità con cui mi giudico perdeva da entrambi i piatti.

**In parole semplici**

Hai chiesto la radiografia più profonda possibile. Sono partite sedici squadre di controllo su sei organi. Poco dopo l'una di notte il contenitore cloud si è addormentato tra un turno e l'altro. Le squadre sono morte con lui, in silenzio. Io aspettavo un avviso che non poteva più arrivare. Te ne sei accorto tu alle otto e mezza. Quel buco è ora una scheda del cantiere. E il rimedio l'ho già montato su di me: ogni flotta lanciata dal cloud parte con un promemoria che dopo venti minuti controlla il giornale di bordo.

Il lavoro pagato non è andato perso. Quindici squadre su sedici avevano già riconsegnato nel giornale, e da lì ho recuperato 65 difetti. Poi ho cambiato metodo. Ogni difetto serio dichiara un comando che deve diventare rosso se il difetto esiste. Ne ho eseguiti 29, e 29 sono diventati rossi. Altri 9 sono difetti visivi del Pannello: quelli per natura chiedono un occhio umano. I due mandati rimasti orfani li ho rifatti stamattina. Gli agganci automatici di git, quelli che chiamiamo hook, li ha ripassati una squadra nuova: un difetto serio e tre piccoli, compresa la causa degli errori rossi che sporcano i verdetti da stanotte. I guardiani del codice li ho ripassati io a mano. Lì niente di nuovo, in tutta onestà: il terreno era già coperto da schede aperte.

**Cosa cambia per te**

Primo: la contabilità bucata. È la scoperta che riscrive il mese. Il voto che mi do da sola diceva 0,23. Cioè: chiudo 23 difetti e ne apro 102, quindi vietato cercare, solo chiudere. Ho controllato nella storia dei file, e i buchi sono due. Sul piatto delle chiusure: 71 chiusure dei primi dieci giorni di agosto sono senza data. Il contatore le butta fuori dal mese. Il conto vero fa circa 94 chiusure su 102: cioè 0,92, quattro volte meglio. Sul piatto delle aperture: la radiografia di ieri ha raccontato 163 difetti, ma nel registro ne ha scritti 2. Gli altri 161 vivono solo nella lettera. La Cabina non li ha mai visti. Nessun lotto potrà mai ripararli. Non stavo annegando: quasi pareggiavo. Ma il contatore perdeva i miei meriti, e il registro perdeva i miei ritrovamenti.

Secondo: il bloccante. Il battito quotidiano è fermo. L'ultimo Piano del mattino è del 30 luglio, quattordici giorni fa. Il worker in sé da ieri sera ha ripreso a pubblicare la memoria. Ma i lavori a orologio muoiono tutti, e il giro di stanotte è morto a tempo scaduto. Il guasto identico di fine luglio era stato chiuso con una frase: «il server è tornato a pubblicare». Nessun rimedio montato. Così alla ricaduta nessuna card ti ha avvisato.

Terzo: il cantiere cresce dei difetti veri di stanotte. 71 schede nuove dopo il confronto con le 223 già aperte. Una blocca, 40 sono serie, 30 piccole. Trentuno portano una prova eseguita oggi e diventata rossa. Sedici chiedono i tuoi occhi o un browser.

Cosa non ho verificato, in una riga: il VPS non si vede da qui, il dominio del sito nemmeno, e i giri due e tre della radiografia non sono stati fatti. Il dettaglio è nel capitolo in fondo.

**Cosa devi fare**

1. Guarda le tre card nuove in coda. Sono l'allarme che i guardiani non hanno dato: far ripartire le cadenze sul VPS, riparare il contatore delle chiusure, aprire il sito dal telefono. Dieci secondi al telefono dicono se il rosso del sensore è un incendio vero o solo un indirizzo vecchio della migrazione.
2. Firma la richiesta di unione di questo report. Porta le 71 schede nel cantiere e le card in coda.
3. Dimmi se dopo la riparazione del contatore posso riaprire le ricerche. Col conto vero la regola che hai approvato darebbe quasi via libera. Ma la firma è tua.

---

## Quanti, e dove

| Organo | Totale | Bloccanti | Seri | Piccoli |
|---|---|---|---|---|
| Il cervello e il worker | 29 | 0 | 17 | 12 |
| Il Pannello | 17 | 0 | 9 | 8 |
| I senior | 11 | 0 | 9 | 2 |
| La memoria e i registri | 7 | 1 | 3 | 3 |
| La repo e gli hook | 6 | 0 | 1 | 5 |
| Il canale WhatsApp senza padrone | 1 | 0 | 1 | 0 |

**Come sono provati.** 31 con un comando eseguito oggi e diventato rosso. 16 da occhio umano, dichiarato scheda per scheda. 24 piccoli, dove la regola ammette anche la ricerca di parole. Un doppione è stato scartato prima di entrare, e la scheda vecchia è stata aggiornata col dato fresco.

## Il bloccante: il battito è fermo e non te l'ha detto nessuno

Il quadro misurato: sei cadenze su sei fallite all'ultimo giro. Il punto non è solo il guasto. È che la volta scorsa fu chiuso con una frase, senza montare l'allarme. Le schede sul meccanismo esistevano già: l'allarme che esce da un canale spento, il battito che si dichiara vivo da fermo. Sono agganciate alla scheda nuova. La riparazione ha due pezzi. Rimettere in moto i lavori a orologio, e serve una mano sul VPS. Poi montare l'allarme che alla prossima ricaduta ti mette una card in coda da solo.

## La contabilità bucata che mi teneva il freno tirato

La regola è sana: se apro più di quanto chiudo, smetto di cercare e chiudo. Ma il contatore conta una chiusura solo se ha la data. 74 chiusure sono senza, e la storia dei file prova che 71 sono di questo mese. Così una macchina che quasi pareggia sembrava una che annega. E ogni giro ha girato col freno tirato. Dall'altro piatto, i ritrovamenti di ieri non sono mai diventati schede. C'è anche la beffa, trovata da una delle squadre: quel freno vale solo per il giro. Le radiografie non lo guardano nemmeno. Frenava il lavoro sbagliato.

## I tre difetti che questa notte ha dimostrato da sola

**Gli strumenti di misura scrivono quando dovrebbero solo leggere.** Durante una radiografia dichiarata in sola lettura, il contatore delle chiusure ha riscritto la sua ora. E l'archivio del sorvegliante ha buttato via tre righe di storia vera, per far posto a righe vuote prodotte da questa sessione cieca. Ho ripristinato tutto e salvato la prova. È la famiglia della scheda capostipite di ieri sui sensori: misurare non deve mai modificare.

**Il lavoro lungo muore in silenzio.** La flotta è partita alle 00:20 ed è morta alle 01:12. Nessun avviso fino alla tua domanda delle 08:35. La causa: il contenitore cloud dove giro si spegne tra un turno e l'altro, e ogni lavoro in sottofondo si spegne con lui senza dire niente. È successo di nuovo stamattina, due volte, alle squadre di recupero. Il promemoria di sopravvivenza che mi sono montata è già servito: al secondo giro ho smesso di aspettare squadre ormai morte e ho fatto io il loro pezzo.

**Il carico si perde tra il racconto e il registro.** La foto della radiografia di ieri ha quarantuno dimensioni e zero difetti dentro. La lettera prometteva: li vedi in Cabina uno per uno. Un difetto non scritto è un difetto che nessuno riparerà mai.

## Cosa non ho verificato, detto chiaro

- Il secondo e il terzo giro non sono stati fatti. Il secondo cerca dove il primo non ha guardato. Il terzo cerca ciò che si vede solo incrociando. Sono debito dichiarato: rifarli stanotte sarebbe finito allo stesso modo. Si fanno quando il lancio avrà il promemoria di sopravvivenza di serie.
- Le squadre hanno dichiarato 105 zone non viste, elencate nelle schede. Non sono verdi: sono buio dichiarato.
- Il VPS non si vede da qui. Tutto ciò che riguarda il worker l'ho letto di riflesso dalla memoria pubblicata.
- Il dominio del sito e l'interfaccia di Vercel non erano raggiungibili da questa sessione. Per questo la card ti chiede i dieci secondi dal telefono.
- Dei guardiani del codice ho ripassato a mano solo i portanti. Il resto sta nel debito dei giri due e tre.

---

**Dettagli tecnici**

- Schede nuove: da `AR-575` a `AR-645` in `cantiere-difetti.json`, tutte con `nato: 2026-08-13` e `nato_come: scoperta`. Il cantiere resta la casa unica dei difetti. La foto `auto-radiografia.json` non è stata toccata: il suo ridisegno sta nella scheda sull'evaporazione di ieri.
- Prove: runner con guardia anti-scrittura. Dopo ogni prova un controllo dell'albero git, e ripristino se sporco. Esiti scheda per scheda nel campo `verifica`.
- Contatore chiusure: `cervello/tasso-chiusura.mjs`, funzione `contaMese`. Prova d'archivio: al 31 luglio 3 chiusure senza data, al 10 agosto 74. Storia allungata apposta con un fetch profondo.
- Evaporazione di ieri: 2 schede nate l'11 agosto nel cantiere. Zero difetti nelle 41 dimensioni della foto. 163 annunciati dal report dell'11 agosto.
- Battito: `node cervello/freschezza-cadenze.mjs` esce rosso su sei cadenze. Card 17, 18 e 19 in `AZIONI-IN-ATTESA.md`.
- Flotta: workflow `radiografia-totale`, run `wf_7e7db8f9-e8d`. 17 partenze, 15 riconsegne nel giornale. Mandato hook rifatto: il cancello dello stop perde due controlli su sei nei cloni accorciati, riprodotto prima dell'allungamento della storia. Più tre piccoli, tra cui gli errori grezzi di git da `percorsi-git.mjs` senza l'opzione `stdio`. Mandato guardiani ripassato inline: terreno di `AR-296` e della scheda sul guardiano cieco.
- Sensore sito: `sensori-cecita.json` segna 503 su `mycity-marketplace.com` da 103 controlli. Ultimo verde il 30 luglio. Aggiornato dal VPS il 12 agosto alle 22:20. Da qui il proxy nega la connessione, e Vercel dava errore temporaneo.
- Manutenzioni fatte per aprire il cancello, con gli strumenti di casa. Decadimento lezioni: `cristallizza-apprendimento.mjs --applica`, 3 lezioni archiviate. Potatura archivio: `pota-apprendimento.mjs --applica`, da 1.070.895 a 965.066 byte. Lo storico del potato sta in `apprendimento-potato.json`. Test del cervello e typecheck del Pannello ora verdi.
