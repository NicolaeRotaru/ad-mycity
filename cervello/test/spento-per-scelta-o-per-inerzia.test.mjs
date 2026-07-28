#!/usr/bin/env node
// AR-105 — i sensori di uptime erano costruiti e mai armati, e il registro non sapeva dire perché.
//
// Un sensore spento può esserlo per due motivi che non si somigliano per niente: perché Nicola ha
// **deciso** di non usarlo (stato finale, sano) o perché **nessuno gliel'ha mai chiesto** (un buco
// che la macchina non sa di avere). Il registro li scriveva uguali — `non_configurato` — e quella
// parola sembra uno stato normale.
//
// Il difetto chiedeva esattamente questo campo: «nel registro cecità aggiungere il campo
// `motivo_spento: decisione|inerzia` — le voci "inerzia" entrano nella checklist di Nicola finché non
// diventano ok o "decisione"».
//
// Misurato il 28/7, e la descrizione del difetto è invecchiata: **10 sensori su 11 sono accesi**,
// compresi i due uptime che il difetto dà per spenti (accesi dal 18/7). Resta `telegram_bot`. Ma il
// buco che li ha tenuti spenti mezzo anno non è stato toccato, e riapre col prossimo sensore nuovo.
//
// Qui si eseguono le decisioni su ingressi finti: com'è il mondo adesso non prova niente sul fix.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { MOTIVO, motivoDi, quadroSpenti, serveNicola } from "../sensore-spento.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

prova("il caso che ha rotto: spento e nessuno ha mai chiesto niente → serve Nicola", () => {
  const g = serveNicola({ stato: "non_configurato", motivo: MOTIVO.INERZIA });
  assert.equal(g.serve, true);
  assert.match(g.perche, /nessuno ha mai chiesto/);
});

prova("spento per SCELTA di Nicola non si richiede più: è uno stato finale", () => {
  // È la differenza che il registro non sapeva scrivere. Ri-chiedere una cosa già decisa è il modo
  // più veloce per insegnargli a saltare le card.
  const g = serveNicola({ stato: "non_configurato", motivo: MOTIVO.DECISIONE });
  assert.equal(g.serve, false);
  assert.match(g.perche, /scelta di Nicola/);
});

prova("già chiesto = non si richiede: la card in coda basta", () => {
  assert.equal(serveNicola({ stato: "non_configurato", motivo: MOTIVO.DA_CHIEDERE }).serve, false);
  assert.equal(serveNicola({ stato: "non_configurato", motivo: MOTIVO.INERZIA, cardInCoda: true }).serve, false);
});

prova("un sensore acceso non chiede niente a nessuno", () => {
  assert.equal(serveNicola({ stato: "ok" }).serve, false);
});

prova("CIECO non è SPENTO: un guasto non è una configurazione mancante", () => {
  // Un sensore che era acceso e non risponde più è rotto, e lo vede già la sentinella della cecità.
  // Confonderli farebbe alzare a Nicola una card di configurazione per un guasto — la cosa sbagliata.
  const g = serveNicola({ stato: "cieco", motivo: MOTIVO.INERZIA });
  assert.equal(g.serve, false);
  assert.match(g.perche, /guasto/);
});

prova("senza una riga nel registro il motivo è INERZIA, non «non lo so»", () => {
  // È il cuore del difetto: l'assenza di una dichiarazione NON è uno stato neutro. Trattarla come
  // «boh» la rimetterebbe esattamente dov'era, cioè invisibile.
  assert.equal(motivoDi("mai_visto", {}), MOTIVO.INERZIA);
  assert.equal(motivoDi("x", { x: { motivo: "una-cosa-inventata" } }), MOTIVO.INERZIA, "un motivo non ammesso vale come nessun motivo");
  assert.equal(motivoDi("x", { x: { motivo: "decisione" } }), MOTIVO.DECISIONE);
  assert.equal(motivoDi("x", { x: "decisione" }), MOTIVO.DECISIONE, "forma breve ammessa");
});

prova("il quadro divide gli spenti per motivo, e conta anche gli accesi", () => {
  const sensori = {
    a: { stato: "ok" }, b: { stato: "ok" },
    scelto: { stato: "non_configurato" },
    dimenticato: { stato: "non_configurato" },
    rotto: { stato: "cieco" },
  };
  const q = quadroSpenti(sensori, { scelto: { motivo: "decisione" } });
  assert.equal(q.accesi, 2);
  assert.equal(q.totale, 5);
  assert.deepEqual(q.decisione, ["scelto"]);
  assert.deepEqual(q.inerzia, ["dimenticato"]);
  assert.deepEqual(q.guasti, ["rotto"], "il guasto sta in una colonna sua, non fra i dimenticati");
  assert.deepEqual(q.da_chiedere_ora, ["dimenticato"], "solo l'inerzia genera una domanda");
});

prova("il campo che il difetto chiedeva esiste, e i tre motivi sono quelli", () => {
  assert.deepEqual(Object.values(MOTIVO).sort(), ["da-chiedere", "decisione", "inerzia"]);
  const reg = JSON.parse(readFileSync(join(REPO, "cervello/sensori-motivi.json"), "utf8"));
  assert.ok(reg.motivi && typeof reg.motivi === "object", "il registro dei motivi dev'essere un file, non una convenzione");
  assert.match(reg._regola_per_i_sensori_nuovi || "", /nasce con la sua riga/, "la regola per i sensori nuovi va scritta dove la si legge");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
