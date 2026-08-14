#!/usr/bin/env node
// LOTTO 42, CORSIA E — la parte che si vede: il Pannello vero, guidato da un browser vero.
//
// PERCHÉ A RUNTIME E NON RILEGGENDO IL FILE. Tre di questi difetti non finiscono in una decisione
// che si possa estrarre: finiscono in come il browser costruisce la pagina e in che colore esce
// sullo schermo. Una prova che cerca una parola nel file direbbe «a posto» anche con la pagina
// rotta — ed è esattamente così che sono sopravvissuti finora.
//
//  · AR-613 — nell'area dove Nicola firma i due bottoni vivevano DENTRO la linguetta che apre la
//    scheda: un comando dentro un comando. Un lettore di schermo li legge come un blocco solo, e per
//    il browser il clic è un caso non definito. Che siano usciti si può dire solo guardando la
//    pagina costruita: qui si contano i comandi annidati e devono essere zero.
//  · AR-614 — in tema scuro i bordi e le etichette colorate restavano quelli del tema chiaro. Il
//    colore vero lo sa solo il browser dopo aver applicato i fogli di stile: si misura, non si legge.
//  · AR-673 — il salto del collegamento diretto cercava un pezzo di pagina per nome, e quel nome
//    c'era solo a volte. Girava senza fare niente e senza dare errore.
//
// Come si esegue: `node cervello/test/c4-schermo-coda.test.mjs`. Se un Pannello gira già lo usa
// (PANNELLO_URL / PANNELLO_PORT), altrimenti se lo avvia da solo e alla fine lo spegne.
//
// ⚠️ Se il browser non c'è, questo file NON dice «a posto»: dichiara di non aver potuto guardare e
// si conta a parte. Un cieco venduto per verde è peggio di un rosso.
//
// NON-VACUITÀ (verificata, non dedotta): rimettendo i due bottoni dentro il <summary> il primo caso
// diventa rosso; togliendo la gemella `dark:` dal bordo rosso in lib/stato-card.ts diventa rosso il
// caso del tema scuro; rimettendo `document.getElementById` al posto del riferimento in
// AutoCoscienza.tsx diventa rosso il caso del salto.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const PORTA = Number(process.env.PANNELLO_PORT || 3939);
const URL_BASE = (process.env.PANNELLO_URL || `http://127.0.0.1:${PORTA}`).replace(/\/+$/, "");
const SCRIVANIA = { viewport: { width: 1280, height: 900 } };

let server = null;
let browser = null;

/** Playwright può stare in tre case diverse. Cercarne una sola dà «rotto» quando è solo «non è qui». */
function risolviPlaywright() {
  for (const dove of [import.meta.url, join(RADICE, "pannello", "package.json"), join(RADICE, "package.json"), process.env.NODE_PATH || "", "/opt/node22/lib/node_modules/"].filter(Boolean)) {
    try { return require("node:module").createRequire(dove)("playwright"); } catch { /* la casa dopo */ }
  }
  return null;
}

async function raggiungibile() {
  try {
    const r = await fetch(URL_BASE + "/", { signal: AbortSignal.timeout(4000) });
    return r.status === 200;
  } catch {
    return false;
  }
}

// Va fatto QUI, prima che node:test registri i casi: dopo, il salto non si legge più.
if (!risolviPlaywright()) {
  console.log("TAP version 13");
  console.log("1..0 # SKIP nessun browser su questa macchina: i tre difetti di schermo (AR-613 comandi annidati, AR-614 tema scuro, AR-673 salto del collegamento) NON sono stati verificati qui");
  process.exit(0);
}

before(async () => {
  if (!(await raggiungibile())) {
    server = spawn("npm", ["run", "dev"], { cwd: join(RADICE, "pannello"), env: { ...process.env, PORT: String(PORTA) }, stdio: "ignore", detached: true });
    const scadenza = Date.now() + 180000;
    while (Date.now() < scadenza) {
      await new Promise((r) => setTimeout(r, 2000));
      if (await raggiungibile()) break;
    }
    assert.ok(await raggiungibile(), `il Pannello non risponde su ${URL_BASE}: non posso guardare, quindi non posso dire che è a posto`);
  }
  browser = await risolviPlaywright().chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server?.pid) { try { process.kill(-server.pid); } catch {} }
});

/** Apre l'area e aspetta che le schede della coda siano montate davvero. */
async function apriCoda(extra = {}) {
  const p = await browser.newPage({ ...SCRIVANIA, ...extra });
  await p.goto(URL_BASE + "/?a=azioni&s=approvare", { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(2500);
  return p;
}

// ── AR-613 · l'area dove si firma, per chi non guarda lo schermo ─────────────

test("AR-613 · nessun comando vive dentro un altro comando", async () => {
  const p = await apriCoda();
  const dentro = await p.locator("summary button, summary a[href], button button").count();
  assert.equal(dentro, 0, `${dentro} comandi stanno ancora annidati dentro un altro comando: un lettore di schermo li legge come un blocco solo`);
  // …e i bottoni ci sono ancora: toglierli sarebbe un altro modo di far passare la prova.
  const righe = await p.locator('[data-test="riga-firma"]').count();
  assert.ok(righe > 0, "spariti anche i bottoni: la coda non si firma più");
  await p.close();
});

test("AR-613 · le linguette sono un gruppo di schede dichiarato, non nove bottoni muti", async () => {
  const p = await apriCoda();
  assert.equal(await p.locator('[role="tablist"]').count(), 1, "manca il gruppo di schede");
  const schede = await p.locator('[role="tab"]').count();
  assert.ok(schede >= 8, `solo ${schede} linguette con un ruolo`);
  assert.equal(await p.locator('[role="tab"][aria-selected="true"]').count(), 1, "dev'essere annunciata UNA scheda aperta, né zero né due");
  // Ogni scheda deve dire quale pannello comanda, e quel pannello deve esistere davvero.
  const comandato = await p.locator('[role="tab"][aria-selected="true"]').getAttribute("aria-controls");
  assert.ok(comandato, "la scheda aperta non dice quale pannello comanda");
  assert.equal(await p.locator(`#${comandato}[role="tabpanel"]`).count(), 1, `il pannello «${comandato}» non esiste: il collegamento è rotto`);
  await p.close();
});

test("AR-613 · con la freccia destra ci si sposta davvero di una scheda", async () => {
  const p = await apriCoda();
  const prima = await p.locator('[role="tab"][aria-selected="true"]').getAttribute("id");
  await p.locator('[role="tab"][aria-selected="true"]').focus();
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(600);
  const dopo = await p.locator('[role="tab"][aria-selected="true"]').getAttribute("id");
  assert.notEqual(dopo, prima, "premuta la freccia, la scheda aperta è rimasta la stessa: da tastiera si resta fermi");
  await p.close();
});

test("AR-613 · le linguette si prendono col pollice (44 punti, non 34)", async () => {
  const p = await apriCoda({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const basse = [];
  for (const t of await p.locator('[role="tab"]').all()) {
    const box = await t.boundingBox();
    if (box && box.height < 44) basse.push(Math.round(box.height));
  }
  assert.deepEqual(basse, [], `queste linguette misurano ${basse.join(", ")} punti: sotto la misura del dito`);
  await p.close();
});

// ── AR-614 · il tema scuro ───────────────────────────────────────────────────

/** Il colore VERO del bordo di una card, come lo dipinge il browser dopo i fogli di stile. */
async function bordoDellaPrimaCard(p) {
  return p.locator('[data-test="riga-firma"]').first().evaluate((el) => {
    const card = el.closest(".card");
    return card ? getComputedStyle(card).borderColor : "";
  });
}

test("AR-614 · in tema scuro i bordi delle card NON restano quelli del tema chiaro", async () => {
  const chiaro = await browser.newPage({ ...SCRIVANIA, colorScheme: "light" });
  await chiaro.goto(URL_BASE + "/?a=azioni&s=approvare", { waitUntil: "networkidle", timeout: 90000 });
  await chiaro.waitForTimeout(2500);
  const bordoChiaro = await bordoDellaPrimaCard(chiaro);
  await chiaro.close();

  const scuro = await browser.newPage({ ...SCRIVANIA, colorScheme: "dark" });
  await scuro.goto(URL_BASE + "/?a=azioni&s=approvare", { waitUntil: "networkidle", timeout: 90000 });
  await scuro.waitForTimeout(2500);
  const bordoScuro = await bordoDellaPrimaCard(scuro);
  await scuro.close();

  assert.ok(bordoChiaro, "non ho trovato nessuna card da misurare: senza card questa prova non prova niente");
  assert.notEqual(
    bordoScuro,
    bordoChiaro,
    `il bordo è lo stesso nei due temi (${bordoChiaro}): sul fondo scuro resta il pastello del tema chiaro`,
  );
});

// ── AR-673 · il salto del collegamento diretto ───────────────────────────────

test("AR-673 · il collegamento all'auto-coscienza porta davvero la casella sott'occhio", async () => {
  const p = await browser.newPage(SCRIVANIA);
  await p.goto(URL_BASE + "/#auto-coscienza", { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(6000); // il salto è morbido e aspetta che i dati siano arrivati
  const riquadro = p.locator('[data-test="riquadro-auto-coscienza"]');
  assert.equal(await riquadro.count(), 1, "la casella dell'auto-coscienza non è nemmeno a schermo");
  const q = await riquadro.evaluate((el) => ({
    top: Math.round(el.getBoundingClientRect().top),
    scorsa: Math.round(window.scrollY),
    pagina: Math.round(document.body.scrollHeight),
    schermo: window.innerHeight,
  }));
  // «Dentro lo schermo» non basta e sarebbe una prova finta: la casella sta a 392 punti su una
  // pagina di 2683, quindi al primo colpo è già dentro un vetro alto 900 anche senza nessun salto.
  // Il salto vero si riconosce da due cose insieme: la pagina si è mossa, e la casella è finita in
  // cima. Misurato sul Pannello vero: scorsa 296, alto 96 (i 96 sono lo stacco voluto dal bordo).
  assert.ok(q.pagina > q.schermo + 200, `la pagina è troppo corta (${q.pagina}) per poter dire se il salto è avvenuto`);
  assert.ok(q.scorsa > 0, "la pagina non si è mossa di un punto: il salto non è avvenuto");
  assert.ok(q.top < 200, `la casella è ferma a ${q.top} punti dal bordo: non è stata portata sott'occhio`);
  await p.close();
});
