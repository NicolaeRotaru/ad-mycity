// Round 3 (2026-07-25) — chiudere un difetto non deve poter ABBASSARE il voto salute.
//
// Il difetto trovato mentre si chiudevano AR-109/AR-110: auto-fix, dopo ogni chiusura, appendeva
// allo storico un voto letto da `auto-radiografia.json → voto_salute_architettura`. Oggi quel
// campo vale 0 (è la salute "pending-merge", con floor 0, non il voto architettura che lo storico
// traccia a 43). Risultato misurato: chiusi 2 freni di sicurezza → la pagella passava da 43/100 a
// 0/100 e il gate di regressione bocciava il lavoro. Cioè la macchina puniva col voto esattamente
// il comportamento che il programma "intelligenza" le sta chiedendo.
//
// AR-096 aveva già chiuso la salita (il vecchio +2 fisso a ogni chiusura). Restava aperta la
// discesa, che è peggio: gonfiare il voto è vanità, sgonfiarlo per un campo letto male fa scartare
// fix veri come se fossero regressioni.

import { test } from "node:test";
import assert from "node:assert/strict";
import { votoSaluteDaRegistrare } from "../auto-fix.mjs";

const SERIE = [
  { data: "2026-07-23", voto_salute: 41, tipo: "radiografia" },
  { data: "2026-07-24", voto_salute: 43, tipo: "review" },
  { data: "2026-07-24", voto_salute: 43, tipo: "sonda" },
];

test("una misura vera della radiografia vince sempre", () => {
  const r = votoSaluteDaRegistrare({ voto_salute_architettura: 58 }, SERIE);
  assert.deepEqual(r, { voto: 58, misurato: true });
  // Vale anche quando la misura vera è PEGGIORE dell'ultima nota: il voto deve poter scendere,
  // purché qualcuno l'abbia misurato davvero.
  assert.deepEqual(votoSaluteDaRegistrare({ voto_salute_architettura: 12 }, SERIE), { voto: 12, misurato: true });
});

test("⬇️ il caso che ha fatto danno: radiografia a 0 ⇒ si riporta 43, non si azzera", () => {
  const r = votoSaluteDaRegistrare({ voto_salute_architettura: 0 }, SERIE);
  assert.equal(r.voto, 43, "il voto resta l'ultimo misurato davvero");
  assert.equal(r.misurato, false, "e viene marcato come non ri-misurato, non spacciato per misura");
});

test("campo assente, nullo o non numerico ⇒ si riporta l'ultimo noto", () => {
  for (const rad of [{}, { voto_salute_architettura: null }, { voto_salute_architettura: "boh" }, undefined]) {
    const r = votoSaluteDaRegistrare(rad, SERIE);
    assert.equal(r.voto, 43, `rad=${JSON.stringify(rad)}`);
    assert.equal(r.misurato, false);
  }
});

test("salta le righe a 0 già presenti nello storico e risale all'ultima misura vera", () => {
  // Le chiusure precedenti hanno già sporcato lo storico con degli 0: non ci si deve fermare lì.
  const sporca = [...SERIE, { data: "2026-07-25", voto_salute: 0, tipo: "auto-fix" }];
  assert.equal(votoSaluteDaRegistrare({}, sporca).voto, 43);
});

test("storico vuoto ⇒ 0, ma dichiarato non misurato (nessun voto inventato)", () => {
  assert.deepEqual(votoSaluteDaRegistrare({}, []), { voto: 0, misurato: false });
});
