#!/usr/bin/env node
// 🧪 AR-578 — LA MEMORIA SI AGGIORNA OGNI SERA, MA IL REFERTO DEL CHECKUP È FERMO DA DUE GIORNI.
//
// Il manuale dice che il checkup gira da solo sul VPS mattina e sera, pubblica il referto in
// `auto-coscienza/salute.json`, e che «un referto vecchio è un rosso». Il 13/8 il referto era fermo
// alle 02:26 dell'11 — circa 45 ore — mentre `coerenza-fatti.json`, nella stessa cartella, era di
// poche ore prima. Quindi non è il canale di pubblicazione a essere rotto: è proprio il checkup che
// non gira o non scrive. E la sezione `vps` del referto era vuota, cioè nemmeno l'ultimo referto
// disponibile portava il ponte verso il server.
//
// L'organo che dovrebbe accorgersi dei guasti era spento e nulla lo segnalava: se stanotte si ferma
// il worker, il primo a saperlo è Nicola a occhio — esattamente il modo di fallire che il checkup
// doveva eliminare. Il freno che mancava sta negli OCCHI (sentinella-dati), che girano col loro
// timer anche quando tutto il resto è fermo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const SD = await import(join(REPO, "cervello/sentinella-dati.mjs"));

/** Lo stato minimo che la sentinella si aspetta: tutto spento tranne quello che sto provando. */
function statoBase(extra = {}) {
  return {
    worker_eta_min: null, lavori_in_corso: 0, sensori_max_ciechi: 0, sensori_stantii: false,
    salute_voto: null, radiografia_ore: null, volano_tasso: null, runway_stato: null,
    dati_leggibili: true, ultimo_ordine: null, pagati_senza_payout: null, recensioni_basse: null,
    ordini_24h: null, ordini_prev7d: null, carrelli_da_recuperare: null, ordini_slot_scaduto: null,
    battito_stato: "fresco", senior_scatta: false, senior_quota_fermi: 0.1,
    checkup_stato: "fresco", checkup_ore: 2, checkup_perche: "", checkup_ponte_vps: true,
    ...extra,
  };
}

test("il referto fermo da 45 ore è STANTIO: il numero dell'incidente vero", () => {
  const adesso = Date.parse("2026-08-13T00:00:00+02:00");
  const r = M.etaReferto({ dato: { aggiornato: "2026-08-11 02:26" }, scadenzaOre: 26, adessoMs: adesso, nome: "Il referto del checkup" });
  assert.equal(r.stato, M.STANTIO);
  assert.ok(r.eta_ore > 40 && r.eta_ore < 50, `45 ore attese, misurate ${r.eta_ore}`);
});

test("gli OCCHI adesso accodano una card 🔴 quando il checkup è fermo", () => {
  const eventi = SD.valutaRegole(
    statoBase({ checkup_stato: "stantio", checkup_ore: 45, checkup_perche: "scritto 45 ore fa e vale 26 ore", checkup_ponte_vps: false }),
    { regole: {} },
  );
  const card = eventi.find((e) => e.chiave === "checkup_fermo");
  assert.ok(card, "senza questa card nessuno si accorge che l'organo di controllo è spento");
  assert.equal(card.colore, "🔴");
  assert.match(card.titolo, /45 ore/);
  assert.match(card.prompt, /sezione del VPS è vuota/, "il ponte vuoto va detto: è la seconda metà del difetto");
});

test("un referto che non c'è o non si legge accende la stessa card: ⚪ non è un verde", () => {
  const eventi = SD.valutaRegole(statoBase({ checkup_stato: "non_visto", checkup_ore: null, checkup_perche: "il file non c'è" }), { regole: {} });
  const card = eventi.find((e) => e.chiave === "checkup_fermo");
  assert.ok(card, "«non trovo il referto» non può essere più tranquillizzante di «è vecchio»");
  assert.equal(card.firma, "checkup-assente");
});

test("col checkup fresco la card NON parte: il freno non grida al lupo", () => {
  const eventi = SD.valutaRegole(statoBase(), { regole: {} });
  assert.equal(eventi.find((e) => e.chiave === "checkup_fermo"), undefined);
});

test("la sentinella legge il referto VERO dal disco e ne misura l'età", async () => {
  const s = await SD.leggiStatoReale({ regole: {} });
  assert.ok(["fresco", "stantio", "non_visto"].includes(s.checkup_stato), "tre risposte, mai un booleano");
  assert.equal(typeof s.checkup_ponte_vps, "boolean", "il ponte verso il VPS è una domanda a parte");
});
