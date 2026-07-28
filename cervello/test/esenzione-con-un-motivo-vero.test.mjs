#!/usr/bin/env node
// AR-337 — due buchi nella regola delle esenzioni, trovati provandola invece di rileggerla.
//
// AR-334 (lotto 28) ha fatto la cosa giusta: le esenzioni dichiarate in `malattie.json` adesso si
// sottraggono davvero, e quelle che non corrispondono più a niente fanno fallire il guardiano. Ma
// provando quell'implementazione su un albero finto — un'istanza vera, esenzioni sospette — sono
// uscite due strade per zittire una malattia senza curarla:
//
//   A. `perche: "boh"` passava. Il registro dice, nella sua stessa documentazione, che
//      «un'esenzione senza motivo è un silenzio, ed è la cosa che stiamo curando», e `porte-check`
//      pretende già più di dieci caratteri esattamente per questo. La regola c'era, il metro no.
//
//   B. **tre** esenzioni su un file con **una** sola istanza sottraevano tre. `Math.max(0, …)`
//      teneva il totale a zero e nascondeva il resto: bastava impilare voci per far sparire un file
//      intero dal conteggio, senza toccare una riga di codice.
//
// Sono la stessa forma dei difetti di questi lotti: una regola scritta bene, con un metro che non la
// fa rispettare. E si trovano solo eseguendo lo strumento su casi che non esistono ancora nel repo.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { MOTIVO_MIN, pesaEsenzioni } from "../spazzata-fratelli.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SCANNER = join(REPO, "cervello/spazzata-fratelli.mjs");
const MOTIVO = "qui lo zero è la misura giusta, e il caso pericoloso è già coperto due righe sopra";

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

/** Un repo finto con `istanze` occorrenze della malattia in un file solo, e le esenzioni date. */
function scansiona(esenti, istanze = 1) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-es-"));
  try {
    mkdirSync(join(dir, "cervello"), { recursive: true });
    const riga = "x=$(jq -r '.campo // 0')\n";
    writeFileSync(join(dir, "cervello/a.sh"), riga.repeat(istanze));
    const reg = {
      _cosa_e: "registro di prova",
      malattie: [{
        id: "m", nome: "m", perche_e_grave: "x",
        pattern: "jq -r '[^'\\n]*// 0'",
        dove: ["cervello"], estensioni: [".sh"],
        baseline: 0, file_noti: ["cervello/a.sh"], esenti,
      }],
    };
    const rp = join(dir, "malattie.json");
    writeFileSync(rp, JSON.stringify(reg));
    const r = spawnSync("node", [SCANNER], { encoding: "utf8", env: { ...process.env, SPAZZATA_REPO: dir, SPAZZATA_REGISTRO: rp } });
    return { rc: r.status, out: `${r.stdout}${r.stderr}` };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// ── I due casi che passavano ────────────────────────────────────────────────

prova("A · il caso che passava: «boh» non è un motivo", () => {
  const r = scansiona([{ file: "cervello/a.sh", quale: "q", perche: "boh" }]);
  assert.equal(r.rc, 1, "un'esenzione con due lettere di motivo non deve sottrarre niente");
  assert.match(r.out, /motivo è troppo corto/);
});

prova("B · il caso che passava: tre esenzioni per una sola istanza", () => {
  const r = scansiona([1, 2, 3].map((i) => ({ file: "cervello/a.sh", quale: `q${i}`, perche: MOTIVO })));
  assert.equal(r.rc, 1, "impilare esenzioni non deve poter zittire un file");
  assert.match(r.out, /più esenzioni \(2\) che istanze \(1\)/);
});

prova("e quella legittima continua a valere: il fix non è un giro di vite generico", () => {
  // Se questo diventasse rosso, il lotto 28 sarebbe stato annullato invece che rifinito.
  const r = scansiona([{ file: "cervello/a.sh", quale: "q", perche: MOTIVO }]);
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.match(r.out, /1 trovate − 1 esenti dichiarate/);
});

prova("tre esenzioni motivate su TRE istanze vere: tutte valide", () => {
  const r = scansiona([1, 2, 3].map((i) => ({ file: "cervello/a.sh", quale: `q${i}`, perche: MOTIVO })), 3);
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.match(r.out, /3 trovate − 3 esenti dichiarate/);
});

// ── La decisione, eseguita ──────────────────────────────────────────────────

prova("la soglia del motivo è dichiarata, non nascosta in un numero", () => {
  assert.equal(typeof MOTIVO_MIN, "number");
  const corto = pesaEsenzioni([{ file: "a", perche: "x".repeat(MOTIVO_MIN) }], new Map([["a", 1]]));
  const giusto = pesaEsenzioni([{ file: "a", perche: "x".repeat(MOTIVO_MIN + 1) }], new Map([["a", 1]]));
  assert.equal(corto.valide.length, 0, "alla soglia esatta non basta");
  assert.equal(giusto.valide.length, 1);
});

prova("ogni scarto dice PERCHÉ: un guardiano che dice solo «no» fa indovinare", () => {
  const r = pesaEsenzioni(
    [{ perche: MOTIVO }, { file: "a", perche: "no" }, { file: "b", perche: MOTIVO }, { file: "a", perche: MOTIVO }, { file: "a", perche: MOTIVO }],
    new Map([["a", 1]]),
  );
  assert.equal(r.valide.length, 1);
  assert.equal(r.orfane.length, 4);
  for (const o of r.orfane) assert.ok(o._scarto && o._scarto.length > 5, `scarto senza motivo: ${JSON.stringify(o)}`);
  assert.deepEqual(
    r.orfane.map((o) => o._scarto.split(":")[0].split(" (")[0]),
    ["senza file", "il motivo è troppo corto per essere un motivo", "nessuna istanza in questo file", "più esenzioni"],
  );
});

prova("nessuna esenzione, nessuna scusa: il caso normale resta identico", () => {
  const r = pesaEsenzioni([], new Map([["a", 3]]));
  assert.deepEqual(r, { valide: [], orfane: [] });
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

prova("sul repo vero il guardiano resta verde: l'esenzione che c'è è motivata e capiente", () => {
  const r = spawnSync("node", [SCANNER, "--json"], { cwd: REPO, encoding: "utf8" });
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
  const j = JSON.parse(r.stdout);
  for (const m of j.malattie) assert.equal((m.esenti_orfane || []).length, 0, `${m.id}: esenzioni orfane`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
