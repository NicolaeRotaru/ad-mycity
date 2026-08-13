#!/usr/bin/env node
// 🧪 AR-650 — UN BLOCCANTE SPARIVA DAL CONTO PERCHÉ IL GUARDIANO LEGGEVA UN CAMPO SOLO.
//
// Le schede vecchie del cantiere dichiarano `gravita`, le 48 nate dalla radiografia del 13/8
// dichiarano `severita`. `classifica()` copiava `d.gravita` e basta: per lei quelle 48 erano tutte
// senza gravità. Il conto dei BLOCCANTI CIECHI — quelli che nessun guardiano potrà mai chiudere —
// filtrava su quel campo, quindi AR-592 (bloccante, prova vuota) non ci entrava, e il verdetto
// stampava «✅ Ogni bloccante ha una prova che un guardiano può verificare».
//
// Non è un verde ottimista: è un verde ottenuto guardando dalla parte sbagliata. `gravitaDi()`
// esisteva già dal lotto 37 e non era agganciata qui.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { classifica, bloccantiCiechi, gravitaDi } = await import(join(REPO, "cervello", "cantiere-prove.mjs"));

/** Una scheda bloccante che nessun guardiano può chiudere, nel dialetto della generazione nuova. */
const nuovaGenerazione = {
  id: "AR-999",
  titolo: "bloccante nato dalla radiografia nuova",
  severita: "bloccante",
  stato: "aperto",
  nato: "2026-08-13 08:50",
  verifica: { tipo: "comando", esito: "riprodotto" }, // dice «comando» e il comando non c'è
};

/** La stessa cosa, nel dialetto vecchio: serve a provare che non ho rotto il caso che funzionava. */
const vecchiaGenerazione = { ...nuovaGenerazione, id: "AR-998", gravita: "bloccante", severita: undefined };

test("la gravità si legge da entrambi i nomi del campo", () => {
  assert.equal(gravitaDi({ gravita: "grave" }), "grave");
  assert.equal(gravitaDi({ severita: "bloccante" }), "bloccante");
  assert.equal(gravitaDi({}), null, "assente resta assente: non si inventa una gravità");
});

test("classificando una scheda nuova la gravità NON si perde per strada", () => {
  const v = classifica(nuovaGenerazione);
  assert.equal(v.gravita, "bloccante", "se qui torna undefined, ogni conto a valle è cieco su 48 schede");
  assert.equal(v.auto_chiudibile, false, "una prova senza comando non la può verificare nessun guardiano");
});

test("il conto dei bloccanti ciechi vede la generazione nuova quanto la vecchia", () => {
  const voci = [nuovaGenerazione, vecchiaGenerazione].map(classifica);
  const ciechi = bloccantiCiechi(voci).map((v) => v.id);
  assert.deepEqual(ciechi.sort(), ["AR-998", "AR-999"], "prima ne vedeva uno solo, e stampava che andava tutto bene");
});

test("un bloccante con una prova che ESEGUE non entra nel conto: il conto deve poter scendere", () => {
  const chiudibile = { ...nuovaGenerazione, id: "AR-997", verifica: { comando: "node cervello/test/misura-o-cieco.test.mjs" } };
  assert.deepEqual(bloccantiCiechi([chiudibile].map(classifica)), []);
});

test("sul cantiere VERO nessuna scheda resta senza gravità (il punto che chiama, non solo la funzione)", () => {
  const r = spawnSync(process.execPath, [join(REPO, "cervello", "cantiere-prove.mjs"), "--dry", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    timeout: 120_000,
  });
  const j = JSON.parse(r.stdout);
  const senza = j.voci.filter((v) => !v.gravita);
  assert.deepEqual(
    senza.map((v) => v.id),
    [],
    "se `classifica` tornasse a copiare solo `d.gravita`, qui ricomparirebbero le schede della generazione nuova",
  );
  assert.ok(j.voci.length > 0, "un elenco vuoto renderebbe questa prova vacua");
});
