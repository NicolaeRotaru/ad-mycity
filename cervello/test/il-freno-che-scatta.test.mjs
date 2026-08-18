// 🛑 LA PROVA DEL FRENO CHE SCATTA (AR-770).
//
// Il caso vero, 18/8: Nicola guarda la Cabina e chiede perché solo il 12% delle lezioni risulta
// citato. Misurato: 61 su 521, e di quelle 61 solo SEI portano una traccia esplicita. Il numero
// contava le citazioni, non gli inciampi evitati.
//
// Qui si prova la cosa che rende quel numero vero: una lezione si marca usata quando il SUO freno
// diventa rosso. E soprattutto si prova il contrario — su verde non si marca niente — perché la
// scorciatoia disonesta (marcare a ogni consegna) alzerebbe il numero senza cambiare un comportamento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { chiaveFreno, lezioniDelFreno, marcatura } from "../freno-scattato.mjs";

const archivio = () => ({
  lezioni: [
    { id: "L-A", gate: "node --test cervello/test/sorvegliante.test.mjs" },
    { id: "L-B", gate: "node cervello/test/sorvegliante.test.mjs" },
    { id: "L-C", gate: "node cervello/ramo-pulito.mjs" },
    { id: "L-D" }, // senza freno: non deve mai essere toccata
  ],
});

test("il caso vero: un freno rosso marca le lezioni che quel freno protegge", () => {
  const d = archivio();
  const r = marcatura(d, "node cervello/test/sorvegliante.test.mjs", { rc: 1, quando: "2026-08-18 09:00" });
  assert.deepEqual(r.marcate.sort(), ["L-A", "L-B"]);
  assert.equal(d.lezioni.find((l) => l.id === "L-A").usi.length, 1);
  assert.match(d.lezioni.find((l) => l.id === "L-A").usi[0].ref, /freno rosso/);
});

test("su VERDE non marca niente: è la scorciatoia disonesta, e deve restare chiusa", () => {
  const d = archivio();
  const r = marcatura(d, "node cervello/test/sorvegliante.test.mjs", { rc: 0, quando: "2026-08-18 09:00" });
  assert.deepEqual(r.marcate, []);
  assert.equal(d.lezioni.every((l) => !l.usi), true, "un freno verde non deve lasciare tracce");
});

test("il guardiano che mi blocca in faccia si aggancia alla prova che lo possiede", () => {
  // Chi mi ferma è `cervello/sorvegliante.mjs`; il freno della lezione è la sua PROVA. Un mestiere solo.
  const d = archivio();
  const r = marcatura(d, "cervello/sorvegliante.mjs", { rc: 2, quando: "2026-08-18 09:00" });
  assert.deepEqual(r.marcate.sort(), ["L-A", "L-B"]);
});

test("non tocca le lezioni di un altro freno, né quelle senza freno", () => {
  const d = archivio();
  marcatura(d, "node cervello/ramo-pulito.mjs", { rc: 1, quando: "2026-08-18 09:00" });
  assert.ok(d.lezioni.find((l) => l.id === "L-C").usi, "la sua sì");
  assert.equal(d.lezioni.find((l) => l.id === "L-A").usi, undefined, "quella di un altro freno no");
  assert.equal(d.lezioni.find((l) => l.id === "L-D").usi, undefined, "quella senza freno mai");
});

test("lo stesso rosso nello stesso istante non conta due volte: un guardiano rumoroso non gonfia il numero", () => {
  const d = archivio();
  marcatura(d, "node cervello/ramo-pulito.mjs", { rc: 1, quando: "2026-08-18 09:00" });
  const r2 = marcatura(d, "node cervello/ramo-pulito.mjs", { rc: 1, quando: "2026-08-18 09:00" });
  assert.deepEqual(r2.marcate, []);
  assert.equal(d.lezioni.find((l) => l.id === "L-C").usi.length, 1);
});

test("un comando senza script non marca niente: senza chiave non si indovina", () => {
  const d = archivio();
  assert.deepEqual(marcatura(d, "git status --short", { rc: 1, quando: "x" }).marcate, []);
  assert.equal(chiaveFreno("git status --short"), null);
});

test("la chiave regge le forme vere dei freni in archivio, code di prosa comprese", () => {
  assert.equal(chiaveFreno("node cervello/gate-veri.mjs — deve trovare, per OGNI lezione…"), "gate-veri");
  assert.equal(chiaveFreno("node cervello/mano-fermata.mjs --cablaggio"), "mano-fermata");
  assert.equal(chiaveFreno("node --test cervello/test/campo-commit-e-turno.test.mjs"), "campo-commit-e-turno");
});

// La prova sull'ARCHIVIO VERO: se domani nessun freno reale combacia più con nessuna lezione,
// questo aggancio è diventato decorativo e il test lo dice invece di lasciarlo credere.
test("sull'archivio vero: i freni davvero in uso agganciano lezioni davvero esistenti", async () => {
  const fs = await import("node:fs");
  const { APPR_PATH } = await import("../freno-scattato.mjs");
  if (!fs.existsSync(APPR_PATH)) return;
  const lez = JSON.parse(fs.readFileSync(APPR_PATH, "utf8")).lezioni || [];
  const colpite = lezioniDelFreno(lez, "node cervello/ramo-pulito.mjs");
  assert.ok(colpite.length >= 5, `il freno piu' usato aggancia solo ${colpite.length} lezioni: l'aggancio non morde piu'`);
});
