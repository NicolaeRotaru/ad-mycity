#!/usr/bin/env node
// 🔌 AR-339 — I CANCELLI CHE NON PARTONO NON SONO CANCELLI.
//
// SCOPERTO IL 29/7, provando il gate nuovo del cantiere: un commit che avrebbe DOVUTO essere
// bloccato è passato. Il gate era corretto; a non girare erano i git hook. In un clone fresco
// `core.hooksPath` non è configurato — git non lo eredita dal repo, è configurazione LOCALE — e
// finché nessuno lancia `installa-hooks.sh` la cartella `.githooks/` è solo una cartella.
//
// La portata è più larga del cantiere: nello stesso stato erano spenti anche il gate dei SEGRETI
// (AR-004), quello della sintassi shell (il worker-outage del 9/7) e il perimetro di main (AR-332).
// Quattro difese costruite in reazione ad altrettanti incidenti, tutte inattive in ogni sessione
// cloud — cioè proprio dove la macchina lavora da sola e nessuno guarda.
//
// Perché è sopravvissuto: `giro.sh` chiama `installa-hooks.sh` a ogni giro, quindi sul VPS i hook
// SONO attivi. Il buco si vede solo dove il giro non parte — e lì nessuno stava misurando.
//
// La cura: l'installazione si aggancia al SessionStart di Claude Code, che gira SEMPRE all'avvio di
// ogni sessione, non solo quando parte un giro.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("AR-339: un clone fresco NON ha i hook attivi — è lo stato di partenza da cui difendersi", () => {
  const dir = mkdtempSync(join(tmpdir(), "hook-"));
  execFileSync("git", ["init", "-q", "."], { cwd: dir });
  let valore = "";
  try {
    valore = execFileSync("git", ["config", "core.hooksPath"], { cwd: dir, encoding: "utf8" }).trim();
  } catch {
    valore = ""; // git esce 1 quando la chiave non c'è
  }
  assert.equal(valore, "", "in un clone nuovo core.hooksPath è vuoto: i .githooks/ non girano");
});

prova("AR-339: installa-hooks.sh accende il perimetro, ed è idempotente", () => {
  const dir = mkdtempSync(join(tmpdir(), "hook-"));
  execFileSync("git", ["init", "-q", "."], { cwd: dir });
  mkdirSync(join(dir, "cervello"), { recursive: true });
  mkdirSync(join(dir, ".githooks"), { recursive: true });
  writeFileSync(join(dir, "cervello/installa-hooks.sh"), readFileSync(join(REPO, "cervello/installa-hooks.sh")));
  writeFileSync(join(dir, ".githooks/pre-commit"), "#!/usr/bin/env bash\nexit 0\n", { mode: 0o755 });
  for (let volta = 0; volta < 2; volta++) {
    execFileSync("bash", ["cervello/installa-hooks.sh"], { cwd: dir, encoding: "utf8" });
    const v = execFileSync("git", ["config", "core.hooksPath"], { cwd: dir, encoding: "utf8" }).trim();
    assert.equal(v, ".githooks", `dopo la passata ${volta + 1} il perimetro deve essere attivo`);
  }
});

prova("AR-339: l'installazione parte all'AVVIO DI SESSIONE, non solo dentro il giro", () => {
  // È il cuore del difetto: `giro.sh` lo faceva già, quindi sul VPS i hook erano attivi e il buco
  // restava invisibile. Ogni sessione che committa senza fare un giro deve accenderli lo stesso.
  const cfg = JSON.parse(readFileSync(join(REPO, ".claude/settings.json"), "utf8"));
  const comandi = (cfg?.hooks?.SessionStart || []).flatMap((g) => (g.hooks || []).map((h) => h.command || ""));
  assert.ok(comandi.length, "deve esistere almeno un hook SessionStart");
  assert.ok(
    comandi.some((c) => c.includes("installa-hooks")),
    "il SessionStart deve installare i git hook: senza, ogni sessione cloud commette con i cancelli spenti",
  );
});

prova("AR-339: e il pre-commit contiene davvero i cancelli che diciamo di avere", () => {
  // Non-vacuità del controllo qui sopra: accendere un perimetro vuoto non protegge da niente.
  const hook = readFileSync(join(REPO, ".githooks/pre-commit"), "utf8");
  for (const atteso of ["scan-segreti", "bash -n", "cancello-lotto"]) {
    assert.ok(hook.includes(atteso), `il pre-commit deve contenere il cancello "${atteso}"`);
  }
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
