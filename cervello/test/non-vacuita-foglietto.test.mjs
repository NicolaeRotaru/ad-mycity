#!/usr/bin/env node
// 🧪 AR-708 — IL RIPRISTINO DEVE FUNZIONARE ANCHE QUANDO NESSUN GESTORE PUÒ PARTIRE.
//
// Il caso vero, 15/8. `non-vacuita.mjs` rompe i file veri del repo per vedere se le prove se ne
// accorgono. AR-523 aveva agganciato il ripristino a SIGINT/SIGTERM/SIGHUP, perché un `finally` non
// gira su un processo ammazzato. Ma il gestore di un segnale è una callback JS, e una callback gira
// solo quando il ciclo degli eventi è libero: qui il ciclo è bloccato da `spawnSync` per tutta la
// durata del test, che è ESATTAMENTE la finestra in cui il file resta rotto. La cura copriva ogni
// momento tranne quello che doveva coprire. Fermando il cancello a metà, `cervello/test-cervello.mjs`
// è rimasto su disco con la mutazione di AR-676 applicata, e l'ho rimesso a posto a mano.
//
// La cura è una TRACCIA SU DISCO, non una callback: si scrive prima di rompere, si cancella dopo aver
// rimesso a posto, e all'avvio chi la trova sa che la corsa precedente non è arrivata in fondo.
//
// LA PROVA CHE CONTA è l'ultima di questo file, e non è simulata: fa girare il banco vero su una
// mutazione lenta, lo ammazza con SIGKILL — che nessun gestore al mondo può intercettare — e pretende
// che il rilancio rimetta il file com'era. Tutto su una fixture in una cartella temporanea: questo
// test non tocca un solo file del repo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { lasciaTraccia, togliTraccia, riprendiDaTraccia } from "../non-vacuita.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const BANCO = join(QUI, "..", "non-vacuita.mjs");

/** Un finto disco: nessun file vero viene toccato dai casi puri. */
function discoFinto(iniziale = {}) {
  const dati = { ...iniziale };
  return {
    dati,
    io: {
      ceE: (f) => Object.hasOwn(dati, f),
      leggi: (f) => {
        if (!Object.hasOwn(dati, f)) throw new Error(`ENOENT ${f}`);
        return dati[f];
      },
      scrivi: (f, t) => {
        dati[f] = t;
      },
      cancella: (f) => {
        delete dati[f];
      },
    },
  };
}

test("la traccia si scrive PRIMA di rompere, e dice quale file e com'era", () => {
  const { dati, io } = discoFinto();
  const via = lasciaTraccia({ file: "cervello/git-pr.mjs", originale: "const preRebaseSha = gitOrNull()" }, io.scrivi, "/f.json");
  assert.equal(via, "/f.json");
  const nota = JSON.parse(dati["/f.json"]);
  assert.equal(nota.file, "cervello/git-pr.mjs");
  assert.equal(nota.originale, "const preRebaseSha = gitOrNull()", "senza l'originale la traccia non serve a niente: si sa cosa è rotto e non come rimetterlo");
});

test("niente in corso, niente traccia: non si lascia un foglietto vuoto in giro", () => {
  const { dati, io } = discoFinto();
  assert.equal(lasciaTraccia(null, io.scrivi, "/f.json"), null);
  assert.equal(Object.keys(dati).length, 0);
});

test("nessun foglietto: la corsa precedente è finita bene e non si dichiara niente", () => {
  const { io } = discoFinto({ "/x.mjs": "sano" });
  assert.equal(riprendiDaTraccia(io, "/f.json"), null);
});

test("LA REGOLA CHE CONTA: col foglietto, il file rotto torna com'era e lo si DICHIARA", () => {
  const { dati, io } = discoFinto({
    "/x.mjs": "const i = -1;",
    "/f.json": JSON.stringify({ file: "/x.mjs", originale: 'const i = process.argv.indexOf("--solo");' }),
  });
  const r = riprendiDaTraccia(io, "/f.json");
  assert.equal(r.esito, "rimesso");
  assert.equal(dati["/x.mjs"], 'const i = process.argv.indexOf("--solo");', "il file deve tornare all'ORIGINALE, non svuotarsi");
  assert.ok(/rimesso com'era/.test(r.motivo), `il ripristino va dichiarato, non fatto in silenzio: «${r.motivo}»`);
  assert.equal(Object.hasOwn(dati, "/f.json"), false, "la traccia consumata va cancellata, o al prossimo avvio si ripristina di nuovo sopra lavoro buono");
});

test("il file era già a posto: non lo si riscrive sopra (il `finally` ce l'aveva fatta)", () => {
  const { dati, io } = discoFinto({ "/x.mjs": "sano", "/f.json": JSON.stringify({ file: "/x.mjs", originale: "sano" }) });
  const r = riprendiDaTraccia(io, "/f.json");
  assert.equal(r.esito, "gia-a-posto");
  assert.equal(Object.hasOwn(dati, "/f.json"), false);
});

test("foglietto illeggibile: lo si DICE e lo si LASCIA lì — cancellarlo farebbe sparire l'unica traccia", () => {
  const { dati, io } = discoFinto({ "/f.json": "{ non json" });
  const r = riprendiDaTraccia(io, "/f.json");
  assert.equal(r.esito, "illeggibile");
  assert.equal(Object.hasOwn(dati, "/f.json"), true);
});

test("se nemmeno il ripristino riesce, non si finge riuscito", () => {
  const { io } = discoFinto({ "/x.mjs": "rotto", "/f.json": JSON.stringify({ file: "/x.mjs", originale: "sano" }) });
  const r = riprendiDaTraccia(
    { ...io, scrivi: () => { throw new Error("EACCES"); } },
    "/f.json",
  );
  assert.equal(r.esito, "fallito");
  assert.ok(/ANCORA rotto/.test(r.motivo));
});

test("togliere una traccia che non c'è non esplode", () => {
  assert.deepEqual(togliTraccia(() => { throw new Error("ENOENT"); }, "/f.json"), {
    tolta: false,
    motivo: "non sono riuscito a togliere il foglietto /f.json: ENOENT",
  }, "un fallimento che torna solo `false` viene buttato via da tutti i chiamanti: il motivo deve viaggiare col dato");
});

// ─────────────────────────────────────────────────────────────────────────────
// LA PROVA VERA — SIGKILL, che nessun gestore può intercettare.
// ─────────────────────────────────────────────────────────────────────────────

test("SUL CAMPO: ammazzato con SIGKILL a metà mutazione, il rilancio rimette il file com'era", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ar708-"));
  const bersaglio = join(dir, "finto-fix.mjs");
  const ORIGINALE = "export const soglia = 3; // il cuore del fix\n";
  writeFileSync(bersaglio, ORIGINALE);

  // Una prova che non finisce mai: serve a tenere `spawnSync` bloccato mentre ammazziamo il banco.
  const lenta = join(dir, "prova-lenta.mjs");
  writeFileSync(lenta, "setTimeout(() => {}, 600000);\n");

  const mutanti = join(dir, "mutanti.json");
  writeFileSync(
    mutanti,
    JSON.stringify({ mutanti: [{ lotto: "ar708", difetto: "AR-708", nome: "finta", file: bersaglio, cerca: "soglia = 3", sostituisci: "soglia = 0", test: lenta }] }),
  );
  const foglietto = join(dir, "foglietto.json");
  const env = { ...process.env, MUTANTI_FILE: mutanti, NON_VACUITA_FOGLIETTO: foglietto };

  try {
    const p = spawn(process.execPath, [BANCO, "--json"], { env, stdio: "ignore" });
    // Aspetto che la mutazione sia DAVVERO applicata: ammazzarlo prima proverebbe un'altra cosa.
    const scadenza = Date.now() + 30_000;
    while (Date.now() < scadenza && readFileSync(bersaglio, "utf8") === ORIGINALE) await new Promise((r) => setTimeout(r, 50));
    assert.notEqual(readFileSync(bersaglio, "utf8"), ORIGINALE, "il banco non ha mai applicato la mutazione: questo caso non sta provando niente");
    assert.equal(existsSync(foglietto), true, "il foglietto deve esistere MENTRE il file è rotto: è tutta la difesa");

    p.kill("SIGKILL");
    await new Promise((r) => p.on("exit", r));

    // Lo stato che AR-708 racconta: il file è rimasto rotto su disco, e nessun gestore è partito.
    assert.notEqual(readFileSync(bersaglio, "utf8"), ORIGINALE, "SIGKILL non lascia girare nessuna callback: se il file è già a posto qui, il caso non riproduce il difetto");

    // Il rilancio: senza mutazioni da misurare (esce 2), ma la ripresa deve avvenire lo stesso.
    writeFileSync(mutanti, JSON.stringify({ mutanti: [] }));
    const r = spawnSync(process.execPath, [BANCO, "--json"], { env, encoding: "utf8" });
    assert.equal(readFileSync(bersaglio, "utf8"), ORIGINALE, "il rilancio DEVE rimettere a posto il file lasciato rotto da una corsa ammazzata");
    assert.ok(/rimesso com'era|AR-708/.test(`${r.stdout}${r.stderr}`), `il ripristino va dichiarato: «${r.stderr}»`);
    assert.equal(existsSync(foglietto), false, "consumata la traccia, va cancellata");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
