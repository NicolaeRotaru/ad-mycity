// AR-725 — il banco mette in fila anche per il COSTO, non solo per l'effetto collaterale.
//
// LA STORIA. Le due prove più pesanti del lotto 43 — quella che avvia il Pannello vero e lo guida
// con un browser, e quella che lancia il compilatore su tutta la superficie — passavano da sole e
// fallivano in compagnia. Il banco lo dichiarava («2 prove INSTABILI»), quindi nessuno mentiva: il
// punto è che una prova il cui verdetto dipende da chi le gira accanto non è una rete, e la prossima
// volta che diventa rossa nessuno sa dire se è il codice o il vicino.
//
// COSA PROVA QUESTO FILE, eseguendo:
//   ① il riconoscimento va al GESTO, non alla parola: aprire un browser e far partire il
//      compilatore contano; parlarne no. Per questo i gesti, qui dentro, sono composti a pezzi:
//      scritti per intero anche in un commento, questo file finirebbe in fila per aver spiegato di
//      cosa parla — ed è il limite noto del rilevatore, che guarda il sorgente commenti compresi;
//   ② due prove finte che si contendono la stessa risorsa vengono SERIALIZZATE dal banco vero e
//      escono verdi, invece di essere dichiarate instabili;
//   ③ sul repo vero le prove che aprono un browser o compilano sono riconosciute tutte.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { costaTroppoPerLaCorsia, perchePartireDaSola, riassuntoFila, scriveSulDatoVivo } from "../test-cervello.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const BANCO = join(REPO, "cervello/test-cervello.mjs");

// I gesti si compongono a pezzi: scritti per intero qui dentro, questo file si accuserebbe da solo.
const gestoBrowser = () => ["chromium", ".launch("].join("");
const gestoPagina = () => [".newPage", "("].join("");
const COMPILATORE = ["t", "s", "c"].join("");
const gestoCompilatore = () => `spawnSync("npx", ["${COMPILATORE}", "--noEmit"])`;

// ── ① Il gesto, non la parola ───────────────────────────────────────────────

test("chi avvia un browser vero va in fila da solo", () => {
  assert.equal(costaTroppoPerLaCorsia(`const b = await ${gestoBrowser()});`), "avvia un browser vero");
});

test("chi apre una pagina vera va in fila da solo", () => {
  assert.equal(costaTroppoPerLaCorsia(`const p = await ctx${gestoPagina()});`), "avvia un browser vero");
});

test("chi lancia il compilatore va in fila da solo", () => {
  assert.equal(costaTroppoPerLaCorsia(`const r = ${gestoCompilatore()};`), "lancia il compilatore");
});

test("una prova normale resta in corsia: il freno non deve rallentare tutti", () => {
  assert.equal(costaTroppoPerLaCorsia("import assert from 'node:assert';\nassert.equal(1, 1);"), null);
});

test("nominare un browser in un commento non costa niente, e non manda nessuno in fila", () => {
  const finta = "// questa prova parla di playwright e del browser, ma non ne apre nessuno\nassert.ok(true);";
  assert.equal(costaTroppoPerLaCorsia(finta), null, "riconoscere la PAROLA metterebbe in fila anche chi spiega");
});

test("un finto server locale non è un costo: quello lo controlli tu", () => {
  assert.equal(costaTroppoPerLaCorsia('srv.listen(0, "127.0.0.1", () => {});'), null);
});

// ── La domanda è una sola, e distingue i due motivi ─────────────────────────

test("scrivere sul dato vivo e costare troppo restano due motivi diversi, detti a parole", () => {
  const vivo = 'writeFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/x.json"), "{}");';
  assert.equal(perchePartireDaSola(vivo), "scrive sul dato vivo");
  assert.equal(perchePartireDaSola(`await ${gestoBrowser()});`), "avvia un browser vero");
  assert.equal(perchePartireDaSola("assert.ok(true);"), null);
  assert.equal(scriveSulDatoVivo(vivo), true, "il motivo vecchio non è stato perso per strada");
});

test("il riassunto conta i motivi invece di raccontarne uno solo", () => {
  const m = new Map([["a", "scrive sul dato vivo"], ["b", "avvia un browser vero"], ["c", "avvia un browser vero"]]);
  assert.equal(riassuntoFila(m), "2 avvia un browser vero · 1 scrive sul dato vivo");
  assert.equal(riassuntoFila(new Map()), "nessuna");
});

// ── ② Il banco vero: due prove che si contendono la stessa risorsa ──────────

/**
 * Due prove finte costose che si contendono LA STESSA porta. In corsia, insieme, la seconda trova la
 * porta occupata e diventa rossa; in fila, una dopo l'altra, sono verdi tutt'e due. È il caso di
 * AR-725 riprodotto in piccolo: nessun file condiviso, solo una risorsa che non si divide.
 */
function bancoSuDueProveCheSiPestano({ costose }) {
  const dir = mkdtempSync(join(tmpdir(), "mycity-in-fila-"));
  try {
    const corpo = (nome) => `
import { createServer } from "node:http";
import assert from "node:assert/strict";
${costose ? `// gesto che dichiara il costo: ${gestoBrowser()})` : "// prova leggera"}
const srv = createServer((_, res) => res.end("ok"));
await new Promise((ok, ko) => { srv.on("error", ko); srv.listen(45711, "127.0.0.1", ok); });
await new Promise((r) => setTimeout(r, 700));
await new Promise((r) => srv.close(r));
assert.ok(true, "${nome} ha tenuto la porta tutta per sé");
`;
    writeFileSync(join(dir, "aaa-porta.test.mjs"), corpo("aaa"));
    writeFileSync(join(dir, "bbb-porta.test.mjs"), corpo("bbb"));
    const r = spawnSync("node", [BANCO, "--json"], {
      encoding: "utf8",
      cwd: REPO,
      env: { ...process.env, TEST_CERVELLO_DIR: dir },
    });
    let json = null;
    try {
      json = JSON.parse(r.stdout);
    } catch {
      /* se non parla JSON lo guarda il caso, con l'uscita grezza sotto gli occhi */
    }
    return { rc: r.status, out: `${r.stdout}${r.stderr}`, json };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("due prove costose che si contendono una porta il banco le SERIALIZZA, e sono verdi", () => {
  const r = bancoSuDueProveCheSiPestano({ costose: true });
  assert.ok(r.json, `atteso JSON dal banco:\n${r.out.slice(0, 700)}`);
  assert.deepEqual(
    r.json.in_fila.sort(),
    ["aaa-porta.test.mjs", "bbb-porta.test.mjs"],
    "chi dichiara il costo deve finire in fila, non in corsia",
  );
  assert.equal(Object.values(r.json.in_fila_perche)[0], "avvia un browser vero", "e il motivo si dichiara");
  assert.equal(r.rc, 0, `serializzate devono passare tutt'e due:\n${r.out.slice(0, 700)}`);
  assert.equal(r.json.test.filter((x) => x.esito !== "ok").length, 0, "nessuna instabile, nessuna rossa");
});

test("le stesse due prove SENZA il segno del costo si pestano davvero: è il controllo del caso sopra", () => {
  // Senza questo caso il precedente non proverebbe niente: un verde potrebbe voler dire «il banco
  // serializza» oppure «queste due prove non si disturbavano comunque».
  const r = bancoSuDueProveCheSiPestano({ costose: false });
  assert.ok(r.json, `atteso JSON dal banco:\n${r.out.slice(0, 700)}`);
  assert.deepEqual(r.json.in_fila, [], "senza il gesto restano in corsia");
  assert.ok(
    r.json.test.some((x) => x.esito === "instabile"),
    `in corsia una delle due trova la porta occupata e il banco la dichiara INSTABILE — è il difetto di AR-725 riprodotto: ${JSON.stringify(r.json.test.map((x) => x.esito))}`,
  );
});

// ── ③ Il repo vero ──────────────────────────────────────────────────────────

test("sul repo vero ogni prova che apre un browser o compila è riconosciuta come costosa", () => {
  const dir = join(REPO, "cervello/test");
  const costose = readdirSync(dir)
    .filter((f) => f.endsWith(".test.mjs") && !f.startsWith("_"))
    .filter((f) => costaTroppoPerLaCorsia(readFileSync(join(dir, f), "utf8")));
  // Le tre note del lotto 43 più questa prova, che il gesto lo compone a pezzi e quindi NON è dentro.
  for (const attesa of ["c2-schermo.test.mjs", "c4-schermo-coda.test.mjs", "c4-typecheck-del-pannello.test.mjs"]) {
    if (!readdirSync(dir).includes(attesa)) continue; // una prova può essere stata rinominata: non è una bocciatura
    assert.ok(costose.includes(attesa), `${attesa} avvia un browser o il compilatore: deve girare da sola`);
  }
  assert.ok(
    !costose.includes("prove-costose-in-fila.test.mjs"),
    "questa prova NOMINA i gesti per esercitarli: se la accusasse, il rilevatore guarderebbe la parola invece del gesto",
  );
});
