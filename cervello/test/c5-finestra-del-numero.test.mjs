#!/usr/bin/env node
// Corsia 5 del lotto 41 — «il metro guarda la finestra sbagliata, quindi il verde non vuol dire niente».
//
// Questo file copre i tre difetti che riguardano il TEMPO:
//   · AR-368 — il freno sui costi legge il secchio di IERI e conclude che oggi non abbiamo speso niente.
//   · AR-369 — il muro vero della quota è la finestra che scorre; la decisione girava sul giorno solare.
//   · AR-431 — la mappa dei rischi è ferma al due luglio e nessuno controlla che sia fresca.
//
// Le prove ESEGUONO i comandi veri su dati iniettati: niente cerca-una-parola-in-un-file.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const CERVELLO = join(REPO, "cervello");

const { FONTI, tokenPerGate, decidiFrenoCosto } = await import(join(CERVELLO, "fonte-numero.mjs"));
const { FINESTRA, bucketScaduto, statoFinestra, statoRevisione } = await import(join(CERVELLO, "finestra-misura.mjs"));
const { asseQuotaSessione } = await import(join(CERVELLO, "letargo.mjs"));
const { verdettoFreschezza } = await import(join(CERVELLO, "freschezza-rischi.mjs"));

/** Esegue un comando vero e restituisce uscita + codice. */
function esegui(args, env = {}) {
  try {
    const out = execFileSync("node", args, { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env }, timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
    return { out, code: 0 };
  } catch (e) {
    return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? 1 };
  }
}

// ── AR-368: un secchio scaduto non è uno zero ───────────────────────────────

test("AR-368: il contatore di IERI non produce un «lascia», produce un CIECO", () => {
  // Il caso reale del 29/7: `oggi.data` = 2026-07-28, `token_totali` = 0, soglia 2.000.000.
  // Il freno rispondeva «lascia, 0 token sotto la soglia»: via libera alla spesa sulla base di un
  // giorno già finito.
  const scaduto = bucketScaduto({ data: "2026-07-28" }, "2026-07-29");
  assert.equal(scaduto.scaduto, true);
  assert.equal(scaduto.esito, FINESTRA.SCADUTA);
  assert.match(scaduto.motivo, /già finito|non dice niente su adesso/);

  const misura = tokenPerGate({ data: "2026-07-28", runs: 11, token_totali: 0, token_stimati: 385_000 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.SCADUTA, "un numero di ieri non può passare per una misura di oggi");
  assert.equal(misura.valore, null, "e non può portare con sé un valore su cui decidere");

  const verdetto = decidiFrenoCosto({ valore: misura.valore, fonte: misura.fonte, soglia: 2_000_000 });
  assert.equal(verdetto.azione, "cieco", "il freno deve dichiarare di non vedere, non dare via libera");
  assert.notEqual(verdetto.azione, "lascia");
});

test("AR-368: il secchio SENZA data, quando oggi è dichiarato, è ASSENTE — non «di oggi»", () => {
  // Il buco che restava aperto: nessuna data nel contatore e si tirava dritto usando il numero
  // come se fosse di adesso. Un contatore che non sa dire di che giorno è non è un contatore basso.
  const misura = tokenPerGate({ runs: 4, token_stimati: 900_000 }, "2026-07-29");
  assert.equal(misura.fonte, FONTI.ASSENTE);
  assert.equal(misura.valore, null);
  assert.match(String(misura.motivo_finestra), /non dichiara di che giorno/);

  // E il caso sano resta sano: stesso giorno → si misura e si decide.
  const oggi = tokenPerGate({ data: "2026-07-29", runs: 4, token_stimati: 900_000 }, "2026-07-29");
  assert.equal(oggi.fonte, FONTI.MISURA);
  assert.equal(oggi.valore, 900_000);
});

test("AR-368 (comando vero): un costo-ai.json datato ieri fa uscire freno-costi con rc=2", () => {
  const dir = mkdtempSync(join(tmpdir(), "c5-freno-"));
  const file = join(dir, "costo-ai.json");
  try {
    const ieri = new Date(Date.now() - 86_400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
    writeFileSync(file, JSON.stringify({ soglia_giornaliera_token: 2_000_000, oggi: { data: ieri, runs: 11, token_totali: 0, token_stimati: 385_000 } }));
    const r = esegui([join(CERVELLO, "freno-costi.mjs"), `--file=${file}`, "--json"]);
    assert.equal(r.code, 2, `il freno doveva uscire CIECO (2), è uscito ${r.code}: ${r.out.slice(0, 200)}`);
    assert.match(r.out, /"azione": "cieco"/);

    // Controprova: lo stesso file datato OGGI e sotto soglia deve tornare a dire «lascia» (0).
    const oggi = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
    writeFileSync(file, JSON.stringify({ soglia_giornaliera_token: 2_000_000, oggi: { data: oggi, runs: 11, token_totali: 0, token_stimati: 385_000 } }));
    const ok = esegui([join(CERVELLO, "freno-costi.mjs"), `--file=${file}`, "--json"]);
    assert.equal(ok.code, 0, "il fix non deve rendere il freno cieco sempre: sarebbe l'altro modo di non misurare");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── AR-369: la quota si misura dove sta il muro ─────────────────────────────

test("AR-369: l'asse quota decide sulla FINESTRA ROLLING, non sul giorno solare", () => {
  const adesso = Date.parse("2026-08-14T12:00:00+02:00");
  const costo = {
    soglia_giornaliera_token: 2_000_000,
    sessione_rolling_min: 360,
    oggi: { data: "2026-08-14", token_per_gate: 445_000 }, // 22% del giorno: sembra tranquillo
    sessione_rolling: { token_sessione_rolling: 400_000, runs_sessione: 4, finestra_min: 360, aggiornato: "2026-08-14 11:59" },
  };
  const asse = asseQuotaSessione(costo, adesso);
  assert.equal(asse.esito, FINESTRA.VIVA);
  assert.equal(asse.soglia, 500_000, "la soglia della finestra si deriva dal tetto giornaliero in proporzione (2.000.000 × 360/1440)");
  assert.ok(asse.pct > 50, `la finestra dice ${asse.pct}%: è il numero che ferma la macchina, non il 22% del giorno`);
  assert.ok(String(asse.soglia_fonte).length > 0, "un numero senza fonte non deve poter passare per misurato");
});

test("AR-369: una misura rolling VECCHIA non vale zero — l'asse non viene valutato", () => {
  // Il caso vero misurato il 14/8: `sessione_rolling.aggiornato` era di 466 minuti prima, cioè
  // fuori dalla finestra di 360. Prima il letargo avrebbe comunque prodotto una percentuale.
  const adesso = Date.parse("2026-08-14T19:45:00+02:00");
  const costo = {
    soglia_giornaliera_token: 2_000_000,
    sessione_rolling: { token_sessione_rolling: 270_000, runs_sessione: 4, finestra_min: 360, aggiornato: "2026-08-14 11:59" },
  };
  const asse = asseQuotaSessione(costo, adesso);
  assert.equal(asse.esito, FINESTRA.SCADUTA);
  assert.equal(asse.pct, null, "una finestra scaduta non produce una percentuale rassicurante");
  assert.match(asse.motivo, /non valutata/);

  // E se il blocco rolling manca del tutto: assente, non zero.
  const senza = asseQuotaSessione({ soglia_giornaliera_token: 2_000_000 }, adesso);
  assert.equal(senza.pct, null);
  assert.equal(senza.esito, FINESTRA.ASSENTE);
});

test("AR-369 (comando vero): il letargo dichiara l'asse quota non valutato invece di tacere", () => {
  const dir = mkdtempSync(join(tmpdir(), "c5-letargo-"));
  try {
    writeFileSync(join(dir, "sensori-cecita.json"), JSON.stringify({ sensori: {}, meta: { max_giri_ciechi: 0, max_giri_ciechi_dati: 0 } }));
    writeFileSync(
      join(dir, "costo-ai.json"),
      JSON.stringify({
        soglia_giornaliera_token: 2_000_000,
        oggi: { data: "2026-01-01", token_per_gate: 10 },
        sessione_rolling: { token_sessione_rolling: 270_000, runs_sessione: 4, finestra_min: 360, aggiornato: "2026-01-01 00:00" },
      })
    );
    const r = esegui([join(CERVELLO, "letargo.mjs"), "--json"], { LETARGO_AC_DIR: dir });
    const j = JSON.parse(r.out);
    assert.equal(j.assi.quota_ai_pct, null, "con la finestra scaduta non esce nessuna percentuale");
    assert.equal(j.assi.quota_sessione.esito, FINESTRA.SCADUTA);
    assert.match(j.cautele.join(" · "), /asse quota NON valutato/, "l'asse non valutato deve VEDERSI, non sparire in silenzio");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── AR-431: la mappa dei rischi ha una scadenza ─────────────────────────────

test("AR-431: un rischio ALTA non rivisto da oltre 30 giorni fa fallire il guardiano", () => {
  const adesso = Date.parse("2026-08-14T12:00:00+02:00");
  const fermo = {
    aggiornato: "2026-07-02 12:59",
    rischi: [
      { id: "N1", rischio: "PSD2", gravita: "alta", ultima_revisione: "2026-07-02" },
      { id: "B9", rischio: "roba minore", gravita: "bassa", ultima_revisione: "2025-01-01" },
    ],
  };
  const v = verdettoFreschezza(fermo, adesso);
  assert.equal(v.ok, false, "43 giorni senza revisione su un rischio ALTA non è un verde");
  assert.equal(v.stantii.length, 1, "il rischio BASSA può dormire: non deve fare rumore");
  assert.equal(v.stantii[0].id, "N1");

  const fresco = {
    aggiornato: "2026-08-13 09:00",
    rischi: [{ id: "N1", rischio: "PSD2", gravita: "alta", ultima_revisione: "2026-08-13" }],
  };
  assert.equal(verdettoFreschezza(fresco, adesso).ok, true, "un registro curato deve poter passare, o il guardiano è solo rumore");
});

test("AR-431 (comando vero): il guardiano esiste, gira e sa dire sia di sì sia di no", () => {
  const dir = mkdtempSync(join(tmpdir(), "c5-rischi-"));
  const file = join(dir, "REGISTRO-RISCHI.json");
  try {
    writeFileSync(file, JSON.stringify({ aggiornato: "2026-01-01 00:00", rischi: [{ id: "N1", rischio: "PSD2", gravita: "alta", ultima_revisione: "2026-01-01" }] }));
    const rosso = esegui([join(CERVELLO, "freschezza-rischi.mjs")], { RISCHI_FILE: file });
    assert.equal(rosso.code, 1, "un registro fermo da mesi deve uscire 1");
    assert.match(rosso.out, /STANTIA/);

    const oggi = new Date().toISOString().slice(0, 10);
    writeFileSync(file, JSON.stringify({ aggiornato: `${oggi} 09:00`, rischi: [{ id: "N1", rischio: "PSD2", gravita: "alta", ultima_revisione: oggi }] }));
    const verde = esegui([join(CERVELLO, "freschezza-rischi.mjs")], { RISCHI_FILE: file });
    assert.equal(verde.code, 0, "e uno aggiornato oggi deve uscire 0");

    const cieco = esegui([join(CERVELLO, "freschezza-rischi.mjs")], { RISCHI_FILE: join(dir, "non-esiste.json") });
    assert.equal(cieco.code, 2, "un registro illeggibile è CIECO (2), mai un verde");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── il modulo condiviso, provato da solo ────────────────────────────────────

test("AR-368/AR-369/AR-431: la finestra scaduta, assente o vuota non è mai decidibile", () => {
  const adesso = Date.parse("2026-08-14T12:00:00+02:00");
  assert.equal(statoFinestra({ valore: 10, timbro: "2026-08-14 11:50", adessoMs: adesso, finestraMin: 360 }).esito, FINESTRA.VIVA);
  assert.equal(statoFinestra({ valore: 10, timbro: "2026-08-13 11:50", adessoMs: adesso, finestraMin: 360 }).esito, FINESTRA.SCADUTA);
  assert.equal(statoFinestra({ valore: null, timbro: "2026-08-14 11:50", adessoMs: adesso, finestraMin: 360 }).esito, FINESTRA.ASSENTE);
  assert.equal(statoFinestra({ valore: 0, timbro: "2026-08-14 11:50", adessoMs: adesso, finestraMin: 360, campioni: 0 }).esito, FINESTRA.VUOTA);
  // Una data senza ora è una data, non un timbro illeggibile: altrimenti il guardiano dei rischi
  // nascerebbe cieco sul formato che il vault usa davvero.
  assert.equal(statoRevisione({ timbro: "2026-08-14", adessoMs: adesso, tettoGiorni: 30 }).esito, FINESTRA.VIVA);
});
