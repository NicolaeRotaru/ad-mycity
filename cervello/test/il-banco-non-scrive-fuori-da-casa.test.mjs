#!/usr/bin/env node
// 🔒 AR-896 — IL BANCO APRE E RISCRIVE UN FILE, E SU QUELLA PORTA NON C'ERA NESSUNA GUARDIA
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// `cervello/non-vacuita.mjs` fa due cose con quello che legge da `mutanti.json`: ESEGUE il campo
// `test` e RISCRIVE il campo `file` — `writeFileSync(file, rotto)`, da root.
//
// Ad AR-889 avevo messo la guardia delle radici sul primo. E avevo scritto, in un commit, «otto
// strade d'attacco su otto chiuse». Erano le otto a cui avevo pensato io. Il collaudo di sicurezza
// del 31/8 è passato dalla nona, che era di fianco: `viaDi()` accettava qualunque percorso
// assoluto, e il banco ha lasciato un testimone in un file fuori dal repo, di proprietà di
// qualcun altro, senza toccare il repo.
//
// Riprodotto a mano prima di curare, con un testimone che LEGGE il file mentre il banco lo tiene
// rotto: senza la guardia il contenuto era «SCRITTA DAL BANCO COME ROOT»; con la guardia il banco
// non lo apre nemmeno.
//
// LA LEZIONE, che vale oltre a questo file: quando si mette una guardia su un modo di raggiungere
// una risorsa, si cercano TUTTI i modi. Eseguire e scrivere sono due porte sullo stesso cortile, e
// ne avevo chiusa una sola dichiarando chiuso il cortile.
//
// ⚠️ E la guardia NON è «vietato l'assoluto»: gli assoluti servono, è così che le prove di questo
// stesso banco si costruiscono una fixture. È la stessa regola di `eseguiProva` — le radici
// ammesse sono il repo più la cartella del registro che dichiara la mutazione.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, symlinkSync, mkdirSync, realpathSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dentroLeRadici } from "../non-vacuita.mjs";

const REPO = realpathSync(join(dirname(fileURLToPath(import.meta.url)), "..", ".."));

test("AR-896 · un file del repo passa", () => {
  const e = dentroLeRadici(join(REPO, "cervello/non-vacuita.mjs"), [REPO]);
  assert.equal(e.dentro, true, e.perche);
});

test("AR-896 · un file fuori dal repo NON passa, e il motivo lo dice", () => {
  const fuori = mkdtempSync(join(tmpdir(), "ar896-"));
  const bersaglio = join(fuori, "bersaglio.txt");
  writeFileSync(bersaglio, "INTATTO");
  const e = dentroLeRadici(bersaglio, [REPO]);
  assert.equal(e.dentro, false, "il banco scriverebbe fuori dal repo, come root");
  assert.match(e.perche, /fuori da ogni radice ammessa/);
});

test("AR-896 · ma la cartella del registro È una radice: le fixture delle prove restano possibili", () => {
  const casa = mkdtempSync(join(tmpdir(), "ar896-casa-"));
  const fixture = join(casa, "finta.mjs");
  writeFileSync(fixture, "// una fixture di prova");
  assert.equal(dentroLeRadici(fixture, [REPO, casa]).dentro, true,
    "vietare l'assoluto romperebbe le prove di questo stesso banco: la regola è la RADICE, non la forma");
});

test("AR-896 · un collegamento simbolico dentro il repo non aggira la regola", () => {
  const fuori = mkdtempSync(join(tmpdir(), "ar896-vittima-"));
  const vittima = join(fuori, "vera.txt");
  writeFileSync(vittima, "INTATTO");
  const dentroCasa = mkdtempSync(join(tmpdir(), "ar896-repo-"));
  const finto = join(dentroCasa, "sembra-di-casa.txt");
  symlinkSync(vittima, finto);
  const e = dentroLeRadici(finto, [dentroCasa]);
  assert.equal(e.dentro, false,
    "un collegamento dentro la radice punta fuori: senza risolverlo, la guardia è una formalità");
});

test("AR-896 · un file che non esiste ancora si giudica dalla cartella che lo conterrebbe", () => {
  const casa = mkdtempSync(join(tmpdir(), "ar896-nuovo-"));
  assert.equal(dentroLeRadici(join(casa, "mai-nato.txt"), [casa]).dentro, true);
  const altrove = mkdtempSync(join(tmpdir(), "ar896-altrove-"));
  assert.equal(dentroLeRadici(join(altrove, "mai-nato.txt"), [casa]).dentro, false);
});

test("AR-896 · un percorso che non si risolve non si tocca: ⚪, non un via libera", () => {
  const e = dentroLeRadici("/non/esiste/proprio/nulla/file.txt", [REPO]);
  assert.equal(e.dentro, false);
});

test("AR-896 · una radice che non esiste non ammette niente", () => {
  const casa = mkdtempSync(join(tmpdir(), "ar896-r-"));
  const f = join(casa, "x.txt");
  writeFileSync(f, "x");
  assert.equal(dentroLeRadici(f, ["/radice/che/non/esiste"]).dentro, false);
});

test("AR-896 · «..» non porta fuori di nascosto", () => {
  const casa = mkdtempSync(join(tmpdir(), "ar896-dd-"));
  mkdirSync(join(casa, "sotto"));
  const e = dentroLeRadici(join(casa, "sotto", "..", "..", "scappato.txt"), [casa]);
  assert.equal(e.dentro, false, "un «..» che esce dalla radice deve essere fermato come un assoluto");
});

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ IL CASO CHE MANCAVA, E CHE ME L'HA DETTO IL BANCO
//
// I casi qui sopra provano la FUNZIONE. La prima mutazione di AR-896 — togliere la chiamata dal
// ciclo, lasciando la funzione intatta — li lasciava tutti verdi: cioè difendevano una funzione
// giusta che nessuno chiamava più. È la stessa forma del difetto che sto curando, in miniatura:
// avevo chiuso una porta e dichiarato chiuso il cortile.
//
// Questo caso fa girare il BANCO VERO su un registro finto che punta fuori, e guarda il file
// bersaglio MENTRE il banco lo terrebbe rotto (il testimone se lo copia). È l'unica prova che
// misura la porta invece della serratura.
// ─────────────────────────────────────────────────────────────────────────────

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";

test("AR-896 · il BANCO VERO non apre il bersaglio fuori dalle radici", () => {
  const casaRegistro = mkdtempSync(join(tmpdir(), "ar896-reg-"));
  const casaVittima = mkdtempSync(join(tmpdir(), "ar896-vit-"));
  const bersaglio = join(casaVittima, "bersaglio.txt");
  const testimone = join(casaRegistro, "testimone.txt");
  writeFileSync(bersaglio, "INTATTO\n");

  // Il testimone COPIA il bersaglio mentre gira: se il banco l'ha riscritto, si vede qui.
  const prova = join(casaRegistro, "testimone.mjs");
  writeFileSync(prova, [
    'import { readFileSync, writeFileSync } from "node:fs";',
    `writeFileSync(${JSON.stringify(testimone)}, readFileSync(${JSON.stringify(bersaglio)}, "utf8"));`,
    "process.exit(0);",
  ].join("\n"));

  const registro = join(casaRegistro, "finto.json");
  writeFileSync(registro, JSON.stringify({
    mutanti: [{
      lotto: "ar896", difetto: "AR-896", nome: "percorso assoluto fuori da ogni radice",
      file: bersaglio, cerca: "INTATTO", sostituisci: "SCRITTA DAL BANCO COME ROOT", test: prova,
    }],
  }, null, 1));

  const r = spawnSync("node", [join(REPO, "cervello/non-vacuita.mjs"), "--lotto", "ar896"], {
    cwd: REPO, encoding: "utf8", timeout: 120_000,
    env: { ...process.env, MUTANTI_FILE: registro },
  });
  if (r.error) return; // ⚪ il banco non è partito: non ho misurato, non dichiaro verde

  assert.equal(readFileSync(bersaglio, "utf8"), "INTATTO\n", "il bersaglio è rimasto riscritto dal banco");
  assert.equal(existsSync(testimone), false,
    `il banco HA aperto e riscritto un file fuori dalle radici: il testimone ha letto «${existsSync(testimone) ? readFileSync(testimone, "utf8").trim() : ""}»`);
  assert.match(`${r.stdout}${r.stderr}`, /fuori da ogni radice ammessa/,
    "il banco non ha nemmeno detto perché non l'ha misurata: un ⚪ muto non si legge");
  rmSync(casaRegistro, { recursive: true, force: true });
  rmSync(casaVittima, { recursive: true, force: true });
});
