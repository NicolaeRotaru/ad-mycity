// AR-431 — «La mappa dei rischi dell'azienda è ferma al due luglio e nessuno controlla che sia
// fresca, mentre per la checklist e gli obiettivi il controllo c'è.»
//
// Il guardiano dei rischi c'è dal lotto 41 e gira nel giro. Ma il `fix_proposto` aveva un'ultima
// clausola — quella che salta sempre, perché arriva quando il lavoro sembra finito:
//
//   «E rendere la regola generale: ogni documento di governo (rischi, OKR, checklist, scadenzario,
//    glossario KPI) ha un guardiano di freschezza, e la lista sta in un posto solo.»
//
// È esattamente il quinto perché della scheda: «quando qui nasce una FAMIGLIA di controlli nessuno
// passa in rassegna tutti i documenti che dovrebbero entrarci — le famiglie crescono per incidenti,
// non per copertura». Senza la rassegna si aspetta il prossimo incidente per scoprire il prossimo
// documento scoperto.
//
// NON-VACUITÀ (eseguita): togliendo la voce `attesa` allo scadenzario in documenti-di-governo.mjs,
// il caso «la lista vera è coperta» diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DOCUMENTI, copertura, scoperti } from "../documenti-di-governo.mjs";

const CERVELLO = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(CERVELLO, "..");
const OGGI = Date.now();

/** I guardiani che esistono DAVVERO sul disco: dichiarare non è essere. */
const guardianiVeri = new Set(
  DOCUMENTI.map((d) => d.guardiano)
    .filter(Boolean)
    .filter((g) => existsSync(join(REPO, g)))
);

// ── ① Il guardiano dei rischi, quello del difetto, funziona e frena ─────────────────────────────

test("AR-431 — freschezza-rischi gira sul registro vero e sa dire di no", () => {
  const r = spawnSync(process.execPath, [join(CERVELLO, "freschezza-rischi.mjs"), "--json"], { encoding: "utf8", timeout: 60_000 });
  assert.notEqual(r.status, 2, `guardiano CIECO: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  assert.ok(j.controllati > 0, "zero rischi controllati sarebbe un verde per assenza di lavoro");
  assert.equal(j.ok, r.status === 0, "il verdetto stampato e il codice di uscita devono dire la stessa cosa");
});

test("AR-431 — e FRENA davvero: un registro fermo da un anno lo fa uscire rosso", () => {
  const dir = mkdtempSync(join(tmpdir(), "c9-rischi-"));
  const file = join(dir, "REGISTRO-RISCHI.json");
  writeFileSync(
    file,
    JSON.stringify({ aggiornato: "2025-08-15", rischi: [{ id: "R1", rischio: "cassa", gravita: "alta", owner: "finanza", ultima_revisione: "2025-08-15" }] })
  );
  const r = spawnSync(process.execPath, [join(CERVELLO, "freschezza-rischi.mjs")], { encoding: "utf8", env: { ...process.env, RISCHI_FILE: file }, timeout: 60_000 });
  assert.equal(r.status, 1, "un tetto mai superato è indistinguibile da un tetto scollegato: qui lo si supera apposta");
});

// ── ② L'ULTIMA CLAUSOLA: la lista sta in un posto solo, e la copertura si misura ────────────────

test("AR-431 — la lista dei documenti di governo esiste ed è quella nominata dalla scheda", () => {
  assert.deepEqual(
    DOCUMENTI.map((d) => d.id).sort(),
    ["checklist", "glossario-kpi", "okr", "rischi", "scadenzario"],
    "la scheda ne nomina cinque: se la lista ne perde uno, quella è di nuovo la famiglia che cresce per incidenti"
  );
});

test("AR-431 — IL PUNTO: sulla lista vera nessun documento di governo è scoperto in silenzio", () => {
  const c = copertura(OGGI, guardianiVeri);
  assert.deepEqual(
    c.buchi.map((b) => `${b.id}: ${b.motivo}`),
    [],
    "un documento senza guardiano e senza un'attesa datata col perché è un'omissione, e nessuno la vede"
  );
});

test("AR-431 — un documento senza guardiano e senza attesa è un BUCO", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: null }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /omissione/);
});

test("AR-431 — un'attesa con la data ma senza il perché non vale: un'etichetta non è una ragione", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: null, attesa: { fino: "2099-01-01", perche: "" } }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /perché/);
});

test("AR-431 — LA REGOLA CHE CONTA: passata la data, l'attesa torna a essere un buco", () => {
  const doc = [{ id: "x", documento: "y.json", guardiano: null, attesa: { fino: "2026-01-01", perche: "arriva col lotto dopo" } }];
  assert.equal(scoperti(Date.UTC(2025, 11, 1), new Set(), doc).length, 0, "prima della scadenza l'attesa è legittima");
  assert.equal(scoperti(Date.UTC(2026, 5, 1), new Set(), doc).length, 1, "un'attesa senza fine è un'esenzione travestita");
});

test("AR-431 — dichiarare un guardiano che non esiste non salva nessuno", () => {
  const b = scoperti(OGGI, new Set(), [{ id: "x", documento: "y.json", guardiano: "cervello/mai-nato.mjs" }]);
  assert.equal(b.length, 1);
  assert.match(b[0].motivo, /non esiste/);
});
