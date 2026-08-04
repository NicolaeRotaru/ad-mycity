#!/usr/bin/env node
// 🧪 IL PROSSIMO NUMERO LIBERO (cervello/prossimo-ar.mjs).
//
// Il caso vero, 4/8: io scrivo la scheda AR-518 alle 00:52 leggendo la MIA copia del cantiere; il
// worker ne scrive un'altra AR-518 alle 02:13 leggendo la SUA. Quando i due rami si incontrano una
// delle due sparisce — ed è successo, tre volte in un giorno. Il numero libero non sta nella propria
// copia: sta su main, che intanto cammina.

import { test } from "node:test";
import assert from "node:assert/strict";
import { numeriUsati, prossimiLiberi, duplicati } from "../prossimo-ar.mjs";

test("il numero libero si calcola su TUTTE le fonti, non sulla propria", () => {
  const mio = numeriUsati([{ id: "AR-1" }, { id: "AR-2" }]);
  const suMain = numeriUsati([{ id: "AR-1" }, { id: "AR-3" }, { id: "AR-4" }]);
  // Guardando solo la mia copia direi 3 — ed è proprio la collisione del 4/8.
  assert.deepEqual(prossimiLiberi([mio], 1), [3], "la propria copia da sola risponde 3");
  assert.deepEqual(prossimiLiberi([mio, suMain], 1), [5], "con main dentro, il primo libero è 5");
});

test("i buchi vecchi NON si riusano: il numero va sempre avanti", () => {
  // La prima stesura riempiva i buchi e proponeva AR-97 per una scheda di oggi: un id che si
  // riavvolge non identifica più, e chi legge il cantiere usa il numero per orientarsi nel tempo.
  const usati = numeriUsati([{ id: "AR-1" }, { id: "AR-3" }]);
  assert.deepEqual(prossimiLiberi([usati], 3), [4, 5, 6], "riparte dopo l'ultimo, non dal buco");
});

test("un id storto non conta come numero preso", () => {
  assert.deepEqual(numeriUsati([{ id: "AR-7" }, { id: "AR-x" }, { id: "" }, {}, null]), [7]);
});

test("due schede con lo stesso numero si vedono", () => {
  const dup = duplicati([{ id: "AR-5" }, { id: "AR-5" }, { id: "AR-6" }]);
  assert.deepEqual(dup, [{ id: "AR-5", quante: 2 }], "alla prima unione una delle due sparirebbe");
  assert.deepEqual(duplicati([{ id: "AR-5" }, { id: "AR-6" }]), []);
});

test("sul cantiere VERO non ci sono numeri usati due volte", async () => {
  const { readFileSync } = await import("node:fs");
  const { join, dirname } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const c = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const dup = duplicati(c.difetti || []);
  assert.deepEqual(dup, [], `numeri usati due volte: ${dup.map((d) => d.id).join(", ")}`);
});
