#!/usr/bin/env node
// 🔁 UN ROSSO SOLO NON BASTA PER CREDERCI — e a rilanciare dev'essere la macchina, non la memoria.
//
// IL CASO VERO, 14 agosto 2026 ore 20:09. La suite intera segna 3 rossi (1428 passati, 3 falliti).
// Due erano debito noto da giorni. Il terzo, `registri-ora-di-piacenza.test.mjs`, non era mai stato
// rosso prima. Rilanciato da solo: verde, 5 su 5. Rilanciata la suite INTERA una seconda volta:
// verde anche lì. Non era una regressione — era una corsa: quel test legge timbri che altri file
// della stessa suite riscrivono nello stesso istante, e le corsie parallele glieli cambiavano sotto.
//
// PERCHÉ QUESTA PROVA ESISTE. Da quella scoperta è nata la lezione L-2026-0814-001, che diceva a chi
// legge: «rilancia prima di aprire un cantiere». Poi la lezione ha dichiarato come proprio freno il
// comando `node cervello/test/registri-ora-di-piacenza.test.mjs` — cioè il test che era andato in
// corsa. Ma quel comando non verifica la regola: verifica i timbri. Poteva restare verde per sempre
// con la regola mai applicata, che è esattamente il modo di barare descritto in cima a
// `gate-veri.mjs` («certifica che una cosa ESISTE, non che FUNZIONA»).
//
// Il freno vero è il rilancio fatto dalla macchina: `confermaIRossi` in `test-cervello.mjs`. Un
// promemoria in un file di lezioni vale quanto valgono gli altri — il conto di questa casa è 269
// correzioni e zero freni. Queste sette prove sono ciò che rende la lezione un impedimento.
import { test } from "node:test";
import assert from "node:assert/strict";
import { confermaIRossi } from "../test-cervello.mjs";

const ok = (file, passati = 5) => ({ file, esito: "ok", motivo: "", passati, falliti: 0 });
const rosso = (file, motivo = "1 asserzioni fallite") => ({ file, esito: "rosso", motivo, passati: 4, falliti: 1, rosse: ["✗ un caso"] });

test("un rosso che si ripete resta rosso: la seconda corsa non è un condono", async () => {
  const righe = [ok("a.test.mjs"), rosso("b.test.mjs")];
  const dopo = await confermaIRossi(righe, async (x) => rosso(x.file, "1 asserzioni fallite"));
  const b = dopo.find((x) => x.file === "b.test.mjs");
  assert.equal(b.esito, "rosso", "fallito due volte su due: è rotto davvero");
  assert.equal(b.confermato, true, "e si deve vedere che è stato guardato due volte");
});

test("il caso che ha rotto: rosso nella suite, verde da solo → INSTABILE, non verde", async () => {
  const dopo = await confermaIRossi([rosso("registri-ora-di-piacenza.test.mjs")], async (x) => ok(x.file));
  const r = dopo[0];
  assert.equal(r.esito, "instabile", "una corsa non è una regressione, ma non è nemmeno un verde");
  assert.notEqual(r.esito, "ok", "spacciarlo per verde nasconde una prova che dipende dall'ordine");
  assert.notEqual(r.esito, "rosso", "tenerlo rosso blocca la CI su un fantasma");
});

test("l'instabile dice per nome cos'è successo, in tutte e due le corse", async () => {
  const dopo = await confermaIRossi([rosso("x.test.mjs", "3 asserzioni fallite")], async (x) => ok(x.file));
  assert.match(dopo[0].motivo, /verde da solo/, "chi legge deve sapere che il rilancio è passato");
  assert.match(dopo[0].motivo, /3 asserzioni fallite/, "e cosa diceva la prima passata");
  assert.deepEqual(dopo[0].rosse, [], "le righe rosse della corsa persa non vanno più mostrate come vere");
});

test("un ineseguibile NON si rilancia: non è una corsa, non è nemmeno partito", async () => {
  let rilanci = 0;
  const righe = [{ file: "morto.test.mjs", esito: "ineseguibile", motivo: "il file non è nemmeno partito", passati: null, falliti: null }];
  const dopo = await confermaIRossi(righe, async (x) => {
    rilanci++;
    return ok(x.file);
  });
  assert.equal(rilanci, 0, "rilanciarlo sarebbe tempo speso per confermare l'ovvio");
  assert.equal(dopo[0].esito, "ineseguibile", "e resta quello che è");
});

test("si rilancia UNA volta sola per file: non a oltranza finché non passa", async () => {
  const conte = new Map();
  await confermaIRossi([rosso("a.test.mjs"), rosso("b.test.mjs")], async (x) => {
    conte.set(x.file, (conte.get(x.file) || 0) + 1);
    return rosso(x.file);
  });
  assert.deepEqual([...conte.values()], [1, 1], "due rossi, due rilanci — rilanciare finché passa è comprarsi il verde");
});

test("una suite tutta verde non rilancia niente: il caso normale non costa nulla", async () => {
  let rilanci = 0;
  const righe = [ok("a.test.mjs"), ok("b.test.mjs"), { file: "c.bats", esito: "non-eseguito", passati: null, falliti: null }];
  const dopo = await confermaIRossi(righe, async () => {
    rilanci++;
    return ok("x");
  });
  assert.equal(rilanci, 0);
  assert.deepEqual(dopo, righe, "e le righe tornano identiche, senza campi inventati");
});

test("i verdi e i non-eseguiti attraversano la conferma senza essere toccati", async () => {
  const bats = { file: "c.bats", esito: "non-eseguito", motivo: "bats non è installato", passati: null, falliti: null };
  const dopo = await confermaIRossi([ok("a.test.mjs"), rosso("b.test.mjs"), bats], async (x) => ok(x.file));
  assert.equal(dopo.find((x) => x.file === "a.test.mjs").esito, "ok");
  assert.deepEqual(dopo.find((x) => x.file === "c.bats"), bats, "il ⚪ di AR-660 non diventa altro passando di qui");
  assert.equal(dopo.length, 3, "e non si perde né si duplica nessuna riga");
});
