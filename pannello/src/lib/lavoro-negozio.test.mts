/**
 * AR-801 — la coda dei lavori non aveva il campo del negozio, e in due punti il negozio spariva.
 *
 * IL DIFETTO. `ARCHITETTURA-TRE-MACCHINE.md` chiede `negozio_id` su ogni riga, «nessuna tabella
 * senza». Il lato codice della BOTTEGA il muro ce l'ha (`cervello/bottega/lavoro.mjs` non sa
 * costruire un lavoro senza negozio), ma la tabella `lavori` — quella che il worker legge davvero —
 * il campo non ce l'aveva. Letta dal vivo il 23/8: 3.255 righe, nessun negozio. Finché è così il
 * muro tiene solo per chi passa dal modulo nuovo, e una query diretta lo aggira in silenzio.
 *
 * LE DUE TRAPPOLE, trovate leggendo il codice e non cercandole:
 *
 * ① `bodyJsonLavoro` non passa il payload al database: lo RICOSTRUISCE campo per campo. Mettere
 *    `negozio_id` nel payload e fermarsi lì sarebbe stato un fix che non fixa — il campo moriva
 *    una riga dopo, senza che nessuno lo vedesse.
 *
 * ② `postLavoroUnaVolta`, se l'inserimento fallisce, riprova TOGLIENDO la colonna nuova. Per
 *    `gruppo_id` è giusto: si perde un raggruppamento della chat. Per il negozio sarebbe il
 *    difetto reso automatico — il lavoro di una bottega nel mucchio comune, in silenzio, a ogni
 *    inserimento, con la riga che risulta scritta bene.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CENTRO,
  eDelCentro,
  negozioPerLaCoda,
  siPuoRipiegareSenzaNegozio,
} from "./lavoro-negozio.ts";

// ─────────────────────────────────────────────────────────────────────────────
// ① Le tre risposte: centro · un negozio · un errore. Non due.
// ─────────────────────────────────────────────────────────────────────────────

test("chi non dichiara un negozio sta chiedendo un lavoro del centro, e lo dice", () => {
  assert.equal(negozioPerLaCoda(undefined), CENTRO);
  assert.equal(negozioPerLaCoda(null), CENTRO);
  assert.equal(negozioPerLaCoda(), CENTRO);
});

test("un negozio vero passa così com'è, senza spazi intorno", () => {
  assert.equal(negozioPerLaCoda("pane-quotidiano"), "pane-quotidiano");
  assert.equal(negozioPerLaCoda("  pane-quotidiano  "), "pane-quotidiano");
});

test("IL CASO: un negozio dichiarato e VUOTO è un errore, non il centro", () => {
  // Chi passa "" credeva di avere un negozio e non ce l'aveva. Farlo scivolare nel centro
  // trasformerebbe un lavoro di bottega in un lavoro del mucchio comune, in silenzio.
  for (const vuoto of ["", "   ", "\t", "\n"]) {
    assert.throws(() => negozioPerLaCoda(vuoto), /negozio-dichiarato-e-vuoto/,
      `«${JSON.stringify(vuoto)}» doveva far fallire, non diventare il centro`);
  }
});

test("il centro ha un nome, non è il campo vuoto", () => {
  assert.equal(CENTRO.trim(), CENTRO);
  assert.ok(CENTRO.length > 0, "un centro senza nome è di nuovo un campo che si può dimenticare");
  assert.ok(eDelCentro(CENTRO));
  assert.ok(!eDelCentro("pane-quotidiano"));
});

// ─────────────────────────────────────────────────────────────────────────────
// ② Il ripiego che toglie la colonna vale per il centro e NON per una bottega.
// ─────────────────────────────────────────────────────────────────────────────

test("il centro può essere scritto anche senza la colonna: nel mucchio comune ci sta di casa", () => {
  assert.equal(siPuoRipiegareSenzaNegozio(CENTRO), true);
});

test("IL CASO: una bottega NON si scrive mai senza il suo negozio", () => {
  // È il difetto stesso reso automatico: «il database rifiuta la riga col negozio? scrivila senza».
  for (const negozio of ["pane-quotidiano", "garetti", "x"]) {
    assert.equal(siPuoRipiegareSenzaNegozio(negozio), false, `«${negozio}» non si può spogliare`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ L'invariante sul codice vero: i tre punti dove il negozio poteva sparire.
// ─────────────────────────────────────────────────────────────────────────────

const store = readFileSync(join(process.cwd(), "src/lib/store.ts"), "utf8");
const senzaCommenti = store.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/[^\n]*$/gm, " ");

test("chi crea un lavoro scrive SEMPRE il negozio nel payload", () => {
  assert.match(senzaCommenti, /negozio_id:\s*negozioPerLaCoda\(/,
    "creaLavoroEsito non mette più il negozio nel payload");
});

test("il corpo che parte verso il database porta il negozio", () => {
  // bodyJsonLavoro ricostruisce il corpo da zero: se non nomina il campo, il campo non parte.
  assert.match(senzaCommenti, /body\.negozio_id\s*=/,
    "bodyJsonLavoro ha smesso di copiare il negozio: il campo muore qui e nessuno lo vede");
});

test("il ripiego passa dalla regola, non da un `if` scritto a mano", () => {
  assert.match(senzaCommenti, /siPuoRipiegareSenzaNegozio\(/,
    "il ripiego decide da solo se togliere il negozio");
  // La forma malata: togliere il negozio senza chiedere di chi è.
  assert.doesNotMatch(
    senzaCommenti,
    /const \{ gruppo_id: _g, negozio_id: _n, \.\.\.spoglio \} = payload;\s*res = await sbFetch/,
    "il payload spogliato non deve andare al database senza passare dalla regola",
  );
});
