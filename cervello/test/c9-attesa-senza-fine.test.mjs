// AR-439 — «Il battito che i guardiani mandano non ha un tempo massimo: se la memoria risponde
// lenta, il giro si ferma lì.»
//
// La radice: la protezione (`AbortSignal.timeout`) era stata messa DOVE QUALCUNO SI ERA SCOTTATO
// (`freschezza-segnali.mjs`) e mai portata nelle copie accanto. «La regola vive in N posti e N-1
// restano indietro», applicata al timeout di rete. E la cosa che l'ha tenuta nascosta: l'errore che
// produce non è un rosso, è un'ATTESA — e un processo fermo somiglia a un processo che lavora.
//
// Perciò non basta il timeout su quella riga: serve il CRICCHETTO che impedisce alla forma di
// riprodursi. Il conto delle chiamate senza tetto può solo scendere.
//
// NON-VACUITÀ (eseguita): togliendo `signal: AbortSignal.timeout(...)` dal fetch di `stampSegnale`
// in git-github.mjs il conto sale sopra il tetto e i casi ③ e ④ diventano rossi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { censimento, fetchSenzaTetto, verdettoTetto } from "../attesa-senza-fine.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── ① Lo scanner sa distinguere chi un tetto ce l'ha da chi no ──────────────────────────────────

test("AR-439 — un fetch senza signal viene pescato", () => {
  const f = fetchSenzaTetto(`const r = await fetch(url, { method: "POST", headers: h });`);
  assert.equal(f.length, 1);
  assert.equal(f[0].riga, 1);
});

test("AR-439 — un fetch con AbortSignal.timeout non è un buco", () => {
  const f = fetchSenzaTetto(`await fetch(url, {\n  signal: AbortSignal.timeout(8000),\n  headers: h,\n});`);
  assert.deepEqual(f, []);
});

test("AR-439 — un `signal` passato dal chiamante vale: il tetto lo mette lui, ed è dichiarato", () => {
  assert.deepEqual(fetchSenzaTetto(`await fetch(u, { ...init, signal: init.signal ?? qualcosa });`), []);
});

test("AR-439 — la parola fetch dentro un commento non è una chiamata", () => {
  assert.deepEqual(fetchSenzaTetto(`// qui prima si faceva fetch(url) senza timeout`), []);
});

// ── ② Il cricchetto ─────────────────────────────────────────────────────────────────────────────

test("AR-439 — il tetto sforato è rosso; sceso è verde e si può abbassare", () => {
  assert.equal(verdettoTetto({ totale: 36, tetto: 35 }).ok, false);
  assert.equal(verdettoTetto({ totale: 35, tetto: 35 }).ok, true);
  assert.equal(verdettoTetto({ totale: 30, tetto: 35 }).ok, true);
  assert.equal(verdettoTetto({ totale: 0, tetto: undefined }).ok, false, "un debito senza massimo è la curva silenziosa che stiamo curando");
});

// ── ③ e ④ IL PUNTO, sul codice vero ─────────────────────────────────────────────────────────────

test("AR-439 — IL PUNTO: il battito verso la memoria adesso ha un tempo massimo", () => {
  const testo = readFileSync(join(CERVELLO, "git-github.mjs"), "utf8");
  // Si guarda la funzione, non il file: `stampSegnale` è il punto malato nominato dalla scheda.
  const i = testo.indexOf("export async function stampSegnale");
  assert.notEqual(i, -1, "stampSegnale non c'è più: la scheda parlava di lei");
  const corpo = testo.slice(i, testo.indexOf("\n}", i));
  assert.deepEqual(
    fetchSenzaTetto(corpo),
    [],
    "il battito può restare appeso: quando succede il giro non produce niente, e sembra che stia lavorando"
  );
});

test("AR-439 — sul repo VERO il debito delle attese senza fine non è cresciuto", () => {
  const r = spawnSync(process.execPath, [join(CERVELLO, "attesa-senza-fine.mjs"), "--json"], { encoding: "utf8", timeout: 120_000 });
  assert.notEqual(r.status, 2, `guardiano CIECO: non ha potuto misurare — ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  assert.ok(j.file_letti > 50, `perimetro sospetto: ${j.file_letti} file letti — un recinto troppo stretto nasce verde e resta verde`);
  assert.equal(r.status, 0, `${j.verdetto}`);
});

test("AR-439 — il censimento gira e torna un numero, non un'opinione", () => {
  const c = censimento(CERVELLO);
  assert.equal(c.cieco, false);
  assert.ok(Number.isFinite(c.totale));
  assert.ok(c.file_letti > 50, "se il perimetro si stringe, il guardiano nasce verde per costruzione");
});
