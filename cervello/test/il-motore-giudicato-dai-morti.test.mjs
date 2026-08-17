#!/usr/bin/env node
// AR-766 — «zero decadute» letto come «il decadimento non gira»: un motore giudicato dal cimitero.
//
// LA RADICE. Il guardiano dell'apprendimento aveva una regola sola: se le lezioni vive superano 400
// e le decadute sono zero, allora «il decadimento non gira, l'archivio è un cimitero». Ma il motore
// del decadimento toglie 0,15 di confidenza ogni SETTE giorni e uccide sotto 0,3: partendo da 0,8
// servono più di due mesi perché muoia la prima. Zero morti con i passi che girano è lo stato
// NORMALE di un motore lento, non un guasto.
//
// IL CONTO, misurato il 17/8 sull'archivio vero: 323 lezioni portavano un passo di decadimento
// timbrato fra il 12 e il 17 agosto, e la confidenza minima era scesa da 0,8 a 0,33 — a un passo
// dalla soglia. Il motore stava lavorando sotto gli occhi del guardiano, che intanto diceva a Nicola
// che era fermo.
//
// PERCHÉ CONTA, ed è il motivo per cui non è un dettaglio: questo verdetto Nicola lo legge. Un
// guardiano che sbaglia diagnosi su un organo sano manda a riparare ciò che funziona, e nel frattempo
// il problema vero — l'archivio troppo grande — resta senza nome.
//
// COSA PROVA QUESTO FILE:
//   ① passi recenti e zero morti = motore LENTO, non fermo (il caso dell'archivio vero);
//   ② zero passi recenti e zero morti = motore FERMO davvero, e va detto con quelle parole;
//   ③ il confine dei giorni si misura sul timbro, non a occhio: un passo di ieri conta, uno di due
//      mesi fa no;
//   ④ la confidenza minima riportata è quella VERA della lezione messa peggio: è il numero che dice
//      «quanto manca alla prima morte», e senza quello «lento» resterebbe una parola;
//   ⑤ un archivio con timbri illeggibili o assenti non diventa «gira»: in mancanza di prove si dice
//      fermo, perché è il verdetto che fa guardare;
//   ⑥ sull'archivio VERO il guardiano non dice più «non gira».
//
// NON-VACUITÀ (verificata il 17/8 rompendo il fix apposta): facendo tornare `passiDecadimento` a
// dichiarare sempre fermo (`fermo: true`), i casi ① ⑥ diventano ROSSI.

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GIORNI_PASSO_RECENTE, analizza, passiDecadimento } from "../apprendimento-guardiano.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const ARCHIVIO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

const ADESSO = "2026-08-17T12:00:00Z";
const giorniFa = (n) => new Date(Date.parse(ADESSO) - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");

const lez = (id, conf, passo) => ({ id, testo: `regola ${id}`, stato: "attiva", confidenza: conf, decaduto_step_il: passo });

// ── ① Passi recenti + zero morti = lento, non fermo ──────────────────────────────────────────────

test("① con i passi che girano il motore è LENTO, non fermo", () => {
  const vive = [lez("L-1", 0.33, giorniFa(1)), lez("L-2", 0.5, giorniFa(3)), lez("L-3", 0.8, giorniFa(6))];
  const p = passiDecadimento(vive, ADESSO);
  assert.equal(p.fermo, false, "tre passi nell'ultima settimana: dire «fermo» sarebbe falso");
  assert.equal(p.passiRecenti, 3);
});

// ── ② Zero passi = fermo davvero ─────────────────────────────────────────────────────────────────

test("② senza nessun passo recente il motore è fermo, e si dice", () => {
  const vive = [lez("L-1", 0.8, giorniFa(60)), lez("L-2", 0.9, giorniFa(90))];
  const p = passiDecadimento(vive, ADESSO);
  assert.equal(p.fermo, true);
  assert.equal(p.passiRecenti, 0);
});

// ── ③ Il confine si misura, non si stima ─────────────────────────────────────────────────────────

test("③ il confine dei giorni è esatto: dentro conta, fuori no", () => {
  const dentro = passiDecadimento([lez("L-1", 0.8, giorniFa(GIORNI_PASSO_RECENTE - 1))], ADESSO);
  assert.equal(dentro.passiRecenti, 1);

  const fuori = passiDecadimento([lez("L-1", 0.8, giorniFa(GIORNI_PASSO_RECENTE + 1))], ADESSO);
  assert.equal(fuori.passiRecenti, 0, "un passo più vecchio della finestra non tiene in vita il verdetto");
});

// ── ④ La confidenza minima è quella vera ─────────────────────────────────────────────────────────

test("④ riporta la confidenza della lezione messa peggio, non una media", () => {
  const p = passiDecadimento([lez("L-1", 0.9, giorniFa(1)), lez("L-2", 0.33, giorniFa(1))], ADESSO);
  assert.equal(p.minConfidenza, 0.33, "è il numero che dice quanto manca alla prima morte");
});

// ── ⑤ Al buio non si dichiara «gira» ─────────────────────────────────────────────────────────────

test("⑤ senza timbri leggibili il verdetto resta fermo: al buio non si dà via libera", () => {
  const senza = passiDecadimento([{ id: "L-1", stato: "attiva", confidenza: 0.8 }], ADESSO);
  assert.equal(senza.fermo, true);

  const rotto = passiDecadimento([lez("L-1", 0.8, "non-una-data")], ADESSO);
  assert.equal(rotto.fermo, true, "una data illeggibile non è un passo: è un buco");

  assert.equal(passiDecadimento([], ADESSO).fermo, true);
  assert.equal(passiDecadimento([null, undefined], ADESSO).passiRecenti, 0, "non deve nemmeno rompere");
});

// ── ⑥ Sull'archivio VERO il guardiano non dice più «non gira» ────────────────────────────────────

test("⑥ sull'archivio vero il verdetto non accusa più il motore di essere fermo", () => {
  const dati = JSON.parse(readFileSync(ARCHIVIO, "utf8"));
  const r = analizza(dati);
  const suiDecaduti = r.problemi.filter((p) => p.includes("decadute"));

  // prerequisito del caso: l'archivio è ancora grande e nessuno è morto, cioè la riga esiste
  assert.equal(suiDecaduti.length, 1, "prerequisito: il guardiano parla ancora di decadute");

  // e il motore, sull'archivio vero, sta DAVVERO facendo passi: lo si misura qui, non si spera
  const p = passiDecadimento(r.vive);
  assert.ok(p.passiRecenti > 0, `prerequisito: passi recenti sull'archivio vero (trovati ${p.passiRecenti})`);

  assert.match(
    suiDecaduti[0],
    /il decadimento GIRA/,
    "col motore che fa passi ogni giorno il verdetto deve dirlo: «non gira» è una diagnosi falsa su un organo sano",
  );
  assert.doesNotMatch(suiDecaduti[0], /il decadimento non gira|è FERMO davvero/);
});
