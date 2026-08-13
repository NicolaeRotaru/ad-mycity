#!/usr/bin/env node
// 🧠 AR-apprendimento (vincolo HARD del giro 2026-08-12) — «correzione-nicola» è l'area più ripetuta
// della memoria (~26 lezioni, ~18 ripetizioni) e non era MAI diventata un gate: solo la promessa di
// "farci più attenzione". Questo test prova che il guardiano CALCOLA il numero (lezioni tag
// correzione-nicola senza un freno proprio), non che dichiari a parole di averlo fatto.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calcola, haGate, etaggataCorrezioneNicola, SOGLIA_SENZA_GATE } from "../correzione-nicola-gate.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

test("una lezione con campo gate scritto CONTA come protetta", () => {
  assert.equal(haGate({ gate: "node cervello/test/x.test.mjs" }), true);
});

test("una lezione che cita uno script/test nel testo CONTA come protetta", () => {
  assert.equal(haGate({ testo: "vale sempre, vedi cervello/mano-fermata.mjs" }), true);
});

test("una lezione senza gate e senza riferimento a codice NON è protetta", () => {
  assert.equal(haGate({ testo: "farò più attenzione la prossima volta" }), false);
});

test("il tag esplicito, il caso_studio_nicola, e la fonte in prosa contano TUTTI come «correzione di Nicola»", () => {
  assert.equal(etaggataCorrezioneNicola({ tag: ["correzione-nicola"] }), true);
  assert.equal(etaggataCorrezioneNicola({ caso_studio_nicola: true }), true);
  assert.equal(etaggataCorrezioneNicola({ fonte: "Correzione di Nicola in chat, 12/8" }), true);
  assert.equal(etaggataCorrezioneNicola({ tag: ["plugin"], fonte: "esito" }), false);
});

test("il caso che ha rotto: N correzioni senza gate, sopra soglia, esce malato", () => {
  const dati = {
    lezioni: Array.from({ length: SOGLIA_SENZA_GATE + 3 }, (_, i) => ({
      id: `L-test-${i}`, tag: ["correzione-nicola"], testo: "farò più attenzione",
    })),
  };
  const { risultato } = calcola(dati, { storia: [] });
  assert.equal(risultato.senza_gate, SOGLIA_SENZA_GATE + 3);
  assert.equal(risultato.sopra_soglia === undefined, true); // il campo non esiste: sano lo dice già
  assert.equal(risultato.sano, false, "sopra soglia dev'essere malato");
});

test("con tutte le lezioni protette da un gate vero, il conto torna sano", () => {
  const dati = {
    lezioni: [
      { id: "L-1", tag: ["correzione-nicola"], gate: "node cervello/test/mano-fermata.test.mjs" },
      { id: "L-2", tag: ["correzione-nicola"], testo: "vedi cervello/scadenzario-check.mjs" },
    ],
  };
  const { risultato } = calcola(dati, { storia: [] });
  assert.equal(risultato.senza_gate, 0);
  assert.equal(risultato.con_gate, 2);
  assert.equal(risultato.sano, true);
});

test("il caso che ha rotto: PEGGIORARE rispetto al giro precedente è malato anche sotto soglia", () => {
  const dati = { lezioni: [{ id: "L-1", tag: ["correzione-nicola"], testo: "senza gate" }, { id: "L-2", tag: ["correzione-nicola"], testo: "nemmeno questa" }] };
  const storiaPrecedente = { storia: [{ senza_gate: 1 }] }; // il giro prima erano di meno: 1 → 2 è un peggioramento
  const { risultato } = calcola(dati, storiaPrecedente);
  assert.equal(risultato.peggiorato_dal_giro_precedente, true);
  assert.equal(risultato.sano, false, "peggiorare, anche restando sotto soglia, non è sano");
});

test("senza apprendimento.json il guardiano dichiara l'errore, non un falso sano", () => {
  const esito = calcola(null, { storia: [] });
  assert.ok(esito.errore, "input assente dev'essere un errore esplicito, non un conto vuoto silenzioso");
});

test("il guardiano è agganciato al giro come vincolo", () => {
  const src = readFileSync(join(REPO, "cervello/giro.sh"), "utf8");
  assert.match(src, /correzione-nicola-gate\.mjs/, "giro.sh deve invocare il guardiano");
  assert.match(src, /CORREZIONE_NICOLA_VINCOLO/, "il suo esito deve poter diventare un vincolo per il motore");
});

test("il guardiano è nel censimento (altrimenti guardiani-check lo bocciava come orfano)", () => {
  const src = readFileSync(join(REPO, "cervello/censimento-guardiani.mjs"), "utf8");
  assert.match(src, /"correzione-nicola-gate"/);
});

test("sul file vero di apprendimento.json il guardiano gira senza esplodere", () => {
  const { risultato, esito } = (() => {
    const r = calcola();
    return { risultato: r.risultato, esito: r };
  })();
  assert.ok(!esito.errore, "apprendimento.json reale dev'essere leggibile");
  assert.ok(typeof risultato.senza_gate === "number");
  assert.ok(typeof risultato.totale_taggate === "number");
  assert.ok(risultato.senza_gate <= risultato.totale_taggate);
});
