// Voce 2 della pagella — «sa prevedere le conseguenze delle sue mosse» (node --test, nessun I/O).
//
// Il 25/7 la voce diceva «0 reparti su 14». Sembrava un giudizio severo ma onesto. Non lo era:
// 36 delle 42 «previsioni» nel registro non erano previsioni. Il ponte `da-loop` legge i campi
// `atteso` e `reale` delle righe ESITO dei quaderni — che per contratto sono PROSA — e ne pescava
// il primo numero che trovava. Da «L-443 + Bacheca stime complete» tirava fuori -443, e nasceva
// una previsione mancata al 101%.
//
// La macchina non stava sbagliando le previsioni: non ne stava facendo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { numeroDichiarato, normReparto, nonEUnaPrevisione, debitoDiMisura } from "../calibrazione.mjs";

// ────────────────────────────────────────────────────────────────────────────
// Il parser che fabbricava previsioni dal nulla.

test("numeroDichiarato(): un numero dichiarato passa, con o senza unità", () => {
  assert.equal(numeroDichiarato("5"), 5);
  assert.equal(numeroDichiarato("0"), 0);
  assert.equal(numeroDichiarato("12%"), 12);
  assert.equal(numeroDichiarato("3 ordini"), 3);
  assert.equal(numeroDichiarato("1,5"), 1.5);
  assert.equal(numeroDichiarato(" 7 "), 7);
});

// ⬇️ I casi VERI presi dal registro: è da queste frasi che nascevano le previsioni finte.
test("numeroDichiarato(): una frase di diario NON è una previsione", () => {
  assert.equal(numeroDichiarato("L-443 + Bacheca stime complete"), null, "prima dava -443");
  assert.equal(numeroDichiarato("sentinella cassa_sconosciuta 92 giri 03:40"), null, "prima dava 92");
  assert.equal(
    numeroDichiarato("nessuna consegna reale esiste ancora - blocco strutturale (0 ordini consegnati dal 1/7)"),
    null,
    "prima dava 0",
  );
  assert.equal(numeroDichiarato("trovare consegne senza recensione e preparare messaggio"), null);
  assert.equal(numeroDichiarato("Nicola esegue comando BURN_MENSILE_EUR sul terminale VPS"), null);
});

test("numeroDichiarato(): niente e vuoto non diventano zero", () => {
  // Un campo vuoto letto come 0 sarebbe la stessa bugia in versione silenziosa.
  assert.equal(numeroDichiarato(""), null);
  assert.equal(numeroDichiarato("   "), null);
  assert.equal(numeroDichiarato(null), null);
  assert.equal(numeroDichiarato(undefined), null);
});

test("numeroDichiarato(): un numero seguito da DUE parole è prosa, non una misura", () => {
  // «92 giri 03:40» è il caso che ha inquinato metà registro: comincia con un numero ma non lo è.
  assert.equal(numeroDichiarato("92 giri 03:40"), null);
  assert.equal(numeroDichiarato("7 su 10"), null);
  assert.equal(numeroDichiarato("3 ordini consegnati"), null);
});

// ────────────────────────────────────────────────────────────────────────────
// Lo stesso reparto contato due volte.

test("normReparto(): @AD e @ad sono lo stesso reparto", () => {
  // Nel registro convivevano @AD (3 previsioni) e @ad (6): prove spezzate a metà, e nessuna metà
  // arrivava al campione minimo. L'AD è l'unico reparto che la voce 2 pretende per forza.
  assert.equal(normReparto("@AD"), normReparto("@ad"));
  assert.equal(normReparto("AD"), "@ad");
  assert.equal(normReparto(" @Finanza "), "@finanza");
  assert.equal(normReparto(""), "");
  assert.equal(normReparto(null), "");
});

// ────────────────────────────────────────────────────────────────────────────
// Le 36 righe fabbricate smettono di contare, ma non si cancellano.

test("nonEUnaPrevisione(): le righe del ponte rotto non entrano nel punteggio", () => {
  assert.equal(nonEUnaPrevisione({ metrica: "esito_loop", stato: "mancata" }), true);
});

test("nonEUnaPrevisione(): le righe del ponte CORRETTO contano, e le previsioni vere pure", () => {
  // Se escludessi tutto il ponte, il fix spegnerebbe anche gli esiti legittimi futuri.
  assert.equal(nonEUnaPrevisione({ metrica: "esito_loop_numerico", stato: "azzeccata" }), false);
  assert.equal(nonEUnaPrevisione({ metrica: "ordini_totali", stato: "mancata" }), false);
  assert.equal(nonEUnaPrevisione(null), false);
});

// ────────────────────────────────────────────────────────────────────────────
// L'amnistia delle 06:20.

test("debitoDiMisura(): una previsione oltre la data è DOVUTA, non dimenticata", () => {
  const r = debitoDiMisura([{ id: "A", stato: "aperta", entro: "2026-07-01" }], "2026-07-25");
  assert.equal(r.dovute.length, 1);
  assert.equal(r.totale, 1);
});

test("debitoDiMisura(): una previsione ancora nei tempi non è un debito", () => {
  const r = debitoDiMisura([{ id: "A", stato: "aperta", entro: "2026-08-01" }], "2026-07-25");
  assert.equal(r.totale, 0, "chiedere il conto prima della scadenza sarebbe un falso allarme");
});

// ⬇️ Il punto dell'intera funzione.
test("debitoDiMisura(): «scaduta» senza reale resta un debito — lo sweep non è un condono", () => {
  // Ogni giro `calibrazione.mjs scadute` marca scaduta e il giro tira dritto. Nei fatti alle 06:20
  // «devi misurare» diventava «pazienza», in silenzio. Cinque previsioni sono morte così.
  const r = debitoDiMisura([{ id: "A", stato: "scaduta", entro: "2026-07-01", reale: null }], "2026-07-25");
  assert.equal(r.scadute.length, 1);
  assert.equal(r.totale, 1);
});

test("debitoDiMisura(): una scaduta MISURATA in ritardo è saldata", () => {
  const r = debitoDiMisura([{ id: "A", stato: "scaduta", entro: "2026-07-01", reale: 3 }], "2026-07-25");
  assert.equal(r.totale, 0, "misurare tardi è comunque misurare: il debito si chiude");
});

test("debitoDiMisura(): le previsioni già chiuse non contano", () => {
  const r = debitoDiMisura(
    [
      { id: "A", stato: "azzeccata", entro: "2026-07-01", reale: 1 },
      { id: "B", stato: "mancata", entro: "2026-07-01", reale: 9 },
    ],
    "2026-07-25",
  );
  assert.equal(r.totale, 0);
});

test("debitoDiMisura(): registro vuoto = nessun debito, non un errore", () => {
  assert.equal(debitoDiMisura([], "2026-07-25").totale, 0);
  assert.equal(debitoDiMisura(undefined, "2026-07-25").totale, 0);
});
