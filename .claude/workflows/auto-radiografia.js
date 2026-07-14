export const meta = {
  name: 'auto-radiografia',
  description: 'Radiografia della MACCHINA stessa (il cervello dell\'AD MyCity): 12 dimensioni in sola lettura, ogni difetto verificato avversarialmente, + pre-mortem e benchmark vs i migliori',
  phases: [
    { title: 'Auto-radiografia', detail: 'un revisore per dimensione: senior del reparto, sola lettura' },
    { title: 'Verifica', detail: 'verifica avversariale: tieni solo i difetti reali' },
    { title: 'Pre-mortem', detail: 'simula i disastri peggiori e proponi le difese' },
    { title: 'Benchmark', detail: 'confronto coi migliori (locali + mondo) per ogni mestiere' },
  ],
}

// Schema dei difetti trovati su SÉ STESSA. Esteso vs radiografia.js: causa_radice (5 perché),
// impatto_crescita (per prioritizzare il cantiere), genera (collega il finding al volano).
const FINDINGS = {
  type: 'object',
  properties: {
    dimensione: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titolo: { type: 'string' },
          dove: { type: 'string', description: 'file:riga o componente della macchina' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string' },
          impatto: { type: 'string', description: 'effetto sulla macchina/azienda' },
          causa_radice: { type: 'string', description: 'la causa di sistema (5 perché), non il sintomo' },
          fix: { type: 'string', description: 'fix del PROCESSO consigliato (resta 🟡 da firmare)' },
          impatto_crescita: { type: 'string', enum: ['alto', 'medio', 'basso'], description: 'quanto frena ordini/negozi/margine' },
          genera: { type: 'string', enum: ['lezione', 'auto-riscrittura', 'sentinella', 'nuovo-pezzo', 'domanda-nicola', 'solo-report'] },
          // AR-023: PROVA OGGETTIVA DI CHIUSURA — obbligatoria. auto-fix.mjs la rilegge a ogni giro e chiude
          // il difetto da solo quando il fix è nel codice → il Pannello non lo mostra più "in-corso". Se il
          // fix è provabile dal codice: {file, pattern (regex), presente:true}. Se dipende da Nicola (chiavi,
          // firma, decisione) e NON è provabile da un file: {tipo:"umano"} (resta aperto finché chiuso a mano).
          verifica: {
            type: 'object',
            description: 'prova machine-checkable di quando il difetto è risolto (file+pattern), oppure {tipo:"umano"}',
            properties: {
              file: { type: 'string', description: 'path relativo alla root del repo che conterrà il fix' },
              pattern: { type: 'string', description: 'regex la cui presenza (o assenza) prova il fix' },
              presente: { type: 'boolean', description: 'true = risolto quando il pattern è PRESENTE; false = quando è ASSENTE' },
              tipo: { type: 'string', enum: ['umano'], description: 'usa "umano" SOLO se il fix non è provabile da un file (chiavi/firma/decisione di Nicola)' },
            },
          },
        },
        required: ['titolo', 'severita', 'descrizione', 'causa_radice', 'fix', 'impatto_crescita', 'genera', 'verifica'],
      },
    },
  },
  required: ['dimensione', 'findings'],
}

// La macchina è QUESTO repo (il cervello dell'AD), non il marketplace. Sola lettura.
const REPO = '/home/user/ad-mycity'

const DIMS = [
  { key: 'coerenza-agenti', focus: 'coerenza dei 42 agenti in .claude/agents/: CONTA i file reali; buchi di copertura (capacità mancanti), doppioni/sovrapposizioni di mandato, description vaghe che sballano il routing, agenti orfani mai richiamati da CLAUDE.md/COMANDI.md, responsabilità in conflitto' },
  { key: 'vettori-installati', focus: 'i vettori di MyCity-Vault/07-Agenti/ (VETTORI-MULTINAZIONALE, STAMPO-SENIOR-PRO, RUBRICA-LIVELLI) sono DAVVERO nei prompt degli agenti (loop interno, metro/rubrica, trappole, carburante) o solo descritti nei doc? quali senior sono a metà' },
  { key: 'salute-sensori-dati', focus: 'sensori e dati: Supabase/Stripe/PostHog/Resend raggiungibili e usati? cervello/radar-fonti.json con fonti vive o morte/stale? quali sensori ciechi e da quanto? verifica davvero, non fidarti delle dichiarazioni' },
  { key: 'integrita-memoria', focus: 'integrità del vault (MyCity-Vault/90-Memoria-AI e memoria-squadra): ridondanze, contraddizioni, file stale/morti, JSON divergenti dai contratti di cervello/auto-coscienza.md, KPI divergenti vs GLOSSARIO-KPI (una sola verità)' },
  { key: 'chiusura-volano', focus: 'il loop di auto-coscienza chiude davvero? tasso_applicazione delle lezioni in apprendimento.json > 0; esperimenti di auto-miglioramento misurati o aperti all\'infinito; proposte mai validate; calibrazione aggiornata' },
  { key: 'cadenza-esecuzione', focus: 'il giro gira ogni 2h (battito, ultimo-briefing.json fresco)? ritmo.md eseguito? worker.sh/giro.sh/autopilot.mjs coerenti e schedulabili? i passi del giro (auto-analisi/apprendimento/sonda) vengono saltati in silenzio?' },
  { key: 'calibrazione-onesta', focus: 'previsto-vs-reale in calibrazione.json: i voti di fiducia/autonomia sono giustificati o gonfiati? over-confidence = voti alti senza punti ciechi dichiarati' },
  { key: 'copertura-cieca', focus: 'META: cosa la macchina NON analizza e dovrebbe; aree dell\'azienda senza sensore/agente/sentinella/KPI; rischi noti senza owner; buchi della radiografia stessa. Dove manca un pezzo, segnalalo come genera:nuovo-pezzo (proposta di crearlo)' },
  { key: 'guardrail-semaforo', focus: 'guardrail 🟢🟡🔴: 🔴 (soldi, messaggi a clienti reali, deploy, prezzi) che sfuggono senza firma o travestiti da 🟢; autopilot.mjs che tocca non-🟢; budget STOP reale; ONESTA-RULES applicate' },
  { key: 'allineamento-northstar', focus: 'le mosse/azioni recenti spingono la North Star (ordini/negozi/margine) o si disperdono in attività a basso ritorno? coerenza cross-silo (AD-VETTORI-SISTEMA): vittorie di reparto che bruciano margine o intasano operations' },
  { key: 'efficienza-costo', focus: 'spreco di token/Max: ricontrolli a cadenza sbagliata, rilanci inutili, prompt enormi, modello premium su compiti banali (vedi cervello/banco-ai.md); valore prodotto vs costo' },
  { key: 'rischio-sicurezza-se', focus: 'la macchina può farsi male? segreti esposti in cervello/*.sh|*.mjs o nel vault; permessi .claude/settings.json troppo larghi; un giro che può corrompere la memoria (reset/force-push); loop auto-amplificanti; single point of failure del cervello' },
]

phase('Auto-radiografia')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Sei il senior più esperto del MyCity OS per la dimensione "${d.focus}".
Analizza in SOLA LETTURA la MACCHINA stessa (il cervello dell'AD) nel repo \`${REPO}\` (usa Read/Grep/Glob).
⛔ NON modificare nulla, nessun git, nessun file: è un audit di sé, in sola lettura.
Cerca con accuratezza MILLIMETRICA i difetti STRUTTURALI REALI della tua dimensione: incoerenze, buchi, sprechi, rischi, processi che non chiudono.
Per ognuno: titolo · dove (file:riga/componente) · severità (bloccante/grave/minore) · descrizione · impatto sulla macchina/azienda · CAUSA RADICE (i "5 perché" fino alla causa di sistema, non il sintomo) · fix del PROCESSO (resta 🟡 da firmare) · impatto_crescita (alto/medio/basso = quanto frena ordini/negozi/margine) · genera (lezione/auto-riscrittura/sentinella/nuovo-pezzo/domanda-nicola/solo-report).
Dove ti accorgi che MANCA un pezzo (un sensore, un agente, una capacità, una sentinella), segnalalo con genera:nuovo-pezzo.
Sii esaustiva ma concreta: SOLO difetti che vedi davvero nei file, niente teoria. Se non trovi nulla di reale, lista vuota.`,
    { label: `rivedi:${d.key}`, phase: 'Auto-radiografia', schema: FINDINGS }
  ),
  (rev, d) => agent(
    `Sei un VERIFICATORE avversariale e scettico della dimensione "${d.key}". Ecco i difetti segnalati su SÉ STESSA:
${JSON.stringify(rev?.findings || [], null, 2)}
Per CIASCUNO, controllalo nei file reali in \`${REPO}\` (sola lettura) e TIENI SOLO quelli VERI: scarta i falsi positivi e ciò che non riesci a confermare. Correggi la severità e la causa_radice se sbagliate. In caso di dubbio, scarta.
Restituisci {dimensione:"${d.key}", findings:[...solo quelli confermati...]}.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS }
  )
)

// Pre-mortem: simula i disastri peggiori che la macchina potrebbe causare, e le difese da mettere PRIMA.
phase('Pre-mortem')
const preMortem = await agent(
  `Sei il capo del rischio del MyCity OS. Fai un PRE-MORTEM della macchina (repo \`${REPO}\`, sola lettura).
Immagina che tra una settimana sia successo un disastro causato dall'AD digitale: messaggi sbagliati a clienti reali, soldi mossi per errore, memoria corrotta, un'azione 🔴 partita senza firma, un loop che brucia budget.
Elenca i 3-6 disastri più PLAUSIBILI dato com'è fatta oggi la macchina, e per ognuno: probabilità (alta/media/bassa), come potrebbe accadere (dove nel sistema), e la DIFESA da mettere PRIMA (🟡, da firmare Nicola).`,
  { label: 'pre-mortem', phase: 'Pre-mortem', schema: {
    type: 'object',
    properties: { scenari: { type: 'array', items: { type: 'object', properties: {
      disastro: { type: 'string' }, probabilita: { type: 'string', enum: ['alta', 'media', 'bassa'] },
      come: { type: 'string' }, difesa_proposta: { type: 'string' } }, required: ['disastro', 'probabilita', 'difesa_proposta'] } } },
    required: ['scenari'] } }
)

// Benchmark: come operano i MIGLIORI (locali + mondo) per ogni mestiere; il divario e come colmarlo.
phase('Benchmark')
const benchmark = await agent(
  `Sei lo stratega del MyCity OS. Confronta come OPERA la macchina con i MIGLIORI, per i mestieri chiave dell'azienda (contenuti, prezzi, onboarding negozi, funnel/CRO, email/CRM, SEO, PR, consegne, cura clienti, e il modo stesso di gestire un'azienda in autonomia con agenti AI).
Due livelli per ogni ambito: (a) i concorrenti LOCALI di Piacenza (Glovo, GDO con consegna, marketplace locali) e (b) il MEGLIO DEL MONDO per quel mestiere. Usa WebSearch/WebFetch dove serve; leggi anche MyCity-Vault/90-Memoria-AI/auto-coscienza/watchlist-riferimenti.json se presente.
Per ogni ambito: come fanno i migliori (con 1-2 ESEMPI concreti: link/descrizione), il nostro divario (alto/medio/basso), un OBIETTIVO concreto per colmarlo, e il primo passo. Impara il principio, non copiare alla lettera. Mai sazia: dove siamo già bravi, chiediti "c'è un 10× qui?".`,
  { label: 'benchmark-vs-migliori', phase: 'Benchmark', schema: {
    type: 'object',
    properties: { ambiti: { type: 'array', items: { type: 'object', properties: {
      ambito: { type: 'string' }, come_fanno_i_migliori: { type: 'string' },
      esempi: { type: 'array', items: { type: 'object', properties: { chi: { type: 'string' }, cosa: { type: 'string' }, link: { type: 'string' } } } },
      nostro_divario: { type: 'string', enum: ['alto', 'medio', 'basso'] },
      obiettivo: { type: 'string' }, primo_passo: { type: 'string' } }, required: ['ambito', 'nostro_divario', 'obiettivo'] } } },
    required: ['ambiti'] } }
)

// --- Sintesi: trasforma l'output grezzo nella FORMA del contratto auto-radiografia.json ---
// (così l'AD scrive un file già coerente con ciò che legge il Pannello; mancano solo i campi
//  che vanno timbrati al volo: data/tipo/sonda/salute_marketplace — li aggiunge l'AD nel giro.)
const PESO = { bloccante: 25, grave: 10, minore: 3 }
const dims = reviewed.filter(Boolean)
let totale = 0
const dimensioni = dims.map((d) => {
  const fs = d.findings || []
  const giu = fs.reduce((s, f) => s + (PESO[f.severita] || 0), 0)
  totale += giu
  const stato = fs.some((f) => f.severita === 'bloccante') ? 'critico' : fs.some((f) => f.severita === 'grave') ? 'attenzione' : 'ok'
  return { key: d.dimensione, voto: Math.max(0, 100 - giu), stato, sintesi: '', findings: fs }
})
const tuttiFindings = dimensioni.flatMap((d) => d.findings)
const proposte_nuovi_pezzi = tuttiFindings.filter((f) => f.genera === 'nuovo-pezzo').map((f) => ({ cosa: f.titolo, perche: f.descrizione, colore: '🟡' }))
const domande_per_nicola = tuttiFindings.filter((f) => f.genera === 'domanda-nicola').map((f) => ({ domanda: f.titolo, perche_serve: f.descrizione, se_rispondi: f.fix, gravita: f.severita === 'bloccante' ? 'alta' : 'media' }))
const punti_ciechi = [
  { cosa: 'Verifiche solo-LLM senza reviewer deterministico', perche: 'Alcune dimensioni passano solo dal giudizio del modello, non da un guardiano script' },
  { cosa: 'Repo marketplace (mycity-live) fuori da questa radiografia', perche: 'Audit macchina ≠ audit sito; serve radiografia.js separata' },
  { cosa: 'Copertura KPI dei 120 senior vs OKR-Squadra', perche: 'agent-registry-check segnala drift ma OKR va aggiornato a mano' },
].concat(
  dimensioni.filter((d) => d.stato === 'critico').map((d) => ({
    cosa: `Dimensione ${d.key} in stato critico`,
    perche: 'Richiede radiografia approfondita o fix strutturali non ancora chiusi',
  }))
)

return {
  voto_salute_architettura: Math.max(0, 100 - totale),
  dimensioni,
  punti_ciechi,
  pre_mortem: (preMortem && preMortem.scenari) || [],
  benchmark_vs_migliori: (benchmark && benchmark.ambiti) || [],
  proposte_nuovi_pezzi,
  domande_per_nicola,
  meta: { agenti_totali: null, dimensioni_critiche: dimensioni.filter((d) => d.stato === 'critico').length, bloccanti: tuttiFindings.filter((f) => f.severita === 'bloccante').length },
}
