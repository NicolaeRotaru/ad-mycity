#!/usr/bin/env node
// 🕐 AR-414 — TRE OROLOGI DEL PANNELLO ERANO INCHIODATI ALL'ORA LEGALE.
//
// Tre rotte calcolavano «quanto è vecchio questo dato» così:
//
//     new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`)
//
// `+02:00` è l'ora legale italiana. Vale da fine marzo a fine ottobre. Negli altri cinque mesi
// dell'anno l'Italia sta a `+01:00`, e quel calcolo sbaglia di un'ora piena, sempre nella stessa
// direzione.
//
// ⚠️ **La direzione, misurata e non dedotta.** La scheda del difetto lascia intendere un dato che
// sembra più fresco; il codice dice il contrario, e comanda il codice. Una data-vault del 15 gennaio
// alle 12:00 vale davvero le 11:00 UTC; letta con `+02:00` diventa le 10:00 UTC, cioè un istante più
// indietro — quindi il dato risulta **più VECCHIO di un'ora**. Le due soglie che stanno sopra quel
// calcolo (`scan_stale`, oltre 48 ore · `dati_freschi`, sotto le 3) d'inverno scattano un'ora prima
// del dovuto. Non è il verde comprato senza guardare: è il suo gemello pessimista, un allarme che
// parte da solo. Un allarme che parte da solo è un allarme che si impara a ignorare.
//
// Le tre copie erano identiche carattere per carattere, perché la terza era stata incollata dalla
// seconda. Il fatto che nessuno le abbia fermate è il punto ⑤ della scheda: **la regola era scritta
// in un commento**, e un commento non impedisce la quarta copia.
//
// Questa prova fa tre cose, che sono le tre clausole del fix:
//   (a) esegue la funzione VERA e le chiede la stessa data-vault a gennaio e a luglio;
//   (b) fa da cancello: cerca un fuso scritto a mano nel codice del Pannello e fallisce se lo trova;
//   (c) verifica che le tre rotte siano davvero cablate alla funzione condivisa — un fix che c'è ma
//       che nessuno chiama è la trappola di AR-461.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { oreDaDataVault, vaultToIso } = await import(join(REPO, "pannello/src/lib/format.ts"));

// Le tre rotte che avevano il fuso scritto a mano.
const ROTTE = [
  "pannello/src/app/api/memoria/auto-coscienza/route.ts",
  "pannello/src/app/api/memoria/auto-radiografia/route.ts",
  "pannello/src/app/api/memoria/radiografia-marketplace/route.ts",
];

// ── (a) LA PROVA CHE CONTA: gennaio e luglio, stessa domanda ────────────────────────────────────

test("d'inverno l'età è giusta: la data-vault delle 12:00 vista alle 12:00 dello stesso giorno vale zero ore", () => {
  // 15 gennaio, l'Italia sta a +01:00. `adesso` è lo stesso istante della data-vault, quindi l'età
  // corretta è 0. Col `+02:00` cablato usciva 1: un dato appena scritto risultava vecchio di un'ora.
  const adessoInverno = Date.parse("2026-01-15T12:00:00+01:00");
  assert.equal(oreDaDataVault("2026-01-15 12:00", adessoInverno), 0);
});

test("d'estate l'età resta giusta: la stessa funzione, l'altro fuso", () => {
  const adessoEstate = Date.parse("2026-07-15T12:00:00+02:00");
  assert.equal(oreDaDataVault("2026-07-15 12:00", adessoEstate), 0);
});

test("la stessa data-vault, letta a gennaio e a luglio, dà la stessa età", () => {
  // Il cuore del difetto in una riga: 24 ore esatte devono risultare 24 in entrambe le stagioni.
  const inverno = oreDaDataVault("2026-01-14 09:30", Date.parse("2026-01-15T09:30:00+01:00"));
  const estate = oreDaDataVault("2026-07-14 09:30", Date.parse("2026-07-15T09:30:00+02:00"));
  assert.equal(inverno, 24, "d'inverno il vecchio calcolo dava 25: un'ora di vecchiaia inventata");
  assert.equal(estate, 24);
  assert.equal(inverno, estate, "l'età di un dato non può dipendere dalla stagione in cui lo guardi");
});

test("il calcolo vecchio, quello con +02:00 cablato, sbaglia davvero — e questo lo dimostra", () => {
  // Non ci si fida della memoria né della scheda: si RIESEGUE la formula malata e si misura lo scarto.
  const vecchio = (s, adesso) => {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    const [, y, mo, d, h = "12", mi = "00"] = m;
    return (adesso - new Date(`${y}-${mo}-${d}T${h}:${mi}:00+02:00`).getTime()) / 3600000;
  };
  const adessoInverno = Date.parse("2026-01-15T12:00:00+01:00");
  assert.equal(vecchio("2026-01-15 12:00", adessoInverno), 1, "la formula malata d'inverno dà +1 ora");
  assert.equal(oreDaDataVault("2026-01-15 12:00", adessoInverno), 0, "quella curata dà 0");
  // D'estate le due coincidono: ecco perché il difetto è vissuto mesi senza farsi vedere.
  const adessoEstate = Date.parse("2026-07-15T12:00:00+02:00");
  assert.equal(vecchio("2026-07-15 12:00", adessoEstate), oreDaDataVault("2026-07-15 12:00", adessoEstate));
});

test("la soglia «stantìo» delle 48 ore d'inverno scattava un'ora prima: ecco il danno vero", () => {
  // Il numero non è un'astrazione: sopra ci sta un `if`. Uno scan di 47 ore e mezza è FRESCO, ma la
  // formula malata gli dava 48,5 e la Cabina lo marcava stantìo — un allarme che parte da solo.
  const adesso = Date.parse("2026-01-17T11:30:00+01:00"); // 47,5 ore dopo il 15/1 alle 12:00
  const vero = oreDaDataVault("2026-01-15 12:00", adesso);
  assert.equal(vero, 47.5);
  assert.equal(vero > 48, false, "47,5 ore non sono «stantìo»");
  assert.equal(47.5 + 1 > 48, true, "col fuso cablato diventavano 48,5, cioè stantìo");
});

test("una data senza ora vale mezzogiorno, e una stringa che non è una data vale «non lo so» (mai 0)", () => {
  const adesso = Date.parse("2026-01-15T12:00:00+01:00");
  assert.equal(oreDaDataVault("2026-01-15", adesso), 0, "senza ora si assume mezzogiorno, come facevano le rotte");
  for (const spazzatura of ["", null, undefined, "mai", "non lo so", {}]) {
    assert.equal(oreDaDataVault(spazzatura, adesso), null, `«${String(spazzatura)}» non è una data: deve dare null, non 0`);
  }
});

test("una data che porta già il suo fuso viene rispettata, non riscritta", () => {
  // Un ISO con la Z è un istante assoluto: ri-costruirlo come ora di parete lo sposterebbe.
  const adesso = Date.parse("2026-01-15T12:00:00Z");
  assert.equal(oreDaDataVault("2026-01-15T11:00:00Z", adesso), 1);
  assert.equal(vaultToIso("2026-01-15T11:00:00Z"), "2026-01-15T11:00:00Z");
});

// ── (b) IL CANCELLO: il fuso si calcola, non si scrive ──────────────────────────────────────────

// L'unico file dove un offset può comparire è quello che lo CALCOLA: `offsetRoma` lo produce e ha
// «+01:00» come ripiego per i runtime senza `longOffset`.
const CASA_DELL_OFFSET = "pannello/src/lib/format.ts";

// Debito ereditato, dichiarato per nome. Questa lista può solo ACCORCIARSI — un file nuovo che
// compare fa fallire la prova.
//
// **Portata a zero nella ricucitura del lotto.** I due file che stavano qui — `freschezza-
// intelligence.ts` e `verdetto-dato.ts` — erano fuori dal territorio della corsia che ha scritto
// questo cancello, quindi erano stati dichiarati invece che curati. Prima di ripararli il danno è
// stato MISURATO, non dedotto, e in un caso era peggio di come sembrava:
//   · `verdetto-dato.quandoMs` sbagliava di un'ora piena su ogni data invernale con ora esplicita,
//     e l'età che ne esce si confronta con soglie in ore;
//   · `freschezza-intelligence.giorniFra` sembrava innocuo perché calcola a mezzogiorno — un'ora di
//     scarto non attraversa la mezzanotte. Ma l'errore non sta DENTRO la giornata: sta sul confine
//     dell'ora legale. Quando l'intervallo lo scavalca le due date hanno offset veri diversi, il
//     cablato ne perde uno e `Math.floor` lo trasforma in un giorno intero: dal 15 gennaio al
//     15 luglio diceva 181 invece di 180, dal 1° al 31 marzo 30 invece di 29.
// Adesso la lista è vuota: nel Pannello l'unico posto dove un offset può comparire è chi lo calcola.
const DEBITO_DICHIARATO = [];

function fileSorgente(dir) {
  const out = [];
  for (const voce of readdirSync(dir)) {
    if (voce === "node_modules" || voce === ".next") continue;
    const p = join(dir, voce);
    if (statSync(p).isDirectory()) out.push(...fileSorgente(p));
    else if (/\.tsx?$/.test(voce)) out.push(p);
  }
  return out;
}

/** Toglie commenti e stringhe di documentazione: un offset NOMINATO in un commento non è un bug. */
function soloCodice(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((r) => !/^\s*(\/\/|\*)/.test(r))
    .join("\n");
}

test("CANCELLO — nessun fuso scritto a mano nel codice del Pannello", () => {
  const colpevoli = [];
  for (const p of fileSorgente(join(REPO, "pannello/src"))) {
    const rel = relative(REPO, p).split("\\").join("/");
    if (rel === CASA_DELL_OFFSET) continue;
    if (/[+-]0[12]:00/.test(soloCodice(readFileSync(p, "utf8")))) colpevoli.push(rel);
  }
  const nuovi = colpevoli.filter((f) => !DEBITO_DICHIARATO.includes(f));
  assert.deepEqual(
    nuovi,
    [],
    `fuso di Roma scritto a mano in ${nuovi.join(", ")}: usa oreDaDataVault/vaultToIso di ${CASA_DELL_OFFSET}. ` +
      "Il fuso si calcola per la data che si sta leggendo — scriverlo funziona solo nella stagione in cui lo scrivi.",
  );
  assert.ok(
    colpevoli.length <= DEBITO_DICHIARATO.length,
    `il debito dichiarato può solo calare: dichiarati ${DEBITO_DICHIARATO.length}, trovati ${colpevoli.length}`,
  );
});

// ── (c) LE ROTTE SONO CABLATE DAVVERO ───────────────────────────────────────────────────────────

test("le tre rotte chiamano la funzione condivisa, non una copia locale", () => {
  for (const r of ROTTE) {
    const src = readFileSync(join(REPO, r), "utf8");
    assert.doesNotMatch(soloCodice(src), /[+-]0[12]:00/, `${r} ha ancora un fuso cablato`);
    assert.match(src, /oreDaDataVault/, `${r} deve calcolare l'età con la funzione condivisa`);
    assert.doesNotMatch(soloCodice(src), /function oreDaDataPiacenza/, `${r} non deve avere più la sua copia`);
  }
});

test("la funzione condivisa esiste in UNA casa sola", () => {
  const src = readFileSync(join(REPO, CASA_DELL_OFFSET), "utf8");
  assert.match(src, /export function oreDaDataVault/, "la casa del calcolo è lib/format.ts");
  const copie = fileSorgente(join(REPO, "pannello/src")).filter((p) =>
    /export function oreDaDataVault/.test(readFileSync(p, "utf8")),
  );
  assert.equal(copie.length, 1, `oreDaDataVault dev'essere definita una volta sola (trovate ${copie.length})`);
});

// ── (d) I DUE FILE CHE ERANO «DEBITO DICHIARATO»: L'EFFETTO, NON SOLO IL DIVIETO ─────────────────
//
// Il cancello (b) vieta di SCRIVERE il fuso a mano. Non dimostra che il conto TORNI. Questi due
// casi sono l'effetto: sono gli stessi numeri misurati sul codice malato prima di ripararlo.

const { giorniFra } = await import(join(REPO, "pannello/src/lib/freschezza-intelligence.ts"));
const { quandoMs } = await import(join(REPO, "pannello/src/lib/verdetto-dato.ts"));

test("giorniFra non regala un giorno quando l'intervallo scavalca il cambio d'ora", () => {
  // Col `+02:00` cablato su ENTRAMBE le date, l'offset vero di gennaio (+01:00) andava perso e
  // `Math.floor` trasformava l'ora mancante in un giorno intero.
  assert.equal(giorniFra("2026-01-15", "2026-07-15"), 180, "inverno→estate: erano 181");
  assert.equal(giorniFra("2026-03-01", "2026-03-31"), 29, "dentro il mese del cambio: erano 30");
  // Controprova: dove il cambio NON c'è, il conto era già giusto e deve restare identico.
  assert.equal(giorniFra("2026-10-25", "2026-11-05"), 11, "entrambe dopo il cambio: invariato");
  assert.equal(giorniFra("2026-07-01", "2026-07-31"), 30, "tutto dentro l'ora legale: invariato");
  assert.equal(giorniFra(null, "2026-07-15"), null, "senza data di partenza resta null");
});

test("quandoMs legge una data invernale col suo fuso, non con l'ora legale", () => {
  // Una data-vault porta l'ora di PARETE di Piacenza. Il 15 gennaio alle 08:30 è +01:00.
  assert.equal(quandoMs("2026-01-15 08:30"), Date.parse("2026-01-15T08:30:00+01:00"));
  assert.equal(quandoMs("2026-12-01 23:30"), Date.parse("2026-12-01T23:30:00+01:00"));
  // D'estate il vecchio calcolo era già giusto: non deve essere cambiato.
  assert.equal(quandoMs("2026-07-15 08:30"), Date.parse("2026-07-15T08:30:00+02:00"));
  // Una stringa che porta GIÀ il suo fuso è un istante assoluto: si rispetta com'è.
  assert.equal(quandoMs("2026-01-15T08:30:00Z"), Date.parse("2026-01-15T08:30:00Z"));
});

// ── AR-672 — i due file del Pannello che avevano il fuso scritto a mano ───────
//
// `freschezza-intelligence.ts` e `verdetto-dato.ts` costruivano l'ora con l'offset dell'ora legale
// scritto dentro: giusto d'estate, falso di un'ora da fine ottobre a fine marzo. Cinque mesi l'anno
// su due schermate che dicono a Nicola quanto e vecchio un dato.
//
// ⚠️ La PRIMA versione di questo caso cercava `+02:00` nel testo del file, e diventava rossa sui
// COMMENTI che spiegano la cura. Cercare una stringa non distingue il codice dalla sua spiegazione:
// e la ragione per cui una prova si scrive sull'EFFETTO. Qui si chiede l'ora di un timbro
// INVERNALE: se qualcuno rimettesse l'offset a mano, la risposta sbaglierebbe di un'ora.
test("AR-672: le due schermate del Pannello chiedono il fuso, non se lo scrivono", async () => {
  const { readFileSync } = await import("node:fs");
  for (const f of ["pannello/src/lib/freschezza-intelligence.ts", "pannello/src/lib/verdetto-dato.ts"]) {
    const righe = readFileSync(new URL(`../../${f}`, import.meta.url), "utf8")
      .split("\n")
      .filter((r) => !/^\s*(\/\/|\*|\/\*)/.test(r));   // via i commenti: spiegano la cura, non la disfano
    const cablato = righe.filter((r) => /[+]0[12]:00/.test(r));
    assert.deepEqual(cablato, [],
      `${f}: l'offset e di nuovo scritto a mano nel CODICE — d'inverno mente di un'ora`);
  }

  // E l'effetto, che e la parte che conta: un timbro d'inverno vale +01:00, non +02:00.
  const { vaultToIso } = await import("../../pannello/src/lib/format.ts");
  assert.equal(Date.parse(vaultToIso("2026-12-01 23:30")), Date.parse("2026-12-01T23:30:00+01:00"),
    "d'inverno la schermata dei dati sbaglia di un'ora");
  assert.equal(Date.parse(vaultToIso("2026-07-15 08:30")), Date.parse("2026-07-15T08:30:00+02:00"),
    "d'estate il calcolo era gia giusto: non deve essere cambiato");
});
