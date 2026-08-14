#!/usr/bin/env node
// 🔢 AR-456 — IL RIASSUNTO PIÙ VECCHIO DELLA LISTA CHE RIASSUME.
//
// In `cantiere-difetti.json` convivono due cose che dovrebbero dire la stessa: la LISTA dei difetti e
// un totale SCRITTO in `meta.aperti`, aggiornato da chi passa. Divergono al primo che aggiunge una
// scheda senza toccare il meta — e il Pannello leggeva il riassunto.
//
// ⚠️ **La scheda dice «150 contro 155». Il codice, misurato il 13/8/2026 sul file vero, dice peggio:**
//
//     meta.aperti (scritto) ....... 223
//     stato === "aperto" .......... 225
//     non chiusi (aperto + da-riverificare) ... 281
//
// Tre risposte alla stessa domanda, tutte servite dallo stesso Pannello, due nella stessa pagina: il
// badge della scheda Radiografia contava i non chiusi (281) mentre la frase due riquadri sopra
// mostrava `live.aperti` (225), e la scheda Salute Onesta ripiegava sul meta scritto (223).
//
// E c'era un quarto buco, più silenzioso: `da_fare` sommava «aperto + in-corso», due stati previsti
// in un elenco scritto a mano. Lo stato `da-riverificare` non era nell'elenco — **56 difetti veri
// spariti dal numero**, non perché fossero risolti ma perché la loro etichetta non era prevista.
// È la malattia di questa corsia contata invece che colorata: ciò che non riconosco non può uscire
// come «a posto».
//
// La cura: un conto DERIVATO dalla lista a ogni lettura (un numero derivato non può invecchiare) e
// una definizione sola — chiuso, oppure da fare.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { contaDifetti, metaDerivata, cantiereSnello } = await import(join(REPO, "pannello/src/lib/cantiere-snello.ts"));
const leggi = (f) => readFileSync(join(REPO, f), "utf8");

/** Un cantiere finto della forma vera: totale scritto vecchio, lista aggiornata. */
function cantiereFinto({ aperti = 0, daRiverificare = 0, inCorso = 0, chiusi = 0, metaAperti = null } = {}) {
  const difetti = [
    ...Array.from({ length: aperti }, (_, i) => ({ id: `A-${i}`, stato: "aperto", nato: "2026-08-01" })),
    ...Array.from({ length: daRiverificare }, (_, i) => ({ id: `R-${i}`, stato: "da-riverificare", nato: "2026-08-01" })),
    ...Array.from({ length: inCorso }, (_, i) => ({ id: `C-${i}`, stato: "in-corso", nato: "2026-08-01" })),
    ...Array.from({ length: chiusi }, (_, i) => ({ id: `Z-${i}`, stato: "chiuso", nato: "2026-07-01", chiuso_il: "2026-08-05" })),
  ];
  return { difetti, meta: metaAperti == null ? {} : { aperti: metaAperti, chiusi } };
}

// ── IL CASO DELLA SCHEDA, RIPRODOTTO ────────────────────────────────────────────────────────────

test("il caso: il file scrive 150 aperti, la lista ne ha 155 — vince la lista", () => {
  const c = cantiereFinto({ aperti: 155, chiusi: 300, metaAperti: 150 });
  const m = metaDerivata(c);
  assert.equal(m.aperti, 155, "il numero servito è quello contato adesso, non quello scritto ieri");
  assert.equal(m.scritto.aperti, 150, "il totale scritto non si butta: resta visibile");
  assert.equal(m.divergenza, 5, "e si dichiara di quanto sbagliava");
  assert.equal(m.derivato_dalla_lista, true);
});

test("il totale scritto non può più vincere, nemmeno se è più comodo", () => {
  // Il verso che conta: un meta che dice MENO del vero è la bugia che fa sembrare il cantiere
  // in ordine. Se il derivato tornasse a leggere `meta.aperti`, questo diventa rosso.
  const m = metaDerivata(cantiereFinto({ aperti: 281, chiusi: 372, metaAperti: 223 }));
  assert.equal(m.aperti, 281);
  assert.notEqual(m.aperti, 223);
  assert.equal(m.divergenza, 58, "il 13/8 lo scarto vero era esattamente questo");
});

// ── LA DEFINIZIONE UNICA: chiuso, oppure da fare ────────────────────────────────────────────────

test("«da-riverificare» è un difetto da fare, non un difetto risolto", () => {
  // I 56 che sparivano: non erano chiusi, semplicemente il loro stato non era nell'elenco previsto.
  const c = contaDifetti(cantiereFinto({ aperti: 225, daRiverificare: 56, chiusi: 372 }).difetti);
  assert.equal(c.da_fare, 281, "225 + 56: nessuno sparisce perché la sua etichetta non era prevista");
  assert.equal(c.chiusi, 372);
  assert.equal(c.per_stato["da-riverificare"], 56, "e il dettaglio resta leggibile, non fuso in un totale");
});

test("uno stato mai visto conta come DA FARE: fail-closed anche sui numeri", () => {
  const difetti = [
    { id: "1", stato: "aperto" },
    { id: "2", stato: "sospeso-in-attesa-di-nicola" }, // etichetta che oggi non esiste
    { id: "3", stato: "" },
    { id: "4" }, // senza stato del tutto
    { id: "5", stato: "chiuso" },
  ];
  const c = contaDifetti(difetti);
  assert.equal(c.chiusi, 1, "solo «chiuso» chiude");
  assert.equal(c.da_fare, 4, "tutto il resto resta da fare, comprese le etichette che non conosco");
  assert.equal(c.per_stato["sospeso-in-attesa-di-nicola"], 1, "e l'etichetta nuova si vede, non si nasconde");
  assert.equal(c.per_stato["(senza stato)"], 2, "anche il vuoto ha un nome, così non passa inosservato");
});

test("una lista rotta non diventa «zero difetti»", () => {
  // Un cantiere malformato che restituisse 0 sarebbe la bugia peggiore: «nessun difetto aperto 👍».
  assert.deepEqual(contaDifetti(null), { totale: 0, chiusi: 0, da_fare: 0, per_stato: {} });
  const conBuchi = contaDifetti([null, { stato: "aperto" }, undefined, { stato: "chiuso" }]);
  assert.equal(conBuchi.totale, 2, "i buchi si scartano, i difetti veri no");
  assert.equal(conBuchi.da_fare, 1);
});

// ── UNA CASA SOLA: chi conta, conta allo stesso modo ────────────────────────────────────────────

test("cantiereSnello e metaDerivata danno lo stesso numero: non due contabilità", () => {
  const c = cantiereFinto({ aperti: 225, daRiverificare: 56, chiusi: 372, metaAperti: 223 });
  const snello = cantiereSnello(c);
  const meta = metaDerivata(c);
  assert.equal(snello.meta.aperti, meta.aperti);
  assert.equal(snello.meta.chiusi, meta.chiusi);
  assert.equal(snello.meta.aperti, 281, "e coincide con la lista di aperti che la scheda riceve e disegna");
  const apertiInviati = snello.difetti.filter((d) => d.stato !== "chiuso").length;
  assert.equal(apertiInviati, 281, "il badge conta le righe ricevute: il totale deve tornare con quelle");
});

test("il totale dei chiusi resta quello VERO anche quando la lista è una finestra", () => {
  const c = cantiereFinto({ aperti: 10, chiusi: 372 });
  const snello = cantiereSnello(c);
  assert.equal(snello.meta.chiusi, 372, "il totale non si conta sulle righe inviate");
  assert.ok(snello.troncato.chiusi_mostrati < 372, "che infatti sono una finestra");
});

// ── SUL FILE VERO ───────────────────────────────────────────────────────────────────────────────

test("sul cantiere vero il numero derivato coincide con la lista, qualunque cosa dica il meta", () => {
  const vero = JSON.parse(leggi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"));
  const m = metaDerivata(vero);
  const nonChiusi = vero.difetti.filter(Boolean).filter((d) => d.stato !== "chiuso").length;
  assert.equal(m.aperti, nonChiusi, "derivato e lista devono coincidere sempre, per costruzione");
  assert.equal(m.chiusi, vero.difetti.filter(Boolean).filter((d) => d.stato === "chiuso").length);
  // Il conto totale non può perdere pezzi per strada.
  const conto = contaDifetti(vero.difetti);
  assert.equal(conto.chiusi + conto.da_fare, conto.totale, "ogni difetto sta in una delle due colonne");
  assert.equal(
    Object.values(conto.per_stato).reduce((s, n) => s + n, 0),
    conto.totale,
    "e la somma per stato torna al totale: nessuna etichetta scompare",
  );
});

// ── LE ROTTE NON LEGGONO PIÙ IL RIASSUNTO ───────────────────────────────────────────────────────

/** Toglie i commenti: il difetto NOMINATO in una spiegazione non è il difetto. */
function soloCodice(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\*)/.test(r))
    .join("\n");
}

test("nessuna rotta legge più `meta.aperti` dal file", () => {
  for (const r of [
    "pannello/src/app/api/memoria/salute-onesta/route.ts",
    "pannello/src/app/api/memoria/auto-radiografia/route.ts",
  ]) {
    const codice = soloCodice(leggi(r));
    assert.doesNotMatch(codice, /meta\?\.aperti|meta\.aperti/, `${r} non deve più fidarsi del totale scritto`);
    assert.match(codice, /contaDifetti|metaDerivata/, `${r} deve derivare il conto dalla lista`);
  }
});

test("la rotta della salute non serve più il meta grezzo del file", () => {
  const src = leggi("pannello/src/app/api/memoria/salute-onesta/route.ts");
  assert.doesNotMatch(src, /cantiere_meta:\s*cj\?\.meta/, "il meta servito dev'essere quello derivato");
  assert.match(src, /cantiere_meta:\s*cj \? metaDerivata\(cj\)/);
});

test("«da fare» non è più una somma di stati previsti a mano", () => {
  const src = leggi("pannello/src/app/api/memoria/auto-radiografia/route.ts");
  assert.doesNotMatch(
    src,
    /da_fare:\s*aperti == null \|\| in_corso == null \? null : aperti \+ in_corso/,
    "la somma «aperto + in-corso» lasciava fuori i da-riverificare",
  );
  assert.match(src, /da_fare: aperti/, "«da fare» è tutto ciò che non è chiuso");
});

test("se il cantiere NON è stato letto i conteggi restano null, non zero", () => {
  // AR-449 non deve regredire mentre si cura AR-456: zero è un fatto, null è l'assenza di un fatto.
  const src = leggi("pannello/src/app/api/memoria/auto-radiografia/route.ts");
  assert.match(src, /const conto = cantiereLetto \? contaDifetti\(/, "senza lettura non si conta niente");
  assert.match(src, /const aperti = conto \? conto\.da_fare : null/, "e il numero resta null");
});
