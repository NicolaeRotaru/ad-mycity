#!/usr/bin/env node
// 🧪 AR-593 — LA REVIEW DEL VENERDÌ È OBBLIGATORIA SULLA CARTA MA NON LASCIA I COMPITI DA TRE
// VENERDÌ.
//
// `ritmo.md` marca «OBBLIGATORIO ogni venerdì»: aggiornare il benchmark di auto-miglioramento, la
// peer review, la calibrazione, la lettera a Nicola. I prodotti reali al 13/8: benchmark 24 luglio,
// peer review 24 luglio, calibrazione 7 luglio, lettera 30 luglio. I venerdì 31/7 e 7/8 non hanno
// lasciato niente.
//
// PERCHÉ NESSUN CONTATORE L'HA DETTO: la freschezza si misurava sull'ULTIMA RIGA DI ESITO della
// corsa — che ha cinque giorni e sembra sana — e mai sui compiti che la corsa doveva lasciare. È la
// stessa malattia già curata una volta («si controlla che la sveglia sia carica, mai che qualcuno si
// sia alzato»), tornata un piano più su: ora si controlla che si sia alzato, non che abbia fatto i
// compiti.
//
// E c'è un dettaglio che la rende peggiore: `auto-miglioramento.json` porta `aggiornato: oggi`
// perché glielo riscrive `sincronizza-proposte.mjs` a ogni giro. Un controllo che guardasse la cima
// del file lo troverebbe fresco tutti i giorni mentre il benchmark dentro ha tre settimane. Per
// questo l'età si legge nel RAMO, non nella copertina.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const M = await import(join(REPO, "cervello/eta-referto.mjs"));
const S = await import(join(REPO, "cervello/salute.mjs"));

const ADESSO = Date.parse("2026-08-13T08:50:00+02:00"); // l'istante in cui il difetto è nato

test("LA TRAPPOLA: la copertina fresca non salva il ramo vecchio", () => {
  const file = {
    aggiornato: "2026-08-13 07:00", // riscritto stamattina da un altro programma
    benchmark: [{ reparto: "@content-social", progresso: [{ data: "2026-07-24", punteggio: 60 }] }],
  };
  const copertina = M.etaReferto({ dato: file, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "il file" });
  const ramo = M.etaReferto({ dato: file, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "il benchmark", dentro: "benchmark" });
  assert.equal(copertina.stato, M.FRESCO, "guardando la cima sembra tutto a posto — ed è così che il difetto è vissuto");
  assert.equal(ramo.stato, M.STANTIO, "il compito vero ha venti giorni");
});

test("i quattro compiti obbligatori sono dichiarati, con la loro età massima", () => {
  const ids = M.COMPITI_DELLA_REVIEW.map((c) => c.id);
  for (const atteso of ["benchmark", "peer-review", "calibrazione", "lettera"]) {
    assert.ok(ids.includes(atteso), `manca il compito «${atteso}» dichiarato OBBLIGATORIO in ritmo.md`);
  }
  for (const c of M.COMPITI_DELLA_REVIEW) assert.ok(c.scadenzaOre >= 24 * 7, "un venerdì saltato per un ponte non è un guasto: due di fila sì");
});

test("la VISITA legge i compiti veri sul disco e li trova fermi", () => {
  const compiti = S.leggiCompitiReview(REPO, ADESSO);
  assert.equal(compiti.length, 4);
  const esito = S.giudicaCompiti(compiti);
  assert.equal(esito.esito, "rotto", "tre venerdì senza compiti non sono uno stato sano");
  assert.ok(esito.dati.fermi.length >= 3, `attesi almeno 3 compiti fermi, trovati ${esito.dati.fermi.length}`);
  assert.match(esito.detto, /non lascia più i suoi compiti/);
});

test("il controllo esiste nell'elenco della visita: un giudizio che nessuno chiama non esiste", () => {
  const c = S.CONTROLLI.find((x) => x.id === "cervello.riti");
  assert.ok(c, "senza la voce nell'elenco, `giudicaCompiti` sarebbe l'ennesimo verdetto senza lettore");
  assert.equal(c.organo, "cervello");
});

test("compiti tutti recenti: verde. E un compito che non si trova è ⚪, non verde", () => {
  const recenti = [
    M.etaReferto({ dato: { data: "2026-08-12" }, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "A" }),
    M.etaReferto({ dato: { data: "2026-08-11" }, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "B" }),
  ];
  assert.equal(M.verdettoReferti(recenti).verde, true);
  const mancante = M.etaReferto({ dato: null, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "C" });
  assert.equal(M.verdettoReferti([...recenti, mancante]).verde, false);
});

test("una data di solo giorno si legge lo stesso: era l'ostacolo che rendeva tutto ⚪", () => {
  // I compiti scrivono «2026-07-24», senza ora. Se il timbro non si sapesse leggere, un ritardo di
  // venti giorni verrebbe raccontato come «non ho potuto misurare» — un buco al posto di un rosso.
  const r = M.etaReferto({ dato: { data: "2026-07-24" }, scadenzaOre: 24 * 9, adessoMs: ADESSO, nome: "benchmark" });
  assert.equal(r.stato, M.STANTIO);
  assert.ok(r.eta_ore > 24 * 19);
});
