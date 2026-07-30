#!/usr/bin/env node
// 🧪 LA MEMORIA GIUSTA E LA CASELLA SBAGLIATA.
//
// Il 20/7 Nicola ha corretto la macchina due volte sullo stesso punto, a sei ore di distanza:
// L-2026-0720-391 («la casella del pitch dice 12% zero fissi, MyCity ha il 10% e 50 €/mese») e
// L-2026-0720-413 («non hai aggiornato la memoria centrale o le caselle non sono collegate»).
//
// La difesa costruita allora è stata una regola scritta: «dopo una correzione in registro-fatti,
// cerca TUTTE le superfici». Cioè un promemoria. E il guardiano che esiste esattamente per
// garantire che nessuna copia vecchia sopravviva — `coerenza-fatti.mjs` — guardava quattro cartelle
// di memoria e NON il codice del Pannello: sull'unica superficie che Nicola vede davvero rispondeva
// verde per costruzione. Un freno che non arriva dove avviene l'errore.
//
// Questa prova esercita il guardiano vero su un registro temporaneo, con una caccia che punta a una
// frase PESCATA A RUNTIME da un file del Pannello: se domani quel file cambia, la prova pesca
// un'altra frase invece di diventare falsa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = join(REPO, "cervello/coerenza-fatti.mjs");

/** Una stringa lunga, letterale e stabile presa da un file vero del Pannello. */
function frasePescataDalPannello() {
  const dir = join(REPO, "pannello/src/components");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx")).sort()) {
    const src = readFileSync(join(dir, f), "utf8");
    // Una frase in italiano dentro una stringa o del testo JSX: abbastanza lunga da non essere
    // ambigua, senza caratteri che confondano la ricerca del guardiano.
    const m = src.match(/[A-Za-zÀ-ù][A-Za-zÀ-ù ,'`]{34,80}/g);
    const buona = (m || []).map((s) => s.trim()).find((s) => s.split(" ").length >= 5 && !s.includes("  "));
    if (buona) return { file: `pannello/src/components/${f}`, frase: buona };
  }
  return null;
}

function lancia(registro, report) {
  return spawnSync("node", [GUARDIANO], {
    cwd: REPO,
    encoding: "utf8",
    env: { ...process.env, COERENZA_FATTI_REGISTRO: registro, COERENZA_FATTI_REPORT: report },
    timeout: 120_000,
  });
}

function registroCon(caccia, cartella) {
  const registro = join(cartella, "registro-fatti.json");
  writeFileSync(
    registro,
    JSON.stringify(
      {
        versione: 1,
        aggiornato: "2026-07-30 01:30",
        fatti: [
          {
            id: "prova.superficie",
            nome: "Fatto di prova",
            valore: "valore nuovo",
            fonte: "test superficie-che-mente",
            aggiornato: "2026-07-30 01:30",
            storia: [],
            // Una caccia è un oggetto {pattern, dal}, non una stringa: il guardiano legge `c.pattern`.
            caccia: caccia ? [{ pattern: caccia, dal: "2026-07-30 01:30" }] : [],
          },
        ],
      },
      null,
      1,
    ),
  );
  return registro;
}

test("una copia vecchia dentro il CODICE del Pannello fa fallire il guardiano", () => {
  const pesca = frasePescataDalPannello();
  assert.ok(pesca, "serve almeno un .tsx con una frase in chiaro: se non c'è, la prova non ha misurato");
  const dir = mkdtempSync(join(tmpdir(), "coerenza-"));
  const registro = registroCon(pesca.frase, dir);
  const r = lancia(registro, join(dir, "report.json"));
  assert.notEqual(
    r.status,
    0,
    `il guardiano dovrebbe trovare «${pesca.frase}» in ${pesca.file} e uscire ≠0, invece è uscito ${r.status}.\n${r.stdout}${r.stderr}`,
  );
  assert.match(`${r.stdout}${r.stderr}`, /pannello\/src/, "e deve dire IN QUALE file l'ha trovata, non solo che c'è");
});

test("senza cacce aperte resta verde: non inventa allarmi", () => {
  const dir = mkdtempSync(join(tmpdir(), "coerenza-"));
  const registro = registroCon(null, dir);
  const r = lancia(registro, join(dir, "report.json"));
  assert.equal(r.status, 0, `zero cacce = niente da cercare, invece: ${r.stdout}${r.stderr}`);
});

test("una frase che non esiste da nessuna parte non fa scattare niente", () => {
  const dir = mkdtempSync(join(tmpdir(), "coerenza-"));
  const registro = registroCon("questa frase non compare in nessun file di questo repo zqxjkv", dir);
  const r = lancia(registro, join(dir, "report.json"));
  assert.equal(r.status, 0, "un guardiano che grida sempre è un guardiano spento");
});

test("le radici e le estensioni coprono il Pannello, e la storia resta esente", () => {
  const src = readFileSync(GUARDIANO, "utf8");
  const radici = src.match(/const RADICI_SCANSIONE = \[(.*?)\]/s)[1];
  assert.match(radici, /pannello\/src/, "la superficie che Nicola vede deve stare fra le radici");
  assert.doesNotMatch(
    radici,
    /"cervello"/,
    "cervello/ NON va incluso: i suoi commenti raccontano i valori vecchi apposta, e la storia non si riscrive",
  );
  const est = src.match(/const ESTENSIONI = new Set\(\[(.*?)\]\)/s)[1];
  assert.match(est, /\.tsx/, "senza .tsx la radice del Pannello sarebbe decorativa");
});
