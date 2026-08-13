#!/usr/bin/env node
// AR-633 — il cancello di pubblicazione restava VERDE anche con un guardiano SPARITO.
//
// Il buco, in cervello/gate-pubblicazione.sh: `[ -f "$dir/vault-sanita.mjs" ] && { node … || rc=$?; }`
// — a file assente il ramo non gira, rc resta 0, e il cancello passa CON UN METRO IN MENO, in
// silenzio. Due righe sopra lo stesso file scriveva già la regola per node assente: «il cancello
// dev'essere CIECO, non verde». Vale identica per il file del guardiano.
//
// Niente bats installato qui: la funzione VERA viene ESEGUITA sorgendo lo script in una bash pulita,
// dentro un repo git di prova e con una cartella-guardiani finta — non si greppa il sorgente.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const SH = join(QUI, "..", "gate-pubblicazione.sh");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

/** Esegue una funzione reale del gate; torna rc + stderr (dove il gate spiega i suoi no). */
function esito(cmd) {
  try {
    execFileSync("bash", ["-c", `. "${SH}"; ${cmd}`], { encoding: "utf8", stdio: "pipe" });
    return { rc: 0, err: "" };
  } catch (e) {
    return { rc: e.status ?? 1, err: String(e.stderr || "") };
  }
}

/** Un repo git vero su main, con un commit e lo stage vuoto: ramo e perimetro passano. */
function repoDiProva(base) {
  const repo = join(base, "repo");
  mkdirSync(repo);
  const git = (...a) => execFileSync("git", ["-C", repo, ...a], { stdio: "pipe", encoding: "utf8" });
  execFileSync("git", ["init", "-b", "main", repo], { stdio: "pipe" });
  git("config", "user.email", "prova@mycity");
  git("config", "user.name", "prova");
  writeFileSync(join(repo, "memoria.md"), "primo\n");
  git("add", "-A");
  git("commit", "-q", "-m", "primo");
  return repo;
}

/** Una cartella-guardiani finta: solo i file elencati, tutti guardiani che escono 0. */
function guardianiFinti(base, nomi) {
  const dir = join(base, "guardiani");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  for (const n of nomi) writeFileSync(join(dir, n), "process.exit(0);\n");
  return dir;
}

const TUTTI = ["scan-segreti.mjs", "coerenza-fatti.mjs", "vault-sanita.mjs"];

// ── la decisione, eseguita ───────────────────────────────────────────────────
prova("guardiano_presente: file esistente 0, file sparito 1, argomento vuoto 1", () => {
  assert.equal(esito(`guardiano_presente "${SH}"`).rc, 0);
  assert.equal(esito('guardiano_presente "/non/esiste/vault-sanita.mjs"').rc, 1);
  assert.equal(esito('guardiano_presente ""').rc, 1, "nel dubbio il metro non c'è");
});

// ── il cancello intero, eseguito in sandbox ──────────────────────────────────
prova("il caso che ha rotto: vault-sanita.mjs SPARITO → il cancello NON passa, e lo dice", () => {
  const base = mkdtempSync(join(tmpdir(), "gate-cieco-"));
  const repo = repoDiProva(base);
  const dir = guardianiFinti(base, TUTTI.filter((n) => n !== "vault-sanita.mjs"));
  const r = esito(`cd "${repo}"; gate_pubblicazione "${dir}" "${repo}" main`);
  assert.equal(r.rc, 1, "un metro sparito non è un verde");
  assert.match(r.err, /vault-sanita\.mjs/, "deve nominare CHI manca");
  assert.match(r.err, /ASSENTE/i, "deve dire che manca, non un rc anonimo");
  rmSync(base, { recursive: true, force: true });
});

prova("stessa regola per gli altri due metri: scan-segreti sparito → non passa", () => {
  const base = mkdtempSync(join(tmpdir(), "gate-cieco2-"));
  const repo = repoDiProva(base);
  const dir = guardianiFinti(base, TUTTI.filter((n) => n !== "scan-segreti.mjs"));
  const r = esito(`cd "${repo}"; gate_pubblicazione "${dir}" "${repo}" main`);
  assert.equal(r.rc, 1);
  assert.match(r.err, /scan-segreti\.mjs/);
  rmSync(base, { recursive: true, force: true });
});

prova("controprova: coi tre guardiani PRESENTI e verdi il cancello passa (il fix non è sempre-rosso)", () => {
  const base = mkdtempSync(join(tmpdir(), "gate-verde-"));
  const repo = repoDiProva(base);
  const dir = guardianiFinti(base, TUTTI);
  const r = esito(`cd "${repo}"; gate_pubblicazione "${dir}" "${repo}" main`);
  assert.equal(r.rc, 0, `doveva passare:\n${r.err}`);
  rmSync(base, { recursive: true, force: true });
});

prova("un guardiano presente ma ROSSO ferma comunque (la vecchia protezione resta)", () => {
  const base = mkdtempSync(join(tmpdir(), "gate-rosso-"));
  const repo = repoDiProva(base);
  const dir = guardianiFinti(base, TUTTI);
  writeFileSync(join(dir, "vault-sanita.mjs"), "process.exit(3);\n");
  const r = esito(`cd "${repo}"; gate_pubblicazione "${dir}" "${repo}" main`);
  assert.equal(r.rc, 1);
  rmSync(base, { recursive: true, force: true });
});

// ── esito ────────────────────────────────────────────────────────────────────
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
