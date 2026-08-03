#!/usr/bin/env node
// 🧪 UNA STORIA TAGLIATA NON PRODUCE UN NUMERO (AR-492).
//
// Il 3/8 il contatore delle consegne mute ha detto 13 in una sessione cloud e 238 in CI — sulla
// STESSA fusione, con lo stesso codice, nella stessa ora. Non era un difetto del conteggio: il clone
// della sessione cloud è superficiale (`git clone --depth`), git gli mostra solo gli ultimi commit, e
// «gli ultimi trenta giorni» diventavano 51 commit invece di 630. Il numero non era sbagliato di
// poco: era il numero di un'altra storia.
//
// Il costo vero non è l'indagine (tre giri a cercare una differenza fra due ambienti che non
// esisteva). È che con `--aggiorna-tetto` quel 13 è diventato il TETTO del cricchetto al posto di
// 253: una cecità travestita da miglioramento, che poi blocca ogni consegna futura contro una soglia
// che nessuno può raggiungere. Un cancello impossibile viene aggirato al secondo giro — sta scritto
// nella casa, ed è esattamente quello che stava per succedere.
//
// Regola che queste prove difendono: se non so se la storia è intera, non conto. ⚪, non un numero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { cloneTroncato } from "../conta-verdetti-muti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

test("la risposta di git si legge per quello che è: sì, no, e «non lo so»", () => {
  assert.equal(cloneTroncato("true\n"), true);
  assert.equal(cloneTroncato("false\n"), false);
  assert.equal(cloneTroncato(""), null, "una risposta vuota non è un «no»");
  assert.equal(cloneTroncato(undefined), null, "git non ha risposto: non lo so");
  assert.equal(cloneTroncato("fatal: not a git repository"), null, "un errore non è un «no»");
});

test("solo un «false» esplicito autorizza a contare", () => {
  // La forma del controllo nel codice è `troncato !== false`: qualunque cosa che non sia un no
  // secco ferma il conteggio. Questa prova la fissa, perché la scrittura naturale (`if (troncato)`)
  // farebbe passare il caso «non lo so» — cioè il caso in cui sono più cieco, non meno.
  for (const risposta of ["true", "", undefined, "boh", "fatal: …"]) {
    assert.notEqual(cloneTroncato(risposta), false, `«${risposta}» non deve valere come storia intera`);
  }
});

test("dal vivo: in un clone superficiale il contatore esce 2 e non stampa nessun numero", (t) => {
  const dove = mkdtempSync(join(tmpdir(), "storia-tagliata-"));
  const clone = join(dove, "corto");
  try {
    const fatto = spawnSync("git", ["clone", "--quiet", "--depth", "1", `file://${REPO}`, clone], {
      encoding: "utf8",
      timeout: 180_000,
    });
    // Il clone porta l'ULTIMO COMMIT, non quello che ho in mano adesso: senza questa copia la prova
    // misurerebbe il codice di ieri e resterebbe verde anche col fix cancellato. Il soggetto è il
    // file vivo; il clone corto serve solo a fabbricare l'ambiente cieco.
    cpSync(join(REPO, "cervello"), join(clone, "cervello"), { recursive: true });
    if (fatto.status !== 0 || !existsSync(join(clone, "cervello/conta-verdetti-muti.mjs"))) {
      // Non «salto e sto zitto»: dico che questa parte non l'ho misurata. Un test che si spegne in
      // silenzio è la stessa malattia che sta provando a curare.
      t.diagnostic(`⚪ non ho potuto costruire il clone corto (${(fatto.stderr || "").slice(0, 120)}) — questa parte NON è misurata`);
      return;
    }
    const r = spawnSync(process.execPath, [join(clone, "cervello/conta-verdetti-muti.mjs")], {
      encoding: "utf8",
      timeout: 120_000,
    });
    assert.equal(r.status, 2, "storia tagliata = cieco (2), né verde (0) né rosso (1)");
    assert.match(`${r.stderr}`, /⚪ CIECO: clone superficiale/);
    assert.match(`${r.stderr}`, /git fetch --unshallow/, "il cieco deve dire come si guarisce");
    assert.doesNotMatch(`${r.stdout}`, /senza esito:/, "un clone corto non deve produrre un conteggio da confrontare col tetto");
  } finally {
    rmSync(dove, { recursive: true, force: true });
  }
});

test("dal vivo: il tetto non si può abbassare da un clone superficiale", (t) => {
  const dove = mkdtempSync(join(tmpdir(), "tetto-corto-"));
  const clone = join(dove, "corto");
  try {
    const fatto = spawnSync("git", ["clone", "--quiet", "--depth", "1", `file://${REPO}`, clone], {
      encoding: "utf8",
      timeout: 180_000,
    });
    if (fatto.status !== 0) {
      t.diagnostic("⚪ non ho potuto costruire il clone corto — questa parte NON è misurata");
      return;
    }
    // Stessa ragione della prova sopra: il soggetto è il codice vivo, non quello dell'ultimo commit.
    cpSync(join(REPO, "cervello"), join(clone, "cervello"), { recursive: true });
    const referto = join(clone, "MyCity-Vault/90-Memoria-AI/auto-coscienza/verdetti-muti.json");
    const prima = spawnSync("cat", [referto], { encoding: "utf8" }).stdout;
    const r = spawnSync(process.execPath, [join(clone, "cervello/conta-verdetti-muti.mjs"), "--aggiorna-tetto"], {
      encoding: "utf8",
      timeout: 120_000,
    });
    assert.equal(r.status, 2, "«abbassa il tetto» da mezza storia deve essere un rifiuto, non un'obbedienza");
    const dopo = spawnSync("cat", [referto], { encoding: "utf8" }).stdout;
    assert.equal(dopo, prima, "il referto non deve essere toccato: un tetto sceso per cecità è peggio di un tetto alto");
  } finally {
    rmSync(dove, { recursive: true, force: true });
  }
});
