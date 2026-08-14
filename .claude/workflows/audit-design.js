import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promptSenior, radiceRepo } from '../../cervello/prompt-senior.mjs'

export const meta = {
  name: 'audit-design',
  description: 'Radiografia del design: audit UX/UI completo del marketplace MyCity (11 dimensioni che coprono i 24 punti visivi/UX), in sola lettura, ogni problema verificato',
  phases: [
    { title: 'Design review', detail: 'un esperto per dimensione UX/UI (sola lettura)' },
    { title: 'Verifica', detail: 'tieni solo i problemi reali' },
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
function resolveMarketplaceRepo() {
  if (process.env.MARKETPLACE_REPO) return process.env.MARKETPLACE_REPO
  const local = join(radiceRepo(), 'marketplace')
  return existsSync(local) ? local : null
}
const REPO = resolveMarketplaceRepo()
// `log` è una globale del motore dei workflow e qui siamo prima della prima fase: se non c'è, il
// messaggio esce comunque invece di far cadere l'audit sulla riga di un avviso.
const avvisa = (m) => (typeof log === 'function' ? log(m) : console.log(m))
if (!REPO) avvisa('⚠️ marketplace non collegato: nessun MARKETPLACE_REPO e nessuna copia in marketplace/ — lancia prima `node cervello/collega-marketplace.mjs`')

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
    promptSenior(d.senior, { radice: radiceRepo(), focus: `Audit del design del marketplace, dimensione "${d.key}": ${d.focus}`, compito:
    `Analizza in SOLA LETTURA il marketplace MyCity nel repo \`${REPO}\` (Read/Grep/Glob su app/, components/, design-system/, tailwind.config.ts, app/globals.css; e i contenuti configurabili in site_settings via Supabase MCP sola lettura). Se quel percorso è vuoto o nullo, il codice NON è collegato: dillo e fermati.
⛔ NON modificare nulla.
Trova con accuratezza MILLIMETRICA tutti i problemi REALI di grafica/UX della tua dimensione.
Per ognuno: titolo · dove (file/componente o pagina) · severità (bloccante/grave/minore) · descrizione · fix consigliato · corsia ("config" se si risolve da site_settings/branding/home senza deploy, "codice" se serve modificare componenti/CSS).
Solo problemi reali nel codice/configurazione, niente teoria. Se non trovi nulla, lista vuota.` }),
    { label: `design:${d.key}`, phase: 'Design review', schema: FINDINGS }
  ),
  // Chi trova non conferma: il cancello tecnico finale è di qa-designer, col suo mansionario.
  (rev, d) => agent(
    promptSenior('qa-designer', {
      radice: radiceRepo(),
      focus: `Verifica avversariale dei problemi di design che un collega dichiara di aver trovato, dimensione "${d.key}".`,
      compito: `Problemi segnalati:
${JSON.stringify(rev?.findings || [], null, 2)}
Ricontrolla ciascuno nel codice reale in \`${REPO}\` (sola lettura) e tieni SOLO quelli VERI (scarta i falsi positivi e ciò che non confermi). Correggi severità e corsia se sbagliate.
Restituisci {dimensione:"${d.key}", findings:[...confermati...]}. In caso di dubbio, scarta.`,
    }),
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS }
  )
)

return reviewed.filter(Boolean)
