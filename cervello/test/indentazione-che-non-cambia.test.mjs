#!/usr/bin/env node
// AR-439 — il writer condiviso imponeva la SUA forma a ogni registro della memoria.
//
// IL DANNO, misurato il 29/7: `scrivi-json.mjs` scriveva sempre a due spazi, «per rendere il diff
// leggibile». Ma il cantiere dei difetti e i mutanti stanno a UNO. Risultato: bastava che un
// guardiano applicasse una chiusura (`auto-fix.mjs verifica --applica`) perché il file venisse
// riscritto per intero — **14.482 righe di diff per una parola cambiata**. Un diff così non lo
// rilegge nessuno: si mergia per fiducia, e la fiducia non è una prova. Nella stessa giornata è
// successo due volte, una per mano mia e una per mano del guardiano — segno che non era distrazione
// di qualcuno ma la forma del writer.
//
// Il freno sta al CONFINE dell'atto (dove si scrive), non nei chiamanti: i chiamanti sono decine e
// il prossimo nascerebbe di nuovo senza.

import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { scriviJsonAtomico, indentDi, testoJson } = await import(join(REPO, "cervello/scrivi-json.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const box = mkdtempSync(join(tmpdir(), "indent-"));
const dentro = (n) => join(box, n);

prova("il caso che ha rotto: un registro a UNO spazio resta a uno spazio", () => {
  const f = dentro("cantiere.json");
  writeFileSync(f, '{\n "aggiornato": "ieri",\n "difetti": [\n  {\n   "id": "AR-1"\n  }\n ]\n}\n');
  const dati = JSON.parse(readFileSync(f, "utf8"));
  dati.aggiornato = "oggi";
  scriviJsonAtomico(f, dati);
  const dopo = readFileSync(f, "utf8");
  assert.equal(indentDi(dopo), 1, `riscritto a ${indentDi(dopo)} spazi invece che a 1:\n${dopo}`);
  assert.match(dopo, /^ "aggiornato": "oggi",$/m);
});

prova("un file a DUE spazi resta a due: non si impone l'altro estremo", () => {
  const f = dentro("normale.json");
  writeFileSync(f, '{\n  "a": 1\n}\n');
  scriviJsonAtomico(f, { a: 2 });
  assert.equal(indentDi(readFileSync(f, "utf8")), 2);
});

prova("un file NUOVO nasce a due spazi, come prima", () => {
  const f = dentro("mai-visto.json");
  scriviJsonAtomico(f, { a: 1 });
  assert.equal(indentDi(readFileSync(f, "utf8")), 2);
});

prova("cambia la forma, mai il contenuto", () => {
  const f = dentro("contenuto.json");
  writeFileSync(f, '{\n "x": [1, 2],\n "y": {"z": "à è ì"}\n}\n');
  const atteso = { x: [1, 2, 3], y: { z: "à è ì" }, nuovo: true };
  scriviJsonAtomico(f, atteso);
  assert.deepEqual(JSON.parse(readFileSync(f, "utf8")), atteso);
});

prova("un file illeggibile non blocca la scrittura: si torna al default", () => {
  // Una scrittura che deve andare a buon fine non può fallire per come era formattato prima.
  const f = dentro("rotto.json");
  writeFileSync(f, "{ questo non è json");
  scriviJsonAtomico(f, { ok: true });
  assert.deepEqual(JSON.parse(readFileSync(f, "utf8")), { ok: true });
});

prova("indentDi legge anche un array in cima, non solo un oggetto", () => {
  assert.equal(indentDi('[\n {\n  "a": 1\n }\n]'), 1);
  assert.equal(indentDi('{\r\n    "a": 1\r\n}'), 4, "i fine-riga di Windows non devono ingannarlo");
  assert.equal(indentDi(""), 2, "senza niente da misurare vale il default");
});

prova("testoJson resta puro e finisce con l'a-capo", () => {
  assert.equal(testoJson({ a: 1 }, 1), '{\n "a": 1\n}\n');
  assert.equal(testoJson({ a: 1 }), '{\n  "a": 1\n}\n', "senza indent esplicito resta il 2 di prima");
});

prova("sul registro VERO: riscriverlo senza cambiare niente non produce diff", () => {
  // La prova che conta davvero: il cantiere dei difetti del repo, riscritto tale e quale, deve
  // tornare byte per byte identico. È esattamente ciò che non succedeva.
  const vero = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
  const prima = readFileSync(vero, "utf8");
  const copia = dentro("cantiere-vero.json");
  writeFileSync(copia, prima);
  scriviJsonAtomico(copia, JSON.parse(prima));
  assert.equal(readFileSync(copia, "utf8"), prima, "riscrivere il cantiere senza modifiche lo cambia");
});

rmSync(box, { recursive: true, force: true });

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
