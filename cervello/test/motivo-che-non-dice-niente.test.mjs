#!/usr/bin/env node
// 🩺 IL REFERTO DEVE NOMINARE LA COSA ROTTA, NON LA PARENTESI GRAFFA.
//
// IL CASO VERO, 13→14 agosto 2026. Per due giorni il referto della visita ha detto a Nicola:
//
//     ### Token, push e allineamento git
//     l'automazione ha un controllo fallito — { · "esito": "errore",
//
// Il motivo del guasto era una parentesi graffa. Sei dei controlli della visita interrogano un
// guardiano con `--json`, e di quella risposta si stampavano le prime due righe utili: `{` e
// `"esito": "errore",` — cioè le uniche due che non dicono niente. Il riassunto stava tre righe
// sotto, nel campo `sintesi`: «1 FALLITI: token ad-mycity».
//
// PERCHÉ NON È ESTETICA. Il referto serve ad AGIRE. «Un controllo fallito» manda chi legge a
// cercare quale, e quel rosso è rimasto due giorni senza che nessuno sapesse cosa riparare — io
// compresa: l'ho inseguito per due check-in prima di andare a leggere il JSON a mano. Un verdetto
// che non nomina la cosa rotta costa quanto un verdetto assente, con in più la faccia di uno che
// ha guardato.
import { test } from "node:test";
import assert from "node:assert/strict";
import { motivoDelGuasto } from "../salute.mjs";

test("da una risposta JSON prende il riassunto, non la prima riga", () => {
  const risposta = JSON.stringify(
    { esito: "errore", sintesi: "1 FALLITI: token ad-mycity", quando: "2026-08-14 16:49", checks: [] },
    null,
    2
  );
  assert.equal(motivoDelGuasto(risposta), "1 FALLITI: token ad-mycity");
  assert.doesNotMatch(motivoDelGuasto(risposta), /^\{/, "la parentesi graffa non è un motivo");
});

test("se manca «sintesi» cerca gli altri modi in cui un guardiano dice il perché", () => {
  assert.equal(motivoDelGuasto('{"esito":"errore","motivo":"il token è scaduto"}'), "il token è scaduto");
  assert.equal(motivoDelGuasto('{"perche":"nessun sensore risponde"}'), "nessun sensore risponde");
  assert.equal(motivoDelGuasto('[{"errore":"connessione rifiutata"}]'), "connessione rifiutata", "anche se la risposta è una lista");
});

test("una risposta di testo normale resta come prima", () => {
  assert.equal(motivoDelGuasto("qualcosa è rotto\nseconda riga"), "qualcosa è rotto · seconda riga");
});

test("un JSON troncato non fa perdere il poco che c'è", () => {
  // Un guardiano ucciso a metà scrive JSON monco: meglio due righe storte che il silenzio.
  const monco = '{\n  "esito": "errore",\n  "sintesi": "3 FALLITI: worker';
  const m = motivoDelGuasto(monco);
  assert.ok(m.length > 0, "non deve restare muto");
  assert.match(m, /esito|sintesi|\{/, "ripiega sulle prime righe e non inventa niente");
});

test("il verdetto vero non contiene più la parentesi graffa come motivo", () => {
  // La forma che Nicola leggeva davvero nel referto del 14/8.
  const vecchio = "l'automazione ha un controllo fallito — { · \"esito\": \"errore\",";
  const nuovo = `l'automazione ha un controllo fallito — ${motivoDelGuasto('{"esito":"errore","sintesi":"1 FALLITI: token ad-mycity"}')}`;
  assert.notEqual(nuovo, vecchio);
  assert.match(nuovo, /token ad-mycity/, "chi legge deve sapere COSA riparare");
});
