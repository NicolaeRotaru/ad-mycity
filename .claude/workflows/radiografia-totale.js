export const meta = {
  name: 'radiografia-totale',
  description: 'Radiografia profonda di tutti gli organi della macchina in 3 giri con angoli diversi',
  phases: [
    { title: 'Giro 1 — ampiezza' },
    { title: 'Giro 2 — angolo avversario' },
    { title: 'Giro 3 — residuo' },
    { title: 'Critico di completezza' },
    { title: 'Sintesi' },
  ],
}

// SOLA LETTURA su tutto. La macchina è QUESTO repo; il Pannello è pannello/; il worker vive sul VPS
// e da qui si vede solo di riflesso (dichiaralo, non fingere di averlo visto).
const REPO = '/home/user/ad-mycity'

// ─────────────────────────────────────────────────────────────────────────────
// LE DIMENSIONI — 6 organi. Ogni voce è un mandato di ricerca a sé.
// ─────────────────────────────────────────────────────────────────────────────
const DIM = [
  // ── ORGANO 1: LA MACCHINA (l'AD) ──
  { organo: 'macchina', key: 'coerenza-agenti', focus: 'i 120 agenti in .claude/agents/: CONTA i file reali, buchi di copertura, doppioni di mandato, description vaghe che sballano il routing, agenti mai richiamati da CLAUDE.md/COMANDI.md, responsabilità in conflitto' },
  { organo: 'macchina', key: 'vettori-installati', focus: 'i vettori-azienda di AD-VETTORI-SISTEMA.md sono davvero installati nei processi, o sono solo scritti? cerca il comportamento, non la dichiarazione' },
  { organo: 'macchina', key: 'sensori-dati', focus: 'sensori: Supabase/Stripe/PostHog/Resend raggiungibili e USATI? cervello/radar-fonti.json ha fonti vive o morte? quali sensori ciechi e da quanto? verifica davvero' },
  { organo: 'macchina', key: 'integrita-memoria', focus: 'integrità del vault (90-Memoria-AI, memoria-squadra): ridondanze, contraddizioni, file stale/morti, JSON divergenti dai contratti di cervello/auto-coscienza.md, KPI divergenti dal GLOSSARIO-KPI' },
  { organo: 'macchina', key: 'chiusura-volano', focus: 'il volano si chiude? lezioni agganciate a gate veri (gate-veri.mjs, mutanti.json) o frasi decorative? quante correzioni di Nicola hanno un freno che può fallire?' },
  { organo: 'macchina', key: 'cadenza-esecuzione', focus: 'le cadenze di cervello/ritmo.md girano davvero? piano del mattino, report della sera, review, retrospettiva: prova le tracce reali, non le promesse' },
  { organo: 'macchina', key: 'calibrazione-onesta', focus: 'la macchina si auto-valuta onestamente? confronta atteso vs reale nei quaderni, cerca auto-accrediti gonfiati, «fatto» dichiarati senza prova comportamentale' },
  { organo: 'macchina', key: 'copertura-cieca', focus: 'cosa NON guarda nessun sensore e nessun guardiano? le zone cieche strutturali. Trova almeno 3 zone dove un guasto passerebbe inosservato per giorni' },
  { organo: 'macchina', key: 'guardrail-semaforo', focus: 'il semaforo 🟢🟡🔴 regge? cerca punti dove un 🔴 può partire senza firma, o dove il colore è deciso a occhio invece che da una regola' },
  { organo: 'macchina', key: 'northstar', focus: 'allineamento alla crescita: gli OKR e la coda portano ordini/negozi/margine, o la macchina lavora su sé stessa? misura la quota di lavoro auto-riferito' },
  { organo: 'macchina', key: 'efficienza-costo', focus: 'spreco: ricontrolli a cadenza sbagliata, rilanci inutili, prompt enormi, modello premium su compiti banali (cervello/banco-ai.md), valore prodotto vs costo' },
  { organo: 'macchina', key: 'rischio-se-stessa', focus: 'la macchina può farsi male? segreti esposti in cervello/*.sh|*.mjs o nel vault, permessi .claude/settings.json troppo larghi, un giro che può corrompere la memoria (reset/force-push), loop auto-amplificanti, single point of failure' },
  { organo: 'macchina', key: 'contratti-json', focus: 'i file JSON di auto-coscienza rispettano i contratti dichiarati? campi mancanti, tipi sbagliati, severita null (il cantiere ha 563 difetti con severita non popolata: verifica), id duplicati, stati non previsti' },

  // ── ORGANO 2: IL PANNELLO ──
  { organo: 'pannello', key: 'navigazione-routing', focus: 'pannello/: navigazione e tasto indietro, route che non tornano, deep-link rotti, stato URL non sincronizzato' },
  { organo: 'pannello', key: 'stato-persistenza', focus: 'pannello/: stato perso cambiando chat o ricaricando, form che si svuotano, bozze perse, localStorage incoerente' },
  { organo: 'pannello', key: 'freschezza-dati', focus: 'pannello/: liste stale, dati che non si aggiornano dopo una mutazione, usePanelSync/emitSync mancanti su caselle che mostrano dato condiviso (lezione L-196: già successo)' },
  { organo: 'pannello', key: 'stati-async', focus: 'pannello/: caricamenti senza indicatore, race condition, doppio invio, richieste non annullate, useEffect senza cleanup' },
  { organo: 'pannello', key: 'robustezza-errori', focus: 'pannello/: errori non gestiti, promise senza catch, crash su dato mancante, error boundary assenti, messaggi di errore che non dicono cosa fare' },
  { organo: 'pannello', key: 'accessibilita-mobile', focus: 'pannello/: mobile e accessibilità, tap target, overflow, contrasto, tastiera, screen reader, header che si taglia (lezione L-319: già successo)' },
  { organo: 'pannello', key: 'performance-render', focus: 'pannello/: render inutili, liste non virtualizzate, bundle pesante, query in loop, immagini non ottimizzate' },
  { organo: 'pannello', key: 'coerenza-azioni', focus: 'pannello/: le card di approvazione mostrano davvero cosa cambia? azioni senza «Cosa cambia»/«Se va bene», testi generici per-reparto, titoli con sigle/path che Nicola non deve vedere' },
  { organo: 'pannello', key: 'build-tipi', focus: 'pannello/: il progetto compila? typecheck, lint, dipendenze non usate o mancanti, versioni incoerenti nel package.json' },

  // ── ORGANO 3: I SENIOR ──
  { organo: 'senior', key: 'registro-torna', focus: '.claude/agents/: il conteggio torna con CLAUDE.md e agent-registry-check.mjs? agenti orfani, file senza frontmatter valido, nomi che non combaciano' },
  { organo: 'senior', key: 'doppioni-buchi', focus: '.claude/agents/: due senior che rivendicano lo stesso mandato senza deferral (→ …), e mandati che non sono di nessuno. Trova i buchi partendo dalle richieste vere di Nicola' },
  { organo: 'senior', key: 'porta-ingresso', focus: '.claude/agents/: le description si accendono quando serve? troppo vaghe, troppo strette, keyword che collidono tra agenti, description che non contengono i termini che Nicola userebbe davvero' },
  { organo: 'senior', key: 'qualita-mansionario', focus: '.claude/agents/: il mansionario dice COME si lavora o solo COSA si sa? cerca i file che sono enciclopedie invece di procedure, quelli senza output atteso, senza colore 🟢🟡🔴, senza dove scrivere' },
  { organo: 'senior', key: 'chi-dorme', focus: 'quali senior non sono MAI stati richiamati? incrocia .claude/agents/ con le tracce reali in memoria-squadra/, consegne/, DECISIONI.md. Un senior mai usato in 2 mesi è un costo senza ritorno' },
  { organo: 'senior', key: 'loop-chiuso', focus: 'i quaderni memoria-squadra/ hanno righe ESITO (chiusura-loop.mjs)? quanti reparti sono fermi/decorativi? la calibrazione atteso→reale esiste davvero?' },

  // ── ORGANO 4: IL WORKER E IL VPS ──
  { organo: 'worker', key: 'servizio-vivo', focus: 'cervello/: i servizi e timer systemd dichiarati esistono nei file di deploy? confronta ciò che il codice assume con ciò che è configurato. DICHIARA che dal cloud il VPS non si vede' },
  { organo: 'worker', key: 'coda-scorre', focus: 'la coda dei lavori: claim atomico o race? due worker possono prendere lo stesso lavoro? leggi il codice del claim e cerca la finestra di corsa' },
  { organo: 'worker', key: 'orfani', focus: 'lavori orfani: un lavoro iniziato e mai chiuso torna indietro da solo? esiste un timeout/reaper? cosa succede se il processo muore a metà' },
  { organo: 'worker', key: 'lock-doppio-giro', focus: 'il lock contro il doppio giro: è davvero esclusivo? lock file stale dopo un crash, PID riusati, lock senza scadenza' },
  { organo: 'worker', key: 'allineamento-git', focus: 'dove si perde il lavoro: rebase/force-push, branch divergenti, commit su ramo sbagliato, il gate di pubblicazione che blocca tutto per un conflitto inesistente (lezione L-528: già successo)' },
  { organo: 'worker', key: 'kill-switch', focus: 'il kill-switch della pausa è fail-closed? se il file di pausa è illeggibile o il check fallisce, la macchina si ferma o continua? Il default sbagliato qui è un 🔴 che parte da solo' },
  { organo: 'worker', key: 'motore-ai', focus: 'cervello/motore-ai.sh: quota esaurita, credenziali scadute, timeout: come si comporta? un errore del motore diventa un «fatto» silenzioso? retry senza backoff?' },
  { organo: 'worker', key: 'timer-cadenze', focus: 'i timer fanno quello che dicono? confronta i cron/timer dichiarati con le cadenze in ritmo.md e con le tracce reali. La visita dice: nessuna traccia da 12 ore. Trova il perché nel codice' },
  { organo: 'worker', key: 'corpo-risorse', focus: 'disco, memoria, processi zombie: il codice pulisce ciò che scrive? file temporanei, log che crescono senza rotazione, cartelle di consegne che non vengono mai potate' },
  { organo: 'worker', key: 'ponte-claude', focus: 'il ponte verso Claude: collega-claude.sh, credenziali, sessioni. Cosa succede se il ponte cade a metà lavoro? il lavoro si perde o si ripete?' },
  { organo: 'worker', key: 'script-shell', focus: 'cervello/*.sh (10 file): set -euo pipefail mancante, variabili non quotate, exit code ignorati, errori buttati in /dev/null che diventano verdetti, race su file condivisi' },

  // ── ORGANO 5: LA REPO GITHUB (buco dichiarato: non lo copriva nessuno) ──
  { organo: 'github', key: 'stato-pr-branch', focus: 'stato del repo su GitHub: branch abbandonati, PR aperte da troppo, rami divergenti da main, commit non pushati. Usa git e i tool GitHub (mcp__github__*) in sola lettura' },
  { organo: 'github', key: 'ci-workflow', focus: '.github/workflows/: i 4 workflow sono corretti? trigger che non scattano quando dovrebbero, path filter troppo stretti, job senza timeout, secret usati male, permissions troppo larghe, azioni non pinnate a un SHA' },
  { organo: 'github', key: 'segreti-esposti', focus: 'segreti nella storia git e nei file: chiavi API, token, .env committati, credenziali in chiaro nei JSON del vault o negli script. Cerca anche nella STORIA, non solo nei file attuali' },
  { organo: 'github', key: 'igiene-repo', focus: 'igiene: .gitignore incompleto, file enormi committati, artefatti generati tracciati, cartelle che crescono senza limite (consegne/, auto-coscienza/), storia con commit che riscrivono la memoria' },
  { organo: 'github', key: 'hook-automazioni', focus: 'gli hook locali (.claude/settings.json, hook di stop/prompt, cervello/installa-hooks.sh): un hook che fallisce blocca il lavoro? hook che scrivono mentre il comando è di sola lettura (AR-568 dice che è già successo)' },

  // ── ORGANO 6: IL MIO CODICE (buco dichiarato: 185 .mjs senza audit severo) ──
  { organo: 'codice', key: 'guardiani-mjs', focus: 'cervello/*.mjs, i guardiani (cancello-lotto, coerenza-fatti, gate-veri, allocazione-check, tasso-chiusura, si-capisce, salute): possono dare un verdetto senza aver misurato? un guardiano che passa quando il dato manca è peggio di nessun guardiano' },
  { organo: 'codice', key: 'scrittura-memoria', focus: 'gli script che SCRIVONO in memoria: scrivono in modo atomico? due processi insieme corrompono il JSON? c\'è un backup prima di sovrascrivere? un JSON troncato a metà uccide la memoria' },
  { organo: 'codice', key: 'gestione-errori-mjs', focus: 'cervello/*.mjs: catch vuoti, errori inghiottiti, exit 0 su fallimento, promise non attese, JSON.parse senza try, accessi a campi di oggetti che possono essere undefined' },
  { organo: 'codice', key: 'duplicazione-logica', focus: 'la stessa logica ripetuta in più script (lettura del cantiere, parsing date, path del vault): quando cambia il contratto, quanti file vanno toccati? trova le copie che divergeranno' },
]

const SCHEMA_DIFETTI = {
  type: 'object',
  properties: {
    difetti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string', description: 'Come lo diresti a voce a Nicola. Niente sigle, niente path nel titolo.' },
          dove: { type: 'string', description: 'file:riga o componente' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string' },
          impatto: { type: 'string', description: 'cosa costa davvero, in concreto' },
          causa_radice: { type: 'string', description: 'i 5 perché fino alla causa di sistema, non il sintomo' },
          prova: { type: 'string', description: 'ASTICELLA: per bloccante/grave DEVE essere un comando che diventa rosso se il difetto c\'è (es. "node x.mjs && test $? -ne 0"), oppure la parola umano: se serve un occhio umano. MAI un grep di una parola in un file.' },
          prova_tipo: { type: 'string', enum: ['comando', 'umano', 'grep'] },
          fix: { type: 'string', description: 'il fix del PROCESSO, non del sintomo. Resta da firmare.' },
          impatto_crescita: { type: 'string', enum: ['alto', 'medio', 'basso'] },
        },
        required: ['titolo', 'dove', 'severita', 'descrizione', 'causa_radice', 'prova', 'prova_tipo', 'impatto_crescita'],
      },
    },
    zone_non_viste: { type: 'array', items: { type: 'string' }, description: 'cosa NON hai potuto guardare da qui, e perché' },
  },
  required: ['difetti', 'zone_non_viste'],
}

const SCHEMA_VERDETTO = {
  type: 'object',
  properties: {
    reale: { type: 'boolean' },
    perche: { type: 'string' },
    severita_corretta: { type: 'string', enum: ['bloccante', 'grave', 'minore', 'non-e-un-difetto'] },
    prova_regge: { type: 'boolean', description: 'la prova proposta diventa davvero rossa se il difetto c\'è?' },
  },
  required: ['reale', 'perche', 'prova_regge'],
}

const REGOLE = `
REGOLE NON NEGOZIABILI:
- SOLA LETTURA. Non modificare NIENTE. Non eseguire comandi che scrivono.
- Puoi ESEGUIRE comandi di lettura per PROVARE ciò che affermi (node ... --help, git log, test).
- L'ASTICELLA: un difetto "bloccante" o "grave" nasce SOLO con una prova che gira — un comando
  che diventa ROSSO se il difetto c'è. Una parola cercata in un file NON è una prova: una ricerca
  di parole non può fallire nel modo in cui fallisce la realtà. Se non sai scrivere il comando,
  o declassi a "minore", o dichiari prova_tipo:"umano" spiegando cosa deve guardare un occhio umano.
- NIENTE INVENTATO. Ogni numero ha una fonte che hai verificato tu in questa sessione.
- Se una cosa non l'hai potuta vedere, va in zone_non_viste. Non è un verde.
- Il titolo si legge a voce: verbo + cosa vera. Niente sigle (AR-xxx), niente path nel titolo.
- Il repo è ${REPO}. Il worker vive su un VPS che da qui NON si vede: dichiaralo invece di fingere.
- NON ripetere difetti già nel cantiere: leggi MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json
  (563 voci) e scarta ciò che c'è già. Cerca il NUOVO.
`

function promptFinder(d, giro, giaTrovati) {
  const angolo = {
    1: 'Primo giro: AMPIEZZA. Copri tutta la dimensione, sistematicamente, dal file più grande al più piccolo.',
    2: `Secondo giro: ANGOLO AVVERSARIO. Un collega ha già guardato questa stessa dimensione e ha trovato quello che trovi qui sotto. Il tuo compito NON è ripeterlo: è trovare ciò che gli è SFUGGITO. Chiediti dove ha guardato di sicuro e vai dove NON ha guardato: i casi limite, i percorsi di errore, ciò che succede quando un dato manca, i file piccoli e ignorati, le assunzioni implicite.\n\nGIÀ TROVATO NEL GIRO 1 (non ripeterli):\n${giaTrovati || '(niente)'}`,
    3: `Terzo giro: RESIDUO. Due colleghi hanno già setacciato questa dimensione. Quello che resta è nascosto per un motivo. Vai a caccia di: interazioni fra due pezzi che presi da soli sembrano giusti, difetti che si vedono solo nel tempo (crescita, accumulo, drift), cose corrette OGGI che si romperanno al prossimo cambio, e ciò che nessuno controlla perché tutti assumono che lo controlli qualcun altro.\n\nGIÀ TROVATO NEI GIRI 1-2 (non ripeterli):\n${giaTrovati || '(niente)'}`,
  }[giro]

  return `Sei un revisore senior spietato. Radiografia dell'organo "${d.organo}", dimensione "${d.key}".

FOCUS: ${d.focus}

${angolo}

${REGOLE}

Lavora con Read/Grep/Glob/Bash(sola lettura) dentro ${REPO}. Scava davvero: apri i file, leggi il codice,
esegui i comandi per provare. Non fermarti al primo difetto: cerca finché la dimensione è esaurita.`
}

function promptVerifica(f) {
  return `Sei un verificatore avversariale. Il tuo lavoro è REFUTARE questo presunto difetto, non confermarlo.
Parti dal presupposto che sia un falso allarme e prova a dimostrarlo.

DIFETTO: ${f.titolo}
DOVE: ${f.dove}
DESCRIZIONE: ${f.descrizione}
SEVERITÀ DICHIARATA: ${f.severita}
PROVA PROPOSTA (${f.prova_tipo}): ${f.prova}

Vai a guardare il codice vero in ${REPO}. Esegui la prova proposta se è un comando.
Domande: il difetto esiste davvero? la severità è gonfiata? la prova diventa DAVVERO rossa se il difetto
c'è, o è una parola cercata in un file travestita da prova? esiste già una protezione che lo copre?
è un duplicato di qualcosa già nel cantiere?

Sii duro: nel dubbio, reale=false. Un falso allarme che passa costa più di un difetto perso.`
}

// ─────────────────────────────────────────────────────────────────────────────
// ESECUZIONE — 3 giri, ognuno con verifica avversariale immediata (pipeline)
// ─────────────────────────────────────────────────────────────────────────────

function riassumi(difetti) {
  return difetti.map(f => `- [${f.severita}] ${f.titolo} (${f.dove})`).join('\n')
}

async function giro(n, titoloFase, contestoPerDim) {
  const risultati = await pipeline(
    DIM,
    (d, _orig, i) => agent(promptFinder(d, n, contestoPerDim[d.key]), {
      label: `g${n}:${d.organo}/${d.key}`,
      phase: titoloFase,
      schema: SCHEMA_DIFETTI,
    }),
    (res, d) => {
      if (!res || !res.difetti || !res.difetti.length) return { dim: d, difetti: [], zone: res?.zone_non_viste || [] }
      // verifica avversariale SOLO su bloccante/grave (i minori passano con nota)
      const daVerificare = res.difetti.filter(f => f.severita !== 'minore')
      const minori = res.difetti.filter(f => f.severita === 'minore').map(f => ({ ...f, organo: d.organo, dim: d.key, verificato: false }))
      if (!daVerificare.length) return { dim: d, difetti: minori, zone: res.zone_non_viste || [] }
      return parallel(daVerificare.map(f => () =>
        agent(promptVerifica(f), {
          label: `v${n}:${String(f.titolo).slice(0, 34)}`,
          phase: `Verifica giro ${n}`,
          schema: SCHEMA_VERDETTO,
          effort: 'high',
        }).then(v => ({ ...f, organo: d.organo, dim: d.key, verdetto: v, verificato: true }))
      )).then(vs => ({
        dim: d,
        difetti: [...vs.filter(Boolean).filter(x => x.verdetto?.reale), ...minori],
        scartati: vs.filter(Boolean).filter(x => !x.verdetto?.reale).length,
        zone: res.zone_non_viste || [],
      }))
    }
  )
  return risultati.filter(Boolean)
}

log('Giro 1 — ampiezza su 48 dimensioni, 6 organi')
phase('Giro 1 — ampiezza')
const r1 = await giro(1, 'Giro 1 — ampiezza', {})

const ctx1 = {}
for (const r of r1) ctx1[r.dim.key] = riassumi(r.difetti)
const tot1 = r1.reduce((a, r) => a + r.difetti.length, 0)
log(`Giro 1: ${tot1} difetti confermati. Parte il giro 2 (angolo avversario).`)

phase('Giro 2 — angolo avversario')
const r2 = await giro(2, 'Giro 2 — angolo avversario', ctx1)

const ctx2 = {}
for (const r of r1) ctx2[r.dim.key] = riassumi(r.difetti)
for (const r of r2) ctx2[r.dim.key] = (ctx2[r.dim.key] || '') + '\n' + riassumi(r.difetti)
const tot2 = r2.reduce((a, r) => a + r.difetti.length, 0)
log(`Giro 2: ${tot2} difetti NUOVI. Parte il giro 3 (residuo).`)

phase('Giro 3 — residuo')
const r3 = await giro(3, 'Giro 3 — residuo', ctx2)
const tot3 = r3.reduce((a, r) => a + r.difetti.length, 0)
log(`Giro 3: ${tot3} difetti NUOVI.`)

// ── Critico di completezza: uno per organo, chiede "cosa manca ancora?" ──
phase('Critico di completezza')
const ORGANI = ['macchina', 'pannello', 'senior', 'worker', 'github', 'codice']
const tutti = [...r1, ...r2, ...r3]
const critici = await parallel(ORGANI.map(o => () => {
  const suoi = tutti.filter(r => r.dim.organo === o).flatMap(r => r.difetti)
  const zone = [...new Set(tutti.filter(r => r.dim.organo === o).flatMap(r => r.zone || []))]
  return agent(`Sei il critico di completezza per l'organo "${o}" della macchina MyCity (repo ${REPO}).

Tre giri di radiografia hanno prodotto questi ${suoi.length} difetti:
${riassumi(suoi) || '(nessuno)'}

Zone dichiarate NON viste:
${zone.map(z => '- ' + z).join('\n') || '(nessuna)'}

La tua domanda è una sola: COSA MANCA ANCORA? Cerca:
- una modalità di analisi che nessuno ha usato su questo organo
- un file, una cartella, un contratto che nessuno ha aperto
- un'affermazione dei tre giri che nessuno ha verificato
- un difetto che esiste solo nell'interazione fra questo organo e un altro

${REGOLE}

Se trovi qualcosa, cercalo e provalo davvero adesso. Se davvero non manca niente, dillo con onestà
e spiega su che base lo affermi (cosa hai controllato per concludere che è esaurito).`, {
    label: `critico:${o}`,
    phase: 'Critico di completezza',
    schema: SCHEMA_DIFETTI,
    effort: 'high',
  })
}))

phase('Sintesi')
const daCritici = critici.filter(Boolean).flatMap((c, i) =>
  (c.difetti || []).map(f => ({ ...f, organo: ORGANI[i], dim: 'completezza', verificato: false }))
)

const tuttiDifetti = [...tutti.flatMap(r => r.difetti), ...daCritici]
const zoneNonViste = [...new Set([...tutti.flatMap(r => r.zone || []), ...critici.filter(Boolean).flatMap(c => c.zone_non_viste || [])])]

const perOrgano = {}
for (const f of tuttiDifetti) {
  perOrgano[f.organo] = perOrgano[f.organo] || { bloccante: 0, grave: 0, minore: 0 }
  perOrgano[f.organo][f.severita] = (perOrgano[f.organo][f.severita] || 0) + 1
}

const scartatiTot = tutti.reduce((a, r) => a + (r.scartati || 0), 0)

log(`TOTALE: ${tuttiDifetti.length} difetti confermati · ${scartatiTot} falsi allarmi scartati dalla verifica`)

return {
  totale: tuttiDifetti.length,
  per_giro: { giro1: tot1, giro2: tot2, giro3: tot3, critici: daCritici.length },
  per_organo: perOrgano,
  falsi_allarmi_scartati: scartatiTot,
  zone_non_viste: zoneNonViste,
  difetti: tuttiDifetti,
}
