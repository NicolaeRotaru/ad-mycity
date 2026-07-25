// AR-123 — riproduzione REALE nel browser: aprire «Parla con questa casella» cancella la chat
// aperta nell'Assistente?
//
// Non legge il codice: guida il Pannello vero (Chromium). Semina una conversazione recente in
// localStorage — l'Assistente la apre da solo (page.tsx:2261) — apre il Worker per vederla A
// SCHERMO, lo chiude, clicca «💬 Parla con questa casella» su una casella mai usata, e riapre
// il Worker per vedere se la conversazione c'è ancora.
//
// Esito il 25/7 (Pannello in locale, `npm --prefix pannello run dev`):
//   · PRIMA del fix  → "BUG RIPRODOTTO — la chat e sparita aprendo la casella"  (2 messaggi → 0)
//   · DOPO  il fix   → "OK — la chat resta"                                      (2 messaggi → 2)
// Il fix è in pannello/src/lib/chat-unificata.ts (nienteDaDire); la rete anti-ritorno è
// pannello/src/lib/chat-unificata.test.mts, che senza il fix fallisce.
//
// Uso:
//   npm --prefix pannello run dev &     (serve un Pannello vivo: qui si guarda la superficie vera)
//   SC=/tmp/pw PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node cervello/test/ar123-parla-casella.mjs http://localhost:3000/
import { createRequire } from "module";
import { mkdirSync } from "fs";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://localhost:3000/";
const SC = process.env.SC || "/tmp/pw";
mkdirSync(SC, { recursive: true });

const ORA = new Date().toISOString();
const FRASE_UTENTE = "AR123-DOMANDA-DI-NICOLA";
const FRASE_AI = "AR123-RISPOSTA-DELLA-MACCHINA";

const CONV = [
  {
    id: "ar123-conv",
    titolo: "💬 Azione: chiudere l'ultimo blocco",
    created_at: ORA,
    updated_at: ORA,
    messaggi: [
      { id: "m1", role: "user", content: FRASE_UTENTE },
      { id: "m2", role: "assistant", content: FRASE_AI },
    ],
  },
];

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errori = [];
p.on("pageerror", (e) => errori.push("PAGEERROR: " + e.message));

await p.addInitScript((conv) => {
  localStorage.setItem("mycity_conversazioni", JSON.stringify(conv));
}, CONV);

await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await p.waitForTimeout(2500);

// Vado dove ci sono le caselle con «Parla con questa casella» (evento di navigazione dell'app).
await p.evaluate(() => window.dispatchEvent(new CustomEvent("mycity:vai", { detail: { vista: "azioni" } })));
await p.waitForTimeout(3000);

const conta = async () => ({
  utente: await p.locator(`text=${FRASE_UTENTE}`).count(),
  ai: await p.locator(`text=${FRASE_AI}`).count(),
});

async function apriWorker() {
  const bt = p.locator('button[aria-label="Apri il Worker"]').first();
  if (!(await bt.count())) return false;
  await bt.click({ timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(2500);
  return true;
}
async function chiudiWorker() {
  // L'overlay trasparente chiude al click fuori: uso Escape, poi un click in alto a sinistra.
  await p.keyboard.press("Escape").catch(() => {});
  await p.waitForTimeout(500);
  if (!(await p.locator('button[aria-label="Apri il Worker"]').count())) {
    await p.mouse.click(5, 300);
    await p.waitForTimeout(800);
  }
}

// ── ① la chat dell'Assistente, a schermo
const workerApribile = await apriWorker();
const prima = await conta();
await p.screenshot({ path: `${SC}/ar123-1-chat-aperta.png` });
await chiudiWorker();
await p.waitForTimeout(800);

// ── ② clicco «Parla con questa casella» su una casella mai usata
const bottoni = p.locator('button:has-text("Parla con questa casella")');
const quanti = await bottoni.count();
let cliccato = false;
if (quanti > 0) {
  await bottoni.first().scrollIntoViewIfNeeded().catch(() => {});
  await bottoni.first().click({ timeout: 8000 }).catch(() => {});
  cliccato = true;
  await p.waitForTimeout(2500);
}
await p.screenshot({ path: `${SC}/ar123-2-casella-aperta.png` });

// ── ③ riapro il Worker: la conversazione c'è ancora?
await apriWorker();
const dopo = await conta();
await p.screenshot({ path: `${SC}/ar123-3-worker-riaperto.png` });
await b.close();

const eraAperta = prima.utente > 0 || prima.ai > 0;
const sopravvive = dopo.utente > 0 || dopo.ai > 0;

console.log(
  JSON.stringify(
    {
      worker_apribile: workerApribile,
      caselle_trovate: quanti,
      cliccato,
      chat_prima: prima,
      chat_dopo: dopo,
      verdetto: !eraAperta
        ? "INCONCLUSIVO — la chat non era a schermo prima del click: il test non prova niente"
        : !cliccato
          ? "INCONCLUSIVO — nessuna casella da aprire"
          : sopravvive
            ? "OK — la chat resta: AR-123 non si riproduce"
            : "BUG RIPRODOTTO — la chat e sparita aprendo la casella",
      errori,
      screenshot: [
        `${SC}/ar123-1-chat-aperta.png`,
        `${SC}/ar123-2-casella-aperta.png`,
        `${SC}/ar123-3-worker-riaperto.png`,
      ],
    },
    null,
    1,
  ),
);
