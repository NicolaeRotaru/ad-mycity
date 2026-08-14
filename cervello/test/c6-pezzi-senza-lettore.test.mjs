#!/usr/bin/env node
// 🧪 AR-581 — IL QUADERNO DEI PEZZI NUOVI È MORTO: NESSUN PROGRAMMA LO LEGGE, NESSUNO LO AGGIORNA.
//
// `cantiere-pezzi.json` contiene 14 proposte di pezzi nuovi della macchina (guardiani, sensori — per
// esempio il guardiano «owner unico per keyword» sulle description). Fermo al 5 luglio, e con ZERO
// lettori: nessun file di `cervello/`, `pannello/` o `.claude/` lo apriva. Quattordici idee di
// miglioramento pensate, scritte e mai più guardate, più un file che inganna chi esplora la memoria
// facendosi passare per vivo.
//
// Adesso il suo lettore è `sincronizza-proposte.mjs`, che già teneva agganciate al cantiere le altre
// proposte: a ogni giro dice quanti pezzi restano da costruire, quali risultano già in piedi sul
// disco anche se il quaderno non l'ha registrato, e quanto è vecchio il quaderno.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
// L'import stesso è metà della prova: se questo file tornasse a lanciare il programma al solo essere
// importato, riscriverebbe auto-miglioramento.json ogni volta che qualcuno prova una sua funzione.
const SP = await import(join(REPO, "cervello/sincronizza-proposte.mjs"));

const QUADERNO = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-pezzi.json"), "utf8"));

test("il quaderno vero adesso passa da un lettore: 14 pezzi, contati uno per uno", () => {
  const r = SP.sincronizzaPezzi(QUADERNO.pezzi, (f) => existsSync(join(REPO, "cervello", f)));
  assert.equal(r.totale, 14, "sono le 14 proposte che dormivano nel file");
  assert.equal(r.righe.length, 14);
  assert.ok(r.da_costruire.length >= 1, "quello che resta da fare deve tornare davanti agli occhi");
});

test("lo stato di un pezzo si verifica sul mondo, non si legge nel file", () => {
  const pezzi = [
    { id: "PZ-A", titolo: "guardiano-che-non-esiste.mjs — un pezzo mai costruito", stato: "proposto" },
    { id: "PZ-B", titolo: "guardiano-costruito.mjs — un pezzo che c'è già", stato: "proposto" },
  ];
  const r = SP.sincronizzaPezzi(pezzi, (f) => f === "guardiano-costruito.mjs");
  assert.deepEqual(r.da_aggiornare.map((x) => x.id), ["PZ-B"], "è in piedi ma il quaderno lo chiama ancora «proposto»");
  assert.deepEqual(r.da_costruire.map((x) => x.id), ["PZ-A", "PZ-B"]);
});

test("un quaderno fermo da cinque settimane è STANTIO, non stabile", () => {
  const adesso = Date.parse("2026-08-13T08:50:00+02:00");
  const r = M.etaReferto({ dato: QUADERNO, scadenzaOre: SP.PEZZI_SCADENZA_ORE, adessoMs: adesso, nome: "Il quaderno dei pezzi nuovi" });
  assert.equal(r.stato, M.STANTIO, "5 luglio → 13 agosto: trentanove giorni");
  assert.ok(r.eta_ore > 24 * 30);
});

test("il quaderno è nel registro unico di freschezza, con chi lo rigenera", () => {
  const voce = M.REGISTRO_FRESCHEZZA.find((r) => r.percorso.endsWith("cantiere-pezzi.json"));
  assert.ok(voce, "un file di memoria fuori dal registro torna a essere invisibile");
  assert.match(voce.rigenera, /sincronizza-proposte/, "il registro deve dire CHI lo rigenera, o non si sa a chi chiederlo");
});

test("un quaderno senza pezzi non esplode e non finge: zero è zero", () => {
  const r = SP.sincronizzaPezzi(undefined);
  assert.equal(r.totale, 0);
  assert.deepEqual(r.da_costruire, []);
});
