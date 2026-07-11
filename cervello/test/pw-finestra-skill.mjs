// Verifica runtime della finestra "Skill & comandi" (⚡) nella chat del Pannello.
// Uso: SC=/tmp/pw PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-finestra-skill.mjs
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')

const BASE = process.argv[2] || 'http://127.0.0.1:3939/'
const SC = process.env.SC || '/tmp/pw'
mkdirSync(SC, { recursive: true })

const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
const errori = []
p.on('console', m => { if (m.type() === 'error') errori.push(m.text()) })
p.on('pageerror', e => errori.push('PAGEERROR: ' + e.message))

const esiti = []
const passo = (nome, ok, dettaglio = '') => { esiti.push({ nome, ok, dettaglio }); console.log(`${ok ? '✅' : '❌'} ${nome}${dettaglio ? ' — ' + dettaglio : ''}`) }
const shot = async (nome) => { await p.screenshot({ path: `${SC}/${nome}.png` }); }

await p.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(1500)

// ── 1) CHAT FLUTTUANTE (da Plancia) ─────────────────────────────────────────
await p.getByRole('button', { name: /Parla con l'AD/ }).first().click()
await p.waitForTimeout(400)
const btnSkillFab = p.getByRole('button', { name: 'Skill e comandi' }).last()
passo('FAB: pulsante ⚡ presente nella riga dei pulsanti', await btnSkillFab.count() > 0 ? true : false)
await shot('01-fab-chiusa')

await btnSkillFab.click()
await p.waitForTimeout(300)
const finestraVisibile = await p.getByText('Skill & comandi', { exact: false }).first().isVisible().catch(() => false)
passo('FAB: ⚡ apre la finestra "Skill & comandi"', finestraVisibile)
await shot('02-fab-finestra-aperta')

// clic su una skill → input riempito + finestra chiusa
await p.getByRole('button', { name: '🔁 Loop 30m' }).first().click()
await p.waitForTimeout(300)
const valFab = await p.locator('textarea').last().inputValue()
passo('FAB: clic su skill riempie l\'input', valFab === '/loop 30m fai un giro', `input="${valFab}"`)
const finestraChiusa = !(await p.getByText('Comandi — cosa puoi dirmi').first().isVisible().catch(() => false))
passo('FAB: dopo la scelta la finestra si chiude', finestraChiusa)
await shot('03-fab-skill-scelta')

// riapri e chiudi con la X
await btnSkillFab.click(); await p.waitForTimeout(250)
await p.getByRole('button', { name: 'Chiudi skill e comandi' }).click(); await p.waitForTimeout(250)
const richiusa = !(await p.getByText('Skill rapide').first().isVisible().catch(() => false))
passo('FAB: la X richiude la finestra', richiusa)

// 🔍 fuori happy-path: toggle doppio col pulsante ⚡ (apri → riapri) non deve rompere nulla
await btnSkillFab.click(); await p.waitForTimeout(150)
await btnSkillFab.click(); await p.waitForTimeout(150)
const dopoToggle = !(await p.getByText('Skill rapide').first().isVisible().catch(() => false))
passo('FAB 🔍: doppio toggle ⚡ apre e richiude senza errori', dopoToggle)

// chiudi la chat fluttuante
await p.getByRole('button', { name: 'Chiudi la chat' }).click(); await p.waitForTimeout(300)

// ── 2) CHAT INTERA (vista Assistente) ───────────────────────────────────────
// apri il menù laterale se serve, poi vai su "Assistente"
const navAss = p.getByRole('button', { name: /^Assistente$/ }).first()
if (!(await navAss.isVisible().catch(() => false))) {
  await p.locator('header button').first().click() // hamburger
  await p.waitForTimeout(400)
}
await p.getByText('Assistente', { exact: true }).first().click()
await p.waitForTimeout(800)
await shot('04-assistente')

// le vecchie chip fisse NON devono esserci (input vuoto ma niente chip "Loop 30m" a vista)
const chipFisse = await p.getByRole('button', { name: '🔁 Loop 30m' }).count()
passo('Assistente: niente chip fisse sopra la textarea', chipFisse === 0, `chip trovate=${chipFisse}`)

// la card "Comandi — cosa puoi dirmi" in fondo NON deve più esserci
const cardComandi = await p.getByText('Comandi — cosa puoi dirmi').count()
passo('Assistente: card "Comandi — cosa puoi dirmi" rimossa dalla pagina', cardComandi === 0, `occorrenze=${cardComandi}`)

// ⚡ apre la finestra; dentro ci sono skill E comandi per reparto
const btnSkillFull = p.getByRole('button', { name: 'Skill e comandi' }).first()
passo('Assistente: pulsante ⚡ presente', await btnSkillFull.count() > 0)
await btnSkillFull.click(); await p.waitForTimeout(300)
await shot('05-assistente-finestra')
const skillDentro = await p.getByText('Skill rapide').first().isVisible().catch(() => false)
const comandiDentro = await p.getByText('Comandi — cosa puoi dirmi').first().isVisible().catch(() => false)
passo('Assistente: la finestra contiene le skill', skillDentro)
passo('Assistente: la finestra contiene il menù comandi', comandiDentro)

// apri un reparto e scegli un comando → input riempito, finestra chiusa
await p.getByRole('button', { name: /Ogni giorno \(ritmo\)/ }).click(); await p.waitForTimeout(250)
await shot('06-assistente-reparto-aperto')
await p.getByRole('button', { name: /fai un giro/ }).first().click(); await p.waitForTimeout(300)
const valFull = await p.locator('textarea').first().inputValue()
passo('Assistente: clic su comando riempie l\'input', valFull === 'fai un giro', `input="${valFull}"`)
const chiusaDopoComando = !(await p.getByText('Skill rapide').first().isVisible().catch(() => false))
passo('Assistente: la finestra si chiude dopo la scelta', chiusaDopoComando)
await shot('07-assistente-comando-scelto')

console.log('\nerrori_console:', JSON.stringify(errori.slice(0, 10)))
const falliti = esiti.filter(e => !e.ok)
console.log(falliti.length === 0 ? '\nVERDETTO: PASS' : `\nVERDETTO: FAIL (${falliti.length} passi falliti)`)
await b.close()
process.exit(falliti.length === 0 ? 0 : 1)
