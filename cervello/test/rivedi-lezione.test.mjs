// =============================================================================
// Rivedere una lezione: rinnovarla o ritirarla, ma mai a vuoto
// =============================================================================
// Il 20/8 la CI e' diventata rossa perche' diciotto lezioni stavano per morire
// di sola anzianita'. La scorciatoia era ovvia: riconfermarle tutte e il rosso
// spariva. Sarebbe stato spegnere la spia invece di riparare il guasto — la
// stessa forma dell'errore del 19/8, quando avevo tolto il tetto sulle visite
// credendo di riparare un difetto.
//
// Questo file tiene ferma la regola che lo impedisce: una conferma senza un
// perche' e senza una prova viene RIFIUTATA. Se qualcuno domani ammorbidisce
// quel controllo per far tornare verde un giro, qui diventa rosso.
// =============================================================================

import test from "node:test";
import assert from "node:assert/strict";
import { decidi, applica, FIDUCIA_RICONFERMATA } from "../rivedi-lezione.mjs";

const ADESSO = "2026-08-20T09:00:00.000Z";
const lezioneFinta = () => ({ id: "L-prova", stato: "attiva", confidenza: 0.33, ultima_conferma: "2026-07-01" });

test("una conferma SENZA prova viene rifiutata", () => {
  const e = decidi({ verbo: "conferma", lezione: lezioneFinta(), perche: "e' ancora vera, l'ho vista stamattina", prova: "", adesso: ADESSO });
  assert.equal(e.ok, false, "senza prova la conferma non deve passare: sarebbe spegnere la spia");
  assert.match(e.motivo, /prova/);
});

test("una conferma SENZA perche' viene rifiutata", () => {
  const e = decidi({ verbo: "conferma", lezione: lezioneFinta(), perche: "ok", prova: "CLAUDE.md", adesso: ADESSO });
  assert.equal(e.ok, false);
  assert.match(e.motivo, /perche/);
});

test("con perche' e prova, la lezione torna viva e la fiducia risale", () => {
  const l = lezioneFinta();
  const e = decidi({ verbo: "conferma", lezione: l, perche: "la regola e' scritta nel mansionario e vale ogni giorno", prova: "CLAUDE.md riga 12", adesso: ADESSO });
  assert.equal(e.ok, true);
  applica(l, e);
  assert.equal(l.confidenza, FIDUCIA_RICONFERMATA);
  assert.equal(l.ultima_conferma, ADESSO);
  assert.equal(l.decaduto_step_il, null, "il contatore dei passi riparte, altrimenti muore lo stesso");
});

test("ritirare e' un altro stato: dimenticare per inerzia non e' ritirare per decisione", () => {
  const l = lezioneFinta();
  const e = decidi({ verbo: "ritira", lezione: l, perche: "parla di un ramo che e' andato in pensione a luglio", adesso: ADESSO });
  assert.equal(e.ok, true);
  applica(l, e);
  assert.equal(l.stato, "ritirata");
  assert.notEqual(l.stato, "decaduta", "«ritirata» dice che qualcuno ha deciso; «decaduta» dice che nessuno se n'e' accorto");
});

test("anche ritirare vuole un perche' scritto", () => {
  const e = decidi({ verbo: "ritira", lezione: lezioneFinta(), perche: "vecchia", adesso: ADESSO });
  assert.equal(e.ok, false);
});

test("ogni revisione lascia la sua riga: si puo' sempre tornare indietro e capire", () => {
  const l = lezioneFinta();
  applica(l, decidi({ verbo: "conferma", lezione: l, perche: "vale ancora, la uso di continuo nel lavoro", prova: "cervello/giro.md", adesso: ADESSO }));
  assert.equal(l.revisioni.length, 1);
  assert.equal(l.revisioni[0].verbo, "conferma");
  assert.match(l.revisioni[0].prova, /giro\.md/);
});

test("una lezione che non esiste non si conferma", () => {
  assert.equal(decidi({ verbo: "conferma", lezione: null, perche: "x".repeat(30), prova: "y", adesso: ADESSO }).ok, false);
});
