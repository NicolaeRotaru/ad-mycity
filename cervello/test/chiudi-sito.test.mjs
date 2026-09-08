#!/usr/bin/env node
// 🧪 Le chiusure del sito — il buco dichiarato in lotto-a-pacchetti.md ⑤.
//
// Il difetto che queste prove tengono chiuso non è «manca uno script»: è che una chiusura scritta a
// mano SOMIGLIA a una chiusura senza esserlo. La chiave del registro del sito è `dimensione|titolo`
// normalizzati, quindi basta che una corsia ritocchi un titolo mentre ripara e la chiusura non
// aggancia più niente: al referto successivo il difetto risulta di nuovo aperto, in silenzio, e il
// lotto dopo ripianifica lavoro già fatto. Al primo collaudo del comando dei pacchetti erano 356
// chiavi su 361 a non combaciare, per questa ragione esatta.
//
// L'altra metà è l'asticella: si chiude solo ciò che porta una prova che gira E l'esito della
// mutazione. Senza quel filtro il registro si riempie di chiusure che nessuno ha mai visto
// diventare rosse — il debito che il cantiere della macchina si porta dietro da mesi.
//
// Girano su dati finti apposta: devono poter fallire senza rete, senza chiavi e senza il registro vero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { chiudibile, difettiDeiFrammenti, opzione, piano } from "../chiudi-sito.mjs";

const problema = (dimensione, titolo) => ({ dimensione, titolo, stato: "aperto", severita: "grave" });
const OGGI = "2026-09-08 09:00";

const riparato = (chiave) => ({
  chiave,
  esito: "riparato",
  verifica_comando: "npx vitest run tests/unit/x.test.ts",
  non_vacuita: "rotto il confronto → rosso sull'asserzione del minorenne. Rimesso: verde.",
  nota_fix: "spostato il cancello sul dato",
});

// ── l'asticella: cosa si può chiudere ──────────────────────────────────────

test("un riparato con prova e mutazione si chiude", () => {
  assert.equal(chiudibile(riparato("a|b")).si, true);
});

test("senza il comando della prova NON si chiude: una chiusura senza prova non è una chiusura", () => {
  const senza = { ...riparato("a|b"), verifica_comando: undefined };
  const v = chiudibile(senza);
  assert.equal(v.si, false);
  assert.match(v.perche, /prova/);
});

test("senza l'esito della mutazione NON si chiude: nessuno l'ha vista diventare rossa", () => {
  const senza = { ...riparato("a|b"), non_vacuita: undefined };
  const v = chiudibile(senza);
  assert.equal(v.si, false);
  assert.match(v.perche, /rossa|mutazione/);
});

test("un difetto dichiarato aperto resta aperto, anche se porta una prova", () => {
  assert.equal(chiudibile({ ...riparato("a|b"), esito: "aperto" }).si, false);
});

// ── la chiave: il modo esatto in cui questo si rompe ───────────────────────

test("la chiave si calcola come la calcola il registro, maiuscole e spazi compresi", () => {
  const problemi = [problema("Sicurezza", "Il  Coupon   Si Brucia")];
  const p = piano(problemi, [{ corsia: 1, difetti: [riparato("sicurezza|il coupon si brucia")] }], { quando: OGGI });
  assert.equal(p.chiudo.length, 1, "spazi doppi e maiuscole non devono impedire l'aggancio");
  assert.equal(p.orfani.length, 0);
});

test("UNA CHIAVE CHE NON ESISTE È UN ROSSO, non una chiusura silenziosa", () => {
  const problemi = [problema("sicurezza", "il coupon si brucia")];
  const p = piano(problemi, [{ corsia: 3, difetti: [riparato("sicurezza|titolo ritoccato mentre riparavo")] }], { quando: OGGI });
  assert.equal(p.chiudo.length, 0);
  assert.equal(p.orfani.length, 1, "senza questo, la chiusura sparisce e il difetto torna aperto al referto dopo");
  assert.equal(p.orfani[0].corsia, 3, "va detto QUALE corsia, se no non si sa a chi chiedere");
});

test("una corsia che dimentica la chiave non chiude a caso il primo difetto che passa", () => {
  const problemi = [problema("sicurezza", "uno"), problema("sicurezza", "due")];
  const p = piano(problemi, [{ corsia: 2, difetti: [{ ...riparato("x"), chiave: undefined }] }], { quando: OGGI });
  assert.equal(p.chiudo.length, 0);
  assert.equal(p.orfani.length, 1);
});

// ── cosa finisce scritto ───────────────────────────────────────────────────

test("i campi scritti portano data con l'ora, la richiesta di unione e la prova", () => {
  const problemi = [problema("soldi", "si paga due volte")];
  const p = piano(problemi, [{ corsia: 4, difetti: [riparato("soldi|si paga due volte")] }], { quando: OGGI, pr: 254, commit: "abc1234" });
  const c = p.chiudo[0].campi;
  assert.equal(c.stato, "riparato");
  assert.equal(c.chiuso_il, OGGI, "la data secca non basta: Nicola deve sapere il minuto");
  assert.match(c.chiuso_da, /PR #254/);
  assert.match(c.chiuso_da, /abc1234/);
  assert.match(c.nota_riparazione, /prova: npx vitest/, "la nota deve portare il comando, se no la chiusura non è verificabile");
  assert.match(c.nota_riparazione, /mutazione:/);
});

test("senza numero di richiesta e senza commit la nota resta comunque riempita, non vuota", () => {
  const problemi = [problema("soldi", "x")];
  const p = piano(problemi, [{ corsia: 1, difetti: [riparato("soldi|x")] }], { quando: OGGI });
  assert.ok(p.chiudo[0].campi.chiuso_da.length > 0, "un campo vuoto non dice a nessuno da dove viene la chiusura");
});

test("chi resta aperto porta con sé il perché della sua corsia, non una frase generica", () => {
  const problemi = [problema("soldi", "x")];
  const frammento = { corsia: 7, difetti: [{ chiave: "soldi|x", esito: "aperto", perche_resta_aperto: "serve una migrazione, ed è rossa" }] };
  const p = piano(problemi, [frammento], { quando: OGGI });
  assert.equal(p.lascio.length, 1);
  assert.match(p.lascio[0].perche, /migrazione/);
});

test("i difetti di più corsie si contano tutti, e ognuno sa da quale corsia viene", () => {
  const d = difettiDeiFrammenti([
    { corsia: 1, difetti: [{ chiave: "a" }, { chiave: "b" }] },
    { corsia: 2, difetti: [{ chiave: "c" }] },
    { corsia: 3 },
  ]);
  assert.equal(d.length, 3);
  assert.deepEqual(d.map((x) => x.corsia), [1, 1, 2]);
});

test("nessun frammento non è un errore: è zero chiusure", () => {
  const p = piano([problema("a", "b")], [], { quando: OGGI });
  assert.deepEqual([p.chiudo.length, p.lascio.length, p.orfani.length], [0, 0, 0]);
});

// ── l'opzione che non c'è non deve diventare un valore ─────────────────────
//
// Trovato riguardando il file con la lente «cosa succede se», non provandolo: `indexOf` torna -1
// quando l'opzione manca, e `argv[-1 + 1]` è `argv[0]`, cioè la cartella dei frammenti. Lanciato
// senza `--pr`, il comando scriveva «PR #/tmp/…/lotto» dentro OGNI difetto chiuso del registro.
// Una riga così non è un errore visibile: è una traccia sbagliata che resta lì per sempre.

// ── AR-950 — l'opzione che non c'è non deve diventare un valore ────────────
//
// ⚠️ Questa prova CHIAMA la funzione vera. La prima stesura la riscriveva qui dentro: rompendo il
// codice la prova restava verde, cioè non provava niente. L'ha smascherata la mutazione, non la
// rilettura — ed è la ragione per cui `opzione` è esportata invece di vivere dentro `main`.

test("senza --pr e senza --commit non finisce la cartella dentro il registro", () => {
  const argv = ["/tmp/lotto", "--applica"];
  assert.equal(opzione(argv, "--pr"), null, "argv[-1+1] è argv[0]: la cartella verrebbe scambiata per il numero della PR");
  assert.equal(opzione(argv, "--commit"), null);
  assert.equal(opzione(argv, "--applica"), null, "un'opzione senza valore non prende il primo argomento che passa");
});

test("con --pr e --commit i valori arrivano interi", () => {
  const argv = ["/tmp/lotto", "--pr", "254", "--commit", "abc1234", "--applica"];
  assert.equal(opzione(argv, "--pr"), "254");
  assert.equal(opzione(argv, "--commit"), "abc1234");
});

test("un'opzione seguita da un'altra opzione non ne ruba il nome", () => {
  assert.equal(opzione(["/tmp/lotto", "--pr", "--applica"], "--pr"), null);
});
