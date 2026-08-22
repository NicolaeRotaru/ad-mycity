// 🩸 AR-757 — IL CODICE ROTTO APPOSTA NON DEVE POTER ENTRARE NELLA STORIA.
//
// Il banco delle mutazioni rompe un file di proposito per controllare che una prova diventi rossa,
// e poi lo rimette a posto. Due volte il ripristino non e' arrivato:
//   · 16/8 — banco ammazzato dal timeout: un bottone finto e' rimasto dentro il Pannello;
//   · 22/8 — ho committato l'unione mentre una corsa girava ancora, e `cervello/salute.mjs` e'
//     entrato nella storia senza la riga che stampa le quattro risposte del referto.
//
// Il secondo caso e' quello che questa prova difende, perche' e' quello che nessun freno prendeva:
// nessun processo era morto — erano in DUE a scrivere lo stesso albero.
//
// Perche' questa prova esegue invece di cercare parole: la domanda «l'albero e' esattamente
// l'archivio con la mutazione addosso?» ha una risposta che si calcola, e una parola in un file non
// la calcola. Ogni caso qui sotto chiama la funzione vera e guarda cosa risponde.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eVagante, mutazioniVaganti, muta, referto, NUOVO } from "../mutazione-vagante.mjs";

const ARCHIVIO = ["riga uno", "  righe.push(...quattroRisposte(v));", "riga tre"].join("\n");
const CANCELLA = { nome: "la riga sparisce", cerca: "  righe.push(...quattroRisposte(v));", sostituisci: "" };
const SOSTITUISCE = { nome: "il se diventa mai", cerca: "if (n >= soglia)", sostituisci: "if (false)" };

test("AR-757 · il caso vero del 22/8: una mutazione che CANCELLA una riga viene riconosciuta", () => {
  const albero = muta(ARCHIVIO, CANCELLA.cerca, CANCELLA.sostituisci);
  assert.notEqual(albero, ARCHIVIO, "la mutazione deve aver cambiato qualcosa, altrimenti il caso non prova niente");
  assert.equal(eVagante(ARCHIVIO, albero, CANCELLA), true);
});

test("AR-757 · la proposta scritta sulla scheda NON avrebbe preso quel caso, e questa prova lo dimostra", () => {
  // La scheda diceva: cercare nell'albero le stringhe di `sostituisci`. Qui `sostituisci` e' "".
  // Una ricerca della stringa vuota trova tutto, quindi non distingue niente: non e' un sensore.
  assert.equal(CANCELLA.sostituisci, "");
  const albero = muta(ARCHIVIO, CANCELLA.cerca, CANCELLA.sostituisci);
  assert.equal(albero.includes(CANCELLA.sostituisci), true, "ogni testo contiene la stringa vuota");
  assert.equal("un file che nessuno ha toccato".includes(CANCELLA.sostituisci), true, "anche uno pulito");
  // La domanda giusta invece separa i due:
  assert.equal(eVagante(ARCHIVIO, albero, CANCELLA), true);
  assert.equal(eVagante(ARCHIVIO, ARCHIVIO, CANCELLA), false);
});

test("AR-757 · una mutazione che SOSTITUISCE viene riconosciuta come quella che cancella", () => {
  const arch = "prima\nif (n >= soglia)\ndopo";
  assert.equal(eVagante(arch, muta(arch, SOSTITUISCE.cerca, SOSTITUISCE.sostituisci), SOSTITUISCE), true);
});

test("AR-757 · un file non toccato non e' vagante: il freno non da' fastidio a chi non ha fatto niente", () => {
  assert.equal(eVagante(ARCHIVIO, ARCHIVIO, CANCELLA), false);
});

test("AR-757 · chi ha SPOSTATO il codice non viene bloccato: quella e' un'altra domanda", () => {
  // `cerca` sparisce, ma il testo non e' quello che il banco avrebbe scritto: e' un refactoring.
  // Bloccarlo qui vorrebbe dire fermare il lavoro vero, e un freno che ferma il lavoro vero viene
  // spento. Se ne occupa mutazioni-orfane.mjs, che chiede «l'hai spostato o l'hai tolto?».
  const rifatto = ARCHIVIO.replace("  righe.push(...quattroRisposte(v));", "  stampaLeQuattroRisposte(v);");
  assert.equal(rifatto.includes(CANCELLA.cerca), false, "il pezzo sorvegliato non c'e' piu'");
  assert.equal(eVagante(ARCHIVIO, rifatto, CANCELLA), false);
});

test("AR-757 · un file NUOVO non e' un cieco: aggiungere un file non blocca il commit", () => {
  const e = mutazioniVaganti([CANCELLA_SU("nuovo.mjs")], () => NUOVO, () => "qualsiasi cosa", ["nuovo.mjs"]);
  assert.equal(e.vaganti.length, 0);
  assert.equal(e.ciechi.length, 0, "un file nuovo non deve finire fra i ciechi, o il freno blocca ogni aggiunta");
  assert.deepEqual(e.nuovi, ["nuovo.mjs"]);
});

test("AR-757 · un file che non si legge e' un CIECO, non un verde", () => {
  const e = mutazioniVaganti([CANCELLA_SU("muto.mjs")], () => null, () => null, ["muto.mjs"]);
  assert.equal(e.vaganti.length, 0);
  assert.equal(e.ciechi.length, 1, "non poter guardare non e' «e' pulito»");
});

test("AR-757 · il referto dice COSA FARE, non solo che c'e' un problema", () => {
  const e = mutazioniVaganti([CANCELLA_SU("cervello/salute.mjs")], () => ARCHIVIO, () => muta(ARCHIVIO, CANCELLA.cerca, ""), ["cervello/salute.mjs"]);
  assert.equal(e.vaganti.length, 1);
  const t = referto(e);
  assert.match(t, /COMMIT BLOCCATO/);
  assert.match(t, /git checkout -- cervello\/salute\.mjs/, "chi legge deve trovarci il comando gia' scritto");
});

// ── IL FRENO E' AGGANCIATO DOVE SERVE ─────────────────────────────────────────
// Le prove qui sopra dimostrano che la funzione risponde bene. Questa dimostra che qualcuno gliela
// chiede al momento giusto: una funzione perfetta che nessuno chiama non ha mai fermato niente — ed
// e' esattamente com'era il 22/8, quando la domanda si faceva solo all'ultima porta.
test("AR-757 · il gancio del commit chiama il freno, e lo fa PRIMA del cancello del ramo", () => {
  const hook = readFileSync(new URL("../../.githooks/pre-commit", import.meta.url), "utf8");
  const dovePrende = hook.indexOf("cervello/mutazione-vagante.mjs");
  assert.notEqual(dovePrende, -1, "il gancio del commit non chiama il freno: nessun commit verrebbe fermato");
  const doveEsce = hook.indexOf("node \"$CANCELLI\" segna");
  assert.ok(dovePrende < doveEsce, "il freno deve stare prima del punto in cui il commit si dichiara passato");
});

function CANCELLA_SU(file) {
  return { ...CANCELLA, file };
}
