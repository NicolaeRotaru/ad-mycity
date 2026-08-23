#!/usr/bin/env node
// 🧪 AR-807 clausola (a) — l'archivio che stava dentro il file che doveva alleggerire.
//
// Il difetto: la pulizia della coda spostava le carte chiuse in una SEZIONE della coda stessa. Cioè
// non toglieva peso a niente — le metteva in fondo allo stesso file. Il 23/8 il conto: coda a
// 269.658 caratteri, di cui 88.741 di sole carte chiuse, contro un controllo che ne legge 200.000 e
// poi taglia. Il 22/8 la stessa cosa era già stata curata a mano, e in un mese si era disfatta.
//
// Un rimedio che sposta la roba dentro lo stesso contenitore non è un rimedio: è un ordine apparente.
//
// LA PARTE CHE FA PIÙ PAURA, e per cui esiste il freno. Questa pulizia sposta testo che Nicola usa
// per decidere. Improvvisandola il 22/8 ho portato via carte che altri guardiani cercavano ancora, e
// due prove sono diventate rosse. Qui il freno si vede scattare per davvero, su una coda finta.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CASE, testoDelleDueCase } from "../coda-e-archivio.mjs";
import { TETTO_TESTO } from "../cancello-stop.mjs";

const RADICE = join(import.meta.dirname, "..", "..");
const PULIZIA = join(RADICE, "cervello/housekeeping-azioni.mjs");

function codaFinta(carte) {
  return ["---", "tipo: coda-azioni", "---", "", "# ⏳ AZIONI IN ATTESA", "", "> 🧹 **Housekeeping 2026-01-01 00:00** — Automatico: **0 aperte · 0 chiuse in archivio**.", "", carte.join("\n\n---\n\n"), ""].join("\n");
}

function pulisci(coda, archivio = null, argomenti = []) {
  const dir = mkdtempSync(join(tmpdir(), "coda-"));
  const fCoda = join(dir, "coda.md");
  const fArch = join(dir, "chiuse.md");
  writeFileSync(fCoda, coda);
  if (archivio !== null) writeFileSync(fArch, archivio);
  let uscita = "";
  let codice = 0;
  try {
    uscita = execFileSync("node", [PULIZIA, ...argomenti], { env: { ...process.env, CODA_FILE: fCoda, CODA_ARCHIVIO: fArch }, encoding: "utf8" });
  } catch (e) {
    codice = e.status ?? 1;
    uscita = `${e.stdout || ""}${e.stderr || ""}`;
  }
  const letto = {
    codice,
    uscita,
    coda: readFileSync(fCoda, "utf8"),
    archivio: existsSync(fArch) ? readFileSync(fArch, "utf8") : null,
  };
  rmSync(dir, { recursive: true, force: true });
  return letto;
}

// ─────────── ① le carte chiuse ESCONO dal file, non scendono in fondo ───────────

test("una carta chiusa esce dalla coda e finisce nell'altro file", () => {
  const r = pulisci(codaFinta(["### 🟡 #1 — resta aperta\n\ntesto", "### ✅ #2 — già fatta\n\ntesto della chiusa"]));
  assert.equal(r.codice, 0, r.uscita);
  assert.doesNotMatch(r.coda, /### ✅/, "la carta chiusa è ancora nella coda: l'archivio è di nuovo dentro il file che doveva alleggerire");
  assert.match(r.archivio, /### ✅ #2/, "e non è finita nell'archivio: sarebbe una cancellazione");
  assert.match(r.coda, /### 🟡 #1/, "la carta aperta resta dov'è");
});

test("la coda si accorcia davvero: è tutto il punto", () => {
  const grossa = "x".repeat(5_000);
  const prima = codaFinta(["### 🟡 #1 — aperta\n\ncorta", `### ✅ #2 — chiusa\n\n${grossa}`]);
  const r = pulisci(prima);
  assert.ok(r.coda.length < prima.length - 4_000, `la coda è passata da ${prima.length} a ${r.coda.length}: non ha perso il peso della carta chiusa`);
});

test("la coda dice dove sono finite: un archivio senza cartello somiglia a una cancellazione", () => {
  const r = pulisci(codaFinta(["### 🟡 #1 — aperta\n\nt", "### ✅ #2 — chiusa\n\nt"]));
  assert.match(r.coda, /AZIONI-CHIUSE/, "chi scorre la coda fino in fondo deve poter arrivare all'archivio");
});

// ─────────────────── ② l'archivio già esistente non si perde ───────────────────

test("le carte già archiviate restano: la pulizia aggiunge, non sostituisce", () => {
  const vecchie = "# 🗄️ Card chiuse\n\n### ✅ #0 — archiviata la settimana scorsa\n\ntesto vecchio\n";
  const r = pulisci(codaFinta(["### 🟡 #1 — aperta\n\nt", "### ✅ #2 — chiusa oggi\n\nt"]), vecchie);
  assert.equal(r.codice, 0, r.uscita);
  assert.match(r.archivio, /### ✅ #0/, "la carta di prima è sparita: la pulizia ha sovrascritto invece di aggiungere");
  assert.match(r.archivio, /### ✅ #2/, "e quella di oggi non è arrivata");
});

// ──────────────────────── ③ I DUE FRENI, VISTI SCATTARE ───────────────────────
//
// Non sono decorativi: il primo ha fermato un difetto vero mentre scrivevo questo lavoro. La prima
// versione dava al divisore anche l'intestazione dell'archivio, e alla SECONDA pulizia quella testa
// sarebbe sparita in silenzio. Il freno ha detto «332 caratteri sparirebbero» e non ha scritto.

test("un blocco che nessun ramo riconosce ferma tutto: non si scrive niente", () => {
  // Il caso: un archivio in cui il divisore non ritrova nessuna card. Senza freno, riscrivere quel
  // file vorrebbe dire cancellarlo per intero — la perdita più grossa possibile, e muta.
  const coda = codaFinta(["### 🟡 #1 — aperta\n\nt", "### ✅ #2 — chiusa\n\nt"]);
  const rovinato = "archivio rovinato da una fusione, qui dentro non c'è nessuna card\ne però c'è del testo che vale\n";
  const r = pulisci(coda, rovinato);
  assert.equal(r.codice, 1, "la pulizia è andata avanti su un archivio che non sa leggere");
  assert.match(r.uscita, /NON scrivo/, "chi legge deve sapere che si è fermata apposta");
  assert.equal(r.archivio, rovinato, "l'archivio è stato riscritto: era proprio la cosa da non fare");
  assert.equal(r.coda, coda, "e anche la coda è stata toccata: il freno arriva troppo tardi");
});

test("il dry-run dice il pericolo invece di tacerlo", () => {
  // Un'anteprima che mostra tutto verde e poi si ferma davvero è peggio di nessuna anteprima: si
  // guarda l'anteprima proprio per decidere se lanciarla.
  const coda = codaFinta(["### 🟡 #1 — aperta\n\nt", "### ✅ #2 — chiusa\n\nt"]);
  const r = pulisci(coda, "archivio rovinato senza card\n", ["--dry-run"]);
  assert.equal(r.codice, 1);
  assert.match(r.uscita, /⛔/, "il dry-run tace un pericolo che c'è");
});

// ────────────────── ③bis la pulizia non allunga il file che pulisce ───────────

test("tre pulizie di fila lasciano la coda identica", () => {
  // Questa riga nasce da un difetto trovato provandola: il cartello che punta all'archivio non
  // apriva un blocco suo, quindi si incollava all'ultima card e usciva con lei mentre sotto ne
  // veniva scritto uno nuovo. La coda cresceva di 150 caratteri a ogni giro — cioè la pulizia
  // allungava il file che esiste per accorciare.
  const coda = codaFinta(["### 🟡 #1 — aperta\n\nt", "### ✅ #2 — chiusa\n\nt"]);
  const uno = pulisci(coda);
  const due = pulisci(uno.coda, uno.archivio);
  const tre = pulisci(due.coda, due.archivio);
  assert.equal(due.coda.length, tre.coda.length, `la coda cresce a ogni pulizia: ${uno.coda.length} → ${due.coda.length} → ${tre.coda.length}`);
  assert.equal(due.coda, tre.coda, "due pulizie di fila devono lasciare lo stesso identico testo");
});

// ───────────────────────────── ④ SUL REPO VERO ─────────────────────────────────

test("SUL REPO VERO: nella coda non è rimasta nessuna carta chiusa", () => {
  const coda = readFileSync(CASE[0], "utf8");
  const chiuse = coda.match(/^### (✅|❌)/gm) || [];
  assert.deepEqual(chiuse, [], `${chiuse.length} carte chiuse sono tornate nella coda: l'archivio sta di nuovo dentro il file che doveva alleggerire`);
});

test("SUL REPO VERO: la coda sta dentro il campo visivo del controllo che la legge", () => {
  // È la riga che tiene viva la cura. Diventa rossa il giorno che la coda ricresce oltre quello che
  // il controllo riesce a guardare — cioè prima che il buco si riapra, non dopo averlo scoperto.
  const coda = readFileSync(CASE[0], "utf8");
  assert.ok(coda.length <= TETTO_TESTO, `la coda fa ${coda.length} caratteri contro un campo visivo di ${TETTO_TESTO}: torna a leggersi a metà`);
});

test("SUL REPO VERO: le due case si leggono tutte e due, e le carte chiuse sono nella seconda", () => {
  const due = testoDelleDueCase();
  assert.deepEqual(due.mancanti, [], "una delle due case non si legge");
  const archivio = readFileSync(CASE[1], "utf8");
  assert.ok((archivio.match(/^### (✅|❌)/gm) || []).length > 0, "l'archivio è vuoto: o non si archivia più, o le carte sono andate perse");
});
