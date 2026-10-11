#!/usr/bin/env node
// AR-766 — «zero decadute» letto come «il decadimento non gira»: un motore giudicato dal cimitero.
//
// LA RADICE. Il guardiano dell'apprendimento aveva una regola sola: se le lezioni vive superano 400
// e le decadute sono zero, allora «il decadimento non gira, l'archivio è un cimitero». Ma il motore
// del decadimento toglie 0,15 di confidenza ogni SETTE giorni e uccide sotto 0,3: partendo da 0,8
// servono più di due mesi perché muoia la prima. Zero morti con i passi che girano è lo stato
// NORMALE di un motore lento, non un guasto.
//
// IL CONTO, misurato il 17/8 sull'archivio vero: 323 lezioni portavano un passo di decadimento
// timbrato fra il 12 e il 17 agosto, e la confidenza minima era scesa da 0,8 a 0,33 — a un passo
// dalla soglia. Il motore stava lavorando sotto gli occhi del guardiano, che intanto diceva a Nicola
// che era fermo.
//
// PERCHÉ CONTA, ed è il motivo per cui non è un dettaglio: questo verdetto Nicola lo legge. Un
// guardiano che sbaglia diagnosi su un organo sano manda a riparare ciò che funziona, e nel frattempo
// il problema vero — l'archivio troppo grande — resta senza nome.
//
// COSA PROVA QUESTO FILE:
//   ① passi recenti e zero morti = motore LENTO, non fermo (il caso dell'archivio vero);
//   ② zero passi recenti e zero morti = motore FERMO davvero, e va detto con quelle parole;
//   ③ il confine dei giorni si misura sul timbro, non a occhio: un passo di ieri conta, uno di due
//      mesi fa no;
//   ④ la confidenza minima riportata è quella VERA della lezione messa peggio: è il numero che dice
//      «quanto manca alla prima morte», e senza quello «lento» resterebbe una parola;
//   ⑤ un archivio con timbri illeggibili o assenti non diventa «gira»: in mancanza di prove si dice
//      fermo, perché è il verdetto che fa guardare;
//   ⑥ sull'archivio VERO, giudicato nell'istante in cui il motore ha fatto il suo ultimo passo, il
//      guardiano non dice «non gira» (AR-958);
//   ⑥bis sull'archivio VERO, con l'orologio vero, il verdetto dice quello che i passi dicono — nei
//      due versi: «gira» se ci sono passi recenti, «fermo davvero» se non ce ne sono;
//   ⑦ `analizza` giudica davvero nell'istante che le si dà: lo stesso archivio finto, con i passi
//      timbrati in un giorno fisso, è «gira» un'ora dopo e «fermo» un mese dopo (AR-958).
//
// PERCHÉ ⑥ HA UN OROLOGIO SUO (AR-958, 11/10). Fino al 1/9 il motore faceva passi ogni giorno e ⑥
// usava l'orologio vero. Poi il motore non ha più fatto passi: l'ultimo è del 1/9 alle 11:32, e dal
// 15/9 nessun passo è più «recente». Perché si sia fermato questa prova non lo sa e non lo dice: lo
// dice il giro. Il guardiano allora diceva giusto — «fermo davvero» — e la prova lo bocciava,
// perché pretendeva un «gira» che era diventato falso. Una prova che chiede al mondo di stare in un
// certo stato non prova il codice: misura il mondo. ⑥ rifà il giudizio sull'archivio vero nel
// momento in cui il motore lavorava, ⑥bis controlla che col giorno di oggi il verdetto non menta.
//
// E L'ARCHIVIO CAMBIERÀ ANCORA (collaudo dell'11/10). Due lezioni stanno a confidenza 0,32 e quattro
// a 0,35: al prossimo passo ne muoiono cinque, il massimo che il motore uccide in un giro (rifatto col
// motore vero, `cristallizza-apprendimento.mjs`). Con la prima morte la riga sulle decadute sparisce, perché il
// guardiano la scrive solo con zero morti sopra le 400 vive. Una prova che pretendesse quella riga
// tornerebbe rossa al primo giro sano — di nuovo il mondo, non il codice. Perciò ⑥ e ⑥bis giudicano
// la riga quando c'è, e quando non c'è controllano che manchi per la ragione giusta; il caso che non
// dipende dall'archivio vero è ⑦, ed è quello che tiene in piedi la non-vacuità.
//
// NON-VACUITÀ (verificata il 17/8 rompendo il fix apposta): facendo tornare `passiDecadimento` a
// dichiarare sempre fermo (`fermo: true`), i casi ① ⑥ diventano ROSSI. L'11/10: togliendo `adesso`
// dalla chiamata dentro `analizza`, ⑦ torna ROSSO (giudica con l'orologio vero) — e anche ⑥, finché
// sull'archivio vero la riga sulle decadute esiste.

import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GIORNI_PASSO_RECENTE, analizza, passiDecadimento } from "../apprendimento-guardiano.mjs";
import { msDaTimbro } from "../ora-piacenza.mjs";

const REPO = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const ARCHIVIO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

const ADESSO = "2026-08-17T12:00:00Z";
const giorniFa = (n) => new Date(Date.parse(ADESSO) - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");

const lez = (id, conf, passo) => ({ id, testo: `regola ${id}`, stato: "attiva", confidenza: conf, decaduto_step_il: passo });

// ── ① Passi recenti + zero morti = lento, non fermo ──────────────────────────────────────────────

test("① con i passi che girano il motore è LENTO, non fermo", () => {
  const vive = [lez("L-1", 0.33, giorniFa(1)), lez("L-2", 0.5, giorniFa(3)), lez("L-3", 0.8, giorniFa(6))];
  const p = passiDecadimento(vive, ADESSO);
  assert.equal(p.fermo, false, "tre passi nell'ultima settimana: dire «fermo» sarebbe falso");
  assert.equal(p.passiRecenti, 3);
});

// ── ② Zero passi = fermo davvero ─────────────────────────────────────────────────────────────────

test("② senza nessun passo recente il motore è fermo, e si dice", () => {
  const vive = [lez("L-1", 0.8, giorniFa(60)), lez("L-2", 0.9, giorniFa(90))];
  const p = passiDecadimento(vive, ADESSO);
  assert.equal(p.fermo, true);
  assert.equal(p.passiRecenti, 0);
});

// ── ③ Il confine si misura, non si stima ─────────────────────────────────────────────────────────

test("③ il confine dei giorni è esatto: dentro conta, fuori no", () => {
  const dentro = passiDecadimento([lez("L-1", 0.8, giorniFa(GIORNI_PASSO_RECENTE - 1))], ADESSO);
  assert.equal(dentro.passiRecenti, 1);

  const fuori = passiDecadimento([lez("L-1", 0.8, giorniFa(GIORNI_PASSO_RECENTE + 1))], ADESSO);
  assert.equal(fuori.passiRecenti, 0, "un passo più vecchio della finestra non tiene in vita il verdetto");
});

// ── ④ La confidenza minima è quella vera ─────────────────────────────────────────────────────────

test("④ riporta la confidenza della lezione messa peggio, non una media", () => {
  const p = passiDecadimento([lez("L-1", 0.9, giorniFa(1)), lez("L-2", 0.33, giorniFa(1))], ADESSO);
  assert.equal(p.minConfidenza, 0.33, "è il numero che dice quanto manca alla prima morte");
});

// ── ⑤ Al buio non si dichiara «gira» ─────────────────────────────────────────────────────────────

test("⑤ senza timbri leggibili il verdetto resta fermo: al buio non si dà via libera", () => {
  const senza = passiDecadimento([{ id: "L-1", stato: "attiva", confidenza: 0.8 }], ADESSO);
  assert.equal(senza.fermo, true);

  const rotto = passiDecadimento([lez("L-1", 0.8, "non-una-data")], ADESSO);
  assert.equal(rotto.fermo, true, "una data illeggibile non è un passo: è un buco");

  assert.equal(passiDecadimento([], ADESSO).fermo, true);
  assert.equal(passiDecadimento([null, undefined], ADESSO).passiRecenti, 0, "non deve nemmeno rompere");
});

// ── ⑥ Sull'archivio VERO il guardiano non dice più «non gira» ────────────────────────────────────

/** Il guardiano scrive la riga sulle decadute solo con più di 400 vive e zero morti: se manca, deve
 *  mancare per una di queste due ragioni, non perché il verdetto si è perso per strada. */
function rigaDecaduteAssenteConRagione(r) {
  assert.ok(
    r.decadute > 0 || r.vive.length <= 400,
    `la riga sulle decadute manca, ma le vive sono ${r.vive.length} e le decadute ${r.decadute}: doveva esserci`,
  );
}

test("⑥ sull'archivio vero il verdetto non accusa più il motore di essere fermo", () => {
  const dati = JSON.parse(readFileSync(ARCHIVIO, "utf8"));

  // L'istante del giudizio è quello dell'ultimo passo VERO del motore sulle lezioni VIVE, letto
  // dall'archivio stesso (col fuso di Piacenza, come lo legge il guardiano), più un'ora. Non una
  // data scritta qui. Le vive non dipendono dall'orologio: le si prende dal guardiano stesso.
  const vive = analizza(dati).vive;
  const passi = vive.map((l) => msDaTimbro(l?.decaduto_step_il)).filter(Number.isFinite);
  assert.ok(passi.length > 0, "prerequisito: l'archivio vero ha almeno un passo di decadimento timbrato");
  const adesso = Math.max(...passi) + 60 * 60 * 1000;

  const r = analizza(dati, { adesso });

  // In quell'istante il motore stava DAVVERO facendo passi: lo si misura qui, con lo stesso orologio.
  const p = passiDecadimento(r.vive, adesso);
  assert.ok(p.passiRecenti > 0, `prerequisito: passi recenti sull'archivio vero (trovati ${p.passiRecenti})`);
  assert.equal(p.fermo, false);

  const suiDecaduti = r.problemi.filter((x) => x.includes("decadute"));
  assert.ok(suiDecaduti.length <= 1, "una riga sola sulle decadute: due verdetti sullo stesso motore si contraddirebbero");
  if (suiDecaduti.length === 0) return rigaDecaduteAssenteConRagione(r);

  assert.match(
    suiDecaduti[0],
    /il decadimento GIRA/,
    "col motore che fa passi il verdetto deve dirlo: «non gira» è una diagnosi falsa su un organo sano",
  );
  assert.doesNotMatch(suiDecaduti[0], /il decadimento non gira|è FERMO davvero/);
});

// ── ⑥bis Sull'archivio VERO, oggi: il verdetto dice quello che i passi dicono, nei due versi ──────

test("⑥bis sull'archivio vero, col giorno di oggi, il verdetto non mente in nessuno dei due versi", () => {
  const dati = JSON.parse(readFileSync(ARCHIVIO, "utf8"));
  const r = analizza(dati);
  const suiDecaduti = r.problemi.filter((x) => x.includes("decadute"));
  assert.ok(suiDecaduti.length <= 1, "una riga sola sulle decadute");
  if (suiDecaduti.length === 0) return rigaDecaduteAssenteConRagione(r);

  // I passi si contano qui, con lo stesso orologio del verdetto: è il fatto contro cui lo si misura.
  const p = passiDecadimento(r.vive);
  if (p.passiRecenti > 0) {
    assert.match(suiDecaduti[0], /il decadimento GIRA/, `ci sono ${p.passiRecenti} passi recenti: dire «fermo» sarebbe falso`);
    assert.doesNotMatch(suiDecaduti[0], /è FERMO davvero/);
  } else {
    assert.match(suiDecaduti[0], /è FERMO davvero/, "nessun passo recente: dire «gira» coprirebbe una macchina ferma");
    assert.doesNotMatch(suiDecaduti[0], /il decadimento GIRA/);
  }
});

// ── ⑦ `analizza` giudica nell'istante che le si dà, non in quello del calendario ─────────────────

test("⑦ lo stesso archivio è «gira» un'ora dopo l'ultimo passo e «fermo» un mese dopo (AR-958)", () => {
  // Un archivio finto che passa la soglia delle 400 vive con zero morti, tutte col passo timbrato lo
  // stesso giorno. Il giorno è fisso e lontano dall'oggi: se `analizza` ignorasse l'istante dato e
  // guardasse l'orologio vero, il primo verdetto direbbe «fermo» — ed è proprio il difetto.
  const PASSO = "2026-08-01 10:00";
  const dati = { meta: { decadute: 0 }, lezioni: Array.from({ length: 410 }, (_, i) => lez(`L-${i}`, 0.65, PASSO)) };
  const ultimoPasso = msDaTimbro(PASSO);
  assert.ok(Number.isFinite(ultimoPasso), "prerequisito: il timbro finto si legge");

  const unOraDopo = analizza(dati, { adesso: ultimoPasso + 60 * 60 * 1000 });
  assert.equal(unOraDopo.vive.length, 410, "prerequisito: le lezioni finte contano come vive");
  const rigaGira = unOraDopo.problemi.filter((x) => x.includes("decadute"));
  assert.equal(rigaGira.length, 1, "sopra le 400 vive con zero morti la riga sulle decadute c'è");
  assert.match(rigaGira[0], /il decadimento GIRA: 410 passi/, "un'ora dopo il passo il motore gira, e va detto");

  const unMeseDopo = analizza(dati, { adesso: ultimoPasso + 30 * 24 * 60 * 60 * 1000 });
  const rigaFermo = unMeseDopo.problemi.filter((x) => x.includes("decadute"));
  assert.equal(rigaFermo.length, 1);
  assert.match(rigaFermo[0], /è FERMO davvero/, "un mese senza passi è un motore fermo, e va detto con quelle parole");
});
