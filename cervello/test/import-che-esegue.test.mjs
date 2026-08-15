#!/usr/bin/env node
// AR-445 — IMPORTARE UN MODULO DEL CERVELLO NE ESEGUIVA IL PROGRAMMA.
//
// Chi importava `sonda-volano.mjs` per provare una funzione si ritrovava auto-radiografia.json e
// storico-salute.json riscritti (~3100 righe, lotto 35). Quei due moduli oggi la guardia ce l'hanno
// — la scheda li nomina, il codice li ha già curati. La CLASSE no: la guardia è una convenzione che
// ognuno applica se se la ricorda, e nessun guardiano la pretendeva.
//
// COSA PROVA QUESTO FILE:
//   ① il guardiano vero, ESEGUITO sul repo vero: il numero esiste, sta sotto il tetto, e il contratto
//      d'uscita 0/1/2 è rispettato. È il punto che chiama (AR-461), non la funzione da sola.
//   ② il blocco duro: un modulo malato che il lotto TOCCA non passa, nemmeno sotto il tetto.
//   ③ le funzioni pure, sui casi che in questa cartella non esistono ancora.
//
// ⚠️ QUELLO CHE QUESTO TEST NON DIMOSTRA, e non voglio far finta di sì: che i 116 moduli malati
// facciano danno DAVVERO all'import. Per dimostrarlo bisognerebbe importarli, cioè eseguirli, cioè
// far scrivere loro la memoria vera — la prova che rompe ciò che deve proteggere. Il guardiano
// misura la FORMA (nessuna guardia + righe che agiscono in colonna zero) ed è una misura per
// difetto: dice un minimo, mai un totale.
//
// 🟢 Sola lettura.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { elencaFile } from "../perimetro.mjs";
import { haGuardia, righeCheAgiscono, moduliMalati, malatiToccati, TETTO_ALLA_NASCITA, ESCLUSI } from "../import-che-esegue.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ─────────────────────────────────────────────────────────────────────────────
// ① IL GUARDIANO VERO, ESEGUITO
// ─────────────────────────────────────────────────────────────────────────────

test("SUL CAMPO: il debito dei moduli che eseguono al caricamento è misurato e sotto il tetto", () => {
  const r = spawnSync(process.execPath, ["cervello/import-che-esegue.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
  });
  assert.notEqual(r.status, 2, `il guardiano non ha potuto misurare: ${r.stderr}`);
  const esito = JSON.parse(r.stdout);
  assert.ok(esito.quanti > 0, "se dicesse zero avrei rotto la misura, non curato il difetto: il debito c'è ed è grosso");
  assert.ok(
    esito.quanti <= esito.tetto,
    `il debito si è allargato: ${esito.quanti} moduli contro un tetto di ${esito.tetto}. ` +
      "Aggiungi la riga di guardia al modulo nuovo — non alzare il tetto.",
  );
});

test("SUL CAMPO: il guardiano guarda TUTTI i moduli tranne quelli che ha dichiarato di saltare", () => {
  // ⚠️ QUESTA PROVA È NATA DEBOLE, e vale la pena dirlo. La prima versione controllava «esiste almeno
  // un malato in una sottocartella»: rimettendo il recinto scritto a mano — cioè disfacendo il fix —
  // restava VERDE, perché un'altra sottocartella qualsiasi la soddisfaceva. Provava una proprietà
  // vera e irrilevante. È AR-461 applicato a me stessa nello stesso lotto in cui lo curo.
  //
  // La misura giusta è il DENOMINATORE. Qui il perimetro lo derivo per conto mio, con le sole
  // esclusioni che il guardiano DICHIARA, e pretendo lo stesso numero: se lui ne salta uno in più —
  // una cartella tolta di nascosto, un filtro rimesso a mano — i due conti divergono e questo
  // diventa rosso. Un'esenzione si discute, un'omissione no perché nessuno la vede.
  const r = spawnSync(process.execPath, ["cervello/import-che-esegue.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
  });
  const esito = JSON.parse(r.stdout);
  const attesi = elencaFile(join(REPO, "cervello"), { estensioni: [".mjs"], escludi: Object.keys(ESCLUSI) });
  assert.notEqual(attesi, null, "non ho potuto derivare il perimetro da qui: senza, questa prova non misura niente");
  assert.equal(
    esito.su,
    attesi.length,
    `il guardiano ha guardato ${esito.su} moduli, il perimetro dichiarato ne conta ${attesi.length}: ` +
      "qualcuno è stato tolto senza dichiararlo, ed è così che un guardiano nasce verde su metà del suo lavoro",
  );
  assert.ok(Object.keys(ESCLUSI).length > 0, "le esclusioni vanno DICHIARATE col perché");
  assert.ok(ESCLUSI.test, "cervello/test/ resta fuori apposta: quei file SONO programmi, eseguire è il loro mestiere");
});

test("SUL CAMPO: il tetto dichiarato è un numero fermo, non 'quanti ne trovo oggi'", () => {
  assert.equal(typeof TETTO_ALLA_NASCITA, "number");
  assert.ok(Number.isInteger(TETTO_ALLA_NASCITA) && TETTO_ALLA_NASCITA > 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② IL BLOCCO DURO
// ─────────────────────────────────────────────────────────────────────────────

test("un modulo malato che il LOTTO tocca è mio, e nessun tetto lo assolve", () => {
  const malati = [{ nome: "vecchio.mjs", righe: ["main();"] }, { nome: "mio.mjs", righe: ["main();"] }];
  const misurati = ["vecchio.mjs", "mio.mjs", "sano.mjs"];
  assert.deepEqual(malatiToccati(malati, ["cervello/mio.mjs"], misurati), ["mio.mjs"]);
  assert.deepEqual(malatiToccati(malati, ["cervello/sano.mjs"], misurati), [], "un file toccato ma sano non è una violazione");
});

test("malatiToccati(): un modulo in sottocartella si riconosce col suo percorso, non col solo nome", () => {
  const malati = [{ nome: "capacita/cap-01-il-gemello-digitale.mjs", righe: ["main();"] }];
  const misurati = ["capacita/cap-01-il-gemello-digitale.mjs"];
  assert.deepEqual(malatiToccati(malati, ["cervello/capacita/cap-01-il-gemello-digitale.mjs"], misurati), [
    "capacita/cap-01-il-gemello-digitale.mjs",
  ]);
});

test("se git non risponde, non attribuisco e NON assolvo", () => {
  assert.equal(malatiToccati([{ nome: "x.mjs", righe: ["main();"] }], null, ["x.mjs"]), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ LE FUNZIONI PURE
// ─────────────────────────────────────────────────────────────────────────────

test("haGuardia(): riconosce le forme vere che questa casa usa", () => {
  assert.equal(haGuardia('if (import.meta.url === `file://${process.argv[1]}`) main();'), true);
  assert.equal(haGuardia("if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();"), true);
  assert.equal(haGuardia("if (require.main === module) main();"), true);
  assert.equal(haGuardia("main();"), false);
  assert.equal(haGuardia(""), false);
});

test("righeCheAgiscono(): la colonna zero è il segnale — dentro una funzione non conta", () => {
  const sano = ["export function scrivi() {", '  writeFileSync("/tmp/x", "y");', "}", "export const A = 1;"].join("\n");
  assert.deepEqual(righeCheAgiscono(sano), [], "una scrittura DENTRO una funzione parte solo se qualcuno la chiama");

  const malato = ["export function f() {}", 'writeFileSync("/tmp/x", "y");'].join("\n");
  assert.deepEqual(righeCheAgiscono(malato), ['writeFileSync("/tmp/x", "y");'], "in colonna zero parte al solo import");
});

test("righeCheAgiscono(): le tre forme con cui questa casa chiama main()", () => {
  assert.deepEqual(righeCheAgiscono("main();"), ["main();"]);
  assert.deepEqual(righeCheAgiscono("await main();"), ["await main();"]);
  assert.equal(righeCheAgiscono("main().catch((e) => {").length, 1, "la forma con .catch è la più diffusa: non deve sfuggire");
  assert.deepEqual(righeCheAgiscono("process.exit(0);"), ["process.exit(0);"]);
});

test("moduliMalati(): un programma DICHIARATO non è malato, una libreria pura nemmeno", () => {
  const moduli = [
    { nome: "guardato.mjs", sorgente: "function main(){}\nif (process.argv[1] && x) main();" },
    { nome: "libreria.mjs", sorgente: "export function f(){ return 1; }" },
    { nome: "malato.mjs", sorgente: "function main(){}\nmain();" },
  ];
  assert.deepEqual(
    moduliMalati(moduli).map((m) => m.nome),
    ["malato.mjs"],
  );
});

test("moduliMalati(): un sorgente che non ho potuto leggere non diventa un modulo sano", () => {
  // Il default silenzioso lo conterebbe fra i buoni. Qui si salta e basta: chi chiama lo dichiara
  // fra gli `illeggibili`, che è una terza colonna — non un verde per distrazione.
  assert.deepEqual(moduliMalati([{ nome: "x.mjs", sorgente: null }, null]), []);
});

// ── AR-677 — il perimetro dei moduli era quasi la metà di quello vero ─────────
//
// Il conto guardava solo il primo livello di `cervello/`: 192 moduli dichiarati contro i 277 che
// ci sono davvero. Le sottocartelle — `capacita/` e le altre — non le contava nessuno, quindi un
// modulo malato messo lì dentro era invisibile al metro che serve a trovarlo.
//
// È la forma più silenziosa di questa famiglia: il guardiano non mente, semplicemente non guarda —
// e un numero più piccolo non allarma nessuno.
test("AR-677: il perimetro scende nelle sottocartelle, non si ferma al primo livello", () => {
  const moduli = elencaFile("cervello", [".mjs"]);
  const inSottocartella = moduli.filter((f) => f.split("/").length > 2);
  assert.ok(inSottocartella.length > 0,
    "il perimetro non vede nessun modulo in sottocartella: sta guardando solo il primo livello, come prima di AR-677");
  assert.ok(moduli.length > 200,
    `il perimetro dichiara ${moduli.length} moduli: il conto a mano diceva 192 e ne mancavano quasi cento`);
});
