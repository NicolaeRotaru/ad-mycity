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

// Percorso del codice del marketplace. Su VPS Linux imposta MARKETPLACE_REPO (env); il default Windows
// vale solo sul PC di Nicola. Senza un percorso valido la radiografia del sito non gira.
const REPO = process.env.MARKETPLACE_REPO || 'C:\\Users\\InfinitaPossibilita\\mycity-live'

const DIMS = [
  { key: 'architettura', focus: 'architettura: struttura del codice, accoppiamenti, duplicazioni, coerenza, dipendenze fragili, dead code' },
  { key: 'sicurezza-auth', focus: 'sicurezza e autorizzazione: auth, withAdminAuth/withSellerAuth, IDOR/accessi non controllati, secret esposti, validazione input, XSS/CSRF/SSRF' },
  { key: 'rls-database', focus: 'RLS e database (usa anche il Supabase MCP in sola lettura): policy che isolano ogni venditore/cliente, tabelle senza RLS, migrazioni incoerenti, integrità dati' },
  { key: 'pagamenti-stripe', focus: 'pagamenti/Stripe Connect: charges & transfers, firma webhook, payout, COD, refund, doppi addebiti, race condition sui soldi, application_fee' },
  { key: 'privacy-legale', focus: 'privacy/GDPR e legale IT-EU: dati personali, consensi, cookie, conservazione/cancellazione, informative, base giuridica' },
  { key: 'performance', focus: 'performance: query N+1, indici mancanti, payload/over-fetch, caching, bundle pesanti, Core Web Vitals, immagini' },
  { key: 'frontend-ux', focus: 'frontend/UX: bug UI, stati di errore/loading mancanti, mobile/PWA, form, link rotti, flussi che si bloccano' },
  { key: 'accessibilita', focus: 'accessibilità (a11y): alt text, contrasto, navigazione da tastiera, ruoli/aria, focus' },
  { key: 'qa-flussi', focus: 'QA e flussi critici: casi limite non gestiti nei flussi chiave (onboarding venditore, catalogo, carrello, checkout carta e COD, payout, stato ordine), copertura test, regressioni' },
  { key: 'api-backend', focus: 'API/backend: route handler, validazione input (zod), gestione errori, rate limiting, idempotenza, status code, timeout' },
  { key: 'ai-endpoints', focus: 'endpoint AI (app/api/ai/*): prompt injection, output non validato, rate limit/costi, esposizione chiavi, abuso' },
  { key: 'dati-analytics', focus: 'dati/analytics: eventi PostHog mancanti o errati, tracking incoerente, metriche non affidabili' },
  { key: 'deploy-sre', focus: 'deploy/SRE: render.yaml e CI, health check, variabili d\'ambiente mancanti/critiche, logging, monitoraggio, rollback, gestione errori in produzione' },
]

phase('Radiografia')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Sei un revisore SENIOR esperto di ${d.focus}.
Analizza in SOLA LETTURA il marketplace MyCity nel repo \`${REPO}\` (usa Read/Grep/Glob; per RLS/dati usa il Supabase MCP in sola lettura).
⛔ NON modificare nulla, nessun git, nessun file.
Cerca con accuratezza MILLIMETRICA tutti i problemi REALI della tua dimensione: bug, errori, rischi, anti-pattern, casi limite non gestiti.
Per ognuno: titolo · file (e riga se possibile) · severità (bloccante/grave/minore) · descrizione · impatto su utente/business · fix consigliato.
Sii esaustivo ma concreto: SOLO problemi che vedi davvero nel codice, niente teoria generica. Se non trovi nulla di reale, restituisci lista vuota.`,
    { label: `rivedi:${d.key}`, phase: 'Radiografia', schema: FINDINGS }
  ),
  (rev, d) => agent(
    `Sei un VERIFICATORE avversariale e scettico. Ecco i problemi segnalati per la dimensione "${d.key}":
${JSON.stringify(rev?.findings || [], null, 2)}
Per CIASCUNO, controllalo nel codice reale in \`${REPO}\` (sola lettura) e TIENI SOLO quelli VERI: scarta i falsi positivi e ciò che non sei riuscito a confermare. Correggi la severità se sbagliata.
Restituisci {dimensione:"${d.key}", findings:[...solo quelli confermati...]}. In caso di dubbio, scarta.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS }
  )
)

return reviewed.filter(Boolean)
