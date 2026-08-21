#!/usr/bin/env node
// LA SPAZZATA CHE CANCELLA E NON LO DICE A GIT — e la caccia ai segreti che ci si accecava sopra.
//
// LA STORIA (misurata il 2026-08-21, referto `cervello.segreti` ⚪ da giorni).
// Ogni visita della salute scrive un referto in `consegne/salute/` e ne tiene gli ultimi trenta:
// il trentunesimo lo cancella dal DISCO con `rmSync`, e finiva lì. Ma quei referti sono versionati,
// e `git ls-files` elenca l'INDICE, non il disco: dopo la spazzata git continuava a nominare un file
// che non esisteva più. `scan-segreti` scorre proprio quell'elenco, apriva ogni percorso, e su quel
// percorso trovava una porta che non si apre — quindi si dichiarava CIECO (uscita 2) e diceva:
// «1 file elencato da git che NON sono riuscito ad aprire: su 2680 letti non posso dire pulito».
//
// Il risultato è la parte che conta: il controllo dei segreti NON era rosso e NON era verde, era ⚪
// — e ⚪ non è mai ✅. La macchina aveva smesso di guardare se una chiave finisce nel repo, e la
// causa non era un segreto né un permesso: era una cancellazione lasciata a metà, che ogni visita
// rinnovava cancellando il referto successivo. Un guasto che si ripara da solo ogni giorno alle
// spalle di chi lo legge.
//
// COSA PROVA QUESTO FILE, eseguendo (mai cercando parole in un sorgente):
//   ① la spazzata CHIUDE la cancellazione: dopo, git non nomina più il file che non c'è;
//   ② e non tocca l'indice per un file che sta ancora sul disco (o spazzare = perdere lavoro);
//   ③ la caccia ai segreti su un repo con una cancellazione pendente esce 0, non 2;
//   ④ ma un file che C'È e non si apre continua a rendere cieco il verdetto: la cura toglie il
//      falso allarme, non l'allarme.
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · in `cervello/salute.mjs`, togliendo la chiamata a `dimenticaDaGit` dentro `potaReferti`
//     → il caso ① diventa ROSSO (git continua a nominare il file sparito).
//   · in `cervello/scan-segreti.mjs`, rimettendo `catch { nonRaggiunti.push(rel); }` al posto della
//     distinzione su ENOENT → il caso ③ torna rc=2 e diventa ROSSO.
//   · sempre in `scan-segreti.mjs`, facendo tornare `verdetto` sempre codice 0
//     → il caso ④ diventa ROSSO.

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SCANNER = join(REPO, "cervello/scan-segreti.mjs");

const { dimenticaDaGit } = await import(join(REPO, "cervello/salute.mjs"));
const { verdetto } = await import(join(REPO, "cervello/scan-segreti.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/** Un repo finto con dei file già committati: è lo stato da cui parte la spazzata. */
function repoConFile(files) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-spazzata-"));
  spawnSync("git", ["init", "-q", "."], { cwd: dir });
  spawnSync("git", ["config", "user.email", "prova@mycity.local"], { cwd: dir });
  spawnSync("git", ["config", "user.name", "prova"], { cwd: dir });
  for (const [rel, contenuto] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), contenuto);
  }
  spawnSync("git", ["add", "-A"], { cwd: dir });
  spawnSync("git", ["commit", "-qm", "base"], { cwd: dir });
  return dir;
}

const elencatiDaGit = (dir) =>
  spawnSync("git", ["ls-files"], { cwd: dir, encoding: "utf8" }).stdout.split("\n").filter(Boolean);

// ── ① e ② La spazzata chiude la cancellazione ───────────────────────────────

prova("dopo la spazzata git non nomina più il referto che non c'è", () => {
  const dir = repoConFile({ "consegne/salute/vecchio.md": "referto vecchio\n" });
  try {
    rmSync(join(dir, "consegne/salute/vecchio.md"), { force: true }); // quello che fa `potaReferti`
    dimenticaDaGit("consegne/salute/vecchio.md", dir); // …e quello che si dimenticava di fare
    assert.deepEqual(
      elencatiDaGit(dir),
      [],
      "git elenca ancora un file che non esiste sul disco: la cancellazione è a metà, ed è da lì che nasce il cieco",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("ma un file che sta ancora sul disco non viene tolto dall'indice", () => {
  const dir = repoConFile({ "consegne/salute/vivo.md": "referto ancora buono\n" });
  try {
    dimenticaDaGit("consegne/salute/vivo.md", dir); // chiamata per sbaglio: non deve fare danni
    assert.deepEqual(
      elencatiDaGit(dir),
      ["consegne/salute/vivo.md"],
      "un file presente è stato tolto dall'indice: spazzare non deve poter buttare via lavoro vero",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ③ La caccia ai segreti non si acceca per un file cancellato ─────────────

prova("una cancellazione pendente non rende cieca la caccia ai segreti", () => {
  const dir = repoConFile({ "consegne/salute/vecchio.md": "prosa pulita\n", "vivo.txt": "prosa pulita\n" });
  try {
    rmSync(join(dir, "consegne/salute/vecchio.md"), { force: true });
    const r = spawnSync("node", [SCANNER, "--json"], { encoding: "utf8", env: { ...process.env, SCAN_SEGRETI_REPO: dir } });
    assert.equal(
      r.status,
      0,
      `atteso verde (rc=0), avuto ${r.status}: un file che non esiste più non può contenere un segreto sul disco.\n${r.stdout}${r.stderr}`,
    );
    const json = JSON.parse(r.stdout);
    assert.deepEqual(json.non_raggiunti, [], "un file cancellato non è una porta rotta");
    assert.deepEqual(json.cancellati, ["consegne/salute/vecchio.md"], "…ma va comunque dichiarato: indice e disco divergono");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── ④ L'allarme vero resta in piedi ─────────────────────────────────────────

prova("un file che C'È e non si apre rende ancora cieco il verdetto", () => {
  const v = verdetto({ letti: 10, nonRaggiunti: ["c-e-ma-non-si-apre.md"], trovati: [] });
  assert.equal(v.codice, 2, "la cura doveva togliere il falso allarme, non l'allarme");
  assert.equal(v.esito, "cieco");
});

prova("e un segreto trovato batte tutto il resto", () => {
  const v = verdetto({ letti: 10, cancellati: ["sparito.md"], trovati: [{ file: "x", regola: "r", campione: "…" }] });
  assert.equal(v.codice, 1, "un segreto trovato deve restare un blocco anche con una cancellazione in giro");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
