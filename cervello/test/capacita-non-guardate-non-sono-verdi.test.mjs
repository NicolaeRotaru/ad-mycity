#!/usr/bin/env node
// AR-682 (la classe) — il guardiano delle capacità dava il verde anche quando non aveva aperto niente.
//
// LA RADICE. `elencaWorkflow` torna un elenco vuoto sia quando i workflow non ci sono sia quando la
// CARTELLA non c'è. Zero capacità trovate faceva zero drift, e zero drift stampava «✅ nessun drift:
// ogni capacità ha un comando» con uscita 0. Stessa cosa dall'altro lato: se COMANDI.md e CLAUDE.md
// non si leggono, «nessun comando evoca questa capacità» diventa vero per costruzione su TUTTE — un
// rosso finto invece di un verde finto, e comunque un verdetto che non è stato misurato. E un crash
// usciva 1, cioè finiva nella stessa casella di «ho trovato del drift»: chi legge l'esito non poteva
// più distinguere un guardiano morto da un guardiano che ha lavorato.
//
// COSA PROVA:
//   ① zero workflow guardati è ⚪, non ✅;
//   ② nessun registro leggibile è ⚪: senza i due documenti ogni capacità risulterebbe orfana;
//   ③ con del drift vero il verdetto è rosso, e con tutto a posto è verde — la cecità non è diventata
//      la risposta comoda;
//   ④ i tre stati vanno ai tre codici d'uscita di casa: 0 · 1 · 2.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/guardiano-capacita.mjs`, togliendo
// il controllo «zero cose guardate» (`const nienteDaGuardare = ciecoSeNienteMisurato(workflow,
// "workflow");` → `const nienteDaGuardare = null;`), il caso ① diventa ROSSO.

import assert from "node:assert/strict";
import { codiceDiUscita } from "../esito-guardiano.mjs";
import { verdettoCapacita } from "../guardiano-capacita.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

prova("⬇️ ① zero workflow guardati: ⚪, non ✅", () => {
  const v = verdettoCapacita({ workflow: 0, registri: 2, drift: 0 });
  assert.equal(v.stato, "cieco", "prima usciva «✅ nessun drift» con uscita 0 su una cartella che non esiste");
  assert.match(v.motivo, /workflow/);
});

prova("⬇️ ② nessun registro leggibile: ⚪, e dice perché il conto sarebbe falso", () => {
  const v = verdettoCapacita({ workflow: 6, registri: 0, drift: 6 });
  assert.equal(v.stato, "cieco");
  assert.match(v.motivo, /orfana/);
});

prova("③ con del drift vero è rosso, con tutto a posto è verde", () => {
  assert.equal(verdettoCapacita({ workflow: 6, registri: 2, drift: 2 }).stato, "rosso");
  assert.equal(verdettoCapacita({ workflow: 6, registri: 2, drift: 0 }).stato, "verde");
});

prova("④ i tre stati vanno ai tre codici d'uscita di casa", () => {
  assert.equal(codiceDiUscita(verdettoCapacita({ workflow: 6, registri: 2, drift: 0 })), 0);
  assert.equal(codiceDiUscita(verdettoCapacita({ workflow: 6, registri: 2, drift: 3 })), 1);
  assert.equal(codiceDiUscita(verdettoCapacita({ workflow: 0, registri: 2, drift: 0 })), 2);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
