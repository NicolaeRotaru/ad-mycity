---
data: 2026-11-01 12:30
tipo: strategia
fonte: AD digitale
richiesta: «voglio parlare con te per capire cosa serve al marketplace per essere pronto… ciò che ci diciamo qui verrà usato come base per i prossimi mesi» (Nicola, 2026-11-01)
---

# La base dei prossimi mesi: cosa vuol dire «pronto» e come ci arriviamo

> **In due righe.** Il 1° novembre abbiamo parlato per una mattina intera, ed è la prima volta da quando è nato il progetto. Qui c'è tutto quello che hai deciso, con i motivi, i rischi e la strada fino al 15 novembre.

## In parole semplici

MyCity apre come sito di consegne del quartiere. Il sito dev'essere pronto entro domenica 15 novembre, con contanti e carta accesi. All'inizio c'è un negozio solo, Pane Quotidiano. Consegni tu in bici, e i primi clienti arrivano dal fornaio e dal cartello col QR.

La visione è questa: dare al piccolo negozio gli strumenti di una grande catena, senza che debba imparare niente. Dopo poche settimane il negozio vende a clienti nuovi, butta meno, perde meno tempo e conosce i suoi numeri. È per questo che paga 50 euro al mese, non per una vetrina.

Per la tua paura più grande, cioè il sito che si rompe davanti al cliente, abbiamo scelto tre livelli. Il sito fa suonare i telefoni in pochi secondi. Il Pannello controlla tutto ogni 5 minuti, senza spendere crediti. L'AD ragiona con calma e ti prepara le diagnosi.

## Cosa cambia per te

- **Quattro regole di MyCity sono cambiate, con la tua firma.** Il 10% vale su tutto, anche sui clienti che il negozio aveva già. Il negozio ha un'app sua, solo per gli ordini. Le anteprime da approvare stanno sul sito, non su WhatsApp. A dicembre i negozi nuovi possono entrare.
- **La data dipende da lunedì 2 novembre.** La partita IVA apre la strada al conto Stripe di MyCity. Senza la carta non si apre, quindi Stripe decide il giorno vero.
- **La partita IVA la decidi lunedì col commercialista.** Se scegli di aspettare, mancano il conto Stripe di MyCity e il tuo nome sul sito. E senza carta hai scelto di non aprire.
- **L'app che suona arriva dopo il 15.** Fino ad allora il fornaio riceve l'email e tu lo chiami a ogni ordine.
- **L'AD resta spento finché il sito ha difetti.** Intanto la guardia e il conto della sera li fa il Pannello, che non costa crediti.

## Cosa devi fare

- **Lunedì 2 novembre, circa mezza giornata:** partita IVA e PEC dal commercialista, poi il cambio della chiave del database con me, poi le chiavi del sito su Vercel. L'ordine esatto è nella tua lista.
- **Lo stesso giorno:** apri il conto Stripe di MyCity appena hai la partita IVA, e chiedi al fornaio di finire il suo.
- **Prima del 15:** la borsa termica, il testo della home, la cancellazione del negozio di prova.
- **Quando ti porto le scelte di ogni ondata:** una risposta breve, al massimo tre domande alla volta.

## Cosa non ho verificato

- **La produzione l'ho vista solo dai nomi delle chiavi su Vercel.** Il database vero, Stripe e il server spento li conosco dalla memoria, non da una lettura di oggi.
- **I tempi di Stripe non li posso prevedere.** Se verifica in tre giorni si apre il 15; se ci mette due settimane, la data scivola.
- **Le regole di legge le ho controllate su fonti trovate in rete**, non tutte sui testi ufficiali. Un professionista le deve confermare.
- **Non ho controllato se il piano Max si può usare per un servizio che vendi ai negozi.** Lo verifico prima di costruire la macchina per le botteghe. Se non si può, cambia il costo dei 50 euro.

---

## 1 · Cosa vuol dire «pronto»

- **Aperto alla città:** chiunque a Piacenza ordina, e tu non devi seguire ogni ordine a mano.
- **Pronto entro il 15 novembre.** È la data entro cui tutto deve funzionare, non per forza il giorno del primo ordine. Il 15 è domenica e il forno è chiuso: i primi ordini veri arrivano lunedì 16.
- **Con la carta.** Hai scelto di aspettare la carta: senza, non si apre.
- **Anche con un negozio solo.** Volevi dieci negozi, ma se al 15 c'è solo Pane Quotidiano si apre lo stesso.
- **Il cuore oggi è il sito con le consegne.** WhatsApp, buoni regalo e welfare aziendale arrivano dopo.
- **Niente prova generale.** La prova è il primo ordine vero.

## 2 · Il negozio e l'app che suona

Hai chiesto che funzioni come Glovo e Deliveroo: arriva un ordine e il telefono del negozio suona finché qualcuno lo accetta.

Oggi il sito non lo fa. Il fornaio riceve solo un'email, e la notifica sul telefono parte al massimo una volta, fino a 5 minuti dopo. Non squilla e non ripete.

La scelta:
- **Un'app Android piccola, con una schermata sola:** l'ordine e il tasto «Accetto». Suona come una sveglia anche a schermo spento.
- **Dopo 5 minuti senza risposta suona anche la tua app.** Tu hai la stessa app, che ti avvisa anche a ogni ordine accettato.
- **Si installa dal file, alla visita, fino a 10 negozi.** Si apre un link, il telefono chiede il permesso, si installa. Costa zero.
- **Intanto si attiva il Play Store, con il conto personale.** Google chiede prima un test: 12 persone per 14 giorni. Lo facciamo dopo l'apertura, coi primi negozi e clienti. Dall'undicesimo negozio si passa allo store.
- **Apple per ultima.**
- **Tutto il resto il negozio lo vede sul sito.** Le anteprime da approvare stanno lì, con un avviso dall'app e per email.
- **Gli ordini che oggi il fornaio prende per telefono e WhatsApp** entrano col link «ordina da me», che lui manda ai suoi clienti.

## 3 · Le consegne

- **Consegni tu in bici, fino a 5 km dal negozio, tutte e 7 le fasce, tutti i giorni.** Le fasce seguono comunque gli orari del negozio.
- **Al massimo 5 ordini per fascia all'inizio.** Il numero lo cambi tu. Oggi il sito non ha limiti: se arrivano 8 ordini alle 18, li accetta tutti.
- **Se non puoi, consegna un familiare o un fattorino.** In tutti e due i casi vale come fattorino: account, compenso, e la posizione INAIL prima della prima consegna.
- **Il ritiro in negozio è acceso dal primo giorno.** Per il cliente è gratis, così fai meno consegne.

## 4 · I soldi

- **Il 10% vale su tutto,** anche sui clienti che il negozio aveva già e sul ritiro. Copre tutto il servizio, non solo la consegna.
- **Esempio:** la signora che ordinava la torta per telefono ora la ordina sul sito. Il fornaio paga 2 euro su 20. È una scelta tua, e il discorso ai negozi va detto così: il 10% paga il sito, la cassa, la consegna, gli strumenti e i clienti nuovi.
- **I contanti delle consegne li incassi tu** e il lunedì fai il bonifico al negozio, meno il 10%.
- **Il ritiro si paga con carta online, oppure in contanti al banco.** Sui contanti al banco il 10% si toglie dal bonifico del lunedì. Se in una settimana non basta, va nella fattura del mese con l'abbonamento. È lo stesso modo in cui fanno le piattaforme.
- **L'abbonamento da 50 euro** resta sospeso finché il negozio non incassa.
- **Ogni sera alle 21:30 il conto della giornata:** venduto, contanti, bonifici da fare. Lo fa un programma, senza IA. L'esperto di contabilità entra solo se i numeri non tornano.

## 5 · Il cliente

- **Arriva dal forno:** il fornaio lo dice al banco, e in negozio c'è il cartello col QR.
- **Crea un account con email e password**, come oggi, prima di pagare.
- **Riceve gli avvisi per email:** ordine accettato, in consegna, consegnato.

## 6 · I guasti: tre livelli che si guardano a vicenda

Le tue tre paure sono i soldi sbagliati, il negozio che non sa dell'ordine e le pagine con errori.

Ho controllato cosa vedrebbero oggi i sensori dell'AD. La risposta onesta è niente. Il server è spento dal 7 ottobre, e il canale verso il tuo telefono non è mai stato collegato. Anche quando girava, d'estate la home ha dato errore 219 volte di fila senza nessun allarme.

Per questo i livelli sono tre:
1. **Il campanello: il sito.** Appena nasce un ordine, squilla il telefono del negozio.
2. **La guardia: il Pannello, ogni 5 minuti.** Prova home, cassa e login, legge gli errori nuovi, controlla i dati. Se qualcosa non va scrive negli Avvisi e ti manda una notifica. Gira separato dal sito, quindi ti avvisa anche quando il sito è giù. Non usa l'IA, quindi non costa crediti.
3. **Il ragionamento: l'AD, con calma.** Fa il conto della sera e, quando c'è un guasto, ti prepara la diagnosi: dove, perché, cosa colpisce, come ripararlo. La riparazione la fai tu con Claude Code.

Il tasto «ferma gli ordini» c'è sia nel Pannello sia nell'app, e blocca la cassa del sito finché non lo riaccendi.

## 7 · I negozi dopo l'apertura

- **Cinque o più a settimana, a partire dal fresco vicino al forno:** frutta e verdura, macelleria, gastronomia. Il cliente fa la spesa in un carrello solo.
- **Prima delle visite, la squadra mappa tutti i negozi di fresco entro 5 km** e li mette in fila per chi conviene di più.
- **Sui primi dieci, un dossier completo:** chi è, cosa vende e a quanto, come convincerlo, e soprattutto **cosa ci guadagna lui, visto dal suo punto di vista.**
- **Dopo l'entrata:** i numeri ogni settimana a costo zero, gli esperti ogni mese o subito se il negozio cala.
- **Gli uffici e le aziende vicine** (colazioni, riunioni, regali) partono subito dopo l'apertura.
- **Niente contenuti social per i negozi, per ora.**
- **A dicembre si entra.** La regola «a dicembre niente negozi nuovi» non aveva fonte nelle ricerche, e l'hai tolta.

## 8 · Gli strumenti del negozio: il passo da gigante

Il fornaio oggi riceve tanti ordini per telefono e WhatsApp, e li segna a mano. Gli strumenti partono da lì.

**Nella prima ondata:**
- **«Finito per oggi» con un tocco,** che la mattina dopo riparte da solo. E **«chiuso fino al…»** con un tocco, per le ferie.
- **Prodotti in un attimo.** Le prime foto le fai tu alla visita, poi le fa lui. Per ogni foto l'AD scrive una scheda completa e professionale. Per i confezionati basta il codice a barre: la banca dati gratuita Open Food Facts dà nome, ingredienti, allergeni e foto. Prezzo e allergeni li conferma sempre lui, perché ne risponde lui.
- **Il report del lunedì in euro,** e **la lista dei suoi clienti da scaricare** quando vuole: i clienti sono suoi.

**Più avanti:** la busta di fine giornata, la lista di produzione del mattino, la caparra per le torte, la stima di quanto fare domani, il cartello degli allergeni, gli ordini che si ripetono da soli, le prenotazioni.

**I contributi:** oggi nessun bando è aperto, e il credito d'imposta probabilmente non vale sull'abbonamento. Non li promettiamo. L'AD li segue e prepara la domanda quando ne esce uno.

## 9 · L'AD, i crediti e il server

- **Si resta sul piano Max di oggi.** Non si paga mai un'API di IA. Le 18 funzioni del sito con l'IA a pagamento restano spente: quel lavoro lo fa l'AD.
- **Prima il programma, poi l'IA.** Un programma fa i conti; l'IA parte solo quando c'è qualcosa da capire o da scrivere.
- **Lo sforzo giusto:** modello piccolo per i lavori semplici, grande solo per diagnosi, strategia e collaudi.
- **Ogni negozio ha un tetto di consumo al mese,** misurato dal primo negozio e letto nel Pannello.
- **Il server dell'AD si riaccende quando il sito non ha più difetti.** Dopo resta sempre acceso.
- **Da solo, l'AD fa quattro lavori:** le diagnosi dei guasti, le analisi dei negozi, il piano del mattino e il report della sera, la ricerca settimanale su concorrenti ed eventi.
- **Quando deve scegliere, prima il sito che vende.** La macchina che migliora se stessa viene dopo.

## 10 · Le regole: cosa è cambiato oggi

**Cambiate, con la tua firma:**
1. **Il 10% vale su tutto.** Prima la regola diceva «niente percentuale su quello che il negozio vendeva già».
2. **Il negozio ha un'app sua, solo per gli ordini.** Prima: nessuna app nuova da imparare.
3. **Le anteprime si approvano sul sito, con un avviso.** Prima: su WhatsApp.
4. **A dicembre i negozi nuovi entrano.** Prima: a dicembre stop agli ingressi.

**Restano:** il cliente è del negozio · il primo risultato si vede in cassa in 2-4 settimane · il negozio lo prepariamo noi · i numeri in linguaggio di cassa · su WhatsApp mai spam · i soldi dentro Stripe, con l'eccezione dei contanti che incassi tu · la lista delle cose da non costruire mai.

## 11 · I rischi che hai scelto di correre

Sono scelte tue, non dimenticanze. Le riprendo quando arrivano gli ordini.

- **L'avvocato rilegge dopo il lancio:** i Termini, il contratto col fornaio, i contanti che incassi per conto del negozio.
- **Il corso HACCP e la polizza arrivano dopo.** Subito c'è solo la borsa termica, perché è la prima impressione del cliente. Il rischio: il corso per chi trasporta alimenti è un obbligo in Emilia-Romagna, e senza polizza, se cadi in consegna, non ti copre nessuno.
- **La chiave del database si cambia lunedì,** e la decisione sul Garante della privacy arriva subito dopo. La scadenza del 27 ottobre è già passata.

## 12 · La strada fino al 15 novembre

**Lunedì 2 novembre, tu, in quest'ordine:**
1. Partita IVA e PEC.
2. Il cambio della chiave del database.
3. Le chiavi del sito su Vercel, come dice la tua lista.
4. Il primo giro a mano dei lavori automatici.
5. Il resto della giornata, come nel blocco «Cosa devi fare» in cima.

**Il sito, primo binario (soldi e cassa):** l'ultima ondata già prevista, poi i difetti dei soldi della carta, poi la scelta uno per uno dei difetti gravi che si incontrano al lancio, e il tuo nome sul sito appena c'è la partita IVA.

**Il sito, secondo binario (le scelte di oggi):** il ritiro in negozio · il limite di 5 ordini per fascia · il tasto «ferma gli ordini» · l'avviso subito al fornaio con nuovo squillo e l'allarme a te dopo 5 minuti, dal browser finché non c'è l'app · «finito per oggi» e «chiuso fino al» · il report del lunedì · la lista clienti da scaricare · il codice a barre gratis · lo spegnimento di quello che costa o rompe le regole.

**Il Pannello, la guardia:** sistemare due date che scadono il 15 all'una di notte · il giro ogni 5 minuti · le prove di home, cassa e login · gli errori nuovi · gli Avvisi senza doppioni · la notifica sul tuo Android · le regole che distinguono «non riesco a leggere» da «va tutto bene» · il tasto «ferma gli ordini» · lo spegnimento dei giri che chiamerebbero l'IA a pagamento · il conto della sera.

**I prodotti di Pane Quotidiano:** le foto alla tua visita, le schede scritte dall'AD in una sessione, e tu che le carichi.

**La previsione onesta:** contanti e ritiro sono pronti in tempo, se lunedì 2 novembre partita IVA e chiavi sono fatte. La carta dipende da Stripe: la data più probabile per avere tutto pronto è fra l'11 e il 13 novembre, con qualche giorno di margine.

## 13 · Dopo il 15 novembre

1. L'app Android per il fornaio e per te.
2. Avvocato, corso HACCP, polizza.
3. Le riparazioni del Pannello e dell'AD, poi il server riacceso.
4. La mappa dei negozi e i primi dieci dossier, poi cinque negozi a settimana.
5. Gli uffici vicini.
6. La crescita a passi:
   - prima Google e le recensioni;
   - poi le email ai clienti, i giornali e il Comune;
   - poi il riordino con un tocco, il passaparola con premio, gli eventi in città;
   - infine welfare aziendale e pubblicità, quando c'è la prova che i clienti tornano.
7. Gli altri strumenti del negozio.
8. La verifica dei termini del piano Max per il servizio ai negozi.

---

## Dettagli tecnici

### Fatti registrati il 2026-11-01 12:18 (`MyCity-Vault/90-Memoria-AI/registro-fatti.json`)
- Aggiornati: `pricing.commissione`, `prodotto.paletti`, `strategia.segmenti-onboarding`.
- Nuovi: `lancio.data`, `ritiro.in-negozio`, `consegna.capienza`, `avvisi.negozio`, `controllo.tre-livelli`, `soldi.conto-della-sera`, `ad.uso-e-crediti`, `negozi.ingresso`, `negozi.prima-ondata`, `rischi.scelti-al-lancio`.
- Restano validi: `pagamenti.al-lancio`, `pricing.abbonamento`, `consegna.raggio`, `consegna.fasce-orarie`, `logistica.fattorino-esterno`, `legale.termini-rilettura`, `finanza.soglia-costi-extra`, `calendario.novembre-regali`.

### Sensori dell'AD sul sito vero (letti il 1/11, solo codice e file)
- Server fermo dal 7/10; ultimo controllo di salute 1/9. Sentinella dei dati ultima lettura 2026-08-21 20:41.
- Telegram mai collegato: i 29 avvisi di `avvisi-macchina.json` hanno canale «casella»; `CHECKLIST-NICOLA.md` chiede ancora di creare il bot.
- Home in 503 dal 30/7 al 1/9 per 219 giri senza allarme: l'uptime è escluso dall'allarme (`cervello/verifica-sensori.mjs:106`, `cervello/sentinella-dati.mjs:306-309`).
- Regola dei ritardi A6 morta: chiede `expected_delivery`, che il sito non ha (`cervello/ordini-in-ritardo.mjs:46`).
- Stripe letto solo come saldo (`sensore-cassa.mjs`); Sentry, log di Vercel e PostHog mai letti.

### Il sito (`NicolaeRotaru/mycity`, main `045df7f`)
- Le richieste NicolaeRotaru/mycity#267–#272 sono tutte unite; poi i Termini 3.0 con NicolaeRotaru/mycity#273 e la data «in vigore dal 1 novembre 2026» con NicolaeRotaru/mycity#274 (1/11, 10:14 e 10:40). Le analisi del sito di questo documento leggono il codice di `045df7f`, cioè prima di quelle due.
- Vercel produzione ha 12 variabili. Mancano `SUPABASE_SERVICE_ROLE_KEY` (la usano `app/api/orders/cod/route.ts:312` e `app/api/stripe/checkout/route.ts:136`: senza, non nasce nessun ordine), `RESEND_API_KEY`, `RESEND_FROM`, `SUPPORT_EMAIL`, tutte le `STRIPE_*`, `SENTRY_DSN`, Upstash, `LAVORI_A_ORARIO`, `NEXT_PUBLIC_TITOLARE_*`. `TURNSTILE_SECRET_KEY` risulta leggibile (avviso di Vercel).
- Avviso al negozio: riga in `notifications` + email subito (`cod/route.ts:1358-1381`, `:1449`); push solo dal lavoro `send-push` ogni 5 minuti (`vercel.json`), `vibrate:[50,30,50]` senza ripetizione (`public/sw.js:296`); pagine del venditore a polling 90-120 s (`app/seller/orders/page.tsx:142`); app installabile spenta (`lib/funzioni-al-lancio.ts:112`). Allarme all'admin per ordine fermo solo dopo 60 minuti (`app/api/cron/operational-alerts/route.ts:70-91`).
- Registro: 4 bloccanti aperti (46 titolare e P.IVA, 80 falla R7, 432 rilascio che non aspetta la CI, 1076 rilascio che non applica le migrazioni) e 131 gravi, circa 95 raggiungibili al lancio.
- Lavori nuovi: ritiro (`lib/ritiro-in-negozio.ts:19`; le rotte lo forzano spento a `cod/route.ts:309` e `stripe/checkout/route.ts:133`; il ritiro è già gratis in `lib/shipping.ts:74`) M · limite per fascia (niente data della fascia negli ordini; da far rispettare in tutte e due le rotte, anche col pagamento a carta in corso) M–L · interruttore «ferma gli ordini» M · push subito + nuovo squillo + allarme dopo 5 minuti, via browser S–M (Firebase nativo L+) · codice a barre: oggi usa l'API a pagamento (`app/api/ai/barcode-lookup/route.ts:66,104-111`) → Open Food Facts S–M.
- Difetti dei soldi della carta prima di accenderla: dispute 1267, 1268, 1317; doppi rimborsi 1287, 1313, 2096, 2133, 2144; 177.
- Funzioni del venditore che rompono le regole: clienti senza esportazione (`app/seller/customers/page.tsx:227-231`); «Sfondo bianco» a pagamento fuori dall'interruttore (`ProductImagesField.tsx:230-236`); lavoro orario `external-price-alerts` che chiama l'IA a pagamento; punteggio stile Strava e consiglio «+70%» (`app/seller/dashboard/page.tsx:361-363,462,473`); «VIP 4×» (`customers/page.tsx:219`); visite e conversioni (`analytics/page.tsx:330-343`).

### Il Pannello come guardia (`pannello/`)
- Oggi ha solo due giri al giorno (`pannello/vercel.json`), nessuna prova del sito, nessun Sentry, nessuna notifica push (`public/sw.js:3-5`).
- `/api/alert` ignora `dati_affidabili`; `/api/anomalie` perde l'esito della lettura (`marketplace-db.ts:83,117`): una lettura fallita sembra «tutto bene».
- Il conto della sera esiste a pezzi: `getRiconciliazionePayout` (`marketplace-db.ts:622`) conta da sempre; `cervello/bilancio-vivo.mjs` legge `STATO.md` e usa il 12% (`:21-22,41-44`).
- Il giro delle 9:00 chiama l'API a pagamento se c'è la chiave (`heartbeat/route.ts:104-145`) e accoda lavori al server spento (`:62-87`).
- La serratura confronta il segreto dei giri con `PANNELLO_TOKEN` (`serratura.ts:150-155`): il giro delle 19:07 probabilmente viene rifiutato ⚪.
- Il 15/11 alle 01:00 scadono `cervello/documenti-di-governo.mjs:69` e l'esenzione in `cervello/atti-con-porte.json:35`: diventano rossi `test-cervello.yml` e `cancello-lotto.yml` su ogni PR. Non cancellare `round2-applica.mjs` (falsi allarmi); aggiornare lo scadenzario nella stessa PR.

### Leggi, fisco, consegne — i 12 bloccanti prima di aprire (da confermare coi professionisti)
- P.IVA, REA, PEC, INPS; dati del titolare sul sito (D.Lgs 70/2003 art. 7).
- Termini del consumatore: negozio venditore, esclusioni del recesso per i deperibili (Codice del Consumo art. 59).
- Contratto venditore secondo il regolamento P2B; la bozza `consegne/legale/contratto-pane-quotidiano-bozza.md` dice 12% e MyCity unico titolare dei dati → da riscrivere.
- Minimo del DSA: punto di contatto, modulo di segnalazione.
- Contanti incassati per conto del negozio: parere legale (D.Lgs 11/2010 art. 2).
- Fatture: commissione mensile via SDI; col forfettario niente IVA, quindi «IVA inclusa» va corretta.
- HACCP per chi consegna (DGR Emilia-Romagna 311/2019), borse termiche, eventuale notifica all'AUSL ⚪.
- INAIL non copre la ditta individuale nel commercio: polizza infortuni privata e RC; fattorini con contratto e INAIL a carico di MyCity.
- Stripe Connect live, Resend col dominio verificato, ruoli GDPR e accordi coi fornitori.

### Contraddizioni in memoria da sistemare (nel registro, non un'ondata)
1. La bozza del contratto col fornaio dice 12%, «nessuna fee», MyCity unico titolare.
2. I ruoli GDPR: CONTESTO §10 dice negozio titolare e MyCity responsabile; il contratto dice il contrario.
3. «IVA inclusa» sulla commissione, che col forfettario non ha IVA.
4. La decisione sul Garante, scaduta il 27/10.
5. `CHECKLIST-NICOLA.md`: l'intestazione dice 57 voci, sono 61 aperte; 40 prima del primo ordine, non 33.
6. Il piano del 31/10 dice ancora «primo cliente in contanti il 5-6/11».

### File di Nicola da aggiornare col suo ok (il vault fuori da `90-Memoria-AI/` è suo)
- `MyCity-Vault/06-Piani/Business Model Canvas.md`, `Piano Finanziario.md`, `Piano Vendite.md` dicono ancora che il 10% «serve a pagare la consegna» e «non è un margine sullo scontrino che il negozio faceva già».

### Analisi di oggi
- Quattro letture in sola lettura: avviso al negozio sul sito, sensori dell'AD, Pannello come guardia, sito pronto per aprire, leggi e consegne, funzioni del venditore. Nessuna riga di codice toccata.
