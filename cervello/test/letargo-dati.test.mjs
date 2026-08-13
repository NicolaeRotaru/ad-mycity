#!/usr/bin/env node
// 🧾 AR-589 — la modalità sopravvivenza scattava sul contatore sbagliato.
//
// Il letargo leggeva `meta.max_giri_ciechi` (il massimo su TUTTI i sensori ciechi, uptime del
// sito incluso): 103 giri di solo `sito_uptime` cieco votavano SOPRAVVIVENZA mentre la cecità
// dei DATI era 0. Il sito giù è un guasto vero (AR-588, non qui) ma non rende ciechi i dati.
// Cura: il bump usa `meta.max_giri_ciechi_dati` (solo fonti-di-verità dati).
//
// Le prove eseguono la decisione pura (livelloLetargo) E il comando vero in un sottoprocesso,
// con la memoria iniettata via LETARGO_AC_DIR (mai la memoria vera).

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
// L'import stesso è una prova: prima del main-guard, importare letargo.mjs faceva PARTIRE il
// programma (lettura memoria vera + process.exit) — la malattia «programma-che-parte-importando».
import { livelloLetargo } from "../letargo.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const LETARGO = join(QUI, "..", "letargo.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n").slice(0, 3).join(" | ") });
  }
};

/** Esegue il comando vero su una cartella auto-coscienza finta. */
function eseguiLetargo(cecitaMeta) {
  const dir = mkdtempSync(join(tmpdir(), "letargo-dati-"));
  writeFileSync(join(dir, "sensori-cecita.json"), JSON.stringify({ sensori: {}, meta: cecitaMeta }, null, 2));
  try {
    const out = execFileSync("node", [LETARGO, "--json"], {
      env: { ...process.env, LETARGO_AC_DIR: dir },
      encoding: "utf8",
      timeout: 60000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { json: JSON.parse(out), code: 0 };
  } catch (e) {
    return { json: JSON.parse(String(e.stdout || "{}")), code: e.status ?? 1 };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── La decisione pura ────────────────────────────────────────────────────────
prova("AR-589 (pura): cecità dati 0 → NORMALE, qualunque cosa faccia l'uptime (che non entra)", () => {
  const { livello } = livelloLetargo({ quotaPct: null, runway: null, runwaySoglia: 3, cecitaDati: 0, salute: null });
  assert.equal(livello, "NORMALE");
});

prova("AR-589 (pura): la cecità DATI fa scattare i livelli giusti (3 → RISPARMIO, 5+ → SOPRAVVIVENZA)", () => {
  assert.equal(livelloLetargo({ quotaPct: null, runway: null, runwaySoglia: 3, cecitaDati: 3, salute: null }).livello, "RISPARMIO");
  const s = livelloLetargo({ quotaPct: null, runway: null, runwaySoglia: 3, cecitaDati: 103, salute: null });
  assert.equal(s.livello, "SOPRAVVIVENZA");
  assert.match(s.motivi.join(" · "), /fonti dati/, "il motivo deve dire che sono le fonti DATI, non i sensori in genere");
});

// ── Il comando vero: la riproduzione della scheda ────────────────────────────
prova("AR-589 (comando vero): 103 giri ciechi di SOLO uptime, cecità-dati 0 → NORMALE, exit 0", () => {
  const { json, code } = eseguiLetargo({ max_giri_ciechi: 103, max_giri_ciechi_dati: 0 });
  assert.equal(json.livello, "NORMALE", `livello ${json.livello}: il sito giù non è cecità dei dati`);
  assert.equal(code, 0);
  assert.equal(json.assi.sensori_giri_ciechi, 0, "l'asse deve mostrare la cecità DATI");
  assert.match(json.cautele.join(" · "), /uptime|non-dati/i, "il guasto uptime va comunque dichiarato come cautela, non taciuto");
});

prova("AR-589 (comando vero): cecità-dati 103 → SOPRAVVIVENZA, exit 1 (il freno vero resta)", () => {
  const { json, code } = eseguiLetargo({ max_giri_ciechi: 103, max_giri_ciechi_dati: 103 });
  assert.equal(json.livello, "SOPRAVVIVENZA");
  assert.equal(code, 1);
});

// ── Verdetto del file di prova ───────────────────────────────────────────────
const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}\n# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
