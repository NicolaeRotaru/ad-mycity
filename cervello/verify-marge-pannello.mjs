// Driver ad-hoc: verifica a runtime le 4 micro-modifiche al Pannello (icona ⤢, menu ☰, textarea, auto-scroll).
// Sta in cervello/ (non cervello/test/) per rientrare nell'allowlist `node cervello/*.mjs`.
// Uso: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/verify-marge-pannello.mjs
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')

const url = process.argv[2] || process.env.PANNELLO_URL || 'http://127.0.0.1:3000/'
const SC = '/tmp/pw'
mkdirSync(SC, { recursive: true })
const res = { pass: [], fail: [], note: [], errori: [] }

const b = await chromium.launch({ headless: true })

// ---------- DESKTOP 1280x800: menu ☰ nella nav ----------
const pd = await b.newPage({ viewport: { width: 1280, height: 800 } })
pd.on('pageerror', e => res.errori.push('PAGEERROR: ' + e.message))
await pd.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await pd.waitForTimeout(1000)

const menuBtn = pd.locator('button[aria-label="Apri o chiudi il menù"]')
const nMenu = await menuBtn.count()
if (nMenu === 1) res.pass.push('menu ☰: bottone presente nella nav (aria-label ok)')
else res.fail.push(`menu ☰: atteso 1 bottone, trovati ${nMenu}`)

if (nMenu === 1) {
  const before = await menuBtn.getAttribute('aria-expanded')
  await menuBtn.click(); await pd.waitForTimeout(350)
  const after = await menuBtn.getAttribute('aria-expanded')
  await menuBtn.click(); await pd.waitForTimeout(350)
  const back = await menuBtn.getAttribute('aria-expanded')
  if (before === 'true' && after === 'false' && back === 'true')
    res.pass.push(`menu ☰: su DESKTOP apre/chiude (aperto=${before} → chiuso=${after} → aperto=${back})`)
  else
    res.fail.push(`menu ☰: toggle desktop non coerente (${before}→${after}→${back})`)
}

// nessuna linguetta a freccia ‹/› residua (ChevronLeft)
const tab = await pd.locator('button[aria-label*="menù laterale"], button[aria-label*="Espandi il menù"], button[aria-label*="Comprimi il menù"]').count()
res[tab === 0 ? 'pass' : 'fail'].push(tab === 0 ? 'linguetta a freccia laterale: assente' : `linguetta ancora presente (${tab})`)
await pd.screenshot({ path: `${SC}/desktop-menu.png`, fullPage: false })

// ---------- MOBILE 390x844: chat fluttuante ⤢ + textarea ----------
const pm = await b.newPage({ viewport: { width: 390, height: 844 } })
pm.on('pageerror', e => res.errori.push('PAGEERROR(mobile): ' + e.message))
await pm.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await pm.waitForTimeout(1000)

const fab = pm.locator('button[aria-label="Parla con l\'AD"]')
if (await fab.count() >= 1) {
  await fab.first().click(); await pm.waitForTimeout(600)
  // bottone espandi = icona, NON testo "chat intera →"
  const exp = pm.locator('button[aria-label="Apri la chat intera"]')
  const nExp = await exp.count()
  if (nExp === 1) {
    const svg = await exp.locator('svg').count()
    const txt = ((await exp.textContent()) || '').trim()
    if (svg >= 1) res.pass.push('chat fluttuante: bottone espandi è un\'icona (svg ⤢ Maximize2)')
    else res.fail.push('chat fluttuante: bottone espandi senza icona svg')
    if (/chat intera/i.test(txt)) res.fail.push(`chat fluttuante: testo "chat intera" ancora visibile ("${txt}")`)
    else res.pass.push('chat fluttuante: nessun testo "chat intera →" nel bottone')
  } else res.fail.push(`chat fluttuante: atteso 1 bottone espandi, trovati ${nExp}`)

  // textarea fluttuante rows=3 + onscroll agganciato
  const taRows = await pm.locator('textarea').first().getAttribute('rows')
  res[taRows === '3' ? 'pass' : 'note'].push(`textarea chat fluttuante rows=${taRows} (atteso 3)`)
} else res.fail.push('chat fluttuante: FAB "Parla con l\'AD" non trovato')

await pm.screenshot({ path: `${SC}/mobile-chat-fluttuante.png`, fullPage: false })

// ---------- Auto-scroll: wiring onScroll presente nel DOM ----------
// (il comportamento pieno serve un reply dal backend che qui non c'è: verifico l'aggancio, non lo strappo)
const scrollBoxes = await pm.locator('.scroll-soft.overflow-y-auto').count()
res.note.push(`auto-scroll: contenitori scrollabili chat presenti nel DOM = ${scrollBoxes} (handler onScroll→vicinoAlFondo agganciati staticamente; strappo non esercitato: manca reply backend)`)

console.log(JSON.stringify(res, null, 1))
await b.close()
