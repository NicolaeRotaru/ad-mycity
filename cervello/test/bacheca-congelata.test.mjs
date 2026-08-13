#!/usr/bin/env node
// 🧪 AR-378 — LA BACHECA RESTAVA A IERI E PROMETTEVA PIÙ PROTEZIONE DI QUELLA CHE C'ERA.
//
// La tabella «I guardiani della macchina» è la superficie da cui Nicola sa chi lo protegge. Si
// riscriveva solo col censimento verde: se un controllo girava senza descrizione, lo script usciva
// rosso e NON scriveva. Il pensiero era binario — verde scrivo / rosso non scrivo — e mancava il
// terzo stato. «Non scrivo» non lascia traccia: in bacheca restava la foto di ieri, completa, con la
// sua data di ieri, e quindi fresca all'occhio. Fra un buco visibile e una foto vecchia che sembra
// fresca era stata scelta la seconda.
//
// Le due cose che devono valere adesso: ① il blocco si scrive anche quando il censimento è rotto;
// ② quando è rotto lo DICE in cima, coi nomi, invece di lasciare una casella vuota.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { bloccoBacheca, TITOLO_BACHECA } = await import(join(REPO, "cervello", "censimento-guardiani.mjs"));

/** Un censimento con un buco: un guardiano gira e nessuno ha scritto cosa fa. */
const rotto = {
  totale: 2,
  fermano: 1,
  nonContati: [],
  senzaDescrizione: ["sonda-nuova"],
  fantasmi: [],
  elenco: [
    { nome: "scan-segreti", famiglia: "sicurezza", cosa: "Cerca chiavi nei file che stanno per uscire.", effetti: ["ferma"], mano: false },
    { nome: "sonda-nuova", famiglia: "sicurezza", cosa: "", effetti: ["avvisa"], mano: false },
  ],
};

const sano = { ...rotto, senzaDescrizione: [], elenco: [rotto.elenco[0]], totale: 1 };

test("col censimento rotto il blocco DICE che è incompleto, in cima e coi nomi", () => {
  const b = bloccoBacheca(rotto, "2026-08-13 22:00");
  assert.match(b, /TABELLA INCOMPLETA/, "senza questa riga la tabella parziale si legge come completa");
  assert.match(b, /sonda-nuova/, "chi legge deve sapere QUALE protezione non è descritta");
  // La riga d'allarme sta prima della tabella: sotto la tabella non la leggerebbe nessuno.
  assert.ok(b.indexOf("TABELLA INCOMPLETA") < b.indexOf("| Controllo |"), "l'allarme va prima di ciò che descrive");
});

test("il guardiano senza descrizione non lascia una casella vuota", () => {
  const b = bloccoBacheca(rotto, "2026-08-13 22:00");
  assert.match(b, /nessuno ha ancora scritto cosa controlla/, "una casella vuota si legge come «niente da dire»");
});

test("col censimento sano non compare nessun allarme: il rumore ucciderebbe la riga", () => {
  const b = bloccoBacheca(sano, "2026-08-13 22:00");
  assert.doesNotMatch(b, /TABELLA INCOMPLETA/);
  assert.match(b, new RegExp(TITOLO_BACHECA.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("un guardiano descritto che non gira più viene denunciato, non taciuto", () => {
  const b = bloccoBacheca({ ...sano, fantasmi: ["guardiano-morto"] }, "2026-08-13 22:00");
  assert.match(b, /NON girano più/);
  assert.match(b, /guardiano-morto/);
});

test("la scrittura NON è più condizionata al verde (il punto che chiama)", () => {
  const src = readFileSync(join(REPO, "cervello", "guardiani-check.mjs"), "utf8");
  const blocco = src.slice(src.indexOf("if (SCRIVI)"), src.indexOf("if (JSON_MODE)"));
  assert.doesNotMatch(
    blocco,
    /rc === 0/,
    "finché la scrittura dipende da `rc === 0` — con un if o con un ternario — il rosso lascia in bacheca la foto di ieri con la data di ieri",
  );
  assert.match(blocco, /scriviTestoAtomico\(BACHECA/, "e deve comunque scriverla");
});
