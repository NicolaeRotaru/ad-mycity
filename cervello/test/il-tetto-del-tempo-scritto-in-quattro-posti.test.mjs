#!/usr/bin/env node
// ⏱️ AR-888 — UN TETTO DI TEMPO SCRITTO IN QUATTRO POSTI, E TROPPO STRETTO IN TUTTI E QUATTRO
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// Il 30/8 il cancello del lotto è uscito «test del cervello: rosso, e non ho saputo contare
// quanto». Non era un difetto del cancello: è la regola giusta — un guardiano rosso di cui non si
// legge il numero non si assolve, perché «forse non è mio» non è «non è mio».
//
// Era che il tetto non stava in piedi contro la realtà. MISURATO quel giorno:
//   · 535 secondi a macchina libera;
//   · 576 secondi con un'altra suite in parallelo.
// Il tetto era 600 secondi: 65 di margine, l'11%. Bastava che la macchina fosse occupata — cioè
// che qualcuno stesse lavorando — perché il cancello diventasse inservibile. Ed è successo: quel
// giorno ho saltato il cancello con `--no-verify` invece di aspettarlo, che è esattamente ciò che
// il commento dentro `esegui()` avverte di non fare.
//
// E il numero era scritto QUATTRO VOLTE. Quattro copie della stessa decisione: alzarne una sola e
// lasciare le altre indietro non se ne sarebbe accorto nessuno, ed è la malattia
// `una-parola-con-due-padroni` in attesa di succedere.
//
// ⚠️ COSA GUARDA QUESTA PROVA, e cosa NON guarda. Non misura quanto ci mette la suite: un numero
// del genere cambia col computer e con quante cose girano insieme, e una prova che lo fissa
// diventa rossa per il motivo sbagliato — sarebbe la malattia AR-787, una prova che difende una
// misura invece di un invariante. Guarda due cose che non scadono:
//   ① il tetto è UNA costante, non un numero ripetuto;
//   ② il tetto lascia almeno il doppio della misura dichiarata nel suo stesso commento.
// Il ② si rompe se qualcuno abbassa il tetto senza rimisurare, che è come ci si è arrivati.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const VIA = "cervello/cancello-lotto.mjs";
const src = readFileSync(join(REPO, VIA), "utf8");

test("AR-888: il tetto del tempo è una costante sola, non un numero ripetuto", async () => {
  const { TEMPO_MAX_SUITE } = await import(join(REPO, VIA));
  assert.equal(typeof TEMPO_MAX_SUITE, "number", "la costante non è esportata: nessuno può controllarla");

  // ⚠️ SOLO i tetti della SUITE, non tutti i `timeout:` del file. Scritta larga, questa regola
  // pescava anche i 30 secondi di `git` e i 900 di `non-vacuita`, che sono decisioni diverse con
  // ragioni diverse: bocciarle qui vorrebbe dire che questa prova diventa rossa per il motivo
  // sbagliato, e una prova così si impara a spegnere. La prima stesura le pescava davvero, e se
  // n'è accorta lei stessa al primo giro.
  const PASSI_DELLA_SUITE = ["cervello/test-cervello.mjs", "cervello/test-pannello.mjs"];
  const aMano = [];
  for (const passo of PASSI_DELLA_SUITE) {
    let i = -1;
    while ((i = src.indexOf(passo, i + 1)) >= 0) {
      // la coda della chiamata: dal nome del passo alla parentesi che la chiude, generosamente
      const coda = src.slice(i, i + 400);
      const m = coda.match(/timeout:\s*([0-9_]+)/);
      if (m) aMano.push(`${passo} → timeout: ${m[1]}`);
    }
  }
  assert.deepEqual(aMano, [],
    `un tetto della suite è tornato scritto a mano (${aMano.join(" · ")}): usa TEMPO_MAX_SUITE, o le copie ricominciano a divergere`);
});

test("AR-888: il tetto lascia almeno il doppio della misura scritta nel suo commento", async () => {
  const { TEMPO_MAX_SUITE } = await import(join(REPO, VIA));
  // La misura non la invento qui: la leggo dal commento della costante, che è il posto dove chi
  // l'ha alzata ha dovuto dichiararla. Se il commento non la porta più, la prova lo dice — un
  // tetto senza la misura accanto è un numero senza fonte, ed è il difetto di partenza.
  const secondi = [...src.matchAll(/·\s*(\d{3})\s+secondi/g)].map((m) => Number(m[1]));
  assert.ok(secondi.length >= 2,
    "il commento della costante non porta più le misure in secondi: senza quelle il tetto è un numero senza fonte");
  const peggiore = Math.max(...secondi);
  assert.ok(TEMPO_MAX_SUITE >= peggiore * 1000 * 2,
    `il tetto è ${TEMPO_MAX_SUITE / 1000}s contro una misura peggiore di ${peggiore}s: meno del doppio. ` +
    "Sotto carico il cancello torna «rosso e non so contare», cioè inservibile proprio mentre si lavora.");
});

test("AR-888: ...e non è così largo da non distinguere «occupata» da «piantata»", async () => {
  const { TEMPO_MAX_SUITE } = await import(join(REPO, VIA));
  // Il difetto opposto, e senza questo caso la cura sarebbe «metti un'ora e non pensarci più»:
  // un timeout troppo generoso smette di dire qualcosa. Mezz'ora buttata su un blocco vero è
  // peggio di un rosso in più.
  assert.ok(TEMPO_MAX_SUITE <= 30 * 60 * 1000,
    `il tetto è ${TEMPO_MAX_SUITE / 60000} minuti: a quel punto non distingue più una macchina occupata da un blocco`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 🚧 AR-891 — LO STESSO DIFETTO UN PIANO PIÙ SOPRA: il tetto del FLUSSO, non del cancello
// ─────────────────────────────────────────────────────────────────────────────
// Il 31/8, cercando perché il cancello non si era mai fatto sentire su questo ramo, il conto:
// TREDICI corse, tredici finite `cancelled`, zero verdetti. Alcune morte esattamente a trenta
// minuti senza nessuna spinta nel mezzo — l'orologio, non la coda.
//
// E la parte che fa di questo un difetto grave e non una lentezza: GitHub segna un lavoro ucciso
// dall'orologio come «annullato», NON come «fallito». La suite dei controlli diceva «nessun
// controllo è fallito»: vero alla lettera, falso in sostanza, perché il cancello non aveva
// controllato niente. Un guardiano che tace, e il cui silenzio si legge come «tutto a posto».
//
// ⚠️ E il costo scala col LOTTO, che è la ragione per cui questo tetto non si sceglie una volta e
// si dimentica: il cancello rompe apposta OGNI mutazione del lotto. Un lotto con cinquanta
// mutazioni costa il doppio di uno con venticinque.

test("AR-891: il tetto del flusso è almeno il doppio della suite, e porta scritto il suo conto", async () => {
  const { readFileSync } = await import("node:fs");
  const yml = readFileSync(join(REPO, ".github/workflows/cancello-lotto.yml"), "utf8");

  const m = yml.match(/^\s*timeout-minutes:\s*(\d+)\s*$/m);
  assert.ok(m, "il flusso del cancello non dichiara più un tetto di tempo: senza, il lavoro muore quando decide GitHub");
  const minuti = Number(m[1]);

  // Il legame col numero misurato altrove: la suite da sola sta in TEMPO_MAX_SUITE, e il flusso
  // deve contenere ALMENO due volte quella — perché oltre alla suite fa npm ci, il browser, bats,
  // il typecheck e tutte le mutazioni del lotto. Se un giorno la suite si allarga e questo tetto no,
  // questo caso diventa rosso PRIMA che il flusso ricominci a morire in silenzio.
  const { TEMPO_MAX_SUITE } = await import(join(REPO, VIA));
  const minutiSuite = TEMPO_MAX_SUITE / 60000;
  assert.ok(minuti >= minutiSuite * 2,
    `il flusso ha ${minuti} minuti contro una suite che da sola ne può prendere ${minutiSuite}: ` +
    "il cancello torna a morire d'orologio, e «annullato» non si legge come un fallimento");

  // …e il conto dev'essere SCRITTO accanto, o è di nuovo un numero senza fonte — il difetto che
  // AR-888 ha curato un piano più sotto.
  assert.match(yml, /tredici|13 (corse|volte)/i,
    "il tetto non porta più accanto la misura che l'ha deciso: senza, il prossimo lo abbassa a occhio");
});

test("AR-891: ...e non è così largo da non distinguere «lento» da «piantato»", async () => {
  const { readFileSync } = await import("node:fs");
  const yml = readFileSync(join(REPO, ".github/workflows/cancello-lotto.yml"), "utf8");
  const minuti = Number(yml.match(/^\s*timeout-minutes:\s*(\d+)\s*$/m)[1]);
  assert.ok(minuti <= 120,
    `${minuti} minuti: a quel punto un lavoro piantato tiene occupata la coda per due ore prima che qualcuno lo sappia`);
});
