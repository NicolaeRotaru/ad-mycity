#!/usr/bin/env node
// 🧪 AR-862 · AR-863 · AR-866 — LA STESSA MALATTIA IN TRE POSTI: uno strumento dice «non ho potuto
// guardare», e la voce si perde per strada.
//
// Uno strumento può emettere il 2 perfettamente e non servire a niente. Tre modi di sprecarlo:
//
//   · AR-862 — CHI LEGGE lo confronta a mano. In `giro.sh` il verdetto di `valida-contratti` era
//     letto con `if [ rc -ne 0 ]` invece che con `vincolo_da_rc`: col 2 il giro un vincolo lo dava
//     comunque (nessun silenzio) ma col TESTO DI UN REPERTO — «Rinomina ai nomi canonici» — che con
//     la cartella mancante è una bugia sul contenuto, e manda a cercare un campo che non esiste.
//   · AR-863 — CHI STAMPA il codice porta ancora la forma vecchia. `round6-applica.mjs` genera
//     dentro `giro.sh` il blocco dei test del cervello, e se lo stampo resta indietro il giorno che
//     rigenera disfa la cura di AR-843 in silenzio. Il codice che GENERA non lo guarda nessuna
//     prova: si provano gli effetti, non gli stampi.
//   · AR-866 — CHI MISURA la malattia la cerca nella veste in cui l'abbiamo vista la prima volta.
//     `confondeCiecoEdErrore` guarda i rami ciechi che escono col letterale **1**: non vede quelli
//     che escono **0** (AR-861, la veste peggiore) né quelli in cui l'uscita è calcolata —
//     `process.exit(v.codice)`, che è proprio la forma in cui questo lotto ha scritto la cura.
//
// COSA PROVA QUESTO FILE, e con quali mani:
//   ① la funzione pura del metro allargato, messa nei suoi stati, col confronto col metro vecchio —
//      il buco di AR-866 non è raccontato, è ESEGUITO;
//   ② `giro.sh` VERO: nessun blocco che compone un vincolo legge a mano un guardiano che sa uscire
//      2 (le esenzioni sono dichiarate qui sotto col perché);
//   ③ il blocco di `valida-contratti` ESEGUITO in bash con rc=2 e rc=1: due testi diversi, e col 2
//      non deve uscire l'ordine di rinominare niente;
//   ④ lo stampo di `round6-applica.mjs` che genera la forma curata, e che non è rimasto indietro
//      rispetto a quello che c'è davvero dentro `giro.sh`.
//
// 🟢 Sola lettura: legge sorgenti, esegue bash su un tratto ritagliato, non scrive niente.

import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { codiceSenzaCommenti, letturaDeiVerdetti, usciteDelProgramma } from "../posto-o-contenuto.mjs";
import { confondeCiecoEdErrore } from "../misura-o-cieco.mjs";
import { PIANO } from "../round6-applica.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");
const GIRO = join(CERVELLO, "giro.sh");
const leggi = (f) => readFileSync(join(CERVELLO, f), "utf8");

// ─────────────────────────────────────────────────────────────────────────────
// ① AR-866 — IL METRO ALLARGATO, E IL BUCO DI QUELLO VECCHIO, ESEGUITI
// ─────────────────────────────────────────────────────────────────────────────

// La veste peggiore: il ramo che non ha guardato niente esce 0, cioè «va tutto bene».
const CIECO_CHE_ESCE_VERDE = [
  'if (!existsSync(SALA)) {',
  '  console.log("SALA-OPERATIVA.md assente — niente da verificare.");',
  '  process.exit(0);',
  '}',
  'process.exit(inadempienti.length ? 1 : 0);',
].join("\n");

// La veste calcolata: è la forma in cui questo lotto ha scritto la cura.
const USCITA_CALCOLATA = [
  'const v = verdettoPostoVuoto({ postoCe: false, dove: "x" });',
  'if (v.codice !== 0) {',
  '  console.error(rigaReferto(v));',
  '  process.exit(v.codice);',
  '}',
].join("\n");

test("AR-866 · il metro nuovo vede il cieco che esce 0 — e il metro vecchio no: è il buco, eseguito", () => {
  const nuovo = usciteDelProgramma(CIECO_CHE_ESCE_VERDE);
  assert.equal(nuovo.ciechi_travestiti.length, 1, "il ramo che non ha guardato niente ed esce 0 deve essere visto");
  assert.deepEqual(nuovo.ciechi_travestiti[0].codici, [0], "e deve dire con che codice esce");
  // La prova del difetto: lo stesso sorgente, il metro di casa che c'era prima, e niente.
  assert.equal(
    confondeCiecoEdErrore(CIECO_CHE_ESCE_VERDE).confonde,
    false,
    "se il metro vecchio avesse imparato a vedere lo 0, questo caso va riscritto: il buco di AR-866 sarebbe chiuso",
  );
});

test("AR-866 · il metro nuovo legge l'uscita CALCOLATA dal contratto di casa; il vecchio la ignora", () => {
  const nuovo = usciteDelProgramma(USCITA_CALCOLATA);
  assert.equal(nuovo.puo_uscire_2, true, "`process.exit(v.codice)` porta il contratto 0/1/2: sa uscire 2");
  assert.equal(nuovo.ciechi_travestiti.length, 0, "e non è un travestimento: è proprio la cura");
  assert.equal(
    confondeCiecoEdErrore(USCITA_CALCOLATA).confonde,
    false,
    "il metro vecchio guarda i letterali: qui non ha niente da dire, ed è l'altra metà del buco",
  );
});

test("AR-866 · il verdetto DICHIARA cosa non copre: un numero nudo è un verde più largo di ciò che ha guardato", () => {
  const v = usciteDelProgramma("process.exit(0);");
  assert.ok(v.non_copre.length > 0, "il verdetto non dichiara niente: è la clausola che conta di AR-866");
  assert.ok(
    v.non_copre.some((r) => /exitCode|throw|altro file/.test(r)),
    `la copertura dichiarata non nomina le forme che il metro non segue: ${v.non_copre.join(" | ")}`,
  );
  // E quando trova un'uscita calcolata che NON passa dal contratto di casa, lo dice invece di darla
  // per innocua: è la differenza fra «non ce n'è» e «non l'ho guardata».
  const ignota = usciteDelProgramma("process.exit(quantoHaSpeso(oggi));");
  assert.ok(
    ignota.non_copre.some((r) => /calcolate fuori dal contratto/.test(r)),
    `un'uscita che il metro non sa leggere deve finire nella copertura dichiarata: ${ignota.non_copre.join(" | ")}`,
  );
});

test("AR-866 · il metro non accusa i COMMENTI: la spiegazione di una cura cita il codice malato", () => {
  // È la scorciatoia numero 12 del catalogo, «la parola invece della chiamata», e il metro l'ha
  // commessa addosso a me: il commento sopra la cura di AR-861 contiene `process.exit(0)`.
  const soloCommento = ['// qui c\'era: if (!esiste) { console.log("non trovato"); process.exit(0); }', 'process.exit(0);'].join("\n");
  assert.equal(usciteDelProgramma(soloCommento).ciechi_travestiti.length, 0, "sta leggendo un commento come se fosse codice");
  assert.match(codiceSenzaCommenti('const a = 1; // process.exit(0)\n'), /const a = 1;/);
  assert.doesNotMatch(codiceSenzaCommenti('// process.exit(0)\n'), /process\.exit/);
  // e una stringa che CONTIENE due barre non è un commento
  assert.match(codiceSenzaCommenti('const u = "https://x/y"; process.exit(2);'), /process\.exit\(2\)/);
});

test("AR-861 · sul codice VERO: `chiusura-loop.mjs` non ha più rami ciechi che escono col codice sbagliato", () => {
  const v = usciteDelProgramma(leggi("chiusura-loop.mjs"));
  assert.deepEqual(
    v.ciechi_travestiti.map((c) => `riga ${c.riga} esce ${c.codici}`),
    [],
    "un ramo che dichiara di non aver guardato sta uscendo con un codice diverso da 2",
  );
  assert.equal(v.puo_uscire_2, true, "e il 2 deve saperlo dire: senza, non ha la terza risposta");
});

// ─────────────────────────────────────────────────────────────────────────────
// ② AR-862 — CHI LEGGE, DENTRO IL `giro.sh` VERO
// ─────────────────────────────────────────────────────────────────────────────

// ESENTI — guardati uno per uno. Il confronto a mano c'è, ma convertirlo peggiorerebbe le cose:
// è la trappola scritta nel brief di questa corsia, «convertire senza sistemare chi legge trasforma
// un falso allarme in un SILENZIO».
const ESENTI = {
  "verifica-sensori.mjs":
    "Col 2 il testo che il giro dà al motore è GIÀ quello giusto — «sensori ciechi: non scrivere numeri nuovi, usa la baseline di STATO» — perché rc=2 lì significa «da questa sessione non c'era niente di misurabile», che è esattamente la condizione in cui i numeri non si scrivono. Passare da vincolo_da_rc sostituirebbe quel freno con il testo generico «ripara lo strumento», cioè spegnerebbe il vincolo «niente numeri nuovi» proprio nelle sessioni cieche. In più quel blocco è ESEGUITO riga per riga da cervello/test/non-misurato-non-e-rotto.test.mjs, che ne pretende la forma attuale.",
};

/** I lettori a mano di un guardiano che SA uscire 2, e che con quell'rc compongono un vincolo. */
function lettoriAMano() {
  const { lettori } = letturaDeiVerdetti(readFileSync(GIRO, "utf8"));
  assert.ok(lettori.length > 20, `in giro.sh ho trovato solo ${lettori.length} letture di guardiani: il ritaglio non funziona più, questa prova non proverebbe niente`);
  return lettori.filter((l) => {
    if (l.tratta_il_cieco || !l.compone_vincolo) return false;
    let sorgente;
    try {
      sorgente = leggi(l.script);
    } catch {
      return false; // il guardiano non c'è: è un altro difetto, non questo
    }
    return usciteDelProgramma(sorgente).puo_uscire_2;
  });
}

test("AR-862 · nessun vincolo del giro nasce da un confronto a mano su un guardiano che sa uscire 2", () => {
  const aMano = lettoriAMano();
  const debito = aMano.filter((l) => !ESENTI[l.script]);
  assert.deepEqual(
    debito.map((l) => `${l.script} (giro.sh riga ${l.riga})`),
    [],
    "Con rc=2 questi blocchi danno al motore il TESTO DI UN REPERTO per una cosa che nessuno ha misurato.\n" +
      "La riparazione è di due righe, nel blocco indicato di cervello/giro.sh: al posto di\n" +
      '  if [ "$_x_rc" -ne 0 ]; then VAR="⛔ testo di dominio…"\n' +
      "scrivi\n" +
      '  VAR="$(vincolo_da_rc "nome.mjs" "$_x_rc" "⛔ testo di dominio…")"\n' +
      "e sotto `[ -n \"$VAR\" ] && echo …`. `vincolo_da_rc` sul 2 dice «guardiano cieco, ripara lo strumento».",
  );
  // Un'esenzione che non copre più niente è un residuo che nasconde il prossimo caso vero.
  const orfane = Object.keys(ESENTI).filter((f) => !aMano.some((l) => l.script === f));
  assert.deepEqual(orfane, [], `esenzioni che non corrispondono più a niente: toglile — ${orfane.join(", ")}`);
});

test("AR-862 · un blocco che NOMINA `vincolo_da_rc` in un commento non è un blocco curato", () => {
  // TROVATO ROMPENDO IL FIX APPOSTA, e non è un caso di scuola: rimesso il confronto a mano in
  // giro.sh ma lasciato il commento che spiega la cura, il metro leggeva la parola nel commento e
  // dichiarava curato proprio il caso peggiore — cura rimossa, spiegazione rimasta. Scorciatoia
  // numero 12 del catalogo, commessa dal metro nato per non commetterla.
  const finto = [
    '  _x_out="$(node "$SCRIPT_DIR/finto.mjs" 2>&1)"; _x_rc=$?',
    "  # qui il vincolo lo compone vincolo_da_rc, che i tre esiti li sa distinguere",
    '  if [ "$_x_rc" -ne 0 ]; then',
    '    FINTO_VINCOLO="⛔ testo di dominio"',
    "  fi",
  ].join("\n");
  const l = letturaDeiVerdetti(finto).lettori[0];
  assert.ok(l, "il ritaglio non riconosce più la forma della cattura");
  assert.equal(l.come, "a-mano", "il metro si è fatto convincere da un commento");
  assert.equal(l.compone_vincolo, true);

  // IL CASO CHE SEPARA LE DUE DIFESE. Qui ce ne sono due addosso allo stesso difetto: (a) i
  // commenti si spengono prima di guardare, (b) la chiamata dev'essere legata a QUEL rc. Col
  // commento generico bastava (b), quindi togliendo (a) non diventava rosso niente — due difese che
  // si coprono a vicenda non si possono provare insieme. Questo commento CITA la chiamata intera,
  // rc compreso: è la forma che un commento di spiegazione prende davvero, e adesso (a) è l'unica
  // difesa in piedi.
  const commentoCheCitaTutto = [
    '  _x_out="$(node "$SCRIPT_DIR/finto.mjs" 2>&1)"; _x_rc=$?',
    '  # prima qui c\'era: FINTO_VINCOLO="$(vincolo_da_rc "finto.mjs" "$_x_rc" "⛔ testo")"',
    '  if [ "$_x_rc" -ne 0 ]; then',
    '    FINTO_VINCOLO="⛔ testo di dominio"',
    "  fi",
  ].join("\n");
  assert.equal(
    letturaDeiVerdetti(commentoCheCitaTutto).lettori[0].come,
    "a-mano",
    "un commento che cita la chiamata per intero non è la chiamata: il metro sta leggendo le parole invece del codice",
  );

  // E il rovescio: la chiamata VERA, legata a QUEL rc, è curata.
  const curato = [
    '  _x_out="$(node "$SCRIPT_DIR/finto.mjs" 2>&1)"; _x_rc=$?',
    '  FINTO_VINCOLO="$(vincolo_da_rc "finto.mjs" "$_x_rc" "⛔ testo di dominio")"',
  ].join("\n");
  assert.equal(letturaDeiVerdetti(curato).lettori[0].come, "vincolo_da_rc");
});

/** Ritaglia da giro.sh il tratto che decide un vincolo e lo esegue con un rc scelto da noi. */
function vincoloDelGiro({ cattura, variabile, rc }) {
  const righe = readFileSync(GIRO, "utf8").split("\n");
  const inizio = righe.findIndex((r) => r.includes(cattura));
  assert.notEqual(inizio, -1, `in giro.sh non c'è più la riga «${cattura}»: la prova non sa più cosa provare`);
  // Si parte DOPO la cattura e il printf: il guardiano vero non lo lanciamo, l'rc lo diamo noi.
  const corpo = righe.slice(inizio + 2, inizio + 20).join("\n");
  const script = [
    "set -u",
    `. ${JSON.stringify(join(CERVELLO, "giro-esito.sh"))}`,
    "ts() { echo T; }",
    `${variabile}_rc=${rc}`,
    `${variabile}_out="uscita finta"`,
    'VERIFICA_VINCOLO=""',
    corpo,
    'echo "---VINCOLO---"',
    'printf "%s" "$VERIFICA_VINCOLO"',
  ].join("\n");
  const r = spawnSync("bash", ["-c", script], { encoding: "utf8" });
  const testo = r.stdout || "";
  return (testo.split("---VINCOLO---")[1] || "").trim();
}

test("AR-862 · SUL SERIO: col 2 il giro NON ordina di rinominare i campi — quel testo è una bugia sul contenuto", () => {
  const cattura = '_contr_out="$(node "$SCRIPT_DIR/valida-contratti.mjs"';
  const cieco = vincoloDelGiro({ cattura, variabile: "_contr", rc: 2 });
  assert.ok(cieco.length > 40, `col 2 il motore non riceve niente: silenzio al posto della bugia, che è peggio. Ricevuto: «${cieco}»`);
  assert.match(cieco, /CIECO/i, "col 2 il vincolo deve dire che il guardiano non ha misurato");
  assert.doesNotMatch(cieco, /Rinomina ai nomi canonici/, "col 2 sta ancora mandando a rinominare campi in una cartella che non c'è");

  const reperto = vincoloDelGiro({ cattura, variabile: "_contr", rc: 1 });
  assert.match(reperto, /Rinomina ai nomi canonici/, "col 1 il testo di dominio deve restare: curare il falso allarme col silenzio sarebbe peggio");

  const verde = vincoloDelGiro({ cattura, variabile: "_contr", rc: 0 });
  assert.equal(verde, "", "col guardiano passato non deve nascere nessun vincolo");
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ AR-863 — LO STAMPO CHE RIGENERA `giro.sh`
// ─────────────────────────────────────────────────────────────────────────────

/** Il testo che il generatore SCRIVEREBBE dentro giro.sh per una delle sue modifiche. */
function stampo(pezzoDelNome) {
  const voce = PIANO.find((v) => v.file === "cervello/giro.sh");
  assert.ok(voce, "round6-applica non tocca più giro.sh: questa prova non sa più cosa provare");
  const m = voce.modifiche.find((x) => x.nome.includes(pezzoDelNome));
  assert.ok(m, `la modifica «${pezzoDelNome}» non c'è più nel piano del generatore`);
  return m.dopo(m.ancora);
}

test("AR-863 · lo stampo genera la forma CURATA, non quella da cui la cura è partita", () => {
  const generato = `${stampo("esecuzione dei due guardiani")}\n${stampo("debito di misura non si condona")}`;
  assert.doesNotMatch(generato, /if \[ "\$_testc_rc" -ne 0 \]/, "lo stampo riscriverebbe il confronto a mano sui test del cervello (la cura di AR-843 si disfa)");
  assert.doesNotMatch(generato, /if \[ "\$_deb_rc" -ne 0 \]/, "lo stampo riscriverebbe il confronto a mano sul debito di misura");
  assert.match(generato, /vincolo_da_rc "test-cervello\.mjs"/, "lo stampo deve passare dalla funzione di casa");
  assert.match(generato, /vincolo_da_rc "calibrazione\.mjs debito"/, "idem per il debito di misura");
  // E lo si guarda con lo stesso metro con cui si guarda giro.sh: gli effetti, non le parole.
  for (const l of letturaDeiVerdetti(generato).lettori) {
    assert.equal(l.come, "vincolo_da_rc", `lo stampo genera una lettura «${l.come}» per ${l.script}`);
  }
});

test("AR-863 · lo stampo NON è rimasto indietro rispetto a quello che c'è davvero in giro.sh", () => {
  // La forma generale del difetto: due copie della stessa riga, e quella che nessuno rilegge
  // invecchia. Qui si confrontano carattere per carattere.
  const giro = readFileSync(GIRO, "utf8").split("\n");
  const coppie = [
    ["TEST_VINCOLO", stampo("esecuzione dei due guardiani")],
    ["DEBITO_VINCOLO", stampo("debito di misura non si condona")],
  ];
  for (const [nome, generato] of coppie) {
    const daStampo = generato.split("\n").find((r) => r.trim().startsWith(`${nome}="$(`));
    const inGiro = giro.find((r) => r.trim().startsWith(`${nome}="$(`));
    assert.ok(daStampo, `lo stampo non produce più la riga ${nome}`);
    assert.ok(inGiro, `giro.sh non contiene più la riga ${nome}: una delle due copie è sparita`);
    assert.equal(daStampo, inGiro, `la riga ${nome} dello stampo e quella di giro.sh sono diverse: la prossima rigenerazione riporterebbe indietro il file vivo`);
  }
});
