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
import { chiaviDelPacchetto, chiudibile, difettiDeiFrammenti, opzione, piano, risolviChiave } from "../chiudi-sito.mjs";

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

// ── AR-951 — la chiave che il pacchetto non portava ────────────────────────
//
// Il pacchetto di ogni corsia dovrebbe portare la `chiave` della scheda. L'8/9/2026 non la
// portava: le squadre hanno ripiegato sul TITOLO, che è metà della chiave — manca la dimensione —
// e il piano è uscito con 23 chiavi orfane su 23. Zero chiusure scritte, tutto il lotto fermo.
//
// La cura non è ammorbidire il confronto: è ricostruire l'altra metà DAL PACCHETTO, che la
// dimensione ce l'ha scritta. Deterministico, non somigliante. E si ferma sull'ambiguità: un
// titolo sotto due dimensioni non si sceglie tirando a indovinare, perché chiudere la scheda
// sbagliata è peggio che non chiudere niente — lascia aperto un difetto vero e ne dichiara chiuso
// uno su cui nessuno ha lavorato.

const registroCon = (...chiavi) => new Set(chiavi);

test("una chiave piena del registro passa così com'è, e non risulta dedotta", () => {
  const r = risolviChiave("sicurezza|il coupon si brucia", {
    nelRegistro: registroCon("sicurezza|il coupon si brucia"),
    perTitolo: new Map(),
  });
  assert.equal(r.chiave, "sicurezza|il coupon si brucia");
  assert.equal(r.dedotta, false);
});

test("un TITOLO SOLO si ricostruisce guardando il pacchetto, che la dimensione ce l'ha", () => {
  const pacchetto = { difetti: [{ dimensione: "Sicurezza", titolo: "Il  Coupon Si Brucia" }] };
  const r = risolviChiave("il coupon si brucia", {
    nelRegistro: registroCon("sicurezza|il coupon si brucia"),
    perTitolo: chiaviDelPacchetto(pacchetto),
  });
  assert.equal(r.chiave, "sicurezza|il coupon si brucia", "senza questo il lotto resta fermo con 23 orfane su 23");
  assert.equal(r.dedotta, true, "una chiave ricostruita va detta, non spacciata per dichiarata");
});

test("UN TITOLO SOTTO DUE DIMENSIONI NON SI SCEGLIE: si rifiuta", () => {
  const pacchetto = {
    difetti: [
      { dimensione: "sicurezza", titolo: "la pagina mostra un buco" },
      { dimensione: "frontend-ux", titolo: "la pagina mostra un buco" },
    ],
  };
  const r = risolviChiave("la pagina mostra un buco", {
    nelRegistro: registroCon("sicurezza|la pagina mostra un buco", "frontend-ux|la pagina mostra un buco"),
    perTitolo: chiaviDelPacchetto(pacchetto),
  });
  assert.equal(r.chiave, undefined, "chiudere la scheda sbagliata lascia aperto un difetto vero e ne finge chiuso un altro");
  assert.match(r.perche, /2 schede|indovinare/);
});

test("un titolo che nel pacchetto non c'è resta orfano, col perché", () => {
  const r = risolviChiave("un titolo che nessuno ha mai scritto", {
    nelRegistro: registroCon("sicurezza|il coupon si brucia"),
    perTitolo: chiaviDelPacchetto({ difetti: [{ dimensione: "sicurezza", titolo: "il coupon si brucia" }] }),
  });
  assert.equal(r.chiave, undefined);
  assert.match(r.perche, /né una chiave|pacchetto/);
});

test("senza il pacchetto restano ammesse solo le chiavi piene", () => {
  const r = risolviChiave("il coupon si brucia", { nelRegistro: registroCon("sicurezza|il coupon si brucia") });
  assert.equal(r.chiave, undefined, "senza la dimensione da qualche parte, il titolo da solo non basta");
});

test("e nel piano vero: una corsia che dichiara il titolo chiude la scheda giusta", () => {
  const problemi = [problema("sicurezza", "il coupon si brucia"), problema("frontend-ux", "un altro difetto")];
  const pacchetti = new Map([[1, { difetti: [{ dimensione: "sicurezza", titolo: "il coupon si brucia" }] }]]);
  const p = piano(problemi, [{ corsia: 1, difetti: [riparato("Il Coupon  Si Brucia")] }], { quando: OGGI, pacchetti });
  assert.equal(p.orfani.length, 0);
  assert.equal(p.chiudo.length, 1);
  assert.equal(p.chiudo[0].chiave, "sicurezza|il coupon si brucia");
});

test("e una corsia che dichiara il titolo del pacchetto di UN'ALTRA corsia resta orfana", () => {
  const problemi = [problema("sicurezza", "il coupon si brucia")];
  const pacchetti = new Map([
    [1, { difetti: [{ dimensione: "altro", titolo: "roba mia" }] }],
    [2, { difetti: [{ dimensione: "sicurezza", titolo: "il coupon si brucia" }] }],
  ]);
  const p = piano(problemi, [{ corsia: 1, difetti: [riparato("il coupon si brucia")] }], { quando: OGGI, pacchetti });
  assert.equal(p.chiudo.length, 0, "una corsia chiude quello che aveva in mano, non quello di un'altra");
  assert.equal(p.orfani.length, 1);
});

// ── AR-953 — il passaggio di mano fra corsie ───────────────────────────────
//
// Sette corsie di questo lotto hanno lasciato un pezzo `bloccato` per un'altra squadra: la cura
// stava in un file fuori dal loro territorio. È il funzionamento normale del lotto. Ma la squadra
// che poi lo finisce dichiara una scheda che nel SUO pacchetto non c'è, e la chiusura non aggancia
// niente: l'8/9/2026 la corsia 26 ha chiuso il pezzo della corsia 7 ed è finita fra le orfane.
// Sette passaggi di mano, sette chiusure impossibili.
//
// La cura NON è cercare il titolo in tutti i pacchetti — quello è il difetto che il comando esiste
// per fermare, e c'è già una mutazione che lo sorveglia. Il passaggio di mano si DICHIARA.

test("una corsia che dichiara da quale pacchetto ha preso il difetto lo chiude", () => {
  const problemi = [problema("frontend-ux", "il pannello scrive «non ce n'è nessuno»")];
  const pacchetti = new Map([
    [7, { difetti: [{ dimensione: "frontend-ux", titolo: "il pannello scrive «non ce n'è nessuno»" }] }],
    [26, { difetti: [{ dimensione: "frontend-ux", titolo: "un altro difetto, quello suo" }] }],
  ]);
  const frammento = {
    corsia: 26,
    difetti: [{ ...riparato("il pannello scrive «non ce n'è nessuno»"), dal_pacchetto: 7 }],
  };
  const p = piano(problemi, [frammento], { quando: OGGI, pacchetti });
  assert.equal(p.orfani.length, 0, "senza questo, sette pezzi passati di mano non si chiudono mai");
  assert.equal(p.chiudo.length, 1);
  assert.equal(p.chiudo[0].dalPacchetto, 7);
  assert.match(p.chiudo[0].campi.chiuso_da, /passato dalla corsia 7 alla 26/,
    "chi legge il registro deve poter sapere che il pezzo ha cambiato mano");
});

test("SENZA dichiararlo resta orfana: il passaggio di mano non si indovina", () => {
  const problemi = [problema("frontend-ux", "il pannello scrive «non ce n'è nessuno»")];
  const pacchetti = new Map([
    [7, { difetti: [{ dimensione: "frontend-ux", titolo: "il pannello scrive «non ce n'è nessuno»" }] }],
    [26, { difetti: [{ dimensione: "frontend-ux", titolo: "un altro difetto, quello suo" }] }],
  ]);
  const frammento = { corsia: 26, difetti: [riparato("il pannello scrive «non ce n'è nessuno»")] };
  const p = piano(problemi, [frammento], { quando: OGGI, pacchetti });
  assert.equal(p.chiudo.length, 0, "cercare in tutti i pacchetti riaprirebbe il difetto che questo comando ferma");
  assert.equal(p.orfani.length, 1);
});

test("un passaggio di mano dichiarato verso un pacchetto che quel difetto non ha resta orfano, e lo dice", () => {
  const problemi = [problema("frontend-ux", "roba di qualcun altro")];
  const pacchetti = new Map([[7, { difetti: [{ dimensione: "frontend-ux", titolo: "tutt'altro" }] }]]);
  const frammento = { corsia: 26, difetti: [{ ...riparato("roba di qualcun altro"), dal_pacchetto: 7 }] };
  const p = piano(problemi, [frammento], { quando: OGGI, pacchetti });
  assert.equal(p.orfani.length, 1);
  assert.match(p.orfani[0].perche, /corsia 7/, "va detto che la corsia lo dichiarava preso da un'altra, se no non si sa dove guardare");
});
