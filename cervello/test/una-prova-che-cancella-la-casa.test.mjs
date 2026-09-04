#!/usr/bin/env node
// ☠️ AR-924 — UNA PROVA HA CANCELLATO 956 FILE, E QUELLO CHE HO VISTO È STATO UNO STACK TRACE
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Il 31/8 una corsa del banco delle mutazioni ha portato via tutta la cartella `cervello/`. Non per
// un difetto del banco: per una PROVA. La prova di AR-923 faceva pulizia così —
//     rmSync(dirname(fuoriRepo(...)), { recursive: true })
// cioè cancellava una cartella il cui nome veniva dalla funzione sotto esame. Ed è esattamente ciò
// che il banco fa di mestiere: ROMPE quella funzione. Rotta, tornava un percorso dentro il repo, e
// la pulizia ha portato via il repo. I file sono tornati da git, ma è stato un ripristino.
//
// Quello che si vedeva sullo schermo era un `ENOENT` con lo stack. Nessuna riga diceva che
// mancavano novecentocinquantasei file: l'ho scoperto guardando `ls`.
//
// ⚠️ QUESTO GUARDIANO NON CERCA IL PEZZO DI CODICE, cerca il DANNO — ed è una scelta, non una
// pigrizia. Ho misurato le 441 prove di oggi con uno scanner apposta: quante cancellano
// ricorsivamente un percorso calcolato dal codice sotto esame? ZERO (l'unica segnalata era il
// commento qui sopra, che descrive la forma vecchia). Un guardiano su una popolazione di zero
// difende dalla forma che conosco e non dalla prossima. Il danno invece si vede comunque.
//
// LA REGOLA, che vale per ogni prova di questa casa: non si cancella mai una cartella il cui nome
// viene dal codice che si sta provando. Si cancella solo ciò che la prova ha creato da sé, con un
// percorso che conosce indipendentemente.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { fileCancellati } from "../non-vacuita.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Un repo git vero, piccolo, tutto mio: qui posso cancellare davvero senza rischiare niente. */
function repoFinto() {
  const casa = mkdtempSync(join(tmpdir(), "ar900-"));
  const git = (...a) => spawnSync("git", a, { cwd: casa, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "prova@esempio.invalid");
  git("config", "user.name", "prova");
  for (const f of ["uno.txt", "due.txt", "tre.txt"]) writeFileSync(join(casa, f), `${f}\n`);
  git("add", "-A");
  git("commit", "-qm", "primo");
  return { casa, git };
}

test("AR-924 · su un albero pulito non conta nessuna cancellazione", () => {
  const { casa } = repoFinto();
  assert.deepEqual(fileCancellati(spawnSync, casa), []);
  rmSync(casa, { recursive: true, force: true });
});

test("AR-924 · quando un file sparisce DAVVERO, il censimento lo nomina", () => {
  const { casa } = repoFinto();
  rmSync(join(casa, "due.txt"));
  const mancanti = fileCancellati(spawnSync, casa);
  assert.deepEqual(mancanti, ["due.txt"], "un file cancellato non è stato contato: l'incidente passerebbe muto");
  rmSync(casa, { recursive: true, force: true });
});

test("AR-924 · una cartella intera portata via si conta file per file", () => {
  const { casa, git } = repoFinto();
  const dentro = join(casa, "cartella");
  spawnSync("mkdir", ["-p", dentro]);
  for (const f of ["a.txt", "b.txt"]) writeFileSync(join(dentro, f), "x\n");
  git("add", "-A");
  git("commit", "-qm", "secondo");
  rmSync(dentro, { recursive: true, force: true });
  const mancanti = fileCancellati(spawnSync, casa);
  assert.deepEqual(mancanti.sort(), ["cartella/a.txt", "cartella/b.txt"]);
  rmSync(casa, { recursive: true, force: true });
});

test("AR-924 · una modifica non è una cancellazione: nessun falso allarme", () => {
  const { casa } = repoFinto();
  writeFileSync(join(casa, "uno.txt"), "cambiato\n");
  assert.deepEqual(fileCancellati(spawnSync, casa), [],
    "una modifica contata come cancellazione farebbe gridare al lupo a ogni corsa, e il guardiano si impara a spegnere");
  rmSync(casa, { recursive: true, force: true });
});

test("AR-924 · un file NUOVO non è una cancellazione", () => {
  const { casa } = repoFinto();
  writeFileSync(join(casa, "quattro.txt"), "nuovo\n");
  assert.deepEqual(fileCancellati(spawnSync, casa), []);
  rmSync(casa, { recursive: true, force: true });
});

test("AR-924 · dove git non risponde il verdetto è ⚪, non «zero cancellati»", () => {
  const nonUnRepo = mkdtempSync(join(tmpdir(), "ar900-nonrepo-"));
  assert.equal(fileCancellati(spawnSync, nonUnRepo), null,
    "«non ho potuto contare» tornato come «non manca niente» è la bugia esatta che questo guardiano esiste per impedire");
  rmSync(nonUnRepo, { recursive: true, force: true });
});

test("AR-924 · e nel repo vero, adesso, non manca niente", () => {
  const mancanti = fileCancellati(spawnSync, REPO);
  if (mancanti === null) return; // ⚪ git non risponde: non ho misurato
  assert.deepEqual(mancanti, [], `mancano dei file dall'albero di lavoro: ${mancanti.slice(0, 5).join(", ")}`);
  assert.equal(existsSync(join(REPO, "cervello")), true);
});
