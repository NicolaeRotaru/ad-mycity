// AR-219 — la coda da firmare non deve essere 40 schermate di scorrimento (node --test, nessuna rete).
//
// Il difetto: `daFirmare.map((a) => cardAzione(a))` stampava ogni azione con la scheda INTERA già
// espansa. Con 51 azioni in coda sono ~15 schermate su desktop e ~40 sul telefono: per arrivare alla
// decima si scorre finché non si molla. Il pattern giusto esisteva già in casa (Modulo.tsx: 8 righe +
// «mostra altri N»; RadiografiaDiSe.tsx: `<details>` chiuso di default) e non era stato riusato.
//
// Qui si eseguono le funzioni VERE di pannello/src/lib/coda-azioni.ts. Le due cose che il test deve
// impedire di rompere in futuro: (a) che la coda torni tutta aperta, (b) che «solo la prima aperta»
// diventi «si richiude da sola mentre la leggi» — cioè un rimedio peggiore del male.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const LIB = join(QUI, "..", "..", "pannello/src/lib/coda-azioni.ts");
const { TETTO_CODA, azioniVisibili, quanteNascoste, cardAperta, idDaAncora, serveSrotolare } = await import(LIB);

/** La coda vera del 27/7: 51 azioni da firmare. */
const coda = Array.from({ length: 51 }, (_, i) => ({ id: `A${i}`, titolo: `azione ${i}` }));

// ── quante schede si montano ─────────────────────────────────────────────────
test("il caso che ha rotto: 51 azioni non si montano tutte insieme", () => {
  assert.equal(azioniVisibili(coda, false).length, TETTO_CODA);
  assert.equal(quanteNascoste(coda.length, false), 41, "il bottone deve dire quante ne restano");
});

test("se lo chiede, le vede tutte", () => {
  assert.equal(azioniVisibili(coda, true).length, 51);
  assert.equal(quanteNascoste(coda.length, true), 0, "niente bottone quando non c'è più niente da mostrare");
});

test("una coda corta non mostra nessun bottone «mostra le altre»", () => {
  const corta = coda.slice(0, 4);
  assert.equal(azioniVisibili(corta, false).length, 4);
  assert.equal(quanteNascoste(corta.length, false), 0);
});

test("coda vuota o dato storto: nessuna esplosione, nessun numero negativo", () => {
  assert.deepEqual(azioniVisibili([], false), []);
  assert.deepEqual(azioniVisibili(null, false), []);
  assert.equal(quanteNascoste(0, false), 0);
  assert.equal(quanteNascoste(3, false), 0, "3 azioni, tetto 10 → zero nascoste, non -7");
});

// ── quale scheda è aperta ────────────────────────────────────────────────────
test("di default resta aperta solo la prima", () => {
  assert.equal(cardAperta("A0", 0, {}), true);
  for (let i = 1; i < 10; i++) assert.equal(cardAperta(`A${i}`, i, {}), false, `la ${i + 1}ª deve nascere chiusa`);
});

test("quando Nicola apre una scheda, comanda lui — anche sulla prima", () => {
  assert.equal(cardAperta("A7", 7, { A7: true }), true, "aperta a mano: resta aperta");
  assert.equal(cardAperta("A0", 0, { A0: false }), false, "chiusa a mano: NON si riapre al prossimo poll");
});

test("la scelta di una scheda non si riflette sulle altre", () => {
  const scelte = { A3: true };
  assert.equal(cardAperta("A3", 3, scelte), true);
  assert.equal(cardAperta("A4", 4, scelte), false);
  assert.equal(cardAperta("A0", 0, scelte), true, "la prima resta aperta per la regola, non per la scelta");
});

test("una scheda aperta resta aperta anche se la lista si riordina", () => {
  // È il caso che rende il fix vivibile: la coda si ricarica ogni pochi secondi e l'indice cambia.
  // Se l'apertura dipendesse solo dalla posizione, la scheda si chiuderebbe sotto le dita.
  assert.equal(cardAperta("A9", 9, { A9: true }), true);
  assert.equal(cardAperta("A9", 0, { A9: true }), true);
  assert.equal(cardAperta("A9", 40, { A9: true }), true);
});

// ── arrivare da un link diretto ──────────────────────────────────────────────
test("l'ancora del link diventa l'id dell'azione", () => {
  assert.equal(idDaAncora("azione-A42"), "A42");
  assert.equal(idDaAncora("azione-abc-123-def"), "abc-123-def", "gli id hanno i trattini dentro");
  assert.equal(idDaAncora("difetto-AR-219"), null, "un'ancora di un'altra area non è un'azione");
  assert.equal(idDaAncora(null), null);
  assert.equal(idDaAncora(""), null);
});

test("il caso che ha rotto: un link a un'azione oltre le prime 10 srotola la lista", () => {
  // Senza questo, «Vai all'azione collegata» porterebbe a una scheda che non è nemmeno nel DOM:
  // lo scroll non troverebbe nulla e il link sembrerebbe non funzionare.
  assert.equal(serveSrotolare("A30", coda, false), true);
  assert.equal(serveSrotolare("A2", coda, false), false, "già visibile: non serve srotolare");
  assert.equal(serveSrotolare("A30", coda, true), false, "già srotolata: niente da fare");
  assert.equal(serveSrotolare(null, coda, false), false);
  assert.equal(serveSrotolare("A999", coda, false), false, "azione che non esiste: non si srotola per niente");
});

test("il confine esatto del tetto", () => {
  assert.equal(serveSrotolare(`A${TETTO_CODA - 1}`, coda, false), false, "l'ultima visibile");
  assert.equal(serveSrotolare(`A${TETTO_CODA}`, coda, false), true, "la prima nascosta");
});
