#!/usr/bin/env node
// AR-440 — un allarme acceso da settimane e uno acceso da un minuto si leggevano uguale.
//
// LA RADICE, dal quinto perché della scheda: «un guardiano perennemente rosso costa quanto uno
// spento, e la macchina non ha nessun modo di misurare la cronicità». Il costo non è il rumore: un
// cancello che suona sempre viene aggirato al secondo giro, e da lì in poi smette di fermare anche
// i rossi veri. Cioè la difesa si spegne da sola, senza che nessuno l'abbia deciso.
//
// COSA PROVA QUESTO FILE, eseguendo venti visite finte in un millisecondo invece di aspettare venti
// giorni:
//   ① il conto sopravvive fra una visita e l'altra e cresce solo per chi resta rosso;
//   ② al terzo giro consecutivo l'allarme diventa CRONICO, e prima no;
//   ③ un allarme risolto azzera il conto: se si riaccende è nuovo di nuovo, e va riguardato;
//   ④ la segnalazione a Nicola parte UNA volta, quando taglia la soglia — non a ogni giro, che
//      sarebbe la stessa malattia spostata di un piano;
//   ⑤ nella visita vera il rosso porta con sé la sua età, e il testo del referto la dice.
//
// NON-VACUITÀ (verificata rompendo il fix apposta): in `cervello/cronicita-allarmi.mjs`, facendo
// ripartire il conto da zero a ogni giro (`dopo[id] = ... + 1` → `dopo[id] = 1`), i casi ① ② ④ ⑤
// diventano ROSSI — è precisamente lo stato in cui la macchina non sapeva misurare la cronicità.

import assert from "node:assert/strict";
import { GIRI_PER_CRONICO, aggiornaConto, dilloAVoce, quadroCronicita, statoAllarme } from "../cronicita-allarmi.mjs";
import { marcaCronicita, quattroRisposte, referto } from "../salute.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① Il conto che sopravvive ───────────────────────────────────────────────

prova("lo stesso allarme acceso tre giri di fila conta tre, non uno", () => {
  let conto = {};
  for (let i = 0; i < 3; i++) conto = aggiornaConto(conto, ["sensori.spenti"]);
  assert.equal(conto["sensori.spenti"], 3, "senza memoria fra i giri il conto resterebbe 1 per sempre");
});

prova("chi non è acceso adesso non compare, anche se ieri suonava", () => {
  const conto = aggiornaConto({ "worker.coda": 7 }, ["cabina.viva"]);
  assert.equal(conto["worker.coda"], undefined);
  assert.equal(conto["cabina.viva"], 1);
});

// ── ② e ③ La soglia, e il ritorno a zero ────────────────────────────────────

prova("⬇️ prima della soglia è «ripetuto», alla soglia diventa CRONICO", () => {
  assert.equal(statoAllarme(1).stato, "nuovo");
  assert.equal(statoAllarme(2).stato, "ripetuto");
  assert.equal(statoAllarme(2).cronico, false, "due giri non fanno ancora una condizione");
  assert.equal(statoAllarme(GIRI_PER_CRONICO).cronico, true);
  assert.equal(statoAllarme(20).cronico, true);
});

prova("un allarme risolto e poi riacceso è nuovo di nuovo", () => {
  let conto = aggiornaConto({}, ["x"]);
  conto = aggiornaConto(conto, ["x"]);
  conto = aggiornaConto(conto, []); // risolto: sparisce
  conto = aggiornaConto(conto, ["x"]); // torna
  assert.equal(conto.x, 1, "un guasto che ritorna va guardato, non archiviato come vecchia conoscenza");
});

prova("la frase cambia con l'età: è quella che fa alzare il sopracciglio", () => {
  assert.match(dilloAVoce(1), /adesso/);
  assert.match(dilloAVoce(2), /2 giri/);
  assert.match(dilloAVoce(9), /nessuno l'ha risolto/);
  assert.equal(dilloAVoce(0), "");
});

// ── ④ La segnalazione parte una volta sola ──────────────────────────────────

prova("⬇️ la card per Nicola parte al terzo giro, e non si ripete al quarto", () => {
  let conto = {};
  const portati = [];
  for (let giro = 1; giro <= 6; giro++) {
    const q = quadroCronicita(conto, ["cervello.segreti"]);
    conto = q.conto;
    if (q.daPortareANicola.length) portati.push(giro);
  }
  assert.deepEqual(portati, [GIRI_PER_CRONICO], "una card ripetuta a ogni giro è la malattia, non la cura");
});

prova("il quadro separa i nuovi dai cronici e dice chi si è spento", () => {
  const q = quadroCronicita({ vecchio: 8, sparito: 4 }, ["vecchio", "appena_nato"]);
  assert.deepEqual(q.nuovi, ["appena_nato"]);
  assert.equal(q.cronici.length, 1);
  assert.equal(q.cronici[0].id, "vecchio");
  assert.equal(q.cronici[0].giri, 9);
  assert.deepEqual(q.spenti, ["sparito"]);
  assert.deepEqual(q.daPortareANicola, [], "era già cronico al giro scorso: non si richiede due volte");
});

// ── ⑤ Dentro la visita vera ─────────────────────────────────────────────────

prova("⬇️ nella visita, un rosso vecchio e uno nuovo non si leggono più uguale", () => {
  const risultati = [
    { id: "sensori.spenti", esito: "rotto", titolo: "Ogni sensore spento ha il suo perché", organo: "sensori", impatto: 4, detto: "un sensore è spento e nessuno sa perché" },
    { id: "cabina.viva", esito: "rotto", titolo: "La Cabina risponde", organo: "cabina", impatto: 1, detto: "la Cabina risponde 500" },
    { id: "worker.tracce", esito: "ok", titolo: "La macchina lascia tracce", organo: "worker", impatto: 1, detto: "ultima traccia 2 ore fa" },
  ];
  // Il conto arriva dalla visita precedente, come succede davvero leggendo salute.json.
  marcaCronicita({ "sensori.spenti": 11 }, risultati);
  const vecchio = risultati[0];
  const nuovo = risultati[1];
  assert.equal(vecchio.rossoDa, 12);
  assert.equal(vecchio.cronico, true);
  assert.equal(nuovo.rossoDa, 1);
  assert.equal(nuovo.cronico, false, "un rosso di stamattina non è cronico: è la notizia di oggi");
  assert.equal(risultati[2].rossoDa, 0, "un verde non ha un'età da allarme");
});

prova("e il referto lo dice a Nicola, col numero e col suo metro", () => {
  const risultati = [
    { id: "sensori.spenti", esito: "rotto", titolo: "Ogni sensore spento ha il suo perché", organo: "sensori", impatto: 4, detto: "un sensore è spento e nessuno sa perché" },
  ];
  marcaCronicita({ "sensori.spenti": 11 }, risultati);
  const visita = { risultati, rotti: risultati, guasti: [], nonVisti: [], buoni: [], copertura: 1, mancantiAutotest: [] };

  // In cima, dove Nicola guarda per primo: il numero secco, col metro accanto.
  const sopra = quattroRisposte(visita).join("\n");
  assert.match(sopra, /12 visite di fila/, "il numero è la differenza fra «è rotto» e «è rotto da un pezzo»");
  assert.doesNotMatch(sopra, /\b12\b(?! visite)/, "un numero senza il suo metro costringe a rileggere");

  // Nel dettaglio, accanto al rosso: la frase intera, che è la notizia.
  const tutto = referto(visita);
  assert.match(tutto, /Da quanto: acceso in 12 visite di fila e nessuno l'ha risolto/);
});

prova("anche un mio controllo che non parte da tre visite è un allarme cronico", () => {
  // Un controllo guasto sembra un verde: se resta guasto per settimane, la difesa è spenta di fatto.
  const risultati = [{ id: "cervello.test", esito: "guasto", titolo: "I test del cervello passano", organo: "cervello", impatto: 3, detto: "non è partito" }];
  marcaCronicita({ "cervello.test": 5 }, risultati);
  assert.equal(risultati[0].cronico, true);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
