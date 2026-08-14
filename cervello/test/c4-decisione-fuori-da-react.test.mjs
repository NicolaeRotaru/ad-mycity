#!/usr/bin/env node
// LOTTO 42, CORSIA E — le decisioni del Pannello, eseguite invece che rilette.
//
// LA RADICE, comune a tutti i difetti qui sotto: la logica che decide viveva dentro i componenti
// React. Lì una prova può solo RIAPRIRE il file e cercarci una parola — e una parola in un file non
// può fallire nel modo in cui fallisce la realtà. È per questo che questi difetti sono sopravvissuti
// a due radiografie con la loro prova VERDE: la prova controllava la forma, non l'effetto.
//
// Ora le decisioni stanno in `pannello/src/lib/stato-card.ts`, senza React e senza rete, e questo
// file le fa GIRARE.
//
// COSA PROVA, un difetto per sezione:
//   ① AR-675 — una casella ha UNA memoria sola. Prima erano due, con nomi quasi uguali («aperte»
//      per il testo, «scelteCard» per la scheda): chi ha scritto il salto verso l'azione ha aperto
//      quella sbagliata in buona fede, e il collegamento atterrava su una riga muta. Si prova che
//      l'atterraggio apre TUTTE E DUE le cose in una chiamata sola.
//   ② AR-615 — il doppio tocco. Il secondo tocco su «Ignora» deve essere BUTTATO VIA, e il turno
//      deve tornare libero anche quando la richiesta finisce male.
//   ③ AR-616 — un titolo che esce a schermo è già passato dal filtro, anche se arriva dallo storico.
//   ④ AR-614 — nessun colore può nascere senza la sua gemella per il tema scuro.
//   ⑤ AR-607 — una schermata di guasto non può promettere più di quanto è rimasto in piedi.
//   ⑥ AR-602 — la risposta che si mostra è quella del lavoro finito, non la copia vecchia.
//   ⑦ AR-613 — con le frecce ci si sposta fra le schede, e si gira in tondo.
//
// NON-VACUITÀ (verificata rompendo il fix apposta, non dedotta): vedi le note «rompendo …» in ogni
// sezione. Il frammento della corsia porta il mutante esatto.
//
// Si lancia con: node cervello/test/c4-decisione-fuori-da-react.test.mjs

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const M = await import(join(REPO, "pannello/src/lib/stato-card.ts"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① AR-675 · UNA memoria sola per casella ─────────────────────────────────

prova("AR-675: l'atterraggio apre la scheda E il testo dentro, in una chiamata sola", () => {
  // È il caso che ha rotto: chi saltava all'azione apriva UNO dei due stati e il collegamento
  // finiva su una riga muta. Con una funzione sola non c'è più uno stato sbagliato da scegliere.
  const dopo = M.apriPerAtterraggio(M.NESSUNA_CARTA, "a7");
  assert.equal(M.cardAperta(dopo, "a7", 5), true, "la scheda deve essere aperta");
  assert.equal(M.testoAperto(dopo, "a7"), true, "e anche il testo dentro");
});

prova("AR-675: chiudere la scheda non spegne il testo, e viceversa — sono due cose diverse", () => {
  let s = M.apriPerAtterraggio(M.NESSUNA_CARTA, "a7");
  s = M.segnaCard(s, "a7", false);
  assert.equal(M.cardAperta(s, "a7", 0), false);
  assert.equal(M.testoAperto(s, "a7"), true, "il testo resta come l'aveva lasciato Nicola");
});

prova("AR-675: senza decisione di Nicola resta aperta solo la prima della lista", () => {
  assert.equal(M.cardAperta(M.NESSUNA_CARTA, "x", 0), true, "la prima è aperta");
  assert.equal(M.cardAperta(M.NESSUNA_CARTA, "y", 1), false, "la seconda no");
  // …ma appena Nicola tocca, comanda lui: è la regola vecchia di AR-219, qui solo riusata.
  const chiusa = M.segnaCard(M.NESSUNA_CARTA, "x", false);
  assert.equal(M.cardAperta(chiusa, "x", 0), false, "Nicola ha chiuso la prima: resta chiusa");
  const aperta = M.segnaCard(M.NESSUNA_CARTA, "y", true);
  assert.equal(M.cardAperta(aperta, "y", 1), true);
});

prova("AR-675: due caselle non si pestano i piedi", () => {
  let s = M.apriPerAtterraggio(M.NESSUNA_CARTA, "a1");
  s = M.giraTesto(s, "a2");
  assert.equal(M.testoAperto(s, "a1"), true);
  assert.equal(M.testoAperto(s, "a2"), true);
  s = M.giraTesto(s, "a2");
  assert.equal(M.testoAperto(s, "a2"), false, "il secondo tocco lo richiude");
  assert.equal(M.testoAperto(s, "a1"), true, "e non tocca l'altra");
});

prova("AR-675: la memoria non si modifica sul posto — React deve accorgersi del cambio", () => {
  const prima = M.apriPerAtterraggio(M.NESSUNA_CARTA, "a1");
  const dopo = M.segnaCard(prima, "a2", true);
  assert.notEqual(prima, dopo, "un oggetto nuovo, altrimenti lo schermo non si ridisegna");
  assert.equal(M.cardAperta(prima, "a2", 9), false, "e quello di prima resta com'era");
});

// ── ② AR-615 · l'antirimbalzo del doppio tocco ──────────────────────────────
//
// Rompendo `giaPremuto` (fargli tornare sempre `false`) i tre casi qui sotto diventano rossi: è
// esattamente lo stato in cui «Ignora» mandava due richieste.

prova("AR-615: il secondo tocco sullo stesso bottone si butta via", () => {
  let s = M.NESSUNO_PREMUTO;
  assert.equal(M.giaPremuto(s, "prop-1"), false, "il primo tocco passa");
  s = M.segnaPremuto(s, "prop-1");
  assert.equal(M.giaPremuto(s, "prop-1"), true, "il secondo trova il posto occupato");
});

prova("AR-615: due proposte diverse restano indipendenti", () => {
  const s = M.segnaPremuto(M.NESSUNO_PREMUTO, "prop-1");
  assert.equal(M.giaPremuto(s, "prop-2"), false, "il freno di una non blocca l'altra");
});

prova("AR-615: quando la richiesta torna — anche male — il bottone si riaccende", () => {
  // È la metà che si dimentica: un freno che non si libera è un bottone morto per sempre.
  let s = M.segnaPremuto(M.NESSUNO_PREMUTO, "prop-1");
  s = M.liberaPremuto(s, "prop-1");
  assert.equal(M.giaPremuto(s, "prop-1"), false, "si può riprovare");
});

prova("AR-615: il doppio tocco vero — due partenze di fila, una sola richiesta", () => {
  // La simulazione del dito: due tocchi nello stesso istante, prima che lo schermo si ridisegni.
  let s = M.NESSUNO_PREMUTO;
  let richieste = 0;
  const tocca = () => {
    if (M.giaPremuto(s, "ignora-1")) return;
    s = M.segnaPremuto(s, "ignora-1");
    richieste++;
  };
  tocca();
  tocca();
  assert.equal(richieste, 1, "due tocchi, UNA richiesta");
});

// ── ③ AR-616 · il titolo che arriva sotto gli occhi di Nicola ───────────────

prova("AR-616: un titolo storico con la targa tecnica esce pulito", () => {
  const sporco = "**AR-128** — collega il sensore (consegne/audit/2026-08-01-nota.md)";
  const pulito = M.titoloDaMostrare(sporco);
  assert.ok(!pulito.includes("**"), `restano gli asterischi: ${pulito}`);
  assert.ok(!/AR-\d+/.test(pulito), `resta la sigla: ${pulito}`);
  assert.ok(!pulito.includes("consegne/"), `resta il percorso: ${pulito}`);
  assert.ok(pulito.length > 0, "e qualcosa da leggere deve restare");
});

prova("AR-616: un titolo già pulito non viene rovinato", () => {
  const buono = "Chiama il fornaio per confermare l'ordine";
  assert.equal(M.titoloDaMostrare(buono), buono);
});

prova("AR-616: niente e cose storte non fanno esplodere la lista", () => {
  assert.equal(M.titoloDaMostrare(null), "");
  assert.equal(M.titoloDaMostrare(undefined), "");
  assert.equal(typeof M.titoloDaMostrare({}), "string");
});

// ── ④ AR-614 · nessun colore senza la gemella del tema scuro ────────────────
//
// Rompendo una riga della tavolozza (togliere `dark:border-red-900/50` da `classiBordo("rosso")`)
// il primo caso diventa rosso e dice quale classe è rimasta indietro.

prova("AR-614: il guardiano dei colori riconosce una tinta che vive solo nel tema chiaro", () => {
  // Prima si prova il metro, poi si misura: un guardiano che non sa dire «colpevole» non prova nulla.
  assert.deepEqual(M.tintaSoloChiara("border-red-200"), ["border-red-200"], "chiara e sola: colpevole");
  assert.deepEqual(M.tintaSoloChiara("border-red-200 dark:border-red-900/50"), [], "con la gemella: assolta");
  assert.deepEqual(M.tintaSoloChiara("bg-red-500"), [], "una tinta piena regge su tutti e due i fondi");
  assert.deepEqual(M.tintaSoloChiara("text-amber-700"), ["text-amber-700"], "anche i testi scuri sono tarati sul chiaro");
});

prova("AR-614: NESSUNA classe prodotta dal modulo resta indietro in tema scuro", () => {
  const colpevoli = [];
  for (const c of M.tutteLeClassi()) colpevoli.push(...M.tintaSoloChiara(c));
  assert.deepEqual(colpevoli, [], `queste tinte non hanno la gemella scura: ${colpevoli.join(", ")}`);
});

prova("AR-614: i tre livelli di rischio si distinguono davvero fra loro", () => {
  const b = ["rosso", "giallo", "verde"].map((l) => M.classiBordo(l));
  assert.equal(new Set(b).size, 3, "tre livelli, tre bordi diversi");
  assert.equal(M.classiBordo("boh"), M.classiBordo("?"), "un livello sconosciuto non rompe la card");
});

// ── ⑤ AR-607 · la promessa di una schermata di guasto ───────────────────────

prova("AR-607: se è caduta tutta la Cabina, NON si promette che il resto funziona", () => {
  // È il difetto, in una riga: la vecchia schermata diceva «Il resto del Pannello funziona» proprio
  // quando non restava niente. Una promessa più larga di quello che è vero.
  const g = M.messaggioGuasto("cabina");
  assert.equal(g.restaIlResto, false);
  assert.ok(!/resto del Pannello funziona/i.test(g.promessa), `promessa troppo larga: ${g.promessa}`);
  assert.match(g.promessa, /ricarica/i, "e deve dire cosa fare adesso");
});

prova("AR-607: se è caduta una casella sola, la promessa si può fare — ed è vera", () => {
  const g = M.messaggioGuasto("casella", "Numeri");
  assert.equal(g.restaIlResto, true);
  assert.match(g.promessa, /resto del Pannello funziona/i);
  assert.equal(g.riprovaLocale, true, "e si riprova QUI, senza ricaricare la pagina");
  assert.match(g.titolo, /Numeri/, "il titolo dice quale casella è caduta");
});

prova("AR-607: la promessa non può mai essere più larga di quello che è rimasto", () => {
  // La regola in astratto, così non serve ricordarsela: se non resta il resto, non lo si dice.
  for (const ambito of ["casella", "cabina"]) {
    const g = M.messaggioGuasto(ambito, "X");
    if (!g.restaIlResto) assert.ok(!/resto del Pannello funziona/i.test(g.promessa), `${ambito}: promette troppo`);
    if (!g.restaIlResto) assert.equal(g.riprovaLocale, false, `${ambito}: non può promettere un riprova locale`);
  }
});

// ── ⑥ AR-602 · la risposta vecchia sotto il bollino nuovo ───────────────────
//
// Rompendo `dettaglioScaduto` (fargli tornare sempre `false`) i primi tre casi diventano rossi: è
// lo stato in cui la copia messa da parte vinceva sempre.

const VECCHIA = { id: "l1", stato: "in_corso", updated_at: "2026-08-14T10:00:00Z", richiesta: "fai il giro", risultato: "sto guarda" };

prova("AR-602: quando il lavoro finisce, la risposta a metà NON si mostra più", () => {
  const vivo = { id: "l1", stato: "fatto", updated_at: "2026-08-14T10:12:00Z" };
  const q = M.qualeRisposta(vivo, VECCHIA);
  assert.notEqual(q.risultato, "sto guarda", "la risposta monca di dieci minuti fa non è più quella");
  assert.equal(q.daRileggere, true, "e si va a prendere quella vera");
  assert.equal(q.richiesta, "fai il giro", "la domanda però non cambia durante un lavoro: si tiene");
});

prova("AR-602: finché il lavoro non si muove, la copia va benissimo", () => {
  const vivo = { id: "l1", stato: "in_corso", updated_at: "2026-08-14T10:00:00Z" };
  const q = M.qualeRisposta(vivo, VECCHIA);
  assert.equal(q.risultato, "sto guarda", "nessuna rilettura inutile");
  assert.equal(q.daRileggere, false);
});

prova("AR-602: basta un'ora più recente per capire che la copia è vecchia", () => {
  const vivo = { id: "l1", stato: "in_corso", updated_at: "2026-08-14T10:30:00Z" };
  assert.equal(M.dettaglioScaduto(vivo, VECCHIA), true, "il lavoro si è mosso dopo che l'ho letto");
});

prova("AR-602: anche il passaggio a «errore» invecchia la copia", () => {
  const vivo = { id: "l1", stato: "errore", updated_at: "2026-08-14T10:00:00Z" };
  assert.equal(M.dettaglioScaduto(vivo, VECCHIA), true, "stato cambiato = risposta cambiata");
});

prova("AR-602: la guardia «ce l'ho già» non blocca più la rilettura di un lavoro finito", () => {
  // Questa era la riga malata: `if (dettagli[id]?.richiesta) return` — cioè mai più.
  const finito = { id: "l1", stato: "fatto", updated_at: "2026-08-14T10:12:00Z" };
  assert.equal(M.serveRileggereDettaglio(finito, VECCHIA, false), true, "finito: si rilegge");
  assert.equal(M.serveRileggereDettaglio(finito, null, false), true, "senza copia: si legge");
  assert.equal(M.serveRileggereDettaglio(finito, VECCHIA, true), false, "una richiesta è già in volo: non se ne manda una seconda");
  const fermo = { id: "l1", stato: "in_corso", updated_at: "2026-08-14T10:00:00Z" };
  assert.equal(M.serveRileggereDettaglio(fermo, VECCHIA, false), false, "niente riletture a vuoto ogni secondo");
});

prova("AR-602: date storte o mancanti non fanno inventare uno scaduto", () => {
  assert.equal(M.dettaglioScaduto({ stato: "in_corso", updated_at: "boh" }, VECCHIA), false);
  assert.equal(M.dettaglioScaduto(null, VECCHIA), false);
  assert.equal(M.dettaglioScaduto({ stato: "fatto" }, null), false, "senza copia non c'è niente di vecchio");
});

// ── ⑦ AR-613 · le frecce fra le schede ──────────────────────────────────────

prova("AR-613: le frecce spostano di una scheda e girano in tondo", () => {
  const t = ["mosse", "proposte", "dafare"];
  assert.equal(M.schedaDopoTasto(t, "mosse", "ArrowRight"), "proposte");
  assert.equal(M.schedaDopoTasto(t, "dafare", "ArrowRight"), "mosse", "dall'ultima si torna alla prima");
  assert.equal(M.schedaDopoTasto(t, "mosse", "ArrowLeft"), "dafare", "e all'indietro uguale");
  assert.equal(M.schedaDopoTasto(t, "proposte", "Home"), "mosse");
  assert.equal(M.schedaDopoTasto(t, "proposte", "End"), "dafare");
});

prova("AR-613: un tasto qualunque non fa saltare la scheda", () => {
  const t = ["mosse", "proposte"];
  assert.equal(M.schedaDopoTasto(t, "mosse", "a"), null, "scrivere non deve spostare niente");
  assert.equal(M.schedaDopoTasto(t, "mosse", "Enter"), null);
  assert.equal(M.schedaDopoTasto([], "mosse", "ArrowRight"), null, "senza schede non si va da nessuna parte");
  assert.equal(M.schedaDopoTasto(t, "boh", "ArrowRight"), null, "da una scheda che non esiste, fermi");
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
