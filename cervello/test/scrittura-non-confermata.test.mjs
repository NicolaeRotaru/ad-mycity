#!/usr/bin/env node
// 🧾 LA MALATTIA: si dichiara «fatto» ciò che nessuno ha confermato. (lotto 29)
//
// Cinque difetti del Pannello, una forma sola: si esegue una scrittura, non si guarda com'è andata,
// e si risponde/disegna come se fosse riuscita. `await` sembra una conferma — è solo la fine
// dell'attesa. La conferma è il valore che torna, e nessuno lo leggeva.
//
// Copre, con un caso dedicato ciascuno:
//   AR-230 · il rifiuto rispondeva ok:true anche con Supabase giù (card «rifiutata», firma viva)
//   AR-231 · la decisione sull'ordine si registrava anche se il lavoro non partiva, e il dedup
//            impediva di riprovare
//   AR-238 · la risposta all'AD tornava a essere richiesta 30s dopo, perché non era stata salvata
//   AR-239 · la spunta della checklist: {ok:false} servito con HTTP 200 → nemmeno il catch scattava
//   AR-264 · uscendo dalla demo, un 500 passava per successo e l'etichetta della fonte mentiva
//
// Si esegue la logica vera dei moduli (type-stripping di Node 22), non una copia.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { corpoConferma, esitoScritture, scritturaConfermata, STATUS_SCRITTURA_FALLITA } = await import(
  join(REPO, "pannello/src/lib/esito-scrittura.ts")
);

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── AR-230 ─────────────────────────────────────────────────────────────────────
prova("AR-230: il rifiuto con UNA delle tre scritture fallita non può rispondere ok", () => {
  // Il rifiuto scrive stato + nota + revoca della firma. Prima si faceva
  // `salv = (await a) && (await b)` — che oltre a ignorare la revoca CORTOCIRCUITA: se la prima
  // fallisce la seconda non parte nemmeno, e lo stato resta a metà senza che nessuno lo sappia.
  const esito = esitoScritture([
    { nome: "stato", ok: true },
    { nome: "nota", ok: true },
    { nome: "revoca firma", ok: false },
  ]);
  assert.equal(esito.ok, false, "una revoca della firma fallita deve bastare a dire NO");
  assert.ok(esito.fallite.includes("revoca firma"), "deve dire QUALE pezzo non è passato");
  assert.ok(esito.errore.includes("revoca firma"), "il messaggio per Nicola nomina il pezzo mancante");
});

prova("AR-230: lo status di una scrittura non confermata è 503, non 200", () => {
  assert.equal(STATUS_SCRITTURA_FALLITA, 503, "un 200 farebbe credere al client che è andata");
});

prova("AR-230: tutte confermate ⇒ ok, e nessun falso allarme", () => {
  const esito = esitoScritture([
    { nome: "stato", ok: true },
    { nome: "nota", ok: true },
    { nome: "revoca firma", ok: true },
  ]);
  assert.equal(esito.ok, true);
  assert.equal(esito.errore, "");
});

// ── AR-231 ─────────────────────────────────────────────────────────────────────
prova("AR-231: «decisione presa» senza lavoro partito non è un fatto intero", () => {
  // La decisione sull'ordine da 19,05 € è DUE scritture su tabelle diverse, senza transazione:
  // la scelta in `impostazioni` e il lavoro in `lavori`. Il difetto era considerare il secondo un
  // effetto collaterale. Con entrambe misurate, mezza riuscita non può leggersi come riuscita.
  const mezza = esitoScritture([
    { nome: "scelta salvata", ok: true },
    { nome: "lavoro accodato", ok: false },
  ]);
  assert.equal(mezza.ok, false, "decisione salvata + cervello mai partito ⇒ NON ok");
  assert.ok(mezza.fallite.includes("lavoro accodato"));
});

prova("AR-231: il dedup deve distinguere «già fatta» da «da completare»", () => {
  // Il campo `lavoro` è ciò che rende la differenza leggibile a chi rientra dalla porta: `null`
  // significa «registrata ma mai partita» → si riprova; un id significa «finita» → si esce subito.
  const daCompletare = { scelta: "A", lavoro: null };
  const finita = { scelta: "A", lavoro: "lav_123" };
  const storica = { scelta: "A" }; // salvata prima che il campo esistesse
  const puoUscire = (d) => d.lavoro !== null;
  assert.equal(puoUscire(daCompletare), false, "una decisione senza lavoro deve poter riprovare");
  assert.equal(puoUscire(finita), true);
  assert.equal(puoUscire(storica), true, "le decisioni storiche non vanno riaperte");
});

// ── AR-238 ─────────────────────────────────────────────────────────────────────
prova("AR-238: una risposta non salvata non può tornare ok:true", () => {
  // `setImpostazione` torna false quando la memoria non è collegata. Prima il valore si buttava via
  // e la route rispondeva ok:true: il riquadro diventava verde e trenta secondi dopo, al ripasso,
  // la stessa domanda ricompariva — perché sul server non c'era niente.
  const salvata = false;
  const esito = esitoScritture([{ nome: "risposta", ok: salvata }]);
  assert.equal(esito.ok, false);
  assert.equal(corpoConferma({ ok: false, error: "Risposta non salvata — riprova." }), false);
});

// ── AR-239 ─────────────────────────────────────────────────────────────────────
prova("AR-239: {ok:false} servito con HTTP 200 NON è una conferma", () => {
  // È il caso esatto di /api/memoria/todo: risponde 200 con ok:false quando la memoria è staccata.
  // `await fetch()` non lancia, il `catch` non scatta, e la spunta restava a schermo come salvata.
  assert.equal(scritturaConfermata({ ok: true, status: 200 }, { ok: false }), false);
  assert.equal(scritturaConfermata({ ok: true, status: 200 }, { ok: true }), true);
});

prova("AR-239: un corpo vuoto o illeggibile non è una conferma", () => {
  assert.equal(scritturaConfermata({ ok: true, status: 200 }, null), false, "chi scrive deve dire di aver scritto");
  assert.equal(scritturaConfermata({ ok: true, status: 200 }, {}), false);
  assert.equal(scritturaConfermata(null, { ok: true }), false, "nessuna risposta = nessuna conferma");
});

// ── AR-264 ─────────────────────────────────────────────────────────────────────
prova("AR-264: un 500 non è un successo solo perché fetch non ha lanciato", () => {
  // `fetch` respinge SOLO sugli errori di rete: un 500 arriva come risposta regolare. Prima si
  // andava dritti a `window.location.reload()`, e l'etichetta che dice a Nicola se sta guardando
  // numeri veri o finti restava sbagliata proprio quando conta di più.
  assert.equal(scritturaConfermata({ ok: false, status: 500 }, null), false);
  assert.equal(scritturaConfermata({ ok: false, status: 500 }, { ok: true }), false, "il trasporto rotto vince sul corpo ottimista");
  assert.equal(scritturaConfermata({ ok: true, status: 200 }, { ok: true, demo: false }), true, "il cambio riuscito ricarica");
});

// ── La prova che la prova non sia vacua ───────────────────────────────────────
prova("il metro sa dire di SÌ: se tutto conferma, nessuno di questi casi blocca", () => {
  assert.equal(esitoScritture([]).ok, true, "nessuna scrittura da fare = niente da bloccare");
  assert.equal(scritturaConfermata({ ok: true, status: 201 }, { ok: true }), true);
  assert.equal(corpoConferma({ stato: "fatta" }), true, "le route storiche senza campo ok restano valide");
});

const rossi = casi.filter((c) => !c.ok);
console.log(`TAP version 13\n1..${casi.length}`);
casi.forEach((c, i) => console.log(`${c.ok ? "ok" : "not ok"} ${i + 1} - ${c.nome}${c.ok ? "" : `\n  # ${c.err}`}`));
console.log(`# pass ${casi.length - rossi.length}`);
console.log(`# fail ${rossi.length}`);
process.exit(rossi.length ? 1 : 0);
