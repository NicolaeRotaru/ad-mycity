// 🎯 Le prove della SCHEDA PRIMA DI COMINCIARE (AR-519) — le lezioni giuste per QUESTA richiesta.
//
// Cosa difendono: la selezione pesca per TEMA (tag prima del testo), le correzioni di Nicola a
// parità di tema vengono prima, sotto la soglia si tace (una scheda che allega lezioni a caso è
// rumore, e il rumore spegne i freni), e il tetto tiene la scheda leggibile.

import test from "node:test";
import assert from "node:assert/strict";
import { PUNTI_MINIMI, lezioniSuMisura, paroleChiave } from "../contesto-lezioni.mjs";

const LEZIONI = [
  { id: "L-1", testo: "Prima di aprire una PR fai il rebase del ramo sulla base.", tag: ["pr", "rebase"], stato: "attiva" },
  { id: "L-2", testo: "Il pagamento Stripe va riconciliato col payout del negozio.", tag: ["stripe", "payout"], stato: "attiva" },
  { id: "L-3", testo: "Nel rebase i conflitti si risolvono guardando la base, non la copia.", tag: ["rebase", "conflitti"], stato: "attiva", caso_studio_nicola: true },
  { id: "L-4", testo: "Una lezione decaduta non deve tornare nel contesto.", tag: ["rebase"], stato: "decaduta" },
];

test("le parole-tema escono minuscole, senza accenti e senza parole vuote", () => {
  const p = paroleChiave("Perché VOGLIO fare il REBASE della PR però bene");
  assert.ok(p.includes("rebase"));
  assert.ok(!p.includes("perche"), "le parole vuote legano le frasi, non dicono il tema");
  assert.ok(!p.includes("voglio"));
});

test("si pesca per tema: la richiesta sul rebase porta le lezioni del rebase, non quelle di Stripe", () => {
  const scelte = lezioniSuMisura("sistemami il rebase del ramo che ha conflitti", LEZIONI);
  const id = scelte.map((s) => s.id);
  assert.ok(id.includes("L-1") && id.includes("L-3"));
  assert.ok(!id.includes("L-2"), "una lezione fuori tema nella scheda è rumore che spegne il freno");
});

test("a parità di tema la correzione di Nicola viene prima: è il caso-studio prioritario della casa", () => {
  const scelte = lezioniSuMisura("rebase con conflitti sul ramo", LEZIONI);
  assert.equal(scelte[0].id, "L-3");
});

test("sotto la soglia si tace: una richiesta fuori tema non pesca niente", () => {
  assert.equal(lezioniSuMisura("organizza la festa di quartiere coi palloncini", LEZIONI).length, 0);
  assert.ok(PUNTI_MINIMI >= 3, "abbassare la soglia è allegare lezioni per caso");
});

test("una lezione decaduta non torna nel contesto nemmeno se il tema combacia", () => {
  const id = lezioniSuMisura("rebase del ramo", LEZIONI).map((s) => s.id);
  assert.ok(!id.includes("L-4"));
});

test("il tetto tiene la scheda leggibile: mai più di max lezioni", () => {
  const tante = Array.from({ length: 30 }, (_, i) => ({ id: `L-${i}`, testo: "rebase del ramo", tag: ["rebase"], stato: "attiva" }));
  assert.equal(lezioniSuMisura("rebase del ramo", tante, 8).length, 8);
});
