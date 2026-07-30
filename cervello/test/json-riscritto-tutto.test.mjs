#!/usr/bin/env node
// 🧪 UN FILE RISCRITTO TUTTO PER CAMBIARE UNA RIGA.
//
// Il 30/7, per aggiungere un campo a ventuno lezioni, ho riscritto `apprendimento.json` con
// un'indentazione diversa da quella che aveva: +12.147 / −12.124 righe. Il contenuto era giusto.
// Era la forma a essere cambiata su ogni riga — e il costo è doppio: una PR che nessuno può
// rileggere, e un conflitto TOTALE per chiunque altro tocchi quel file. Cioè esattamente la
// famiglia di errori che stavo chiudendo in quel momento.
//
// L'ho scoperto solo perché Nicola ha chiesto di ricontrollare. Questo lo scopre da solo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { indentazione, riformattati } = await import(join(REPO, "cervello/forma-json.mjs"));

const DUE = '{\n  "a": 1,\n  "b": {\n    "c": 2\n  }\n}\n';
const UNO = '{\n "a": 1,\n "b": {\n  "c": 2\n }\n}\n';
const TAB = '{\n\t"a": 1\n}\n';

test("legge l'indentazione di un JSON", () => {
  assert.equal(indentazione(DUE), "2");
  assert.equal(indentazione(UNO), "1");
  assert.equal(indentazione(TAB), "tab");
});

test("un JSON su una riga sola non ha una forma da conservare", () => {
  assert.equal(indentazione('{"a":1}'), null);
  assert.equal(indentazione(""), null);
});

test("il caso vero: due spazi diventati uno", () => {
  const f = riformattati([{ file: "auto-coscienza/apprendimento.json", prima: DUE, dopo: UNO }]);
  assert.equal(f.length, 1);
  assert.equal(f[0].prima, "2");
  assert.equal(f[0].dopo, "1");
});

test("aggiungere una riga SENZA toccare la forma non è una violazione", () => {
  const conUnaChiaveInPiu = '{\n  "a": 1,\n  "b": {\n    "c": 2\n  },\n  "d": 3\n}\n';
  assert.deepEqual(riformattati([{ file: "x.json", prima: DUE, dopo: conUnaChiaveInPiu }]), []);
});

test("un file che era su una riga sola non fa scattare niente", () => {
  assert.deepEqual(riformattati([{ file: "x.json", prima: '{"a":1}', dopo: DUE }]), []);
});

test("più file insieme: nomina solo quelli fuori forma", () => {
  const f = riformattati([
    { file: "buono.json", prima: DUE, dopo: DUE },
    { file: "rotto.json", prima: DUE, dopo: UNO },
    { file: "anche-rotto.json", prima: UNO, dopo: TAB },
  ]);
  assert.deepEqual(f.map((x) => x.file), ["rotto.json", "anche-rotto.json"]);
});
