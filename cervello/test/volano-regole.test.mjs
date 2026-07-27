// AR-177 / AR-180 — il segnale che dice «la macchina impara» dev'essere capace di dire di no.
//
// Il difetto peggiore di tutta la radiografia, perché riguarda il numero con cui la macchina si
// giudica. `loop_chiude` — il segnale che dice a Nicola «mi controllo, imparo e mi correggo» — era
// costruito in modo da NON POTER MAI essere falso:
//
//   ① `prova_business` contava come prova anche le previsioni APERTE e gli esperimenti APERTI;
//   ② un cancello hard del giro OBBLIGA a tenere sempre almeno un esperimento aperto;
//   ③ quindi bastava avere un'intenzione per dichiarare chiuso il loop.
//
// Aprire una previsione non è chiuderla: è il contrario. E dall'altro lato (AR-180) la sonda contava
// come prova proprio le righe che `calibrazione.mjs` dichiara «previsioni non sono mai state» — 36 su
// 42, nate pescando il primo numero di una frase di diario — perché rifaceva il filtro a mano invece
// di riusare quello del modulo che quel registro lo possiede.
//
// Qui si eseguono le funzioni VERE. Il primo caso è il metro: con la logica vecchia era `true`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const { previsioneValida, nonEUnaPrevisione, provaBusiness, loopChiude, loopVivo } = await import(
  join(QUI, "..", "volano-regole.mjs")
);

// ── AR-177: la prova che non poteva essere falsa ─────────────────────────────
test("il caso che ha rotto: avere un esperimento APERTO non è una prova che il loop chiude", () => {
  // Con la logica vecchia questa era `true`, e siccome un cancello del giro obbliga a tenerne sempre
  // uno aperto, era true per sempre. Il segnale non poteva dire di no nemmeno in teoria.
  assert.equal(provaBusiness({ calibrazionePiena: false, esperimentiMisurati: false }), false);
});

test("solo roba CHIUSA e misurata conta come prova", () => {
  assert.equal(provaBusiness({ calibrazionePiena: true }), true, "una previsione chiusa con esito");
  assert.equal(provaBusiness({ esperimentiMisurati: true }), true, "un esperimento misurato");
});

test("il caso che ha rotto: senza niente di chiuso, il loop NON chiude", () => {
  assert.equal(loopChiude({ tasso: 0.18, provaBusiness: false, provaArchitettura: false }), false);
});

test("il tasso da solo non basta: era il numero che l'LLM si scriveva da sé (AR-013)", () => {
  assert.equal(loopChiude({ tasso: 0.9, provaBusiness: false, provaArchitettura: false }), false);
});

test("tasso a zero: nemmeno con le prove il loop chiude", () => {
  assert.equal(loopChiude({ tasso: 0, provaBusiness: true, provaArchitettura: true }), false);
});

test("quando c'è davvero una chiusura misurata, dice sì", () => {
  assert.equal(loopChiude({ tasso: 0.18, provaBusiness: true }), true);
  assert.equal(loopChiude({ tasso: 0.18, provaArchitettura: true }), true, "un difetto chiuso è una prova architetturale");
});

test("l'informazione delle aperte non si butta: diventa un segnale SEPARATO", () => {
  // «Non chiude» con dieci previsioni aperte è vero ma incompleto, e un segnale incompleto viene
  // ignorato. Solo, questa è la prova che la macchina ci sta PROVANDO, non che sta imparando.
  assert.equal(loopVivo({ intenzioniAperte: 3 }), true, "c'è attività");
  assert.equal(loopChiude({ tasso: 0.18, provaBusiness: false, provaArchitettura: false }), false, "…ma non chiude");
  assert.equal(loopVivo({ intenzioniAperte: 0 }), false, "niente aperto e niente chiuso: fermo");
});

// ── AR-180: contare come prova le righe che previsioni non sono ──────────────
test("il caso che ha rotto: le righe `esito_loop` non contano come previsioni", () => {
  // 36 righe su 42 del registro sono nate pescando il primo numero di una frase di diario. Non si
  // cancellano — la storia non si riscrive — ma non sono prove di niente.
  assert.equal(nonEUnaPrevisione({ metrica: "esito_loop" }), true);
  assert.equal(previsioneValida({ metrica: "esito_loop", stato: "azzeccata" }), false);
});

test("una previsione vera conta", () => {
  assert.equal(previsioneValida({ metrica: "ordini_pagati", stato: "azzeccata", creato: "2026-07-01", chiuso_il: "2026-07-14" }), true);
  assert.equal(previsioneValida({ metrica: "ordini_pagati", stato: "mancata" }), true, "sbagliare È imparare");
});

test("una previsione ancora aperta non è una prova di apprendimento", () => {
  assert.equal(previsioneValida({ metrica: "x", stato: "aperta" }), false);
});

test("le righe banali e quelle misurate da un sensore CIECO non contano", () => {
  assert.equal(previsioneValida({ metrica: "x", stato: "azzeccata", banale: true }), false);
  assert.equal(previsioneValida({ metrica: "x", stato: "azzeccata", sensore_stato: "cieco" }), false, "misurata da uno strumento che non vedeva");
});

test("una previsione nata già chiusa è un verbale scritto a posteriori, non una previsione", () => {
  const t = "2026-07-27 10:00";
  assert.equal(previsioneValida({ metrica: "x", stato: "azzeccata", creato: t, chiuso_il: t }), false);
});

test("dati storti non diventano prove per sbaglio", () => {
  for (const e of [null, undefined, {}, { stato: "azzeccata" }]) {
    const v = previsioneValida(e);
    if (e && e.stato === "azzeccata") assert.equal(v, true, "una riga minimale ma valida passa");
    else assert.equal(v, false, `${JSON.stringify(e)} non è una prova`);
  }
});

// ── il cablaggio ─────────────────────────────────────────────────────────────
test("la sonda non conta più le APERTE come prova", () => {
  const src = readFileSync(join(QUI, "..", "sonda-volano.mjs"), "utf8");
  assert.doesNotMatch(src, /provaBusiness\s*=\s*\n?\s*calibrazionePiena\s*\|\|[\s\S]{0,120}esperimentiAperti\.length > 0/,
    "le aperte erano dentro la prova: il segnale non poteva dire di no");
  assert.match(src, /calcolaProvaBusiness\(\{ calibrazionePiena, esperimentiMisurati \}\)/, "la prova dev'essere solo chiuso+misurato");
  assert.match(src, /previsioneValida/, "il filtro dev'essere quello condiviso, non rifatto a mano");
  assert.match(src, /loop_vivo/, "le aperte devono restare come segnale separato, non sparire");
});

test("la regola sta in UN posto: calibrazione la importa, non la ricopia", () => {
  const src = readFileSync(join(QUI, "..", "calibrazione.mjs"), "utf8");
  assert.match(src, /from "\.\/volano-regole\.mjs"/, "due copie di un metro non sono un metro");
  assert.doesNotMatch(src, /export function nonEUnaPrevisione/, "la seconda copia è quella che ha fatto divergere sonda e calibrazione");
});

test("importare calibrazione.mjs non deve ESEGUIRLA", async () => {
  // Trovato costruendo questo lotto: senza la guardia `import.meta.url`, importarla lanciava il
  // comando di default e RISCRIVEVA calibrazione.json — un modulo che muta la memoria solo perché lo
  // importi. Il fix prescritto per AR-180 diceva proprio «importa nonEUnaPrevisione da
  // calibrazione.mjs»: applicato alla lettera, ogni sonda avrebbe riscritto la calibrazione.
  const src = readFileSync(join(QUI, "..", "calibrazione.mjs"), "utf8");
  assert.match(src, /if \(import\.meta\.url === `file:\/\/\$\{process\.argv\[1\]\}`\)/, "manca la guardia del CLI");
});
