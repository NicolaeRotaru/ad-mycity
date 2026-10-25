// Le prove mute del sito (node --test).
//
// Il punto di prova-sito.mjs e' uno solo: dire verde o rosso a una squadra costando poche righe di
// contesto, e non dire MAI verde quando non ha potuto girare. Qui l'esecutore dei comandi e' finto
// (PROVA_SITO_ESECUTORE): niente tsc, eslint o vitest veri, che in questa macchina non ci sono —
// si provano il taglio dell'uscita e le tre uscite 0/1/2 sul comando vero, lanciato come lo lancia
// la squadra.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { componi, passi, prerequisiti, eseguiPassi, MAX_RIGHE, TEMPO_TOTALE_MS, TETTO_BASH_MS } from "../prova-sito.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "prova-sito.mjs");

// L'esecutore finto: decide l'esito dal nome del binario e dal modo scelto in PROVA_FINTA.
const ESECUTORE = `
export default function (bin, argomenti, opzioni) {
  const passo = bin.split("/").pop();
  const modo = process.env.PROVA_FINTA || "verde";
  if (modo === "assente") return { status: null, error: Object.assign(new Error("spawn " + bin + " ENOENT"), { code: "ENOENT" }), stdout: "", stderr: "" };
  // Un processo ucciso da un segnale: spawnSync da' status null e signal, SENZA error.
  if (modo === "ucciso" && passo === "tsc") return { status: null, signal: "SIGKILL", stdout: "met", stderr: "" };
  if (modo === "rosso" && passo === "tsc") {
    const righe = [];
    // Ogni decima riga d'errore si porta dietro un tipo da 2 KB, come fa tsc sui tipi generici.
    for (let i = 0; i < 500; i++) righe.push(i % 5 ? "        il tipo " + "x".repeat(300) : "app/p" + i + ".ts(" + i + ",1): error TS2322: Type 'string' is not assignable to type '" + (i % 10 ? "number" : "{ " + "campo: string; ".repeat(140) + "}") + "'.");
    return { status: 2, stdout: righe.join("\\n"), stderr: "" };
  }
  if (modo === "rosso" && passo === "vitest") return { status: 1, stdout: ".".repeat(400) + "\\n FAIL  tests/unit/a.test.ts > somma\\nAssertionError: expected 1 to be 2\\n" + "rumore\\n".repeat(300), stderr: "" };
  if (modo === "eslint-rotto" && passo === "eslint") return { status: 2, stdout: "", stderr: "Oops! Something went wrong! :(\\nESLint couldn't find the plugin \\"eslint-plugin-react\\"." };
  if (modo === "tempo" && passo === "tsc") return { status: 1, stdout: "x.ts(1,1): error TS1: timeout " + opzioni.timeout, stderr: "" };
  if (passo === "vitest") {
    if (modo === "vuoto") return { status: 0, stdout: "No test files found, exiting with code 0\\n", stderr: "" };
    if (modo === "muto") return { status: 0, stdout: "", stderr: "" };
    if (modo === "zero") return { status: 0, stdout: "      Tests  0 passed (0)\\n", stderr: "" };
    return { status: 0, stdout: "..\\n Test Files  1 passed (1)\\n      Tests  2 passed (2)\\n", stderr: "" };
  }
  return { status: 0, stdout: "", stderr: "" };
}
`;

function sabbiera({ nodeModules = true, bin = ["tsc", "eslint", "vitest"] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "prova-sito-test-"));
  const repo = join(dir, "sito");
  mkdirSync(join(repo, "app"), { recursive: true });
  writeFileSync(join(repo, "package.json"), "{}");
  writeFileSync(join(repo, "app", "a.ts"), "export const a = 1\n");
  writeFileSync(join(repo, "app", "b.sql"), "select 1;\n");
  if (nodeModules) {
    mkdirSync(join(repo, "node_modules", ".bin"), { recursive: true });
    for (const b of bin) writeFileSync(join(repo, "node_modules", ".bin", b), "");
  }
  const esecutore = join(dir, "esecutore.mjs");
  writeFileSync(esecutore, ESECUTORE);
  return { dir, repo, esecutore, log: join(dir, "log") };
}

function lancia(s, modo, argomenti, env = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...(argomenti || ["--repo", s.repo, "--file", "app/a.ts"])], {
    encoding: "utf8",
    env: { ...process.env, PROVA_SITO_ESECUTORE: s.esecutore, PROVA_SITO_LOG: s.log, PROVA_FINTA: modo, ...env },
  });
}
const righe = (r) => r.stdout.split("\n").filter((x) => x.length);

test("tutto verde: uscita 0, la cartella dei log per prima, e una riga per passo", () => {
  const s = sabbiera();
  try {
    const r = lancia(s, "verde");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(righe(r).length <= 5, `troppe righe per un verde:\n${r.stdout}`);
    assert.ok(righe(r)[0].includes(s.log), "la cartella dei log deve uscire per prima: e' l'unica traccia se il processo viene ucciso");
    assert.equal(righe(r).at(-1), "✅ tutto verde");
    assert.match(r.stdout, /✅ tsc/);
    assert.match(r.stdout, /✅ eslint/);
    assert.match(r.stdout, /✅ vitest/);
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("rosso con 500 righe di uscita: uscita 1, al massimo 30 righe a schermo, il resto nel log", () => {
  const s = sabbiera();
  try {
    const r = lancia(s, "rosso");
    assert.equal(r.status, 1, "il 2 di tsc (errori trovati) non deve diventare un «non ha potuto girare»");
    const visibili = righe(r);
    assert.ok(visibili.length <= MAX_RIGHE, `${visibili.length} righe a schermo, oltre ${MAX_RIGHE}`);
    assert.ok(visibili.some((x) => x.includes("error TS2322") && x.endsWith("…")), "la prova deve mandare a schermo almeno una riga lunga, tagliata");
    assert.ok(visibili.every((x) => x.length <= 180), "una riga non tagliata si porta dietro il tipo intero");
    assert.match(r.stdout, /error TS2322/, "le righe col codice dell'errore devono arrivare");
    assert.match(r.stdout, /FAIL {2}tests\/unit\/a\.test\.ts/);
    assert.doesNotMatch(r.stdout, /rumore/, "il rumore resta nel log, non a schermo");
    const log = readFileSync(join(s.log, "tsc.log"), "utf8");
    assert.equal(log.split("\n").filter((x) => x.includes("error TS2322")).length, 100, "il log deve avere l'uscita intera");
    assert.ok(r.stdout.includes(join(s.log, "tsc.log")), "il percorso del log va stampato");
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("non ha potuto girare: repo inesistente, node_modules mancante, comando assente, file sbagliato → 2", () => {
  const s = sabbiera();
  const senzaModuli = sabbiera({ nodeModules: false });
  const senzaVitest = sabbiera({ bin: ["tsc", "eslint"] });
  try {
    assert.equal(lancia(s, "verde", ["--repo", join(s.dir, "non-c-e"), "--file", "app/a.ts"]).status, 2);
    const moduli = lancia(senzaModuli, "verde");
    assert.equal(moduli.status, 2);
    assert.match(moduli.stdout + moduli.stderr, /collega quello del repo principale/, "dice come rimediare, non solo che non gira");
    const r = lancia(senzaVitest, "verde");
    assert.equal(r.status, 2, "un passo che non gira non e' un verde");
    assert.match(r.stdout, /vitest: non ha potuto girare/);
    assert.equal(lancia(s, "assente").status, 2, "un comando che non parte (ENOENT) non e' un rosso ne' un verde");
    assert.equal(lancia(s, "verde", ["--repo", s.repo, "--file", "app/sbagliato.ts"]).status, 2);
    assert.equal(lancia(s, "verde", ["--repo", s.repo]).status, 2, "senza file non si prova niente");
    assert.equal(lancia(s, "verde", ["--repo", s.repo, "--file", "app/a.ts", "--tutto"]).status, 2);
  } finally {
    for (const x of [s, senzaModuli, senzaVitest]) rmSync(x.dir, { recursive: true, force: true });
  }
});

test("un verde vuoto NON e' un verde: un .sql senza prova esce 2, e con la sua prova esce 0", () => {
  // Il caso vero: i pacchetti delle migrazioni. Con l'uscita 0 la prova rossa-poi-verde della squadra
  // non poteva diventare rossa mai, e l'ultima riga diceva «tutto verde».
  const s = sabbiera();
  try {
    const r = lancia(s, "vuoto", ["--repo", s.repo, "--file", "app/b.sql"]);
    assert.equal(r.status, 2, r.stdout);
    assert.doesNotMatch(r.stdout, /tutto verde/);
    assert.match(righe(r).at(-1), /nessuna prova ha girato/);
    assert.match(r.stdout, /eslint: saltato/);
    assert.match(r.stdout, /nessun file di prova collegato/, "dice perche' e' vuoto");
    assert.equal(lancia(s, "zero", ["--repo", s.repo, "--file", "app/a.ts"]).status, 2, "«0 passed» non e' una prova passata");
    const muto = lancia(s, "muto", ["--repo", s.repo, "--file", "app/a.ts"]);
    assert.equal(muto.status, 2, "un vitest a 0 che non dice «N passed» non ha provato niente");
    mkdirSync(join(s.repo, "tests", "unit"), { recursive: true });
    writeFileSync(join(s.repo, "tests", "unit", "b.test.ts"), "");
    const conProva = lancia(s, "verde", ["--repo", s.repo, "--file", "app/b.sql,tests/unit/b.test.ts"]);
    assert.equal(conProva.status, 0, conProva.stdout);
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("un processo ucciso, un eslint con la configurazione rotta, il tempo finito: 2, non rosso", () => {
  const s = sabbiera();
  try {
    const ucciso = lancia(s, "ucciso");
    assert.equal(ucciso.status, 2, "un tsc ucciso da un segnale non ha misurato niente: " + ucciso.stdout);
    assert.match(ucciso.stdout, /SIGKILL/);
    const eslint = lancia(s, "eslint-rotto");
    assert.equal(eslint.status, 2, "eslint esce 2 per la configurazione: non e' un rosso del fix");
    assert.match(eslint.stdout, /eslint: non ha potuto girare — uscita 2/);
    const finito = lancia(s, "verde", undefined, { PROVA_SITO_TIMEOUT_MS: "1" });
    assert.equal(finito.status, 2);
    assert.match(finito.stdout, /tempo finito/);
    // Il tempo che arriva al comando viene dal tetto TOTALE, non da un tetto per passo.
    const tempo = lancia(s, "tempo", undefined, { PROVA_SITO_TIMEOUT_MS: "5000" });
    const dato = Number(tempo.stdout.match(/timeout (\d+)/)?.[1]);
    assert.ok(dato > 0 && dato <= 5000, `il passo ha ricevuto ${dato} ms con un tetto totale di 5000`);
    // Lo strumento Bash di un agente si ferma a 600 secondi al massimo: il tetto unico deve chiudere
    // prima, con margine per l'avvio di node e per la shell. Con 840 la prova moriva senza verdetto.
    assert.equal(TETTO_BASH_MS, 600_000, "il massimo dello strumento Bash");
    assert.ok(TEMPO_TOTALE_MS < 540_000, `il tetto unico (${TEMPO_TOTALE_MS} ms) deve stare sotto i 540 secondi`);
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});

test("un percorso assoluto: dentro il repo diventa relativo, fuori dal repo esce 2", () => {
  const s = sabbiera();
  const altro = sabbiera();
  try {
    assert.equal(lancia(s, "verde", ["--repo", s.repo, "--file", join(s.repo, "app", "a.ts")]).status, 0);
    const fuori = lancia(s, "verde", ["--repo", s.repo, "--file", join(altro.repo, "app", "a.ts")]);
    assert.equal(fuori.status, 2);
    assert.match(fuori.stdout, /fuori dal repo/);
    assert.equal(lancia(s, "verde", ["--repo", s.repo, "--file", "../sito/app/a.ts"]).status, 2, "«..» esce dal worktree");
  } finally {
    for (const x of [s, altro]) rmSync(x.dir, { recursive: true, force: true });
  }
});

test("i passi sono quelli del sito: tsc muto sul progetto, eslint e vitest solo sui file dati", () => {
  const [tsc, eslint, vitest] = passi(["app/a.ts", "migrations/1.sql"]);
  assert.deepEqual(tsc.argomenti, ["--noEmit", "--pretty", "false"]);
  assert.deepEqual(eslint.argomenti, ["--quiet", "app/a.ts"]);
  assert.deepEqual(vitest.argomenti.slice(0, 4), ["related", "--run", "--reporter=dot", "--passWithNoTests"]);
  assert.deepEqual(vitest.argomenti.slice(4), ["app/a.ts", "migrations/1.sql"]);
});

test("tre passi rossi da 500 righe restano sotto il tetto, e il rosso batte il non misurato", () => {
  const lungo = Array.from({ length: 500 }, (_, i) => `x.ts(${i},1): error TS1 ${"y".repeat(400)}`).join("\n");
  const c = componi([
    { nome: "tsc", stato: "rosso", uscita: lungo, log: "/l/tsc.log" },
    { nome: "eslint", stato: "rosso", uscita: lungo, log: "/l/eslint.log" },
    { nome: "vitest", stato: "cieco", nota: "assente" },
  ]);
  assert.equal(c.codice, 1);
  assert.ok(c.righe.length <= MAX_RIGHE);
  assert.match(c.righe.at(-1), /rosso/, "la riga di verdetto non deve cadere sotto il tetto");
  assert.equal(componi([{ nome: "tsc", stato: "verde" }, { nome: "vitest", stato: "cieco", nota: "x" }]).codice, 2);
  assert.equal(prerequisiti("", ["a.ts"]), "manca --repo <worktree del sito>");
});

test("il tetto di tempo e' UNO per tutti e tre i passi: ogni passo riceve quello che resta, non il tetto intero", () => {
  // Un orologio finto: ogni passo «dura» 300 secondi. Con un tetto per passo i tre comandi potevano
  // stare fino a 2.520 secondi, oltre il «timeout 900» della squadra, che uccideva la prova senza verdetto.
  const s = sabbiera();
  try {
    let ora = 0;
    const dati = [];
    const esecutore = (bin, argomenti, opzioni) => {
      dati.push(opzioni.timeout);
      ora += 300_000;
      return { status: 0, stdout: bin.endsWith("vitest") ? "Tests  2 passed (2)" : "", stderr: "" };
    };
    const { esiti } = eseguiPassi(s.repo, ["app/a.ts"], { esecutore, cartellaLog: s.log, tempoTotaleMs: 840_000, adesso: () => ora });
    assert.deepEqual(dati, [840_000, 540_000, 240_000], "ogni passo riceve il tempo che resta del tetto unico");
    assert.deepEqual(esiti.map((e) => e.stato), ["verde", "verde", "verde"]);
    // Se i primi due si mangiano tutto il tetto, il terzo non parte: e' un «tempo finito», non un verde.
    ora = 0;
    dati.length = 0;
    const lenti = eseguiPassi(s.repo, ["app/a.ts"], { esecutore: (b, a, o) => { dati.push(o.timeout); ora += 420_000; return { status: 0, stdout: "", stderr: "" }; },
      cartellaLog: s.log, tempoTotaleMs: 840_000, adesso: () => ora });
    assert.equal(dati.length, 2, "il terzo passo non doveva partire");
    assert.equal(lenti.esiti[2].stato, "cieco");
    assert.match(lenti.esiti[2].nota, /tempo finito/);
  } finally {
    rmSync(s.dir, { recursive: true, force: true });
  }
});
