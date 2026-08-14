// AR-244 · AR-225 · AR-417 — LA PROVA SULLO SCHERMO: il Pannello vero, guidato da un browser vero.
//
// Perché a runtime e non solo con una funzione pura. Tre di questi difetti finiscono in pixel e in
// un indirizzo, cioè in cose che si vedono solo facendo girare l'app:
//  · AR-417 — la protezione per la barra del gesto dell'iPhone era scritta in quattro punti e non
//    faceva niente perché mancava una riga nella dichiarazione del viewport. La scheda lo dice
//    chiaro: «verificarlo per osservazione, non rileggendo il file» — era stata chiusa a occhio.
//  · AR-225 — la tabella dei numeri non ci sta in un telefono: la colonna «30 giorni» finiva fuori.
//    La cura è di forma (una scheda per KPI sotto `sm`), quindi la prova onesta è guardare lo
//    schermo largo 375 punti e misurare se qualcosa sborda.
//  · AR-244 — che l'indirizzo sappia nominare un posto lo prova `c2-indirizzo.test.mjs`; qui si
//    prova l'altra metà: che il Pannello lo LEGGA all'avvio e lo SCRIVA quando ci si sposta.
//
// Come si esegue: `node cervello/test/c2-schermo.test.mjs`. Se un Pannello gira già, lo usa
// (`PANNELLO_URL`); altrimenti se lo avvia da solo e alla fine lo spegne.
//
// ⚠️ Se il Pannello non parte, questo test è ROSSO — non verde con una scusa. «Non l'ho potuto
// vedere da qui» non è una prova che il difetto è chiuso.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Il percorso era scritto a mano — `/opt/node22/lib/node_modules/` — cioè la cartella di UNA
// macchina sola: la mia. In CI non esiste, quindi Playwright non si trovava e la prova moriva
// dicendo «rotto» quando il vero problema era «non ho potuto guardare». È la stessa forma di AR-329,
// il percorso finto dato per buono. Adesso si parte da questo file e si lascia decidere a Node.
const require = createRequire(import.meta.url);
const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");
const PORTA = Number(process.env.PANNELLO_PORT || 3939);
const URL_BASE = (process.env.PANNELLO_URL || `http://127.0.0.1:${PORTA}`).replace(/\/+$/, "");
// Telefono: è lì che questi tre difetti si vedono (safe-area, colonna fuori schermo, link ricevuto).
const TELEFONO = { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true };

let server = null;
let browser = null;

/**
 * C'è un browser da guidare, qui? In CI no: non c'è Playwright e non c'è il Pannello acceso.
 *
 * Lì la risposta onesta non è «rotto» — manderebbe a cercare un bug che non c'è — e nemmeno «a
 * posto», che dichiarerebbe provato ciò che nessuno ha guardato. È **⚪ non l'ho potuto vedere**, e
 * si dichiara uscendo con `1..0 # SKIP <perché>`, che il banco conta a parte e non come verde.
 * Dove il browser c'è (questa macchina, il VPS) il test gira per intero e un fallimento resta ROSSO.
 */
function browserDisponibile() {
  return Boolean(risolviPlaywright());
}

/**
 * Playwright può stare in tre case diverse: accanto al repo, dentro il Pannello, o installato per
 * tutta la macchina. Il percorso scritto a mano ne conosceva UNA — la terza, su questo contenitore —
 * e cercare solo lì o solo nelle prime due dà lo stesso errore da lati opposti. Le si prova tutte.
 */
function risolviPlaywright() {
  const case_ = [
    import.meta.url,
    join(RADICE, "pannello", "package.json"),
    join(RADICE, "package.json"),
    process.env.NODE_PATH || "",
    "/opt/node22/lib/node_modules/",
  ].filter(Boolean);
  for (const dove of case_) {
    try {
      return createRequire(dove)("playwright");
    } catch {
      /* la casa dopo */
    }
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

// Prima di qualunque cosa: se non c'è niente da guidare, si dichiara e si esce. Va fatto QUI, prima
// che `node:test` registri i casi — altrimenti il TAP contiene già dei test e il salto non si legge.
if (!browserDisponibile()) {
  console.log("TAP version 13");
  console.log("1..0 # SKIP nessun Playwright su questa macchina: i tre difetti di schermo (AR-225 safe-area, AR-417 colonna fuori schermo, AR-244 link che atterra) NON sono stati verificati qui");
  process.exit(0);
}

before(async () => {
  if (!(await raggiungibile())) {
    server = spawn("npm", ["run", "dev"], {
      cwd: join(RADICE, "pannello"),
      env: { ...process.env, PORT: String(PORTA) },
      stdio: "ignore",
      detached: true,
    });
    const scadenza = Date.now() + 180000;
    while (Date.now() < scadenza) {
      await new Promise((r) => setTimeout(r, 2000));
      if (await raggiungibile()) break;
    }
    assert.ok(await raggiungibile(), `il Pannello non risponde su ${URL_BASE}: non posso guardare, quindi non posso dire che è a posto`);
  }
  const { chromium } = risolviPlaywright();
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server?.pid) {
    try { process.kill(-server.pid); } catch {}
  }
});

/** Apre una pagina e restituisce {p, errori} — un errore in console È un risultato. */
async function apri(percorso, formato = TELEFONO) {
  const p = await browser.newPage(formato);
  const errori = [];
  p.on("pageerror", (e) => errori.push("PAGEERROR: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errori.push("CONSOLE: " + m.text().slice(0, 160)); });
  await p.goto(URL_BASE + percorso, { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(2000);
  return { p, errori };
}

/** Il tocco della barra laterale ha bisogno di spazio: sul telefono è dietro il menù a panino. */
const SCRIVANIA = { viewport: { width: 1280, height: 900 } };
/** La scheda accesa si riconosce dal fondo colorato del marchio. */
const attiva = (p, nome) => p.locator(`button.bg-brand:has-text("${nome}")`);

test("AR-417 · la pagina servita dichiara viewport-fit=cover (senza, la safe-area vale zero)", async () => {
  const { p } = await apri("/");
  const contenuto = await p.getAttribute('meta[name="viewport"]', "content");
  assert.ok(
    /viewport-fit\s*=\s*cover/.test(contenuto || ""),
    `il meta viewport servito è «${contenuto}»: senza viewport-fit=cover, su iPhone env(safe-area-inset-bottom) resta 0 e le quattro protezioni del Pannello sono inerti`,
  );
  await p.close();
});

test("AR-244 · un link con ?a=…&s=… atterra sull'area giusta, non sull'ultima visitata", async () => {
  const { p, errori } = await apri("/?a=numeri");
  // Il posto in cui deve atterrare: l'area Numeri, con il suo titolo a video.
  await p.waitForSelector("text=I numeri dell'azienda", { timeout: 20000 });
  assert.ok(p.url().includes("a=numeri"), `l'indirizzo non regge il caricamento: ${p.url()}`);
  assert.deepEqual(errori.filter((e) => e.startsWith("PAGEERROR")), []);
  await p.close();
});

test("AR-244 · IL DIFETTO: il link «approva dal Pannello» apre la coda da firmare", async () => {
  // È il caso vero della scheda: il messaggio Telegram porta a `<pannello>?a=azioni&s=approvare` e
  // Nicola deve trovarsi sulla coda da firmare, non sulla scheda di default dopo altri tre tocchi.
  const { p } = await apri("/?a=azioni&s=approvare", SCRIVANIA);
  await p.waitForSelector('button:has-text("Da approvare")', { timeout: 30000 });
  await p.waitForTimeout(2500);
  assert.equal(
    await attiva(p, "Da approvare").count(),
    1,
    "il link atterra sull'area ma non sulla scheda: la coda da firmare resta a tre tocchi di distanza",
  );
  assert.equal(await attiva(p, "Mosse di Nicola").count(), 0, "è rimasta aperta la scheda di default");
  // E l'indirizzo non si cancella da solo: il passaggio a quest'area non deve mangiarsi la scheda.
  assert.ok(p.url().includes("s=approvare"), `l'indirizzo si è auto-smontato: ${p.url()}`);
  await p.close();
});

test("AR-244 · spostandosi nel Pannello, l'indirizzo dice DOVE sei (prima restava com'era)", async () => {
  const { p } = await apri("/?a=numeri", SCRIVANIA);
  await p.waitForSelector("text=I numeri dell'azienda", { timeout: 30000 });
  // Vado altrove dal menù: l'indirizzo deve cambiare da solo. È l'esatto contrario del difetto,
  // dove ogni timbro riscriveva `pathname + search`, cioè lasciava l'indirizzo identico.
  await p.getByRole("button", { name: /^Azioni$/ }).first().click();
  await p.waitForFunction(() => window.location.search.includes("a=azioni"), null, { timeout: 20000 });
  // E anche la SCHEDA finisce nell'indirizzo: è la metà che rende il link incollabile.
  await p.waitForSelector('button:has-text("Da approvare")', { timeout: 30000 });
  await p.locator('button:has-text("Da approvare")').first().click();
  await p.waitForFunction(() => window.location.search.includes("s=approvare"), null, { timeout: 20000 });
  assert.ok(p.url().includes("a=azioni") && p.url().includes("s=approvare"), `indirizzo finale: ${p.url()}`);
  await p.close();
});

test("AR-248 · il cassetto chiuso non esiste nella pagina (prima era solo spinto fuori schermo)", async () => {
  // La prova a schermo di quello che `c2-cassetto.test.mjs` prova come decisione: a cassetto
  // chiuso il suo contenuto NON deve stare nella pagina. Prima c'era, spinto fuori dai bordi con
  // `-translate-x-full`, e ogni ridisegno se lo attraversava tutto.
  const { p, errori } = await apri("/?a=assistente");
  await p.waitForTimeout(2500);
  const intestazione = p.getByText("Conversazioni", { exact: true });
  assert.equal(await intestazione.count(), 0, "il cassetto chiuso è ancora montato nella pagina");
  const bottone = p.locator('[aria-label*="onversazioni"], button[title*="onversazioni"]').first();
  assert.ok(await bottone.count(), "non trovo il bottone che apre il cassetto");
  await bottone.click();
  await p.waitForTimeout(900);
  assert.equal(await intestazione.count(), 1, "aperto, il cassetto deve esserci davvero");
  assert.deepEqual(errori.filter((e) => e.startsWith("PAGEERROR")), []);
  await p.close();
});

test("AR-225 · su un telefono da 375 punti nessun numero resta fuori dallo schermo", async () => {
  const { p } = await apri("/?a=numeri");
  await p.waitForSelector("text=I numeri dell'azienda", { timeout: 20000 });
  // Apro una categoria a finestre (oggi/7g/30g): è quella che prima diventava una tabella da 420px.
  await p.getByRole("button", { name: /Marketplace/ }).first().click();
  await p.waitForTimeout(600);

  const schede = p.locator('[data-test="numeri-schede"]').first();
  await schede.waitFor({ state: "visible", timeout: 15000 });

  // 1) L'etichetta «30 giorni» — la colonna che restava fuori — adesso si vede.
  const eti = schede.getByText("30 giorni").first();
  await eti.waitFor({ state: "visible", timeout: 10000 });
  const box = await eti.boundingBox();
  assert.ok(box, "l'etichetta «30 giorni» non è disegnata");
  assert.ok(
    box.x >= 0 && box.x + box.width <= 375,
    `«30 giorni» sta fuori dallo schermo: da ${Math.round(box.x)} a ${Math.round(box.x + box.width)} su 375`,
  );

  // 2) La pagina non scorre di lato. Era il difetto: il dato c'era, dentro uno scorrimento
  //    orizzontale che su telefono non si vede nemmeno (la barra non si disegna).
  const misure = await p.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  assert.ok(
    misure.sw <= misure.cw + 1,
    `la pagina sborda di lato: ${misure.sw}px di contenuto in ${misure.cw}px di schermo`,
  );

  // 3) La tabella da 420px non è più quella che si vede sul telefono.
  const tabella = p.locator("table").first();
  if (await tabella.count()) {
    assert.equal(await tabella.isVisible(), false, "sul telefono deve comandare la lista a schede, non la tabella a 4 colonne");
  }
  await p.close();
});
