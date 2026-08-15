#!/usr/bin/env node
// 🧪 AR-707 — IL BANCO CHE ROMPE I FIX DEVE SAPER DIRE «NON HO MISURATO».
//
// Il caso vero, del 15/8. In CI non c'è nessun browser, quindi `c4-schermo-coda.test.mjs` fa la cosa
// giusta: dichiara il salto («1..0 # SKIP nessun browser su questa macchina») e se ne va con zero.
// Il banco delle mutazioni leggeva solo quel numero, e zero per lui voleva dire una cosa sola — «il
// test è rimasto verde col fix rotto». Sul referto compariva:
//
//     ❌ AR-613 — la prova NON dimostra il suo fix: rompendolo il test resta verde.
//
// Falso. Quella prova diventa rossa eccome: l'ho rotta e l'ho vista diventare rossa, su una macchina
// che il Pannello lo sa aprire. Il banco stava accusando un innocente, e mandava chi legge a
// indagare sul fix invece che sull'ambiente.
//
// E c'era il verso opposto, peggiore: un test AMMAZZATO (timeout) torna `status === null`, e
// `null !== 0` è vero. Il banco lo contava «diventato rosso, la prova morde». Cioè la mutazione più
// lenta si comprava il verde smettendo di rispondere.
//
// Una radice sola, che vale ben oltre questo file: **il codice d'uscita descrive una corsa
// avvenuta. Prima di leggerlo bisogna sapere se la corsa c'è stata.**
//
// Qui si prova la decisione, non il giro: `verdettoCorsa` riceve com'è andata e risponde una delle
// tre parole di casa. Provarla dal fuori vorrebbe dire disinstallare un browser per davvero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { verdettoCorsa, haDichiaratoDiNonGuardare } from "../non-vacuita.mjs";

// L'uscita vera di `node cervello/test/c4-schermo-coda.test.mjs` su una macchina senza browser,
// copiata com'è. È il caso che ha generato il difetto: se cambia la forma, questo test lo dice.
const SALTO_DICHIARATO = `TAP version 13
1..0 # SKIP nessun browser su questa macchina: i tre difetti di schermo (AR-613 comandi annidati, AR-614 tema scuro, AR-673 salto del collegamento) NON sono stati verificati qui
`;

const CORSA_VERDE = `TAP version 13
# Subtest: AR-613 · nessun comando vive dentro un altro comando
ok 1 - AR-613 · nessun comando vive dentro un altro comando
1..1
# tests 1
# pass 1
# fail 0
`;

const CORSA_ROSSA = `TAP version 13
not ok 1 - AR-613 · nessun comando vive dentro un altro comando
1..1
# tests 1
# pass 0
# fail 1
`;

test("LA REGOLA CHE CONTA: chi ha dichiarato di non poter guardare è ⚪, non ❌", () => {
  const v = verdettoCorsa({ status: 0, uscita: SALTO_DICHIARATO });
  assert.equal(v.verdetto, "cieco", "esce zero perché si è tirato indietro, non perché col fix rotto va tutto bene");
  assert.match(v.perche, /non poter guardare|strumento/i, "il motivo deve dire che manca lo strumento, non accusare la prova");
});

test("un test AMMAZZATO non è un test diventato rosso: ⚪, non ✅", () => {
  // Il verso pericoloso: `status === null` passava per «rosso», quindi la mutazione più lenta
  // comprava il verde smettendo di rispondere.
  const v = verdettoCorsa({ status: null, signal: "SIGTERM", uscita: "" });
  assert.equal(v.verdetto, "cieco");
  assert.match(v.perche, /SIGTERM/, "chi legge deve sapere che è stato ammazzato, e da cosa");
});

test("la corsa che è avvenuta e ha detto sì col fix rotto resta ❌ vacua", () => {
  assert.equal(verdettoCorsa({ status: 0, uscita: CORSA_VERDE }).verdetto, "vacua");
});

test("la corsa che è diventata rossa resta ✅: la prova difende il suo fix", () => {
  assert.equal(verdettoCorsa({ status: 1, uscita: CORSA_ROSSA }).verdetto, "ok");
});

test("saltati TUTTI i casi è cieco quanto non averne registrato nessuno", () => {
  const tuttiSaltati = `TAP version 13
1..2
# tests 2
# pass 0
# fail 0
# skipped 2
`;
  assert.equal(verdettoCorsa({ status: 0, uscita: tuttiSaltati }).verdetto, "cieco");
});

test("un rosso con dentro qualche caso saltato resta un rosso, non diventa cieco", () => {
  // Il contrario dell'errore che si sta curando: allargare troppo la definizione di «cieco»
  // trasformerebbe questo strumento nel modo più comodo per non farsi bocciare mai.
  const rossoConSalti = `TAP version 13
1..3
# tests 3
# pass 1
# fail 1
# skipped 1
`;
  assert.equal(verdettoCorsa({ status: 1, uscita: rossoConSalti }).verdetto, "ok");
  assert.equal(haDichiaratoDiNonGuardare(rossoConSalti), false);
});

test("un'uscita muta non è un salto dichiarato: chi tace col fix rotto è vacuo", () => {
  assert.equal(haDichiaratoDiNonGuardare(""), false);
  assert.equal(verdettoCorsa({ status: 0, uscita: "" }).verdetto, "vacua");
});
