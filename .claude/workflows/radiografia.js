// 🩻 RADIOGRAFIA DEL MARKETPLACE — 13 dimensioni in sola lettura, ogni problema verificato.
//
// AR-780 — PERCHE' QUESTO FILE NON HA IMPORT.
//
// Fino al 23/8/2026 apriva con tre `import` e metteva `meta` in quarta posizione. Il motore dei
// workflow pretende che `export const meta` sia la PRIMA istruzione e non accetta nessun import,
// ne' statico ne' dinamico: rifiutava lo script prima di eseguirne una riga. Tutti e sei i workflow
// erano cosi', da due mesi, mentre CLAUDE.md li nomina per nome nei comandi rapidi.
//
// I mansionari dei senior NON si incollano piu' nel prompt: il motore sa caricarli da se' con
// `agentType`, che risolve dallo stesso registro del comando di delega. Il senior riceve il suo
// mansionario come identita', non come testo dentro un messaggio — ed e' anche piu' corretto.
// (Incollarli avrebbe voluto dire 21 KB per senior dentro questo file.)

export const meta = {
  name: 'radiografia',
  description: 'Radiografia del marketplace MyCity: analisi profonda a 13 dimensioni (sola lettura) con ogni problema verificato',
  phases: [
    { title: 'Radiografia', detail: 'un revisore esperto per dimensione (sola lettura)' },
    { title: 'Verifica', detail: 'verifica avversariale: tieni solo i problemi reali' },
  ],
}

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
          file: { type: 'string', description: 'percorso file (e riga se possibile)' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string' },
          impatto: { type: 'string', description: 'effetto su utente/business' },
          fix: { type: 'string', description: 'correzione consigliata' },
        },
        required: ['titolo', 'severita', 'descrizione', 'fix'],
      },
    },
  },
  required: ['dimensione', 'findings'],
}

// Dove sta il codice del marketplace non lo calcola piu' questo script: qui non si puo' leggere ne'
// il disco ne' l'ambiente. Lo trova l'agente, che gli strumenti ce li ha — e se non lo trova DEVE
// dirlo e fermarsi invece di dedurre. Prima si diceva ai senior di andare a leggere il vecchio
// percorso Windows del PC di Nicola: su qualunque altra macchina e' una cartella che non esiste, e
// l'agente ci lavorava sopra al buio.
const DOVE_E_IL_CODICE = `Il codice del marketplace sta in \`$MARKETPLACE_REPO\` se quella variabile d'ambiente c'e', altrimenti nella copia locale \`marketplace/\` dentro il repo dell'AD.
Controllalo PRIMA di cominciare (\`ls\`). Se non c'e' ne' l'una ne' l'altra il codice NON e' collegato: dillo, restituisci lista vuota e FERMATI — non dedurre niente da un percorso che non esiste. Per collegarlo: \`node cervello/collega-marketplace.mjs\`.`

const DIMS = [
  { key: 'architettura', senior: 'tech', focus: 'architettura: struttura del codice, accoppiamenti, duplicazioni, coerenza, dipendenze fragili, dead code' },
  { key: 'sicurezza-auth', senior: 'security', focus: 'sicurezza e autorizzazione: auth, withAdminAuth/withSellerAuth, IDOR/accessi non controllati, secret esposti, validazione input, XSS/CSRF/SSRF' },
  { key: 'rls-database', senior: 'backend-dev', focus: 'RLS e database (usa anche il Supabase MCP in sola lettura): policy che isolano ogni venditore/cliente, tabelle senza RLS, migrazioni incoerenti, integrità dati' },
  { key: 'pagamenti-stripe', senior: 'marketplace-payments', focus: 'pagamenti/Stripe Connect: charges & transfers, firma webhook, payout, COD, refund, doppi addebiti, race condition sui soldi, application_fee' },
  { key: 'privacy-legale', senior: 'legale-privacy', focus: 'privacy/GDPR e legale IT-EU: dati personali, consensi, cookie, conservazione/cancellazione, informative, base giuridica' },
  { key: 'performance', senior: 'platform-infra', focus: 'performance: query N+1, indici mancanti, payload/over-fetch, caching, bundle pesanti, Core Web Vitals, immagini' },
  { key: 'frontend-ux', senior: 'frontend-dev', focus: 'frontend/UX: bug UI, stati di errore/loading mancanti, mobile/PWA, form, link rotti, flussi che si bloccano' },
  { key: 'accessibilita', senior: 'accessibility', focus: 'accessibilità (a11y): alt text, contrasto, navigazione da tastiera, ruoli/aria, focus' },
  { key: 'qa-flussi', senior: 'qa', focus: 'QA e flussi critici: casi limite non gestiti nei flussi chiave (onboarding venditore, catalogo, carrello, checkout carta e COD, payout, stato ordine), copertura test, regressioni' },
  { key: 'api-backend', senior: 'backend-dev', focus: 'API/backend: route handler, validazione input (zod), gestione errori, rate limiting, idempotenza, status code, timeout' },
  { key: 'ai-endpoints', senior: 'ml-engineer', focus: 'endpoint AI (app/api/ai/*): prompt injection, output non validato, rate limit/costi, esposizione chiavi, abuso' },
  { key: 'dati-analytics', senior: 'data-engineer', focus: 'dati/analytics: eventi PostHog mancanti o errati, tracking incoerente, metriche non affidabili' },
  { key: 'deploy-sre', senior: 'devops-sre', focus: 'deploy/SRE: render.yaml e CI, health check, variabili d\'ambiente mancanti/critiche, logging, monitoraggio, rollback, gestione errori in produzione' },
]

phase('Radiografia')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Radiografia del marketplace MyCity, dimensione "${d.key}": ${d.focus}

${DOVE_E_IL_CODICE}

Analizza in SOLA LETTURA (Read/Grep/Glob; per RLS e dati usa il Supabase MCP in sola lettura).
⛔ NON modificare nulla, nessun git, nessun file.
Cerca con accuratezza MILLIMETRICA tutti i problemi REALI della tua dimensione: bug, errori, rischi, anti-pattern, casi limite non gestiti.
Per ognuno: titolo · file (e riga se possibile) · severità (bloccante/grave/minore) · descrizione · impatto su utente/business · fix consigliato.
Sii esaustivo ma concreto: SOLO problemi che vedi davvero nel codice, niente teoria generica. Se non trovi nulla di reale, restituisci lista vuota.`,
    { label: `rivedi:${d.key}`, phase: 'Radiografia', schema: FINDINGS, agentType: d.senior }
  ),
  // Chi trova non conferma: la verifica la fa il collaudo, col suo mansionario.
  (rev, d) => agent(
    `Verifica avversariale dei problemi che un collega dichiara di aver trovato nel marketplace, dimensione "${d.key}".

${DOVE_E_IL_CODICE}

Ecco i problemi segnalati:
${JSON.stringify(rev?.findings || [], null, 2)}

Per CIASCUNO, controllalo nel codice reale (sola lettura) e TIENI SOLO quelli VERI: scarta i falsi positivi e ciò che non sei riuscito a confermare. Correggi la severità se sbagliata.
Restituisci {dimensione:"${d.key}", findings:[...solo quelli confermati...]}. In caso di dubbio, scarta.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS, agentType: 'qa' }
  )
)

return reviewed.filter(Boolean)
