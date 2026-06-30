import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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
// `node cervello/collega-marketplace.mjs` → fallback al vecchio path Windows del PC di Nicola.
// Senza un percorso valido l'audit del design non gira: collega prima il marketplace.
function resolveMarketplaceRepo() {
  if (process.env.MARKETPLACE_REPO) return process.env.MARKETPLACE_REPO
  const adRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const local = join(adRoot, 'marketplace')
  if (existsSync(local)) return local
  return 'C:\\Users\\InfinitaPossibilita\\mycity-live'
}
const REPO = resolveMarketplaceRepo()

const DIMS = [
  { key: 'layout-responsive', focus: 'layout e responsive: elementi disallineati, overflow, spaziature incoerenti, griglie rotte, breakpoint mobile/tablet/desktop' },
  { key: 'coerenza-brand', focus: 'coerenza col design system: uso corretto di colori/font/spaziature dei token (tailwind.config, design-system/, globals.css); componenti fuori standard, stili hardcoded' },
  { key: 'tipografia', focus: 'tipografia e leggibilità: gerarchia titoli, dimensioni, line-height, testo troppo lungo/corto, contrasto testo-sfondo' },
  { key: 'accessibilita-visiva', focus: 'accessibilità visiva: contrasto colori (WCAG), focus visibile, dimensione target tappabili, alt delle immagini, aria' },
  { key: 'stati-ui', focus: 'stati dell\'interfaccia: loading/empty/error mancanti, hover/disabled/active, feedback dopo le azioni, skeleton' },
  { key: 'immagini-media', focus: 'immagini e media: aspect ratio sbagliati, immagini deformate/sgranate, placeholder mancanti, lazy-load, logo/icone' },
  { key: 'mobile-pwa', focus: 'esperienza mobile/PWA: usabilità da telefono, touch target, viewport, menu, install/PWA' },
  { key: 'flussi-conversione', focus: 'frizioni UX nei flussi chiave (home→negozio→prodotto→carrello→checkout/COD): troppi step, CTA poco chiare, campi inutili, punti di abbandono' },
  { key: 'microcopy', focus: 'microcopy/UX writing: testi UI poco chiari, messaggi d\'errore criptici, tono incoerente col brand, refusi' },
  { key: 'navigazione-gerarchia', focus: 'navigazione e gerarchia visiva: menu/header/footer poco chiari, percorsi per trovare le cose, breadcrumb, cosa salta all\'occhio (il prezzo e la CTA "compra" devono dominare), allineamento e spaziatura tra elementi importanti, ordine logico dei blocchi nella pagina' },
  { key: 'performance-percepita', focus: 'velocità percepita: peso e ottimizzazione immagini, lazy-load, skeleton/spinner durante il caricamento, layout shift (CLS), bundle pesanti, font che bloccano il render, sensazione di lentezza nelle pagine chiave' },
]

phase('Design review')
const reviewed = await pipeline(
  DIMS,
  (d) => agent(
    `Sei un designer/UX SENIOR esperto di ${d.focus}.
Analizza in SOLA LETTURA il marketplace MyCity nel repo \`${REPO}\` (Read/Grep/Glob su app/, components/, design-system/, tailwind.config.ts, app/globals.css; e i contenuti configurabili in site_settings via Supabase MCP sola lettura).
⛔ NON modificare nulla.
Trova con accuratezza MILLIMETRICA tutti i problemi REALI di grafica/UX della tua dimensione.
Per ognuno: titolo · dove (file/componente o pagina) · severità (bloccante/grave/minore) · descrizione · fix consigliato · corsia ("config" se si risolve da site_settings/branding/home senza deploy, "codice" se serve modificare componenti/CSS).
Solo problemi reali nel codice/configurazione, niente teoria. Se non trovi nulla, lista vuota.`,
    { label: `design:${d.key}`, phase: 'Design review', schema: FINDINGS }
  ),
  (rev, d) => agent(
    `Sei un VERIFICATORE avversariale. Problemi segnalati per "${d.key}":
${JSON.stringify(rev?.findings || [], null, 2)}
Ricontrolla ciascuno nel codice reale in \`${REPO}\` (sola lettura) e tieni SOLO quelli VERI (scarta i falsi positivi e ciò che non confermi). Correggi severità e corsia se sbagliate.
Restituisci {dimensione:"${d.key}", findings:[...confermati...]}. In caso di dubbio, scarta.`,
    { label: `verifica:${d.key}`, phase: 'Verifica', schema: FINDINGS }
  )
)

return reviewed.filter(Boolean)
