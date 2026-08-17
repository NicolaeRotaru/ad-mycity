#!/usr/bin/env node
// AR-762 — la lezione arrivava al lavoro senza il suo freno, per un nome di campo.
//
// LA RADICE. La scheda che parte a ogni richiesta (hook UserPromptSubmit) leggeva `l.gate_attivo`
// per decidere se mostrare il comando che fa scattare quella lezione. Era l'UNICA riga di tutto il
// repo a leggere quel campo: `sorvegliante.mjs`, `cancello-stop.mjs`, `contratto-prova.mjs` e
// `tasso-regole.mjs` leggono tutti `l.gate`. E soprattutto la porta ufficiale di scrittura,
// `lezione-nuova.mjs`, scrive `gate` e non scrive MAI `gate_attivo` — quindi ogni lezione nata
// dalla porta era strutturalmente incapace di mostrare il proprio freno.
//
// IL CONTO, misurato il 16/8 sull'archivio vero (521 lezioni) con 8 richieste tipiche di Nicola:
// 52 righe di scheda servite · 11 appartenevano a lezioni con un freno vero · ne veniva mostrato 1.
// Dieci comandi che potevano fallire sono arrivati al lavoro come prosa da leggere. È la forma
// esatta della frase di Nicola «la macchina non impara le lezioni»: le leggeva e basta.
//
// COSA PROVA QUESTO FILE:
//   ① una lezione scritta dalla porta ufficiale (solo `gate`, nessun `gate_attivo`) porta il suo
//      freno fino alla scheda — è il caso che prima falliva sempre;
//   ② `gate_attivo: false` resta rispettato: è il segnale vero «il freno esiste ma non è ancora su
//      main» (L-2026-0730-530), e mandare a lanciare un comando che non c'è è peggio del silenzio;
//   ③ a parità di tema, la lezione col freno viene PRIMA di quella senza: fra due lezioni ugualmente
//      pertinenti, quella con un comando che può fallire è l'unica che cambia il lavoro;
//   ④ il bonus del freno NON fa entrare lezioni fuori tema: si applica solo dopo la soglia di
//      pertinenza, come quello delle correzioni di Nicola. Una scheda che allega roba a caso è
//      rumore, e il rumore spegne i freni veri;
//   ⑤ sull'archivio VERO la scheda non serve più zero freni: è la misura end-to-end, non un finto.
//
// NON-VACUITÀ (verificata il 16/8 rompendo il fix apposta): in `cervello/contesto-lezioni.mjs`,
// riportando `frenoDi` a leggere il campo vecchio (`const g = typeof lezione.gate_attivo === "string"
// ? …`), i casi ① ③ ⑤ ⑥ diventano ROSSI — 4 falliti su 8. La mutazione registrata in
// `cervello/mutanti.json` fa la stessa cosa dal cancello.
//
// ⚠️ Nessun caso scrive: si legge l'archivio vero in sola lettura e per il resto si usano lezioni
// finte costruite qui dentro.

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frenoDi, lezioniSuMisura } from "../contesto-lezioni.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const ARCHIVIO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

/** Una lezione come la scrive la porta ufficiale: tag, testo, e `gate` — mai `gate_attivo`. */
const lezione = (id, testo, extra = {}) => ({
  id,
  testo,
  tag: ["payout", "negozi"],
  stato: "attiva",
  ...extra,
});

const RICHIESTA = "controlla il payout dei negozi";

// ── ① Il freno di una lezione scritta dalla porta arriva fino alla scheda ────────────────────────

test("① una lezione con `gate` e senza `gate_attivo` porta il suo freno nella scheda", () => {
  const l = lezione("L-TEST-01", "il payout dei negozi va verificato prima di dirlo fatto", {
    gate: "node cervello/test/payout.test.mjs",
  });
  assert.equal(frenoDi(l), "node cervello/test/payout.test.mjs");

  const scheda = lezioniSuMisura(RICHIESTA, [l]);
  assert.equal(scheda.length, 1, "la lezione è in tema, deve entrare");
  assert.equal(
    scheda[0].gate,
    "node cervello/test/payout.test.mjs",
    "col campo vecchio qui arrivava null: la lezione entrava senza il comando che la fa rispettare",
  );
});

// ── ② Un freno dichiarato ma non ancora su main resta muto, e va bene così ───────────────────────

test("② `gate_attivo: false` continua a nascondere il freno: non è ancora su main", () => {
  const l = lezione("L-TEST-02", "il payout dei negozi va verificato", {
    gate: "node cervello/test/non-ancora-mergiato.test.mjs",
    gate_attivo: false,
  });
  assert.equal(frenoDi(l), null, "mandare a lanciare un comando che non c'è è peggio del silenzio");
  assert.equal(lezioniSuMisura(RICHIESTA, [l])[0].gate, null);
});

test("② un `gate` vuoto o non-stringa non diventa un freno finto", () => {
  assert.equal(frenoDi(lezione("L-TEST-03", "t", { gate: "   " })), null);
  assert.equal(frenoDi(lezione("L-TEST-04", "t", { gate: null })), null);
  assert.equal(frenoDi(lezione("L-TEST-05", "t", { gate: 42 })), null);
  assert.equal(frenoDi(null), null, "una lezione che non c'è non ha un freno: non deve nemmeno rompere");
});

// ── ③ A parità di tema, chi ha un freno viene prima ──────────────────────────────────────────────

test("③ fra due lezioni ugualmente in tema, quella col freno è la prima", () => {
  const senza = lezione("L-TEST-10", "il payout dei negozi va guardato con calma");
  const con = lezione("L-TEST-11", "il payout dei negozi va guardato con calma", {
    gate: "node cervello/test/payout.test.mjs",
  });

  const scheda = lezioniSuMisura(RICHIESTA, [senza, con]);
  assert.equal(scheda.length, 2);
  assert.equal(scheda[0].id, "L-TEST-11", "la lezione che porta un comando eseguibile va in cima");
  assert.ok(scheda[0].punti > scheda[1].punti, "e ci va per punteggio, non per ordine di arrivo");
});

// ── ④ Il freno non compra l'ingresso a chi è fuori tema ──────────────────────────────────────────

test("④ una lezione fuori tema NON entra nella scheda solo perché ha un freno", () => {
  const fuoriTema = {
    id: "L-TEST-20",
    testo: "le locandine si stampano in formato A3",
    tag: ["stampa", "locandine"],
    stato: "attiva",
    gate: "node cervello/test/locandine.test.mjs",
  };
  assert.deepEqual(
    lezioniSuMisura(RICHIESTA, [fuoriTema]),
    [],
    "il bonus si dà dopo la soglia: altrimenti la scheda si riempie di roba a caso e si impara a scorrerla",
  );
});

test("④ nemmeno una singola parola in comune basta, con il freno, a superare la soglia", () => {
  // «negozi» compare nel testo (1 punto) ma nessun tag è centrato: 1 + 2 di freno resterebbe sotto 3
  // solo se il bonus è dato dopo la soglia. È il caso che smaschera un bonus messo nel posto sbagliato.
  const quasi = {
    id: "L-TEST-21",
    testo: "i negozi ricevono la locandina in cassa",
    tag: ["stampa"],
    stato: "attiva",
    gate: "node cervello/test/locandine.test.mjs",
  };
  assert.deepEqual(lezioniSuMisura(RICHIESTA, [quasi]), []);
});

// ── ⑤ Sull'archivio VERO la scheda smette di servire zero freni ──────────────────────────────────

test("⑤ sull'archivio vero le richieste tipiche non servono più zero freni", () => {
  const dati = JSON.parse(readFileSync(ARCHIVIO, "utf8"));
  const lezioni = dati.lezioni;

  // il metro: quante lezioni con un freno vero finiscono nella scheda, e quante lo MOSTRANO.
  const richieste = [
    "ripara il problema che la macchina non impara le lezioni",
    "apri una PR per la modifica del pannello",
    "il worker non pubblica la memoria sul server",
    "sistema i difetti del cantiere",
    "fai un giro",
  ];
  const perId = new Map(lezioni.map((l) => [l.id, l]));
  let conFrenoVero = 0;
  let frenoMostrato = 0;
  for (const q of richieste) {
    for (const riga of lezioniSuMisura(q, lezioni)) {
      if (frenoDi(perId.get(riga.id))) conFrenoVero++;
      if (riga.gate) frenoMostrato++;
    }
  }

  assert.ok(conFrenoVero > 0, "prerequisito del caso: qualche lezione in tema deve avere un freno vero");
  assert.equal(
    frenoMostrato,
    conFrenoVero,
    `ogni freno vero servito deve arrivare visibile: mostrati ${frenoMostrato} su ${conFrenoVero}`,
  );
});

// ── il metro del metro: la porta di scrittura e la scheda devono parlare dello stesso campo ──────

test("⑥ il campo che la porta SCRIVE è lo stesso che la scheda LEGGE", () => {
  const porta = readFileSync(join(REPO, "cervello/lezione-nuova.mjs"), "utf8");
  assert.ok(
    /lezione\.gate = String\(campi\.gate\)/.test(porta),
    "la porta ufficiale scrive `gate`: se un giorno cambia campo, questo caso lo dice prima che la scheda torni muta",
  );
  const scritta = { id: "L-TEST-30", testo: "t", tag: [], gate: "node cervello/test/x.test.mjs" };
  assert.equal(frenoDi(scritta), "node cervello/test/x.test.mjs");
});
