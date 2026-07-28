#!/usr/bin/env node
// AR-221 — sotto le cose da fare c'è un muro di difetti già chiusi che non si può richiudere.
//
// Nella scheda Radiografia, sotto la lista degli aperti — quella che serve — c'erano **135 righe** di
// difetti chiusi, piatte, senza accordion e senza tetto. Su un telefono significa scorrere un muro
// per arrivare in fondo, e non c'è modo di richiuderlo.
//
// È una preferenza che Nicola ha già espresso, e proprio su questa schermata: «liste lunghe di card
// nel Pannello = accordion chiuso di default, non tutte espanse insieme» (chat 25/7 ~17:13, sul
// Cantiere difetti). Il pattern esiste già in casa, due blocchi più su nello stesso file.
//
// Prova separata da quella di AR-250 di proposito. I due difetti vivono sulla stessa schermata e la
// stessa cura li tocca entrambi, ma una prova sola che li copre tutti e due chiuderebbe anche quello
// non riparato — è la debolezza ② di come-riparo, pagata su AR-254.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

// ── AR-221: il muro a video ─────────────────────────────────────────────────

prova("il caso che ha rotto: i chiusi a video sono in un accordion CHIUSO di default", () => {
  const src = readFileSync(join(REPO, "pannello/src/components/cervello/RadiografiaDiSe.tsx"), "utf8");
  const i = src.indexOf("group/chiusi");
  assert.ok(i > 0, "il blocco dei chiusi dev'essere un <details>, non un muro di righe");
  const blocco = src.slice(i - 400, i + 900);
  assert.doesNotMatch(blocco, /<details[^>]*\bopen\b/, "chiuso di default: è la preferenza di Nicola sulle liste lunghe");
  assert.match(blocco, /min-h-\[44px\]/, "il summary dev'essere centrabile col pollice");
  assert.match(blocco, /già chiusi/, "e dire quanti sono senza doverlo aprire");
});

prova("il totale a video viene dai META, non dalle righe ricevute", () => {
  // Contare le righe direbbe «40 chiusi» quando sono 135: il troncamento diventerebbe una bugia
  // proprio nel punto che questo lotto sta ripulendo.
  const src = readFileSync(join(REPO, "pannello/src/components/cervello/RadiografiaDiSe.tsx"), "utf8");
  assert.match(src, /const chiusiTotali = typeof cantiere\?\.meta\?\.chiusi === "number"/);
  assert.match(src, /Mostrati i \{chiusi\.length\} più recenti su \{chiusiTotali\}/, "e quando tronca lo deve dire");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
