// ⏱️ IL CRONOMETRO PIÙ CORTO DELLA PROVA — AR-944.
//
// IL FATTO. Per due giorni la richiesta di unione 855 è rimasta rossa, e per due giorni ho letto il
// motivo come debito dichiarato: «sette difese di AR-797 non misurate». Non era debito. Le sette
// condividono UNA prova — `cervello/test/due-case.test.mjs` — e quella prova costa 498 secondi
// misurati, verde, 32 casi. Il tetto per una singola prova era 420. Le ammazzavo io, ogni volta,
// prima che arrivassero in fondo, e il referto diceva «il test non è arrivato in fondo (SIGTERM)».
//
// PERCHÉ NESSUNO SE N'È ACCORTO. Perché quella frase è vera per due cose opposte: una prova che si
// pianta, e un cronometro troppo corto. La prima si ripara aprendo il codice, la seconda alzando un
// numero — e il referto non aiutava a scegliere. Nicola l'ha detto tre volte, «la CI è rossa»,
// mentre io spiegavo che il rosso era onesto.
//
// LE DUE DIFESE, separate apposta perché coprono due buchi diversi:
//   ① il tetto sta sopra il costo MISURATO della prova più lenta che conosco;
//   ② un cronometro che ammazza DICE che è stato lui, col numero — così il giorno che il tetto
//      tornerà corto lo si legge nel referto invece di scoprirlo dopo due giorni.
// Provare solo la ① lascia il prossimo lettore al buio; provare solo la ② lascia il rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
// ⚠️ IL TETTO SI IMPORTA, non si ricopia. Al primo tentativo questa prova se lo riscriveva qui
// (`Number(process.env… || 700_000)`) — e allora la mutazione che riporta il tetto a 420 restava
// VERDE, perche' la prova guardava la propria copia e non il numero vero. E' la malattia
// `una-parola-con-due-padroni`, commessa dentro la prova che doveva curarne un'altra.
import { COSTI_MISURATI, TEMPO_MAX, ammazzataDalTetto, oltreIlTetto, verdettoCorsa } from "../non-vacuita.mjs";

test("① il tetto vero sta sopra ogni costo misurato: nessuna prova di casa muore per il cronometro", () => {
  const troppo = oltreIlTetto(TEMPO_MAX, COSTI_MISURATI);
  assert.deepEqual(
    troppo,
    [],
    `queste prove costano più del tetto e verranno ammazzate a metà, come le sette di AR-797:\n${troppo
      .map((t) => `  · ${t.prova}: ${Math.round(t.costo / 1000)} s contro un tetto di ${Math.round(t.tetto / 1000)} s`)
      .join("\n")}`,
  );
});

test("① col tetto di prima (420 s) la prova di due-case sfora: è il difetto, ricreato", () => {
  const troppo = oltreIlTetto(420_000, COSTI_MISURATI);
  assert.equal(troppo.length, 1, "il caso del 6/9 deve essere ancora riconoscibile da questo metro");
  assert.equal(troppo[0].prova, "cervello/test/due-case.test.mjs");
});

test("① i costi misurati non sono vuoti: un elenco vuoto renderebbe la ① sempre verde", () => {
  assert.ok(Object.keys(COSTI_MISURATI).length > 0, "senza nemmeno un costo dentro, `oltreIlTetto` non può fallire mai");
});

test("② una prova ammazzata al tetto pieno dice CHI l'ha ammazzata e con che numero", () => {
  const morta = verdettoCorsa({ status: null, signal: "SIGTERM" });
  assert.equal(morta.verdetto, "cieco", "un ammazzato resta ⚪, non diventa mai una prova che ha morso");
  const detto = ammazzataDalTetto(morta, { status: null, concesso: 700_000, tetto: 700_000, test: "cervello/test/due-case.test.mjs" });
  assert.match(detto.perche, /ammazzata IO/, `deve dire che è stato il cronometro: ${detto.perche}`);
  assert.match(detto.perche, /700 s/, `e col numero, se no non si sa quale alzare: ${detto.perche}`);
  assert.equal(detto.verdetto, "cieco", "la frase cambia, il verdetto no");
});

test("② quando il budget aveva già tagliato (meno del tetto) NON è il tetto a parlare: lì parla la sorella", () => {
  const morta = verdettoCorsa({ status: null, signal: "SIGTERM" });
  const detto = ammazzataDalTetto(morta, { status: null, concesso: 30_000, tetto: 700_000, test: "x" });
  assert.equal(detto.perche, morta.perche, "due frasi diverse per due cause diverse: qui la causa è il budget, non il tetto");
});

test("② non tocca MAI un verdetto che non sia ⚪: né una difesa che morde né una che non difende", () => {
  for (const verdetto of ["ok", "vacua"]) {
    const esito = { verdetto, perche: "intatto" };
    const dopo = ammazzataDalTetto(esito, { status: null, concesso: 700_000, tetto: 700_000, test: "x" });
    assert.deepEqual(dopo, esito, `«${verdetto}» non deve poter essere riscritto da una faccenda di cronometro`);
  }
});

test("② una prova che è arrivata in fondo non viene raccontata come ammazzata", () => {
  const viva = { verdetto: "cieco", perche: "un'altra ragione qualunque" };
  const dopo = ammazzataDalTetto(viva, { status: 0, concesso: 700_000, tetto: 700_000, test: "x" });
  assert.equal(dopo.perche, "un'altra ragione qualunque", "senza `status === null` nessuno l'ha ammazzata");
});
