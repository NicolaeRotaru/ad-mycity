// Le voci che tornano in lavoro (officina minima del 15/11, pezzo 4): `pronte` scrive quattro elenchi di chiavi dai
// percorsi dei file e dagli esiti, dopo aver fuso voce per voce i giri successivi; `dividi` dà un padrone solo a una
// prova comune e manda una serve_file_altrui da chi ha il file; `copertura-prima` vuole un padrone per ogni file;
// la scheda porta la modifica scritta nel referto vecchio. Il 13/11 alle 07:16 cinque voci sono state tolte con un
// revert per le prove comuni; il 14/11 su 20 voci rimandate allo stesso padrone 11 sono tornate serve_file_altrui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fondiVoci, elenchiPronte, decidi, assegnaOnda, controllaOnda, conFileCheServono, testoScheda } from "../riparazione-sessioni.mjs";

const PROGRAMMA = join(dirname(fileURLToPath(import.meta.url)), "..", "riparazione-sessioni.mjs");

const voce = (id, chiave, gravita, file) => ({ id, chiave, gravita, file });
const piano = {
  onde: [
    { onda: 1, sessioni: { R04: { file: ["app/api/x.ts"], voci: [voce("R04-012", "k|a", "minore", ["app/api/x.ts"]), voce("R04-013", "k|dup", "minore", ["lib/d.ts"])] } } },
    { onda: 2, sessioni: {
      R08: { file: ["lib/b.ts", "lib/c.ts"], voci: [voce("R08-016", "k|b", "minore", ["lib/b.ts"]), voce("R08-017", "k|g", "grave", ["lib/c.ts"]), voce("R08-018", "k|altrui", "minore", ["lib/b.ts"]), voce("R08-019", "k|parz", "minore", ["lib/b.ts"])] },
      R09: { file: ["lib/e.ts", "supabase/migrations/300_x.sql"], voci: [voce("R09-001", "k|nic", "minore", ["lib/e.ts"]), voce("R09-002", "k|mig", "minore", ["supabase/migrations/300_x.sql"]), voce("R09-003", "k|dup", "minore", ["lib/e.ts"])] },
    } },
  ],
};
const riparato = (id, chiave, extra = {}) => ({ id, chiave, esito: "riparato", prova_comando: "x", rimessa: { esito: "regge", uscita: 0, comando: "x" }, ...extra });
const referti = {
  R04: { voci: [riparato("R04-012", "k|a"), { id: "R04-013", chiave: "k|dup", esito: "non_codice", nota: "nell onda 1 sembrava una cosa per Nicola" }] },
  R08: { voci: [riparato("R08-016", "k|b"), riparato("R08-017", "k|g"),
    { id: "R08-018", chiave: "k|altrui", esito: "serve_file_altrui", serve_file_altrui: [{ file: "lib/e.ts", modifica: "togli il controllo doppio alla riga 40" }, { file: "lib/e2.ts", modifica: "esporta formatta()" }] },
    { id: "R08-019", chiave: "k|parz", esito: "parziale", cosa_resta: "manca la stessa guardia in lib/e.ts, che è di R09" }] },
  R09: { voci: [{ id: "R09-001", chiave: "k|nic", esito: "non_fatto", nota: "serve STRIPE_WEBHOOK_SECRET nelle impostazioni" }, { id: "R09-002", chiave: "k|mig", esito: "parziale", cosa_resta: "la migrazione" },
    { id: "R09-003", chiave: "k|dup", esito: "serve_file_altrui", serve_file_altrui: [{ file: "lib/b.ts", modifica: "nuova" }] }] },
};
const kv = (id, chiave, extra) => ({ id, chiave, verdetto: "regge", giudizio: "pieno", rimessa: { uscita: 0, comando: "node cervello/prova-rimessa.mjs" }, ...extra });
const collaudi = [
  { collaudatore: "K02", riparatori: ["R04"], voci: [kv("R04-012", "k|a", { verdetto: "parziale", rimessa: { uscita: 3, comando: "node cervello/prova-rimessa.mjs" } })] },
  { collaudatore: "K08", riparatori: ["R08"], voci: [kv("R08-016", "k|b", { verdetto: "non_regge" }), kv("R08-017", "k|g", { giudizio: "nessuno" })] },
];
const calcola = () => elenchiPronte({ piano, referti, collaudi, decisioni: decidi({ piano, referti, collaudi, hub: new Set() }) });

test("fondiVoci: il giro dopo vince voce per voce, le voci che non porta restano", () => {
  const f = fondiVoci({ finita: true, voci: [{ id: "a", esito: "parziale" }, { id: "b", esito: "riparato" }] }, { finita: true, voci: [{ id: "a", esito: "riparato" }] });
  assert.deepEqual(f.voci.map((v) => `${v.id}:${v.esito}`), ["a:riparato", "b:riparato"]);
  assert.equal(fondiVoci(null, { voci: [] }).voci.length, 0);
});

test("A: il minore a uscita 3 con giudizio pieno c'è; il minore che non regge e il grave no", () => {
  const { elenchi } = calcola();
  assert.ok(elenchi.A.includes("k|a"));
  assert.ok(!elenchi.A.includes("k|b"), "R08-016 non regge: non è da ricollaudare, è da rifare");
  assert.ok(!elenchi.A.includes("k|g"), "un grave non entra mai in A");
});

test("B, C e D dai percorsi e dagli esiti; una voce unica per chiave, con l'onda più nuova", () => {
  const { elenchi, precedenti, righeB } = calcola();
  assert.deepEqual(elenchi.B.sort(), ["k|altrui", "k|dup"]);
  assert.equal(righeB, 2);
  assert.ok(!elenchi.D.includes("k|dup"), "k|dup era D nell onda 1 e B nella 2: vale l onda più nuova, in un elenco solo");
  assert.equal(precedenti["k|dup"].id, "R09-003", "la stessa chiave in due onde vale una volta, con l'onda 2");
  assert.deepEqual(precedenti["k|altrui"].file_che_servono, ["lib/e.ts", "lib/e2.ts"]);
  assert.deepEqual(elenchi.C, ["k|parz"], "il parziale nomina lib/e.ts, che nel piano è di R09");
  assert.deepEqual(elenchi.D.sort(), ["k|mig", "k|nic"], "una migrazione nominata e un segreto nominato vanno a Nicola");
  const tutte = Object.values(elenchi).flat();
  assert.equal(new Set(tutte).size, tutte.length, "nessuna voce in due elenchi");
});

test("dividi: una prova comune ha un padrone solo, e una serve_file_altrui va da chi ha il file che le serve", () => {
  const v = (chiave, file) => ({ chiave, gravita: "minore", dimensione: "x", titolo: chiave, file });
  const r = assegnaOnda([v("p|1", ["lib/a.ts", "tests/unit/comune.test.ts"]), v("p|2", ["lib/b.ts", "tests/unit/comune.test.ts"])], { sessioni: 2 });
  const chi = Object.entries(r.sessioni).filter(([, s]) => s.file.includes("tests/unit/comune.test.ts")).map(([n]) => n);
  assert.equal(chi.length, 1, "la prova comune ha un padrone solo");
  const insieme = Object.values(r.sessioni).find((s) => s.voci.length === 2) ?? null;
  assert.ok(insieme || r.rimandate.length === 1, "le due voci stanno insieme, oppure la seconda va all'onda dopo");
  const conFile = conFileCheServono([v("s|1", ["lib/x.ts"])], new Map([["s|1", ["lib/padrone.ts"]]]));
  assert.deepEqual(conFile[0].file, ["lib/x.ts", "lib/padrone.ts"]);
  const r2 = assegnaOnda([v("q|1", ["lib/padrone.ts"]), ...conFile], { sessioni: 2 });
  const s1 = Object.values(r2.sessioni).find((s) => s.voci.some((x) => x.chiave === "s|1"));
  assert.ok(!s1 || s1.file.includes("lib/padrone.ts"), "chi riceve la serve_file_altrui ha il file che le serve");
});

test("copertura-prima: una prova comune senza padrone, o di un'altra sessione, è rossa", () => {
  const prova = "tests/unit/comune.test.ts";
  const o = { onda: 2, base: "abc", candidate: ["c|1", "c|2"], sessioni: {
    R10: { file: ["lib/a.ts"], voci: [{ id: "R10-001", chiave: "c|1", gravita: "minore", file: ["lib/a.ts", prova] }] },
    R11: { file: ["lib/b.ts"], voci: [{ id: "R11-001", chiave: "c|2", gravita: "minore", file: ["lib/b.ts", prova] }] } } };
  const ctx = { candidate: ["c|1", "c|2"], casa: "macchina" };
  assert.match(controllaOnda(o, ctx).join("\n"), /R10-001: tocca tests\/unit\/comune\.test\.ts, che in quest'onda non ha un padrone/);
  o.sessioni.R10.file.push(prova);
  const rossi = controllaOnda(o, ctx).join("\n");
  assert.doesNotMatch(rossi, /non ha un padrone/);
  assert.match(rossi, /R11-001: tocca tests\/unit\/comune\.test\.ts, che in quest'onda è di R10/);
  // Una prova citata da una voce sola non decide niente (la regola di prima resta).
  const sola = { onda: 2, base: "abc", candidate: ["c|1"], sessioni: { R10: { file: ["lib/a.ts"], voci: [{ id: "R10-001", chiave: "c|1", gravita: "minore", file: ["lib/a.ts", "tests/unit/sola.test.ts"] }] } } };
  assert.deepEqual(controllaOnda(sola, { candidate: ["c|1"], casa: "macchina" }), []);
});

test("la scheda di una voce B porta il testo della modifica scritta nel referto vecchio", () => {
  const sessione = { voci: [{ id: "R30-001", chiave: "k|altrui", gravita: "minore", titolo: "t", file: ["lib/e.ts"] }], file: ["lib/e.ts"] };
  const { precedenti } = calcola();
  const t = testoScheda({ nome: "R30", onda: 3, casa: "sito", deposito: "d", base: "b", ramo: "r", regista: "g", cartella: "c", sessione, precedenti });
  assert.match(t, /togli il controllo doppio alla riga 40/);
  assert.match(t, /esporta formatta\(\)/);
  assert.match(t, /prima: serve_file_altrui/);
});

test("il comando pronte scrive i quattro elenchi e pronte.json nella cartella della campagna", () => {
  const t = mkdtempSync(join(tmpdir(), "pronte-"));
  try {
    const C = join(t, "consegne/riparazioni/2026-11-15-prova");
    const scrivi = (p, x) => { mkdirSync(dirname(join(C, p)), { recursive: true }); writeFileSync(join(C, p), JSON.stringify(x)); };
    scrivi("perimetro.json", { casa: "macchina", profilo: "tutto", lavorabili: [] });
    scrivi("piano.json", { ...piano, casa: "macchina", cucitura: [], eccedenza: [] });
    for (const [n, r] of Object.entries(referti)) scrivi(`referti/${n}.json`, { sessione: n, finita: true, ...r });
    for (const c of collaudi) scrivi(`collaudi/${c.collaudatore}.json`, c);
    const r = spawnSync(process.execPath, [PROGRAMMA, "pronte", "--cartella", C, "--radice", t], { encoding: "utf8" });
    assert.notEqual(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /A 1 da ricollaudare · B 2 serve_file_altrui \(2 righe nei referti\) · C 1 .* · D 2 per Nicola/);
    const b = readFileSync(join(C, "pronte/B-serve-file-altrui.txt"), "utf8").split("\n").filter((x) => x && !x.startsWith("#"));
    assert.deepEqual(b.sort(), ["k|altrui", "k|dup"]);
    assert.equal(JSON.parse(readFileSync(join(C, "pronte/pronte.json"), "utf8")).conti.D, 2);
  } finally { rmSync(t, { recursive: true, force: true }); }
});
