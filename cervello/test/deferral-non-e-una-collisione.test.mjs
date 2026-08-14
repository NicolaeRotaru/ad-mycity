#!/usr/bin/env node
// AR-679 — il guardiano del registro puniva proprio il deferral che risolve il doppione.
//
// LA RADICE. Ogni mandato ha UN owner; gli altri rimandano, e il rimando si scrive dentro la porta
// d'ingresso del senior: «Deferral (owner unico): … → vicino». Quel blocco NOMINA per forza il tema
// del vicino — è il suo mestiere. Il guardiano confrontava le due schede per intero, quindi contava
// quel nome come una collisione: più il deferral era scritto bene, più il guardiano si lamentava. Un
// controllo che punisce la cura insegna a non applicarla.
//
// PERCHÉ QUESTA PROVA ESISTE ADESSO. La cura c'era già nel codice — i blocchi di rimando vengono
// tolti prima del confronto — ma la funzione che la applica non era esportata: nessun test poteva
// ESEGUIRLA, quindi nessuno poteva accorgersi se un domani qualcuno la togliesse. Il fix c'era, la
// difesa no: è la stessa forma del verde che vale zero.
//
// COSA PROVA:
//   ① due schede che si nominano a vicenda SOLO nel blocco di rimando non sono una collisione;
//   ② due schede che se lo contendono nel MANDATO restano una collisione: la guardia non è stata
//      spenta, è stata tarata;
//   ③ e chi collide senza scrivere nessun deferral viene nominato, tutti e due.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/agent-registry-check.mjs`, tornando
// a confrontare la scheda INTERA (`descNorm.set(nome, normalizzaFraseTrigger(`${mandato} ${domande}`))`
// → `descNorm.set(nome, normalizzaFraseTrigger(desc))`), il caso ① diventa ROSSO.

import assert from "node:assert/strict";
import { analizzaCollisioniDescription } from "../agent-registry-check.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// Due schede scritte come le vere: mandato + «Delega qui per …» + la coda dei rimandi. Ognuna nomina
// il mestiere dell'altra, ma SOLO nella coda — che è esattamente come si risolve un doppione.
const VENDITE =
  "Usa per i NUOVI negozi — prospecting, pitch e pipeline di nuovi commercianti da portare su MyCity. " +
  'Delega qui per "più negozi / come convinco una bottega / pipeline vendite". ' +
  "Deferral (owner unico): mettere ONLINE un nuovo negozio, vetrina, catalogo iniziale e payout → onboarding-negozi.";

const ONBOARDING =
  "Usa per mettere ONLINE un nuovo negozio, vetrina, catalogo iniziale e payout in meno di 48 ore. " +
  'Delega qui per "collega il negozio / crea la vetrina / primo incasso di test". ' +
  "Deferral (owner unico): più negozi, come convinco una bottega, pipeline vendite → vendite.";

prova("⬇️ ① due schede che si nominano solo nel rimando non fanno una collisione", () => {
  const r = analizzaCollisioniDescription(new Map([["vendite", VENDITE], ["onboarding-negozi", ONBOARDING]]));
  assert.deepEqual(r.collisioniCoppie, [], "più il deferral è scritto bene, più il guardiano si lamentava: è il difetto");
  assert.deepEqual(r.deferralMancante, []);
});

prova("⬇️ ② se se lo contendono nel MANDATO, la collisione resta", () => {
  const conteso = VENDITE.replace("→ onboarding-negozi", "→ account-negozi");
  const r = analizzaCollisioniDescription(new Map([["uno", VENDITE], ["due", conteso]]));
  assert.equal(r.collisioniCoppie.length, 1, "la guardia non è stata spenta: è stata tarata");
  assert.ok(r.collisioniCoppie[0].condivise.length >= 2, "una collisione si dichiara con le frasi che la fanno, non a sensazione");
  assert.deepEqual(r.deferralMancante, [], "tutti e due il rimando ce l'hanno scritto");
});

prova("③ e chi collide senza nessun deferral viene nominato, tutti e due", () => {
  const senzaRimando = VENDITE.split(" Deferral (owner unico):")[0];
  const r = analizzaCollisioniDescription(new Map([["uno", senzaRimando], ["due", senzaRimando]]));
  assert.equal(r.collisioniCoppie.length, 1);
  assert.deepEqual(r.deferralMancante.map((d) => d.agente).sort(), ["due", "uno"]);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
