#!/usr/bin/env node
// 🧪 AR-685 — il guardiano delle prove si tagliava il referto a 64 KB quando lo si leggeva da una pipe.
//
// LA MECCANICA. Quando lo stdout di node è una PIPE (`| tail`, `$(...)`, una shell che concatena
// comandi) le scritture sono ASINCRONE: `console.log` mette in coda, il sistema ne accetta 64 KB e
// il resto aspetta che qualcuno legga. `process.exit()` non aspetta — butta via la coda. Il referto
// arrivava tagliato a 65.536 byte esatti, in mezzo a una stringa, e il JSON non si parsava: chi
// legge il guardiano riceveva un errore invece di un verdetto. Un guardiano che non consegna il
// referto è un guardiano spento, e non c'era modo di accorgersene guardando il file.
//
// LA CURA, già in casa dal 13/8: `process.exitCode = 1` invece di `process.exit(1)`. Node svuota la
// coda e POI esce con lo stesso numero: il codice d'uscita è identico, il referto arriva intero.
//
// PERCHÉ QUESTA PROVA È FATTA COSÌ. Il difetto vive NEL CANALE, non nel codice: con `spawnSync` a
// buffer pieno non si vede mai, perché chi legge svuota la pipe subito. Quindi qui si passa da una
// **shell vera** con una **pipe vera**, e si confronta il referto letto dalla pipe con quello scritto
// su file (dove le scritture sono sincrone e il taglio non c'è). Se i due numeri divergono, il fix è
// disfatto — e questa prova diventa rossa mentre una a spawnSync resterebbe verde.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const GUARDIANO = "cervello/cantiere-prove.mjs";
const BUFFER_PIPE = 65_536; // quanto il sistema accetta prima di far aspettare chi scrive

// Niente chiavi: il guardiano non deve poter scrivere segnali fuori da qui.
const AMBIENTE = { ...process.env };
delete AMBIENTE.SUPABASE_URL;
delete AMBIENTE.SUPABASE_SERVICE_KEY;

/** Una shell VERA, con una pipe VERA: è l'unico canale in cui questo difetto esiste. */
function daShell(comando) {
  const r = spawnSync("bash", ["-o", "pipefail", "-c", comando], {
    cwd: REPO,
    env: AMBIENTE,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  assert.notEqual(r.status, null, `la shell non è partita: ${r.error?.message}`);
  return r;
}

test("⬇️ AR-685 — il referto letto da una PIPE arriva intero quanto quello scritto su file", () => {
  const dir = mkdtempSync(join(tmpdir(), "referto-pipe-"));
  try {
    const suFile = join(dir, "diretto.json");
    const daPipe = join(dir, "da-pipe.json");

    // ① su file: le scritture sono sincrone, questo è il referto completo per definizione.
    daShell(`node ${GUARDIANO} --json --gate > ${suFile}`);
    // ② da pipe: node scrive in una pipe, `cat` la travasa. È il canale in cui il difetto vive.
    daShell(`node ${GUARDIANO} --json --gate | cat > ${daPipe}`);

    const nFile = statSync(suFile).size;
    const nPipe = statSync(daPipe).size;

    assert.ok(
      nFile > BUFFER_PIPE,
      `il referto pesa ${nFile} byte, sotto il buffer della pipe (${BUFFER_PIPE}): questa prova non potrebbe vedere il taglio, quindi non prova niente`,
    );
    assert.equal(
      nPipe,
      nFile,
      `dalla pipe sono arrivati ${nPipe} byte invece di ${nFile}: il referto si tronca di nuovo${nPipe === BUFFER_PIPE ? " — esattamente al buffer della pipe" : ""}`,
    );
    assert.notEqual(nPipe, BUFFER_PIPE, "il referto è arrivato lungo esattamente quanto il buffer della pipe: è il taglio di AR-685");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("⬇️ AR-685 — e quello che arriva dalla pipe è JSON VERO, non una stringa tagliata a metà", () => {
  const r = daShell(`node ${GUARDIANO} --json --gate | cat`);
  let dati;
  try {
    dati = JSON.parse(r.stdout);
  } catch (e) {
    assert.fail(
      `il referto letto da una pipe non si parsa (${e.message}) — ${r.stdout.length} byte ricevuti. ` +
        `Chi legge il guardiano riceve un errore al posto di un verdetto.`,
    );
  }
  assert.ok(dati && typeof dati === "object", "il referto non è un oggetto");
  assert.ok(Array.isArray(dati.voci) || Array.isArray(dati.difetti) || Object.keys(dati).length > 3, "il referto è arrivato monco");
});

test("⬇️ AR-685 — il verdetto NON si perde per strada: dalla pipe esce lo stesso codice del file", () => {
  const dir = mkdtempSync(join(tmpdir(), "referto-uscita-"));
  try {
    const suFile = daShell(`node ${GUARDIANO} --json --gate > ${join(dir, "x.json")}`);
    const daPipe = daShell(`node ${GUARDIANO} --json --gate | cat`);
    assert.equal(suFile.status, 1, "il cancello --gate non è rosso: senza un rosso vero questa prova non misura il codice d'uscita");
    assert.equal(daPipe.status, suFile.status, "il codice d'uscita cambia a seconda che si legga da file o da pipe");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AR-685 — il referto grande resta grande: se un giorno si rimpicciolisse, questa prova lo direbbe", () => {
  const dir = mkdtempSync(join(tmpdir(), "referto-peso-"));
  try {
    const f = join(dir, "x.json");
    daShell(`node ${GUARDIANO} --json > ${f}`);
    const testo = readFileSync(f, "utf8");
    assert.ok(
      testo.length > BUFFER_PIPE,
      `il referto è sceso a ${testo.length} byte: sotto i ${BUFFER_PIPE} del buffer questa prova diventa vacua e va ripensata, non cancellata`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
