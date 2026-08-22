#!/usr/bin/env node
// 🏪 IL CONTO DEL SITO CHE DICE ZERO — la prova del conteggio dei difetti del marketplace.
//
// LA MALATTIA: «il contatore che cerca nel posto sbagliato e risponde zero». Il 18/8/2026 il referto
// del marketplace ha cambiato forma — i problemi da `dimensioni[].findings` a un elenco unico
// `problemi[]`, gli stati da `chiuso` a `riparato`/`gia_riparato_prima`. Chi contava ha continuato a
// cercare nella forma vecchia, e cercare dove non c'è niente non dà errore: dà ZERO.
//
// IL CONTO CHE L'HA MISURATA, il 20/8/2026 sul referto vero: **245 problemi, 29 aperti** (1
// bloccante, 15 gravi, 13 minori), 216 chiusi. Negli stessi minuti la Cabina diceva «12 bloccanti»
// in home e «245 problemi» nella pagina — la fotografia del 18/8, prima di ogni riparazione — e
// `allinea-scan-cantiere.mjs` stava per scrivere `findings_aperti: 0`, che nella rotta avrebbe vinto
// sul 245 (`sync_scan.findings_aperti ?? meta.findings`: **0 non è nullish**).
//
// COSA PROVA QUESTO FILE, eseguendo le decisioni invece di cercarle:
//   ① la casa unica conta il referto VERO e dà 29 aperti su 245, con la somma che torna
//   ② la logica VECCHIA, eseguita qui sullo stesso referto vero, dà 0 — il difetto è riprodotto
//   ③ un referto che dichiara N problemi e non ha lista NON diventa zero: `letto:false`, conti `null`
//   ④ il blocco che il giro scrive (`syncScanMarketplace`) non contiene mai uno zero non letto
//   ⑤ uno stato mai visto prima resta APERTO e la somma continua a tornare
//   ⑥ una severità mai vista finisce in `altre` invece di sparire
//   ⑦ la forma VECCHIA del referto si legge ancora: i referti d'archivio non diventano illeggibili
//   ⑧ la scheda riceve solo gli aperti, col numero dei riparati, e il «dove» dal campo nuovo
//   ⑨ il gemello TypeScript del Pannello dà gli STESSI numeri, campo per campo
//
// NON-VACUITÀ (eseguita, non dedotta): il caso ② fallisce se la logica vecchia smettesse di dare
// zero, cioè è la misura viva del difetto. Il caso ② non guarda più QUANTI problemi restano aperti:
// il 22/8 sono arrivati a zero e la prova è diventata rossa sul lavoro finito, che è l'errore che
// questo stesso file denuncia due volte (un numero fissato dentro una prova scade). Rimettendo `STATI_CHIUSI = ["chiuso"]` in
// `cervello/radiografia-marketplace-conti.mjs` diventano rossi ① ④ ⑨; togliendo il ramo
// «dichiarati > 0 → illeggibile» diventano rossi ③ ④; togliendo `altre` diventa rosso ⑥;
// togliendo `doveDi` diventa rosso ⑧.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  contoMarketplace,
  dimensioniDaDisegnare,
  problemiDelReferto,
  eChiuso,
  doveDi,
} from "../radiografia-marketplace-conti.mjs";
import { syncScanMarketplace } from "../allinea-scan-cantiere.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Le tre parole che chiudono un problema. Scritte qui a mano apposta: se una delle due case ne
 * aggiunge o toglie una senza dirlo, questo elenco resta indietro e il caso ⑨ diventa rosso. */
const STATI_CHIUSI_ATTESI = ["chiuso", "riparato", "gia_riparato_prima"];

// Il gemello TypeScript si importa diretto (Node ≥22.18). In cima e non dentro un caso: un `await`
// dentro un test girerebbe dopo il conteggio e un `1 = 2` stamperebbe «pass» (AR-694).
const pannello = await import(join(REPO, "pannello/src/lib/radiografia-marketplace-conti.ts"));

const VERO = JSON.parse(
  readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json"), "utf8"),
);

/** La logica ESATTA che stava in `allineaMarketplace` prima del fix. Tenuta qui per riprodurre il difetto. */
function contoVecchio(digest) {
  let aperti = 0;
  let chiusi = 0;
  for (const dim of digest.dimensioni || []) {
    for (const f of dim.findings || []) {
      if (f.stato === "chiuso") chiusi++;
      else aperti++;
    }
  }
  return { aperti, chiusi };
}

/** Un referto finto della forma NUOVA. */
function referto(problemi, { dichiarati = problemi.length, data = "2026-08-18" } = {}) {
  return { data, meta: { findings: dichiarati }, dimensioni: [], problemi };
}
const pb = (stato, severita = "grave", extra = {}) => ({ stato, severita, titolo: `x-${stato}-${severita}`, dimensione: "qa-flussi", ...extra });

// ── ① IL REFERTO VERO ────────────────────────────────────────────────────────────────────────────

test("① sul referto vero la somma torna, e il conto è quello che dice l'elenco", () => {
  const c = contoMarketplace(VERO);
  assert.equal(c.letto, true, "il referto vero deve essere leggibile");
  // Il totale non si fissa qui: si chiede al referto stesso. Era scritto 245 — la misura del 18/8 —
  // e il 21/8, alla prima radiografia nuova (199), questa prova e' diventata rossa senza che niente
  // fosse rotto. Un numero copiato dentro una prova scade il giorno in cui la realta' cambia, ed e'
  // la stessa ragione per cui gli aperti, qui sotto, si contano a mano sull'elenco invece di essere
  // scritti. Il testimone e' `meta.findings`: il referto dichiara quanti sono, e il conto deve
  // tornare con quello.
  assert.equal(c.totale, VERO.meta.findings);

  // Il numero degli aperti cambia a ogni lotto di riparazioni: fissarlo qui
  // vorrebbe dire una prova rossa a ogni giro di lavoro, e una prova che si
  // aggiorna per abitudine smette di essere una prova. Si controlla invece
  // l'invariante: il conto deve essere ESATTAMENTE quello che si ricava
  // contando a mano l'elenco, con lo stesso vocabolario di stati.
  const apertiAMano = VERO.problemi.filter(
    (p) => !["chiuso", "riparato", "gia_riparato_prima"].includes(String(p.stato ?? "").trim().toLowerCase()),
  ).length;
  assert.equal(c.aperti, apertiAMano, "gli aperti devono coincidere col conto a mano sull'elenco");
  assert.equal(c.chiusi, VERO.problemi.length - apertiAMano);
  assert.equal(c.aperti + c.chiusi, c.totale, "aperti + chiusi deve fare il totale");
  assert.equal(c.divergenza_dal_dichiarato, 0, "il file deve essere coerente col totale che dichiara");
  const s = c.aperti_per_severita;
  assert.equal(s.bloccante + s.grave + s.minore + s.altre, c.aperti, "i rami di gravità devono fare gli aperti");
});

// ── ② IL DIFETTO, RIPRODOTTO ─────────────────────────────────────────────────────────────────────

test("② la logica vecchia, sullo stesso referto vero, risponde zero: è il difetto, eseguito", () => {
  const v = contoVecchio(VERO);
  assert.equal(v.aperti, 0, "la logica vecchia cerca in dimensioni[].findings, che dal 18/8 è vuoto");
  assert.equal(v.chiusi, 0);
  // E questo è il punto che rendeva lo zero peggiore del 245: nella rotta `0 ?? 245` vale 0.
  assert.equal(v.aperti ?? VERO.meta.findings, 0, "«0 non è nullish»: lo zero vince sul totale del referto");
  // La casa unica, sullo stesso file, non ci casca: legge l'elenco e trova
  // quello che c'è davvero, qualunque numero sia oggi.
  //
  // 22/8/2026 — QUI C'ERA SCRITTO `aperti > 0`, E IL 22 AGOSTO È DIVENTATO ROSSO
  // PERCHÉ I DIFETTI SONO FINITI.
  //
  // È lo stesso errore che questo file denuncia due volte più sopra — un numero
  // fissato dentro una prova scade il giorno in cui la realtà cambia — solo
  // travestito da disuguaglianza: `> 0` è «c'è sempre del lavoro aperto»,
  // scritto a mano. Il giorno in cui il cantiere arriva a zero, la prova
  // accusa il lavoro finito.
  //
  // La differenza fra le due logiche non è mai stata «quanti aperti ci sono».
  // È che la vecchia NON LEGGE l'elenco e la nuova sì. Quello si misura senza
  // dipendere da quanto lavoro resta: il totale letto (199 oggi, un altro
  // numero domani) contro lo zero cieco di prima.
  const nuovo = contoMarketplace(VERO);
  assert.equal(nuovo.letto, true, "la casa unica deve leggere l'elenco, non arrendersi");
  assert.ok(
    nuovo.totale > 0,
    "il referto vero contiene dei problemi: la casa unica li trova, chiusi o aperti che siano",
  );
  assert.equal(
    nuovo.totale,
    VERO.problemi.length,
    "e li trova tutti, mentre la logica vecchia ne trovava zero",
  );
});

// ── ③ NON LETTO NON È ZERO ───────────────────────────────────────────────────────────────────────

test("③ un referto che dichiara problemi ma non ha lista non vale zero: vale «non l'ho letto»", () => {
  const cieco = { data: "2026-08-18", meta: { findings: 245 }, dimensioni: [{ chiave: "qa-flussi", totale: 16 }] };
  const c = contoMarketplace(cieco);
  assert.equal(c.letto, false);
  assert.equal(c.aperti, null, "gli aperti devono restare null, mai 0");
  assert.equal(c.chiusi, null);
  assert.equal(c.totale, null);
  assert.match(c.motivo, /non ne trovo nessuno/, "il motivo deve dire cosa non ha potuto leggere");
  assert.equal(problemiDelReferto(cieco).forma, "illeggibile");
});

test("③b un referto che dichiara ZERO problemi è invece uno zero vero", () => {
  const pulito = { data: "2026-08-18", meta: { findings: 0 }, problemi: [] };
  const c = contoMarketplace(pulito);
  assert.equal(c.letto, true, "zero dichiarato e zero trovato: è un fatto, non un buco");
  assert.equal(c.aperti, 0);
  assert.equal(c.totale, 0);
});

// ── ④ IL BLOCCO CHE IL GIRO SCRIVE ───────────────────────────────────────────────────────────────

test("④ il blocco sync_scan del giro non scrive mai uno zero non letto", () => {
  const cieco = { data: "2026-08-18", meta: { findings: 245 }, dimensioni: [] };
  const s = syncScanMarketplace(cieco, "2026-08-20 19:00");
  assert.equal(s.letto, false);
  assert.equal(s.findings_aperti, null, "è la riga che avrebbe fatto dire alla Cabina «0 problemi»");
  assert.notEqual(s.findings_aperti, 0);
  assert.ok(s.motivo, "e deve portarsi dietro il motivo, non solo il null");

  // Sul referto vero, invece, il blocco porta il numero giusto — che è quello
  // dell'elenco, non un numero fissato qui (vedi il controllo ①).
  const buono = syncScanMarketplace(VERO, "2026-08-20 19:00");
  const conto = contoMarketplace(VERO);
  assert.equal(buono.letto, true);
  assert.equal(buono.findings_aperti, conto.aperti);
  assert.equal(buono.findings_tot, VERO.meta.findings);
  assert.deepEqual(buono.aperti_per_severita, conto.aperti_per_severita);
  assert.equal(buono.data_scan, VERO.data);
});

// ── ⑤ ⑥ NIENTE SPARISCE ──────────────────────────────────────────────────────────────────────────

test("⑤ uno stato mai visto prima resta APERTO e la somma continua a tornare", () => {
  const c = contoMarketplace(referto([pb("riparato"), pb("aperto"), pb("in-forse"), pb("")]));
  assert.equal(c.totale, 4);
  assert.equal(c.chiusi, 1, "solo «riparato» chiude");
  assert.equal(c.aperti, 3, "«in-forse» e lo stato vuoto restano lavoro, non spariscono");
  assert.equal(c.per_stato["(senza stato)"], 1, "anche il niente ha un nome nel conto per stato");
  assert.equal(c.aperti + c.chiusi, c.totale);
});

test("⑥ una severità mai vista finisce in «altre» invece di sparire dal conto", () => {
  const c = contoMarketplace(referto([pb("aperto", "catastrofico"), pb("aperto", "bloccante")]));
  assert.equal(c.aperti, 2);
  assert.equal(c.aperti_per_severita.altre, 1, "la severità sconosciuta ha un ramo suo");
  assert.equal(c.aperti_per_severita.bloccante, 1);
  const s = c.aperti_per_severita;
  assert.equal(s.bloccante + s.grave + s.minore + s.altre, c.aperti);
});

// ── ⑦ I REFERTI D'ARCHIVIO ───────────────────────────────────────────────────────────────────────

test("⑦ la forma vecchia del referto si legge ancora: l'archivio non diventa illeggibile", () => {
  const vecchio = {
    data: "2026-07-29",
    meta: { findings: 3 },
    dimensioni: [
      { key: "architettura", findings: [{ stato: "chiuso", severita: "grave", titolo: "a", dove: "x.ts:1" }] },
      { key: "qa-flussi", findings: [{ severita: "bloccante", titolo: "b" }, { stato: "aperto", severita: "minore", titolo: "c" }] },
    ],
  };
  const c = contoMarketplace(vecchio);
  assert.equal(c.forma, "dimensioni");
  assert.equal(c.totale, 3);
  assert.equal(c.chiusi, 1);
  assert.equal(c.aperti, 2, "un finding senza stato, nella forma vecchia, è aperto");
  assert.equal(c.aperti_per_severita.bloccante, 1);
  assert.equal(eChiuso({ stato: "chiuso" }), true, "la parola vecchia continua a chiudere");
  assert.equal(eChiuso({ stato: "riparato" }), true, "e la nuova pure");
  assert.equal(eChiuso({ stato: "gia_riparato_prima" }), true, "compreso il «era già a posto»");
  assert.equal(eChiuso({ stato: "aperto" }), false);
});

// ── ⑧ COSA ARRIVA ALLA SCHEDA ────────────────────────────────────────────────────────────────────

test("⑧ alla scheda arrivano solo gli aperti, col numero dei riparati e il «dove» dal campo nuovo", () => {
  const dims = dimensioniDaDisegnare(VERO);
  const mostrati = dims.reduce((a, d) => a + d.findings.length, 0);
  const chiusiContati = dims.reduce((a, d) => a + d.problemi_chiusi, 0);
  const conto = contoMarketplace(VERO);
  // Come nel controllo ①: il numero cambia a ogni lotto, l'invariante no.
  assert.equal(mostrati, conto.aperti, "la scheda disegna gli aperti, non tutti i problemi del referto");
  assert.equal(chiusiContati, conto.chiusi, "e dei riparati resta il numero, che è un dato che serve");
  assert.equal(mostrati + chiusiContati, conto.totale, "quello che si disegna piu quello che si conta fa il totale");

  // Il «dove» dei referti nuovi sta nel campo `file`: senza la normalizzazione la colonna resta vuota.
  const conDove = dims.flatMap((d) => d.findings).filter((f) => f.dove);
  assert.equal(conDove.length, mostrati, "ognuno deve sapere dire dove sta");
  assert.equal(doveDi({ file: "app/x.ts:1" }), "app/x.ts:1");
  assert.equal(doveDi({ dove: "vecchio.ts:2" }), "vecchio.ts:2");

  // I nomi leggibili delle aree viaggiano col referto, così la scheda non dipende da un dizionario
  // che le chiavi nuove del 18/8 non ha mai avuto.
  assert.ok(dims.every((d) => d.nome), "ogni area deve portarsi dietro il suo nome leggibile");

  // Su un referto illeggibile la scheda NON riceve una lista vuota: riceve null, che si vede.
  assert.equal(dimensioniDaDisegnare({ meta: { findings: 245 }, dimensioni: [] }), null);
});

// ── ⑨ LE DUE CASE ────────────────────────────────────────────────────────────────────────────────

test("⑨ il gemello TypeScript del Pannello dà gli stessi numeri, campo per campo", () => {
  const casi = [
    ["referto vero", VERO],
    ["cieco", { data: "x", meta: { findings: 245 }, dimensioni: [] }],
    ["zero vero", { meta: { findings: 0 }, problemi: [] }],
    ["stati ignoti", referto([pb("riparato"), pb("aperto"), pb("in-forse"), pb("")])],
    ["severità ignota", referto([pb("aperto", "catastrofico"), pb("aperto", "bloccante")])],
    ["forma vecchia", { meta: { findings: 2 }, dimensioni: [{ key: "a", findings: [{ stato: "chiuso" }, { severita: "grave" }] }] }],
    ["senza niente", {}],
  ];
  for (const [nome, digest] of casi) {
    assert.deepEqual(
      pannello.contoMarketplace(digest),
      contoMarketplace(digest),
      `le due case divergono sul caso «${nome}»: una delle due è cambiata senza l'altra`,
    );
  }
  // E anche su cosa mandano alla scheda.
  assert.deepEqual(pannello.dimensioniDaDisegnare(VERO), dimensioniDaDisegnare(VERO));
  assert.deepEqual(pannello.STATI_CHIUSI.slice(), [...STATI_CHIUSI_ATTESI]);
});
