// Verifica runtime della finestra "Skill & comandi" (⚡) nella chat del Pannello.
// Uso: SC=/tmp/pw PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-finestra-skill.mjs
// NB: per capire se la finestra è aperta/chiusa si guarda la SUA X ("Chiudi skill e comandi"),
// che esiste solo a finestra aperta — il testo "Skill rapide" può comparire anche nei contenuti
// della pagina (es. lettere/briefing che ne parlano) e renderebbe l'assert bugiardo.
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
const finestraAperta = async () => (await p.getByRole('button', { name: 'Chiudi skill e comandi' }).count()) > 0

await p.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(1500)

// ── 1) CHAT FLUTTUANTE (da Plancia) ─────────────────────────────────────────
await p.getByRole('button', { name: /Parla con l'AD/ }).first().click()
await p.waitForTimeout(400)
const btnSkillFab = p.getByRole('button', { name: 'Skill e comandi' }).last()
passo('FAB: pulsante ⚡ presente nella riga dei pulsanti', await btnSkillFab.count() > 0)
await shot('01-fab-chiusa')

await btnSkillFab.click(); await p.waitForTimeout(300)
passo('FAB: ⚡ apre la finestra "Skill & comandi"', await finestraAperta())
await shot('02-fab-finestra-aperta')

// clic su una skill → input riempito + finestra chiusa
await p.getByRole('button', { name: '🔁 Loop 30m' }).first().click()
await p.waitForTimeout(300)
const valFab = await p.locator('textarea').last().inputValue()
passo('FAB: clic su skill riempie l\'input', valFab === '/loop 30m fai un giro', `input="${valFab}"`)
passo('FAB: dopo la scelta la finestra si chiude', !(await finestraAperta()))
await shot('03-fab-skill-scelta')

// riapri e chiudi con la X
await btnSkillFab.click(); await p.waitForTimeout(250)
await p.getByRole('button', { name: 'Chiudi skill e comandi' }).click(); await p.waitForTimeout(250)
passo('FAB: la X richiude la finestra', !(await finestraAperta()))

// 🔍 fuori happy-path: doppio toggle col pulsante ⚡ (apri → richiudi) non deve rompere nulla
await btnSkillFab.click(); await p.waitForTimeout(150)
await btnSkillFab.click(); await p.waitForTimeout(150)
passo('FAB 🔍: doppio toggle ⚡ apre e richiude senza errori', !(await finestraAperta()))

// la textarea del FAB deve avere TUTTA la larghezza (i pulsanti stanno sopra, non di fianco)
const boxFab = await p.locator('textarea').last().boundingBox()
passo('FAB: la textarea non è strizzata dai pulsanti', boxFab && boxFab.width > 300, `larghezza=${Math.round(boxFab?.width || 0)}px su 390`)

// chiudi la chat fluttuante
await p.getByRole('button', { name: 'Chiudi la chat' }).click(); await p.waitForTimeout(300)

// ── 2) CHAT INTERA (vista Assistente) ───────────────────────────────────────
// Su mobile il menù laterale è un drawer chiuso (fuori viewport): aprilo sempre dall'hamburger.
await p.getByRole('button', { name: 'Apri o chiudi il menù' }).click()
await p.waitForTimeout(400)
await p.getByRole('button', { name: 'Assistente' }).first().click()
await p.waitForTimeout(800)
await shot('04-assistente')

// le vecchie chip fisse NON devono esserci (finestra chiusa → niente chip a vista)
const chipFisse = await p.getByRole('button', { name: '🔁 Loop 30m' }).count()
passo('Assistente: niente chip fisse sopra la textarea', chipFisse === 0, `chip trovate=${chipFisse}`)

// la card "Comandi — cosa puoi dirmi" in fondo NON deve più esserci (a finestra chiusa)
const cardComandi = await p.getByText('Comandi — cosa puoi dirmi').count()
passo('Assistente: card "Comandi — cosa puoi dirmi" rimossa dalla pagina', cardComandi === 0, `occorrenze=${cardComandi}`)

// la scritta sotto ("Invio = invia · Shift+Invio…") NON deve più esserci
const scritta = await p.getByText('Niente API a pagamento').count()
passo('Assistente: scritta "Invio = invia…" rimossa', scritta === 0, `occorrenze=${scritta}`)

// il pulsante Prompt sta nella riga delle icone, alla stessa altezza del ⚡
const btnSkillFull = p.getByRole('button', { name: 'Skill e comandi' }).first()
passo('Assistente: pulsante ⚡ presente', await btnSkillFull.count() > 0)
const btnPrompt = p.getByRole('button', { name: 'Prompt (copia per Max)' })
passo('Assistente: pulsante Prompt presente', await btnPrompt.count() > 0)
const [bZap, bPrompt] = [await btnSkillFull.boundingBox(), await btnPrompt.boundingBox()]
passo('Assistente: Prompt è nella stessa riga delle icone', !!bZap && !!bPrompt && Math.abs(bZap.y - bPrompt.y) < 5, `y ⚡=${Math.round(bZap?.y || 0)} y Prompt=${Math.round(bPrompt?.y || 0)}`)

// la textarea ha tutta la larghezza
const boxFull = await p.locator('textarea').first().boundingBox()
passo('Assistente: la textarea non è strizzata dai pulsanti', boxFull && boxFull.width > 300, `larghezza=${Math.round(boxFull?.width || 0)}px su 390`)

// ⚡ apre la finestra; dentro ci sono skill E comandi per reparto
await btnSkillFull.click(); await p.waitForTimeout(300)
await shot('05-assistente-finestra')
passo('Assistente: ⚡ apre la finestra', await finestraAperta())

// apri un reparto e scegli un comando → input riempito, finestra chiusa
await p.getByRole('button', { name: /Ogni giorno \(ritmo\)/ }).click(); await p.waitForTimeout(250)
await shot('06-assistente-reparto-aperto')
await p.getByRole('button', { name: /fai un giro/ }).first().click(); await p.waitForTimeout(300)
const valFull = await p.locator('textarea').first().inputValue()
passo('Assistente: clic su comando riempie l\'input', valFull === 'fai un giro', `input="${valFull}"`)
passo('Assistente: la finestra si chiude dopo la scelta', !(await finestraAperta()))
await shot('07-assistente-comando-scelto')

console.log('\nerrori_console:', JSON.stringify(errori.slice(0, 10)))
const falliti = esiti.filter(e => !e.ok)
console.log(falliti.length === 0 ? '\nVERDETTO: PASS' : `\nVERDETTO: FAIL (${falliti.length} passi falliti)`)
await b.close()
process.exit(falliti.length === 0 ? 0 : 1)
