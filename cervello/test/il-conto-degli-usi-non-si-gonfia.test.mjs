#!/usr/bin/env node
// 🔢 AR-898 — IL CONTO DELLE VOLTE MENTIVA, IN UNA CASA DOVE «NESSUN NUMERO SENZA FONTE»
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `compattaUsi` riduce il diario di una lezione al primo uso e all'ultimo, e mette sull'ultimo un
// campo `volte` che il commento dichiara «il conto vero». Non lo era: `lista[0]` veniva TENUTO in
// lista E contato dentro `volte`, quindi la somma era il vero + 1 — e siccome si ricompatta a ogni
// scrittura, l'errore si SOMMAVA. Misurato prima di curare: ventuno usi veri, trentadue dichiarate.
//
// Altre due cose sbagliate nello stesso pezzo:
//   · l'ordine si faceva confrontando TESTO, quindi un `quando` che non è una data finiva per
//     sempre in fondo — cioè diventava «l'ultimo uso» per sempre, e da lì ogni uso nuovo veniva
//     potato appena scritto;
//   · un uso-stringa si SBRICIOLAVA: `{ ...unaStringa }` dà `{0:"a",1:"b",…}`.
//
// ⚠️ I sedici numeri già scritti nel file vivo NON li ho indovinati: li ho CONTATI dal file
// pre-compattazione che sta nella storia di git (commit 7124c5677). Quattordici erano già giusti,
// due erano gonfi di due — e la somma corretta, 332, coincide con quella che il file aveva subito
// dopo la prima compattazione. Una correzione fatta a occhio, «meno uno a tutti», ne avrebbe
// sbagliati quattordici su sedici.

import test from "node:test";
import assert from "node:assert/strict";
import { compattaUsi } from "../freno-scattato.mjs";

const somma = (l) => l.reduce((n, u) => n + (Number(u?.volte) > 0 ? Number(u.volte) : 1), 0);
const usi = (n, ref = "R") =>
  Array.from({ length: n }, (_, i) => ({ ref, quando: `2026-08-${String(i + 1).padStart(2, "0")} 10:00` }));

test("AR-898 · dieci usi veri si dichiarano dieci, non undici", () => {
  assert.equal(somma(compattaUsi(usi(10))), 10);
});

test("AR-898 · e l'errore non si somma: ventuno usi restano ventuno dopo undici compattazioni", () => {
  let stato = compattaUsi(usi(10));
  for (let g = 11; g <= 21; g++) stato = compattaUsi([...stato, { ref: "R", quando: `2026-08-${g} 10:00` }]);
  assert.equal(somma(stato), 21, "il conto si gonfia a ogni compattazione: era 32");
});

test("AR-898 · sotto la soglia non si compatta e non compare nessun conto", () => {
  const due = compattaUsi(usi(2));
  assert.equal(due.length, 2);
  assert.equal(due.some((u) => "volte" in u), false, "un gruppo che non è stato potato non ha niente da dichiarare");
});

test("AR-898 · riferimenti diversi non si mescolano", () => {
  const misti = [...usi(5, "A"), ...usi(5, "B")];
  const dopo = compattaUsi(misti);
  assert.equal(somma(dopo.filter((u) => u.ref === "A")), 5);
  assert.equal(somma(dopo.filter((u) => u.ref === "B")), 5);
});

test("AR-898 · un «quando» che non è una data non diventa l'ultimo uso per sempre", () => {
  const avvelenato = [
    { ref: "R", quando: "in corso" },
    { ref: "R", quando: "2026-08-01 10:00" },
    { ref: "R", quando: "2026-08-20 10:00" },
  ];
  const ultimo = compattaUsi(avvelenato).at(-1);
  assert.equal(ultimo.quando, "2026-08-20 10:00",
    "una riga illeggibile è diventata «l'ultima volta»: da lì in poi ogni uso nuovo viene potato appena scritto");
});

test("AR-898 · …e l'uso di oggi arriva davvero nel diario, dopo l'avvelenamento", () => {
  let stato = [
    { ref: "R", quando: "in corso" },
    { ref: "R", quando: "2026-08-01 10:00" },
    { ref: "R", quando: "2026-08-20 10:00" },
  ];
  stato = compattaUsi([...stato, { ref: "R", quando: "2026-08-31 23:00" }]);
  assert.ok(stato.some((u) => u.quando === "2026-08-31 23:00"),
    "il comando direbbe «marcata» e sul disco non resterebbe niente");
});

test("AR-898 · un uso-stringa non si sbriciola in un dizionario di lettere", () => {
  const dopo = compattaUsi(["ciao", "ciao", "ciao"]);
  for (const u of dopo) {
    if (typeof u === "string") continue;
    assert.equal("0" in u, false, `una stringa è stata sparsa lettera per lettera: ${JSON.stringify(u)}`);
    assert.equal(u.ref, "ciao");
  }
  assert.equal(somma(dopo), 3);
});

test("AR-898 · quello che non è una lista torna una lista vuota, non esplode", () => {
  for (const x of [null, undefined, 42, "no", {}]) assert.deepEqual(compattaUsi(x), []);
});

test("AR-898 · i quattro che leggono questo campo trovano ancora quello che cercano", () => {
  const dopo = compattaUsi(usi(30));
  assert.ok(dopo.length > 0, "usi.length non deve mai andare a zero (volano-numeri)");
  assert.ok(dopo.some((u) => u.ref === "R"), "il ref deve restare (tasso-lezioni)");
  assert.equal(dopo.at(-1).quando, "2026-08-30 10:00", "la data più recente deve restare (lezione-viva)");
});
