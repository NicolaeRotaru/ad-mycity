// 🧪 LA PROVA CHE IL CONTROLLO SUI WORKFLOW VEDA DAVVERO (AR-777).
//
// Il difetto: tutti e sei i file in `.claude/workflows/` vengono rifiutati dal motore prima di
// eseguire una riga, perché aprono con degli `import` e mettono `export const meta` in quarta
// posizione. Il motore pretende `meta` come PRIMA istruzione e non accetta nessun import, né
// statico né dinamico.
//
// Il guardiano che lo misura è `cervello/workflow-partono.mjs`. Questa prova non guarda i sei file
// veri — quelli oggi sono tutti rossi, ed è giusto così finché il difetto è aperto. Guarda la
// funzione che decide, `partirebbe()`, e le mette davanti i casi che contano: lo script buono, lo
// script con l'import in cima, e lo script che apre con dei commenti (che il motore salta, quindi
// non devono farlo bocciare).
//
// Serve a impedire il modo più facile di far sparire il difetto senza ripararlo: allargare la
// funzione finché dice sì a tutto. Se `partirebbe()` diventa cieca, questa prova diventa rossa.

import { test } from "node:test";
import assert from "node:assert/strict";
import { partirebbe } from "../workflow-partono.mjs";

test("lo script che apre con meta parte", () => {
  assert.equal(partirebbe("export const meta = { name: 'x' }\nphase('a')\n"), true);
});

test("i commenti e le righe vuote in cima non lo bocciano: il motore li salta", () => {
  assert.equal(partirebbe("// una nota\n\n// un'altra\nexport const meta = { name: 'x' }\n"), true);
  assert.equal(partirebbe("/* blocco */\nexport const meta = { name: 'x' }\n"), true);
});

test("l'import statico sopra meta lo boccia: è il difetto vero dei sei file", () => {
  assert.equal(
    partirebbe("import { promptSenior } from '../../cervello/prompt-senior.mjs'\nexport const meta = { name: 'x' }\n"),
    false,
  );
});

test("qualunque altra istruzione sopra meta lo boccia", () => {
  assert.equal(partirebbe("const REPO = '/tmp'\nexport const meta = { name: 'x' }\n"), false);
  assert.equal(partirebbe("phase('a')\nexport const meta = { name: 'x' }\n"), false);
});
