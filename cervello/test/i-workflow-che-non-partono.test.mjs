#!/usr/bin/env node
// 🧪 AR-780 — LE SEI CAPACITÀ GROSSE DELLA MACCHINA NON PARTIVANO. TUTTE E SEI.
//
// `radiografia`, `audit-design`, `auto-radiografia`, `audit-pannello`, `giro-operativo`,
// `radiografia-totale`: CLAUDE.md le nomina per nome nei comandi rapidi, e il motore le rifiutava
// tutte prima di eseguirne una riga. Il motivo è di una riga — `export const meta` dev'essere la
// PRIMA istruzione e non si accetta nessun import — e i sei file aprivano tutti con tre import.
//
// LA RADICE, che è la parte che conta: nessun guardiano aveva mai provato ad AVVIARE un workflow.
// I controlli esistenti misuravano il FILE — che passi dalla porta dei senior, che i deferral
// esistano, che il conteggio torni — e passavano tutti su uno script che il motore non accetterà
// mai. Si certificava l'installazione, non l'esecuzione. Per due mesi.
//
// ── E POI L'HO RIFATTA IO, un piano sotto ────────────────────────────────────────────────────
// Riparando, ho tolto gli import dai sei script e ho rilanciato il guardiano: verde, sei su sei.
// Ma quattro di quegli script continuavano a CHIAMARE le funzioni che gli import portavano
// (`promptSenior`, `radiceRepo`), e a runtime sarebbero morti su un ReferenceError. Il guardiano
// diceva «partono» di script che non partivano — la stessa malattia, nella stessa ora.
//
// Da lì la seconda regola: oltre alla prima istruzione si guarda se lo script NOMINA qualcosa che
// il motore non gli darà mai. I casi qui sotto sono costruiti: mordono anche quando i sei file
// veri sono a posto, che è il punto — una prova che dipende dallo stato di oggi misura la fortuna.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { GLOBALI_DEL_MOTORE, guarda, haImport, nomiAssenti, partirebbe } from "../workflow-partono.mjs";
import { bagaglioDelGiro } from "../prepara-giro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CARTELLA = join(REPO, ".claude", "workflows");

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ① LA REGOLA DEL MOTORE, sui casi costruiti
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("un import sopra `meta` è esattamente il difetto: lo script non parte", () => {
  const rotto = `import { existsSync } from 'node:fs'\n\nexport const meta = { name: 'x' }\n`;
  assert.equal(partirebbe(rotto), false, "è la forma che tutti e sei avevano");
  assert.equal(haImport(rotto), true);
});

test("commenti e righe vuote in cima non contano: quelli il motore li salta", () => {
  assert.equal(partirebbe(`// una spiegazione\n\n/* e un blocco */\n\nexport const meta = {}\n`), true);
});

test("un import in FONDO al file conta lo stesso", () => {
  const rotto = `export const meta = {}\nphase('x')\nimport { y } from './z.mjs'\n`;
  assert.equal(partirebbe(rotto), true, "la prima istruzione è giusta…");
  assert.equal(haImport(rotto), true, "…ma il motore non accetta import da nessuna parte");
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ② LA SECONDA REGOLA — il caso che mi è sfuggito
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("uno script SENZA import che però CHIAMA quello che l'import portava non parte lo stesso", () => {
  const finto = `export const meta = {}\nconst p = promptSenior('qa', { radice: radiceRepo() })\n`;
  assert.equal(partirebbe(finto), true, "la prima regola lo lascia passare…");
  assert.equal(haImport(finto), false, "…e di import non ce n'è…");
  const nomi = nomiAssenti(finto).map((x) => x.nome);
  assert.deepEqual(nomi.sort(), ["promptSenior", "radiceRepo"], "…ma a runtime muore su un ReferenceError");
});

test("ogni nome mancante esce col SUO motivo, non con un elenco muto", () => {
  for (const { nome, perche } of nomiAssenti(`export const meta = {}\nprocess.env.X\nexistsSync('y')\n`)) {
    assert.ok(perche && perche.length > 10, `${nome} deve dire perché non c'è`);
  }
});

test("un nome citato in un COMMENTO o in una stringa non è una chiamata", () => {
  const onesto = `export const meta = {}\n// qui non si può usare promptSenior: serve agentType\nconst t = 'radiceRepo() non esiste'\nlog(\`e nemmeno process.env\`)\n`;
  assert.deepEqual(nomiAssenti(onesto), [], "i sei file spiegano nei commenti proprio questi nomi");
});

test("una proprietà che si chiama come un globale non è quel globale", () => {
  assert.deepEqual(nomiAssenti(`export const meta = {}\nconst x = { process: 1 }\nx.process.toString()\n`), []);
});

test("il rilevatore non è cieco: quello che il motore DÀ non viene segnalato", () => {
  const buono = `export const meta = {}\nphase('a')\nconst r = await pipeline([1], (x) => agent('p', { agentType: 'qa' }))\nlog(String(args))\n`;
  assert.deepEqual(nomiAssenti(buono), []);
  for (const g of GLOBALI_DEL_MOTORE) assert.ok(typeof g === "string" && g.length);
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ③ I SEI FILE VERI
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("tutti i workflow di questo repo partirebbero davvero", () => {
  const e = guarda();
  assert.equal(e.misurato, true, e.motivo);
  assert.ok(e.script.length >= 6, `attesi almeno 6 script, trovati ${e.script.length}`);
  const dettaglio = e.rotti.map((f) => `${f}: ${(e.guai[f] || []).join(" · ")}`).join("\n  ");
  assert.deepEqual(e.rotti, [], `questi non partono:\n  ${dettaglio}`);
});

test("e ognuno dichiara chi lo esegue: `agentType`, non un mansionario incollato", () => {
  const senza = [];
  for (const f of readdirSync(CARTELLA)) {
    const testo = readFileSync(join(CARTELLA, f), "utf8");
    if (!testo.includes("agent(")) continue;
    if (!testo.includes("agentType")) senza.push(f);
  }
  assert.deepEqual(
    senza,
    [],
    "un workflow che chiama agent() senza agentType manda un senior generico al posto di quello del mestiere",
  );
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ④ IL BAGAGLIO — quello che il giro non può leggersi da solo
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("prepara-giro consegna il turno e i fatti, o dice che è cieco", () => {
  const b = bagaglioDelGiro();
  assert.ok(Array.isArray(b.turno), "il turno è una lista");
  assert.ok(Array.isArray(b.cieco), "e quello che non ha potuto misurare si dichiara");
  if (!b.turno.length) {
    assert.ok(b.cieco.length, "un turno vuoto senza motivo sarebbe un bagaglio che non si può consegnare");
  } else {
    for (const m of b.turno) assert.ok(m.key, "ogni senior in turno ha una chiave");
  }
});

test("il giro non indovina: senza turno in `args` si ferma invece di proporre le mosse sbagliate", () => {
  const src = readFileSync(join(CARTELLA, "giro-operativo.js"), "utf8");
  assert.match(src, /const preparato = args \|\| \{\}/, "il bagaglio arriva da fuori");
  assert.match(src, /if \(!turno\.length\)/, "e senza bagaglio ci si ferma");
  assert.match(src, /prepara-giro\.mjs/, "dicendo QUALE comando lo prepara");
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ⑤ IL COLLEGAMENTO — le tre regole sono provate, ma `guarda()` le CHIAMA tutte e tre? (27/8)
// ═══════════════════════════════════════════════════════════════════════════════════════════

test("AR-780 · `guarda()` applica anche la TERZA regola, non solo le prime due", () => {
  // Le tre regole avevano dodici casi fra loro e il loro collegamento nessuno: togliendo la riga
  // che chiama `nomiAssenti` dentro `guarda()` restava tutto verde, e il guardiano tornava a dire
  // «parte» di uno script che muore a runtime — che è ESATTAMENTE il difetto di AR-780, rimesso.
  const dir = mkdtempSync(join(tmpdir(), "wf-"));
  // Prima istruzione giusta, nessun import: passa le prime due regole. E chiama un nome che il
  // motore non dà: solo la terza regola può vederlo.
  writeFileSync(join(dir, "finto.js"), 'export const meta = { name: "x" }\nexistsSync("y")\n');
  const g = guarda(dir);
  assert.equal(g.misurato, true, g.motivo);
  assert.deepEqual(g.rotti, ["finto.js"], "lo script che muore a runtime è passato per buono");
  assert.match(g.guai["finto.js"].join(" "), /existsSync/, "il motivo non nomina la funzione che manca");
  rmSync(dir, { recursive: true, force: true });
});

test("AR-780 · e non è cieco al contrario: uno script sano non viene accusato", () => {
  const dir = mkdtempSync(join(tmpdir(), "wf-ok-"));
  writeFileSync(join(dir, "sano.js"), 'export const meta = { name: "x" }\nawait agent("ciao")\n');
  const g = guarda(dir);
  assert.deepEqual(g.rotti, [], "accusa uno script che il motore farebbe partire");
  rmSync(dir, { recursive: true, force: true });
});

test("AR-126 · i fatti del bagaglio si LEGGONO dal registro, non si scrivono a mano", () => {
  // La mutazione mette al posto della lettura un fatto fisso («Casa Linda payout-ready»): il giro
  // riceverebbe come vero un negozio faro che nessuno ha verificato. Si vede solo puntando il
  // bagaglio a una radice dove il registro NON c'è: chi legge dice «non ho potuto», chi se lo
  // scrive a mano risponde lo stesso.
  const dir = mkdtempSync(join(tmpdir(), "bag-"));
  const b = bagaglioDelGiro({ radice: dir });
  const testo = JSON.stringify(b.fatti ?? null);
  // Chi LEGGE, da una radice senza registro, dichiara di non aver letto — ed e' la risposta giusta:
  // meglio un fatto che dice «non dare per buono niente» del silenzio. Chi si scrive i fatti a mano
  // risponde lo stesso identico valore che ha in pancia, radice o non radice.
  assert.match(
    testo,
    /registro-non-letto|non trovato|NON let/i,
    `da una radice senza registro il bagaglio ha risposto con dei fatti veri: ${testo.slice(0, 220)}`,
  );
  assert.doesNotMatch(testo, /payout-ready|Pane Quotidiano/, "i fatti non seguono la radice: sono scritti a mano");
  rmSync(dir, { recursive: true, force: true });
});

test("AR-435 · la radice del bagaglio si CALCOLA, non si scrive a mano", () => {
  // Dichiarato: questo caso guarda il sorgente, e non e' per pigrizia. La radice scritta a mano che
  // la mutazione rimette (`/home/user/ad-mycity`) su QUESTA macchina e' quella giusta, quindi da
  // qui non esiste nessun comportamento che le distingua. Il danno arriva altrove — sul server, o
  // in una copia di lavoro — dove il giro leggerebbe l'albero sbagliato dicendo di aver letto il
  // suo. Il metro comportamentale ce l'ha il caso qui sopra: il bagaglio SEGUE la radice che gli
  // si dà. Questo aggiunge l'altra meta': la radice di default non e' una costante.
  const src = readFileSync(join(CARTELLA, "..", "..", "cervello", "prepara-giro.mjs"), "utf8");
  const firma = /export function bagaglioDelGiro\(\{\s*radice\s*=\s*([^}]+)\}/.exec(src);
  assert.ok(firma, "non trovo piu' la firma di bagaglioDelGiro: la prova e' cieca, non verde");
  assert.doesNotMatch(firma[1], /['"`]\//, `la radice di default e' un percorso scritto a mano: ${firma[1].trim()}`);
  assert.match(firma[1], /radiceRepo\(\)/, "la radice di default non si calcola piu'");
});

test("AR-435 · e il bagaglio SEGUE la radice che gli si dà", () => {
  // La meta' comportamentale: due radici diverse devono dare due bagagli diversi, o il parametro
  // non lo guarda nessuno e la radice di default e' l'unica cosa che conta.
  const dir = mkdtempSync(join(tmpdir(), "bag2-"));
  const finto = bagaglioDelGiro({ radice: dir });
  const vero = bagaglioDelGiro();
  assert.notDeepEqual(
    { t: finto.turno.length, c: finto.cieco.length },
    { t: vero.turno.length, c: vero.cieco.length },
    "una radice vuota e la radice vera danno lo stesso bagaglio: il parametro non lo guarda nessuno",
  );
  rmSync(dir, { recursive: true, force: true });
});
