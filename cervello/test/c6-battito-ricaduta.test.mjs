#!/usr/bin/env node
// 🧪 AR-592 — IL BATTITO È DI NUOVO FERMO DA TRE GIORNI, E LA RICADUTA NON HA SVEGLIATO NESSUNO.
//
// Tutte e sei le cadenze registrate avevano come ultimo esito un fallimento: piano del mattino,
// punto di mezzogiorno, report della sera e monitoraggio usciti fra 57 e 75 ore prima (finestra
// massima: 30 ore), il giro di notte morto a tempo scaduto senza pubblicare. Senza battito la
// macchina non propone mosse, non aggiorna i numeri, non riempie la coda da firmare: l'azienda
// digitale è spenta e il proprietario non riceve nessun segnale che lo sia.
//
// «DI NUOVO» È LA PAROLA IMPORTANTE. Un guasto identico (31/7–4/8, quattro giorni fermi) era già
// stato chiuso il 4/8 con la frase «il server è tornato a pubblicare»: una frase, nessun freno.
// Alla ricaduta, in coda azioni non è comparsa nessuna card — le ultime erano del 4/8.
//
// E c'è una seconda causa, più insidiosa, che questo test blocca: l'anti-spam di casa (dedup sulla
// firma, AR-114) è fatto apposta per non ripetersi su uno stato invariato — e un guasto che va via e
// torna produce, giorni dopo, la STESSA firma di prima. Cioè la difesa contro l'alert-fatigue è
// anche il modo in cui una ricaduta resta muta. Per questo la firma porta dentro l'EPISODIO: da
// quando dura questo guasto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const SD = await import(join(REPO, "cervello/sentinella-dati.mjs"));

const ADESSO = Date.parse("2026-08-13T08:50:00+02:00"); // l'istante in cui il difetto è nato

/** Le sei cadenze com'erano il 13/8: tutte uscite male, le più vecchie da tre giorni. */
const CADENZE_ROTTE = {
  "ritmo-mattino": { quando: "2026-08-10 06:05", esito: "non-pubblicato", codice: 2 },
  "ritmo-mezzogiorno": { quando: "2026-08-10 12:06", esito: "non-pubblicato", codice: 2 },
  "ritmo-sera": { quando: "2026-08-09 18:27", esito: "non-pubblicato", codice: 2 },
  monitora: { quando: "2026-08-10 06:40", esito: "non-pubblicato", codice: 2 },
  giro: { quando: "2026-08-13 02:10", esito: "morto", codice: 124 },
  "ritmo-settimana": { quando: "2026-08-07 15:27", esito: "errore-motore", codice: 1 },
};

function statoBase(extra = {}) {
  return {
    worker_eta_min: null, lavori_in_corso: 0, sensori_max_ciechi: 0, sensori_stantii: false,
    salute_voto: null, radiografia_ore: null, volano_tasso: null, runway_stato: null,
    dati_leggibili: true, ultimo_ordine: null, checkup_stato: "fresco", senior_scatta: false,
    senior_quota_fermi: 0.1, battito_stato: "fresco", ...extra,
  };
}

test("sei cadenze uscite male da tre giorni: il verdetto è STANTIO, non «hanno girato»", () => {
  const v = M.verdettoBattito(CADENZE_ROTTE, { adessoMs: ADESSO, finestraOre: 30 });
  assert.equal(v.stato, M.STANTIO);
  assert.equal(v.verde, false);
  assert.ok(v.ferme.length >= 4, `attese almeno 4 cadenze fuori finestra, trovate ${v.ferme.length}`);
  assert.ok(v.ore_fermo > 70, "la più vecchia è ferma da oltre tre giorni");
});

test("gli OCCHI adesso accodano la card 🔴 che il 13/8 non è mai comparsa in coda", () => {
  const v = M.verdettoBattito(CADENZE_ROTTE, { adessoMs: ADESSO, finestraOre: 30 });
  const eventi = SD.valutaRegole(
    statoBase({
      battito_stato: v.stato, battito_perche: v.perche, battito_firma: v.firma,
      battito_ferme: v.ferme.map((r) => r.nome), battito_fallite: v.fallite.map((r) => r.nome), battito_ore: v.ore_fermo,
    }),
    { regole: {} },
  );
  const card = eventi.find((e) => e.chiave === "battito_fermo");
  assert.ok(card, "è il freno che mancava: senza, la ricaduta resta invisibile nel Pannello");
  assert.equal(card.colore, "🔴");
  assert.match(card.prompt, /già successo dal 31\/7 al 4\/8/, "la card deve dire che è una ricaduta, o si richiude con un'altra frase");
});

test("LA RICADUTA SUONA: stesso guasto, episodio nuovo, firma diversa", () => {
  // Primo episodio: fermo da tre giorni a partire dal 4/8. Chiuso, tutto torna a posto.
  const primo = M.verdettoBattito(
    { a: { quando: "2026-08-01 06:00", esito: "non-pubblicato" }, b: { quando: "2026-08-04 06:00", esito: "ok" } },
    { adessoMs: Date.parse("2026-08-04T12:00:00+02:00"), finestraOre: 30 },
  );
  // Ricaduta: identica per gravità, ma cominciata in un altro momento.
  const secondo = M.verdettoBattito(
    { a: { quando: "2026-08-10 06:00", esito: "non-pubblicato" }, b: { quando: "2026-08-13 06:00", esito: "ok" } },
    { adessoMs: Date.parse("2026-08-13T12:00:00+02:00"), finestraOre: 30 },
  );
  assert.notEqual(
    primo.firma,
    secondo.firma,
    "con la stessa firma il dedup zittirebbe la ricaduta: la difesa dall'alert-fatigue diventerebbe la causa del silenzio",
  );
  assert.match(secondo.firma, /@2026-08-13/, "la firma porta dentro da quando dura il guasto");
});

test("stesso identico guasto senza ricaduta: la firma NON cambia e non si fa spam", () => {
  const a = M.verdettoBattito(CADENZE_ROTTE, { adessoMs: ADESSO, finestraOre: 30 });
  const b = M.verdettoBattito(CADENZE_ROTTE, { adessoMs: ADESSO + 60_000, finestraOre: 30 });
  assert.equal(a.firma, b.firma, "un allarme che si ripete identico all'infinito è indistinguibile dal silenzio");
});

test("cadenze tutte fresche e riuscite: nessuna card, e il verdetto è verde", () => {
  const buone = {
    "ritmo-mattino": { quando: "2026-08-13 06:05", esito: "ok", codice: 0 },
    giro: { quando: "2026-08-13 08:10", esito: "ok", codice: 0 },
  };
  const v = M.verdettoBattito(buone, { adessoMs: ADESSO, finestraOre: 30 });
  assert.equal(v.verde, true);
  assert.equal(SD.valutaRegole(statoBase({ battito_stato: v.stato }), { regole: {} }).find((e) => e.chiave === "battito_fermo"), undefined);
});

test("nessuna cadenza registrata è ⚪ e non un verde", () => {
  assert.equal(M.verdettoBattito({}, { adessoMs: ADESSO }).stato, M.NON_VISTO);
  assert.equal(M.verdettoBattito({}, { adessoMs: ADESSO }).verde, false);
});

test("il file vero delle cadenze passa dal verdetto vero", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/esito-cadenze.json"), "utf8"));
  const v = M.verdettoBattito(vero.cadenze, { adessoMs: Date.now(), finestraOre: 30 });
  assert.ok(["fresco", "stantio", "non_visto"].includes(v.stato), "il formato vero deve restare leggibile");
});
