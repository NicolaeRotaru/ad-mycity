#!/usr/bin/env node
// AR-642 — nella sessione cloud il cancello dello stop perdeva due controlli SENZA dire di essere cieco.
//
// Su un clone superficiale la base `origin/main` ESISTE come riferimento, ma
// `git diff origin/main...HEAD` fallisce («no merge base»). I catch tornavano `null` e:
//   · il solo cieco dichiarato MENTIVA («non ho trovato un ramo con cui confrontarmi») — il ramo c'era;
//   · gli allarmi nelle consegne già committate e la coda nel perimetro venivano SALTATI in silenzio;
//   · il controllo sui testi ripiegava sui soli file del disco, sempre in silenzio.
//
// La decisione ora è una funzione pura esportata (`ciechiPerDiffNonCalcolabile`): qui la si ESEGUE
// passando esattamente i `null` che il catch di git produce — la simulazione dell'errore git al
// livello in cui la decisione vive.

import assert from "node:assert/strict";
import { ciechiPerDiffNonCalcolabile } from "../cancello-stop.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// Gli esiti di un giro NORMALE: tutto misurato (array, anche vuoti = «ho guardato, zero trovato»).
const tuttoMisurato = {
  base: "origin/main",
  committati: [],
  righeQuaderni: [],
  perimetroDa: "origin/main",
  consegneModificate: [],
  codaNelPerimetro: [],
  testiSoloDisco: false,
};

prova("giro normale: nessun cieco (il fix non è un rosso perenne)", () => {
  assert.deepEqual(ciechiPerDiffNonCalcolabile(tuttoMisurato), []);
});

prova("il caso che ha rotto: base PRESENTE ma diff non calcolabile → cieco dichiarato, senza mentire", () => {
  // Il clone superficiale: ogni catch di git ha prodotto null.
  const ciechi = ciechiPerDiffNonCalcolabile({
    base: "origin/main",
    committati: null,
    righeQuaderni: null,
    perimetroDa: "origin/main",
    consegneModificate: null,
    codaNelPerimetro: null,
    testiSoloDisco: true,
  });
  assert.ok(ciechi.length >= 3, `servono almeno 3 dichiarazioni (esito, controlli saltati, testi): ${JSON.stringify(ciechi)}`);
  const tutto = ciechi.join("\n");
  // Non deve MENTIRE: il ramo c'era, era il diff a non essere calcolabile.
  assert.doesNotMatch(tutto, /non ho trovato un ramo/, "il messaggio vecchio accusava un ramo assente che invece c'era");
  assert.match(tutto, /non è calcolabile/);
  // I due controlli prima saltati in silenzio ora si NOMINANO.
  assert.match(tutto, /consegne già committate/, "cieco sugli allarmi nelle consegne committate");
  assert.match(tutto, /coda già toccata/, "cieco sulla coda nel perimetro");
  // E anche il ripiego silenzioso sui testi del solo disco si dichiara.
  assert.match(tutto, /solo i file non ancora committati/i);
});

prova("i due controlli sono indipendenti: solo le consegne mute → si nomina solo quella perdita", () => {
  const ciechi = ciechiPerDiffNonCalcolabile({
    ...tuttoMisurato,
    consegneModificate: null,
  });
  const tutto = ciechi.join("\n");
  assert.match(tutto, /consegne già committate/);
  assert.doesNotMatch(tutto, /coda già toccata/, "la coda È stata misurata: accusarla sarebbe rumore");
});

prova("nessuna base trovata: resta il cieco storico (né origin/main né main)", () => {
  const ciechi = ciechiPerDiffNonCalcolabile({ base: null, committati: null, righeQuaderni: null, perimetroDa: null });
  assert.equal(ciechi.length, 1);
  assert.match(ciechi[0], /non ho trovato un ramo/);
});

prova("senza perimetro non si accusa il perimetro: consegne/coda null con perimetroDa null → silenzio su quelle", () => {
  // perimetro.da null = quei due controlli non ERANO dovuti: dichiararli ciechi sarebbe accusare
  // l'assenza di un lavoro che non c'è stato (stessa taratura di AR-506).
  const ciechi = ciechiPerDiffNonCalcolabile({ base: "origin/main", committati: [], righeQuaderni: [], perimetroDa: null, consegneModificate: null, codaNelPerimetro: null });
  assert.deepEqual(ciechi, []);
});

// ── esito ────────────────────────────────────────────────────────────────────
let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
