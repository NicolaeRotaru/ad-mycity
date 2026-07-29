#!/usr/bin/env node
// AR-289 — nove kit del cluster banche/legale hanno la stessa identica galleria copiata, e il
// guardiano li promuoveva lo stesso.
//
// Misurato il 28/7 sul parco vero, e tre misure indipendenti cadono sugli STESSI file:
//   · un blocco di galleria identico condiviso da **9 kit**, e un blocco di «domande diagnostiche»
//     condiviso da **10**;
//   · **9 kit** con l'intestazione «STRATO 5» due volte nello stesso file (incollata due volte);
//   · i **10 kit più sottili** del parco sono esattamente quel cluster (5.282-6.706 byte, contro una
//     mediana di 17.649).
//
// Non sono tre debiti: è uno solo — nove mestieri diversi con lo stesso testo dentro — e il metro
// vecchio (byte + esistenza della sezione E) non poteva vederlo.
//
// Qui si esegue il rilevatore su kit finti: due file identici scritti apposta provano la regola, il
// parco vero prova che la regola trova quello che c'è.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { DIFETTO, blocchiDi, difettiKit, fotocopie, stratiDi, stratiDuplicati } from "../stampo-metro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const GALLERIA = `## GALLERIA (integrazione) ${"parole di riempimento ".repeat(15)}`;

prova("il caso che ha rotto: tre kit con lo stesso blocco sono uno stampo incollato", () => {
  const c = fotocopie({ a: `# a\n\n${GALLERIA}`, b: `# b\n\n${GALLERIA}`, c: `# c\n\n${GALLERIA}` });
  assert.deepEqual(Object.keys(c).sort(), ["a", "b", "c"]);
  assert.equal(c.a, 1, "dice anche QUANTI blocchi sono copiati, non solo che lo sono");
});

prova("due soli non bastano: possono essere parenti, non fotocopie", () => {
  assert.deepEqual(fotocopie({ a: `# a\n\n${GALLERIA}`, b: `# b\n\n${GALLERIA}` }), {});
});

prova("un blocco corto non conta: sarebbe un titolo, non un contenuto copiato", () => {
  const corto = "## GALLERIA";
  assert.deepEqual(fotocopie({ a: corto, b: corto, c: corto }), {},
    "senza questa soglia ogni kit sarebbe fotocopia di ogni altro per via delle intestazioni");
  assert.deepEqual(blocchiDi("riga corta\n\nun'altra corta"), []);
});

prova("lo spazio non salva: indentare o andare a capo non fa di un blocco copiato un blocco nuovo", () => {
  const uno = `# a\n\n${GALLERIA}`;
  const due = `# b\n\n${GALLERIA.replace(/ /g, "\n  ")}`;
  const tre = `# c\n\n   ${GALLERIA}   `;
  assert.equal(Object.keys(fotocopie({ uno, due, tre })).length, 3);
});

prova("il caso che ha rotto, seconda faccia: STRATO 5 due volte è un kit incollato male", () => {
  const rotto = "# 📚 STRATO 3 — SAPERE\n# 🖼️ STRATO 5 — GALLERIA\n# ⛽ STRATO 6\n# 🖼️ STRATO 5 — GALLERIA (integrazione)\n";
  assert.deepEqual(stratiDi(rotto), ["3", "5", "6", "5"]);
  assert.deepEqual(stratiDuplicati(rotto), ["5"]);
  assert.deepEqual(stratiDuplicati("# STRATO 3\n# STRATO 4\n# STRATO 5\n"), [], "l'ordine giusto non è un difetto");
});

prova("i due difetti sono distinti: un kit può essere copiato senza essere rotto, e viceversa", () => {
  const soloCopia = difettiKit({ testo: "# k\n\n## E. x\n", bytes: 9999, soglia: 100, blocchiCopiati: 2 });
  assert.deepEqual(soloCopia, [DIFETTO.KIT_FOTOCOPIA]);
  const soloRotto = difettiKit({ testo: "# k\n\n## E. x\n\n# STRATO 5\n# STRATO 5\n", bytes: 9999, soglia: 100 });
  assert.deepEqual(soloRotto, [DIFETTO.KIT_STRUTTURA_ROTTA]);
});

prova("un kit assente resta un difetto suo, e non si confonde con uno sottile", () => {
  assert.deepEqual(difettiKit({ testo: null }), [DIFETTO.KIT_ASSENTE]);
});

// ── Il parco VERO ───────────────────────────────────────────────────────────

prova("sul parco vero il rilevatore trova il cluster che il metro vecchio promuoveva", () => {
  const r = spawnSync("node", [join(REPO, "cervello/stampo-check.mjs"), "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.ok(j.per_tipo[DIFETTO.KIT_FOTOCOPIA] >= 3,
    `atteso il cluster delle fotocopie, trovato ${j.per_tipo[DIFETTO.KIT_FOTOCOPIA]}`);
  assert.ok(j.per_tipo[DIFETTO.KIT_STRUTTURA_ROTTA] >= 3,
    `atteso il cluster degli strati duplicati, trovato ${j.per_tipo[DIFETTO.KIT_STRUTTURA_ROTTA]}`);
});

prova("il debito è dichiarato per NOME: stesso conteggio con un nome diverso è comunque un rosso", () => {
  // La regola che tiene onesto il punteggio: «uno riparato + uno nuovo» pareggia il totale ma è un
  // peggioramento. Un'esenzione può solo abbassare un punteggio, mai alzarlo.
  const base = JSON.parse(spawnSync("node", ["-e", "process.stdout.write(require('fs').readFileSync('cervello/stampo-baseline.json','utf8'))"], { cwd: REPO, encoding: "utf8" }).stdout);
  assert.ok(base.debito && Object.keys(base.debito).length > 0, "il debito esiste ed è per nome");
  assert.ok(Object.values(base.debito).every((v) => Array.isArray(v)), "ogni nome porta l'elenco dei SUOI difetti");
  assert.ok(String(base.dichiarato_il || "").startsWith("2026-"), "e la dichiarazione porta una data");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
