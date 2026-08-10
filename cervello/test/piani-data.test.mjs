#!/usr/bin/env node
// 🗓️ Le prove di `piani-data.mjs` — la data che un piano si porta addosso.
//
// Il difetto che queste prove tengono chiuso è uno solo, e ha due facce:
//  ① contare come «piano aggiornato» un blocco che si riscrive da solo (il giro rigenera
//    `AD-AGGIORNAMENTO` in fondo a sei piani su dieci: il Piano Operativo aveva 22 commit e il
//    testo fermo dal 25/6);
//  ② contare come «piano aggiornato» la riga stessa che dice da quanto è fermo — cioè far
//    risultare vivo un piano grazie all'atto di annotare che è morto.
// Sono provate sul testo, non sul repo: un metro che funziona solo dove il repo è già com'è oggi
// non dimostra di saper mordere domani.

import assert from "node:assert/strict";
import { classificaErroreGit, corpoDelPiano, dataDellaNota, dichiarato, giorniFra, rigaData, inserisciRiga, INIZIO } from "../piani-data.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const NOTA = [
  "<!-- 🤖 AD-AGGIORNAMENTO:START · non scrivere qui dentro: lo rigenera l'AD a ogni giro -->",
  "## 🤖 Aggiornamento dell'AD — 2026-07-20 20:22",
  "- meteo di oggi, spunto del giorno",
  "<!-- 🤖 AD-AGGIORNAMENTO:END -->",
].join("\n");

const PIANO = `# 🤝 PIANO VENDITE\n\n> Base dati: qualcosa.\n\n## 1. Obiettivo\nIl testo del piano.\n\n${NOTA}\n`;

prova("il blocco che il giro rigenera NON conta come piano cambiato", () => {
  const dopo = PIANO.replace("2026-07-20 20:22", "2026-07-21 09:00").replace("spunto del giorno", "altro spunto");
  assert.equal(corpoDelPiano(PIANO), corpoDelPiano(dopo), "cambiare la nota dell'AD non è rivedere il piano");
});

prova("cambiare il testo del piano, invece, conta", () => {
  const dopo = PIANO.replace("Il testo del piano.", "Il testo del piano, rivisto da Nicola.");
  assert.notEqual(corpoDelPiano(PIANO), corpoDelPiano(dopo));
});

prova("la riga della data non fa risultare aggiornato il piano che dichiara fermo", () => {
  const conRiga = inserisciRiga(PIANO, rigaData({ corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: "2026-07-20 20:22" }));
  assert.equal(corpoDelPiano(conRiga), corpoDelPiano(PIANO), "il corpo misurato deve essere identico prima e dopo l'annotazione");
});

prova("scrivere la riga due volte lascia lo stesso file (si rigenera, non si accumula)", () => {
  const dati = { corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: "2026-07-20 20:22" };
  const una = inserisciRiga(PIANO, rigaData(dati));
  const due = inserisciRiga(una, rigaData(dati));
  assert.equal(due, una);
  assert.equal(due.split(INIZIO).length - 1, 1, "deve restare UNA sola riga della data");
});

prova("riscrivere con una data nuova sostituisce la vecchia, non la affianca", () => {
  const vecchia = inserisciRiga(PIANO, rigaData({ corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: null }));
  const nuova = inserisciRiga(vecchia, rigaData({ corpo: "2026-08-01 09:00", nato: "2026-06-25 12:34", nota: null }));
  assert.ok(nuova.includes("2026-08-01 09:00"));
  assert.ok(!nuova.includes("Ultimo aggiornamento: 2026-06-25 12:34"), "la data superata non deve restare in pagina");
  assert.equal(nuova.split(INIZIO).length - 1, 1);
});

prova("la riga va sotto il titolo, non prima", () => {
  const conRiga = inserisciRiga(PIANO, rigaData({ corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: null }));
  const righe = conRiga.split("\n");
  assert.ok(/^#\s/.test(righe[0]), "il titolo resta la prima riga del file");
  assert.ok(conRiga.indexOf(INIZIO) > conRiga.indexOf("# 🤝 PIANO VENDITE"));
});

prova("un piano senza titolo prende comunque la sua data", () => {
  const senzaTitolo = "solo testo, nessun titolo\n";
  const conRiga = inserisciRiga(senzaTitolo, rigaData({ corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: null }));
  assert.ok(conRiga.includes("2026-06-25 12:34"));
  assert.ok(conRiga.includes("solo testo"));
});

prova("i dati riletti dalla riga sono gli stessi che ci abbiamo scritto", () => {
  const dati = { corpo: "2026-07-20 20:22", nato: "2026-06-25 12:34", nota: "2026-07-20 11:00" };
  const letto = dichiarato(inserisciRiga(PIANO, rigaData(dati)));
  assert.deepEqual(letto, dati, "è il confronto che permette a --controlla di accorgersi se la riga mente");
});

prova("la data della nota dell'AD si legge dal blocco", () => {
  assert.equal(dataDellaNota(PIANO), "2026-07-20 20:22");
  assert.equal(dataDellaNota("# Piano senza nota\n"), null);
});

prova("un piano mai rivisto e uno rivisto dopo dicono due frasi diverse", () => {
  const fermo = rigaData({ corpo: "2026-06-25 12:34", nato: "2026-06-25 12:34", nota: null });
  const rivisto = rigaData({ corpo: "2026-07-20 20:22", nato: "2026-06-25 12:34", nota: null });
  assert.ok(fermo.includes("il giorno in cui questo piano è stato scritto"));
  assert.ok(rivisto.includes("Il piano è nato il 2026-06-25 12:34"));
});

prova("i giorni fermi si contano interi e non vanno mai sotto zero", () => {
  assert.equal(giorniFra("2026-06-25 12:34", "2026-08-10 11:56"), 45);
  assert.equal(giorniFra("2026-08-10 11:56", "2026-08-10 12:00"), 0);
  assert.equal(giorniFra("2026-08-11 00:00", "2026-08-10 12:00"), 0, "una data futura non produce giorni negativi");
});

// ── La malattia che il guardiano ha contestato mentre scrivevo il file ───────
// `fonte-troncata-letta-per-intera`: `catch { return "" }` faceva sembrare VUOTO un file che git
// non era riuscito a leggere. Il confronto lo avrebbe letto come «qui il piano è cambiato», e sul
// piano sarebbe finita una data sbagliata — che ha la stessa faccia di una giusta.

prova("il file che a quel commit non c'era ancora vale vuoto: è la nascita, non un guasto", () => {
  const nascita = "fatal: path 'MyCity-Vault/06-Piani/Piano Vendite.md' exists on disk, but not in 'abc123~1'";
  assert.deepEqual(classificaErroreGit(nascita), { testo: "" });
  assert.deepEqual(classificaErroreGit("fatal: path 'x' does not exist in 'abc123'"), { testo: "" });
});

prova("git che non risponde NON vale vuoto: vale cieco, così il piano resta senza data", () => {
  for (const guasto of ["Command failed: ETIMEDOUT", "fatal: unable to read object file", "stdout maxBuffer length exceeded"]) {
    const esito = classificaErroreGit(guasto);
    assert.ok(esito.cieco, `"${guasto}" deve dare cieco, non una stringa vuota`);
    assert.equal(esito.testo, undefined, "un guasto non deve mai presentarsi come contenuto letto");
  }
});

prova("anche un errore senza testo resta cieco, non diventa vuoto", () => {
  assert.ok(classificaErroreGit("").cieco, "il silenzio di git non è la prova che il file fosse vuoto");
  assert.ok(classificaErroreGit(null).cieco);
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
