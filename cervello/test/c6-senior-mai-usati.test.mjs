#!/usr/bin/env node
// 🧪 AR-194 — SETTANTATRÉ SENIOR SU CENTOVENTI NON HANNO MAI CONSEGNATO NULLA, E NESSUNA SOGLIA SE
// NE ACCORGE.
//
// Il numero c'era già: `utilizzo-senior.mjs` lo calcola da mesi (utilizzo reale 0,392) e lo stampa.
// Era solo ESPOSTO, mai collegato a una soglia — nato come indicatore descrittivo, senza un owner
// chiaro fra people-talent e l'AD. La causa di sistema: la macchina sorveglia i suoi organi
// (sensori, worker, memoria) e i suoi numeri, ma non la propria forza-lavoro.
//
// Il costo non è teorico: tre quinti dell'organigramma sono capacità dichiarata e mai esercitata —
// costano manutenzione (prompt, coerenza, guardiani, contesto) e non rendono. Peggio, danno
// l'illusione della copertura: la mappa dice che ogni mandato ha un owner, ma per 73 mandati quel
// owner non ha mai lavorato una volta, quindi nessuno sa se funziona.
//
// La soglia non scatta al primo giro: tre giri consecutivi sotto il 50%, come chiede la scheda.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const SD = await import(join(REPO, "cervello/sentinella-dati.mjs"));

function statoBase(extra = {}) {
  return {
    worker_eta_min: null, lavori_in_corso: 0, sensori_max_ciechi: 0, sensori_stantii: false,
    salute_voto: null, radiografia_ore: null, volano_tasso: null, runway_stato: null,
    dati_leggibili: true, ultimo_ordine: null, checkup_stato: "fresco", battito_stato: "fresco",
    senior_quota_fermi: 0.1, senior_scatta: false, ...extra,
  };
}

test("i numeri veri: 72 su 120 mai un esito = utilizzo 40%, sotto la soglia", () => {
  const v = M.verdettoSquadra({ totale: 120, vuoti: 72, fermi: 105 });
  assert.equal(v.utilizzo, 0.4);
  assert.equal(v.verde, false, "il 40% del roster che lavora non è uno stato sano da mostrare come tale");
  assert.match(v.perche, /72 senior su 120/);
});

test("un giro solo sotto soglia NON accende niente: tre di fila sì", () => {
  const unGiro = M.verdettoSquadra({ totale: 120, vuoti: 72, fermi: 105, sottoDaGiri: 1 });
  const treGiri = M.verdettoSquadra({ totale: 120, vuoti: 72, fermi: 105, sottoDaGiri: 3 });
  assert.equal(unGiro.scattaUtilizzo, false, "un file scritto a metà non deve svegliare nessuno");
  assert.equal(treGiri.scattaUtilizzo, true, "tre giri di fila sono una tendenza");
});

test("il contatore dei giri si azzera appena l'utilizzo rientra", () => {
  assert.equal(M.giriConsecutivi(2, true), 3);
  assert.equal(M.giriConsecutivi(2, false), 0, "un recupero non deve restare in castigo");
  assert.equal(M.giriConsecutivi(undefined, true), 1);
});

test("gli OCCHI accodano la proposta 🟡 a people-talent, e la firma resta a Nicola", () => {
  const eventi = SD.valutaRegole(
    statoBase({ senior_scatta: true, senior_mai_usati: 72, senior_totale: 120, senior_utilizzo: 0.4, senior_giri_sotto: 3, senior_perche: "72 senior su 120 non hanno mai consegnato niente" }),
    { regole: {} },
  );
  const card = eventi.find((e) => e.chiave === "senior_mai_usati");
  assert.ok(card, "senza card il numero resta descrittivo, che è esattamente il difetto");
  assert.equal(card.colore, "🟡", "l'organigramma non si tocca da soli: proposta, non azione");
  assert.equal(card.reparto, "people-talent");
  assert.match(card.prompt, /attivare i 5 mandati|letargo dichiarato/, "la proposta deve offrire le due strade della scheda");
  assert.match(card.prompt, /firma è di Nicola/);
});

test("sopra la soglia nessuna card: il freno non punisce una squadra che lavora", () => {
  const v = M.verdettoSquadra({ totale: 120, vuoti: 20, fermi: 30, sottoDaGiri: 9 });
  assert.equal(v.scattaUtilizzo, false);
  assert.equal(SD.valutaRegole(statoBase({ senior_scatta: v.scattaUtilizzo }), { regole: {} }).find((e) => e.chiave === "senior_mai_usati"), undefined);
});

test("una sonda che non dice quanti sono è ⚪, non uno zero rassicurante", () => {
  const v = M.verdettoSquadra({ totale: null, vuoti: 0, fermi: 0 });
  assert.equal(v.stato, M.NON_VISTO);
  assert.equal(v.utilizzo, null, "senza denominatore non esiste una percentuale, e inventarla sarebbe peggio del silenzio");
});

test("la sonda vera sul disco entra in questo verdetto", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/chiusura-loop.json"), "utf8"));
  const v = M.verdettoSquadra({ totale: vero.totale, vuoti: vero.vuoti, fermi: vero.fermi });
  assert.equal(typeof v.utilizzo, "number", "i campi del file vero devono restare quelli che questo verdetto legge");
  assert.ok(v.totale >= 100, "il roster è di 120 senior: se il file smette di dirlo, questo test lo scopre");
});
