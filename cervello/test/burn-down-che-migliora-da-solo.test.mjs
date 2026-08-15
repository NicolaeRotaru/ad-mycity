#!/usr/bin/env node
// 🧪 AR-671 — il burn-down del cantiere poteva migliorare DA SOLO.
//
// LA MECCANICA. Il confronto «quanti difetti erano aperti una settimana fa» si faceva sulle date, e
// `apertiAllaData` diceva `if (nato == null) return false`: una scheda senza data di nascita non
// veniva contata né oggi né sette giorni fa. Non spariva da un ramo: spariva dalla STATISTICA. E
// sempre dalla parte comoda — meno difetti nel passato e meno nel presente vuol dire un burn-down
// che sembra migliorare senza che nessuno abbia chiuso niente.
//
// Il giorno in cui è stato scritto il numero a video era ancora giusto (0 schede senza data fra i
// non chiusi), e questo è il punto: **il meccanismo per sbagliare c'era prima del numero sbagliato**.
// Una difesa scritta dopo il danno non è una difesa, è una toppa.
//
// LA CURA, provata qui: chi non si sa collocare nel tempo si CHIAMA — esce come `ignoti`, un numero
// suo — e il confronto con la settimana scorsa dichiara di quanto può sbagliare (`burn_down_margine`)
// invece di dare una cifra secca che nessuno può contestare.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { apertiAllaData, contaDifetti } = await import(join(REPO, "cervello/atti-veri.mjs"));

const T = (giorno) => Date.parse(giorno);
const SETTIMANA_FA = T("2026-08-08");

// ── ① la decisione pura ───────────────────────────────────────────────────────

test("⬇️ AR-671 — un difetto SENZA data di nascita non esce dalla statistica: si chiama ignoto", () => {
  const r = apertiAllaData([{ id: "AR-1", stato: "aperto" }], SETTIMANA_FA);
  assert.equal(r.conteggio, 0, "un difetto che non so collocare non può essere contato come se lo sapessi");
  assert.equal(r.ignoti, 1, "il difetto è uscito in silenzio dal conto storico: è così che il burn-down migliora da solo");
});

test("⬇️ AR-671 — l'ignoto NON si mischia con i difetti veri: due numeri, non uno", () => {
  const r = apertiAllaData(
    [
      { id: "AR-1", stato: "aperto", nato: "2026-08-01" }, // nato prima, ancora aperto → conta
      { id: "AR-2", stato: "aperto", nato: "2026-08-12" }, // non ancora nato a quella data
      { id: "AR-3", stato: "aperto" }, // senza data → ignoto
      { id: "AR-4", stato: "chiuso", nato: "2026-08-01", chiuso_il: "2026-08-05" }, // già chiuso allora
    ],
    SETTIMANA_FA,
  );
  assert.equal(r.conteggio, 1);
  assert.equal(r.ignoti, 1);
});

test("AR-671 — una scheda senza data ma GIÀ chiusa a quella data non è un dubbio: non gonfia gli ignoti", () => {
  const r = apertiAllaData([{ id: "AR-9", stato: "chiuso", chiuso_il: "2026-08-01" }], SETTIMANA_FA);
  assert.equal(r.ignoti, 0, "un difetto già chiuso allora non lascia nessuna incertezza sul passato");
  assert.equal(r.conteggio, 0);
});

test("⬇️ AR-671 — una lista illeggibile è cieca, non uno zero: il vuoto e la cecità restano distinti", () => {
  const cieco = apertiAllaData(null, SETTIMANA_FA);
  assert.equal(cieco.letto, false);
  assert.equal(cieco.conteggio, null, "una lista che non si è letta ha prodotto un numero: è un verde comprato");
  const vuoto = apertiAllaData([], SETTIMANA_FA);
  assert.equal(vuoto.letto, true);
  assert.equal(vuoto.conteggio, 0, "una lista vuota è una misura vera, e vale 0");
});

test("⬇️ AR-671 — una data non valida per «allora» acceca il confronto invece di inventarlo", () => {
  const r = apertiAllaData([{ id: "AR-1", stato: "aperto", nato: "2026-08-01" }], Number.NaN);
  assert.equal(r.conteggio, null);
  assert.equal(r.letto, false);
});

test("AR-671 — il numero di ADESSO non passa più dalle date: si conta sulla lista", () => {
  const lista = [
    { id: "AR-1", stato: "aperto" }, // senza data
    { id: "AR-2", stato: "in-corso", nato: "2026-08-01" },
    { id: "AR-3", stato: "da-riverificare", nato: "2026-08-01" },
    { id: "AR-4", stato: "chiuso", nato: "2026-08-01" },
  ];
  const c = contaDifetti(lista);
  assert.equal(c.da_fare, 3, "una scheda senza data di nascita è sparita anche dal conto di adesso");
  assert.equal(c.senza_data_nascita, 1, "il numero degli ignoti non viene dichiarato");
  assert.equal(c.chiusi + c.da_fare, c.totale, "la somma dei rami non fa il totale: da qualche parte cadono delle schede");
});

// ── ② il comando vero, sul cantiere vero ──────────────────────────────────────

test("⬇️ AR-671 — il referto vero dichiara il MARGINE del confronto, non solo il risultato", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello/salute-onesta.mjs"), "--json"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(r.status, 0, `salute-onesta non ha potuto misurare (uscita ${r.status}): ${r.stderr.slice(0, 300)}`);
  const d = JSON.parse(r.stdout);

  assert.ok(
    Object.prototype.hasOwnProperty.call(d, "cantiere_senza_data_nascita"),
    "il referto non dice quante schede non hanno una data di nascita: l'incertezza è tornata invisibile",
  );
  assert.ok(
    Object.prototype.hasOwnProperty.call(d, "burn_down_margine"),
    "il burn-down torna senza dire di quanto può sbagliare: è di nuovo un numero secco",
  );
  assert.equal(
    d.burn_down_margine,
    d.cantiere_aperti_settimana_fa_ignoti,
    "il margine dichiarato non è quello degli ignoti: due numeri per la stessa incertezza",
  );
  assert.equal(
    d.cantiere_chiusi + d.cantiere_aperti_ora,
    d.cantiere_totale,
    "chiuse + da fare non fa il totale del cantiere: delle schede stanno cadendo in un buco",
  );
});
