// AR-362 — «le lezioni si contano in tre modi diversi in tre guardiani, e chi giudica la salute non
// ha una misura sua».
//
// Misurato il 29/7 sullo STESSO file (auto-coscienza/apprendimento.json, 476 lezioni):
//   · tasso-lezioni.mjs           → `stato !== "decaduta"`                    = 476
//   · apprendimento-guardiano.mjs → `attiva | principio | senza stato`        = 471
//   · cristallizza-apprendimento  → `stato === "attiva"`                      = 381
// e i primi due scrivono lo STESSO campo `meta.lezioni_attive`, a turno, con due significati: la
// Cabina mostrava il numero di chi aveva girato per ultimo.
//
// In più il guardiano aveva l'unica misura indipendente rotta da un cambio di tipo mai propagato:
// `Number(l.usi) > 0` su un `usi` che è un ARRAY di oggetti dà NaN → sempre falso. Misurava 0
// lezioni usate mentre erano 6, e il fallback non scattava solo perché `meta.tasso_applicazione`
// esisteva — cioè il giudice ripeteva il numero scritto dal giudicato.
//
//   node cervello/test/lezioni-contate-in-tre-modi.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lezioniVive, usiDiUnaLezione, conteggiPrivatiDelleLezioni } from "../misura-parziale.mjs";
import { analizza } from "../apprendimento-guardiano.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const APPR = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

const FINTO = {
  lezioni: [
    { id: "L1", stato: "attiva", usi: [{ quando: "2026-07-01", ref: "#a" }] },
    { id: "L2", stato: "attiva", usi: [] },
    { id: "L3", stato: "principio", usi: [{ quando: "2026-07-02", ref: "#b" }] },
    { id: "L4" }, // senza stato: vecchia riga, viva
    { id: "L5", stato: "in-prova" },
    { id: "L6", stato: "decaduta", usi: [{ quando: "2026-06-01", ref: "#c" }] },
  ],
};

test("⬇️ IL CASO CHE RIVELA LA MALATTIA: `usi` è un ARRAY, e Number() su un array dà NaN", () => {
  const l = { usi: [{ quando: "x", ref: "#y" }, { quando: "z", ref: "#w" }] };
  assert.ok(Number.isNaN(Number(l.usi)), "è il vecchio calcolo: Number(array) = NaN");
  assert.equal(Number(l.usi) > 0, false, "quindi il confronto era SEMPRE falso, per costruzione");
  assert.equal(usiDiUnaLezione(l), 2, "la porta unica legge la forma array");
  assert.equal(usiDiUnaLezione({ usi: 3 }), 3, "…e regge anche la vecchia forma numerica");
  assert.equal(usiDiUnaLezione({ applicata_in: ["#a"] }), 1, "…e l'alias applicata_in");
  assert.equal(usiDiUnaLezione({}), 0);
});

test("UNA sola definizione di «lezione viva», con la partizione che quadra", () => {
  const p = lezioniVive(FINTO);
  assert.equal(p.totale, 6);
  assert.equal(p.vive, 4, "attiva + attiva + principio + senza-stato (in-prova e decaduta no)");
  assert.deepEqual(p.per_stato, { attiva: 2, principio: 1, "in-prova": 1, decaduta: 1, "senza-stato": 1 });
  assert.equal(Object.values(p.per_stato).reduce((s, n) => s + n, 0), p.totale, "la somma degli stati È il totale");
  assert.ok(p.quadra);
  assert.equal(p.con_usi, 2, "L1 e L3: la decaduta con usi non conta perché non è viva");
  assert.equal(p.tasso_usi, 0.5);
});

test("il guardiano ha una misura SUA: senza meta.tasso_applicazione non finisce a zero", () => {
  const senzaMeta = analizza(FINTO);
  assert.equal(senzaMeta.tasso_misurato_qui, true, "il fallback è scattato");
  assert.equal(senzaMeta.tasso, 0.5, "e ha misurato davvero (col vecchio Number(l.usi) faceva 0)");
  assert.ok(senzaMeta.tasso > 0, "il giudice non può essere cieco proprio sulla cosa che giudica");

  const conMeta = analizza({ ...FINTO, meta: { tasso_applicazione: 0.17 } });
  assert.equal(conMeta.tasso, 0.17, "col meta si usa il meta…");
  assert.equal(conMeta.tasso_misurato_qui, false, "…ma è dichiarato: non è una misura del guardiano");
  assert.equal(conMeta.tasso_indipendente, 0.5, "e la misura indipendente resta disponibile accanto");
});

test("sui DATI VERI i tre conteggi ora coincidono, e la partizione quadra", () => {
  const dati = JSON.parse(readFileSync(APPR, "utf8"));
  const p = lezioniVive(dati);
  const tutte = dati.lezioni || [];

  assert.equal(p.totale, tutte.length);
  assert.ok(p.quadra, `la somma degli stati (${JSON.stringify(p.per_stato)}) deve fare ${tutte.length}`);
  assert.equal(p.vive, analizza(dati).vive.length, "guardiano e porta unica danno lo stesso numero");

  // Le vecchie tre definizioni, ricalcolate qui: se dessero tutte lo stesso numero il test non
  // starebbe misurando niente, quindi si pretende che almeno una divergesse davvero.
  const vecchiaTasso = tutte.filter((l) => l.stato !== "decaduta").length;
  const vecchiaCrist = tutte.filter((l) => l && l.stato === "attiva").length;
  assert.ok(
    vecchiaTasso !== vecchiaCrist,
    `sui dati veri le vecchie definizioni divergevano (${vecchiaTasso} vs ${vecchiaCrist}): è il difetto`,
  );
  assert.ok(p.con_usi > 0, "sui dati veri ci sono lezioni con usi: il vecchio Number(l.usi)>0 ne trovava 0");
});

test("IL METRO: nessuno che legge apprendimento.json si reinventa il filtro delle lezioni", () => {
  // Prima deve MORDERE su un sorgente inventato che ha la malattia.
  const malato = [
    { file: "finto/quarto-script.mjs", testo: `const d = leggi("apprendimento.json");\nconst vive = d.lezioni.filter((l) => l.stato !== "decaduta");` },
  ];
  assert.equal(conteggiPrivatiDelleLezioni(malato).length, 1, "il quarto script che si inventa la quarta definizione va visto");

  const sano = [
    { file: "finto/a-norma.mjs", testo: `const d = leggi("apprendimento.json");\nconst p = lezioniVive(d);` },
  ];
  assert.equal(conteggiPrivatiDelleLezioni(sano).length, 0, "chi passa dalla porta è a norma");

  // E ora sui tre file veri.
  const tre = ["cervello/tasso-lezioni.mjs", "cervello/apprendimento-guardiano.mjs", "cervello/cristallizza-apprendimento.mjs"].map((f) => ({
    file: f,
    testo: readFileSync(join(ROOT, f), "utf8"),
  }));
  const fuori = conteggiPrivatiDelleLezioni(tre);
  assert.deepEqual(
    fuori.map((f) => `${f.file}:${f.riga}`),
    [],
    `conteggi privati rimasti:\n${fuori.map((f) => `  ${f.file}:${f.riga} — ${f.motivo}`).join("\n")}`,
  );
  for (const { file, testo } of tre) {
    assert.match(testo, /lezioniVive\s*\(/, `${file} deve chiamare la porta unica`);
  }
});
