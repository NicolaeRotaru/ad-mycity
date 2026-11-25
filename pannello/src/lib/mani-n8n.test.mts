import { test } from "node:test";
import assert from "node:assert/strict";
import { decidiN8n, leggiRispostaN8n } from "./mani-n8n.ts";

const cfg = { url: "https://n8n.esempio/webhook/mycity-mani", segreto: "s", adesso: "2026-11-25T12:00:00.000Z" };
const az = (extra = {}) => ({ id: "a1", titolo: "Avvisa il fornaio", canale: "telegram", testo: "ciao", ...extra });

test("un 🔴 deciso dall'autopilota non parte mai", () => {
  const d = decidiN8n(az({ livello: "rosso", firmataDa: "auto" }), cfg);
  assert.equal(d.manda, false);
  assert.equal(!d.manda && d.esito.stato, "coda");
});

test("un 🔴 senza chi l'ha firmato non parte", () => {
  assert.equal(decidiN8n(az({ livello: "rosso" }), cfg).manda, false);
});

test("un livello illeggibile vale rosso: senza la firma di Nicola resta in coda", () => {
  assert.equal(decidiN8n(az({ livello: "?", firmataDa: "auto" }), cfg).manda, false);
  assert.equal(decidiN8n(az({ firmataDa: "auto" }), cfg).manda, false);
});

test("un 🔴 firmato da Nicola parte, e n8n riceve chi l'ha firmato", () => {
  const d = decidiN8n(az({ livello: "rosso", firmataDa: "nicola" }), cfg);
  assert.equal(d.manda, true);
  assert.equal(d.manda && d.corpo.firmata_da, "nicola");
  assert.equal(d.manda && d.corpo.livello, "rosso");
});

test("un 🟡 dell'autopilota parte come «auto»", () => {
  const d = decidiN8n(az({ livello: "giallo", firmataDa: "auto" }), cfg);
  assert.equal(d.manda && d.corpo.firmata_da, "auto");
});

test("senza indirizzo, senza https o senza segreto non manda niente", () => {
  assert.equal(decidiN8n(az({ livello: "verde" }), { ...cfg, url: undefined }).manda, false);
  assert.equal(decidiN8n(az({ livello: "verde" }), { ...cfg, url: "http://x" }).manda, false);
  assert.equal(decidiN8n(az({ livello: "verde" }), { ...cfg, segreto: "" }).manda, false);
});

test("la risposta di n8n fuori formato vale «coda», mai «fatta»", () => {
  assert.equal(leggiRispostaN8n(200, { ok: true }).stato, "coda");
  assert.equal(leggiRispostaN8n(500, { stato: "fatta", dettaglio: "x" }).stato, "coda");
  assert.deepEqual(leggiRispostaN8n(200, { stato: "fatta", dettaglio: "mandato" }), { stato: "fatta", dettaglio: "n8n · mandato" });
});
