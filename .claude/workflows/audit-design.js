// AR-780 — PERCHE' QUESTO FILE NON HA IMPORT.
//
// Fino al 23/8/2026 apriva con degli `import` e metteva `meta` piu' in basso. Il motore dei workflow
// pretende che `export const meta` sia la PRIMA istruzione e non accetta nessun import, ne' statico
// ne' dinamico: rifiutava lo script prima di eseguirne una riga. Tutti e sei i workflow erano cosi',
// da due mesi, mentre CLAUDE.md li nomina per nome nei comandi rapidi.
//
// I mansionari dei senior NON si incollano piu' nel prompt: il motore li carica da se' con
// `agentType`, che risolve dallo stesso registro del comando di delega. Il senior riceve il suo
// mansionario come identita', non come testo dentro un messaggio — ed e' anche piu' corretto.


export const meta = {
  name: 'audit-design',
  description: 'Radiografia del design: audit UX/UI completo del marketplace MyCity (11 dimensioni che coprono i 24 punti visivi/UX), in sola lettura, ogni problema verificato',
  phases: [
    { title: 'Design review', detail: 'un esperto per dimensione UX/UI (sola lettura)' },
    { title: 'Verifica', detail: 'tieni solo i problemi reali' },
  ],
}

// Dove sta il codice del marketplace non lo calcola piu' questo script: qui non si legge ne' il
// disco ne' l'ambiente. Lo trova l'agente, che gli strumenti ce li ha — e se non lo trova DEVE
// dirlo e fermarsi invece di dedurre.
const DOVE_E_IL_CODICE = `Il codice del marketplace sta in \`$MARKETPLACE_REPO\` se quella variabile d'ambiente c'e', altrimenti nella copia locale \`marketplace/\` dentro il repo dell'AD.
Controllalo PRIMA di cominciare (\`ls\`). Se non c'e' ne' l'una ne' l'altra il codice NON e' collegato: dillo, restituisci lista vuota e FERMATI — non dedurre niente da un percorso che non esiste. Per collegarlo: \`node cervello/collega-marketplace.mjs\`.`

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
          dove: { type: 'string', description: 'file/componente o pagina' },
          severita: { type: 'string', enum: ['bloccante', 'grave', 'minore'] },
          descrizione: { type: 'string' },
          fix: { type: 'string', description: 'correzione consigliata' },
          corsia: { type: 'string', enum: ['config', 'codice'], description: 'config=site_settings (subito) · codice=componenti/CSS (anteprima)' },
        },
        required: ['titolo', 'severita', 'descrizione', 'fix', 'corsia'],
      },
    },
  },
  required: ['dimensione', 'findings'],
}

// Percorso del codice del marketplace (repo NicolaeRotaru/mycity).
// Ordine: MARKETPLACE_REPO (env, per VPS/CI) → copia locale <ad-repo>/marketplace creata da
// `node cervello/collega-marketplace.mjs`.
// Se non c'è nessuno dei due il codice non è collegato, e va detto: il vecchio fallback al percorso
// Windows del PC di Nicola mandava i senior a guardare una cartella inesistente su ogni altra macchina.
// `log` è una globale del motore dei workflow e qui siamo prima della prima fase: se non c'è, il
// messaggio esce comunque invece di far cadere l'audit sulla riga di un avviso.

const DIMS = [
  { key: 'layout-responsive', senior: 'frontend-dev', focus: 'layout e responsive: elementi disallineati, overflow, spaziature incoerenti, griglie rotte, breakpoint mobile/tablet/desktop' },
  { key: 'coerenza-brand', senior: 'designer', focus: 'coerenza col design system: uso corretto di colori/font/spaziature dei token (tailwind.config, design-system/, globals.css); componenti fuori standard, stili hardcoded' },
  { key: 'tipografia', senior: 'designer', focus: 'tipografia e leggibilità: gerarchia titoli, dimensioni, line-height, testo troppo lungo/corto, contrasto testo-sfondo' },
  { key: 'accessibilita-visiva', senior: 'accessibility', focus: 'accessibilità visiva: contrasto colori (WCAG), focus visibile, dimensione target tappabili, alt delle immagini, aria' },
  { key: 'stati-ui', senior: 'frontend-dev', focus: 'stati dell\'interfaccia: loading/empty/error mancanti, hover/disabled/active, feedback dopo le azioni, skeleton' },
  { key: 'immagini-media', senior: 'ai-designer', focus: 'immagini e media: aspect ratio sbagliati, immagini deformate/sgranate, placeholder mancanti, lazy-load, logo/icone' },
  { key: 'mobile-pwa', senior: 'mobile-app', focus: 'esperienza mobile/PWA: usabilità da telefono, touch target, viewport, menu, install/PWA' },
  { key: 'flussi-conversione', senior: 'cro', focus: 'frizioni UX nei flussi chiave (home→negozio→prodotto→carrello→checkout/COD): troppi step, CTA poco chiare, campi inutili, punti di abbandono' },
  { key: 'microcopy', senior: 'ai-copywriter', focus: 'microcopy/UX writing: testi UI poco chiari, messaggi d\'errore criptici, tono incoerente col brand, refusi' },
  { key: 'navigazione-gerarchia', senior: 'ux-designer', focus: 'navigazione e gerarchia visiva: menu/header/footer poco chiari, percorsi per trovare le cose, breadcrumb, cosa salta all\'occhio (il prezzo e la CTA "compra" devono dominare), allineamento e spaziatura tra elementi importanti, ordine logico dei blocchi nella pagina' },
  { key: 'performance-percepita', senior: 'frontend-dev', focus: 'velocità percepita: peso e ottimizzazione immagini, lazy-load, skeleton/spinner durante il caricamento, layout shift (CLS), bundle pesanti, font che bloccano il render, sensazione di lentezza nelle pagine chiave' },
]

phase('Design review')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Audit del design del marketplace, dimensione "${d.key}": ${d.focus}

${DOVE_E_IL_CODICE}

Analizza in SOLA LETTURA (Read/Grep/Glob su app/, components/, design-system/, tailwind.config.ts, app/globals.css; e i contenuti configurabili in site_settings via Supabase MCP sola lettura).
⛔ NON modificare nulla.
Trova con accuratezza MILLIMETRICA tutti i problemi REALI di grafica/UX della tua dimensione.
Per ognuno: titolo · dove (file/componente o pagina) · severità (bloccante/grave/minore) · descrizione · fix consigliato · corsia ("config" se si risolve da site_settings/branding/home senza deploy, "codice" se serve modificare componenti/CSS).
Solo problemi reali nel codice/configurazione, niente teoria. Se non trovi nulla, lista vuota.`,
    { label: `design:${d.key}`, phase: 'Design review', schema: FINDINGS, agentType: d.senior }
  ),
  // Chi trova non conferma: il cancello tecnico finale è di qa-designer, col suo mansionario.
  (rev, d) => agent(
    `Verifica avversariale dei problemi di design che un collega dichiara di aver trovato, dimensione "${d.key}".

${DOVE_E_IL_CODICE}

Problemi segnalati:
${JSON.stringify(rev?.findings || [], null, 2)}

Ricontrolla ciascuno nel codice reale (sola lettura) e tieni SOLO quelli VERI (scarta i falsi positivi e ciò che non confermi). Correggi severità e corsia se sbagliate.
Restituisci {dimensione:"${d.key}", findings:[...confermati...]}. In caso di dubbio, scarta.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS, agentType: 'qa-designer' }
  )
)

return reviewed.filter(Boolean)
