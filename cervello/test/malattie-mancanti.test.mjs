// Le prove del guardiano che fa crescere il registro delle malattie (AR-499).
//
// Il difetto che cura non è un bug: è un registro che sta fermo. Nato il 30/7 con 7 forme, il 3/8 ne
// aveva ancora 7 mentre il cantiere passava da 400 a 419 difetti — e il sorvegliante, che su quel
// registro poggia il controllo ①, poteva riconoscere solo le forme del giorno in cui è nato.
//
// Il caso che conta più di tutti è il terzo: `non-pattern-izzabile` è una risposta legittima e
// necessaria — certe forme vivono nel diff intero o nella storia del ramo, non in una riga — ma se
// bastasse la parola diventerebbe il modo educato di non rispondere, cioè la porta di AR-338.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { malattieMancanti, classiDelSorvegliante, PERCHE_MIN, NON_PATTERN } from "../malattie-mancanti.mjs";

const MALATTIE = [{ id: "errore-ingoiato" }, { id: "programma-che-parte-importando" }];
const CLASSI = ["difesa-rimossa", "soglia-allentata"];

test("IL CASO VERO: una forma tornata che non dice quale forma sia viene fermata", () => {
  const { scoperte } = malattieMancanti(
    [{ id: "AR-445", nato_come: "regressione", titolo: "Importare un modulo ne esegue il programma" }],
    MALATTIE,
    CLASSI,
  );
  assert.equal(scoperte.length, 1);
  assert.match(scoperte[0].motivo, /quale forma/);
});

test("una scoperta non è una forma tornata: solo le regressioni devono rispondere", () => {
  const { scoperte } = malattieMancanti([{ id: "AR-1", nato_come: "scoperta" }, { id: "AR-2", nato_come: "nuovo-lavoro" }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 0, "chiedere il nome della forma a ogni difetto renderebbe il campo un rito");
});

test("nominare una malattia censita basta", () => {
  const { scoperte } = malattieMancanti([{ id: "AR-445", nato_come: "regressione", malattia: "programma-che-parte-importando" }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 0);
});

test("nominare un controllo del sorvegliante basta: certe forme sono fatti sul delta, non pattern", () => {
  const { scoperte } = malattieMancanti([{ id: "AR-338", nato_come: "regressione", malattia: "difesa-rimossa" }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 0);
});

test("un nome inventato NON basta: senza qualcuno che la riconosca, la risposta non è verificabile", () => {
  const { scoperte } = malattieMancanti([{ id: "AR-9", nato_come: "regressione", malattia: "quella-brutta-cosa" }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 1);
  assert.match(scoperte[0].motivo, /non è né una malattia censita né un controllo/);
});

test("«non-pattern-izzabile» SENZA perché è un'esenzione travestita (AR-338)", () => {
  const { scoperte } = malattieMancanti([{ id: "AR-448", nato_come: "regressione", malattia: NON_PATTERN }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 1, "se bastasse la parola, sarebbe il modo educato di non rispondere");
});

test("…e nemmeno con un perché di due parole: sotto la soglia è una scrollata di spalle scritta", () => {
  const corto = "x".repeat(PERCHE_MIN - 1);
  const { scoperte } = malattieMancanti([{ id: "AR-448", nato_come: "regressione", malattia: NON_PATTERN, malattia_perche: corto }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 1);
  assert.match(scoperte[0].motivo, /caratteri/);
});

test("«non-pattern-izzabile» col perché scritto passa: è debito dichiarato, non silenzio", () => {
  const { scoperte } = malattieMancanti(
    [
      {
        id: "AR-448",
        nato_come: "regressione",
        malattia: NON_PATTERN,
        malattia_perche: "È una proprietà del diff intero, non di una riga: la copre forma-json.mjs a ogni consegna.",
      },
    ],
    MALATTIE,
    CLASSI,
  );
  assert.equal(scoperte.length, 0);
});

test("le malattie che nessun difetto nomina si dicono, ma non bocciano", () => {
  const { scoperte, orfane } = malattieMancanti([{ id: "AR-1", nato_come: "regressione", malattia: "errore-ingoiato" }], MALATTIE, CLASSI);
  assert.equal(scoperte.length, 0, "una malattia censita per prevenzione non è un errore");
  assert.deepEqual(orfane, ["programma-che-parte-importando"]);
});

test("le classi si LEGGONO dal codice del sorvegliante: un elenco a mano invecchierebbe al primo controllo nuovo", () => {
  const finto = `
    voci.push({ classe: "difesa-rimossa", gravita: "grave" });
    voci.push({ classe: "raggio", gravita: "informativa" });
    voci.push({ classe: "difesa-rimossa", gravita: "grave" });
  `;
  assert.deepEqual(classiDelSorvegliante(finto), ["difesa-rimossa", "raggio"], "senza duplicati e ordinate");
});

test("il sorvegliante VERO espone i controlli che questo guardiano si aspetta di poter nominare", () => {
  // Non una fixture: il file vero. Se domani un controllo cambia nome, questa prova lo dice — mentre
  // una fixture continuerebbe a passare mentendo, che è il difetto di fondo di tutto questo lotto.
  const sorgente = readFileSync(new URL("../sorvegliante.mjs", import.meta.url), "utf8");
  const classi = classiDelSorvegliante(sorgente);
  for (const attesa of ["difesa-rimossa", "soglia-allentata", "esenzione-aggiunta", "deriva"]) {
    assert.ok(classi.includes(attesa), `il sorvegliante deve poter emettere «${attesa}»`);
  }
});
