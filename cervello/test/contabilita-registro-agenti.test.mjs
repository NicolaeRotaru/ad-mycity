// AR-619 — il guardiano del registro controllava i nomi dei FILE ma non il `name:` scritto DENTRO
// la scheda: il router dei subagenti instrada sul campo `name` del frontmatter, quindi un rename
// interno (name ≠ filename), un name mancante o due schede con lo stesso name manderebbero le
// deleghe al senior sbagliato o nel vuoto — col guardiano ancora verde e il conteggio 120=120.
//
// Qui si esegue la funzione VERA (`analizzaNomi`, esportata da agent-registry-check.mjs) su schede
// iniettate; poi si esegue il guardiano intero sul registro reale e si guarda che il campo nuovo
// esista nel suo JSON. Misura del 13/8: 120 file, 0 name mancanti, 0 mismatch, 0 doppi.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
// L'import non deve far girare il guardiano intero (main-guard): prima di AR-619 `main()` partiva
// al solo import, stampava segnali e usciva col suo exit code.
const { estraiName, analizzaNomi } = await import(join(QUI, "..", "agent-registry-check.mjs"));

const scheda = (name) => `---\nname: ${name}\ndescription: Usa per qualcosa.\n---\ncorpo`;

test("estraiName legge il campo name dal frontmatter, e solo da lì", () => {
  assert.equal(estraiName(scheda("vendite")), "vendite");
  assert.equal(estraiName(`---\ndescription: senza name\n---\nname: nel corpo non vale`), "");
  assert.equal(estraiName("niente frontmatter"), "");
  assert.equal(estraiName(`---\nname: "tra-virgolette"\n---\n`), "tra-virgolette");
});

test("name ≠ nome-file viene FLAGGATO: è il rename interno che romperebbe il routing in silenzio", () => {
  const r = analizzaNomi([
    { file: "vendite", testo: scheda("vendite") },
    { file: "marketing", testo: scheda("growth") }, // il rename interno
  ]);
  assert.deepEqual(r.nomeDiverso, [{ file: "marketing", name: "growth" }]);
  assert.equal(r.problemi, 1);
});

test("name mancante e name doppio vengono FLAGGATI: il copia-incolla da template è il rischio concreto", () => {
  const r = analizzaNomi([
    { file: "a", testo: `---\ndescription: senza name\n---\n` },
    { file: "b", testo: scheda("b") },
    { file: "c", testo: scheda("b") }, // doppio: due schede, stesso name
  ]);
  assert.deepEqual(r.senzaName, ["a"]);
  assert.deepEqual(r.nameDoppi, [{ name: "b", files: ["b", "c"] }]);
  // "c" ha name "b" ≠ file "c": conta anche come nomeDiverso — tre problemi in tutto, nessuno nascosto
  assert.equal(r.problemi, 3);
});

test("un registro coerente non produce problemi: il guardiano non grida a vuoto", () => {
  const r = analizzaNomi([
    { file: "vendite", testo: scheda("vendite") },
    { file: "marketing", testo: scheda("marketing") },
  ]);
  assert.equal(r.problemi, 0);
});

test("il guardiano REALE porta `nomi_frontmatter` nel suo JSON e oggi (13/8) misura 120 schede coerenti", () => {
  const r = spawnSync(process.execPath, [join(QUI, "..", "agent-registry-check.mjs"), "--json"], { encoding: "utf8", timeout: 120000 });
  const out = JSON.parse(r.stdout);
  assert.ok(out.nomi_frontmatter, "senza questo campo il name resta non controllato: il difetto AR-619 com'era");
  assert.ok(Array.isArray(out.nomi_frontmatter.nomeDiverso));
  // Se in futuro un name diverge, QUESTO deve diventare rosso insieme al drift del guardiano:
  assert.equal(out.nomi_frontmatter.problemi > 0 && out.drift_totale === 0, false, "un problema sui name deve pesare nel drift totale");
});
