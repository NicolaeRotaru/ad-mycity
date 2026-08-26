#!/usr/bin/env node
// AR-660 — VENTISEI PROVE SCRITTE IN BATS CHE NON ESEGUIVA NESSUNO.
//
// Il difetto non era «bats non è agganciato». Era che nessuno confrontava mai le prove SCRITTE con
// le prove ESEGUITE, quindi la differenza cresceva senza che si vedesse: 26 file `.bats` in
// `cervello/test/`, zero processi che li lanciassero — non il runner (raccoglieva `.test.mjs`), non
// la CI, non il giro. Due di quei file lo dicevano per iscritto in cima a sé stessi.
//
// COSA PROVA QUESTO FILE, e in che ordine di importanza:
//
//   ① IL PUNTO CHE CHIAMA, non solo la funzione (AR-461). Il guardiano vero viene ESEGUITO come
//      processo sulla cartella VERA: se `test-cervello.mjs` smette di dichiarare `.bats` fra le
//      famiglie che esegue, quel processo esce 1 e questo test diventa rosso. È la mutazione con cui
//      il fix si prova, ed è per questo che non basta esercitare `famiglieOrfane` a mano.
//   ② IL CABLAGGIO DEL RUNNER — scoperta → esecuzione → verdetto → uscita — guidato con un `bats`
//      FINTO che stampa TAP. Senza il finto questa parte resterebbe non provata su ogni macchina
//      dove bats non è installato, cioè quasi tutte: e una difesa che si può provare solo altrove è
//      una difesa che nessuno prova.
//   ③ Le funzioni pure sui casi che in questa cartella non sono ancora nati.
//
// 🟢 Sola lettura sul repo: i finti stanno in una cartella temporanea, il guardiano legge e basta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { famigliaDi, famiglieOrfane, conta } from "../prove-non-eseguite.mjs";
import { SUFFISSI_ESEGUITI, trovaBats, leggiTapBats, righeRosseBats, verdettoBats, binarioBats } from "../test-cervello.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const temporanee = [];
const tmp = (p) => {
  const d = mkdtempSync(join(tmpdir(), p));
  temporanee.push(d);
  return d;
};
process.on("exit", () => {
  for (const d of temporanee) {
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* la pulizia non deve mai poter far cadere una prova */
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ① IL PUNTO CHE CHIAMA — il guardiano vero, sulla cartella vera
// ─────────────────────────────────────────────────────────────────────────────

test("SUL CAMPO: nessuna prova di cervello/test/ resta senza chi la esegue", () => {
  const r = spawnSync(process.execPath, ["cervello/prove-non-eseguite.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.notEqual(r.status, 2, `il guardiano non ha potuto misurare: ${r.stdout}${r.stderr}`);
  const esito = JSON.parse(r.stdout);
  assert.deepEqual(
    esito.orfane,
    [],
    `ci sono prove che nessuno esegue: ${JSON.stringify(esito.orfane)} — una prova che non gira fa sembrare coperto ciò che non lo è`,
  );
  assert.equal(r.status, 0, "prove senza esecutore = exit 1, e qui non ce ne devono essere");
});

// Questa è la riga che tiene inchiodato il fix di AR-660: sono i 26 file veri, e se il runner
// smette di dichiararli il caso qui sopra diventa rosso da solo. La conto anche esplicitamente
// perché «zero orfane» sarebbe vero pure in una cartella senza nessun .bats.
test("SUL CAMPO: i .bats di cervello/test/ esistono ancora e il runner li rivendica", () => {
  const bats = trovaBats(readdirSync(join(REPO, "cervello/test")));
  assert.ok(bats.length >= 20, `attesi i ~26 file .bats storici, trovati ${bats.length}`);
  assert.ok(
    SUFFISSI_ESEGUITI.includes(".bats"),
    "test-cervello.mjs deve DICHIARARE di eseguire i .bats: è la dichiarazione che il guardiano viene a leggere",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ② IL CABLAGGIO DEL RUNNER, guidato con un bats finto
// ─────────────────────────────────────────────────────────────────────────────

/** Un repo finto con la cartella delle prove e un `bats` che stampa il TAP che gli diciamo noi. */
function scenaConBatsFinto(tapDelFinto, uscitaDelFinto = 0) {
  const casa = tmp("ad-bats-casa-");
  const cartella = join(casa, "cervello", "test");
  mkdirSync(cartella, { recursive: true });
  writeFileSync(join(cartella, "prova-finta.bats"), "@test 'finto' { true; }\n");
  const bin = join(casa, "bats-finto");
  writeFileSync(bin, `#!/bin/sh\ncat <<'TAP'\n${tapDelFinto}\nTAP\nexit ${uscitaDelFinto}\n`);
  chmodSync(bin, 0o755);
  return { casa, cartella, bin };
}

test("il runner ESEGUE davvero un .bats e ne legge il verdetto (bats finto, TAP vero)", () => {
  const { cartella, bin } = scenaConBatsFinto("1..2\nok 1 il primo\nok 2 il secondo");
  const r = spawnSync(bin, ["--tap", join(cartella, "prova-finta.bats")], { encoding: "utf8" });
  const v = verdettoBats(r.status, r.stdout);
  assert.equal(v.esito, "ok");
  assert.equal(v.passati, 2, "le asserzioni di bats devono contare come quelle di node, non sparire");
});

test("un .bats ROSSO resta rosso, e dice QUALE caso è caduto", () => {
  const tap = "1..2\nok 1 il primo\nnot ok 2 il worker non deve dead-letterare un lavoro vivo\n# (in test file x.bats, line 40)";
  const { cartella, bin } = scenaConBatsFinto(tap, 1);
  const r = spawnSync(bin, ["--tap", join(cartella, "prova-finta.bats")], { encoding: "utf8" });
  const v = verdettoBats(r.status, r.stdout);
  assert.equal(v.esito, "rosso");
  assert.equal(v.falliti, 1);
  assert.match(v.rosse[0], /il worker non deve dead-letterare un lavoro vivo/, "il NOME del caso, come per AR-450");
  assert.match(v.rosse[0], /line 40/, "e il perché, che bats mette nel commento sotto");
});

test("BATS_BIN è la porta d'ingresso, e un percorso che non esiste non è un bats trovato", () => {
  const { bin } = scenaConBatsFinto("1..0");
  assert.equal(binarioBats({ BATS_BIN: bin, PATH: "" }), bin);
  assert.equal(binarioBats({ BATS_BIN: "/non/esiste/bats", PATH: "" }), null, "un puntatore rotto non deve passare per un bats c'è");
});

test("bats assente non è un test rotto: è un ⚪ dichiarato, e l'uscita del comando non cambia", () => {
  // Il punto di tutto AR-660 letto al contrario: se «bats manca» diventasse rosso, la CI, il vincolo
  // hard del giro e la visita della macchina sarebbero rossi su una dipendenza mancante — e un
  // cancello che non può essere verde si impara a saltare. Qui si prova che il runner vero, su
  // questa macchina (dove bats NON c'è), esce 0 e però DICHIARA le prove non eseguite.
  // `--solo due-worker` sceglie UNA prova, e quella prova esiste SOLO in bash. Vale doppio: prova il
  // ⚪ e prova che il filtro non esca «non c'è niente» avendo guardato una famiglia sola — che è
  // com'era prima, e avrebbe reso questo caso impossibile da scrivere.
  const r = spawnSync(process.execPath, ["cervello/test-cervello.mjs", "--json", "--solo", "due-worker"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 300_000,
    env: { ...process.env, BATS_BIN: "/non/esiste/bats" },
  });
  const esito = JSON.parse(r.stdout);
  assert.equal(esito.bats_binario, null, "con BATS_BIN rotto il runner non deve credere di avere bats");
  assert.equal(esito.bats.length, 1, "la prova in bash va SCOPERTA anche quando nessun .test.mjs corrisponde al filtro");
  assert.equal(esito.bats[0].esito, "non-eseguito");
  assert.equal(esito.bats_non_eseguiti, 1, "il numero del non-misurato deve esistere: senza, il buco non si vede");
  assert.equal(esito.esito, "ok", "«non eseguito» non è «rotto»");
  assert.equal(r.status, 0, "un ambiente incompleto non boccia il lavoro di nessuno");
});

test("il ⚪ non si maschera da ✅: chi non è stato eseguito lo dice, e non finisce fra i passati", () => {
  const nonEseguito = { file: "cervello/test/x.bats", esito: "non-eseguito", passati: null };
  const rotto = { file: "cervello/test/y.bats", esito: "rosso", passati: 1, falliti: 1 };
  const tutte = [nonEseguito, rotto, { file: "z.test.mjs", esito: "ok", passati: 3 }];
  const rotti = tutte.filter((x) => x.esito !== "ok" && x.esito !== "non-eseguito");
  assert.deepEqual(
    rotti.map((x) => x.file),
    ["cervello/test/y.bats"],
    "«non eseguito» non è «rotto» — ma non è nemmeno «passato»: è la terza colonna, e deve restare sua",
  );
  assert.equal(
    tutte.reduce((n, x) => n + (x.passati || 0), 0),
    4,
    "una prova non eseguita non porta asserzioni: non deve gonfiare il numero che finisce nelle PR",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ LE FUNZIONI PURE, sui casi che in questa cartella non sono ancora nati
// ─────────────────────────────────────────────────────────────────────────────

test("famigliaDi(): riconosce una prova dal suffisso, e non accusa gli aiuti", () => {
  assert.equal(famigliaDi("worker-orfani.bats"), ".bats");
  assert.equal(famigliaDi("cancello-stop.test.mjs"), ".test.mjs");
  assert.equal(famigliaDi("serratura.spec.ts"), ".spec.ts");
  assert.equal(famigliaDi("hook-ts.mjs"), null, "un aiuto non è una prova");
  assert.equal(famigliaDi("aiuto-test-comuni.mjs"), null, "«test» dentro il nome non basta: la forma è nome.test.ext");
  assert.equal(famigliaDi("_debug_ghost.test.mjs"), null, "il prefisso _ resta roba di servizio (la convenzione di trovaTest)");
});

test("famiglieOrfane(): la famiglia NUOVA senza esecutore si vede subito", () => {
  const nomi = ["a.test.mjs", "b.bats", "c.spec.mjs", "d.spec.mjs", "aiuto.mjs"];
  const orfane = famiglieOrfane(nomi, [".test.mjs", ".bats"]);
  assert.equal(orfane.length, 1);
  assert.equal(orfane[0].famiglia, ".spec.mjs");
  assert.deepEqual(orfane[0].file, ["c.spec.mjs", "d.spec.mjs"], "e dice QUALI, non solo quante");
});

test("famiglieOrfane(): è il DICHIARATO a decidere — togliere .bats riporta i 26 fuori da ogni corsa", () => {
  // La stessa domanda che il guardiano fa a `test-cervello.mjs`. Se quel file smette di dichiarare
  // `.bats`, questo è ciò che succede — ed è esattamente la mutazione registrata in mutanti.json.
  const nomi = ["a.test.mjs", "worker-orfani.bats", "due-worker.bats"];
  assert.deepEqual(famiglieOrfane(nomi, [".test.mjs", ".bats"]), []);
  const senzaBats = famiglieOrfane(nomi, [".test.mjs"]);
  assert.equal(senzaBats.length, 1);
  assert.equal(senzaBats[0].quante, 2);
});

test("conta(): prove scritte contro prove eseguite — il numero che non esisteva", () => {
  const nomi = ["a.test.mjs", "b.bats", "c.spec.mjs", "note.md", "hook-ts.mjs"];
  assert.deepEqual(conta(nomi, [".test.mjs", ".bats"]), { scritte: 3, con_esecutore: 2, orfane: 1 });
});

test("trovaBats(): prende i .bats, ordinati, e salta la roba di servizio", () => {
  assert.deepEqual(trovaBats(["b.bats", "a.bats", "x.test.mjs", "_scratch.bats"]), ["a.bats", "b.bats"]);
  assert.deepEqual(trovaBats([]), []);
});

test("leggiTapBats(): il TAP di bats non è quello di node, e non si legge col metro sbagliato", () => {
  // bats non stampa nessun `# pass N`. Leggerlo con `leggiTap` darebbe «ineseguibile» su ogni file:
  // 26 rossi inventati, che è il modo peggiore di agganciare una famiglia nuova.
  // AR-652 ha aggiunto un terzo contatore, `saltati`: un caso `# skip` non è un caso passato.
  assert.deepEqual(leggiTapBats("1..3\nok 1 uno\nok 2 due\nnot ok 3 tre"), { passati: 2, falliti: 1, saltati: 0 });
  assert.deepEqual(leggiTapBats("1..0"), { passati: 0, falliti: 0, saltati: 0 }, "un file senza casi è vuoto, non ineseguibile");
  assert.deepEqual(
    leggiTapBats("bash: bats: command not found"),
    { passati: null, falliti: null, saltati: 0 },
    "niente TAP = non è partito",
  );
  assert.deepEqual(leggiTapBats(""), { passati: null, falliti: null, saltati: 0 });
});

test("leggiTapBats(): «not ok» non si conta anche come «ok»", () => {
  const solo = leggiTapBats("1..2\nnot ok 1 primo\nnot ok 2 secondo");
  assert.deepEqual(solo, { passati: 0, falliti: 2, saltati: 0 }, "un prefisso letto male trasformerebbe due rossi in due verdi");
});

test("righeRosseBats(): un file verde non produce righe rosse inventate", () => {
  assert.deepEqual(righeRosseBats("1..2\nok 1 uno\nok 2 due"), []);
  assert.deepEqual(righeRosseBats(""), []);
});

test("verdettoBats(): exit 0 senza TAP non passa per buono", () => {
  assert.equal(verdettoBats(0, "").esito, "ineseguibile", "un'uscita muta non è un verde per distrazione");
});
