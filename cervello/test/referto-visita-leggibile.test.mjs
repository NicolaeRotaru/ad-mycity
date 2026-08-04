#!/usr/bin/env node
// 🧪 IL REFERTO DELLA VISITA SI LEGGE (AR-520).
//
// Il referto è un testo che legge Nicola, quindi vale la regola dei quattro blocchi come per ogni
// altro testo lungo. Non ce l'aveva: apriva con «1 rossi su 20 controlli, copertura 68%» — vero, ma
// è il numero prima della notizia, e il guasto vero stava tre sezioni più sotto. L'ha trovato il
// freno dello Stop misurando il referto che avevo appena prodotto: 11 punti difficili su un file
// che prima era a zero.
//
// La seconda prova difende la lezione del primo tentativo sbagliato: avevo messo la riga «Dettagli
// tecnici» SUBITO sotto i quattro blocchi, e il misuratore ha risposto «forma pulita, contenuto
// svuotato» — il referto era diventato una copertina. Il rosso è la notizia e sta sopra la riga.

import { test } from "node:test";
import assert from "node:assert/strict";
import { quattroRisposte, referto } from "../salute.mjs";
import { BLOCCHI } from "../si-capisce.mjs";

const VISITA = {
  risultati: new Array(19),
  copertura: 0.63,
  rotti: [
    { titolo: "La macchina lascia tracce di essere passata", detto: "nessun processo automatico lascia tracce da 112 ore", organo: "worker", impatto: 1 },
    { titolo: "Un controllo minore", detto: "roba da igiene", organo: "cervello", impatto: 4 },
  ],
  guasti: [],
  nonVisti: [{ titolo: "La coda dei lavori scorre", detto: "manca la chiave" }],
};

test("i quattro blocchi ci sono tutti, nell'ordine", () => {
  const testo = quattroRisposte(VISITA).join("\n");
  let scorso = -1;
  for (const b of BLOCCHI) {
    const dove = testo.indexOf(b);
    assert.ok(dove > scorso, `«${b}» manca o è fuori ordine`);
    scorso = dove;
  }
});

test("apre con la notizia, non col conteggio: il rosso che costa di più è in cima", () => {
  const testo = quattroRisposte(VISITA).join("\n");
  const primo = testo.indexOf("tracce di essere passata");
  const secondo = testo.indexOf("Un controllo minore");
  assert.ok(primo > 0, "il guasto più grave deve comparire nelle prime righe");
  assert.ok(secondo === -1 || primo < secondo, "l'ordine è quanto costa, non l'ordine dei controlli");
  assert.match(testo, /112 ore/, "il caso concreto va detto, non riassunto");
});

test("i controlli non visti sono un elenco, non un periodo", () => {
  const righe = quattroRisposte(VISITA);
  const elenco = righe.filter((r) => r.startsWith("- "));
  assert.equal(elenco.length, VISITA.nonVisti.length, "sette titoli uniti dal punto e virgola diventano una frase da 36 parole");
});

test("senza rossi non inventa un lavoro da fare", () => {
  const testo = quattroRisposte({ ...VISITA, rotti: [] }).join("\n");
  assert.match(testo, /non ne ho trovata nessuna rotta/);
  assert.match(testo, /## Cosa devi fare\n\nNiente\./);
});

test("il referto VERO li porta: non basta che la funzione sappia costruirli", () => {
  // La prima versione di questa prova chiamava solo `quattroRisposte()`. Staccando la riga che la
  // usa dentro `referto()` il test restava verde: una prova che non poteva fallire. L'ha scoperto
  // `non-vacuita.mjs` rompendo il fix apposta — cioè il controllo che esiste per questo.
  const testo = referto({ ...VISITA, mancantiAutotest: [], risultati: [{ regressione: false }], buoni: [] });
  for (const b of BLOCCHI) assert.ok(testo.includes(b), `il referto vero non porta «${b}»`);
  const dettagli = testo.indexOf("## Dettagli tecnici");
  const rosso = testo.indexOf("tracce di essere passata");
  assert.ok(rosso > 0 && rosso < dettagli, "il rosso sta SOPRA la riga dei dettagli: è la notizia, non il dettaglio");
});
