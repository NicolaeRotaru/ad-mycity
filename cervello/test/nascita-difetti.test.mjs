// «L'ho creato io» e «l'ho appena scoperto» devono restare due cose diverse, e contabili (AR-459).
//
// Le prove girano su cantieri FINTI: se misurassero quello vero cambierebbero colore a ogni
// radiografia, e fra un mese non saprei più se il rosso è un bug del guardiano o un difetto nuovo
// di qualcun altro. È la stessa lezione che il 30/7 ha ristretto AR-457.
//
// Il caso che conta più di tutti è il terzo: la baseline esenta chi NON ha ancora compilato, mai
// chi ha compilato a modo suo. Se la esentasse, basterebbe scrivere una parola qualsiasi per uscire
// dal conteggio — ed è la porta che AR-338 ha già trovato aperta due volte.

import { test } from "node:test";
import assert from "node:assert/strict";
import { verificaNascite, perAutore, NASCITE } from "../nascita-difetti.mjs";

const d = (id, extra = {}) => ({ id, titolo: `finto ${id}`, ...extra });

test("un difetto nuovo senza `nato_come` è una violazione", () => {
  const e = verificaNascite([d("AR-1")], []);
  assert.equal(e.violazioni.length, 1);
  assert.equal(e.violazioni[0].regola, "nascita-mancante");
  assert.match(e.violazioni[0].rimedio, /nato_come/);
});

test("…ma se è nella baseline è debito dichiarato: si conta, non blocca", () => {
  const e = verificaNascite([d("AR-1")], ["AR-1"]);
  assert.equal(e.violazioni.length, 0, "il tetto separa il debito dalla regressione");
  assert.deepEqual(e.senzaNascita, ["AR-1"], "ma resta visibile e contato");
});

test("una nascita INVENTATA non è coperta dalla baseline: l'esenzione vale per i vuoti, non per i furbi", () => {
  // Se bastasse scrivere qualcosa per uscire dal conteggio, il campo diventerebbe una formalità e
  // il numero delle regressioni scenderebbe senza che ne nascano di meno.
  const e = verificaNascite([d("AR-1", { nato_come: "boh" })], ["AR-1"]);
  assert.equal(e.violazioni.length, 1);
  assert.equal(e.violazioni[0].regola, "nascita-inventata");
  assert.match(e.violazioni[0].motivo, new RegExp(NASCITE[0]));
});

test("una regressione DEVE dire da cosa: senza autore è una confessione senza reato", () => {
  const e = verificaNascite([d("AR-1", { nato_come: "regressione" })], []);
  assert.equal(e.violazioni.length, 1);
  assert.equal(e.violazioni[0].regola, "regressione-senza-autore");
  assert.equal(e.regressioni.length, 0, "e non entra nel conteggio: un dato monco non è un dato");
});

test("una regressione con autore si conta e porta il suo autore", () => {
  const e = verificaNascite([d("AR-1", { nato_come: "regressione", nato_da: "AR-334" })], []);
  assert.equal(e.violazioni.length, 0);
  assert.deepEqual(e.regressioni.map((r) => [r.id, r.da]), [["AR-1", "AR-334"]]);
});

test("nemmeno la baseline salva una regressione senza autore: è compilata, solo male", () => {
  const e = verificaNascite([d("AR-1", { nato_come: "regressione" })], ["AR-1"]);
  assert.equal(e.violazioni.length, 1, "la baseline esenta il vuoto, non il monco");
});

test("una scoperta che nomina un fix precedente è l'ALTRA metà del costo di riparare", () => {
  // AR-347/AR-352: «dichiarato chiuso ma vivo». Il guasto c'era già — non è una regressione — ma il
  // fix precedente l'aveva lasciato, ed è il modo in cui il conto dei difetti chiusi mente.
  const e = verificaNascite(
    [d("AR-1", { nato_come: "scoperta", nato_da: "AR-195" }), d("AR-2", { nato_come: "scoperta" })],
    [],
  );
  assert.equal(e.violazioni.length, 0);
  assert.equal(e.scoperti, 2);
  assert.equal(e.regressioni.length, 0, "non gonfiare il numero che deve restare credibile");
  assert.deepEqual(e.chiusureIncomplete.map((x) => x.id), ["AR-1"], "…né tacerlo");
});

test("i tre modi si contano separatamente", () => {
  const e = verificaNascite(
    [
      d("AR-1", { nato_come: "scoperta" }),
      d("AR-2", { nato_come: "regressione", nato_da: "lotto 35" }),
      d("AR-3", { nato_come: "nuovo-lavoro" }),
      d("AR-4", { nato_come: "scoperta" }),
    ],
    [],
  );
  assert.equal(e.violazioni.length, 0);
  assert.equal(e.scoperti, 2);
  assert.equal(e.regressioni.length, 1);
  assert.equal(e.nuovoLavoro, 1);
});

test("perAutore(): risponde a «quale fix mi è costato di più», ordinato", () => {
  const auto = perAutore([
    { id: "AR-1", da: "AR-334" },
    { id: "AR-2", da: "lotto 35" },
    { id: "AR-3", da: "AR-334" },
  ]);
  assert.deepEqual(auto[0], ["AR-334", ["AR-1", "AR-3"]], "il più costoso in cima");
  assert.equal(auto.length, 2);
});

test("un cantiere vuoto non inventa numeri", () => {
  const e = verificaNascite([], []);
  assert.deepEqual(
    { v: e.violazioni.length, s: e.scoperti, r: e.regressioni.length, n: e.nuovoLavoro },
    { v: 0, s: 0, r: 0, n: 0 },
  );
});
