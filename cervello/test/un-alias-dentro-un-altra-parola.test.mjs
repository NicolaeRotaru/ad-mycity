#!/usr/bin/env node
// 🧪 AR-805 — «Frutta» dentro «sfruttava»: il conto degli asset accusava il documento sbagliato.
//
// Il caso, misurato il 23/8/2026. Il guardiano dell'allocazione (AR-006) tiene d'occhio una cosa
// giusta: che lo sforzo pesante non si accumuli su un negozio che non ha ancora firmato. Per farlo
// deve capire a quale negozio è intestato un documento, e lo faceva contando le occorrenze del nome
// con `blob.split(alias).length - 1` — cioè per SOTTOSTRINGA.
//
// `Peretti Frutta e Verdura` genera l'alias «frutta». Due referti di design che quel negozio non lo
// nominano nemmeno una volta contenevano le parole **sfruttava** e **sfruttabile**, che parlano di
// codice. Il guardiano li ha contati come asset pesanti di quel negozio, ha gridato al silo, e il
// cancello del lotto è diventato rosso su un lavoro che non c'entrava niente.
//
// Un guardiano che accusa il documento sbagliato si impara a ignorare, ed è la fine di un guardiano.
//
// I confini li scrive `\p{L}` e non `\b`: in JavaScript `\b` conosce solo l'ASCII, quindi un nome
// con l'accento — qui la norma, non l'eccezione — avrebbe un confine dove non c'è. Stessa trappola
// già pagata in `si-capisce.mjs` con «cioè» (AR-493).

import { test } from "node:test";
import assert from "node:assert/strict";
import { entitaPrimaria, occorrenzeIntere } from "../allocazione-check.mjs";

const NEGOZI = [
  { nome: "Peretti Frutta e Verdura", stato: "scelta_ragionata" },
  { nome: "Pane Quotidiano", stato: "confermato" },
];

test("IL CASO CHE HA ROTTO: «frutta» dentro «sfruttava» non è una citazione del negozio", () => {
  assert.equal(occorrenzeIntere("la differenza che il difetto sfruttava", "frutta"), 0);
  assert.equal(occorrenzeIntere("non è un difetto sfruttabile", "frutta"), 0);
  assert.equal(entitaPrimaria("la differenza che il difetto sfruttava", NEGOZI), null);
});

test("la parola intera invece si conta, e non basta che sia attaccata alla punteggiatura", () => {
  assert.equal(occorrenzeIntere("abbiamo comprato frutta", "frutta"), 1);
  assert.equal(occorrenzeIntere("Frutta, verdura e pane.", "frutta"), 1);
  assert.equal(occorrenzeIntere("(frutta)", "frutta"), 1);
  assert.equal(occorrenzeIntere("«frutta»", "frutta"), 1);
});

test("i confini reggono l'italiano accentato, dove `\\b` non arriva", () => {
  // `\b` conosce solo l'ASCII: dopo una lettera accentata non vede nessun confine, quindi un nome
  // accentato sarebbe risultato citato dentro parole che non lo contengono affatto.
  assert.equal(occorrenzeIntere("il caffè è pronto", "caffè"), 1);
  assert.equal(occorrenzeIntere("caffèlatte", "caffè"), 0, "attaccato a un'altra parola non è una citazione");
  assert.equal(occorrenzeIntere("perché", "per"), 0);
});

test("un nome intero pesa più di una parola sola, e il documento va al negozio giusto", () => {
  const blob = "Oggi parliamo di Peretti Frutta e Verdura e del suo banco.";
  assert.equal(entitaPrimaria(blob, NEGOZI), "Peretti Frutta e Verdura");
});

test("il frontmatter comanda, ma anche lì la parola dev'essere intera", () => {
  assert.equal(entitaPrimaria("negozio: Pane Quotidiano\n\ntesto", NEGOZI), "Pane Quotidiano");
  // «panettone» contiene «pane», e un documento sul panettone non è intestato al fornaio.
  assert.equal(entitaPrimaria("negozio: panettone artigianale\n\ntesto", NEGOZI), null);
});

test("un blob senza nessun negozio non viene adottato da nessuno", () => {
  assert.equal(entitaPrimaria("un documento che parla solo di codice", NEGOZI), null);
  assert.equal(entitaPrimaria("", NEGOZI), null);
});

test("un alias con caratteri speciali non fa esplodere l'espressione", () => {
  // Un nome con la parentesi o il punto arriverebbe dritto dentro una regex: va protetto, o il
  // guardiano muore su un negozio che si chiama «Da Gino (il vero)».
  assert.doesNotThrow(() => occorrenzeIntere("testo", "Da Gino (il vero)"));
  assert.equal(occorrenzeIntere("siamo da Da Gino (il vero) oggi", "Da Gino (il vero)"), 1);
});
