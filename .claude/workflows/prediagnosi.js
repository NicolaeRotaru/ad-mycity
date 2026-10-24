// 🔎 PRE-DIAGNOSI DEL SITO — la ricetta di ogni difetto, scritta e verificata PRIMA di riparare.
//
// Nato il 24/10/2026 dalla domanda di Nicola: «Dobbiamo risolverli nel minor tempo possibile, riesci a
// trovare un modo, magari capendo in anticipo come risolverli». Nelle ondate passate il tempo non se
// ne andava nel riparare: se ne andava nello scoprire, a lavoro iniziato, chi altro chiamava il codice
// toccato, e nei difetti NATI dalla riparazione (prima ondata: sette riesami, 15-27 nati ognuno).
// Qui una squadra di senior scrive per ogni difetto aperto: se è ancora vero, la causa comune, la
// modifica esatta, la prova che deve diventare rossa, cosa rischia di rompere, e la domanda per
// Nicola già pronta. Due revisori indipendenti provano a smontare ogni ricetta (lente A: è giusta e
// la prova sa diventare rossa? · lente B: cosa farebbe nascere?).
//
// COME SI LANCIA (metodo intero in cervello/lotto-a-pacchetti.md, passo ⓪):
//   1. node cervello/prediagnosi.mjs prepara --cartella <cartella FUORI dai repository>
//   2. questo workflow, una volta per modo, con args {cartella, modo, territori, commit?, contesto?}
//        modo «seri»    → territori = territori.json → seri   (ricetta + lente A + lente B)
//        modo «minori»  → territori = territori.json → minori (ricetta + verifica dei «già risolti»)
//        modo «privata» → territori = aree scritte a mano {area, db, schede, cosa}: le falle di
//                         sicurezza aperte, i cui dettagli NON vanno mai in un deposito pubblico
//        modo «lenti»   → solo le due verifiche, su ricette già scritte in un file (rec_file):
//                         per spezzare la coda di un giro lento
//        modo «riservatezza» → niente territori: due revisori rileggono il testo che sta per diventare
//                         pubblico e segnano i passaggi che rivelano una falla riservata (passo 5)
//      Gli args opzionali: sito (dove sta il codice), commit, contesto (fatti di produzione e scelte
//      di Nicola, se no il revisore li legge da STATO.md e dal registro dei fatti), senior (chi fa
//      cosa: {ricette, lenteA, lenteB, minori, chiusi, privata, privataV}, o `senior` sul territorio).
//      Le aree «privata» con db: true chiedono di leggere i cataloghi del database: per primo con lo
//      strumento in sola lettura del repo (supabase-marketplace, --read-only in .mcp.json); se il senior
//      di sicurezza non ha nessuno strumento SQL, passa in senior.privata un agente che ce l'ha.
//      Il motore tiene al più due agenti per volta per workflow su una macchina da 4 processori: per
//      finire prima si lanciano più workflow insieme, ognuno con una parte dei territori.
//   3. node cervello/prediagnosi.mjs raccogli --cartella <stessa> <journal.jsonl dei workflow>
//      (senza --scrivi: nasce solo il ricettario completo, nella cartella fuori dai repository)
//   4. node cervello/prediagnosi.mjs riservato --cartella <stessa>   → i materiali dei revisori
//   5. questo workflow con args {cartella, modo: "riservatezza"}
//   6. node cervello/prediagnosi.mjs raccogli --cartella <stessa> <journal…> --scrivi --riservato <journal del passo 5>
//   7. node cervello/prediagnosi.mjs ondate --ricettario <il ricettario pubblico> --repo ../mycity --scrivi
//
// Come gli altri workflow di questa casa: nessun import, `export const meta` è la prima istruzione.

export const meta = {
  name: 'prediagnosi',
  description: 'Pre-diagnosi dei difetti aperti del sito: ricetta di riparazione per ogni difetto, verificata da revisori indipendenti, prima di toccare il codice',
  whenToUse: 'Prima di un lotto di riparazione del marketplace: scrive in anticipo come si ripara ogni difetto (ancora vero?, causa comune, ricetta, prova rossa, cosa rischia di rompere, decisioni per Nicola).',
  phases: [
    { title: 'Ricette', detail: 'un senior per territorio scrive la ricetta di ogni difetto' },
    { title: 'Verifica', detail: 'revisori indipendenti provano a smontare le ricette' },
  ],
}

// Gli argomenti si controllano PRIMA di partire: un modo scritto male o una cartella mancante
// facevano finire il workflow «verde» con zero agenti, o con prompt che puntavano a «undefined/difetti»
// (collaudo del 24/10).
const MODI = ['seri', 'minori', 'privata', 'lenti', 'riservatezza']
const SP = args.cartella
const MODO = args.modo
const TERR = args.territori || []
if (typeof SP !== 'string' || !SP.trim()) throw new Error('serve args.cartella: la cartella di lavoro di «prediagnosi.mjs prepara», fuori dai repository')
if (!MODI.includes(MODO)) throw new Error(`args.modo è uno fra ${MODI.join(', ')}, non «${MODO}»`)
if (MODO === 'riservatezza') {
  if (TERR.length) throw new Error('il modo «riservatezza» non vuole territori: rilegge tutto il ricettario della cartella')
} else {
  if (!Array.isArray(TERR) || !TERR.length) throw new Error(`il modo «${MODO}» vuole args.territori, una lista non vuota`)
  for (const t of TERR) {
    if (MODO === 'privata') {
      if (!t || !t.area || !t.schede || !t.cosa) throw new Error('ogni area del modo «privata» vuole {area, db, schede, cosa}')
    } else {
      if (!t || !t.territorio || !Array.isArray(t.indici) || !t.indici.length || t.indici.some(i => !Number.isInteger(i))) throw new Error(`ogni territorio vuole {territorio, indici: [numeri]}: «${t && t.territorio}» non va`)
      if (MODO === 'lenti' && (typeof t.rec_file !== 'string' || !t.rec_file)) throw new Error(`il modo «lenti» vuole rec_file per ogni territorio: manca in «${t.territorio}»`)
    }
  }
}
// Dove sta il codice del sito: come in radiografia.js, mai un percorso scritto qui dentro — sul VPS
// e nella sessione cloud le cartelle sono diverse.
const SITO = args.sito || "la cartella indicata da `$MARKETPLACE_REPO` se c'è, altrimenti la copia locale `marketplace/` dentro il repo dell'AD"
const COMMIT = args.commit || 'quello di origin/main di oggi (git log -1 nella cartella del sito per saperlo)'
// Chi lavora: un senior vero della squadra, risolto dal registro con `agentType` (regola della porta,
// cervello/prompt-senior.mjs). Il mestiere arriva dal suo mansionario, non da una frase qui dentro.
const SENIOR = Object.assign({ ricette: 'tech', lenteA: 'qa', lenteB: 'sdet', minori: 'tech', chiusi: 'qa', privata: 'security', privataV: 'infosec-soc', istruzioni: 'security', nomi: 'infosec-soc' }, args.senior || {})
// I fatti di produzione e le scelte di Nicola invecchiano: si passano a ogni lancio. Senza, il
// revisore li legge da sé dalla memoria, che è la loro unica casa.
const FATTI = args.contesto || `- Fatti di produzione e scelte di Nicola: leggili tu, prima di cominciare, nelle prime 60 righe di MyCity-Vault/90-Memoria-AI/STATO.md e in MyCity-Vault/90-Memoria-AI/registro-fatti.json, nel repo dell'AD. Non inventarli.`

const CTX = `
CONTESTO (vale per tutto il lavoro):
- Codice del sito: ${SITO}, al commit ${COMMIT}.
- SOLA LETTURA. Non modificare, creare o cancellare file in nessun repository. Niente git commit/checkout/stash. Niente npm install/build/test/verify: la macchina ha pochi processori e altri revisori lavorano in parallelo. Usa Read, Grep, Glob e comandi di sola lettura (git log/show/blame/grep nella cartella del sito, ls, sed -n, rg).
${FATTI}
- Le lezioni pagate care: nella prima ondata (16-17/10) il costo vero non era riparare ma i difetti NATI riparando: sette riesami, 15-27 difetti nati ognuno, quasi tutti nello stesso posto (rimborso dei contanti); si è chiuso SEMPLIFICANDO (togliendo una funzione), non con un ottavo giro. La migrazione 119 ha stretto un permesso e ha acceso un difetto nascosto (il modulo «diventa negozio» smette di funzionare): una regola che stringe rompe le scritture che contavano sulla regola larga. La prova di una riparazione è un COMPORTAMENTO (una prova automatica che oggi diventa rossa e dopo verde), mai una parola cercata in un file.
- Le prove del sito: vitest (cartella tests/ e __tests__ accanto ai file), prove SQL su Postgres vero (cerca tests/sql o scripts che applicano le migrazioni), Playwright in tests/e2e. Guarda come sono scritte le prove vicine al codice prima di proporne una.
- Ogni difetto ha un fascicolo: ${SP}/difetti/<idx>.json (campi: titolo, severita, dimensione, file, descrizione, impatto, fix proposto dalla radiografia, nota_riparazione, ecc.). <idx> è la posizione del difetto nel registro quando la cartella è stata preparata: nelle risposte usalo così com'è, anche se il registro intanto è cambiato.
- Scrivi in italiano semplice i campi per le persone; nomi di file, funzioni e codice restano come sono. Cita sempre file:riga del codice DI OGGI, non quelle del fascicolo, che possono essere vecchie.
`

const R_ENUM = ['si', 'no', 'in_parte', 'non_verificabile']
const CHI = ['codice', 'migrazione', 'config-vercel', 'config-github', 'config-supabase', 'config-stripe', 'decisione-nicola', 'mondo-reale', 'spegnere-funzione']

const RICETTA_SERIA = {
  type: 'object',
  properties: {
    idx: { type: 'integer' },
    ancora_vero: { type: 'string', enum: R_ENUM },
    evidenza: { type: 'string', description: 'file:riga di oggi e cosa c\'è scritto, che prova il verdetto' },
    causa_radice: { type: 'string' },
    chi_ripara: { type: 'string', enum: CHI },
    ricetta: { type: 'string', description: 'la modifica esatta, in 2-6 passi: file, funzione, cosa cambia' },
    file_toccati: { type: 'array', items: { type: 'string' } },
    prova_rossa: { type: 'string', description: 'file della prova da creare o estendere, aiuto/banco di prova da usare, cosa afferma, perché oggi è rossa' },
    raggio: { type: 'string', description: 'chi altro usa il codice toccato (chiamanti, pagine, cron, trigger, webhook) e la variante scomoda da provare' },
    rischio_nascita: { type: 'string', enum: ['alto', 'medio', 'basso'] },
    alternativa_semplice: { type: 'string', description: 'togliere/spegnere/semplificare invece di riparare: quando conviene; vuoto se non c\'è' },
    dipende_da: { type: 'string', description: 'altri difetti (idx), migrazioni, chiavi o decisioni che devono venire prima; vuoto se nessuno' },
    decisione_per_nicola: { type: 'string', description: 'se serve una sua scelta: la domanda, le opzioni, la tua raccomandazione; vuoto se non serve' },
    tocca_soldi_o_dati: { type: 'boolean' },
    stima: { type: 'string', enum: ['S', 'M', 'L'], description: 'S < 30 minuti di una squadra, M 1-2 ore, L mezza giornata o più' },
    spento_al_lancio: { type: 'boolean', description: 'vero se il difetto vive solo in una funzione che la proposta di lancio essenziale spegne (vedi il contesto)' },
  },
  required: ['idx', 'ancora_vero', 'evidenza', 'causa_radice', 'chi_ripara', 'ricetta', 'file_toccati', 'prova_rossa', 'raggio', 'rischio_nascita', 'alternativa_semplice', 'dipende_da', 'decisione_per_nicola', 'tocca_soldi_o_dati', 'stima', 'spento_al_lancio'],
}

const SCHEMA_SERI = {
  type: 'object',
  properties: {
    territorio: { type: 'string' },
    ricette: { type: 'array', items: RICETTA_SERIA },
    cause_comuni: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          idx: { type: 'array', items: { type: 'integer' } },
          perche: { type: 'string' },
          una_riparazione: { type: 'string', description: 'la riparazione unica che chiude tutto il gruppo' },
        },
        required: ['nome', 'idx', 'perche', 'una_riparazione'],
      },
    },
    ordine: { type: 'string', description: 'in che ordine riparare dentro il territorio, e perché' },
    conflitti: { type: 'string', description: 'dove due ricette toccano la stessa funzione e vanno progettate insieme' },
    semplificazioni: { type: 'string', description: 'zone dove togliere o spegnere costa meno che riparare' },
  },
  required: ['territorio', 'ricette', 'cause_comuni', 'ordine', 'conflitti', 'semplificazioni'],
}

const SCHEMA_LENTE_A = {
  type: 'object',
  properties: {
    verdetti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          verdetto: { type: 'string', enum: ['confermata', 'da_correggere', 'gia_chiuso_confermato', 'non_reale', 'non_verificabile'] },
          // Il 24/10 otto revisori l'hanno letto come «la ricetta ha ragione?» e hanno scritto «si» su
          // difetti che dicevano chiusi: la descrizione dice quale delle due domande è.
          ancora_vero_corretto: { type: 'string', enum: R_ENUM, description: 'il TUO verdetto, dopo la verifica, sulla domanda «il difetto c\'è ancora nel codice di oggi?»: si = c\'è ancora, no = è già chiuso. NON vuol dire «la ricetta ha ragione»' },
          motivo: { type: 'string', description: 'con file:riga' },
          correzioni_ricetta: { type: 'string', description: 'cosa cambiare nella ricetta; vuoto se va bene' },
          prova_corretta: { type: 'string', description: 'la prova giusta se quella proposta non sa diventare rossa; vuoto se va bene' },
        },
        required: ['idx', 'verdetto', 'ancora_vero_corretto', 'motivo', 'correzioni_ricetta', 'prova_corretta'],
      },
    },
  },
  required: ['verdetti'],
}

const SCHEMA_LENTE_B = {
  type: 'object',
  properties: {
    rischi: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          nascite_previste: { type: 'string', description: 'scenari concreti in cui la ricetta fa nascere un difetto nuovo; vuoto se nessuno' },
          prove_aggiuntive: { type: 'string', description: 'varianti scomode da provare insieme alla prova rossa' },
          rischio_rivisto: { type: 'string', enum: ['alto', 'medio', 'basso'] },
          semplificare_invece: { type: 'boolean' },
          perche: { type: 'string' },
        },
        required: ['idx', 'nascite_previste', 'prove_aggiuntive', 'rischio_rivisto', 'semplificare_invece', 'perche'],
      },
    },
    interazioni_fra_territori: { type: 'string', description: 'file o funzioni toccati anche da altri territori del sito, e l\'ordine che ne segue' },
  },
  required: ['rischi', 'interazioni_fra_territori'],
}

const SCHEMA_MINORI = {
  type: 'object',
  properties: {
    territorio: { type: 'string' },
    ricette: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          ancora_vero: { type: 'string', enum: R_ENUM },
          evidenza: { type: 'string' },
          chi_ripara: { type: 'string', enum: CHI },
          ricetta: { type: 'string', description: '1-3 righe' },
          file_toccati: { type: 'array', items: { type: 'string' } },
          prova: { type: 'string', description: 'una riga: la prova automatica che diventa rossa; per testi e grafica la verifica concreta' },
          stima: { type: 'string', enum: ['S', 'M', 'L'] },
          spento_al_lancio: { type: 'boolean' },
          causa_comune: { type: 'string', description: 'una chiave breve condivisa con gli altri difetti della stessa causa, es. «stato-errore-letto-come-vuoto»' },
        },
        required: ['idx', 'ancora_vero', 'evidenza', 'chi_ripara', 'ricetta', 'file_toccati', 'prova', 'stima', 'spento_al_lancio', 'causa_comune'],
      },
    },
    cause_comuni: { type: 'string', description: 'i gruppi di difetti che una riparazione sola chiude' },
  },
  required: ['territorio', 'ricette', 'cause_comuni'],
}

const SCHEMA_CHIUSI = {
  type: 'object',
  properties: {
    verdetti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idx: { type: 'integer' },
          gia_chiuso_confermato: { type: 'boolean' },
          motivo: { type: 'string', description: 'con file:riga di oggi' },
        },
        required: ['idx', 'gia_chiuso_confermato', 'motivo'],
      },
    },
  },
  required: ['verdetti'],
}

const SCHEMA_PRIVATA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    falle: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string' },
          gravita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          dove: { type: 'string' },
          come_si_sfrutta: { type: 'string' },
          ricetta: { type: 'string' },
          prova_rossa: { type: 'string' },
          chi_ripara: { type: 'string', enum: CHI },
          probabile_id: { type: 'string', description: 'R1, R2... se riconoscibile dalla categoria e dal modo di riparazione; vuoto se no' },
          certezza: { type: 'string', enum: ['alta', 'media', 'bassa'] },
        },
        required: ['titolo', 'gravita', 'dove', 'come_si_sfrutta', 'ricetta', 'prova_rossa', 'chi_ripara', 'probabile_id', 'certezza'],
      },
    },
    controllato_e_pulito: { type: 'array', items: { type: 'string' } },
    note: { type: 'string' },
  },
  required: ['area', 'falle', 'controllato_e_pulito', 'note'],
}

const SCHEMA_PRIVATA_V = {
  type: 'object',
  properties: {
    verdetti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string' },
          reale: { type: 'boolean' },
          gravita_rivista: { type: 'string', enum: ['bloccante', 'grave', 'minore', 'nessuna'] },
          motivo: { type: 'string' },
        },
        required: ['titolo', 'reale', 'gravita_rivista', 'motivo'],
      },
    },
    mancate: { type: 'string', description: 'falle della stessa area che l\'auditore non ha visto' },
  },
  required: ['verdetti', 'mancate'],
}

const elenco = t => t.indici.map(i => `${SP}/difetti/${i}.json`).join('\n')

function promptRicette(t) {
  return `${CTX}
Il tuo compito: la PRE-DIAGNOSI del territorio «${t.territorio}» del marketplace MyCity. Lo scopo: sapere IN ANTICIPO come si ripara ogni difetto, prima che le squadre tocchino il codice, così il lotto di riparazione diventa meccanico e non fa nascere difetti nuovi.

I difetti del territorio (${t.indici.length}), uno per fascicolo:
${elenco(t)}

Per OGNI difetto:
1. Leggi il fascicolo. Poi apri il codice DI OGGI nei punti citati e intorno. Il fascicolo può essere vecchio: i lotti dopo la radiografia hanno cambiato molti file.
2. Decidi se è ancora vero (si / no / in_parte / non_verificabile da qui), con l'evidenza file:riga. Dire «no» è una affermazione forte: serve la riga che lo prova.
3. Trova la causa radice, non il sintomo.
4. Scrivi la ricetta: la modifica esatta. Se la scelta spetta a Nicola (soldi, legge, promesse ai clienti, funzioni da tenere), scrivi la domanda con le opzioni e la tua raccomandazione, e la ricetta per l'opzione raccomandata.
5. Scrivi la prova rossa: quale file di prova creare o estendere, con quale banco di prova già esistente (cerca le prove vicine), cosa afferma, perché oggi è rossa.
6. Cerca il raggio: con grep, chi altro chiama la funzione o legge la colonna o la pagina che cambi (rotte API, cron, webhook Stripe, trigger e regole del database, altre pagine). Scrivi la variante scomoda da provare.
7. Valuta il rischio di far nascere difetti, e se togliere/spegnere/semplificare costerebbe meno.

Poi, guardando il territorio intero: quali difetti hanno la stessa causa e si chiudono con una riparazione sola; in che ordine ripararli; dove due ricette toccano la stessa funzione e vanno progettate insieme; dove semplificare.

Sii concreto e preciso: questa ricetta la eseguirà un'altra squadra senza poterti fare domande.`
}

function promptLenteA(t, rec) {
  return `${CTX}
Il tuo compito: revisione indipendente. Un collega ha scritto la pre-diagnosi del territorio «${t.territorio}». Il mandato è SMONTARLA dove sbaglia. Non fidarti: riapri il codice tu.

Fascicoli dei difetti:
${elenco(t)}

La pre-diagnosi da verificare:
${JSON.stringify(rec.ricette, null, 1)}

Per ogni difetto controlla:
1. Il verdetto «ancora vero» è giusto? Riapri il codice di oggi. Attacca soprattutto i «no» (dichiarati già risolti): senza una riga di codice che lo prova, il difetto resta aperto. Attacca anche i «si»: forse la prima ondata o le migrazioni l'hanno già chiuso.
2. La ricetta chiude il difetto in TUTTE le sue varianti, o solo in quella comoda?
3. La prova proposta sa diventare rossa sul codice di oggi e verde dopo la ricetta? Una prova che cerca una parola in un file non vale.
Rispondi difetto per difetto.`
}

function promptLenteB(t, rec) {
  return `${CTX}
Il tuo compito: revisione indipendente con una sola lente, cosa ROMPE la riparazione. Un collega ha scritto le ricette del territorio «${t.territorio}». Nelle ondate passate ogni riparazione faceva nascere difetti nuovi: trova quelli che queste ricette farebbero nascere, PRIMA che succeda.

Fascicoli dei difetti:
${elenco(t)}

Le ricette:
${JSON.stringify(rec.ricette.map(r => ({ idx: r.idx, ricetta: r.ricetta, file_toccati: r.file_toccati, raggio: r.raggio, prova_rossa: r.prova_rossa })), null, 1)}

Per ogni ricetta: cerca tu i chiamanti (grep), i trigger, le regole del database e le funzioni SQL che toccano le stesse tabelle, i cron, i webhook di Stripe, le pagine che leggono gli stessi campi. Pensa alle condizioni vere della produzione (quelle del contesto qui sopra), ai doppi clic, ai webhook ripetuti, alle risposte perse a metà, ai permessi stretti dalle migrazioni. Dimmi gli scenari concreti in cui la ricetta fa nascere un difetto nuovo, le varianti da provare, il rischio rivisto, e se conviene semplificare invece di riparare. Infine i file toccati anche da altri territori del sito.`
}

function promptMinori(t) {
  return `${CTX}
Il tuo compito: la PRE-DIAGNOSI dei difetti MINORI del gruppo «${t.territorio}» del marketplace MyCity. Lo scopo: sapere in anticipo, per ognuno, se è ancora vero e come si ripara, così le squadre li chiudono a catena.

I difetti (${t.indici.length}), uno per fascicolo:
${elenco(t)}

Per ognuno: leggi il fascicolo, apri il codice di oggi nel punto citato, decidi se è ancora vero (con file:riga; «no» solo con la riga che lo prova), scrivi la ricetta in 1-3 righe, i file, la prova (una riga), la stima, se vive solo in una funzione spenta al lancio, e una chiave breve della causa comune (stessa chiave per difetti con la stessa causa: è quella che permette di chiuderne molti con una riparazione). Sii rapido ma non superficiale: sono minori, ma una ricetta sbagliata costa un giro.`
}

function promptChiusi(t, claimed) {
  return `${CTX}
Il tuo compito: revisione indipendente. Un collega dice che questi difetti minori del gruppo «${t.territorio}» sono GIÀ RISOLTI nel codice di oggi. Il mandato è smentirlo: chiudere un difetto vero per sbaglio è peggio che lasciarlo aperto.

${claimed.map(r => `- fascicolo ${SP}/difetti/${r.idx}.json — evidenza del senior: ${r.evidenza}`).join('\n')}

Per ognuno riapri il codice di oggi e dimmi se è davvero già chiuso, in tutte le sue varianti, con file:riga.`
}

function promptPrivata(a) {
  return `${CTX}
⚠️ LAVORO RISERVATO. Il repository del sito e quello della memoria sono PUBBLICI. Quello che trovi lo restituisci SOLO nella risposta strutturata: non scriverlo in nessun file, commento, commit, issue o messaggio.

Il tuo compito: revisione di sicurezza. Una radiografia ha trovato falle di sicurezza nell'area «${a.area}», con i dettagli tenuti fuori dai depositi pubblici. Bisogna ritrovare le falle che ci sono OGGI, per chiuderle: alcune possono essersi chiuse da sole con le migrazioni entrate dopo, altre essere nuove.

Le schede da ritrovare in quest'area: ${a.schede}.
Cosa guardare: ${a.cosa}

${a.db ? `Puoi interrogare la struttura del database di produzione (progetto Supabase ${args.progetto_db || 'clmpyfvpvfjgeviworth'}). Per primo usa mcp__supabase-marketplace__execute_sql: è configurato in sola lettura nel repo (.mcp.json, --read-only), quindi una scrittura sbagliata la rifiuta lui. Solo se in questa sessione non c'è, usa mcp__Supabase__execute_sql (caricalo con ToolSearch, «select:mcp__Supabase__execute_sql»): quello può scrivere, quindi ogni chiamata è UNA istruzione sola che comincia con SELECT o WITH, senza punti e virgola in mezzo. In tutti e due i casi: solo i cataloghi (pg_policies, pg_class, pg_proc, information_schema.role_table_grants, information_schema.routine_privileges, pg_views, storage.buckets, pg_trigger); MAI INSERT, UPDATE, DELETE, ALTER, CREATE, DROP, GRANT, SET ROLE, né funzioni che scrivono; mai dati delle persone, solo la struttura.` : 'Lavora sul codice e sulle migrazioni.'}

Per ogni falla: dove sta, come si sfrutta (chi, con quale richiesta, cosa ottiene), la ricetta, la prova rossa (per le regole del database: una prova SQL che si collega come utente qualunque e oggi riesce dove non dovrebbe), chi ripara, la certezza, e se la riconosci l'id R probabile. Elenca anche cosa hai controllato e trovato pulito: serve a chiudere le schede che non esistono più.`
}

function promptPrivataV(a, rec) {
  return `${CTX}
⚠️ LAVORO RISERVATO: niente in file, commit o messaggi. Solo nella risposta strutturata.

Il tuo compito: revisione di sicurezza indipendente. Un collega dice di aver trovato queste falle nell'area «${a.area}». Il mandato: confermare solo quelle che reggono, con la tua verifica, e dire cosa ha mancato.
${a.db ? 'Puoi interrogare la struttura della produzione come lui e con le stesse regole: per primo mcp__supabase-marketplace__execute_sql (sola lettura), se manca mcp__Supabase__execute_sql con una sola istruzione SELECT per chiamata; solo i cataloghi, mai dati delle persone, mai scritture.' : ''}

Le sue falle:
${JSON.stringify(rec.falle, null, 1)}

Quello che dice pulito: ${JSON.stringify(rec.controllato_e_pulito)}`
}

const BERSAGLIO = {
  type: 'object',
  properties: {
    idx: { type: 'integer', description: 'il difetto pubblico che contiene il passaggio; NON scriverlo se il bersaglio è un territorio' },
    territorio: { type: 'string', description: 'il territorio che contiene il passaggio; NON scriverlo se il bersaglio è un difetto' },
    modo: { type: 'string', enum: ['seri', 'minori'], description: 'solo con territorio, se il nome compare in tutti e due i modi e il passaggio è in uno solo' },
    campi: { type: 'array', items: { type: 'string' }, description: 'percorsi dentro il bersaglio, come «ricetta.raggio», «lente_b.nascite_previste», «chiuso.motivo», «cause_comuni», «ordine»' },
    perche: { type: 'string', description: 'in poche parole e SENZA ripetere la falla, per esempio «nomina la funzione della R83» o «la funzione è già nel titolo del difetto pubblico»' },
  },
  required: ['campi', 'perche'],
}

const SCHEMA_RISERVATEZZA = {
  type: 'object',
  properties: {
    da_oscurare: { type: 'array', items: BERSAGLIO, description: 'i campi che rivelano una falla riservata' },
    giudicati_pubblici: { type: 'array', items: BERSAGLIO, description: 'i campi segnalati per una frase in comune che hai riletto e che dicono solo cose già pubbliche: già nel registro dei difetti, nelle carte, o contesto dato a tutti' },
    controllati: { type: 'integer', description: 'quanti difetti e territori pubblici hai riletto' },
    note: { type: 'string', description: 'cosa non hai potuto rileggere, senza ripetere le falle' },
  },
  required: ['da_oscurare', 'giudicati_pubblici', 'controllati', 'note'],
}

const LENTI_RISERVATEZZA = {
  istruzioni: 'i passaggi che dicono COME si sfrutta una falla riservata o dove sta esattamente: chi può farlo, con quale richiesta, funzione o rotta, cosa ottiene. Anche detto con parole diverse, anche di passaggio dentro la ricetta, la lente o la verifica di un difetto pubblico.',
  nomi: 'i passaggi che nominano una funzione, una regola del database, una tabella, una rotta, un segreto o un file che compare SOLO nelle falle riservate, così che chi legge capisca dove guardare. Un nome comune a tanti difetti pubblici (order_id, middleware.ts) non segnala niente.',
}

function promptRiservatezza(lente) {
  return `${CTX}
⚠️ LAVORO RISERVATO. Il repository della memoria è PUBBLICO. Quello che trovi lo restituisci SOLO nella risposta strutturata: non scriverlo in nessun file, commento, commit, issue o messaggio, e nella risposta non ripetere le falle.

Il tuo compito: rileggere il testo che sta per diventare pubblico, il ricettario della pre-diagnosi del sito, e segnare ogni passaggio che rivela una delle falle di sicurezza riservate. Una falla aperta descritta in un deposito pubblico è un manuale per chi la vuole sfruttare. Il 24/10 tre ricette pubbliche ne nominavano una di passaggio.

- Le falle riservate: ${SP}/PRIVATO-elenco.json. Leggile, ma non ripeterle.
- Da rileggere per primi: ${SP}/da-controllare-riservato.json, i difetti e i territori pubblici che nominano un nome raro delle falle o ripetono una loro frase lunga. Le frasi in comune sono in «frasi_in_comune», campo per campo: il comando che pubblica si ferma su ognuna che nessuno ha giudicato. Per ciascuna scegli: la oscuri, oppure la metti in «giudicati_pubblici» col perché, se dice solo cose già pubbliche (il difetto pubblico la nomina già, è un fatto delle carte, è il contesto dato a tutti i revisori).
- Il testo pubblico intero: ${SP}/ricettario-completo.json, nei campi «difetti» (solo quelli senza «riservato: true») e «territori». Il campo «privata» NON si pubblica: lascialo stare. Il file è grande: cerca con grep le parole di ogni falla (tabelle, funzioni, rotte, e frasi come «qualunque utente», «senza login», «chiunque abbia un account»).

La tua lente: ${LENTI_RISERVATEZZA[lente]}

Per ogni passaggio dai il bersaglio (idx del difetto OPPURE territorio, mai tutti e due), i campi da oscurare come percorsi dentro quel bersaglio, e il perché in poche parole. Nel dubbio oscura: oscurare in più costa una riga illeggibile, in meno una falla pubblica. Il comando che pubblica si ferma se un campo segnato non esiste: controlla i nomi dei campi sul file.`
}

let risultati
if (MODO === 'seri') {
  phase('Ricette')
  risultati = await pipeline(
    TERR,
    t => agent(promptRicette(t), { label: `ricette:${t.territorio}`, phase: 'Ricette', schema: SCHEMA_SERI, agentType: t.senior || SENIOR.ricette }),
    (rec, t) => rec ? parallel([
      () => agent(promptLenteA(t, rec), { label: `lente-A:${t.territorio}`, phase: 'Verifica', schema: SCHEMA_LENTE_A, agentType: SENIOR.lenteA }),
      () => agent(promptLenteB(t, rec), { label: `lente-B:${t.territorio}`, phase: 'Verifica', schema: SCHEMA_LENTE_B, agentType: SENIOR.lenteB }),
    ]).then(([a, b]) => ({ territorio: t.territorio, ricette: rec, lente_a: a, lente_b: b })) : { territorio: t.territorio, ricette: null },
  )
} else if (MODO === 'lenti') {
  // Solo le verifiche, su ricette già scritte (in un file per territorio, `rec_file`): serve a spezzare
  // la coda di un giro lento su più giri paralleli. Il 24/10 ha tolto mezz'ora alla pre-diagnosi.
  phase('Verifica')
  const dalFile = (prompt, t) => prompt.replace('[]', `(le ricette sono nel file ${t.rec_file}: leggilo per intero con Read)`)
  risultati = await parallel(TERR.flatMap(t => (t.lenti || ['A', 'B']).map(L => () =>
    L === 'A'
      ? agent(dalFile(promptLenteA(t, { ricette: [] }), t), { label: `lente-A:${t.territorio}`, phase: 'Verifica', schema: SCHEMA_LENTE_A, agentType: SENIOR.lenteA })
      : agent(dalFile(promptLenteB(t, { ricette: [] }), t), { label: `lente-B:${t.territorio}`, phase: 'Verifica', schema: SCHEMA_LENTE_B, agentType: SENIOR.lenteB }))))
} else if (MODO === 'minori') {
  phase('Ricette')
  risultati = await pipeline(
    TERR,
    t => agent(promptMinori(t), { label: `minori:${t.territorio}`, phase: 'Ricette', schema: SCHEMA_MINORI, agentType: t.senior || SENIOR.minori }),
    (rec, t) => {
      if (!rec) return { territorio: t.territorio, ricette: null }
      const claimed = rec.ricette.filter(r => r.ancora_vero === 'no')
      if (!claimed.length) return { territorio: t.territorio, ricette: rec, chiusi: null }
      return agent(promptChiusi(t, claimed), { label: `chiusi:${t.territorio}`, phase: 'Verifica', schema: SCHEMA_CHIUSI, agentType: SENIOR.chiusi })
        .then(v => ({ territorio: t.territorio, ricette: rec, chiusi: v }))
    },
  )
} else if (MODO === 'privata') {
  phase('Ricette')
  risultati = await pipeline(
    TERR,
    a => agent(promptPrivata(a), { label: `privata:${a.area}`, phase: 'Ricette', schema: SCHEMA_PRIVATA, agentType: SENIOR.privata }),
    (rec, a) => rec ? agent(promptPrivataV(a, rec), { label: `privata-v:${a.area}`, phase: 'Verifica', schema: SCHEMA_PRIVATA_V, agentType: SENIOR.privataV })
      .then(v => ({ area: a.area, audit: rec, verifica: v })) : { area: a.area, audit: null },
  )
} else if (MODO === 'riservatezza') {
  // Due lenti diverse sullo stesso testo, in parallelo: le etichette «riservato:…» sono quelle che
  // «prediagnosi.mjs raccogli --riservato <journal>» va a cercare.
  phase('Verifica')
  risultati = await parallel(Object.keys(LENTI_RISERVATEZZA).map(lente => () =>
    agent(promptRiservatezza(lente), { label: `riservato:${lente}`, phase: 'Verifica', schema: SCHEMA_RISERVATEZZA, agentType: SENIOR[lente] })))
}
const persi = MODO === 'lenti' || MODO === 'riservatezza' ? risultati.filter(x => !x).length : risultati.filter(x => !x || !(x.ricette || x.audit)).length
if (persi) log(`${persi} territori senza risultato: da rifare`)
return { modo: MODO, risultati }
