#!/usr/bin/env node
// 🧪 DUE DIFETTI DIVERSI CON LO STESSO NUMERO.
//
// Successo davvero, il 30/7, e scoperto solo perché Nicola ha chiesto di controllare i merge prima
// di mergiare. Due sessioni aperte insieme hanno registrato un difetto nuovo ciascuna, prendendo «il
// prossimo numero libero» dalla copia del cantiere che avevano in mano: `AR-444` per entrambe. Uno
// era «un difetto dichiarato aperto si richiude da solo» (chiuso), l'altro «tredici test scrivono
// nella memoria vera» (aperto).
//
// Git non lo vede. Sono righe diverse dello stesso array: l'unione riesce, nessun conflitto, e il
// file resta JSON valido. Il danno arriva dopo ed è silenzioso — tutto il cantiere è indicizzato per
// id, quindi `auto-fix` cerca AR-444 e ne trova due, una prova condivisa conta un id che compare
// due volte, una chiusura ne chiude uno a caso.
//
// Nessun tetto su questo: non è debito ereditato da una radiografia vecchia, è una collisione fra
// due sessioni. O c'è o non c'è.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { idDoppi } = await import(join(REPO, "cervello/cancello-lotto.mjs"));

test("il caso vero del 30/7: due AR-444 diversi", () => {
  const d = idDoppi([
    { id: "AR-443", titolo: "un difetto qualsiasi" },
    { id: "AR-444", titolo: "Un difetto dichiarato aperto si richiude da solo", stato: "chiuso" },
    { id: "AR-444", titolo: "Tredici test scrivono nella memoria VERA della macchina", stato: "aperto" },
  ]);
  assert.equal(d.length, 1);
  assert.equal(d[0].id, "AR-444");
  assert.equal(d[0].quanti, 2);
  assert.equal(d[0].titoli.length, 2, "deve dire QUALI due, o chi legge non sa quale rinumerare");
});

test("un cantiere sano non produce nessuna violazione", () => {
  assert.deepEqual(idDoppi([{ id: "AR-1", titolo: "a" }, { id: "AR-2", titolo: "b" }]), []);
  assert.deepEqual(idDoppi([]), []);
});

test("tre copie dello stesso id si contano tutte e tre", () => {
  const d = idDoppi([
    { id: "AR-9", titolo: "primo" },
    { id: "AR-9", titolo: "secondo" },
    { id: "AR-9", titolo: "terzo" },
  ]);
  assert.equal(d[0].quanti, 3);
});

test("una scheda senza id non finisce nel conto (è un altro difetto, non questo)", () => {
  const d = idDoppi([{ titolo: "senza id" }, { titolo: "un altro senza id" }, { id: "AR-1", titolo: "a" }]);
  assert.deepEqual(d, [], "due schede senza id non sono «due difetti con lo stesso id»");
});

test("il cantiere VERO di adesso non ha id doppi", () => {
  const c = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const d = idDoppi(c.difetti);
  assert.deepEqual(
    d,
    [],
    `id doppi nel cantiere: ${JSON.stringify(d)} — vanno rinumerati, il cantiere è indicizzato per id`,
  );
});

test("il cancello lo tratta come violazione senza tetto", () => {
  const src = readFileSync(join(REPO, "cervello/cancello-lotto.mjs"), "utf8");
  assert.match(src, /regola: "id-doppio"/, "deve essere una violazione, non un avviso");
  const bloccoTetti = src.match(/const TETTI_DEFAULT = \{(.*?)\}/s)[1];
  assert.doesNotMatch(bloccoTetti, /id_doppio/, "un tetto sugli id doppi sarebbe il permesso di tenerne qualcuno");
});
