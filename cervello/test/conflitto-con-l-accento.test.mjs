#!/usr/bin/env node
// AR-341 — lo strumento che apre le richieste di modifica non riconosceva un file in conflitto se il
// nome aveva un accento.
//
// `unmergedPaths` in git-pr.mjs chiedeva l'elenco dei file in conflitto e confrontava ogni voce con
// i cinque percorsi che sa auto-risolvere. Git però restituiva il percorso citato e in ottali, che
// non corrisponde a niente. OGGI il difetto è latente e il comportamento è prudente — l'auto-
// risoluzione rinuncia invece di toccare il file sbagliato, e nessuno dei cinque percorsi ha un
// accento. Va chiuso lo stesso: è la stessa porta di AR-339 e AR-340, e una porta vale solo se ci
// passano tutti. Il caso che oggi non morde è quello che morderà quando qualcuno aggiungerà un
// percorso accentato all'elenco, cioè quando nessuno se lo aspetta.
//
// Non-vacuità, verificata a mano su due rotture indipendenti:
//   ① logica — togliendo il `-z` dentro percorsiDaGit: il conflitto torna citato e la prova fallisce.
//   ② innesto — rimettendo in git-pr.mjs la chiamata diretta a git al posto della porta: il metro
//      `chiamateFuoriDallaPorta` trova di nuovo la violazione e la prova fallisce.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chiamateFuoriDallaPorta, percorsiDaGit, sembraCitato } from "../percorsi-git.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const ACCENTATO = "Funzionalità/città.md";

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

/** Un repo con un conflitto VERO su un file dal nome accentato. Non simulato: un merge che fallisce. */
function repoConConflitto() {
  const dir = mkdtempSync(join(tmpdir(), "mycity-conflitto-"));
  const g = (...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  g("init", "-q", "-b", "principale", ".");
  g("config", "user.email", "prova@mycity.local");
  g("config", "user.name", "prova");
  mkdirSync(join(dir, dirname(ACCENTATO)), { recursive: true });
  writeFileSync(join(dir, ACCENTATO), "base\n");
  g("add", "-A");
  g("commit", "-qm", "base");
  g("checkout", "-q", "-b", "altro");
  writeFileSync(join(dir, ACCENTATO), "lato B\n");
  g("commit", "-qam", "b");
  g("checkout", "-q", "principale");
  writeFileSync(join(dir, ACCENTATO), "lato A\n");
  g("commit", "-qam", "a");
  g("merge", "altro"); // fallisce apposta: è il conflitto che ci serve
  return { dir, g };
}

// ── Il caso che passava ─────────────────────────────────────────────────────

prova("il file in conflitto arriva col nome che ha sul disco, non riscritto", () => {
  const { dir } = repoConConflitto();
  try {
    const dallaPorta = percorsiDaGit(["diff", "--name-only", "--diff-filter=U"], { cwd: dir });
    assert.deepEqual(dallaPorta, [ACCENTATO]);
    assert.equal(sembraCitato(dallaPorta), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("e la prova non è vinta per costruzione: senza la porta git lo riscrive DAVVERO", () => {
  // Se questo caso diventasse verde, il difetto non esisteva e la prova sopra non dimostrerebbe
  // nulla. È il controllo che tiene onesto il resto del file.
  const { dir, g } = repoConConflitto();
  try {
    const grezzo = g("diff", "--name-only", "--diff-filter=U").stdout.split("\n").filter(Boolean);
    assert.equal(grezzo.length, 1);
    assert.notEqual(grezzo[0], ACCENTATO, "senza -z git NON restituisce il nome vero");
    assert.equal(sembraCitato(grezzo), true);
    assert.match(grezzo[0], /\\303\\240/, "l'accento viene riscritto in ottali");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("un conflitto su un nome senza accenti continua a funzionare come prima", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-conflitto-"));
  const g = (...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  try {
    g("init", "-q", "-b", "principale", ".");
    g("config", "user.email", "prova@mycity.local");
    g("config", "user.name", "prova");
    writeFileSync(join(dir, "semplice.md"), "base\n");
    g("add", "-A"); g("commit", "-qm", "base");
    g("checkout", "-q", "-b", "altro");
    writeFileSync(join(dir, "semplice.md"), "B\n"); g("commit", "-qam", "b");
    g("checkout", "-q", "principale");
    writeFileSync(join(dir, "semplice.md"), "A\n"); g("commit", "-qam", "a");
    g("merge", "altro");
    assert.deepEqual(percorsiDaGit(["diff", "--name-only", "--diff-filter=U"], { cwd: dir }), ["semplice.md"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("nessun conflitto, nessun percorso fantasma", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-conflitto-"));
  try {
    spawnSync("git", ["init", "-q", "."], { cwd: dir });
    assert.deepEqual(percorsiDaGit(["diff", "--name-only", "--diff-filter=U"], { cwd: dir }), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── L'innesto: git-pr passa davvero dalla porta ─────────────────────────────

prova("git-pr chiede i conflitti dalla porta, non a git direttamente", () => {
  const src = readFileSync(join(REPO, "cervello/git-pr.mjs"), "utf8");
  const fuori = chiamateFuoriDallaPorta([{ file: "cervello/git-pr.mjs", testo: src }]);
  assert.deepEqual(fuori, [], `git-pr scavalca ancora la porta: ${JSON.stringify(fuori)}`);
  assert.match(src, /percorsiDaGit\(\["diff", "--name-only", "--diff-filter=U"\]/);
});

prova("la porta rifiuta un -z scritto a mano: lo mette lei, e una volta sola", () => {
  assert.throws(() => percorsiDaGit(["diff", "-z", "--name-only"]), /il -z lo mette la porta/);
  assert.throws(() => percorsiDaGit([]), /serve un array/);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
