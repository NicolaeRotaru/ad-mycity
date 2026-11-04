/**
 * IL LAVORO GEMELLO — Nicola, 4/11/2026: «impedisci che si creano doppioni».
 *
 * Dal 4/11 il database rifiuta un lavoro identico a uno già in attesa (HTTP 409 «lavoro-gia-in-coda»,
 * codice del gemello in `details`). Il Pannello deve leggere quel rifiuto come «c'è già», e
 * nient'altro come «c'è già»: un 409 diverso o un corpo illeggibile restano un rifiuto vero.
 *
 * NON-VACUITÀ (verificata rompendo il codice apposta, il 4/11): togliendo il controllo su `message`,
 * il caso ② diventa ROSSO; togliendo il controllo sulla forma del codice, il caso ③ diventa ROSSO.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gemelloDaConflitto } from "./lavoro-gemello.ts";

const ID = "5643b47b-e651-4fb3-9905-663531b77034";
const corpo = (o: object) => JSON.stringify(o);

test("① il rifiuto del freno dà il codice del lavoro che aspetta già", () => {
  assert.equal(
    gemelloDaConflitto(409, corpo({ code: "23505", message: "lavoro-gia-in-coda", details: ID, hint: "…" })),
    ID,
  );
});

test("② un altro 409 (un altro vincolo, un'altra tabella) resta un rifiuto vero", () => {
  assert.equal(gemelloDaConflitto(409, corpo({ code: "23505", message: "duplicate key value violates unique constraint", details: ID })), null);
  assert.equal(gemelloDaConflitto(400, corpo({ message: "lavoro-gia-in-coda", details: ID })), null);
});

test("③ un dettaglio che non è un codice di lavoro non si usa", () => {
  assert.equal(gemelloDaConflitto(409, corpo({ message: "lavoro-gia-in-coda", details: "Key (id)=(…) already exists" })), null);
  assert.equal(gemelloDaConflitto(409, corpo({ message: "lavoro-gia-in-coda" })), null);
});

test("④ un corpo vuoto o illeggibile non si scambia per «c'è già»", () => {
  assert.equal(gemelloDaConflitto(409, ""), null);
  assert.equal(gemelloDaConflitto(409, "<html>bad gateway</html>"), null);
  assert.equal(gemelloDaConflitto(undefined, corpo({ message: "lavoro-gia-in-coda", details: ID })), null);
});
