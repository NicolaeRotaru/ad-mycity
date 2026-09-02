#!/usr/bin/env node
// 🧪 AR-797 (nasce da AR-506 · AR-514) — UN PASSO DEL CANCELLO HA DUE CASE, E NELLA SECONDA NON
// LO PROVA NESSUNO PRIMA DI CONSEGNARLO.
//
// Questo file è la prova a comando della scheda AR-797: la nomina qui perché una prova che non
// nomina il difetto che dimostra gira, esce 0 e non guarda più niente il giorno in cui il caso si
// sposta altrove.
//
// IL BANCO PROVA LA FUNZIONE, IL CANCELLO ESEGUE LO SCRIPT, E FRA I DUE C'È LA CASA. In tutti i casi
// misurati la prova era verde e il passo sul runner non lo era: l'ancora del turno che lì non esiste
// mai (AR-506), le trascrizioni della chat che lì non ci sono (AR-514). Ogni volta il ⚪ di un passo
// solo diventava, alla riga `if (ciechi.length || ciechiProve.length) process.exit(2)`, il rosso di
// tutti.
//
// ⚠️ QUI DENTRO NON C'È PIÙ AR-511, ED È VOLUTO. La domanda «il passo nuovo sa diventare rosso lì?»
// è stata AMPUTATA alla terza consegna: si comprava puntando la mutazione sul guardiano stesso
// invece che su ciò che sorveglia (misurato: stesso md5 dello script malato, verde in sei righe di
// JSON), pretendeva una convenzione che la casa non usa (719 mutazioni su 727 puntano a un file di
// prova) e nasceva rossa accusando i freni fratelli del suo stesso lotto. Il perché completo, con
// le misure e la forma che avrebbe dovuto avere, sta in testa a `cervello/due-case.mjs`. Qui basti:
// **il verde che ha guardato zero non lo prende più nessuno, ed è un buco dichiarato, non coperto.**
//
// ⚠️ PERCHÉ QUESTO BANCO È RIFATTO DA CAPO. La prima versione del freno leggeva una CARTA scritta a
// mano, e le sue venticinque prove erano venticinque prove del VOCABOLARIO: negli «AR-514 rigiocato»
// lo script finto era letteralmente `process.exit(0);` — innocente — e a far scattare il rosso era
// una parola nella carta. Due verifiche avversariali hanno scritto lo script col difetto VERO e il
// freno l'ha benedetto. Da qui la regola di questo file: **ogni caso di questo banco costruisce uno
// script che HA il difetto e pretende il rosso sul comportamento, mai su una dichiarazione.**
//
// ⚠️ IL BANCO NON EREDITA L'AMBIENTE SPORCO. Ogni figlio parte da un ambiente ripulito delle
// variabili di questo freno (`envPulito`). È l'accusa misurata alla terza verifica: con
// `DUE_CASE_DENTRO=1` addosso — la cintura anti-ricorsione, che finiva sui figli — 7 dei 24 casi
// diventavano rossi, e da lì nasceva l'accusa falsa «la suite nasce rotta». Il caso «il banco non si
// avvelena da solo» rilancia questo stesso file con quella variabile addosso e pretende il verde.
//
// ⚠️ Il repo vero non si tocca: ogni caso costruisce un albero git suo in cartella temporanea. Le
// uniche due letture sul repo vero sono volute — il freno deve NASCERE VERDE qui, e il perimetro
// deve DERIVARE dal cancello vero e non da un elenco inventato.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { censimentoDelCancello, costruisciCasaSpoglia, esitoFinale, maiProvabile, misuraIlPasso, passiDelCancello, percorsoDiMe, piano, quantoPosso, statoDelPasso, tettoDaScrivere, verdettoDueCase, verdettoTetto } from "../due-case.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MOTORE = join(REPO, "cervello/due-case.mjs");
const IO = fileURLToPath(import.meta.url);

// ─────────────────────────────────────────────────────────────────────────────
// L'ATTREZZATURA: un cancello finto con dentro script VERI, in un repo git vero.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le variabili che questo freno usa per parlare con se stesso non devono entrare nei figli del
 * banco. Erano il modo in cui il banco si avvelenava da solo: `DUE_CASE_DENTRO=1` è la cintura
 * anti-ricorsione, e con quella addosso il motore non misura NIENTE ed esce 2 — sette casi rossi
 * per un difetto che non c'era. Misurato: 17 pass / 7 fail.
 */
const VARIABILI_MIE = ["DUE_CASE_DENTRO", "DUE_CASE_TETTO_FILE", "DUE_CASE_TIMEOUT", "DUE_CASE_BUDGET", "AD_REPO", "LOTTO_PERIMETRO"];
function envPulito(extra = {}) {
  const e = { ...process.env };
  for (const k of VARIABILI_MIE) delete e[k];
  return { ...e, ...extra };
}

const git = (radice, ...args) => spawnSync("git", args, { cwd: radice, encoding: "utf8", timeout: 60_000 });

function radiceNuova() {
  const r = mkdtempSync(join(tmpdir(), "due-case-banco-"));
  mkdirSync(join(r, "cervello"), { recursive: true });
  writeFileSync(join(r, ".gitignore"), "**/_tmp_*\n", "utf8");
  return r;
}

/**
 * Scrive il cancello finto: la stessa forma `esegui("nome", "cmd", [args], {opzioni})` di quello
 * vero. Le opzioni servono al caso del TIMEOUT: il prezzo che il cancello dichiara di pagare per un
 * passo è un fatto del suo codice, e il freno lo legge da lì.
 */
function scriviCancello(radice, passi) {
  const righe = ['function esegui(nome, cmd, args, opts = {}) { return { nome, cmd, args, opts }; }', "const passi = [];"];
  for (const p of passi) {
    const opzioni = Number.isFinite(p.timeout) ? `, { timeout: ${p.timeout} }` : "";
    righe.push(`passi.push(esegui(${JSON.stringify(p.nome)}, ${JSON.stringify(p.comando || "node")}, [${(p.argomenti || []).map((a) => JSON.stringify(a)).join(", ")}]${opzioni}));`);
  }
  writeFileSync(join(radice, "cervello/cancello-lotto.mjs"), `${righe.join("\n")}\n`, "utf8");
}

const scriviTetto = (radice, tetto) => writeFileSync(join(radice, "cervello/due-case.json"), `${JSON.stringify({ tetto_mai_provabili: tetto, mai_provabili: [] }, null, 2)}\n`, "utf8");
const leggiTetto = (radice) => JSON.parse(readFileSync(join(radice, "cervello/due-case.json"), "utf8")).tetto_mai_provabili;
const commit = (radice) => {
  git(radice, "init", "-q", ".");
  git(radice, "add", "-A");
  git(radice, "-c", "user.email=banco@mycity", "-c", "user.name=banco", "commit", "-q", "-m", "base");
};

const lancia = (radice, args = [], env = {}) =>
  spawnSync(process.execPath, [MOTORE, ...args], { cwd: REPO, encoding: "utf8", timeout: 240_000, env: envPulito({ AD_REPO: radice, ...env }) });

const tutto = (r) => `${r.stdout || ""}${r.stderr || ""}`;

/** Mette dentro l'albero di prova il freno vero e tutto ciò che importa: serve ai casi «io». */
function copiaIlFreno(radice) {
  const serve = new Set();
  const scendi = (f) => {
    if (serve.has(f)) return;
    serve.add(f);
    for (const m of readFileSync(join(REPO, "cervello", f), "utf8").matchAll(/from "\.\/([^"]+)"/g)) scendi(m[1]);
  };
  scendi("due-case.mjs");
  for (const f of serve) copyFileSync(join(REPO, "cervello", f), join(radice, "cervello", f));
}

/**
 * Lo script di AR-514: legge le trascrizioni della chat sotto HOME, e senza esce 2. Il difetto VERO.
 *
 * La HOME del caso è una cartella temporanea che il banco riempie, MAI quella di chi lancia le
 * prove: su un runner GitHub `~/.claude` non esiste, e un caso che desse per scontata la casa di
 * questa macchina sarebbe rosso là per l'ambiente invece che per il codice — cioè AR-437 dentro il
 * banco che cura AR-514.
 */
const SPIA_CHAT = `import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
if (!existsSync(join(homedir(), ".claude", "projects"))) { console.error("⚪ non ho le trascrizioni della chat"); process.exit(2); }
console.log("✅ contate le trascrizioni");
process.exit(0);
`;

/** Una HOME finta con dentro le trascrizioni: è la casa di QUI, quella che il runner non ha. */
function homeConLeTrascrizioni() {
  const h = mkdtempSync(join(tmpdir(), "due-case-home-"));
  mkdirSync(join(h, ".claude", "projects"), { recursive: true });
  return h;
}

/** Lo script di AR-506: legge un file che vive FUORI da git, e senza esce 2. */
const SPIA_ANCORA = `import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
if (!existsSync(join(dirname(fileURLToPath(import.meta.url)), "_tmp_stop-ancora.json"))) { console.error("⚪ CIECO: non trovo l'ancora del turno"); process.exit(2); }
console.log("✅ verdetti tutti letti");
process.exit(0);
`;

/** Il sano: legge l'ALBERO DI LAVORO, che sul runner c'è. Verde in tutte e due le case. */
const SPIA_ALBERO = `import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const f = join(dirname(fileURLToPath(import.meta.url)), "sorvegliato.mjs");
if (readFileSync(f, "utf8").includes("ROTTO")) { console.error("❌ la regola è rotta"); process.exit(1); }
console.log("✅ la regola è a posto");
process.exit(0);
`;

const SORVEGLIATO = 'export const REGOLA = "sana";\n';

// ─────────────────────────────────────────────────────────────────────────────
// IL FRENO NASCE USABILE — la domanda che i referti hanno posto per prima.
// ─────────────────────────────────────────────────────────────────────────────

test("sul repo vero il freno NON nasce rosso per chi lo aggancia (0 se la storia c'è, ⚪ se è mozza)", () => {
  // Non pretende il VERDE, e il perché è la differenza fra un freno onesto e uno comodo: su un clone
  // superficiale — la forma normale di questa macchina — il perimetro collassa su HEAD e la domanda
  // delle due case non si può nemmeno porre. Lì la risposta giusta è ⚪, non 0: un verde che non ha
  // rilanciato niente è il verde muto che questo file esiste per non fare. Rosso, però, no: un freno
  // che nasce rosso blocca il cancello a tutti nel momento in cui lo attacchi.
  const r = spawnSync(process.execPath, [MOTORE], { cwd: REPO, encoding: "utf8", timeout: 300_000, env: envPulito() });
  assert.notEqual(r.status, 1, `il freno non deve nascere ROSSO sul parco attuale, invece:\n${tutto(r)}`);
  assert.ok([0, 2].includes(r.status), `e deve rispettare il contratto (0 o 2), invece è ${r.status}:\n${tutto(r)}`);
  if (r.status === 2) assert.ok(tutto(r).includes("storia è troncata") || tutto(r).includes("non l'ho potuto misurare"), `un ⚪ deve dire perché:\n${tutto(r)}`);
});

test("il perimetro si DERIVA dal cancello vero, e non è una lista vuota", () => {
  const passi = passiDelCancello(readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8"));
  assert.ok(passi.length >= 20, `dal cancello devono uscire i passi veri, ne ho trovati ${passi.length}`);
  const nomi = passi.map((p) => p.nome);
  assert.ok(nomi.includes("verdetti senza lettore"), "manca il passo di AR-506");
  assert.equal(new Set(nomi).size, nomi.length, "un passo non deve comparire due volte");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⓐ LE DUE CASE — con lo script che HA il difetto, non con una carta che lo dichiara.
// ─────────────────────────────────────────────────────────────────────────────

test("AR-514 rigiocato: uno script che legge le trascrizioni della chat NASCE ROTTO", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  // Il lotto aggiunge il passo malato: lo script c'è davvero, e in casa esce 0.
  writeFileSync(join(r, "cervello/spia-chat.mjs"), SPIA_CHAT, "utf8");
  scriviCancello(r, [{ nome: "contatore del blocco mancante", argomenti: ["cervello/spia-chat.mjs"] }]);
  const casa = homeConLeTrascrizioni();
  const inCasa = spawnSync(process.execPath, [join(r, "cervello/spia-chat.mjs")], { cwd: r, encoding: "utf8", timeout: 30_000, env: envPulito({ HOME: casa, USERPROFILE: casa }) });
  assert.equal(inCasa.status, 0, "in casa questo script è verde: è proprio questo che rende il difetto invisibile");

  const v = lancia(r, [], { HOME: casa, USERPROFILE: casa });
  assert.equal(v.status, 1, `il freno deve diventare ROSSO, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("NASCE ROTTO"), `deve dire che nasce rotto:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
  rmSync(casa, { recursive: true, force: true });
});

test("AR-506 rigiocato: uno script che legge un file fuori da git NASCE ROTTO", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/_tmp_stop-ancora.json"), '{"turno":7}\n', "utf8");
  writeFileSync(join(r, "cervello/cancello-stop.mjs"), SPIA_ANCORA, "utf8");
  scriviCancello(r, [{ nome: "verdetti senza lettore", argomenti: ["cervello/cancello-stop.mjs"] }]);
  const inCasa = spawnSync(process.execPath, [join(r, "cervello/cancello-stop.mjs")], { cwd: r, encoding: "utf8", timeout: 30_000, env: envPulito() });
  assert.equal(inCasa.status, 0, "in casa l'ancora c'è e il passo è verde");

  const v = lancia(r);
  assert.equal(v.status, 1, `il freno deve diventare ROSSO, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("NASCE ROTTO"), `deve dire che nasce rotto:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("un passo SANO passa: verde in tutte e due le case", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/sorvegliato.mjs"), SORVEGLIATO, "utf8");
  writeFileSync(join(r, "cervello/spia-albero.mjs"), SPIA_ALBERO, "utf8");
  scriviCancello(r, [{ nome: "spia dell albero", argomenti: ["cervello/spia-albero.mjs"] }]);

  const v = lancia(r);
  assert.equal(v.status, 0, `un passo sano deve passare, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("verde anche nella casa spoglia"), `deve dire di averlo rilanciato:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("rilanciati nella casa spoglia: 1"), `e di averlo rilanciato UNA volta:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// LE SCAPPATOIE CHE HANNO UCCISO LE VERSIONI PRECEDENTI — una per una, rigiocate.
// ─────────────────────────────────────────────────────────────────────────────

test("nessun comando del freno spegne l'accusa: né --aggiorna-tetto né una voce scritta a mano", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/spia-chat.mjs"), SPIA_CHAT, "utf8");
  scriviCancello(r, [{ nome: "contatore del blocco mancante", argomenti: ["cervello/spia-chat.mjs"] }]);
  const casa = homeConLeTrascrizioni();
  assert.equal(lancia(r, [], { HOME: casa, USERPROFILE: casa }).status, 1, "parto da un rosso");

  // ① l'unico comando che scrive qualcosa: il tetto.
  assert.equal(lancia(r, ["--aggiorna-tetto"]).status, 0, "il comando del tetto gira");
  assert.equal(lancia(r, [], { HOME: casa, USERPROFILE: casa }).status, 1, "dopo --aggiorna-tetto l'accusa deve essere ancora lì");

  // ② la voce scritta a mano nel file del tetto — la mossa che nella prima versione comprava il verde.
  writeFileSync(join(r, "cervello/due-case.json"), `${JSON.stringify({ tetto_mai_provabili: 99, mai_provabili: [{ passo: "contatore del blocco mancante", motivo: "fidati, va bene" }] }, null, 2)}\n`, "utf8");
  const dopo = lancia(r, [], { HOME: casa, USERPROFILE: casa });
  assert.equal(dopo.status, 1, `una voce scritta a mano non compra il verde, invece:\n${tutto(dopo)}`);
  assert.ok(tutto(dopo).includes("NASCE ROTTO"), "l'accusa deve restare la stessa");
  rmSync(r, { recursive: true, force: true });
  rmSync(casa, { recursive: true, force: true });
});

test("il verdetto guarda i CODICI D'USCITA: nessun campo dichiarato lo può spostare", () => {
  // La terza uscita della prima versione: spostare una parola da `legge` a `legge_se_c_e` spegneva
  // l'accusa senza cambiare un byte dello script. Qui la decisione ha per ingresso due numeri soli:
  // qualunque campo dichiarativo le si appenda accanto, il verdetto non si muove.
  const nudo = verdettoDueCase({ casa: 0, spoglia: 2 });
  const vestito = verdettoDueCase({ casa: 0, spoglia: 2, legge: ["git-tracciato"], legge_se_c_e: ["trascrizioni-chat"], sola_lettura: true, casa_ci: "verde" });
  assert.equal(nudo.esito, "nasce-rotto");
  assert.equal(vestito.esito, "nasce-rotto", "una dichiarazione appesa accanto non deve spostare il verdetto");
  assert.equal(verdettoDueCase({ casa: 0, spoglia: 0 }).esito, "ok");
  assert.equal(verdettoDueCase({ casa: 1, spoglia: 1 }).esito, "gia-rosso-in-casa", "un passo già rosso in casa non è affare di questo freno");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⚪ NON È ❌, E ⚪ NON È ✅ — il contratto di casa (AR-322), che la prima versione violava.
// ─────────────────────────────────────────────────────────────────────────────

test("VERDE MUTO: se non ha riconosciuto nessun passo, esce ⚪ e non 0", () => {
  const r = radiceNuova();
  writeFileSync(join(r, "cervello/cancello-lotto.mjs"), "const passi = [];\n", "utf8");
  scriviTetto(r, 0);
  commit(r);
  const v = lancia(r);
  assert.equal(v.status, 2, `zero passi guardati non è un verde, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("Non chiamo verde questo"), "deve dirlo a voce");
  rmSync(r, { recursive: true, force: true });
});

test("esitoFinale: il ⚪ non si maschera da verde e il rosso non si maschera da ⚪", () => {
  assert.equal(esitoFinale({ censiti: 0 }).codice, 2, "niente censito = cieco");
  assert.equal(esitoFinale({ censiti: 22, nonMisurati: [{ passo: "x" }] }).codice, 2, "un passo non misurato = cieco");
  assert.equal(esitoFinale({ censiti: 22, rossi: [{ passo: "x" }] }).codice, 1, "un passo rotto = rosso");
  assert.equal(esitoFinale({ censiti: 22, rossi: [{ passo: "x" }], nonMisurati: [{ passo: "y" }] }).codice, 1, "il rosso vince sul cieco");
  assert.equal(esitoFinale({ censiti: 22 }).codice, 0, "misurato e pulito = verde");
});

test("il buco dichiarato si LEGGE nell'uscita: chi consegna deve sapere cosa il verde non copre", () => {
  // L'amputazione della domanda ⓑ toglie AR-511 dalla copertura. Un buco che sta solo nel commento
  // in testa al file è un buco che nessuno legge: deve stare sotto il verdetto, a ogni corsa.
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/sorvegliato.mjs"), SORVEGLIATO, "utf8");
  writeFileSync(join(r, "cervello/spia-albero.mjs"), SPIA_ALBERO, "utf8");
  scriviCancello(r, [{ nome: "spia dell albero", argomenti: ["cervello/spia-albero.mjs"] }]);
  const v = lancia(r);
  assert.equal(v.status, 0);
  assert.ok(tutto(v).includes("AR-511"), `il verde deve dichiarare che AR-511 non lo copre:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("VERDE CHE HA GUARDATO ZERO"), `e deve dirlo in parole, non con una sigla:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// LA RICORSIONE — il bloccante che la prima versione non aveva nemmeno dichiarato.
// ─────────────────────────────────────────────────────────────────────────────

test("il piano ESCLUDE se stesso: togli quella riga e questo caso diventa rosso", () => {
  const passi = passiDelCancello('passi.push(esegui("le due case", "node", ["cervello/due-case.mjs"]));');
  const p = piano(passi, [], { seStesso: "cervello/due-case.mjs", leggiOra: () => "codice", leggiPrima: () => null });
  assert.equal(p.length, 1);
  assert.equal(p[0].stato, "io", "il passo che lancia questo file dev'essere riconosciuto come «io»");
  assert.equal(p[0].provare, false, "un freno che rilancia se stesso non torna più indietro: 992 processi annidati, misurati");
  // E senza l'esclusione lo stesso passo sarebbe da provare: è la prova che la riga fa qualcosa.
  const senza = piano(passi, [], { seStesso: null, leggiOra: () => "codice", leggiPrima: () => null });
  assert.equal(senza[0].provare, true, "senza l'esclusione quel passo verrebbe rilanciato — ed è l'esplosione");
});

test("agganciato a SE STESSO nel cancello, il freno torna indietro e lo dice", () => {
  // L'accusa misurata sulla prima versione: incollata la riga per il cancello, `node
  // cervello/due-case.mjs` non tornava più (rc=124 col cronometro esterno, 204 processi vivi dopo
  // 20 secondi). Qui il freno vero viene messo in un albero dove il cancello lo nomina.
  const r = radiceNuova();
  copiaIlFreno(r);
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  scriviCancello(r, [{ nome: "le due case del passo nuovo", argomenti: ["cervello/due-case.mjs"] }]);

  const v = spawnSync(process.execPath, [join(r, "cervello/due-case.mjs")], { cwd: r, encoding: "utf8", timeout: 90_000, env: envPulito() });
  assert.notEqual(v.status, null, `il freno agganciato a se stesso deve TORNARE, non essere ucciso dall'orologio:\n${tutto(v)}`);
  assert.equal(v.status, 0, `e non deve nascere rosso nel momento in cui lo attacchi:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("NON MI PROVO DA SOLA"), `l'esclusione si deve VEDERE, o è indistinguibile da un passo provato:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("mi riconosco anche quando il repo da giudicare non è quello in cui vivo", () => {
  // Misurato durante la terza riparazione: con `AD_REPO` puntato altrove, `relative(repo, io)`
  // tornava un `../../tmp/...` che non assomigliava a nessun passo. Il passo col MIO nome finiva
  // rilanciato, il figlio usciva 2 per via della seconda cintura, e il freno accusava «nasce rotto»
  // se stesso — un rosso falso della stessa famiglia che questo file cura.
  assert.equal(percorsoDiMe("/altrove", "/casa/mia/cervello/due-case.mjs", "/casa/mia"), "cervello/due-case.mjs", "fuori dal mio repo vale il nome che ho in casa mia");
  assert.equal(percorsoDiMe("/casa/mia", "/casa/mia/cervello/due-case.mjs", "/casa/mia"), "cervello/due-case.mjs", "dentro il mio repo è il percorso relativo di sempre");

  const r = radiceNuova();
  copiaIlFreno(r);
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  scriviCancello(r, [{ nome: "le due case del passo nuovo", argomenti: ["cervello/due-case.mjs"] }]);
  // Qui il motore gira DAL repo vero con AD_REPO che punta all'albero di prova: la configurazione
  // in cui la prima cintura si rompeva.
  const v = lancia(r);
  assert.equal(v.status, 0, `non devo accusare me stessa nemmeno con AD_REPO puntato altrove:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("NON MI PROVO DA SOLA"), `e devo dirlo:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("rilanciati nella casa spoglia: 0"), `senza rilanciare niente:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("la seconda cintura: dentro una casa spoglia il freno non esegue nessuno", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/spia-chat.mjs"), SPIA_CHAT, "utf8");
  scriviCancello(r, [{ nome: "contatore del blocco mancante", argomenti: ["cervello/spia-chat.mjs"] }]);

  const casa = homeConLeTrascrizioni();
  const figlio = lancia(r, [], { DUE_CASE_DENTRO: "1", HOME: casa, USERPROFILE: casa });
  assert.equal(figlio.status, 2, `un figlio non misura e lo dichiara ⚪, invece:\n${tutto(figlio)}`);
  assert.ok(tutto(figlio).includes("non rilancio nessuno"), "deve dire perché non ha misurato");
  rmSync(r, { recursive: true, force: true });
  rmSync(casa, { recursive: true, force: true });
});

test("il banco non si avvelena da solo: con DUE_CASE_DENTRO=1 addosso i casi restano veri", () => {
  // L'accusa misurata: `DUE_CASE_DENTRO=1 node cervello/test/due-case.test.mjs` → 17 pass, 7 fail.
  // La cintura anti-ricorsione passava ai figli del BANCO, il motore non misurava niente e usciva 2,
  // e sette casi diventavano rossi per un difetto che non esisteva. Da lì l'accusa falsa «la suite
  // del cervello nasce rotta», e un cancello rosso per tutti.
  if (process.env.DUE_CASE_BANCO_DENTRO === "1") return; // il figlio non rilancia il banco: uno solo di profondità
  const dentro = spawnSync(process.execPath, [IO], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 600_000,
    env: { ...process.env, DUE_CASE_DENTRO: "1", DUE_CASE_BANCO_DENTRO: "1" },
  });
  assert.equal(dentro.status, 0, `il banco deve restare verde con l'ambiente sporco addosso, invece:\n${tutto(dentro).split("\n").slice(-40).join("\n")}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// LA CASA SPOGLIA È DAVVERO SPOGLIA — la prima versione non spogliava l'indice di git.
// ─────────────────────────────────────────────────────────────────────────────

test("CURA ① — i quattro guardiani veri del cancello NON nascono rotti nella casa spoglia", () => {
  // IL CASO CHE CHIUDE L'ACCUSA PIÙ GRAVE, e usa il repo VERO apposta: la casa spoglia fingeva un
  // clone superficiale senza `origin/main` e senza il ramo `main`, e quattro guardiani onesti del
  // cancello uscivano 2 lì dentro SOLO per quello. Misurato prima della cura: exit 2 tutti e quattro
  // («origin/main non raggiungibile», «nessun origin/main da cui contare», «né su origin/main né su
  // main», «CIECO: clone superficiale»). Il grilletto era una riga di commento in fondo a uno di
  // loro. Se questo caso torna rosso, o la casa ha ripreso a fingere, oppure quel guardiano è rotto
  // davvero: lancialo a mano nella cartella che il messaggio stampa.
  const base = mkdtempSync(join(tmpdir(), "due-case-runner-"));
  const casa = join(base, "casa-spoglia");
  const home = join(base, "home");
  mkdirSync(casa, { recursive: true });
  mkdirSync(home, { recursive: true });
  const esito = costruisciCasaSpoglia(REPO, casa);
  assert.equal(esito.ok, true, `la casa spoglia del repo vero si deve costruire: ${esito.motivo || ""}`);
  assert.equal(git(casa, "rev-parse", "--is-shallow-repository").stdout.trim(), "false", "la storia è INTERA, come actions/checkout con fetch-depth: 0");
  assert.equal(git(casa, "rev-parse", "--abbrev-ref", "HEAD").stdout.trim(), "main", "e il ramo si chiama main, non master");
  assert.equal(git(casa, "rev-parse", "origin/main").status, 0, "e origin/main esiste: è la riga 58 del workflow, non un'opinione");

  const ambiente = { ...envPulito(), HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), CLAUDE_CONFIG_DIR: join(home, ".claude"), CI: "1", GITHUB_ACTIONS: "true", DUE_CASE_DENTRO: "1" };
  for (const script of ["cervello/forma-json.mjs", "cervello/mutazioni-orfane.mjs", "cervello/prossimo-ar.mjs", "cervello/conta-verdetti-muti.mjs"]) {
    const r = spawnSync(process.execPath, [script], { cwd: casa, encoding: "utf8", timeout: 300_000, env: ambiente });
    assert.equal(r.status, 0, `${script} deve uscire 0 nella casa spoglia (se esce ≠ 0 la casa non imita il runner):\n${tutto(r).split("\n").slice(-8).join("\n")}`);
  }
  rmSync(base, { recursive: true, force: true });
});

test("CURA ② — un passo scritto con un aiutante non è un passo invisibile: ⚪, mai verde", () => {
  // La scorciatoia misurata: `const passoNode = (nome, script) => esegui(nome, "node", [script]);`
  // — il refactor più banale che un senior fa il giorno che aggiunge il quinto passo di fila. Lo
  // script malato resta identico al byte, e il freno passava da ROSSO a VERDE dicendo «1 passi
  // censiti» mentre il cancello ne lanciava due. Adesso il conto delle chiamate a `esegui(` fa da
  // controprova, e un passo che non so leggere è un passo che non ho misurato.
  const conto = censimentoDelCancello('passi.push(esegui("sano", "node", ["cervello/a.mjs"]));\nconst passoNode = (n, s) => esegui(n, "node", [s]);\npassi.push(passoNode("malato", "cervello/b.mjs"));\n');
  assert.equal(conto.censiti, 1, "so leggere solo il passo scritto per esteso");
  assert.equal(conto.chiamate, 2, "ma le chiamate a esegui( sono due");
  assert.equal(conto.tornaIlConto, false, "e il conto NON torna: è la controprova che prima non c'era");

  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/spia-chat.mjs"), SPIA_CHAT, "utf8");
  scriviCancello(r, [{ nome: "contatore del blocco mancante", argomenti: ["cervello/spia-chat.mjs"] }]);
  const casa = homeConLeTrascrizioni();
  assert.equal(lancia(r, [], { HOME: casa, USERPROFILE: casa }).status, 1, "parto da un rosso vero");

  // Stessa malattia, stesso file: cambia SOLO il modo in cui il cancello monta il passo.
  const md5 = (f) => spawnSync("md5sum", [f], { encoding: "utf8" }).stdout.split(" ")[0];
  const prima = md5(join(r, "cervello/spia-chat.mjs"));
  writeFileSync(
    join(r, "cervello/cancello-lotto.mjs"),
    'function esegui(nome, cmd, args, opts = {}) { return { nome, cmd, args, opts }; }\nconst passi = [];\nconst passoNode = (nome, script) => esegui(nome, "node", [script]);\npassi.push(passoNode("contatore del blocco mancante", "cervello/spia-chat.mjs"));\n',
    "utf8",
  );
  assert.equal(md5(join(r, "cervello/spia-chat.mjs")), prima, "lo script malato non è stato toccato: è tutto il punto");
  const dopo = lancia(r, [], { HOME: casa, USERPROFILE: casa });
  assert.equal(dopo.status, 2, `un passo che non so leggere è ⚪, non verde, invece:\n${tutto(dopo)}`);
  assert.ok(tutto(dopo).includes("non sto misurando il cancello intero"), `e deve dire perché:\n${tutto(dopo)}`);
  rmSync(r, { recursive: true, force: true });
  rmSync(casa, { recursive: true, force: true });
});

test("un passo che porta il NOME di un altro non sparisce: il doppione è l'identità intera", () => {
  // Trovata provando a comprare il verde da sola, prima di consegnare. Il freno deduplicava per
  // NOME: copi la riga di un passo, cambi lo script e ti scordi di cambiare il nome — cioè il modo
  // più normale al mondo di aggiungere un passo — e quello nuovo non esisteva più per il freno. Non
  // rilanciato, non contato, e il conto delle chiamate tornava lo stesso perché la riga c'era.
  // Misurato prima della cura: exit 0 con lo script malato mai eseguito.
  const passi = passiDelCancello(
    'passi.push(esegui("stesso nome", "node", ["cervello/sano.mjs"]));\npassi.push(esegui("stesso nome", "node", ["cervello/malato.mjs"]));\npassi.push(esegui("stesso nome", "node", ["cervello/sano.mjs"]));\n',
  );
  assert.equal(passi.length, 2, "due chiamate diverse restano due; la terza, identica alla prima, è un doppione vero");
  assert.deepEqual(
    passi.map((p) => p.script),
    ["cervello/sano.mjs", "cervello/malato.mjs"],
    "e lo script del secondo non si perde per strada",
  );

  const r = radiceNuova();
  scriviCancello(r, [{ nome: "gate delle lezioni", argomenti: ["cervello/spia-albero.mjs"] }]);
  scriviTetto(r, 0);
  writeFileSync(join(r, "cervello/sorvegliato.mjs"), SORVEGLIATO, "utf8");
  writeFileSync(join(r, "cervello/spia-albero.mjs"), SPIA_ALBERO, "utf8");
  commit(r);
  // Il lotto: la riga copiata, stesso nome, script diverso e malato.
  writeFileSync(join(r, "cervello/spia-chat.mjs"), SPIA_CHAT, "utf8");
  scriviCancello(r, [
    { nome: "gate delle lezioni", argomenti: ["cervello/spia-albero.mjs"] },
    { nome: "gate delle lezioni", argomenti: ["cervello/spia-chat.mjs"] },
  ]);
  const casa = homeConLeTrascrizioni();
  const v = lancia(r, [], { HOME: casa, USERPROFILE: casa });
  assert.equal(v.status, 1, `il passo col nome copiato deve essere preso lo stesso, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("cervello/spia-chat.mjs"), `e l'accusa deve nominare lo script vero:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
  rmSync(casa, { recursive: true, force: true });
});

test("CURA ③ — senza la chiave del tetto, --aggiorna-tetto RIFIUTA di scrivere ed esce ≠ 0", () => {
  // La scorciatoia misurata: `Math.min` valeva solo se il tetto c'era. Tolta la chiave dal JSON e
  // ridato lo STESSO comando che il file documenta, il tetto SALIVA (0 → 1, rosso → verde) e il
  // comando stampava pure «è un gesto esplicito e cercabile nel diff». Adesso non scrive niente.
  assert.equal(tettoDaScrivere({ quanti: 4, tetto: null }), null, "senza un tetto di prima non c'è niente da scrivere");

  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  scriviCancello(r, [{ nome: "typecheck del Pannello", comando: "npx", argomenti: ["tsc", "--noEmit"] }]);
  assert.equal(lancia(r).status, 1, "parto da un rosso: 1 mai provabile contro un tetto di 0");

  // La mossa: `rm` di UNA chiave, poi lo stesso comando di prima.
  writeFileSync(join(r, "cervello/due-case.json"), `${JSON.stringify({ mai_provabili: [] }, null, 2)}\n`, "utf8");
  const comando = lancia(r, ["--aggiorna-tetto"]);
  assert.notEqual(comando.status, 0, `il comando si deve RIFIUTARE, invece:\n${tutto(comando)}`);
  assert.ok(tutto(comando).includes("NON scrivo niente"), `e deve dirlo:\n${tutto(comando)}`);
  assert.equal(JSON.parse(readFileSync(join(r, "cervello/due-case.json"), "utf8")).tetto_mai_provabili, undefined, "e il file non deve essere stato riscritto col numero alzato");
  assert.equal(lancia(r).status, 1, "e il rosso resta: senza tetto non si misura, e senza misura non si passa");
  rmSync(r, { recursive: true, force: true });
});

test("il `./` davanti al mio nome non mi rende un altro: la cintura anti-ricorsione lo riconosce", () => {
  // Misurato da una verifica avversariale: montato come `["./cervello/due-case.mjs"]`, la prima
  // cintura (un confronto di stringhe) non mi riconosceva. La seconda teneva — niente esplosione —
  // ma il freno stampava «✅ verde anche nella casa spoglia» su un figlio che era stato zittito da
  // DUE_CASE_DENTRO=1: un verde che aveva guardato zero, su se stesso.
  const passi = passiDelCancello('passi.push(esegui("le due case", "node", ["./cervello/due-case.mjs"]));');
  assert.equal(passi[0].script, "cervello/due-case.mjs", "il ./ si toglie: è lo stesso file");
  const p = piano(passi, [], { seStesso: "cervello/due-case.mjs", leggiOra: () => "codice", leggiPrima: () => null });
  assert.equal(p[0].stato, "io", "e allora sono io, non un passo qualunque");
  assert.equal(p[0].provare, false, "quindi non mi rilancio");
});

test("NON sono sola lettura, e lo dico: il passo rilanciato QUI per confronto scrive QUI", () => {
  // Il buco ⑭, trovato misurando i miei stessi orari mentre riparavo il freno: `--tutti` sul repo
  // vero aveva lasciato `cervello/_tmp_stop-ancora.json` — l'ancora del turno che scrive
  // `cervello/cancello-stop.mjs`, rilanciato in casa per il confronto. Per tre consegne in testa al
  // file c'era scritto «🟢 sola lettura». Qui il caso lo mette in scena con uno script che HA quel
  // comportamento: esce 2 dove il file di lavoro non c'è (nella casa spoglia è ignorato da git) e in
  // casa lo scrive. Non è una promessa da rispettare: è un fatto da dichiarare.
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  writeFileSync(join(r, "cervello/_tmp_serve.json"), "{}\n", "utf8");
  commit(r);
  writeFileSync(
    join(r, "cervello/passo-che-scrive.mjs"),
    `import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const qui = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(qui, "_tmp_ho-scritto-qui.json"), '{"sono":"passato"}\\n', "utf8");
if (!existsSync(join(qui, "_tmp_serve.json"))) { console.error("⚪ CIECO: manca il file di lavoro"); process.exit(2); }
process.exit(0);
`,
    "utf8",
  );
  scriviCancello(r, [{ nome: "passo che scrive", argomenti: ["cervello/passo-che-scrive.mjs"] }]);
  assert.equal(existsSync(join(r, "cervello/_tmp_ho-scritto-qui.json")), false, "prima della corsa quel file non c'è");

  const v = lancia(r);
  assert.equal(v.status, 1, `il passo nasce rotto (AR-506), e questo regge:\n${tutto(v)}`);
  assert.equal(existsSync(join(r, "cervello/_tmp_ho-scritto-qui.json")), true, "ma il confronto in casa È una corsa vera: il file l'ha scritto QUI");
  assert.ok(tutto(v).includes("l'ho rilanciato anche QUI"), `e il verdetto lo deve dire, o è una sorpresa:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("il budget della corsa: il passo che non ci sta dentro è ⚪ con nome e cognome, non un 124 muto", () => {
  // Il cancello mi dà 300 secondi in tutto e io ne davo altrettanti a OGNI passo: due passi lenti e
  // l'orologio del cancello mi ammazza (status null → 124 → fallito: true), cioè rosso per tutti
  // senza una riga che spieghi perché. Con DUE_CASE_BUDGET=1 ms il caso lo mette in scena.
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  writeFileSync(join(r, "cervello/sorvegliato.mjs"), SORVEGLIATO, "utf8");
  writeFileSync(join(r, "cervello/spia-albero.mjs"), SPIA_ALBERO, "utf8");
  scriviCancello(r, [{ nome: "spia dell albero", argomenti: ["cervello/spia-albero.mjs"] }]);
  const v = lancia(r, [], { DUE_CASE_BUDGET: "1" });
  assert.equal(v.status, 2, `finito il budget il verdetto è ⚪, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("ho finito il mio budget"), `e il passo rimasto fuori si deve leggere per nome:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("spia dell albero"), `col suo nome:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("la casa spoglia ha l'indice pulito, la storia INTERA con origin/main, e nessun file ignorato", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  writeFileSync(join(r, "cervello/tracciato.mjs"), "// tracciato\n", "utf8");
  commit(r);
  // Dopo il commit: un file ignorato, uno nuovo non ignorato, e roba nell'indice.
  writeFileSync(join(r, "cervello/_tmp_stop-ancora.json"), "{}\n", "utf8");
  writeFileSync(join(r, "cervello/nato-nel-lotto.mjs"), "// nuovo\n", "utf8");
  writeFileSync(join(r, "cervello/tracciato.mjs"), "// cambiato\n", "utf8");
  git(r, "add", "cervello/tracciato.mjs");
  assert.notEqual(git(r, "diff", "--cached", "--name-only").stdout.trim(), "", "qui l'indice è sporco: è la condizione del pre-commit");

  const dove = mkdtempSync(join(tmpdir(), "due-case-spoglia-"));
  const esito = costruisciCasaSpoglia(r, dove);
  assert.equal(esito.ok, true, `la casa spoglia si deve costruire: ${esito.motivo || ""}`);
  assert.equal(git(dove, "diff", "--cached", "--name-only").stdout.trim(), "", "nella casa spoglia l'indice è PULITO (AR-511)");
  assert.equal(existsSync(join(dove, "cervello/_tmp_stop-ancora.json")), false, "i file ignorati non arrivano sul runner (AR-506)");
  assert.equal(existsSync(join(dove, "cervello/nato-nel-lotto.mjs")), true, "i file nuovi del lotto sì: sul runner ci saranno");
  assert.equal(git(dove, "rev-parse", "--is-shallow-repository").stdout.trim(), "false", "la storia è INTERA: fingere un clone superficiale costava quattro accuse false");
  assert.equal(git(dove, "rev-parse", "origin/main").status, 0, "e origin/main c'è, come dopo actions/checkout con fetch-depth: 0");
  assert.equal(readFileSync(join(dove, "cervello/tracciato.mjs"), "utf8"), "// cambiato\n", "la copia porta l'albero di lavoro, non l'ultimo commit");
  // E il DELTA è il lotto, non il vuoto: `origin/main` punta al pre-lotto, quindi un passo che
  // guarda «cosa ha cambiato questo ramo» lì dentro trova qualcosa da guardare.
  const delta = git(dove, "diff", "--name-only", "origin/main", "HEAD").stdout.trim().split("\n").filter(Boolean);
  assert.ok(delta.includes("cervello/nato-nel-lotto.mjs"), `il file nato nel lotto deve stare nel delta, invece: ${delta.join(", ")}`);
  assert.ok(delta.includes("cervello/tracciato.mjs"), `e anche quello cambiato, invece: ${delta.join(", ")}`);
  assert.equal(readFileSync(join(dove, "cervello/tracciato.mjs"), "utf8"), "// cambiato\n", "e la punta resta l'albero di lavoro");
  rmSync(r, { recursive: true, force: true });
  rmSync(dove, { recursive: true, force: true });
});

test("un file tracciato e CANCELLATO dal lotto non rende cieco il freno", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  writeFileSync(join(r, "cervello/da-cancellare.mjs"), "// addio\n", "utf8");
  commit(r);
  rmSync(join(r, "cervello/da-cancellare.mjs"));
  const dove = mkdtempSync(join(tmpdir(), "due-case-spoglia-"));
  const esito = costruisciCasaSpoglia(r, dove);
  assert.equal(esito.ok, true, `un file cancellato non deve far fallire la copia: ${esito.motivo || ""}`);
  assert.equal(existsSync(join(dove, "cervello/da-cancellare.mjs")), false, "e nella copia non c'è, come sul runner");
  rmSync(r, { recursive: true, force: true });
  rmSync(dove, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// IL TETTO — ciò che non si potrà mai provare si conta, non sparisce.
// ─────────────────────────────────────────────────────────────────────────────

test("un passo nuovo che nessuno potrà mai rilanciare alza il tetto, ed è rosso", () => {
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  scriviCancello(r, [{ nome: "typecheck del Pannello", comando: "npx", argomenti: ["tsc", "--noEmit"] }]);
  const v = lancia(r);
  assert.equal(v.status, 1, `il debito nuovo non passa sotto silenzio, invece:\n${tutto(v)}`);
  assert.ok(tutto(v).includes("il debito si è allargato"), `deve dire che il tetto è salito:\n${tutto(v)}`);
  rmSync(r, { recursive: true, force: true });
});

test("--aggiorna-tetto ABBASSA e non ALZA: il comando eseguito su un tetto superato non lo fa salire", () => {
  // L'accusa misurata sulla seconda versione: passo nuovo mai provabile → rosso;
  // `--aggiorna-tetto` → «✍️ tetto scritto a 1»; rilancio → VERDE, con zero byte cambiati nel
  // cancello. Il tetto era SALITO. Nel cancello di casa lo stesso gesto passa da Math.min
  // (cancello-lotto.mjs, righe 720-724): lì non può salire. Qui adesso nemmeno.
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 0);
  commit(r);
  scriviCancello(r, [{ nome: "typecheck del Pannello", comando: "npx", argomenti: ["tsc", "--noEmit"] }]);
  assert.equal(lancia(r).status, 1, "parto da un rosso: 1 mai provabile contro un tetto di 0");

  const comando = lancia(r, ["--aggiorna-tetto"]);
  assert.equal(comando.status, 0, `il comando gira:\n${tutto(comando)}`);
  assert.equal(leggiTetto(r), 0, `il numero NON deve salire, invece è ${leggiTetto(r)}:\n${tutto(comando)}`);
  assert.ok(tutto(comando).includes("il numero non sale"), `e il comando lo deve dire a chi lo lancia:\n${tutto(comando)}`);
  assert.equal(lancia(r).status, 1, "e il rosso deve essere ancora lì dopo il comando");

  // Nell'altra direzione il cricchetto deve funzionare: da 5 misurati 1, scende a 1.
  scriviTetto(r, 5);
  assert.equal(lancia(r, ["--aggiorna-tetto"]).status, 0);
  assert.equal(leggiTetto(r), 1, "verso il basso il comando deve scrivere la misura");
  assert.equal(lancia(r).status, 0, "e con il tetto abbassato al vero il freno torna verde");
  rmSync(r, { recursive: true, force: true });
});

test("tettoDaScrivere: il minimo fra la misura e il tetto di prima, mai la misura secca", () => {
  assert.equal(tettoDaScrivere({ quanti: 4, tetto: 3 }), 3, "misura sopra il tetto: resta il tetto");
  assert.equal(tettoDaScrivere({ quanti: 2, tetto: 3 }), 2, "misura sotto il tetto: scende");
  assert.equal(tettoDaScrivere({ quanti: 3, tetto: 3 }), 3);
  // ⚠️ QUESTA RIGA PRIMA DICEVA 4, ED È LA SCAPPATOIA CHE HA BOCCIATO LA CONSEGNA PRECEDENTE.
  // «senza un tetto di prima si scrive la misura» vuol dire: togli la chiave e il comando riparte da
  // zero, cioè ALZA. Il banco benediceva la scorciatoia invece di prenderla.
  assert.equal(tettoDaScrivere({ quanti: 4, tetto: null }), null, "senza un tetto di prima non si scrive niente: un tetto che riparte da zero non è un tetto");
});

test("verdettoTetto: scende e non risale, e senza un numero non sta misurando", () => {
  assert.equal(verdettoTetto({ quanti: 4, tetto: 3 }).esito, "salito");
  assert.equal(verdettoTetto({ quanti: 2, tetto: 3 }).esito, "sceso");
  assert.equal(verdettoTetto({ quanti: 3, tetto: 3 }).esito, "ok");
  assert.equal(verdettoTetto({ quanti: 3, tetto: null }).esito, "senza-tetto", "senza il numero da confrontare non c'è misura");
});

// ─────────────────────────────────────────────────────────────────────────────
// IL PASSO CHE COSTA MINUTI — il rosso falso da 7m35s, e la cura che non è un'esenzione.
// ─────────────────────────────────────────────────────────────────────────────

test("il passo che il cancello paga più dei suoi 300 s non si rilancia: ⚪ sotto il tetto, non un rosso falso", () => {
  // Misurato: rilanciare `cervello/test-cervello.mjs` (600 s nel cancello) nella casa spoglia
  // costava 7m35s e usciva 1, perché la suite lì dentro rieseguiva il banco di QUESTO freno con
  // DUE_CASE_DENTRO=1 addosso. Il freno accusava «nasce rotto» una suite che aveva rotto lui.
  // Qui lo script È malato davvero (AR-506: legge un file ignorato da git): la differenza fra le
  // due corse è SOLO il timeout dichiarato dal cancello, e si vede.
  const r = radiceNuova();
  scriviCancello(r, []);
  scriviTetto(r, 1);
  commit(r);
  writeFileSync(join(r, "cervello/_tmp_stop-ancora.json"), '{"turno":7}\n', "utf8");
  writeFileSync(join(r, "cervello/suite-finta.mjs"), SPIA_ANCORA, "utf8");

  // ① il cancello dichiara di pagarlo 600 secondi → non lo rilancio, lo conto.
  scriviCancello(r, [{ nome: "test del cervello", argomenti: ["cervello/suite-finta.mjs", "--json"], timeout: 600_000 }]);
  const caro = lancia(r);
  assert.equal(caro.status, 0, `un passo caro va contato, non accusato:\n${tutto(caro)}`);
  assert.ok(tutto(caro).includes("rilanciati nella casa spoglia: 0"), `e soprattutto NON va rilanciato:\n${tutto(caro)}`);
  assert.ok(tutto(caro).includes("NON LO RILANCIO (sotto il tetto)"), `il ⚪ si deve leggere:\n${tutto(caro)}`);
  assert.ok(!tutto(caro).includes("NASCE ROTTO"), `e non deve uscirne un'accusa:\n${tutto(caro)}`);

  // ② lo STESSO script senza il timeout lungo: il freno lo rilancia e lo prende. La regola
  //    discrimina il prezzo dichiarato dal cancello, non è un'esenzione a chiunque la chieda.
  scriviTetto(r, 0);
  scriviCancello(r, [{ nome: "test del cervello", argomenti: ["cervello/suite-finta.mjs", "--json"] }]);
  const normale = lancia(r);
  assert.equal(normale.status, 1, `senza il timeout lungo lo stesso script deve essere accusato:\n${tutto(normale)}`);
  assert.ok(tutto(normale).includes("NASCE ROTTO"), `e l'accusa è quella vera:\n${tutto(normale)}`);
  rmSync(r, { recursive: true, force: true });
});

test("maiProvabile riconosce chi non si può rilanciare nudo, e solo quelli", () => {
  assert.equal(maiProvabile({ comando: "node", script: "cervello/a.mjs", argomentiDinamici: false }).provabile, true);
  assert.equal(maiProvabile({ comando: "npx", script: null }).provabile, false, "npx tsc non è uno script del cervello");
  assert.equal(maiProvabile({ comando: "node", script: "cervello/b.mjs", argomentiDinamici: true }).provabile, false, "con --base calcolato si misurerebbe un'altra cosa");
  assert.equal(maiProvabile({ comando: "node", script: null }).provabile, false, "senza script non c'è niente da rilanciare");
  assert.equal(maiProvabile({ comando: "node", script: "cervello/c.mjs", timeout: 600_000 }).provabile, false, "600 s dichiarati dal cancello = un passo che costa minuti");
  assert.equal(maiProvabile({ comando: "node", script: "cervello/c.mjs", timeout: 300_000 }).provabile, true, "il budget di casa non è un'eccezione");
  assert.equal(maiProvabile({ comando: "node", script: "cervello/c.mjs", timeout: null }).provabile, true, "senza timeout dichiarato vale il budget di casa");
});

// ─────────────────────────────────────────────────────────────────────────────
// LE DECISIONI PURE — eseguite, non cercate in un file.
// ─────────────────────────────────────────────────────────────────────────────

test("statoDelPasso distingue nato, riscritto e invariato senza chiedere niente a nessuno", () => {
  const p = { nome: "x", comando: "node", argomenti: ["cervello/x.mjs"], script: "cervello/x.mjs" };
  assert.equal(statoDelPasso(p, null, "a", null), "nato", "un passo che al ramo di base non c'era");
  assert.equal(statoDelPasso(p, p, "a", null), "nato", "il nome c'era ma lo script no");
  assert.equal(statoDelPasso(p, p, "b", "a"), "riscritto", "lo script è cambiato");
  assert.equal(statoDelPasso(p, p, "a", "a"), "invariato", "niente è cambiato");
  assert.equal(statoDelPasso(p, { ...p, argomenti: ["cervello/x.mjs", "--json"] }, "a", "a"), "riscritto", "sono cambiati gli argomenti");
  // Un passo senza script (`npx tsc`) non ha un testo da confrontare: era il caso in cui il freno
  // gridava «nato» a ogni corsa, e un'accusa che torna sempre si impara a saltare.
  const senzaScript = { nome: "y", comando: "npx", argomenti: ["tsc", "--noEmit"], script: null };
  assert.equal(statoDelPasso(senzaScript, senzaScript, null, null), "invariato");
});

test("gli argomenti CALCOLATI si riconoscono, e il PREZZO dichiarato dal cancello si legge", () => {
  const passi = passiDelCancello(`
    passi.push(esegui("fisso", "node", ["cervello/a.mjs", "--json"]));
    passi.push(esegui("calcolato", "node", ["cervello/b.mjs", "--base", base.spec]));
    const pTest = esegui("caro", "node", ["cervello/c.mjs", "--json"], { timeout: 600_000 });
    passi.push(esegui("caro su piu righe", "node", ["cervello/d.mjs"], {
      cwd: join(AD_ROOT, "pannello"),
      timeout: 900_000,
    }));
  `);
  assert.equal(passi[0].argomentiDinamici, false);
  assert.equal(passi[0].timeout, null, "senza opzioni non c'è un prezzo dichiarato");
  assert.equal(passi[1].argomentiDinamici, true);
  assert.equal(passi[2].timeout, 600_000, "il timeout si legge anche con l'underscore dentro il numero");
  assert.equal(passi[3].timeout, 900_000, "e anche quando le opzioni stanno su più righe");
});

// ─────────────────────────────────────────────────────────────────────────────
// 📦 DOVE SONO FINITI SETTE CASI — 2026-09-02, e non sono stati tolti.
//
// Il sorvegliante del delta segnala che qui si prova meno di prima. È vero e va detto dove sono
// andati, perché «un file che prova meno» e «una difesa persa» hanno la stessa faccia.
//
// I sette casi di AR-908 e AR-909 sono in `cervello/test/il-tempo-massimo-che-si-poteva-rifiutare.test.mjs`,
// nato nello stesso commit. Il conto: 39 casi prima, 32 qui adesso, 7 di là. Non ne manca nessuno.
//
// PERCHÉ sono stati spostati, e non è una questione di ordine: il banco delle mutazioni concede a
// ogni prova 420 secondi (`TEMPO_MAX` in non-vacuita.mjs) e QUESTO file ne prende 626. Le tre
// mutazioni che difendono AR-908 e AR-909 uscivano ⚪ — «non ho misurato» — e nessuno se ne
// accorgeva. Spostate, escono rosse tutte e tre, che è quello che una difesa deve saper fare.
//
// ⚠️ Il debito resta ed è di questo file, non di quelli: finché prende 626 secondi, OGNI difetto
// la cui prova vive qui è coperto sulla carta e scoperto al banco. Non è stato curato stanotte.
// ─────────────────────────────────────────────────────────────────────────────
