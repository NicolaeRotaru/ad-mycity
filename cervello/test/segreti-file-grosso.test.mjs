#!/usr/bin/env node
// AR-441 — «cieco» non è «letto»: il file grosso adesso si legge a blocchi.
//
// LA STORIA. AR-427 aveva tolto la bugia: un file oltre i 2 MB non veniva più contato come pulito,
// finiva fra i non raggiunti e il verdetto diventava «cieco». Onesto, ma non curato: il file più
// grosso del repo è `cantiere-difetti.json`, misurato il 13/8 a 1,70 MB — l'85% del tetto — e cresce
// a ogni giro. Il giorno in cui lo supera, lo scanner smette di guardare proprio il file dove c'è
// dentro più roba, e il guardiano diventa rosso fisso su una cosa che nessuno può sistemare. Un
// cancello che suona sempre viene aggirato al secondo giro: da lì in poi non ferma nemmeno i rossi veri.
//
// COSA PROVA QUESTO FILE, eseguendo (mai cercando parole in un sorgente):
//   ① un segreto oltre il tetto, dentro un file da ~2,5 MB, viene TROVATO e il commit bloccato;
//   ② un segreto spezzato in due dal taglio dei blocchi viene trovato lo stesso (è la coda);
//   ③ lo stesso segreto non viene contato due volte perché la coda si rilegge;
//   ④ un file grosso e pulito resta verde, e NON finisce fra i «non raggiunti»: leggere a blocchi
//      non deve diventare un nuovo modo di dire cieco.
//
// NON-VACUITÀ (verificata rompendo il fix apposta):
//   · in `cervello/scan-segreti.mjs`, riportando `azione: "leggi-a-blocchi"` a `azione: "non-letto"`
//     → il caso ① torna rc=2 «cieco» invece di rc=1 e la prova diventa ROSSA.
//   · in `cervello/lettura-a-blocchi.mjs`, azzerando la coda (`SOVRAPPOSIZIONE = 0`)
//     → il caso ② non trova più il segreto a cavallo del taglio e la prova diventa ROSSA.

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { cercaNeiBlocchi, pezziDiFile } from "../lettura-a-blocchi.mjs";
import { classificaPerDimensione } from "../scan-segreti.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const SCANNER = join(REPO, "cervello/scan-segreti.mjs");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Un campione con la FORMA di una chiave, costruito a runtime e mai scritto per intero qui dentro.
 * Lezione di AR-270: un campione letterale con la forma di una chiave vera fa scattare lo scanner su
 * QUESTO file e blocca la pubblicazione della memoria — è già successo il 25/7.
 */
const campioneFinto = () => ["sk", "ant", "api03"].join("-") + "-" + "A".repeat(95);

/** Un repo finto con i file dati, e lo scanner vero eseguito sopra. */
function scansiona(files) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-grossi-"));
  try {
    spawnSync("git", ["init", "-q", "."], { cwd: dir });
    spawnSync("git", ["config", "user.email", "prova@mycity.local"], { cwd: dir });
    spawnSync("git", ["config", "user.name", "prova"], { cwd: dir });
    for (const [rel, contenuto] of Object.entries(files)) writeFileSync(join(dir, rel), contenuto);
    const r = spawnSync("node", [SCANNER, "--json"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, SCAN_SEGRETI_REPO: dir },
    });
    let json = null;
    try {
      json = JSON.parse(r.stdout);
    } catch {
      /* se non parla JSON lo guarda il caso, con l'uscita grezza sotto gli occhi */
    }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`, json };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── ① Il caso che oggi si dichiarava cieco ──────────────────────────────────

prova("un segreto oltre i 2 MB dentro un file grosso viene TROVATO, non dichiarato cieco", () => {
  // 2,5 MB di riempitivo e la chiave in fondo: prima della cura, questo file non veniva aperto.
  const grosso = `${"x".repeat(2_500_000)}\nchiave di prova: ${campioneFinto()}\n`;
  const r = scansiona({ "cantiere-finto.json": grosso });
  assert.equal(r.rc, 1, `atteso BLOCCO (rc=1), avuto ${r.rc}. Con rc=2 il fix è tornato a «cieco»:\n${r.out.slice(0, 600)}`);
  assert.equal(r.json.esito, "trovato");
  assert.equal(r.json.trovati[0].file, "cantiere-finto.json");
});

prova("e il file grosso è dichiarato come letto a blocchi, non nascosto", () => {
  const grosso = `${"x".repeat(2_500_000)}\nprosa pulita\n`;
  const r = scansiona({ "cantiere-finto.json": grosso });
  assert.equal(r.rc, 0, `un file grosso e pulito deve restare verde:\n${r.out.slice(0, 600)}`);
  assert.deepEqual(r.json.non_raggiunti, [], "leggere a blocchi non deve diventare un nuovo modo di dire cieco");
  assert.equal(r.json.letti_a_blocchi.length, 1, "il file grosso va dichiarato: è trasparenza sul COME l'ho guardato");
  assert.equal(r.json.letti, 1, "e conta fra i file letti, perché è stato letto davvero");
});

// ── ② e ③ La decisione pura, eseguita su pezzi finti ────────────────────────

prova("un segreto spezzato in due dal taglio dei blocchi viene trovato lo stesso", () => {
  const chiave = campioneFinto();
  const meta = Math.floor(chiave.length / 2);
  // Il taglio cade IN MEZZO alla chiave: è esattamente il caso che una lettura a blocchi ingenua perde.
  const pezzi = [`prima del taglio ${chiave.slice(0, meta)}`, `${chiave.slice(meta)} dopo il taglio`];
  const t = cercaNeiBlocchi(pezzi, [{ nome: "finta", re: /sk-ant-(?:api|oat)[0-9]{0,2}-[A-Za-z0-9_-]{40,}/g }], {
    sovrapposizione: 256,
  });
  assert.equal(t.length, 1, "il segreto a cavallo del taglio deve essere trovato una volta");
  assert.equal(t[0].valore, chiave, "e deve arrivare INTERO, non mozzato dal bordo del blocco");
});

prova("la coda si rilegge, ma lo stesso segreto non viene contato due volte", () => {
  const chiave = campioneFinto();
  const pezzi = [`testa ${chiave} coda`, "secondo blocco senza niente dentro"];
  const t = cercaNeiBlocchi(pezzi, [{ nome: "finta", re: /sk-ant-(?:api|oat)[0-9]{0,2}-[A-Za-z0-9_-]{40,}/g }], {
    sovrapposizione: 4096, // più lunga dei pezzi: il primo blocco viene riletto tutto nel secondo giro
  });
  assert.equal(t.length, 1, `doppione: ${t.length} match per un solo segreto`);
});

prova("due segreti diversi nello stesso file restano due", () => {
  const a = campioneFinto();
  const b = ["sk", "ant", "oat01"].join("-") + "-" + "B".repeat(95);
  const t = cercaNeiBlocchi([`uno ${a} due ${b} fine`], [{ nome: "finta", re: /sk-ant-(?:api|oat)[0-9]{0,2}-[A-Za-z0-9_-]{40,}/g }]);
  assert.equal(t.length, 2);
});

prova("un accento a cavallo del taglio non si spezza in due caratteri rotti", () => {
  // Il vault è italiano: 26 file hanno un accento nel percorso e migliaia nel testo (è la famiglia di
  // AR-339). Leggere a byte invece che a caratteri spaccherebbe una «à» esattamente sul bordo del
  // blocco, e il testo dopo quel punto diventerebbe illeggibile senza che nessuno lo dica.
  const dir = mkdtempSync(join(tmpdir(), "mycity-accento-"));
  try {
    const testo = `${"a".repeat(1023)}à città perché${"b".repeat(50)}`;
    writeFileSync(join(dir, "accentato.md"), testo);
    const pezzi = [...pezziDiFile(join(dir, "accentato.md"), 1024)];
    assert.ok(pezzi.length > 1, "il file va letto in più blocchi, altrimenti il caso non è provato");
    assert.equal(pezzi.join(""), testo, "rimesso insieme deve tornare identico all'originale");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

prova("nessun match su prosa pulita: la lettura a blocchi non è un allarme generico", () => {
  const t = cercaNeiBlocchi(["solo prosa, ", "nessuna chiave da nessuna parte"], [
    { nome: "finta", re: /sk-ant-(?:api|oat)[0-9]{0,2}-[A-Za-z0-9_-]{40,}/g },
  ]);
  assert.deepEqual(t, []);
});

// ── ④ La classificazione, che è il punto in cui il difetto viveva ───────────

prova("un file oltre il tetto si LEGGE a blocchi (prima si dichiarava non letto)", () => {
  const c = classificaPerDimensione({ isFile: true, size: 3_000_000 });
  assert.equal(c.azione, "leggi-a-blocchi", "sopra il tetto cambia il MODO di leggere, non il fatto di leggere");
});

prova("sotto il tetto si legge tutto in una volta, e una cartella resta ignorata", () => {
  assert.equal(classificaPerDimensione({ isFile: true, size: 1000 }).azione, "leggi");
  assert.equal(classificaPerDimensione({ isFile: false, size: 0 }).azione, "ignora");
});

// ── Il repo VERO: il file che sta arrivando al muro ─────────────────────────

prova("sul repo vero nessun file resta fuori dallo sguardo e il verdetto è verde", () => {
  const r = spawnSync("node", [SCANNER, "--json"], { cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.non_raggiunti, [], `file elencati e mai aperti: ${j.non_raggiunti.join(", ")}`);
  assert.equal(r.status, 0, `atteso verde:\n${r.stdout.slice(0, 400)}${r.stderr}`);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
