// IL SITO VISTO DA CHI COMPRA — il motore dell'analisi del 29/10/2026 (run wf_b52be27a-121, 38 agenti).
//
// Copia fedele dello script lanciato quella sera, conservata perché una sessione nuova possa RIMISURARE
// dopo le mosse. Non è in .claude/workflows/ apposta: non è un comando rapido finché Nicola non lo chiede.
//
// PER RILANCIARLO cambia tre costanti qui sotto, poi Workflow({scriptPath: <questa copia>}):
//   S       la cartella della sessione nuova, con dentro prod/*.txt e screens/*.png rifatti con
//           cervello/foto-pagine-vere.mjs (vedi consegne/design/2026-10-29-come-riprendere.md);
//   CTX     il contesto aggiornato: parti da CONTESTO-ANALISI.md accanto a questo file e rifai i numeri
//           del catalogo (database in sola lettura) e la data;
//   REPORT  il nome del referto nuovo, con la data del giorno.
// Costo misurato il 29/10: 11,3 milioni di token senza le letture dalla cache. Per rimisurare solo le
// aree toccate da una mossa, togli da DIMS le altre e salta BENCH_FAM (i benchmark non cambiano in un mese).

export const meta = {
  name: 'esperienza-cliente-vs-migliori',
  description: 'Il marketplace MyCity visto dal cliente, requisito per requisito contro Amazon, eBay, Glovo, Deliveroo: 14 aree analizzate da senior, ognuna verificata da un collaudatore, piu giudici a occhio sulle foto delle pagine vere e una sintesi collaudata',
  phases: [
    { title: 'Benchmark', detail: 'cosa fanno davvero i migliori (ricerca web con fonti)' },
    { title: 'Analisi', detail: '14 aree del percorso del cliente, un senior per area (sola lettura)' },
    { title: 'Verifica', detail: 'un collaudatore per area tiene solo cio che regge' },
    { title: 'Occhio', detail: 'giudici a occhio sulle fotografie delle pagine vere + scettico' },
    { title: 'Sintesi', detail: 'pagella e mosse, poi collaudo della sintesi' },
  ],
}

const S = '/tmp/claude-0/-home-user/da22efc2-e453-56b3-a33c-883c7eac400f/scratchpad'
const CTX = `${S}/CONTESTO-ANALISI.md`
const REPORT = '/home/user/ad-mycity/consegne/design/2026-10-29-esperienza-cliente-vs-migliori.md'
const PREMESSA = `Prima di tutto leggi per intero ${CTX}: contiene la domanda di Nicola, i numeri veri del catalogo, dove stanno il codice (/home/user/mycity), il testo delle pagine vere (${S}/prod/*.txt) e le FOTOGRAFIE delle pagine vere (${S}/screens/*.png, si aprono con Read), con i loro limiti. Sola lettura: non modificare nulla.`

const REQ = {
  type: 'object',
  properties: {
    requisito: { type: 'string', description: 'cosa hanno i migliori marketplace, detto semplice' },
    chi_lo_fa_meglio: { type: 'string', description: 'chi e come, in concreto' },
    stato: { type: 'string', enum: ['presente_al_livello', 'presente_sotto_livello', 'mancante', 'presente_ma_dannoso', 'non_verificabile'] },
    strato: { type: 'string', enum: ['guscio', 'contenuto', 'entrambi'] },
    prova: { type: 'string', description: 'file:riga nel codice e/o pagina/foto di produzione con testo citato' },
    impatto_acquisto: { type: 'string', enum: ['alto', 'medio', 'basso'] },
    sforzo: { type: 'string', enum: ['S', 'M', 'L'] },
    proposta: { type: 'string' },
    paletti: { type: 'string', description: '"ok" oppure quale paletto/domanda di CONTESTO_BUSINESS rischia' },
  },
  required: ['requisito', 'chi_lo_fa_meglio', 'stato', 'strato', 'prova', 'impatto_acquisto', 'sforzo', 'proposta', 'paletti'],
}
const PERCORSO = {
  type: 'object',
  properties: { compito: { type: 'string' }, tocchi_mycity: { type: 'string' }, tocchi_migliore: { type: 'string' }, dettaglio: { type: 'string' } },
  required: ['compito', 'tocchi_mycity', 'tocchi_migliore', 'dettaglio'],
}
const AUDIT = {
  type: 'object',
  properties: {
    dimensione: { type: 'string' },
    voto_guscio: { type: 'number', description: '0-10: come e costruito (vale con 2.000 prodotti)' },
    voto_contenuto: { type: 'number', description: '0-10: cosa vede il cliente OGGI con 9 prodotti' },
    riferimento_10: { type: 'string', description: 'cosa vale 10 in questa area (il migliore al mondo)' },
    sintesi: { type: 'string' },
    punti_di_forza: { type: 'array', items: { type: 'string' } },
    requisiti: { type: 'array', items: REQ },
    percorsi: { type: 'array', items: PERCORSO },
  },
  required: ['dimensione', 'voto_guscio', 'voto_contenuto', 'riferimento_10', 'sintesi', 'punti_di_forza', 'requisiti'],
}
const VERIFIED = {
  type: 'object',
  properties: {
    ...AUDIT.properties,
    requisiti: { type: 'array', items: { type: 'object', properties: { ...REQ.properties, verdetto: { type: 'string', enum: ['confermato', 'corretto'] }, nota_verifica: { type: 'string' } }, required: [...REQ.required, 'verdetto'] } },
    scartati: { type: 'array', items: { type: 'object', properties: { requisito: { type: 'string' }, motivo: { type: 'string' } }, required: ['requisito', 'motivo'] } },
  },
  required: ['dimensione', 'voto_guscio', 'voto_contenuto', 'sintesi', 'punti_di_forza', 'requisiti', 'scartati'],
}
const BENCH = {
  type: 'object',
  properties: {
    famiglia: { type: 'string' },
    standard: { type: 'array', items: { type: 'object', properties: { area: { type: 'string' }, pattern: { type: 'string' }, chi: { type: 'string' }, dettaglio: { type: 'string' }, perche_funziona: { type: 'string' }, fonte: { type: 'string' } }, required: ['area', 'pattern', 'chi', 'dettaglio', 'fonte'] } },
    numeri: { type: 'array', items: { type: 'object', properties: { dato: { type: 'string' }, fonte: { type: 'string' }, affidabilita: { type: 'string' } }, required: ['dato', 'fonte'] } },
  },
  required: ['famiglia', 'standard', 'numeri'],
}
const OSS = { type: 'object', properties: { pagina: { type: 'string' }, schermo: { type: 'string' }, cosa_si_vede: { type: 'string' }, giudizio: { type: 'string', enum: ['pregio', 'problema'] }, gravita: { type: 'string', enum: ['alto', 'medio', 'basso'] }, confronto: { type: 'string' }, proposta: { type: 'string' } }, required: ['pagina', 'schermo', 'cosa_si_vede', 'giudizio', 'gravita', 'proposta'] }
const VISUAL = { type: 'object', properties: { lente: { type: 'string' }, voto_complessivo: { type: 'number' }, prima_impressione: { type: 'string' }, osservazioni: { type: 'array', items: OSS } }, required: ['lente', 'voto_complessivo', 'prima_impressione', 'osservazioni'] }
const VISUAL_OK = { type: 'object', properties: { confermate: { type: 'array', items: { type: 'object', properties: { ...OSS.properties, lente: { type: 'string' }, nota: { type: 'string' } }, required: [...OSS.required, 'lente'] } }, scartate: { type: 'array', items: { type: 'object', properties: { osservazione: { type: 'string' }, motivo: { type: 'string' } }, required: ['osservazione', 'motivo'] } } }, required: ['confermate', 'scartate'] }

const DIMS = [
  { key: 'prima-impressione', senior: 'cro', ver: 'qa-designer', titolo: 'La prima impressione (home, primi 5 secondi)', seed: [
    "in 5 secondi si capisce cos'e, per chi e perche conviene a me (proposta di valore in una riga)",
    "il primo gesto e dire DOVE sei (indirizzo/CAP) e da li si vede solo cio che arriva a casa tua (Glovo, Deliveroo)",
    'barra di ricerca dominante e sempre a portata (Amazon)',
    'categorie grandi e visive con foto o icone, scorribili col pollice (Glovo: griglia di bolle colorate)',
    'nella prima schermata si vedono prodotti o negozi VERI con foto, non solo testo',
    'una sola azione principale chiara',
    'prova sociale vera (quanti negozi, recensioni, volti) senza numeri finti',
    'stagionalita: a novembre si vede Natale/regali',
    'niente sezioni in caricamento eterno o vuote',
    "l'unicita: i volti dei negozianti di Piacenza, cio che Amazon non puo avere",
    'la testata non ruba meta schermo sul telefono'] },
  { key: 'navigazione-velocita', senior: 'ux-designer', ver: 'qa', titolo: 'Muoversi veloce: navigazione e numero di tocchi', seed: [
    "CONTA i tocchi (usa il codice e le pagine) per 4 compiti e confrontali col migliore: (a) comprare il kefir di Pane Quotidiano partendo dalla home, (b) trovare un regalo sotto 20 euro, (c) riordinare l'ultimo acquisto, (d) trovare un negozio aperto adesso vicino a casa — mettili in 'percorsi'",
    'barra in basso sul telefono con 4-5 voci essenziali sempre visibile',
    'testata compatta che si riduce scorrendo',
    'menu con poche voci chiare (piu scelte = piu lentezza); voci che portano a pagine vuote',
    "categorie a 2 livelli al massimo, filo d'Arianna",
    'tornare indietro conserva posizione e filtri',
    'aggiungere al carrello senza lasciare la pagina, con conferma visibile e totale aggiornato',
    "scorciatoie per chi torna: 'compra di nuovo', preferiti, ultimi visti",
    'etichette coerenti: stessa cosa, stesso nome ovunque',
    'nessun vicolo cieco: ogni pagina vuota propone dove andare'] },
  { key: 'ricerca-filtri', senior: 'search-relevance', ver: 'qa', titolo: 'Trovare le cose: ricerca, filtri e ordinamento', seed: [
    'suggerimenti mentre scrivi (prodotti, negozi, categorie) con foto e prezzo — Amazon, Glovo',
    "tolleranza ai refusi e sinonimi ('chefir', 'pane' -> panifici)",
    'ricerche recenti e popolari quando tocchi la barra',
    'risultati con foto, prezzo, negozio, tempo di consegna; numero di risultati',
    'filtri utili per il locale: negozio, prezzo, aperto ora, bio, consegna/ritiro; ordinamenti',
    'zero risultati: proposte alternative, mai pagina morta',
    'cercare dentro un negozio',
    'filtri comodi sul telefono (pannello dal basso, numero risultati sul pulsante)',
    'la ricerca ricorda la parola cercata tornando indietro'] },
  { key: 'card-prodotto', senior: 'frontend-dev', ver: 'qa-designer', titolo: 'La vetrina dei prodotti: card e griglie', seed: [
    'foto grande, stesso formato per tutte, sfondo coerente',
    'prezzo che salta all occhio; prezzo al kg/litro per gli alimentari (obbligo del Codice del consumo per i prodotti a peso o volume)',
    'nome leggibile su 2 righe senza tagli brutti',
    'da quale negozio viene (nome, volto o logo): e l identita MyCity',
    "pulsante '+' per aggiungere senza aprire la scheda, che diventa contatore (Glovo, Deliveroo)",
    'pochi badge onesti (bio, del territorio, novita, sconto vero)',
    'disponibile/esaurito chiaro',
    'voto e numero di recensioni quando ci sono, niente stelle vuote',
    '2 colonne sul telefono, coerenza fra tutte le griglie del sito',
    'prodotto senza foto: segnaposto decoroso, non un buco'] },
  { key: 'scheda-prodotto', senior: 'cro', ver: 'qa', titolo: "La scheda prodotto (dove si decide l'acquisto)", seed: [
    "nella PRIMA schermata del telefono: foto, nome, prezzo e pulsante 'aggiungi' (la 'buy box' di Amazon) — guarda ${S}/screens/prodotto-kefir--mobile.png",
    'pulsante aggiungi che resta attaccato in basso quando scorri',
    "quando arriva: 'ordina entro le 12, arriva oggi' (Amazon) e costo di consegna chiaro",
    'quantita e varianti facili',
    'galleria a scorrimento con zoom',
    'informazioni chiave a punti: peso, ingredienti, allergeni, origine (per il cibo venduto a distanza il Reg. UE 1169/2011 le vuole PRIMA dell acquisto)',
    "chi vende: volto/nome del negozio, voto, link alla vetrina, 'altri prodotti di questo negozio'",
    'recensioni con foto, domande e risposte',
    'prodotti simili / spesso comprati insieme',
    'resi e garanzie in una riga vicino al pulsante',
    'condividi su WhatsApp',
    "niente testo tecnico o rotto visibile (es. 'Vegano false')"] },
  { key: 'pagina-negozio', senior: 'ux-designer', ver: 'qa', titolo: 'La vetrina del negozio (la bottega online)', seed: [
    "copertina e logo o volto del negoziante (Etsy: 'conosci chi lo fa')",
    'aperto/chiuso ADESSO con gli orari di oggi (Deliveroo, Glovo, Google Maps)',
    'tempo e costo di consegna, ordine minimo, ritiro si/no — tutto in alto',
    'voto e recensioni del negozio',
    'menu del negozio a schede orizzontali che restano in alto mentre scorri (Glovo, Deliveroo)',
    'cerca nel negozio',
    "prodotti con '+' rapido e carrello flottante col totale",
    'la storia del negozio in 2 righe, indirizzo e mappa',
    'segui/preferito il negozio, condividi',
    "badge onesti e veri (es. 'ritiro in negozio' se il servizio e spento e una bugia)"] },
  { key: 'carrello-cassa', senior: 'marketplace-payments', ver: 'qa', titolo: 'Carrello e cassa (comprare senza fatica)', seed: [
    'carrello sempre visibile col totale e il numero di pezzi',
    'costo di consegna e totale finale visibili PRIMA della cassa, niente sorprese (prima causa di abbandono secondo Baymard)',
    "barra 'ti mancano X euro per la consegna gratis / per l'ordine minimo' (Glovo, Deliveroo)",
    'modifica quantita e rimozione dentro il carrello senza ricaricare',
    'cassa in una sola pagina, il minimo dei campi',
    "comprare senza registrazione o con accesso istantaneo (codice via SMS/email); la home promette 'account solo per confermare': e vero?",
    'indirizzo con completamento automatico e salvato per la prossima volta',
    "scelta dell'orario di consegna",
    'metodi di pagamento chiari; se oggi c e solo il contante, detto con fiducia e non come ripiego',
    'carrello con piu negozi: chiaro chi consegna cosa e quando',
    'conferma d ordine con quando arriva e cosa succede ora',
    'errori spiegati accanto al campo, mai perdere i dati inseriti'] },
  { key: 'fiducia', senior: 'customer-success', ver: 'qa', titolo: 'Fiducia e riprova sociale (posso fidarmi?)', seed: [
    'recensioni e voti di prodotti e negozi, col numero, e invito a lasciarle dopo la consegna',
    'volti e storie vere dei negozianti',
    "garanzia chiara ('se qualcosa va storto ti rimborsiamo': Amazon dalla A alla Z, Glovo)",
    'chi vende davvero: ragione sociale/P.IVA del negozio visibile (il DSA europeo chiede ai marketplace di mostrare chi e il venditore)',
    'assistenza raggiungibile in un tocco (WhatsApp, chat, telefono vero)',
    'promesse coerenti con la realta: tempi, pagamenti, ritiro, bonus',
    'niente dati finti visibili (numeri 0523 000000, account demo, testimonianze inventate)',
    "segni di vita reali ('ordinato 12 volte questa settimana') solo se veri",
    'pagine legali e resi facili da trovare e da capire'] },
  { key: 'voglia-di-comprare', senior: 'category-manager', ver: 'qa-designer', titolo: 'La voglia di comprare (merchandising e ispirazione)', seed: [
    'fotografia appetitosa e coerente in tutto il catalogo (luce, sfondo, formato)',
    "collezioni a tema e di stagione: 'regali sotto 20 euro', 'la colazione della domenica', Natale",
    'offerte vere e a tempo, prezzi barrati solo se veri',
    "box e pacchetti (es. la 'surprise bag' anti-spreco prevista in fase 1)",
    'la storia del prodotto: chi lo fa, da dove viene, perche e speciale',
    "novita del negozio e 'il preferito di Piacenza'",
    "suggerimenti: 'chi ha comprato questo ha preso anche', 'completa la spesa'",
    'ispirazione (ricette, abbinamenti) che porta a comprare',
    "emozione e identita: 'Piacenza non e in vendita', 'Il Turno', i Volti — cio che Amazon non puo copiare (vedi /home/user/ad-mycity/consegne/marketing/PIATTAFORMA-CREATIVA.md se esiste)",
    "scarsita onesta ('ultimi 3', 'sfornato stamattina')"] },
  { key: 'vestito-visivo', senior: 'designer', ver: 'qa-designer', titolo: 'Il vestito: colori, caratteri, coerenza, rifinitura', seed: [
    "palette coerente e presa dai token (tailwind.config.ts, app/globals.css), un solo colore per l'azione principale",
    'gerarchia dei caratteri chiara (Fraunces per i titoli, Inter per il testo) con poche taglie',
    'spaziature a ritmo costante e allineamenti',
    'icone dello stesso stile e peso',
    'angoli, ombre e bordi coerenti fra i componenti',
    'risposta visiva a ogni tocco (aggiunto al carrello, cuore, pulsanti premuti)',
    'il logo si vede intero e bene in testata (nelle foto si legge solo "My"?)',
    "personalita propria contro l'aspetto da modello generico",
    'coerenza fra tutte le pagine',
    'rapporto fra pieno e vuoto: ne affollato ne deserto'] },
  { key: 'telefono', senior: 'mobile-app', ver: 'qa', titolo: "Sul telefono, come un'app", seed: [
    'barra in basso fissa e comoda col pollice',
    'azioni principali in basso, raggiungibili con una mano',
    'pannelli che salgono dal basso invece di finestre al centro',
    'gallerie e caroselli a scorrimento col dito',
    'nessuno scorrimento orizzontale involontario',
    'tastiera giusta per ogni campo (numeri per telefono e CAP)',
    'installabile sulla schermata Home senza store (il cittadino non scarica app)',
    'risposta immediata ai tocchi, scheletri di caricamento al posto delle pagine bianche',
    'tasto indietro del telefono che fa la cosa giusta',
    'condivisione nativa (WhatsApp)',
    'zone sicure dell iPhone rispettate'] },
  { key: 'dopo-acquisto-ritorno', senior: 'crm-lifecycle', ver: 'qa', titolo: "Dopo l'acquisto e il ritorno (farti tornare)", seed: [
    "pagina dell'ordine con lo stato chiaro passo per passo",
    'dove si trova il rider / quando arriva (Glovo e Deliveroo: mappa dal vivo)',
    'avvisi a ogni cambio di stato (email, WhatsApp, notifica)',
    "'compra di nuovo' con un tocco (Amazon, Deliveroo 'riordina')",
    'preferiti e liste (la lista settimanale e il rituale previsto da MyCity)',
    'lasciare una recensione in 10 secondi dopo la consegna',
    "assistenza dall'ordine stesso",
    "la home riconosce chi torna: 'i tuoi negozi', 'riordina'",
    'ricevuta chiara'] },
  { key: 'sembrare-vivo', senior: 'city-manager', ver: 'qa', titolo: 'Un marketplace che sembri vivo (pochi prodotti, nessun vuoto)', seed: [
    'sezioni e categorie vuote nascoste o trasformate, mai mostrate vuote',
    'pagine collezione (promozioni, novita, regali, piu venduti, piccoli prezzi, vicino a te) con 9 prodotti: cosa mostrano davvero? (codice + pagine)',
    "l'account demo 'Panificio Demo' (descrizione 'Account DIMOSTRATIVO per test interni') e visibile ai clienti? dove?",
    'prodotti senza foto in vetrina',
    "la home promette 'alimentari, abbigliamento, casa, elettronica' ma c'e solo cibo: promessa d'ampiezza contro realta",
    "strategia 'nicchia poi espandi': celebrare pochi negozi veri in profondita invece di fingere un Amazon",
    "'presto in arrivo' onesto: quali negozi stanno entrando, lista d'attesa per il cliente",
    'CONTA quante pagine raggiungibili dal menu sono vuote o quasi'] },
  { key: 'chiaro-per-tutti', senior: 'accessibility', ver: 'qa-designer', titolo: 'Chiaro per tutti (anche per chi ha 70 anni)', seed: [
    'testo di base almeno 16 px, contrasto sufficiente',
    'bersagli da toccare grandi (almeno 44 px)',
    'parole semplici, niente gergo, icone sempre con etichetta',
    'nessuna informazione solo al passaggio del mouse',
    'messaggi di errore che dicono cosa fare',
    'moduli corti e comprensibili',
    'focus visibile e ordine logico'] },
]

const auditPrompt = (d) => `Analisi dell'esperienza del cliente su MyCity, area «${d.titolo}» (chiave: ${d.key}).

${PREMESSA}

Il tuo compito: confrontare MyCity con i migliori marketplace del mondo (Amazon, eBay, Glovo, Deliveroo, Uber Eats, Etsy e altri dove servono) in QUESTA area, requisito per requisito.

Lista di partenza dei requisiti (completala con quelli che mancano e che un esperto del tuo mestiere metterebbe; togli solo se davvero non c'entrano):
${d.seed.map((x, i) => `${i + 1}. ${x}`).join('\n')}

Per ogni requisito:
- stato: presente_al_livello / presente_sotto_livello / mancante / presente_ma_dannoso (c'e ma fa scappare il cliente: vuoto, falso, confuso) / non_verificabile (dillo e spiega perche)
- strato: guscio (come e costruito) / contenuto (cosa si vede oggi con 9 prodotti) / entrambi
- prova: file:riga nel codice di /home/user/mycity e/o pagina e foto di produzione con il testo citato. «mancante» solo dopo averlo cercato davvero con Grep su piu nomi.
- chi_lo_fa_meglio: chi e come, in concreto
- impatto_acquisto (alto/medio/basso), sforzo (S = ore, M = giorni, L = settimane), proposta concreta, paletti ("ok" o quale paletto/domanda di CONTESTO_BUSINESS rischia)

Guarda le fotografie delle pagine che toccano la tua area (Read sui PNG in ${S}/screens/): almeno le versioni --mobile.png. Ricorda i loro limiti (foto prodotto sostituite, JS dell'app spento).
Dai due voti 0-10: voto_guscio (vale quando ci saranno 2.000 prodotti) e voto_contenuto (cosa vede oggi il cliente), con riferimento_10 = cosa vale 10 (il migliore). Elenca anche i punti_di_forza veri: dove MyCity e gia al livello o meglio.
Italiano semplice. Niente teoria: solo cio che hai visto nel codice o nelle pagine.`

const verifyPrompt = (d, a) => `Collaudo avversariale dell'analisi dell'area «${d.titolo}» (chiave ${d.key}) del marketplace MyCity. Chi ha analizzato NON e chi collauda: tu hai il mandato di smontarla.

${PREMESSA}

Ecco l'analisi da collaudare (JSON):
${JSON.stringify(a)}

Per OGNI requisito ricontrolla da te nel codice (/home/user/mycity, Grep e Read) e nelle pagine/foto di produzione:
- «mancante»: cercalo davvero con almeno 3 nomi diversi (componenti, testi in messages/, route in app/). Se esiste, correggi lo stato. Questo e l'errore piu frequente.
- «presente_al_livello»: e davvero al livello del migliore citato? Altrimenti abbassa.
- la prova (file:riga, testo citato) esiste ed e giusta? Correggi i riferimenti sbagliati.
- il confronto col migliore e concreto e vero? Se e inventato o vago, correggilo o scarta.
- impatto e sforzo sono ragionevoli?
- la proposta rompe un paletto di /home/user/ad-mycity/CONTESTO_BUSINESS.md (§4, §7 «non costruire»)? Scrivilo in 'paletti'.
Restituisci la stessa struttura con SOLO i requisiti che reggono (verdetto: confermato o corretto, nota_verifica), e in 'scartati' quelli tolti col motivo. Ricalcola i due voti se l'analisi era troppo buona o troppo severa. Riporta i 'percorsi' (conteggio tocchi) ricontrollati, se ci sono. In dubbio, scarta.`

const BENCH_FAM = [
  { key: 'amazon-ebay', fam: 'Amazon (amazon.it) ed eBay, sito da telefono e app, com e nel 2025-2026', aree: 'home, ricerca e suggerimenti, card prodotto, scheda prodotto (buy box, consegna promessa, recensioni, Q&A), carrello e cassa (1-Click, costi), dopo l acquisto (tracciamento, compra di nuovo), fiducia (Garanzia dalla A alla Z, venditore, Feedback eBay), pagina venditore/negozio eBay' },
  { key: 'delivery-locale', fam: 'Glovo, Deliveroo, Uber Eats, Just Eat (e Getir/Everli se utili): app e web, com e nel 2025-2026', aree: 'primo gesto (indirizzo), home a categorie, pagina del negozio/ristorante (aperto ora, tempo, costo, ordine minimo, menu a schede fisse), pulsante + sulle card, carrello flottante, barra verso consegna gratis, cassa, tracciamento dal vivo, riordina, valutazioni' },
  { key: 'botteghe-e-ricerca', fam: 'marketplace di piccoli venditori e negozi di citta (Etsy, Shop di Shopify, Too Good To Go, ShopAppy/Miconex, Faire, marketplace civici italiani) + le ricerche indipendenti di Baymard Institute e Nielsen Norman Group sull e-commerce', aree: 'identita del venditore e storia, vetrina del negozio, fiducia per piccoli venditori, gestione di un catalogo piccolo, anti-spreco, e i NUMERI di ricerca: cause di abbandono del carrello, costi nascosti, errori piu comuni delle schede prodotto da telefono, effetto delle recensioni' },
]
const benchPrompt = (b) => `Ricerca di benchmark per un'analisi del marketplace MyCity (negozi di Piacenza). Famiglia da studiare: ${b.fam}.
Aree che ci interessano: ${b.aree}.

Usa WebSearch (la ricerca funziona; WebFetch verso i siti esterni e bloccato in questa sessione: lavora sui risultati di ricerca e su fonti citabili come blog ufficiali, help center, articoli di design, Baymard, NN/g, case study). Per ogni pattern: area (usa una di queste chiavi quando possibile: prima-impressione, navigazione-velocita, ricerca-filtri, card-prodotto, scheda-prodotto, pagina-negozio, carrello-cassa, fiducia, voglia-di-comprare, vestito-visivo, telefono, dopo-acquisto-ritorno, sembrare-vivo, chiaro-per-tutti), pattern in una riga, chi lo fa, dettaglio concreto (dove sta sullo schermo, cosa dice, cosa succede al tocco), perche funziona, fonte (URL). Se una cosa la sai ma non trovi la fonte, scrivi fonte: "conoscenza di mestiere, non verificata oggi".
In 'numeri' metti solo dati con fonte (es. tasso di abbandono del carrello e sue cause) e la loro affidabilita (fonte primaria / secondaria / non confermata).
Almeno 20 pattern concreti. Italiano.`

const VIS_LENS = [
  { key: 'rifinitura', senior: 'designer', lente: 'rifinitura e coerenza visiva: sembra un prodotto curato da un grande studio o un modello generico? logo, colori, caratteri, spaziature, allineamenti, coerenza fra pagine' },
  { key: 'desiderio', senior: 'direttore-creativo', lente: "voglia di comprare e identita: mette appetito? fa sentire Piacenza e le botteghe? la domanda-ghigliottina: 'poteva farlo Amazon?' e 'perche dovrei comprare qui invece che su Amazon?'" },
  { key: 'chiarezza', senior: 'ux-designer', lente: 'chiarezza e velocita: in 3 secondi capisco dove sono e cosa fare? quanto spazio rubano testata e barre? dove va il pollice?' },
  { key: 'conversione', senior: 'cro', lente: "conversione: nella prima schermata di ogni pagina dov'e il prezzo, dov'e il pulsante per comprare, cosa frena l'acquisto, cosa manca rispetto ad Amazon/Glovo" },
]
const visPrompt = (v) => `Giudizio A OCCHIO delle pagine vere del marketplace MyCity, lente: ${v.lente}.

${PREMESSA}

Apri con Read le fotografie in ${S}/screens/: TUTTE le 11 «--mobile.png» (prima schermata sul telefono), poi le «--mobile-intera.png» di home, negozio-pane-quotidiano, prodotto-kefir, ricerca-kefir, carrello, piu-venduti, categoria-elettronica, e le «--desktop.png» di home, prodotto-kefir, negozio-pane-quotidiano. Confronta con la memoria visiva che hai di Amazon, Glovo, Deliveroo, Etsy.
Ricorda i limiti: riquadri «FOTO (non caricabile da qui)» al posto delle foto vere; le parti caricate dal browser compaiono come riquadri di caricamento (per sapere cosa c'e dopo puoi guardare il codice in /home/user/mycity). Non contare come difetto un riquadro grigio di caricamento senza aver controllato nel codice cosa lo sostituisce.
Per ogni osservazione: pagina, schermo (mobile/desktop), cosa_si_vede (descrivi in modo che chi non vede l'immagine capisca), giudizio (pregio o problema), gravita, confronto con un migliore, proposta concreta. Almeno 12 osservazioni, anche i pregi. Voto complessivo 0-10 per la tua lente. Italiano semplice.`

phase('Benchmark')
const benchP = parallel(BENCH_FAM.map(b => () => agent(benchPrompt(b), { label: `benchmark:${b.key}`, phase: 'Benchmark', schema: BENCH, agentType: 'intelligence' })))

phase('Analisi')
const dimsP = pipeline(
  DIMS,
  (d) => agent(auditPrompt(d), { label: `analisi:${d.key}`, phase: 'Analisi', schema: AUDIT, agentType: d.senior }),
  (a, d) => a ? agent(verifyPrompt(d, a), { label: `verifica:${d.key}`, phase: 'Verifica', schema: VERIFIED, agentType: d.ver }) : null,
)

const visP = parallel(VIS_LENS.map(v => () => agent(visPrompt(v), { label: `occhio:${v.key}`, phase: 'Occhio', schema: VISUAL, agentType: v.senior })))
  .then(async (vis) => {
    const ok = vis.filter(Boolean)
    const scettico = await agent(`Collaudo scettico dei giudizi A OCCHIO dati da ${ok.length} colleghi sulle fotografie delle pagine vere di MyCity.

${PREMESSA}

Giudizi da collaudare:
${JSON.stringify(ok)}

Per ogni osservazione apri la fotografia citata (Read su ${S}/screens/) e, se serve, il codice: ① si vede davvero quello che dice? ② non e solo un effetto dei limiti delle foto (riquadri FOTO, JS dell'app spento)? se lo e, controlla nel codice cosa vede il cliente vero e correggi o scarta ③ il confronto col migliore e giusto? Unisci i doppioni fra lenti diverse (tieni la descrizione migliore, nella 'lente' metti tutte le lenti). Restituisci confermate (con lente e nota) e scartate (con motivo).`, { label: 'occhio:scettico', phase: 'Occhio', schema: VISUAL_OK, agentType: 'qa-designer' })
    return { giudici: ok.map(v => ({ lente: v.lente, voto: v.voto_complessivo, prima_impressione: v.prima_impressione })), scettico }
  })

const [bench, dims, vis] = await Promise.all([benchP, dimsP, visP])
const dimsOk = dims.filter(Boolean)
const benchOk = bench.filter(Boolean)
log(`Aree verificate: ${dimsOk.length}/${DIMS.length} · benchmark: ${benchOk.length}/3 · giudici a occhio: ${vis.giudici.length}/4`)
if (dimsOk.length < DIMS.length) log(`ATTENZIONE: aree senza verifica: ${DIMS.filter((d, i) => !dims[i]).map(d => d.key).join(', ')}`)

phase('Sintesi')
const SYN = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    sintesi_breve: { type: 'string' },
    voto_guscio: { type: 'number' }, voto_contenuto: { type: 'number' },
    pagella: { type: 'array', items: { type: 'object', properties: { area: { type: 'string' }, voto_guscio: { type: 'number' }, voto_contenuto: { type: 'number' }, verdetto: { type: 'string' } }, required: ['area', 'voto_guscio', 'voto_contenuto', 'verdetto'] } },
    mosse: { type: 'array', items: { type: 'object', properties: { mossa: { type: 'string' }, perche: { type: 'string' }, impatto: { type: 'string' }, sforzo: { type: 'string' }, corsia: { type: 'string', enum: ['contenuto', 'config', 'codice', 'decisione-nicola'] } }, required: ['mossa', 'perche', 'impatto', 'sforzo', 'corsia'] } },
    conteggi: { type: 'object', properties: { requisiti: { type: 'number' }, al_livello: { type: 'number' }, sotto_livello: { type: 'number' }, mancanti: { type: 'number' }, dannosi: { type: 'number' }, non_verificabili: { type: 'number' } }, required: ['requisiti', 'al_livello', 'sotto_livello', 'mancanti', 'dannosi', 'non_verificabili'] },
    domande_per_nicola: { type: 'array', items: { type: 'string' } },
  },
  required: ['file', 'sintesi_breve', 'voto_guscio', 'voto_contenuto', 'pagella', 'mosse', 'conteggi', 'domande_per_nicola'],
}
const INPUT = JSON.stringify({ aree_verificate: dimsOk, benchmark: benchOk, occhio: vis })
const syn = await agent(`Sei l'AD digitale di MyCity. Scrivi il referto per Nicola: «Il marketplace visto dal cliente: abbiamo tutti i requisiti dei migliori?».

${PREMESSA}
Leggi anche /home/user/ad-mycity/cervello/scrittura-umana.md (come si scrive per Nicola) e /home/user/ad-mycity/CONTESTO_BUSINESS.md.

Materiale (tutto gia collaudato): 14 aree analizzate da senior e verificate da collaudatori, 3 ricerche di benchmark con fonti, giudizi a occhio sulle foto delle pagine vere con collaudo scettico:
${INPUT}

Scrivi il file ${REPORT} (crealo con Write; prima esegui \`TZ=Europe/Rome date '+%Y-%m-%d %H:%M'\` per l'ora del frontmatter). Struttura:
1. frontmatter: data (con l'ora), tipo: analisi-esperienza-cliente, fonti (le cartelle prod/ e screens/ della sessione, il database letto il 2026-10-29 20:13).
2. Titolo che si capisce a voce + «In due righe».
3. I quattro blocchi, in quest'ordine e una volta sola: «In parole semplici» · «Cosa cambia per te» · «Cosa devi fare» · «Cosa non ho verificato» (qui: rete bloccata sul sito vero, foto prodotto non caricabili, JS dell'app spento nelle foto, siti dei concorrenti non apribili e benchmark da ricerca web + mestiere, nessun test con persone vere).
4. «La pagella»: tabella area per area con voto guscio (com'e costruito, vale con 2.000 prodotti) e voto contenuto (cosa vede oggi il cliente con 9 prodotti), e il verdetto in una riga. Spiega in una frase cosa sono i due voti.
5. «La risposta alla tua domanda»: hai tutti i requisiti? Quanti requisiti abbiamo controllato e quanti sono al livello, sotto, mancanti, dannosi (conta dai dati, non inventare). Separa con chiarezza: cosa dipende dal sito (guscio) e cosa dipende dal catalogo (contenuto).
6. «Le mosse», al massimo 10, ordinate per effetto sulla voglia di comprare e sulla velocita, ognuna con perche, chi lo fa meglio, sforzo, e la corsia (contenuto / config / codice / decisione-nicola). Ogni mossa deve passare le 5 domande di CONTESTO_BUSINESS: se una ne rompe una, dillo.
7. «Cosa fa gia bene»: i pregi veri.
8. Una sezione per area con i requisiti (tabella compatta: requisito · stato · chi lo fa meglio · prova · proposta).
9. «Dettagli tecnici» in fondo: prove file:riga, numeri del benchmark con fonte, elenco degli scartati dai collaudatori (quanti e perche, in breve).
Regole: niente sigle o percorsi sopra «Dettagli tecnici»; ogni numero con la sua fonte; esempi concreti con nomi veri (Pane Quotidiano, il kefir a 2,95 euro); frasi corte. Quando hai scritto, misura con \`cd /home/user/ad-mycity && node cervello/si-capisce.mjs ${REPORT}\` e correggi finche passa (se lo strumento non c'e o non funziona, dillo nella risposta).
Poi restituisci la struttura richiesta (file, sintesi_breve, voti medi, pagella, mosse, conteggi, domande_per_nicola = 3-5 domande che servono a capire meglio cosa vuole Nicola, ad esempio a quale marketplace vuole somigliare di piu).`, { label: 'sintesi', phase: 'Sintesi', schema: SYN })

const collaudo = await agent(`Collaudo del referto ${REPORT} (scritto da un collega: tu hai il mandato di trovarci gli errori e correggerli direttamente nel file con Edit).

${PREMESSA}

Il materiale da cui e stato scritto (gia collaudato):
${INPUT}

Controlla: ① ogni numero del referto torna con il materiale e coi dati del catalogo (ricalcola i conteggi dei requisiti per stato) ② nessuna affermazione che il materiale non sostiene ③ le mosse non rompono i paletti di /home/user/ad-mycity/CONTESTO_BUSINESS.md (§4 e «non costruire» del §7) ④ i quattro blocchi ci sono, una volta sola, e «Cosa non ho verificato» e onesto ⑤ niente sigle/percorsi sopra «Dettagli tecnici» ⑥ manca qualcosa di importante del materiale (un'area, un difetto alto, un pregio)? ⑦ esegui \`cd /home/user/ad-mycity && node cervello/si-capisce.mjs ${REPORT}\`.
Correggi nel file. Restituisci l'elenco delle correzioni fatte e dei dubbi rimasti.`, { label: 'collaudo-sintesi', phase: 'Sintesi', schema: { type: 'object', properties: { correzioni: { type: 'array', items: { type: 'string' } }, dubbi: { type: 'array', items: { type: 'string' } }, esito_si_capisce: { type: 'string' } }, required: ['correzioni', 'dubbi', 'esito_si_capisce'] }, agentType: 'qa' })

return { sintesi: syn, collaudo, conteggio_aree: dimsOk.length, scartati_per_area: dimsOk.map(d => ({ area: d.dimensione, tenuti: (d.requisiti || []).length, scartati: (d.scartati || []).length })), occhio_scartate: vis.scettico ? vis.scettico.scartate.length : null, occhio_confermate: vis.scettico ? vis.scettico.confermate.length : null, grezzo: { aree: dimsOk, benchmark: benchOk, occhio: vis } }
