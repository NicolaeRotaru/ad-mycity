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
import { lasciaTraccia, togliTraccia, riprendiDaTraccia, processoVivo, foglietti, PREFISSO_FOGLIETTO, FOGLIETTO } from "../non-vacuita.mjs";

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

// ── AR-837 — il segnalibro di chi sta ancora misurando non si tocca ──────────
//
// Il difetto vero, misurato il 26/8: il banco lancia sé stesso come sottoprocesso per provarsi su
// un banco finto. Il figlio partiva, trovava il foglietto del PADRE (nome fisso, uno per repo),
// lo scambiava per il resto di una corsa morta e rimetteva a posto `cancello-lotto.mjs` mentre il
// padre lo teneva rotto apposta. Il padre misurava un fix non più rotto, vedeva verde, e scriveva
// «⛔ la prova non dimostra il suo fix» a carico di una prova sana. Cronometrato: il file cambiava
// di mano in 124 millisecondi in mezzo alla corsa.

test("AR-837: il foglietto di una corsa ANCORA VIVA non si tocca e non si cancella", () => {
  const dir = mkdtempSync(join(tmpdir(), "foglietto-vivo-"));
  try {
    const bersaglio = join(dir, "sotto-misura.mjs");
    const via = join(dir, `${PREFISSO_FOGLIETTO}-424242.json`);
    writeFileSync(bersaglio, "ROTTO APPOSTA");
    writeFileSync(via, JSON.stringify({ file: bersaglio, originale: "com'era prima", quando: "ora", pid: 424242 }));

    const r = riprendiDaTraccia(
      {
        ceE: (f) => existsSync(f),
        leggi: (f) => readFileSync(f, "utf8"),
        scrivi: (f, t) => writeFileSync(f, t),
        cancella: (f) => rmSync(f, { force: true }),
        vivo: () => true, // quella corsa sta ancora misurando
      },
      via,
    );
    assert.equal(r.esito, "in-corso-altrove", "un processo vivo non è un incidente");
    assert.equal(readFileSync(bersaglio, "utf8"), "ROTTO APPOSTA", "rimetterglielo a posto gli falsa la misura: è il difetto di AR-837");
    assert.equal(existsSync(via), true, "e nemmeno gli si toglie il segnalibro di sotto");

    // Morta quella corsa, lo stesso foglietto torna a essere ciò che AR-708 cura.
    const dopo = riprendiDaTraccia(
      {
        ceE: (f) => existsSync(f),
        leggi: (f) => readFileSync(f, "utf8"),
        scrivi: (f, t) => writeFileSync(f, t),
        cancella: (f) => rmSync(f, { force: true }),
        vivo: () => false,
      },
      via,
    );
    assert.equal(dopo.esito, "rimesso", "la cura di AR-708 deve restare intera: un morto si ripulisce ancora");
    assert.equal(readFileSync(bersaglio, "utf8"), "com'era prima");
    assert.equal(existsSync(via), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-837: ogni corsa scrive il SUO foglietto, e all'avvio si guardano tutti", () => {
  assert.match(String(FOGLIETTO).split("/").pop(), new RegExp(`^${PREFISSO_FOGLIETTO}-\\d+\\.json$`), "il pid nel nome è ciò che impedisce a due corse di sovrascriversi");
  const trovati = foglietti(["altro.json", `${PREFISSO_FOGLIETTO}-7.json`, `${PREFISSO_FOGLIETTO}-9.json`, `${PREFISSO_FOGLIETTO}-9.txt`], "/casa");
  assert.deepEqual(trovati, ["/casa/" + PREFISSO_FOGLIETTO + "-7.json", "/casa/" + PREFISSO_FOGLIETTO + "-9.json"], "cercarne uno solo vorrebbe dire non trovare mai quello di chi è morto");
});

test("AR-837: «vivo?» si chiede senza ammazzare nessuno, e un permesso negato è comunque un vivo", () => {
  assert.equal(processoVivo(process.pid), true, "io sono vivo");
  assert.equal(processoVivo(0), false, "un pid che non è un pid non è vivo");
  assert.equal(processoVivo(-3), false);
  assert.equal(processoVivo("ciao"), false);
  let segnale = null;
  assert.equal(processoVivo(1234, (p, s) => { segnale = s; }), true);
  assert.equal(segnale, 0, "il segnale 0 non ammazza: chiede soltanto");
  assert.equal(processoVivo(1234, () => { const e = new Error("x"); e.code = "ESRCH"; throw e; }), false, "ESRCH = non c'è più");
  assert.equal(processoVivo(1234, () => { const e = new Error("x"); e.code = "EPERM"; throw e; }), true, "EPERM = c'è, ma non è mio: c'è, ed è quello che conta");
});
