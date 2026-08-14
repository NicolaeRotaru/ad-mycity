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
import { FATTI_DEL_GIRO, fattiVivi, promptSenior, radiceRepo } from '../../cervello/prompt-senior.mjs'
import { turnoDelGiro } from '../../cervello/turno-senior.mjs'

export const meta = {
  name: 'giro-operativo',
  description: 'Il giro operativo quotidiano come FLOTTA di senior in parallelo (upgrade U18): ogni motore di soldi propone le mosse a piu alto ritorno sui dati reali, verifica avversariale, poi l\'AD le ordina in una coda pronta da firmare',
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

const REPO = radiceRepo()
const FATTI = fattiVivi(FATTI_DEL_GIRO, REPO)

// Un avviso che non può far cadere il giro: `log` è una globale del motore dei workflow, e questa
// riga gira PRIMA della prima fase. Se un domani non ci fosse, il messaggio esce lo stesso.
const avvisa = (m) => (typeof log === 'function' ? log(m) : console.log(m))

// CHI va in turno oggi: dai dati, non da un elenco scritto qui.
const { turno, copertura } = turnoDelGiro({ radice: REPO })
avvisa(`In turno ${turno.length} senior su ${copertura.senior} (tutti passano in ${copertura.giriPerPassareTutti} giri) · ${copertura.passaggiPendenti} passaggi fra colleghi da raccogliere`)

const COMPITO_PROPOSTE = `Leggi i DATI REALI del marketplace col Supabase MCP in SOLA LETTURA (progetto clmpyfvpvfjgeviworth: tabelle orders, products, profiles, abandoned_carts, merchants_leads, reviews, ...) e la memoria in \`MyCity-Vault/90-Memoria-AI/\` (STATO.md, registro-realta.json). NON scrivere nulla sul DB.
Proponi 1-3 MOSSE a piu alto ritorno per far crescere l'azienda ORA. Per ognuna:
- titolo · perche FONDATO sui dati (cita il numero reale + la fonte: mai cifre orfane) · metrica che si muove · valore atteso entro una data (serve alla calibrazione) · colore 🟢/🟡/🔴 (🔴 = soldi/messaggi a clienti reali/deploy/prezzi) · primo passo concreto · sforzo.
Regola d'oro: preferisci la mossa che muove la NORTH STAR (ordine pagato+consegnato / negozio live), non attivita a basso ritorno. Se un dato manca, dillo (non inventarlo).`

phase('Proposte')
const proposte = await pipeline(
  turno,
  (m) => agent(
    promptSenior(m.key, { focus: m.focus, compito: COMPITO_PROPOSTE, radice: REPO, fatti: FATTI }),
    { label: `propone:${m.key}`, phase: 'Proposte', schema: MOSSE }
  ),
  // Chi propone non si verifica da solo: il controllo interno è un mestiere, e ha il suo mansionario.
  (prop, m) => agent(
    promptSenior('internal-audit', {
      radice: REPO,
      fatti: FATTI,
      focus: `Verifica avversariale delle mosse che il collega @${m.key} propone di mettere in coda oggi.`,
      compito: `Ecco le mosse proposte:
${JSON.stringify(prop?.mosse || [], null, 2)}
Per CIASCUNA verifica nei dati reali (Supabase MCP sola lettura) e nella memoria del repo:
1) il "perche" e davvero fondato su un numero reale con fonte? (se e un'ipotesi spacciata per fatto → scarta o declassa)
2) il colore e giusto? (soldi/clienti reali/deploy/prezzi = 🔴, mai 🟢 travestito)
3) l'impatto atteso e realistico dato lo stato (0-1 ordini, catalogo seed)? correggi 'atteso' se gonfiato.
Tieni SOLO le mosse solide. Restituisci {reparto:"${m.key}", mosse:[...solo quelle confermate, corrette...]}.`,
    }),
    { label: `verifica:${m.key}`, phase: 'Verifica', schema: MOSSE }
  )
)

// Sintesi dell'AD: ordina tutto per impatto/sforzo, separa cosa parte da solo (🟢) da cosa va firmato (🟡/🔴).
phase('Sintesi AD')
const tutte = proposte.filter(Boolean).flatMap((p) => (p.mosse || []).map((x) => ({ ...x, reparto: p.reparto })))
const sintesi = await agent(
  `Sei l'AD digitale di MyCity (il tuo manuale operativo è CLAUDE.md, nella radice del repo). Ecco tutte le mosse verificate dei reparti:
${JSON.stringify(tutte, null, 2)}
Componi il PIANO del giro: ordina le mosse per (impatto sulla North Star ÷ sforzo), togli i doppioni, e per le prime scegli la sequenza giusta (cosa sblocca cosa).
Separa: (a) 🟢 che l'AD puo eseguire da solo ora; (b) 🟡/🔴 da mettere in coda AZIONI-IN-ATTESA con "cosa cambia" e "se va bene".
Per le 3 mosse in cima, ricorda che vanno registrate come previsione: node cervello/calibrazione.mjs prevedi --reparto=@... --metrica=... --atteso=... --entro=...
Sii concreto e onesto: se il collo di bottiglia resta la prima transazione, dillo e mettila in cima.`,
  { label: 'sintesi-ad', phase: 'Sintesi AD', schema: {
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
