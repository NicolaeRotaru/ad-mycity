#!/usr/bin/env node
// 🩹 AR-643 — GLI ERRORI DI GIT FINIVANO CRUDI NEL VERDETTO DI CHIUSURA DEL TURNO.
//
// Visto dal vivo, non dedotto: alla fine di ogni turno di questo lotto, sopra il referto che Nicola
// legge, comparivano tre righe così —
//
//     fatal: origin/main...HEAD: no merge base
//     fatal: origin/main...HEAD: no merge base
//     fatal: main...HEAD: no merge base
//
// In inglese, senza dire quale comando le avesse prodotte né se fossero un problema o no. Sono lo
// `stderr` di git che la porta condivisa `percorsiDaGit` lasciava EREDITARE al terminale invece di
// catturarlo.
//
// ⚠️ **Dove va la riparazione.** La scheda indicava un chiamante. Il codice dice un'altra cosa: da
// `percorsiDaGit` passano `cancello-stop`, `salute`, `scan-segreti`, `sorvegliante`, `collaudo`,
// `forma-json`, `cancello-senior` e `import-che-esegue`. Curare un chiamante avrebbe lasciato gli
// altri sette a stampare il crudo — la cura sta alla PORTA, dove vale per chiunque passi.
//
// Questa prova fa due cose:
//   (a) un git che fallisce davvero non deve scrivere niente sul terminale, e deve alzare un errore
//       DI CASA che nomina il comando (l'informazione che al referto mancava);
//   (b) fa da cancello: nessuno script del cervello può chiedere elenchi a git aggirando la porta,
//       perché chi la aggira si riporta dietro il difetto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const PORTA = join(REPO, "cervello", "percorsi-git.mjs");

// ── (a) L'EFFETTO: stderr catturato, errore parlante ─────────────────────────────────────────────

test("un git che fallisce non sporca il terminale, e l'errore dice quale comando è stato", () => {
  // Un repo git vero e vuoto: `diff branch-che-non-esiste...HEAD` fallisce come nel caso reale.
  const dir = mkdtempSync(join(tmpdir(), "ar643-"));
  try {
    for (const args of [["init", "-q"], ["config", "user.email", "t@t"], ["config", "user.name", "t"]]) {
      spawnSync("git", args, { cwd: dir });
    }
    spawnSync("git", ["commit", "-q", "--allow-empty", "-m", "vuoto"], { cwd: dir });

    // Il figlio EREDITA stdio dal padre: se la porta lasciasse passare lo stderr di git, comparirebbe
    // qui dentro. Così la prova misura ciò che vedrebbe Nicola, non ciò che si spera.
    const codice = `
      const { percorsiDaGit } = await import(${JSON.stringify(PORTA)});
      try { percorsiDaGit(["diff", "ramo-che-non-esiste...HEAD", "--name-only"], { cwd: ${JSON.stringify(dir)} }); }
      catch (e) { process.stdout.write("ERRORE:" + e.message); process.exit(0); }
      process.stdout.write("NESSUN-ERRORE");
    `;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", codice], { encoding: "utf8" });

    assert.equal(r.stderr, "", `git ha stampato sul terminale: «${r.stderr.trim()}» — è la riga che finiva nel referto`);
    assert.match(r.stdout, /^ERRORE:/, "un git fallito deve alzare un errore, non tornare una lista vuota");
    assert.match(r.stdout, /git diff ramo-che-non-esiste\.\.\.HEAD/, "l'errore deve nominare il comando: era l'informazione che al referto mancava");
    assert.doesNotMatch(r.stdout, /\n.*\n/, "una riga sola: un referto non è un dump");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("quando git NON fallisce la porta si comporta come prima", () => {
  // Controprova: la cura non deve aver cambiato il caso normale.
  const dir = mkdtempSync(join(tmpdir(), "ar643-ok-"));
  try {
    spawnSync("git", ["init", "-q"], { cwd: dir });
    const codice = `
      const { percorsiDaGit } = await import(${JSON.stringify(PORTA)});
      const out = percorsiDaGit(["ls-files", "--others", "--exclude-standard"], { cwd: ${JSON.stringify(dir)} });
      process.stdout.write(JSON.stringify(out));
    `;
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", codice], { encoding: "utf8" });
    assert.equal(r.status, 0, `doveva riuscire: ${r.stderr}`);
    assert.deepEqual(JSON.parse(r.stdout), [], "un repo vuoto non ha file non tracciati");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
