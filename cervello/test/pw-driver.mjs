// Driver Playwright riutilizzabile per verificare il Pannello (superficie = pixel).
// Uso:  SC=/tmp/pw PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/pw-driver.mjs <url> <nome>
// Carica playwright dal global (createRequire: NODE_PATH non basta in ESM), apre a viewport mobile,
// cattura errori console/pageerror e uno screenshot. Estendilo per guidare flussi specifici (chat, INDIETRO…).
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
const require = createRequire('/opt/node22/lib/node_modules/')
const { chromium } = require('playwright')

const url = process.argv[2] || 'http://127.0.0.1:3939/'
const nome = process.argv[3] || 'pannello'
const SC = process.env.SC || '/tmp/pw'
mkdirSync(SC, { recursive: true })

const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 390, height: 844 } }) // il Pannello si usa da telefono
const errori = []
p.on('console', m => { if (m.type() === 'error') errori.push(m.text()) })
p.on('pageerror', e => errori.push('PAGEERROR: ' + e.message))

await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
await p.waitForTimeout(1200)
const out = {
  url,
  titolo: await p.title(),
  bodyLen: (await p.textContent('body') || '').length,
  bottoni: await p.locator('button, a').count(),
  errori_console: errori.slice(0, 10),
}
const shot = `${SC}/${nome}.png`
await p.screenshot({ path: shot, fullPage: false })
out.screenshot = shot
console.log(JSON.stringify(out, null, 1))
await b.close()
