#!/usr/bin/env node
// AR-339 — lo scanner dei segreti diceva «nessun segreto in 2040 file» avendone aperti 2014.
//
// Git, di suo, non restituisce i nomi come stanno sul disco: se un percorso ha un byte non-ASCII lo
// riscrive fra virgolette con l'accento in ottali. In un vault italiano sono 26 file. `statSync`
// falliva su quei nomi e il ciclo faceva `continue` — lo stesso `continue` usato per i binari
// legittimi — mentre il totale stampato restava la lunghezza dell'ELENCO. Un file mai aperto
// contava come file pulito.
//
// Due difetti, e servono tutte e due le prove:
//   · il percorso sbagliato (curato dalla porta di percorsi-git.mjs);
//   · il silenzio (curato dal terzo esito «cieco»: un guardiano che non ha potuto guardare non dice
//     verde, e il numero che dichiara è quello dei file DAVVERO letti).
//
// Non-vacuità, verificata a mano rompendo il fix in due punti diversi:
//   ① logica — rimettendo `catch { continue }` al posto di `nonRaggiunti.push(rel)`: il caso
//      «l'elenco cita un file che non c'è» torna verde e la prova fallisce.
//   ② innesto — rimettendo la chiamata diretta a git senza `-z` in `fileDaScansionare`: il segreto
//      nel file accentato non viene più trovato e la prova fallisce.
// Le due rotture sono indipendenti: nessuna delle due da sola tiene il test verde.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { verdetto } from "../scan-segreti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SCANNER = join(REPO, "cervello/scan-segreti.mjs");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

/**
 * Un campione con la FORMA di una chiave, costruito a runtime e mai scritto per intero nel sorgente.
 * La lezione è di AR-270: un campione letterale con la forma di una chiave vera fa scattare lo
 * scanner su QUESTO file e blocca la pubblicazione della memoria — è già successo il 25/7.
 */
function campioneFinto() {
  return ["sk", "ant", "api03"].join("-") + "-" + "A".repeat(95);
}

/** Un repo finto con i file dati, e lo scanner eseguito sopra. */
function scansiona(files, { staged = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-segreti-"));
  try {
    spawnSync("git", ["init", "-q", "."], { cwd: dir });
    spawnSync("git", ["config", "user.email", "prova@mycity.local"], { cwd: dir });
    spawnSync("git", ["config", "user.name", "prova"], { cwd: dir });
    for (const [rel, contenuto] of Object.entries(files)) {
      mkdirSync(join(dir, dirname(rel)), { recursive: true });
      writeFileSync(join(dir, rel), contenuto);
    }
    if (staged) spawnSync("git", ["add", "-A"], { cwd: dir });
    const args = [SCANNER, "--json"];
    if (staged) args.push("--staged");
    const r = spawnSync("node", args, {
      encoding: "utf8",
      env: { ...process.env, SCAN_SEGRETI_REPO: dir },
    });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch { /* il rapporto lo guarda il caso */ }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`, json, dir };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── Il caso che passava: il segreto nascosto dietro un accento ──────────────

prova("il segreto in un file con l'accento nel nome adesso lo trova", () => {
  const r = scansiona({
    "MyCity-Vault/Funzionalità/città.md": `chiave di prova: ${campioneFinto()}\n`,
  });
  assert.equal(r.rc, 1, `atteso BLOCCO (rc=1), avuto ${r.rc}:\n${r.out}`);
  assert.match(r.out, /Funzionalità\/città\.md/, "il file va NOMINATO, non solo contato");
});

prova("e lo trova anche nel pre-commit, che è il momento che conta davvero", () => {
  const r = scansiona(
    { "MyCity-Vault/Funzionalità/città.md": `chiave di prova: ${campioneFinto()}\n` },
    { staged: true },
  );
  assert.equal(r.rc, 1, `il gate del commit deve bloccare:\n${r.out}`);
});

prova("un file con l'accento e SENZA segreti resta verde: il fix non è un allarme generico", () => {
  const r = scansiona({ "MyCity-Vault/Funzionalità/città.md": "solo prosa, nessuna chiave\n" });
  assert.equal(r.rc, 0, `atteso verde:\n${r.out}`);
  assert.equal(r.json.esito, "pulito");
  assert.equal(r.json.non_raggiunti.length, 0);
});

// ── Il secondo difetto: il silenzio ─────────────────────────────────────────

prova("un file elencato da git ma non apribile NON è un file pulito", () => {
  const dir = mkdtempSync(join(tmpdir(), "mycity-segreti-"));
  try {
    spawnSync("git", ["init", "-q", "."], { cwd: dir });
    spawnSync("git", ["config", "user.email", "prova@mycity.local"], { cwd: dir });
    spawnSync("git", ["config", "user.name", "prova"], { cwd: dir });
    writeFileSync(join(dir, "sparito.md"), "roba\n");
    spawnSync("git", ["add", "-A"], { cwd: dir });
    unlinkSync(join(dir, "sparito.md")); // git lo elenca ancora, il disco no
    const r = spawnSync("node", [SCANNER, "--json"], {
      encoding: "utf8",
      env: { ...process.env, SCAN_SEGRETI_REPO: dir },
    });
    assert.equal(r.status, 2, `atteso «non ho potuto misurare» (rc=2), avuto ${r.status}:\n${r.stdout}${r.stderr}`);
    const j = JSON.parse(r.stdout);
    assert.equal(j.esito, "cieco");
    assert.deepEqual(j.non_raggiunti, ["sparito.md"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── La decisione, eseguita ──────────────────────────────────────────────────

prova("il numero dichiarato è quello dei file LETTI, non la lunghezza dell'elenco", () => {
  const v = verdetto({ letti: 2014, nonRaggiunti: [], trovati: [] });
  assert.equal(v.codice, 0);
  assert.match(v.sintesi, /\b2014\b/);
  assert.doesNotMatch(v.sintesi, /\b2040\b/, "il totale non deve mai essere l'elenco: era questo il bug");
});

prova("cieco batte pulito, e trovato batte cieco", () => {
  assert.equal(verdetto({ letti: 10, nonRaggiunti: ["a"], trovati: [] }).esito, "cieco");
  assert.equal(verdetto({ letti: 10, nonRaggiunti: ["a"], trovati: [{ file: "b" }] }).esito, "trovato");
  assert.equal(verdetto({ letti: 10, nonRaggiunti: [], trovati: [] }).esito, "pulito");
});

prova("il cieco esce 2, non 1: «non ho potuto misurare» non è «ho trovato un segreto»", () => {
  // AR-322, il contratto dei guardiani: 0 passato · 1 fallito · 2 cieco. Confonderli fa perdere
  // l'informazione che serve per sapere se fidarsi del verde.
  assert.equal(verdetto({ letti: 1, nonRaggiunti: ["x"], trovati: [] }).codice, 2);
  assert.equal(verdetto({ letti: 1, nonRaggiunti: [], trovati: [{ file: "x" }] }).codice, 1);
});

// ── Il repo VERO ────────────────────────────────────────────────────────────

prova("sul repo vero non resta nemmeno un file che lo scanner non riesce ad aprire", () => {
  const r = spawnSync("node", [SCANNER, "--json"], { cwd: REPO, encoding: "utf8" });
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.non_raggiunti, [], `file elencati e mai aperti: ${j.non_raggiunti.join(", ")}`);
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout}${r.stderr}`);
  assert.ok(j.letti > 1500, `letti troppo pochi (${j.letti}): l'elenco si è ristretto senza motivo`);
});

// ── La regola ha un metro, e il metro gira ogni giorno ──────────────────────

prova("nessuno script del cervello chiede più elenchi a git fuori dalla porta", () => {
  const r = spawnSync("node", [join(REPO, "cervello/percorsi-git.mjs"), "--check", "--json"], {
    cwd: REPO,
    encoding: "utf8",
  });
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.fuori, [], `chiamate fuori dalla porta: ${JSON.stringify(j.fuori)}`);
  assert.ok(j.letti > 100, `letti solo ${j.letti} script: il guardiano sta guardando troppo poco`);
  assert.equal(r.status, 0);
});

prova("e il guardiano è appeso al giro, non lasciato in un file che nessuno esegue", () => {
  // La malattia che questi lotti curano: una regola giusta che nessuno chiama. Un guardiano
  // scollegato dal giro non è un cancello, è un file.
  const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(giro, /guardiano percorsi-git\.mjs --check/, "il giro non esegue il guardiano");
  assert.match(giro, /\$PORTA_GIT_VINCOLO/, "l'esito non arriva al motore come vincolo");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
