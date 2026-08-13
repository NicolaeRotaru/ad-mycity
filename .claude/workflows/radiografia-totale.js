// La radiografia profonda di tutti gli organi, in tre giri con angoli diversi.
//
// Cosa è cambiato qui (lotto corsia G — AR-434, AR-435): ogni mandato dichiara il senior che lo sa
// fare e il prompt esce dal suo mansionario vero (`cervello/prompt-senior.mjs`); la radice del repo
// e l'elenco dei difetti già trovati non sono più percorsi scritti a mano — uno era la cartella
// della sessione cloud che l'ha scritta, e su qualunque altra macchina è un file che non esiste.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promptSenior, radiceRepo } from '../../cervello/prompt-senior.mjs'

export const meta = {
  name: 'radiografia-totale',
  description: 'Radiografia profonda di tutti gli organi della macchina in 3 giri con angoli diversi',
  phases: [
    { title: 'Giro 1 — ampiezza' },
    { title: 'Verifica giro 1' },
    { title: 'Giro 2 — angolo avversario' },
    { title: 'Verifica giro 2' },
    { title: 'Giro 3 — residuo' },
    { title: 'Verifica giro 3' },
    { title: 'Critico di completezza' },
  ],
}

// SOLA LETTURA. La macchina è QUESTO repo; il worker vive su un VPS che da qui NON si vede.
const REPO = radiceRepo()
// L'elenco dei difetti già trovati, se qualcuno l'ha lasciato: GIA_TROVATI dall'ambiente, oppure un
// file nel repo. Se non c'è, resta il cantiere: meglio nessun elenco che un percorso inventato.
const GIA = [process.env.GIA_TROVATI, join(REPO, 'auto-coscienza/gia-trovati.md')].find((p) => p && existsSync(p)) || null

// ─────────────────────────────────────────────────────────────────────────────
// 16 MANDATI su 6 organi. Ognuno raggruppa più aree affini: meno agenti, stesso
// terreno. (La prima versione aveva 48 agenti per giro e stimava 17 ore.)
// ─────────────────────────────────────────────────────────────────────────────
const MANDATI = [
  { organo: 'macchina', key: 'agenti-routing', senior: 'people-talent', focus: 'I 120 mansionari in .claude/agents/: buchi di copertura, doppioni di mandato senza deferral, description che si contendono la stessa domanda, agenti mai richiamati da CLAUDE.md/COMANDI.md, deferral che puntano a un collega inesistente.' },
  { organo: 'macchina', key: 'memoria-contratti', senior: 'bi-lead', focus: 'Il vault (90-Memoria-AI, memoria-squadra): contraddizioni fra file, JSON divergenti dai contratti di cervello/auto-coscienza.md, campi obbligatori vuoti (es. severita non popolata nel cantiere), id duplicati, file morti che nessuno legge più.' },
  { organo: 'macchina', key: 'sensori-cecita', senior: 'data-engineer', focus: 'I sensori: chi dichiara "ok" senza aver misurato, riassunti che contraddicono il dettaglio, cecità travestita da verde, sensori spenti contati come rotti (e viceversa), un comando di sola lettura che riscrive lo stato peggiorandolo.' },
  { organo: 'macchina', key: 'volano-cadenze', senior: 'chief-of-staff', focus: 'Il volano dell apprendimento e le cadenze: lezioni senza un freno che possa fallire, correzioni di Nicola chiuse con una frase invece che con un gate, cadenze dichiarate in ritmo.md che non lasciano tracce reali, quaderni fermi.' },
  { organo: 'macchina', key: 'semaforo-northstar', senior: 'internal-audit', focus: 'Il semaforo 🟢🟡🔴 e l allineamento alla crescita: punti dove un 🔴 può partire senza firma, colore deciso a occhio invece che da una regola, quota di lavoro che la macchina fa su sé stessa invece che su ordini/negozi/margine.' },
  { organo: 'macchina', key: 'rischio-se-stessa', senior: 'security', focus: 'La macchina può farsi male: segreti esposti, permessi .claude/settings.json troppo larghi, un giro che può corrompere la memoria (reset/force-push), loop auto-amplificanti, single point of failure, guardiani che passano quando il dato manca.' },

  { organo: 'pannello', key: 'stato-freschezza', senior: 'frontend-dev', focus: 'pannello/: stato perso cambiando chat o ricaricando, liste stale, dati non aggiornati dopo una mutazione, caselle con dato condiviso senza usePanelSync/emitSync, race condition, doppio invio, useEffect senza cleanup.' },
  { organo: 'pannello', key: 'errori-navigazione', senior: 'frontend-dev', focus: 'pannello/: navigazione e tasto indietro, deep-link rotti, errori non gestiti, promise senza catch, crash su dato mancante, error boundary assenti, messaggi di errore che non dicono cosa fare.' },
  { organo: 'pannello', key: 'card-mobile-perf', senior: 'ux-designer', focus: 'pannello/: le card di approvazione (mostrano "Cosa cambia"/"Se va bene"? titoli con sigle o path che Nicola non deve vedere?), mobile e accessibilità, render inutili, liste non virtualizzate, dipendenze vulnerabili.' },

  { organo: 'senior', key: 'registro-qualita', senior: 'prompt-engineer', focus: '.claude/agents/: il conteggio torna con agent-registry-check.mjs? frontmatter validi? i mansionari dicono COME si lavora o solo COSA si sa? mancano output atteso, colore, dove scrivere? quali senior non sono MAI stati richiamati (incrocia con memoria-squadra/, consegne/, DECISIONI.md)?' },
  { organo: 'senior', key: 'loop-collaborazione', senior: 'chief-of-staff', focus: 'I quaderni memoria-squadra/: righe ESITO presenti? quanti reparti fermi o decorativi? la calibrazione atteso→reale esiste? i senior si passano il lavoro tra loro o finisce tutto da Nicola? cerca i passaggi mancanti nella Sala Operativa.' },

  { organo: 'worker', key: 'coda-lock-orfani', senior: 'devops-sre', focus: 'cervello/: il claim dei lavori è atomico o due worker possono prendere lo stesso? i lavori orfani tornano indietro da soli? il lock è davvero esclusivo dopo un crash (file stale, PID riusati, nessuna scadenza)? il kill-switch della pausa è fail-closed?' },
  { organo: 'worker', key: 'git-motore-timer', senior: 'devops-sre', focus: 'cervello/: dove si perde il lavoro (rebase/force-push, rami divergenti, gate di pubblicazione che blocca per conflitti inesistenti); cervello/motore-ai.sh quando la quota finisce, le credenziali scadono o scatta il timeout (un errore del motore diventa un "fatto" silenzioso? retry senza backoff?); i timer e cervello/ritmo.sh fanno quello che dicono?' },
  { organo: 'worker', key: 'script-shell-risorse', senior: 'platform-infra', focus: 'cervello/*.sh (10 file): set -euo pipefail mancante, variabili non quotate, exit code ignorati, errori in /dev/null che diventano verdetti, race su file condivisi; più log e cartelle che crescono senza rotazione né potatura.' },

  { organo: 'github', key: 'ci-segreti-igiene', senior: 'security', focus: '.github/workflows/ (4 file): trigger che non scattano quando dovrebbero, path filter troppo stretti, job senza timeout, permissions larghe, azioni non pinnate a un SHA; più segreti committati, .gitignore incompleto, artefatti generati tracciati che generano conflitti a ogni ramo.' },
  { organo: 'github', key: 'hook-locali', senior: 'devops-sre', focus: 'Gli hook locali, LEGGENDO LA CONFIGURAZIONE — MAI tentandoli. Divieto assoluto in questo mandato: nessun `git commit`, `git push`, `git add`, nessuna prova di aggiramento eseguita (restano appesi in attesa di un permesso che nessuno darà, e bloccano la corsia). Leggi .claude/settings.json, cervello/installa-hooks.sh, .git/hooks/ e i file che li registrano, poi RAGIONA sul testo: un hook che fallisce blocca il lavoro o passa in silenzio? gli hook installati coincidono con quelli dichiarati? esiste una via documentata per saltarli (--no-verify, core.hooksPath, variabili d\'ambiente) e qualcuno se ne accorgerebbe? un hook scrive mentre il comando è di sola lettura? Le prove qui sono `--dry-run`, la lettura dei file di configurazione, o prova_tipo:"umano".' },

  { organo: 'codice', key: 'guardiani-scritture', senior: 'backend-dev', focus: 'cervello/*.mjs (185 file): guardiani che danno un verdetto senza aver misurato; scritture in memoria non atomiche (due processi corrompono il JSON, nessun backup prima di sovrascrivere); catch vuoti, exit 0 su fallimento, JSON.parse senza try; logica duplicata che divergerà.' },
]

const SCHEMA_DIFETTI = {
  type: 'object',
  properties: {
    difetti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string', description: 'Come lo diresti a voce a Nicola. Verbo + cosa vera. Niente sigle, niente path nel titolo.' },
          dove: { type: 'string' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string' },
          impatto: { type: 'string' },
          causa_radice: { type: 'string' },
          prova: { type: 'string', description: 'Per bloccante/grave DEVE essere un comando che diventa rosso se il difetto c\'è. Mai un grep di una parola.' },
          prova_tipo: { type: 'string', enum: ['comando', 'umano', 'grep'] },
          fix: { type: 'string' },
          impatto_crescita: { type: 'string', enum: ['alto', 'medio', 'basso'] },
        },
        required: ['titolo', 'dove', 'severita', 'descrizione', 'causa_radice', 'prova', 'prova_tipo', 'impatto_crescita'],
      },
    },
    zone_non_viste: { type: 'array', items: { type: 'string' } },
  },
  required: ['difetti', 'zone_non_viste'],
}

const SCHEMA_VERDETTO = {
  type: 'object',
  properties: {
    reale: { type: 'boolean' },
    perche: { type: 'string' },
    severita_corretta: { type: 'string', enum: ['bloccante', 'grave', 'minore', 'non-e-un-difetto'] },
    prova_regge: { type: 'boolean' },
  },
  required: ['reale', 'perche', 'prova_regge'],
}

// Il tetto di tempo è ciò che mancava: senza budget un agente si impantana su un
// comando lento e blocca la corsia (il primo tentativo è morto così).
const BUDGET = `
TETTO DI TEMPO — VINCOLANTE:
- Massimo ~20 chiamate di strumento in tutto. Poi CONSEGNA quello che hai trovato.
- Ogni comando Bash va lanciato con timeout: \`timeout 30 <comando>\`. Mai senza.
- VIETATI: npm install/ci, build, git log sull'intera storia, find sull'intero disco,
  qualsiasi comando che possa durare più di 30 secondi. Se ti serve un dato costoso,
  dichiaralo in zone_non_viste invece di aspettarlo.
- Meglio 3 difetti solidi che 10 abbozzati: la verifica scarta gli abbozzi.
`

const REGOLE = `
REGOLE NON NEGOZIABILI:
- SOLA LETTURA. Non modificare NIENTE. Non lanciare comandi che scrivono.
- L'ASTICELLA: un difetto "bloccante" o "grave" nasce SOLO con una prova che gira — un
  comando che diventa ROSSO se il difetto c'è. Una parola cercata in un file NON è una prova.
  Se non sai scrivere il comando: declassa a "minore", oppure prova_tipo:"umano" dicendo
  cosa deve guardare un occhio umano.
- NIENTE INVENTATO. Ogni numero ha una fonte che hai verificato tu adesso.
- Ciò che non hai potuto vedere va in zone_non_viste. Non è un verde.
- Il titolo si legge a voce: niente sigle (AR-xxx), niente path nel titolo.
- Il repo è ${REPO}. Il worker gira su un VPS che da qui NON si vede: dichiaralo, non fingere.
- NON ripetere difetti già noti: ${GIA ? `leggi ${GIA} e ` : ''}leggi
  MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json. Cerca il NUOVO.
${BUDGET}`

function promptFinder(d, giro, giaTrovati) {
  const angolo = {
    1: 'Primo giro: AMPIEZZA. Copri il mandato in modo sistematico.',
    2: `Secondo giro: ANGOLO AVVERSARIO. Un collega ha già coperto questo mandato e ha trovato quanto sotto. Non ripeterlo: trova ciò che gli è SFUGGITO. Vai dove non ha guardato — casi limite, percorsi di errore, cosa succede quando un dato manca, i file piccoli e ignorati, le assunzioni implicite.\n\nGIÀ TROVATO NEL GIRO 1:\n${giaTrovati || '(niente)'}`,
    3: `Terzo giro: RESIDUO. Due colleghi hanno già setacciato. Quel che resta è nascosto per un motivo: interazioni fra due pezzi che presi da soli sembrano giusti, difetti che si vedono solo nel tempo (accumulo, crescita, drift), cose corrette oggi che si romperanno al prossimo cambio, e ciò che nessuno controlla perché tutti pensano lo controlli qualcun altro.\n\nGIÀ TROVATO NEI GIRI 1-2:\n${giaTrovati || '(niente)'}`,
  }[giro]

  // Il mandato entra come focus, il resto come compito: l'identità la porta il mansionario.
  return promptSenior(d.senior, {
    radice: REPO,
    focus: `Radiografia dell'organo "${d.organo}", mandato "${d.key}". CERCA QUI: ${d.focus}`,
    compito: `Sei spietato: qui il mestiere serve a trovare quello che gli altri non hanno visto.

${angolo}

${REGOLE}

Lavora con Read/Grep/Glob/Bash(sola lettura) dentro ${REPO}.`,
  })
}

function promptVerifica(f) {
  return promptSenior('internal-audit', {
    radice: REPO,
    focus: 'Verifica avversariale di un difetto segnalato da un collega: REFUTALO, non confermarlo.',
    compito: `Parti dal presupposto che sia un falso allarme.

DIFETTO: ${f.titolo}
DOVE: ${f.dove}
DESCRIZIONE: ${f.descrizione}
SEVERITÀ: ${f.severita}
PROVA (${f.prova_tipo}): ${f.prova}

Guarda il codice vero in ${REPO} ed esegui la prova se è un comando (con \`timeout 30\`).
Esiste davvero? la severità è gonfiata? la prova diventa DAVVERO rossa, o è un grep travestito?
esiste già una protezione che lo copre? è un duplicato di qualcosa di noto?

Nel dubbio: reale=false. Un falso allarme che passa costa più di un difetto perso.
Massimo ~10 chiamate di strumento.`,
  })
}

function riassumi(ds) {
  return ds.map(f => `- [${f.severita}] ${f.titolo} (${f.dove})`).join('\n')
}

async function giro(n, ctx) {
  const out = await pipeline(
    MANDATI,
    (d) => agent(promptFinder(d, n, ctx[d.key]), {
      label: `g${n}:${d.organo}/${d.key}`,
      phase: n === 1 ? 'Giro 1 — ampiezza' : n === 2 ? 'Giro 2 — angolo avversario' : 'Giro 3 — residuo',
      schema: SCHEMA_DIFETTI,
    }),
    (res, d) => {
      if (!res?.difetti?.length) return { dim: d, difetti: [], zone: res?.zone_non_viste || [] }
      const gravi = res.difetti.filter(f => f.severita !== 'minore')
      const minori = res.difetti.filter(f => f.severita === 'minore').map(f => ({ ...f, organo: d.organo, verificato: false }))
      if (!gravi.length) return { dim: d, difetti: minori, zone: res.zone_non_viste || [] }
      return parallel(gravi.map(f => () =>
        agent(promptVerifica(f), {
          label: `v${n}:${String(f.titolo).slice(0, 30)}`,
          phase: `Verifica giro ${n}`,
          schema: SCHEMA_VERDETTO,
        }).then(v => ({ ...f, organo: d.organo, verdetto: v, verificato: true }))
      )).then(vs => {
        const ok = vs.filter(Boolean).filter(x => x.verdetto?.reale)
        return {
          dim: d,
          difetti: [...ok, ...minori],
          scartati: vs.filter(Boolean).length - ok.length,
          zone: res.zone_non_viste || [],
        }
      })
    }
  )
  return out.filter(Boolean)
}

phase('Giro 1 — ampiezza')
log('Giro 1 su 16 mandati, 6 organi')
const r1 = await giro(1, {})
const ctx1 = {}
for (const r of r1) ctx1[r.dim.key] = riassumi(r.difetti)
log(`Giro 1: ${r1.reduce((a, r) => a + r.difetti.length, 0)} confermati`)

phase('Giro 2 — angolo avversario')
const r2 = await giro(2, ctx1)
const ctx2 = {}
for (const r of r1) ctx2[r.dim.key] = riassumi(r.difetti)
for (const r of r2) ctx2[r.dim.key] = (ctx2[r.dim.key] || '') + '\n' + riassumi(r.difetti)
log(`Giro 2: ${r2.reduce((a, r) => a + r.difetti.length, 0)} nuovi`)

phase('Giro 3 — residuo')
const r3 = await giro(3, ctx2)
log(`Giro 3: ${r3.reduce((a, r) => a + r.difetti.length, 0)} nuovi`)

phase('Critico di completezza')
const ORGANI = ['macchina', 'pannello', 'senior', 'worker', 'github', 'codice']
const tutti = [...r1, ...r2, ...r3]
const critici = await parallel(ORGANI.map(o => () => {
  const suoi = tutti.filter(r => r.dim.organo === o).flatMap(r => r.difetti)
  const zone = [...new Set(tutti.filter(r => r.dim.organo === o).flatMap(r => r.zone || []))]
  return agent(promptSenior('internal-audit', {
    radice: REPO,
    focus: `Critico di completezza per l'organo "${o}": tre giri hanno guardato, tu cerchi quello che non ha guardato nessuno.`,
    compito: `Repo ${REPO}.

Tre giri hanno prodotto questi ${suoi.length} difetti:
${riassumi(suoi) || '(nessuno)'}

Zone dichiarate non viste:
${zone.map(z => '- ' + z).join('\n') || '(nessuna)'}

Una domanda sola: COSA MANCA ANCORA? Un modo di guardare che nessuno ha usato, un file che
nessuno ha aperto, un'affermazione dei tre giri che nessuno ha verificato, o un difetto che
esiste solo nell'incastro fra questo organo e un altro. Se trovi qualcosa, provalo adesso.
Se davvero non manca niente, dillo e spiega su che base lo affermi.

${REGOLE}`,
  }), { label: `critico:${o}`, phase: 'Critico di completezza', schema: SCHEMA_DIFETTI })
}))

const daCritici = critici.filter(Boolean).flatMap((c, i) =>
  (c.difetti || []).map(f => ({ ...f, organo: ORGANI[i], verificato: false }))
)
const tuttiDifetti = [...tutti.flatMap(r => r.difetti), ...daCritici]
const perOrgano = {}
for (const f of tuttiDifetti) {
  perOrgano[f.organo] = perOrgano[f.organo] || {}
  perOrgano[f.organo][f.severita] = (perOrgano[f.organo][f.severita] || 0) + 1
}

log(`TOTALE ${tuttiDifetti.length} difetti · ${tutti.reduce((a, r) => a + (r.scartati || 0), 0)} falsi allarmi scartati`)

return {
  totale: tuttiDifetti.length,
  per_giro: { g1: r1.reduce((a, r) => a + r.difetti.length, 0), g2: r2.reduce((a, r) => a + r.difetti.length, 0), g3: r3.reduce((a, r) => a + r.difetti.length, 0), critici: daCritici.length },
  per_organo: perOrgano,
  falsi_allarmi_scartati: tutti.reduce((a, r) => a + (r.scartati || 0), 0),
  zone_non_viste: [...new Set([...tutti.flatMap(r => r.zone || []), ...critici.filter(Boolean).flatMap(c => c.zone_non_viste || [])])],
  difetti: tuttiDifetti,
}
