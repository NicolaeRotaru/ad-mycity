#!/usr/bin/env node
// 🧪 Le prove di AR-476 — il verdetto organo per organo che arriva alla Cabina.
//
// Il caso che conta è l'ultimo: **⚪ non è mai un verde.** Un cruscotto che somma «l'ho provato e
// funziona» con «non l'ho potuto vedere da qui» è peggio di nessun cruscotto, perché la copertura
// sembra piena mentre è bucata — ed è esattamente la malattia che questa macchina cura da settimane.
//
// Si esegue col caricatore TypeScript del repo:
//   node --import ./cervello/test/hook-ts.mjs --test cervello/test/salute-per-organo.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { riassumiOrgani, contaOrgani, vociDaReferto } from "../../pannello/src/lib/salute-organi.ts";

// La forma VERA del referto, copiata dalla struttura di auto-coscienza/salute.json.
const REFERTO = {
  claude: {
    quando: "2026-08-02 17:00",
    controlli: [
      { id: "worker.ponte", organo: "worker", titolo: "Il VPS si sta ancora visitando", esito: "nonvisto", detto: "il ponte non è attivo" },
      { id: "worker.tracce", organo: "worker", titolo: "La macchina lascia tracce", esito: "rotto", detto: "nessun processo automatico" },
      { id: "cervello.test", organo: "cervello", titolo: "I test passano", esito: "ok", detto: "tutti verdi" },
      { id: "cervello.esiti", organo: "cervello", titolo: "Il lavoro consegnato dice com'è andato", esito: "ok", detto: "253 su 277" },
    ],
  },
};

test("il referto si legge nella forma VERA: una casa, con dentro i controlli", () => {
  assert.equal(vociDaReferto(REFERTO).length, 4);
});

test("le altre due forme non fanno crollare la lettura: un cambio di struttura non deve dare zero rossi", () => {
  assert.equal(vociDaReferto([{ id: "x", organo: "worker", esito: "ok" }]).length, 1, "elenco nudo");
  assert.equal(vociDaReferto({ claude: [{ id: "x", organo: "worker", esito: "ok" }] }).length, 1, "casa con elenco diretto");
  assert.equal(vociDaReferto(null).length, 0);
  assert.equal(vociDaReferto("boh").length, 0);
});

test("i controlli si raggruppano per organo, coi tre conti separati", () => {
  const r = riassumiOrgani(REFERTO);
  const worker = r.find((x) => x.organo === "worker");
  assert.equal(worker.rossi, 1);
  assert.equal(worker.nonVisti, 1);
  assert.equal(worker.verdi, 0);
  assert.equal(r.find((x) => x.organo === "cervello").verdi, 2);
});

test("gli organi escono nell'ordine in cui la macchina li racconta", () => {
  assert.deepEqual(
    riassumiOrgani(REFERTO).map((x) => x.organo),
    ["worker", "cervello"],
  );
});

test("dentro l'organo i rossi vengono prima dei ⚪: quello che va guardato sta in cima", () => {
  const worker = riassumiOrgani(REFERTO).find((x) => x.organo === "worker");
  assert.equal(worker.daGuardare[0].esito, "rotto");
  assert.equal(worker.daGuardare[1].esito, "nonvisto");
  assert.equal(worker.daGuardare.length, 2, "i verdi non vanno guardati: sarebbero rumore");
});

test("IL CASO CHE CONTA: ⚪ non è mai un verde, e la copertura lo dichiara", () => {
  const c = contaOrgani(riassumiOrgani(REFERTO));
  assert.equal(c.verdi, 2, "i non visti NON si sommano ai verdi");
  assert.equal(c.nonVisti, 1);
  assert.equal(c.rossi, 1);
  assert.equal(c.totale, 4);
  assert.equal(c.copertura, 75, "3 controlli su 4 hanno davvero misurato: la copertura si dice, non si nasconde");
});

test("un controllo GUASTO (la visita non è partita) conta come non visto, non come rosso dell'organo", () => {
  const r = riassumiOrgani({ claude: { controlli: [{ id: "x", organo: "worker", esito: "guasto", detto: "il controllo non è partito" }] } });
  assert.equal(r[0].nonVisti, 1);
  assert.equal(r[0].rossi, 0, "accusare l'organo per un guasto del controllo manda a indagare il posto sbagliato");
});

test("un referto vuoto dà zero organi, non un verde", () => {
  const c = contaOrgani(riassumiOrgani({}));
  assert.equal(c.totale, 0);
  assert.equal(c.copertura, 0, "nessuna misura = zero copertura, non 100%");
});
