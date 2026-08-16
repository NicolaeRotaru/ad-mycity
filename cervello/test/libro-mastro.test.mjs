// 📒 LE PROVE DEL LIBRO MASTRO — su stati finti, mai sul registro vero.
//
// Il registro vero cambia a ogni mossa: una prova che lo leggesse misurerebbe la sessione di oggi
// invece del comportamento del codice, e sarebbe verde o rossa per motivi che non c'entrano niente.
//
// LA PROVA CHE CONTA QUI è quella sulla riga aperta e mai chiusa. È la mossa 3 concordata con Nicola:
// distinguere «la guardia ha detto ok» da «la guardia non è mai arrivata a parlare». Se quella prova
// diventa verde per sbaglio, il silenzio di una guardia morta torna a valere come un via libera — che
// è esattamente il difetto per cui questo file è stato scritto.

import assert from "node:assert/strict";
import test from "node:test";
import {
  VERDETTI,
  abbina,
  buchi,
  delTurno,
  riepilogo,
  rigaApertura,
  rigaChiusura,
  righeDaTesto,
  strumentiVisti,
} from "../libro-mastro.mjs";

const ORA = "2026-08-16T16:00:00.000Z";
const apre = (id, extra = {}) =>
  rigaApertura({ id, guardia: "sorvegliante", evento: "PostToolUse", strumento: "Edit", bersaglio: "cervello/x.mjs", turno: "abc123", quando: ORA, ...extra });
const chiude = (id, verdetto = "ok", motivo = "") => rigaChiusura({ id, verdetto, motivo, quando: ORA });

test("una guardia che apre e chiude lascia un'azione guardata, col suo verdetto", () => {
  const [a] = abbina([apre("1"), chiude("1", "blocca", "malattia nuova")]);
  assert.equal(a.guardata, true);
  assert.equal(a.verdetto, "blocca");
  assert.equal(a.motivo, "malattia nuova");
  assert.equal(a.guardia, "sorvegliante");
});

test("LA REGOLA CHE CONTA: una riga aperta e mai chiusa NON è un ok — è una mossa senza guardia", () => {
  const azioni = abbina([apre("1"), chiude("1"), apre("2")]);
  const vuoti = buchi(azioni);
  assert.equal(vuoti.length, 1, "la mossa 2 è passata senza che la guardia rispondesse");
  assert.equal(vuoti[0].id, "2");
  assert.equal(azioni.find((a) => a.id === "2").guardata, false);
  assert.equal(
    riepilogo(azioni).per_verdetto.non_guardata,
    1,
    "nel conto deve comparire come non_guardata, non sparire fra gli ok",
  );
});

test("una chiusura orfana non si butta in silenzio: diventa un'azione visibile", () => {
  const [a] = abbina([chiude("9", "ok")]);
  assert.equal(a.apertura_mancante, true);
  assert.equal(a.guardata, false, "senza apertura non so nemmeno su cosa stesse guardando");
});

test("un verdetto fuori dall'elenco non inventa una categoria nuova: ricade su ok", () => {
  const r = chiude("1", "fantasia");
  assert.ok(VERDETTI.includes(r.verdetto));
  assert.equal(r.verdetto, "ok");
});

test("il filtro del turno tiene solo le mosse di QUEL turno", () => {
  const azioni = abbina([apre("1", { turno: "aaa" }), chiude("1"), apre("2", { turno: "bbb" }), chiude("2")]);
  assert.deepEqual(delTurno(azioni, "aaa").map((a) => a.id), ["1"]);
});

test("un filtro senza turno NON svuota il registro: torna tutto", () => {
  const azioni = abbina([apre("1", { turno: "aaa" }), chiude("1")]);
  assert.equal(delTurno(azioni, "").length, 1, "senza ancora si mostra tutto, non niente");
});

test("una riga corrotta si salta e non porta giù le altre", () => {
  const testo = [JSON.stringify(apre("1")), "{questo non è json", JSON.stringify(chiude("1"))].join("\n");
  const righe = righeDaTesto(testo);
  assert.equal(righe.length, 2);
  assert.equal(abbina(righe)[0].guardata, true);
});

test("il bersaglio si taglia: il registro dice cosa è stato guardato, non ricopia il lavoro", () => {
  const r = rigaApertura({ id: "1", guardia: "g", evento: "e", strumento: "Bash", bersaglio: "x".repeat(500), quando: ORA });
  assert.equal(r.bersaglio.length, 200);
});

test("gli strumenti visti sono unici e in ordine: è la materia prima della mappa di copertura", () => {
  const azioni = abbina([
    apre("1", { strumento: "Bash" }),
    chiude("1"),
    apre("2", { strumento: "Edit" }),
    chiude("2"),
    apre("3", { strumento: "Bash" }),
    chiude("3"),
  ]);
  assert.deepEqual(strumentiVisti(azioni), ["Bash", "Edit"]);
});

test("il riepilogo conta per guardia e per verdetto senza perdere pezzi", () => {
  const azioni = abbina([apre("1"), chiude("1", "ok"), apre("2", { guardia: "mano-fermata" }), chiude("2", "nega")]);
  const r = riepilogo(azioni);
  assert.equal(r.azioni, 2);
  assert.equal(r.per_guardia.sorvegliante, 1);
  assert.equal(r.per_guardia["mano-fermata"], 1);
  assert.equal(r.per_verdetto.nega, 1);
  assert.equal(r.buchi, 0);
});
