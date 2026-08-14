#!/usr/bin/env node
// 🧪 AR-595 — I QUADERNI DEI SENIOR SONO FERMI QUASI TUTTI: 105 SU 120 SENZA UNA RIGA FRESCA.
//
// La sonda della chiusura del loop, aggiornata ogni sera, dice: 120 quaderni attesi, 105 fermi oltre
// la soglia dei 7 giorni, 72 vuoti da sempre, solo 15 vivi. Il meccanismo «dopo ogni lavoro lascia
// una riga atteso→reale» — la forcing-function dichiarata dell'apprendimento dei 120 senior — è
// decorativo per l'87% del roster.
//
// LA FRASE CHE SPIEGA TUTTO: «il segnale esiste, ma il suo consumatore è il giro, che è fermo». Il
// numero gira a vuoto senza produrre né un recupero né una decisione. Per questo il consumatore
// nuovo sono gli OCCHI — che hanno un timer PROPRIO e continuano a guardare anche quando il giro è
// morto, cioè proprio nel guasto in cui serve.
//
// Diverso da AR-194, e vale la pena dirlo: là si contano quelli che non hanno MAI consegnato, qui
// quelli che non lasciano una riga da più di una settimana. Due misure, due soglie, due card.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const SD = await import(join(REPO, "cervello/sentinella-dati.mjs"));

function statoBase(extra = {}) {
  return {
    worker_eta_min: null, lavori_in_corso: 0, sensori_max_ciechi: 0, sensori_stantii: false,
    salute_voto: null, radiografia_ore: null, volano_tasso: null, runway_stato: null,
    dati_leggibili: true, ultimo_ordine: null, checkup_stato: "fresco", battito_stato: "fresco",
    senior_scatta: false, senior_quota_fermi: 0.1, quaderni_stato: "fresco", ...extra,
  };
}

test("105 fermi su 120 è l'87% del roster: il verdetto non può essere verde", () => {
  const v = M.verdettoSquadra({ totale: 120, vuoti: 72, fermi: 105 });
  assert.equal(v.quotaFermi, 0.875);
  assert.equal(v.verde, false);
});

test("gli OCCHI accodano la card, e propone le due mosse concrete", () => {
  const eventi = SD.valutaRegole(
    statoBase({ senior_quota_fermi: 0.875, senior_fermi: 105, senior_totale: 120, senior_mai_usati: 72 }),
    { regole: {} },
  );
  const card = eventi.find((e) => e.chiave === "quaderni_fermi");
  assert.ok(card, "il segnale c'era già: gli mancava un consumatore vivo");
  assert.match(card.titolo, /105 quaderni su 120/);
  assert.match(card.prompt, /dormienti/, "dichiarare dormienti i ruoli mai attivati invece di contarli malati ogni sera");
  assert.match(card.prompt, /chiusura-loop\.mjs registra/, "e per chi ha lavorato davvero, il comando per chiudere il loop");
});

test("se la sonda stessa è vecchia, la card lo dice e cambia firma", () => {
  const fresca = SD.valutaRegole(statoBase({ senior_quota_fermi: 0.875, senior_fermi: 105, senior_totale: 120, senior_mai_usati: 72 }), { regole: {} })
    .find((e) => e.chiave === "quaderni_fermi");
  const vecchia = SD.valutaRegole(statoBase({ senior_quota_fermi: 0.875, senior_fermi: 105, senior_totale: 120, senior_mai_usati: 72, quaderni_stato: M.STANTIO }), { regole: {} })
    .find((e) => e.chiave === "quaderni_fermi");
  assert.notEqual(fresca.firma, vecchia.firma, "un numero vecchio e uno di stamattina non sono lo stesso stato");
  assert.match(vecchia.prompt, /prima rilanciala/, "prima si rimisura, poi si decide: altrimenti si decide su una fotografia");
});

test("una squadra che lascia tracce non accende niente", () => {
  const v = M.verdettoSquadra({ totale: 120, vuoti: 10, fermi: 20 });
  assert.equal(v.verde, true);
  assert.equal(SD.valutaRegole(statoBase({ senior_quota_fermi: v.quotaFermi }), { regole: {} }).find((e) => e.chiave === "quaderni_fermi"), undefined);
});

test("gli occhi leggono la sonda VERA e ne misurano anche l'età", async () => {
  const s = await SD.leggiStatoReale({ regole: {} });
  assert.equal(typeof s.senior_fermi, "number");
  assert.equal(typeof s.senior_quota_fermi, "number");
  assert.ok(["fresco", "stantio", "non_visto"].includes(s.quaderni_stato), "anche la sonda ha un'età, e va guardata");
});
