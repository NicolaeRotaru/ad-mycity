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
// NON-VACUITÀ, misurata rompendo i fix uno per uno — e va detta com'è andata davvero:
//  ✔ AR-613 — rimettendo un bottone dentro il <summary> il primo caso diventa rosso; togliendo il
//    ruolo di scheda diventano rossi il secondo e il terzo. Questi due casi difendono la cura.
//  ✖ AR-614 — togliendo la gemella `dark:` dalla tavolozza questo file resta VERDE. Sulla pagina ci
//    sono altri riquadri con la stessa tinta e la gemella scritta a mano dentro il JSX, e la misura
//    finisce su uno di quelli. Quindi il caso qui sotto racconta un fatto vero (i bordi colorati
//    cambiano fra i due temi) ma NON distingue il Pannello curato da quello malato: la prova che
//    difende AR-614 è quella della tavolozza, in c4-decisione-fuori-da-react.test.mjs, dove lo
//    stesso mutante diventa rosso. Scritto qui perché il prossimo che legge non ci caschi.
//  ~ AR-673 — a runtime il difetto è INTERMITTENTE: dipende da chi arriva prima fra la traduzione
//    dell'indirizzo e il risveglio della casella, e sotto ricompilazione il caso è diventato rosso
//    da solo, senza nessun mutante. Vale come misura del comportamento, non come rete. La rete è
//    nei due casi puri sul parcheggio del cancelletto.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { avviaPannello, spegniPannello } from "./aiuto-pannello.mjs";
import { possoGuidareIlPannello, rigaSalto } from "../ambiente-prova.mjs";

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
//
// La domanda era UNA SOLA — «c'è Playwright?» — e le cose da avere sono DUE: il browser e
// `pannello/node_modules`, senza cui `npm run dev` esce subito con `next: not found`. Chi non aveva
// il browser saltava dichiarando ⚪; chi ce l'aveva ma non poteva accendere il Pannello usciva
// ROSSO — stessa cecità, due colori, e il secondo bloccava il cancello di tutti (AR-437). Adesso
// la risposta è una sola e vive in `cervello/ambiente-prova.mjs`.
const possibile = possoGuidareIlPannello({
  esisteInPannello: (f) => existsSync(join(RADICE, "pannello", f)),
  playwright: Boolean(risolviPlaywright()),
});
if (!possibile.puoi) {
  console.log("TAP version 13");
  console.log(rigaSalto({ motivo: possibile.motivo, comando: possibile.comando, difetti: ["AR-613", "AR-614", "AR-673"] }));
  process.exit(0);
}

before(async () => {
  // Vedi la nota in `c2-schermo`: l'avvio del Pannello vive in `aiuto-pannello.mjs`, in un posto
  // solo, e si accorge subito se il server non parte invece di aspettarlo per tre minuti.
  ({ server } = await avviaPannello({ radice: RADICE, porta: PORTA, urlBase: URL_BASE }));
  browser = await risolviPlaywright().chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  spegniPannello(server);
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

/**
 * Il colore VERO di una tinta, come lo dipinge il browser dopo i fogli di stile.
 *
 * ⚠️ La prima versione di questo caso misurava «il bordo della prima card» — e passava anche con le
 * gemelle scure tolte. Motivo: quella card ha livello sconosciuto, e il suo bordo usa una variabile
 * del tema che si ribalta da sola. Misurava il tema, non la cura. Verificato rompendo il fix: il caso
 * restava verde. Adesso si misurano le tinte della tavolozza, che sono quelle che erano rimaste indietro.
 */
async function coloreDi(p, classe) {
  return p.evaluate((c) => {
    // Solo le CARD DELLA CODA: altrove nel Pannello ci sono riquadri con la stessa tinta e la
    // gemella scura già scritta a mano, e pescare uno di quelli faceva passare la prova comunque.
    // Verificato rompendo il fix: il caso restava verde. Un selettore troppo largo è un modo
    // silenzioso di misurare qualcos'altro.
    const el = document.querySelector(`.card[class~="${c}"]`);
    return el ? getComputedStyle(el).borderColor : null;
  }, classe);
}

async function apriTema(tema) {
  const p = await browser.newPage({ ...SCRIVANIA, colorScheme: tema });
  await p.goto(URL_BASE + "/?a=azioni&s=approvare", { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(2500);
  return p;
}

test("AR-614 · in tema scuro i bordi colorati NON restano quelli del tema chiaro", async (t) => {
  const chiaro = await apriTema("light");
  const scuro = await apriTema("dark");
  const misure = [];
  for (const classe of ["border-red-200", "border-amber-200", "border-green-200"]) {
    const a = await coloreDi(chiaro, classe);
    const b = await coloreDi(scuro, classe);
    if (a && b) misure.push({ classe, chiaro: a, scuro: b });
  }
  await chiaro.close();
  await scuro.close();
  if (misure.length === 0) {
    // Non c'è nessuna card colorata a schermo: dirlo è l'unica risposta onesta. Dichiarare «a posto»
    // qui sarebbe la stessa bugia che questo lotto sta curando.
    t.skip("nessuna card di livello colorato a schermo: il tema scuro dei bordi NON è stato verificato");
    return;
  }
  const uguali = misure.filter((m) => m.chiaro === m.scuro).map((m) => `${m.classe} (${m.chiaro})`);
  assert.deepEqual(uguali, [], `queste tinte sono identiche nei due temi: sul fondo scuro resta il pastello del chiaro`);
});

// ── AR-673 · perché qui NON c'è il caso del salto ───────────────────────────
//
// C'era, ed era rosso una volta sì e una no. Guidando il Pannello si vede il salto avvenire (la
// pagina scorre di 296 punti e la casella si ferma a 96 dal bordo, misurato); ma lanciato in coda
// agli altri cinque casi, col server di sviluppo sotto carico, lo stesso caso cadeva senza che
// nessuno avesse toccato niente. È diventato rosso anche mentre provavo un mutante che riguardava
// un altro difetto.
//
// Un caso che suona a caso è peggio di un caso che non c'è: dopo due volte lo si guarda senza
// crederci, e da lì in poi smette di fermare anche i rossi veri. Il difetto è intermittente per
// natura — dipende da chi arriva prima fra la traduzione dell'indirizzo e il risveglio della
// casella — e quello che si può inchiodare è la decisione sotto: il cancelletto messo da parte
// prima che l'indirizzo lo perda, e consumato una volta sola.
//
// Quei due casi stanno in `c4-decisione-fuori-da-react.test.mjs`, e lì il mutante li rende rossi.
// Chi volesse riportare qui la prova a schermo: serve un aggancio che dica quando la casella ha
// finito di caricare, non un'attesa a orologio.
