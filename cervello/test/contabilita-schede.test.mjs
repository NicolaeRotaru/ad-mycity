// AR-582 — schede aperte senza `impatto_crescita` (e due senza `nato`): la coda per priorità non
// sa dove metterle, e il conto mensile non le vede nascere.
//
// Il fatto: il contratto del cantiere prevede impatto_crescita (alto|medio|basso) su ogni scheda —
// è il criterio con cui «i fix si chiudono per impatto sulla crescita». AR-437..440 ne sono privi
// (439/440 anche di `nato`), e la generazione nuova di schede (13/8) usa `severita` al posto di
// `gravita`: un guardiano che legge solo il nome vecchio è cieco su tutta la generazione nuova.
//
// Il FRENO è `schedeIncomplete` in cantiere-prove.mjs (nel report a ogni giro; `--gate-campi` lo
// rende un rosso). La RIPARAZIONE (B-impatto.mjs) è provata qui sul dry-run/applica con dati iniettati.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const QUI = dirname(fileURLToPath(import.meta.url));
// L'import NON deve far girare il guardiano: prima di AR-582 cantiere-prove leggeva il cantiere
// vero (e poteva uscire 1) al solo essere importato — la malattia «programma-che-parte-importando».
const { schedeIncomplete, gravitaDi } = await import(join(QUI, "..", "cantiere-prove.mjs"));

test("gravitaDi legge sia il nome vecchio (gravita) sia quello nuovo (severita)", () => {
  assert.equal(gravitaDi({ gravita: "grave" }), "grave");
  assert.equal(gravitaDi({ severita: "bloccante" }), "bloccante", "le schede del 13/8 usano `severita`: cieco lì = cieco su tutta la generazione nuova");
  assert.equal(gravitaDi({}), null);
});

test("schedeIncomplete flagga le NON minori aperte senza impatto_crescita e/o nato — il caso AR-437..440", () => {
  const difetti = [
    { id: "AR-437", stato: "aperto", gravita: "grave", nato: "2026-07-29 17:02" }, // manca impatto
    { id: "AR-439", stato: "aperto", gravita: "alto" }, // mancano entrambi
    { id: "AR-900", stato: "aperto", severita: "grave", nato: "2026-08-13 08:50" }, // generazione nuova, manca impatto
    { id: "AR-901", stato: "aperto", gravita: "grave", impatto_crescita: "alto", nato: "2026-08-01 10:00" }, // completa
  ];
  const out = schedeIncomplete(difetti);
  assert.deepEqual(out.map((x) => x.id), ["AR-437", "AR-439", "AR-900"]);
  assert.deepEqual(out.find((x) => x.id === "AR-439").manca, ["impatto_crescita", "nato"]);
});

test("le minori e le chiuse NON vengono flaggate: il contratto duro vale dove si decide la priorità", () => {
  const difetti = [
    { id: "M1", stato: "aperto", gravita: "minore" },
    { id: "M2", stato: "aperto", severita: "minore" },
    { id: "C1", stato: "chiuso", gravita: "grave" },
  ];
  assert.deepEqual(schedeIncomplete(difetti), []);
});

test("il report del guardiano porta le schede incomplete: `schede_incomplete` c'è sempre nel JSON", () => {
  const r = spawnSync(process.execPath, [join(QUI, "..", "cantiere-prove.mjs"), "--dry", "--json"], { encoding: "utf8", timeout: 120000 });
  const report = JSON.parse(r.stdout);
  assert.ok(Array.isArray(report.schede_incomplete), "senza questa chiave i campi mancanti tornano invisibili");
});

// ── la riparazione dati: B-impatto.mjs su un cantiere INIETTATO ──────────────
const SCRIPT = join(process.env.CORSIE_DIR || new URL("../riparazioni/", import.meta.url).pathname, "B-impatto.mjs");

function cantiereFinto(dove) {
  const file = join(dove, "cantiere.json");
  writeFileSync(file, `${JSON.stringify({
    aggiornato: "2026-08-13 12:00",
    difetti: [
      { id: "AR-437", stato: "aperto", gravita: "grave", nato: "2026-07-29 17:02", titolo: "cancello rosso per costruzione" },
      { id: "AR-438", stato: "aperto", gravita: "medio", nato: "2026-07-29 17:12", titolo: "visita cieca sulla Cabina" },
      { id: "AR-439", stato: "aperto", gravita: "alto", titolo: "stampSegnale senza timeout" },
      { id: "AR-440", stato: "aperto", gravita: "alto", titolo: "allarme cronico = sfondo" },
      { id: "AR-999", stato: "aperto", gravita: "grave", titolo: "un'altra scheda: NON si tocca" },
    ],
  }, null, 2)}\n`, "utf8");
  return file;
}

test("B-impatto: il dry-run NON scrive; --applica valorizza impatto_crescita CON il perché e il nato con la fonte", () => {
  const dove = mkdtempSync(join(tmpdir(), "impatto-"));
  const file = cantiereFinto(dove);
  const prima = readFileSync(file, "utf8");
  const dry = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--no-git"], { encoding: "utf8", timeout: 30000 });
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(readFileSync(file, "utf8"), prima, "dry-run: il file resta identico al byte");

  const r = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--no-git", "--applica"], { encoding: "utf8", timeout: 30000 });
  assert.equal(r.status, 0, r.stderr);
  const dopo = JSON.parse(readFileSync(file, "utf8")).difetti;
  const per = Object.fromEntries(dopo.map((d) => [d.id, d]));
  for (const id of ["AR-437", "AR-438", "AR-439", "AR-440"]) {
    assert.ok(["alto", "medio", "basso"].includes(per[id].impatto_crescita), `${id}: l'impatto deve stare nella tassonomia reale del cantiere`);
    assert.match(per[id].impatto_crescita_nota, /scelta ragionata/, `${id}: mai un valore senza il perché scritto accanto`);
    assert.equal(per[id].stato, "aperto", `${id}: lo stato non si tocca MAI`);
  }
  assert.equal(per["AR-999"].impatto_crescita, undefined, "le altre schede non si toccano");
  assert.deepEqual(
    schedeIncomplete(dopo.filter((d) => d.nato)),
    [],
    "dopo la riparazione, il freno non flagga più le schede riparate (qui il nato via git è saltato con --no-git)",
  );
  const r2 = spawnSync(process.execPath, [SCRIPT, `--root=${dove}`, `--file=${file}`, "--no-git", "--applica"], { encoding: "utf8", timeout: 30000 });
  assert.equal(r2.status, 0);
  assert.doesNotMatch(r2.stdout, /impatto_crescita=/, "idempotente: al secondo giro non riscrive niente");
});
