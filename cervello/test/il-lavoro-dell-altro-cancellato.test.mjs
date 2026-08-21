// Le prove del FRENO SULLA MEMORIA PERSA (cervello/memoria-senza-perdite.mjs + scrivi-json.mjs).
//
// AR-296 aveva due metà. La prima — il file lasciato a metà — è chiusa da luglio. La seconda era
// scritta in cima a `scrivi-json.mjs` e lasciata aperta:
//
//     ② Due processi che leggono lo stesso file, ci aggiungono una cosa ciascuno e risalvano:
//        l'ultimo che scrive cancella la riga del primo.
//
// Non è teoria. Su 1.489 revisioni di `apprendimento.json` da fine giugno, il conto delle lezioni è
// SCESO sei volte — undici lezioni — e nessuno di quei sei lavori era il potatore: erano un cutover,
// un chore, una risposta del worker, due giri e una riconciliazione, ognuno con in mano una copia
// vecchia dell'archivio.
//
// Le due direzioni contano tutte e due. Deve rimettere ciò che sparisce senza essere dichiarato, e
// deve LASCIAR TOGLIERE a chi dichiara — se no il potatore non pota più, e il file cresce fino a
// sfondare il tetto di lettura della Cabina, che è il difetto AR-254 di ritorno.

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { primaDiScrivere, riparaPerdita, specDi, vociPerse } from "../memoria-senza-perdite.mjs";
import { scriviJsonAtomico } from "../scrivi-json.mjs";

const SPEC = { campo: "lezioni", chiave: "id" };
const arch = (...ids) => ({ aggiornato: "x", lezioni: ids.map((id) => ({ id, testo: `contenuto di ${id}` })) });
const muto = () => {};

// ── il conto: chi è sparito ─────────────────────────────────────────────────

test("IL CASO DEL 21/8: due lezioni sparite dalla copia vecchia le vede", () => {
  const perse = vociPerse(arch("L-1", "L-2", "L-3", "L-4"), arch("L-1", "L-2"), SPEC);
  assert.deepEqual(perse, ["L-3", "L-4"]);
});

test("aggiungere non è perdere: chi scrive una lezione nuova non deve far scattare niente", () => {
  assert.deepEqual(vociPerse(arch("L-1"), arch("L-1", "L-2"), SPEC), [], "un allarme sul comportamento giusto si impara a ignorarlo");
});

test("cambiare il CONTENUTO di una lezione non è perderla", () => {
  const dopo = { lezioni: [{ id: "L-1", testo: "riscritta meglio" }] };
  assert.deepEqual(vociPerse(arch("L-1"), dopo, SPEC), []);
});

test("un archivio nuovo o illeggibile non è una perdita, e non accusa nessuno", () => {
  assert.deepEqual(vociPerse(null, arch("L-1"), SPEC), []);
  assert.deepEqual(vociPerse(arch("L-1"), { lezioni: "rotto" }, SPEC), []);
  assert.deepEqual(vociPerse({}, arch("L-1"), SPEC), []);
});

// ── la riparazione: cosa torna, e com'è ─────────────────────────────────────

test("le voci rimesse tornano col loro contenuto, non come guscio vuoto", () => {
  const { dati, riaggiunte } = riparaPerdita(arch("L-1", "L-2"), arch("L-1"), SPEC);
  assert.deepEqual(riaggiunte, ["L-2"]);
  assert.equal(dati.lezioni.length, 2);
  assert.equal(dati.lezioni.find((l) => l.id === "L-2").testo, "contenuto di L-2", "rimettere un id senza il testo sarebbe perdere lo stesso");
});

test("quello che il chiamante ha scritto resta intatto: si aggiunge, non si sovrascrive", () => {
  const nuovo = { lezioni: [{ id: "L-1", testo: "aggiornata adesso" }], extra: "campo mio" };
  const { dati } = riparaPerdita(arch("L-1", "L-2"), nuovo, SPEC);
  assert.equal(dati.extra, "campo mio");
  assert.equal(dati.lezioni.find((l) => l.id === "L-1").testo, "aggiornata adesso", "la modifica di chi scrive vince: il freno non la annulla");
});

test("senza perdite non tocca niente: stesso oggetto, nessuna copia", () => {
  const nuovo = arch("L-1");
  assert.equal(riparaPerdita(arch("L-1"), nuovo, SPEC).dati, nuovo);
});

// ── chi è sorvegliato, e chi no ─────────────────────────────────────────────

test("il freno vale sull'archivio delle lezioni, non su ogni JSON della casa", () => {
  assert.ok(specDi("/qualunque/percorso/apprendimento.json"), "è l'archivio dove una perdita è irreversibile");
  assert.equal(specDi("/x/cantiere-difetti.json"), null, "i registri che si rigenerano non entrano: sarebbe rumore");
  assert.equal(specDi(""), null);
});

// ── il permesso di chi toglie apposta ───────────────────────────────────────

test("chi DICHIARA di togliere passa: senza, il potatore non pota più", () => {
  const vecchio = arch("L-1", "L-2");
  const potato = arch("L-1");
  const dove = mkdtempSync(join(tmpdir(), "perdite-"));
  const file = join(dove, "apprendimento.json");
  writeFileSync(file, JSON.stringify(vecchio), "utf8");
  const uscito = primaDiScrivere(file, potato, { dichiaraRimozioni: true, log: muto });
  assert.equal(uscito.lezioni.length, 1, "il potatore ha il permesso, e senza di lui l'archivio sfonda il tetto della Cabina");
});

// ── la strada vera: passando da scriviJsonAtomico ───────────────────────────

test("IL CASO VERO, dal punto di scrittura: la copia vecchia non porta via niente", () => {
  const dove = mkdtempSync(join(tmpdir(), "perdite-"));
  const file = join(dove, "apprendimento.json");
  // Sul disco c'è l'archivio con le due lezioni arrivate da PR firmate.
  writeFileSync(file, `${JSON.stringify(arch("L-vecchia", "L-2026-0821-01", "L-2026-0821-02"), null, 1)}\n`, "utf8");
  // Un processo che aveva letto PRIMA risalva la sua copia: le due lezioni non ci sono.
  const err = console.error;
  console.error = muto;
  try {
    scriviJsonAtomico(file, arch("L-vecchia"));
  } finally {
    console.error = err;
  }
  const dopo = JSON.parse(readFileSync(file, "utf8"));
  assert.deepEqual(
    dopo.lezioni.map((l) => l.id).sort(),
    ["L-2026-0821-01", "L-2026-0821-02", "L-vecchia"],
    "è esattamente il commit delle 20:07 del 21/8: qui non deve più succedere",
  );
});

test("e l'incidente si grida: una memoria salvata in silenzio è indistinguibile dal difetto", () => {
  const dove = mkdtempSync(join(tmpdir(), "perdite-"));
  const file = join(dove, "apprendimento.json");
  writeFileSync(file, JSON.stringify(arch("L-1", "L-2")), "utf8");
  const detto = [];
  primaDiScrivere(file, arch("L-1"), { log: (m) => detto.push(String(m)) });
  const testo = detto.join("\n");
  assert.ok(testo.includes("L-2"), "chi legge il registro deve sapere QUALE voce stava sparendo");
  assert.match(testo, /AR-296/, "e da dove viene, o fra un mese sembrerà un allarme arbitrario");
});
