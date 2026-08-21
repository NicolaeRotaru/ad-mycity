// specchio-senza-doppioni.test.mjs — 2026-08-21, installazione del plugin Claude "superpowers".
//
// Il difetto che questa prova impedisce: due skill con lo STESSO nome caricate insieme.
// `using-superpowers` e `systematic-debugging` arrivano da obra/superpowers e stanno vendored in
// .cursor/skills (per il motore Cursor). Da quando il plugin Claude è attivo, Claude Code carica
// già le sue copie: se lo specchio .cursor → .claude ne scrive una seconda, la stessa skill esiste
// due volte — costa token a ogni sessione e rende ambigua l'attivazione.
//
// Le due direzioni contano tutte e due:
//  - plugin ATTIVO  → non si specchiano, e la copia vecchia va tolta (una macchina che aveva
//    specchiato PRIMA dell'installazione resterebbe col doppione)
//  - plugin ASSENTE → devono tornare, se no un VPS senza plugin resta senza quelle skill.
//
// Scritta in node:test e non in bats di proposito: i .bats girano solo dove qualcuno ha installato
// bats a mano, e in questo repo non è dichiarato nessun esecutore (`cervello/debito-prove-bash.mjs`
// li conta come debito). Una prova che nessuno fa girare non è una prova.
//
// Seme: SYNC_PLUGIN_ATTIVI (vedi pluginClaudeAttivo in sync-worker-plugins.mjs).

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const AD_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SYNC = join(AD_ROOT, "cervello/sync-worker-plugins.mjs");
const SKILLS = join(AD_ROOT, ".claude/skills");

/** Lancia lo specchio col plugin dichiarato attivo o assente. Torna quel che ha stampato. */
function specchia(pluginAttivi) {
  return execFileSync(process.execPath, [SYNC, "--specchia"], {
    cwd: AD_ROOT,
    encoding: "utf8",
    env: { ...process.env, SYNC_PLUGIN_ATTIVI: pluginAttivi },
  });
}

const skill = (nome) => join(SKILLS, nome, "SKILL.md");

// lo specchio è un file generato (fuori da git): la prova lo rimette com'era per la sessione vera
after(() => {
  try {
    execFileSync(process.execPath, [SYNC, "--specchia"], { cwd: AD_ROOT, stdio: "ignore" });
  } catch {
    // se lo specchio non riparte non è questa prova a doverlo dire
  }
});

test("col plugin superpowers attivo le due skill doppie non si specchiano", () => {
  specchia("superpowers");
  assert.equal(existsSync(skill("superpowers")), false, "using-superpowers specchiata: è il doppione");
  assert.equal(existsSync(skill("systematic-debugging")), false, "systematic-debugging specchiata: è il doppione");
});

test("col plugin attivo le altre skill restano (nessun danno collaterale)", () => {
  specchia("superpowers");
  for (const nome of ["grilling", "tdd", "ponytail"]) {
    assert.ok(existsSync(skill(nome)), `${nome} sparita: lo specchio ha tolto più del dovuto`);
  }
});

test("col plugin attivo la copia già specchiata viene rimossa", () => {
  specchia(""); // la macchina che aveva specchiato prima di installare il plugin
  assert.ok(existsSync(skill("systematic-debugging")));
  const detto = specchia("superpowers");
  assert.match(detto, /doppione rimosso/);
  assert.equal(existsSync(skill("systematic-debugging")), false);
});

test("senza il plugin le due skill tornano (VPS scoperto = no)", () => {
  specchia("");
  assert.ok(existsSync(skill("superpowers")));
  assert.ok(existsSync(skill("systematic-debugging")));
  assert.match(readFileSync(skill("superpowers"), "utf8"), /^name: using-superpowers$/m);
});

test("col plugin attivo resta idempotente (secondo giro non tocca niente)", () => {
  specchia("superpowers");
  assert.match(specchia("superpowers"), /0 file aggiornati/);
});

test("la pulizia tocca un file solo, non spazza la cartella", () => {
  // una voce marcata per sbaglio non deve poter cancellare roba di altri: si toglie il SKILL.md
  // specchiato, e la cartella solo se resta vuota
  specchia("");
  const estraneo = join(SKILLS, "systematic-debugging", "APPUNTI.md");
  writeFileSync(estraneo, "roba mia\n", "utf8");
  specchia("superpowers");
  assert.equal(existsSync(skill("systematic-debugging")), false, "il doppione non è stato tolto");
  assert.ok(existsSync(estraneo), "la pulizia ha portato via anche un file che non era suo");
  rmSync(join(SKILLS, "systematic-debugging"), { recursive: true, force: true });
});

test("le skill di progetto versionate restano intatte", () => {
  specchia("superpowers");
  for (const nome of ["verify", "cantiere", "salute", "worker", "senior"]) {
    assert.ok(existsSync(skill(nome)), `${nome} è una skill di progetto versionata: non si tocca`);
  }
});
