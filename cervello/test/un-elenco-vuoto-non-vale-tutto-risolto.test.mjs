#!/usr/bin/env node
// 🚧 AR-914 — UN ELENCO CHE TACE NON VUOL DIRE «TUTTO RISOLTO»
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// In `cervello/giro.sh` i vincoli che erano rossi prima del motore vengono rimisurati uno per uno.
// Chi rimisura cosa lo dice un elenco, prodotto da `c4-cancelli.mjs riverifica-elenco`, e l'elenco
// si leggeva così: `done < <(node … 2>/dev/null)`.
//
// Se quel comando non parte — uscita ≠ 0, stdout vuoto — il `while` non gira nemmeno una volta. I
// tre array restano vuoti, `GATE_ROSSI` diventa 0, e `riverifica-esito` con tutto vuoto dice
// «tutti i vincoli sono stati risolti» ed esce 0. **Il giro si dichiara pulito e pubblica.**
// Riprodotto il 31/8: tredici cancelli rossi spariti in silenzio, e il `2>/dev/null` cancellava
// anche la traccia dell'errore.
//
// ⚠️ COSA PROVA QUESTO FILE, ed è la ragione per cui è scritto così. Non riscrive il blocco per
// provarne una copia — sarebbe una prova che difende sé stessa. **Ritaglia le righe VERE da
// `cervello/giro.sh`** e le esegue con un produttore finto. Se domani qualcuno cambia quelle righe,
// questa prova gira le righe cambiate.
//
// Uscita: 0 = le righe vere reggono · 1 = un vincolo rosso è sparito · 2 = non ho potuto ritagliarle.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const giro = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");

/** Le righe vere del blocco, dal produttore dell'elenco fino alla fine del recupero dei mancanti. */
function ritagliaIlBlocco() {
  const righe = giro.split("\n");
  // Il blocco comincia dove nasce il file per stderr, non dalla riga del produttore: i due flussi
  // si tengono separati apposta (vedi il commento in giro.sh), e ritagliare più in basso lascerebbe
  // fuori la riga che li separa — cioè proverebbe una versione che non esiste.
  const inizio = righe.findIndex((r) => r.includes('_riv_err="$(mktemp)"'));
  if (inizio < 0) return null;
  const fine = righe.findIndex((r, i) => i > inizio && r.includes('_riv_out="$(node'));
  if (fine < 0) return null;
  return righe.slice(inizio, fine).join("\n");
}

const BLOCCO = ritagliaIlBlocco();

/** Fa girare le righe vere con un `node` finto che fallisce, e torna il verdetto della shell. */
function corri(produttore) {
  const dir = mkdtempSync(join(tmpdir(), "ar895-"));
  writeFileSync(join(dir, "node"), `#!/bin/bash\n${produttore}\n`, { mode: 0o755 });
  const script = [
    "set -uo pipefail",
    `PATH="${dir}:$PATH"`,
    'ts() { echo "00:00"; }',
    'SCRIPT_DIR="/non/serve"',
    "VINCOLI_ATTIVI=(FATTI TEST GATE PROVE OKR)",
    "RIV_RIMASTI=(); RIV_RISOLTI=(); RIV_NONRIM=()",
    BLOCCO,
    'echo "ESITO rimasti=${#RIV_RIMASTI[@]} risolti=${#RIV_RISOLTI[@]} ciechi=${#RIV_NONRIM[@]}"',
  ].join("\n");
  const r = spawnSync("bash", ["-c", script], { encoding: "utf8" });
  const m = `${r.stdout}`.match(/ESITO rimasti=(\d+) risolti=(\d+) ciechi=(\d+)/);
  return m
    ? { rimasti: +m[1], risolti: +m[2], ciechi: +m[3], tutto: `${r.stdout}${r.stderr}` }
    : { tutto: `${r.stdout}${r.stderr}`, rotto: true };
}

test("AR-914 · le righe vere si lasciano ritagliare da giro.sh", () => {
  assert.ok(BLOCCO, "il blocco della riverifica non si trova più: questa prova gira a vuoto (⚪, non verde)");
});

test("AR-914 · il produttore che non parte NON fa sparire i vincoli rossi", () => {
  const e = corri('echo "esplodo" >&2; exit 2');
  assert.equal(e.rotto, undefined, `le righe non sono arrivate in fondo:\n${e.tutto}`);
  assert.equal(e.risolti, 0, "un elenco che non è mai arrivato ha «risolto» dei vincoli");
  assert.equal(e.ciechi, 5, `cinque vincoli erano rossi, ne restano ${e.ciechi} da rimisurare: gli altri sono spariti`);
});

test("AR-914 · e l'errore non si perde: era nascosto da 2>/dev/null", () => {
  const e = corri('echo "esplodo" >&2; exit 2');
  assert.match(e.tutto, /esplodo/, "l'uscita d'errore del produttore è di nuovo buttata via");
});

test("AR-914 · un elenco a metà: chi non è tornato indietro resta ⚪", () => {
  // Tre righe su cinque vincoli. Le due che mancano non sono risolte: sono non misurate.
  const e = corri('printf "FATTI\\tguardiano\\tfatti.mjs\\nTEST\\tguardiano\\ttest.mjs\\nGATE\\tnon-rimisurabile\\tda qui no\\n"; exit 0');
  assert.equal(e.rotto, undefined, e.tutto);
  assert.ok(e.ciechi >= 2, `PROVE e OKR non sono tornati indietro e vanno contati ⚪: ciechi=${e.ciechi}`);
});

test("AR-914 · l'elenco completo si comporta come prima: nessun ⚪ inventato", () => {
  const e = corri('case "$*" in *riverifica-elenco*) printf "FATTI\\tguardiano\\tvero.mjs\\nTEST\\tguardiano\\tvero.mjs\\nGATE\\tguardiano\\tvero.mjs\\nPROVE\\tguardiano\\tvero.mjs\\nOKR\\tguardiano\\tvero.mjs\\n"; exit 0;; *) exit 0;; esac');
  assert.equal(e.rotto, undefined, e.tutto);
  assert.equal(e.ciechi, 0, "cinque vincoli tornati indietro e cinque ⚪: la prudenza è diventata rumore");
  assert.equal(e.risolti, 5, "i guardiani rispondevano 0: quei vincoli sono risolti davvero");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ AR-902 — LA PRIMA CURA DI AR-914 AVEVA RIAPERTO AR-880 DA UN'ALTRA PARTE
//
// Catturava stdout e stderr in un colpo solo (`2>&1`). Bastava un `(node:123) Warning: …` — cioè
// un qualunque avviso di node — perché quella riga finisse nell'elenco come un vincolo con nome
// lunghissimo, classe vuota e comando VUOTO. Il ciclo avrebbe lanciato `timeout 120 node
// "$SCRIPT_DIR"/` senza script, uscita ≠ 0, e il fantasma sarebbe finito fra quelli «che dicono
// ANCORA no»: un'accusa col nome sbagliato, mandata a Nicola su Telegram.
//
// È lo stesso difetto che questo blocco era già stato curato per non fare (AR-880), rientrato dalla
// porta di servizio della sua cura. Trovato riguardando le righe aggiunte con la lente della
// sicurezza, prima di consegnare — non dopo.
// ─────────────────────────────────────────────────────────────────────────────

test("AR-902 · un avviso su stderr non diventa un vincolo fantasma", () => {
  const e = corri('echo "(node:123) Warning: qualcosa" >&2; printf "FATTI\\tguardiano\\tvero.mjs\\nTEST\\tguardiano\\tvero.mjs\\nGATE\\tguardiano\\tvero.mjs\\nPROVE\\tguardiano\\tvero.mjs\\nOKR\\tguardiano\\tvero.mjs\\n"; exit 0');
  assert.equal(e.rotto, undefined, e.tutto);
  assert.equal(e.risolti + e.rimasti + e.ciechi, 5,
    `cinque vincoli in ingresso, ${e.risolti + e.rimasti + e.ciechi} in uscita: l'avviso su stderr è diventato una riga dell'elenco`);
  assert.equal(e.ciechi, 0, "un avviso non deve nemmeno diventare un ⚪ inventato");
});

