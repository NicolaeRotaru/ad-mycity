import { test } from "node:test";
import assert from "node:assert/strict";
import { contestoPiano, smentiteDichiarate } from "./contesto-piano.ts";

// Il piano com'è davvero sul disco al 10/8: titolo, riga della data, avviso delle smentite, e SOLO
// dopo il testo di Nicola. È l'ordine che ha causato il difetto: i due blocchi di servizio in cima
// si mangiavano tutto lo spazio del contesto.
const PIANO = [
  "# 🏛️ PIANO ISTITUZIONALE & BANDI 2026",
  "",
  "<!-- 🗓️ AD-DATA:START · riga di servizio -->",
  "> 🗓️ **Ultimo aggiornamento: 2026-06-25 12:34** — il giorno in cui questo piano è stato scritto.",
  '<!-- 🗓️ AD-DATA {"corpo":"2026-06-25 12:34","nato":"2026-06-25 12:34","nota":null} -->',
  "<!-- 🗓️ AD-DATA:END -->",
  "",
  "<!-- ⛔ AD-SMENTITE:START · lo riscrive `node cervello/piani-verita.mjs --scrivi`, non a mano -->",
  "> ⛔ **Attenzione: 8 frasi di questo piano non sono più vere.** Il registro dei fatti le smentisce, e il testo qui sotto è rimasto com'era. Correggerlo è una revisione del piano: la decide Nicola.",
  "> · **Il Bando Commercio ER è dato per aperto** (righe 20, 99, 110, 145, 161, 188) — il registro dice: CHIUSO il 23/6/2026 ore 10:00:37 — raggiunto limite di 350 domande. *(fesr.regione.emilia-romagna.it)*",
  "> · **Il voucher PI26 è dato per aperto o da inviare** (riga 201) — il registro dice: Non idoneo, confermato da Nicola 2026-07-29. *(DECISIONI.md)*",
  "> *Misurato il 2026-08-10 15:59. Quando il piano e il registro tornano d'accordo, questo avviso sparisce da solo.*",
  "<!-- ⛔ AD-SMENTITE:END -->",
  "",
  "> Base dati: gli enti non sono burocrazia da subire, sono reach e legittimità.",
  "> **Tesi:** un endorsement di Confcommercio arriva a tutta la rete commerciale della città.",
  "",
  "## 1. OBIETTIVO & MISURA",
  "Il testo vero del piano, quello su cui Nicola farà la domanda.",
].join("\n");

test("il contesto arriva al testo del piano, non si ferma all'avviso", () => {
  // Il difetto vero, misurato il 10/8: 800 caratteri di cui ~470 di avviso e ZERO di piano.
  const ctx = contestoPiano(PIANO);
  assert.ok(ctx.includes("Base dati"), `il contesto non arriva al piano:\n${ctx}`);
  assert.ok(ctx.includes("Tesi"), "deve arrivare almeno alle prime righe di sostanza");
});

test("l'avviso non sparisce: resta una riga, perché chi risponde deve sapere che il piano mente", () => {
  const ctx = contestoPiano(PIANO);
  assert.ok(ctx.includes("8 frasi"), "senza il numero, chi risponde ripete il bando chiuso in buona fede");
  assert.ok(!ctx.includes("righe 20, 99"), "l'elenco riga per riga è rumore qui: sta nel piano, a video");
});

test("l'avviso riassunto occupa una frazione di quello intero", () => {
  const intero = PIANO.split("\n").filter((r) => r.startsWith("> ⛔") || r.startsWith("> · ")).join("\n").length;
  const ctx = contestoPiano(PIANO);
  const riassunto = (ctx.match(/^> ⛔[^\n]*/m) || [""])[0].length;
  assert.ok(riassunto < intero / 2, `riassunto ${riassunto} caratteri contro ${intero} dell'avviso intero`);
});

test("le righe di servizio e i commenti HTML non viaggiano", () => {
  const ctx = contestoPiano(PIANO);
  assert.ok(!ctx.includes("<!--"), "nessun commento HTML nel contesto");
  assert.ok(!ctx.includes("AD-DATA"), "la riga della data resta a video, non nel contesto");
});

test("un piano senza avviso non guadagna una riga dal nulla", () => {
  const pulito = "# PIANO PRODOTTO\n\n> Base dati: qualcosa.\n\nIl testo del piano.";
  const ctx = contestoPiano(pulito);
  assert.ok(!ctx.includes("Attenzione"), "il Piano Prodotto è pulito: non deve comparire un avviso");
  assert.ok(ctx.startsWith("# PIANO PRODOTTO"));
});

test("il conteggio legge il singolare e il plurale", () => {
  assert.equal(smentiteDichiarate(PIANO), 8);
  assert.equal(smentiteDichiarate(PIANO.replace("Attenzione: 8 frasi di questo piano non sono più vere", "Attenzione: una frase di questo piano non è più vera")), 1);
  assert.equal(smentiteDichiarate("# Piano senza avviso"), 0);
});

test("il limite è rispettato", () => {
  assert.ok(contestoPiano(PIANO, 200).length <= 200);
});
