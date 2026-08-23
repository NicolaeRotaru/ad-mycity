// AR-780 — PERCHE' QUESTO FILE NON HA IMPORT, E PERCHE' RICEVE `args`.
//
// Fino al 23/8/2026 apriva con degli `import` e metteva `meta` piu' in basso: il motore pretende che
// `export const meta` sia la PRIMA istruzione e non accetta nessun import. Rifiutava lo script prima
// di eseguirne una riga — da due mesi, mentre CLAUDE.md lo nomina nei comandi rapidi.
//
// Qui non bastava togliere gli import. Questo giro aveva bisogno di due cose che si calcolano
// leggendo il repo — CHI va in turno oggi e i FATTI vivi del registro — e dentro il motore il disco
// non si legge. Adesso le calcola CHI LANCIA il workflow e le passa in `args`:
//
//   node cervello/prepara-giro.mjs            -> stampa il JSON da passare come args
//
// Se `args` non arriva, lo script non indovina: lo dice e si ferma. Un giro che parte senza sapere
// chi e' in turno proporrebbe le mosse dei senior sbagliati, e nessuno se ne accorgerebbe.
//
// I mansionari NON si incollano piu' nel prompt: il motore li carica da se' con `agentType`.

// Il giro operativo: la flotta di senior che ogni giro propone le mosse a più alto ritorno.
//
// Cosa è cambiato qui (lotto corsia G — AR-434, AR-435, AR-187, AR-126, AR-620) e perché:
//  · i senior NON si scrivono più a mano. Il prompt di ognuno lo compone `cervello/prompt-senior.mjs`
//    dal suo mansionario vero in .claude/agents/: prima arrivava al modello una riga di focus al
//    posto di 20 KB di mestiere, e i 120 mansionari non li leggeva nessuno.
//  · CHI lavora non è più un elenco di sei nomi cablati qui dentro (l'organigramma è passato a 120 e
//    quella riga non fu mai riaperta): lo decide `cervello/turno-senior.mjs` dai dati — passaggi fra
//    colleghi non raccolti, motori di soldi dell'organigramma, rotazione fra chi è fermo da più tempo.
//  · il focus non nomina più entità: le entità (negozio faro, stato degli ordini) si citano dal
//    registro-fatti, che è la loro unica casa. Prima erano scritte qui e restavano vecchie per mesi.
//  · il percorso del repo non è più scritto a mano: si risolve a runtime, perché quello scritto era
//    vero nella sessione cloud e falso sul VPS.

export const meta = {
  name: 'giro-operativo',
  description: 'Il giro operativo quotidiano come FLOTTA di senior in parallelo (upgrade U18): ogni motore di soldi propone le mosse a piu alto ritorno sui dati reali, verifica avversariale, poi l\'AD le ordina in una coda pronta da firmare',
  // `whenToUse` lo legge chi sceglie quale workflow lanciare: e' l'unico posto dove
  // l'istruzione arriva PRIMA della chiamata. Dentro il file sarebbe un avviso che nessuno legge.
  whenToUse: 'Il giro operativo. PRIMA di lanciarlo: `node cervello/prepara-giro.mjs` e passa il JSON come `args` — dentro il motore il disco non si legge, e senza turno il workflow si ferma invece di proporre le mosse dei senior sbagliati.',
  phases: [
    { title: 'Proposte', detail: 'un senior per motore di soldi: 1-3 mosse a piu alto ROI, fondate sui dati' },
    { title: 'Verifica', detail: 'verifica avversariale: tieni solo le mosse fondate, col colore giusto' },
    { title: 'Sintesi AD', detail: 'l\'AD ordina per impatto/sforzo e prepara la coda' },
  ],
}

// Ogni mossa porta un EFFETTO PREVISTO misurabile: e il gancio per U3 (calibrazione).
// Chi propone diventa responsabile della previsione -> node cervello/calibrazione.mjs prevedi ...
const MOSSE = {
  type: 'object',
  properties: {
    reparto: { type: 'string' },
    mosse: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string' },
          perche: { type: 'string', description: 'la ragione FONDATA sui dati (cita il numero reale e la fonte)' },
          metrica: { type: 'string', description: 'la metrica che si muove (es. ordini, negozi_live, AOV, recensioni)' },
          atteso: { type: 'number', description: 'valore atteso della metrica entro la scadenza (per la calibrazione)' },
          entro: { type: 'string', description: 'AAAA-MM-GG' },
          colore: { type: 'string', enum: ['🟢', '🟡', '🔴'] },
          primo_passo: { type: 'string' },
          sforzo: { type: 'string', enum: ['basso', 'medio', 'alto'] },
        },
        required: ['titolo', 'perche', 'metrica', 'atteso', 'colore', 'primo_passo', 'sforzo'],
      },
    },
  },
  required: ['reparto', 'mosse'],
}

// I due dati che si leggono dal repo arrivano da fuori, in `args`: qui dentro il disco non si legge.
// Li prepara `node cervello/prepara-giro.mjs`, che e' lo stesso codice di prima — solo spostato dove
// puo' girare davvero.
const preparato = args || {}
const turno = Array.isArray(preparato.turno) ? preparato.turno : []
const FATTI = preparato.fatti || null
const copertura = preparato.copertura || {}

if (!turno.length) {
  // Non si indovina: un giro che non sa chi e' in turno proporrebbe le mosse dei senior sbagliati,
  // e nessuno se ne accorgerebbe guardando il risultato.
  log('⛔ giro-operativo: `args` non porta il turno. Lancialo cosi\': node cervello/prepara-giro.mjs → passa il JSON come args del workflow.')
  return { errore: 'turno mancante in args', mosse: [] }
}
log(`In turno ${turno.length} senior su ${copertura.senior ?? '?'} (tutti passano in ${copertura.giriPerPassareTutti ?? '?'} giri) · ${copertura.passaggiPendenti ?? '?'} passaggi fra colleghi da raccogliere`)

const COMPITO_PROPOSTE = `Leggi i DATI REALI del marketplace col Supabase MCP in SOLA LETTURA (progetto clmpyfvpvfjgeviworth: tabelle orders, products, profiles, abandoned_carts, merchants_leads, reviews, ...) e la memoria in \`MyCity-Vault/90-Memoria-AI/\` (STATO.md, registro-realta.json). NON scrivere nulla sul DB.
Proponi 1-3 MOSSE a piu alto ritorno per far crescere l'azienda ORA. Per ognuna:
- titolo · perche FONDATO sui dati (cita il numero reale + la fonte: mai cifre orfane) · metrica che si muove · valore atteso entro una data (serve alla calibrazione) · colore 🟢/🟡/🔴 (🔴 = soldi/messaggi a clienti reali/deploy/prezzi) · primo passo concreto · sforzo.
Regola d'oro: preferisci la mossa che muove la NORTH STAR (ordine pagato+consegnato / negozio live), non attivita a basso ritorno. Se un dato manca, dillo (non inventarlo).`

phase('Proposte')
const proposte = await pipeline(
  turno,
  (m) => agent(
    `${m.focus}

${FATTI ? `FATTI VIVI DEL REGISTRO (usali, non inventarne altri):\n${JSON.stringify(FATTI, null, 2)}\n` : ''}
${COMPITO_PROPOSTE}`,
    { label: `propone:${m.key}`, phase: 'Proposte', schema: MOSSE, agentType: m.key }
  ),
  // Chi propone non si verifica da solo: il controllo interno è un mestiere, e ha il suo mansionario.
  (prop, m) => agent(
    `Verifica avversariale delle mosse che il collega @${m.key} propone di mettere in coda oggi.

${FATTI ? `FATTI VIVI DEL REGISTRO:\n${JSON.stringify(FATTI, null, 2)}\n` : ''}
Ecco le mosse proposte:
${JSON.stringify(prop?.mosse || [], null, 2)}
Per CIASCUNA verifica nei dati reali (Supabase MCP sola lettura) e nella memoria del repo:
1) il "perche" e davvero fondato su un numero reale con fonte? (se e un'ipotesi spacciata per fatto → scarta o declassa)
2) il colore e giusto? (soldi/clienti reali/deploy/prezzi = 🔴, mai 🟢 travestito)
3) l'impatto atteso e realistico dato lo stato (0-1 ordini, catalogo seed)? correggi 'atteso' se gonfiato.
Tieni SOLO le mosse solide. Restituisci {reparto:"${m.key}", mosse:[...solo quelle confermate, corrette...]}.`,
    { label: `verifica:${m.key}`, phase: 'Verifica', schema: MOSSE, agentType: 'internal-audit' }
  )
)

// Sintesi dell'AD: ordina tutto per impatto/sforzo, separa cosa parte da solo (🟢) da cosa va firmato (🟡/🔴).
phase('Sintesi AD')
const tutte = proposte.filter(Boolean).flatMap((p) => (p.mosse || []).map((x) => ({ ...x, reparto: p.reparto })))
// 23/8/2026 (AR-780) — QUESTO PASSO NON E' PIU' «l'AD in persona», e non e' un dettaglio.
//
// Diceva a un sotto-agente «Sei l'AD digitale di MyCity, il tuo manuale e' CLAUDE.md»: ma un
// sotto-agente CLAUDE.md non ce l'ha, quindi era un generico a cui si chiedeva di recitare l'AD —
// la stessa «identita' scritta a mano» che la porta dei senior vieta, con un nome diverso.
//
// Il mestiere di comporre le mosse di piu' reparti in un piano unico ha un senior vero:
// @chief-of-staff («percorso critico delle iniziative multi-reparto, dipendenze, follow-up»). Lui
// il mansionario ce l'ha. La decisione finale resta dell'AD: questo passo produce una PROPOSTA.
const sintesi = await agent(
  `Componi il piano del giro dalle mosse verificate dei reparti. Ecco tutte le mosse:
${JSON.stringify(tutte, null, 2)}
Componi il PIANO del giro: ordina le mosse per (impatto sulla North Star ÷ sforzo), togli i doppioni, e per le prime scegli la sequenza giusta (cosa sblocca cosa).
Separa: (a) 🟢 che l'AD puo eseguire da solo ora; (b) 🟡/🔴 da mettere in coda AZIONI-IN-ATTESA con "cosa cambia" e "se va bene".
Per le 3 mosse in cima, ricorda che vanno registrate come previsione: node cervello/calibrazione.mjs prevedi --reparto=@... --metrica=... --atteso=... --entro=...
Sii concreto e onesto: se il collo di bottiglia resta la prima transazione, dillo e mettila in cima.`,
  { label: 'sintesi-ad', phase: 'Sintesi AD', agentType: 'chief-of-staff', schema: {
    type: 'object',
    properties: {
      collo_di_bottiglia: { type: 'string' },
      top: { type: 'array', items: { type: 'object', properties: {
        rank: { type: 'number' }, titolo: { type: 'string' }, reparto: { type: 'string' },
        colore: { type: 'string' }, perche: { type: 'string' }, primo_passo: { type: 'string' },
        metrica: { type: 'string' }, atteso: { type: 'number' }, entro: { type: 'string' } },
        required: ['rank', 'titolo', 'colore', 'primo_passo'] } },
      da_eseguire_ora: { type: 'array', items: { type: 'string' } },
      da_firmare: { type: 'array', items: { type: 'string' } },
    },
    required: ['collo_di_bottiglia', 'top'] } }
)

return {
  collo_di_bottiglia: sintesi?.collo_di_bottiglia || '',
  top: sintesi?.top || [],
  da_eseguire_ora: sintesi?.da_eseguire_ora || [],
  da_firmare: sintesi?.da_firmare || [],
  mosse_verificate: tutte.length,
  reparti: proposte.filter(Boolean).map((p) => p.reparto),
  turno: turno.map((m) => ({ reparto: m.key, motivo: m.motivo })),
  copertura,
}
