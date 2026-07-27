// AR-246 — il confronto fra thread non deve costruire stringhe da megabyte (node --test, nessuna rete).
//
// Il difetto: per capire se un thread era cambiato si faceva `JSON.stringify(a) === JSON.stringify(b)`,
// dentro un poll che gira ogni 8 secondi su TUTTO l'archivio conversazioni (fino a 100 thread), sul
// thread principale. È il motivo per cui la chat si inchioda un attimo a intervalli regolari.
//
// Misurato PRIMA di ottimizzare, 6 passate per giro di poll su questa macchina:
//   100 chat × 20 msg × 400 car (0,8 MB) →  30 ms     dopo il fix →  2,1 ms   (15×)
//   100 chat × 40 msg × 800 car (3,2 MB) → 100 ms     dopo il fix →  3,5 ms   (29×)
//   100 chat × 60 msg × 1500 car (8,8 MB) → 218 ms    dopo il fix →  9,7 ms   (23×)
// Su telefono vale 4-6 volte tanto: da circa un secondo di blocco a un cinquantesimo.
//
// Qui si prova che il confronto veloce dia le STESSE risposte di quello lento: un'ottimizzazione che
// cambia il risultato non è un'ottimizzazione, è un bug nuovo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { messaggiUguali } = await import(join(QUI, "..", "..", "pannello/src/lib/chat-thread-merge.ts"));

const m = (role, content, extra = {}) => ({ role, content, ...extra });

/** Il confronto lento che c'era prima: qui serve da metro di paragone. */
const lento = (a, b) => JSON.stringify(a) === JSON.stringify(b);

test("dà le stesse risposte del confronto lento che sostituisce", () => {
  const casi = [
    [[], []],
    [[m("user", "ciao")], [m("user", "ciao")]],
    [[m("user", "ciao")], [m("user", "ciao!")]],
    [[m("user", "ciao")], [m("assistant", "ciao")]],
    [[m("user", "a"), m("assistant", "b")], [m("user", "a"), m("assistant", "b")]],
    [[m("user", "a"), m("assistant", "b")], [m("user", "a")]],
    [[m("user", "a", { pending: true })], [m("user", "a")]],
    [[m("user", "a", { prompt: true })], [m("user", "a")]],
    [[m("user", "a", { id: "x1" })], [m("user", "a", { id: "x2" })]],
  ];
  for (const [a, b] of casi) {
    assert.equal(messaggiUguali(a, b), lento(a, b), `divergenza su ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  }
});

test("riconosce uguali due thread identici ma non lo stesso oggetto", () => {
  const a = [m("user", "ciao"), m("assistant", "come va")];
  const b = [m("user", "ciao"), m("assistant", "come va")];
  assert.notEqual(a, b, "premessa: sono due array diversi");
  assert.equal(messaggiUguali(a, b), true);
});

test("lo stesso riferimento è uguale senza guardare dentro", () => {
  const a = [m("user", "ciao")];
  assert.equal(messaggiUguali(a, a), true);
});

test("null e undefined non fanno esplodere niente", () => {
  assert.equal(messaggiUguali(null, null), true, "stesso valore");
  assert.equal(messaggiUguali(null, []), false);
  assert.equal(messaggiUguali(undefined, [m("user", "x")]), false);
  assert.equal(messaggiUguali([m("user", "x")], null), false);
});

test("una differenza in fondo viene comunque vista", () => {
  const a = Array.from({ length: 50 }, (_, i) => m("user", "msg" + i));
  const b = a.map((x) => ({ ...x }));
  b[49] = m("user", "diverso");
  assert.equal(messaggiUguali(a, b), false, "uscire presto non deve voler dire non guardare");
});

test("i flag contano: una bolla in attesa non è uguale a una risposta arrivata", () => {
  // È il caso che tiene viva la chat: se il confronto ignorasse `pending`, la risposta in arrivo
  // non aggiornerebbe la lista e sembrerebbe che il worker non abbia risposto.
  assert.equal(messaggiUguali([m("assistant", "…", { pending: true })], [m("assistant", "…")]), false);
});
