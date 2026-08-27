#!/usr/bin/env node
// AR-840 — «Metà delle mutazioni risultano verificate senza esserlo.»
//
// `non-vacuita.mjs` lancia la prova di una mutazione con `spawnSync("node", [m.test])`: `m.test`
// dev'essere un PERCORSO. Dove c'è una riga di comando — `"node cervello/test/x.test.mjs"` — gira
// `node "node cervello/test/x.test.mjs"`, che non trova nessun file ed esce ≠ 0.
//
// E un'uscita ≠ 0 è ESATTAMENTE come `non-vacuita` riconosce «la prova è diventata rossa». Quindi
// quelle voci risultano verificate qualunque cosa faccia la mutazione, anche quando il fix non è
// coperto da niente.
//
// Non è un caso di scuola: in questo stesso lotto cinque mutazioni mie risultavano verificate e non
// mordevano affatto. Le ho scoperte solo applicandole a mano.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { testEseguibile, mutazioniCieche, verdettoMutazioniCieche } from "../mutazioni-senza-esecutore.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const AD = join(QUI, "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ① IL DANNO VERO, misurato eseguendo: una riga di comando esce ≠ 0 sempre
// ─────────────────────────────────────────────────────────────────────────────
prova("IL DANNO VERO: `node \"node x.mjs\"` esce ≠ 0, cioè finge una prova diventata rossa", () => {
  // È il comando che `non-vacuita` costruisce. Se un giorno node imparasse a spezzare quell'argomento
  // questo caso diventerebbe rosso, ed è giusto: il difetto non ci sarebbe più.
  const r = spawnSync("node", ["node cervello/test/una-mutazione-che-nessuno-puo-eseguire.test.mjs"], {
    cwd: AD,
    encoding: "utf8",
  });
  assert.notEqual(r.status, 0, "il comando è riuscito: il difetto non sarebbe reale");
  assert.match(`${r.stderr}`, /MODULE_NOT_FOUND|Cannot find module/, "non è il fallimento che ci aspettiamo");
});

prova("un percorso vero, invece, si esegue", () => {
  const r = spawnSync("node", ["cervello/test/il-muro-arriva-prima-della-porta.test.mjs"], { cwd: AD, encoding: "utf8" });
  assert.equal(r.status, 0, `un percorso valido doveva girare: ${r.stderr}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// ② IL GIUDIZIO
// ─────────────────────────────────────────────────────────────────────────────
prova("una riga di comando non è un percorso, comunque sia scritta", () => {
  const esiste = () => true;
  for (const t of ["node cervello/test/x.test.mjs", "node --test cervello/test/x.test.mjs", "npx vitest run x"]) {
    assert.equal(testEseguibile(t, esiste).ok, false, `«${t}» è passato`);
  }
});

prova("un percorso che esiste passa, uno che non esiste no", () => {
  assert.equal(testEseguibile("cervello/test/x.test.mjs", () => true).ok, true);
  assert.equal(testEseguibile("cervello/test/mai-esistito.test.mjs", () => false).ok, false);
});

prova("un percorso che esce dalle prove del cervello non conta come eseguibile", () => {
  // `esiste` dice sempre sì: se il contenimento non ci fosse, questi passerebbero tutti.
  for (const p of ["../../etc/passwd", "cervello/../cervello/test/x.test.mjs", "/tmp/x.test.mjs"]) {
    assert.equal(testEseguibile(p, () => true).ok, false, `«${p}» è passato`);
  }
  // …ma una prova vera che sta fuori da `cervello/test/` resta valida: il metro conta i percorsi
  // che non si possono eseguire, non quelli fuori da una cartella scelta da me. Provato: tre voci
  // puntano a un guardiano lanciabile o a una prova del Pannello.
  for (const p of ["pannello/src/lib/lavoro-negozio.test.mts", "cervello/spazzata-fratelli.mjs"]) {
    assert.equal(testEseguibile(p, () => true).ok, true, `«${p}» è stato scartato`);
  }
});

prova("un test assente non è «va bene»", () => {
  for (const t of [undefined, null, "", "   ", 42]) {
    assert.equal(testEseguibile(t, () => true).ok, false, `${JSON.stringify(t)} è passato`);
  }
});

prova("il perché torna sempre, e dice quale dei due difetti è", () => {
  assert.match(testEseguibile("node x.mjs", () => true).perche, /riga di comando/);
  assert.match(testEseguibile("cervello/test/x.mjs", () => false).perche, /non esiste/);
});

// ─────────────────────────────────────────────────────────────────────────────
// ③ IL TETTO: ereditato si conta, nuovo si blocca
// ─────────────────────────────────────────────────────────────────────────────
prova("una mutazione cieca in più fa violazione", () => {
  const v = verdettoMutazioniCieche({ quante: 436, totale: 900, tetto: 435 });
  assert.equal(v.esito, "violazione");
  assert.match(v.motivo, /PERCORSO/, "il motivo deve dire come si ripara, non solo che è rotto");
});

prova("scendere non è una violazione: è un tetto da abbassare", () => {
  assert.equal(verdettoMutazioniCieche({ quante: 400, totale: 900, tetto: 435 }).esito, "debito");
});

prova("pari al tetto si passa, ma resta debito dichiarato", () => {
  assert.equal(verdettoMutazioniCieche({ quante: 435, totale: 872, tetto: 435 }).esito, "debito");
});

prova("senza tetto il verdetto è ⚪, non verde: non ho potuto confrontare", () => {
  for (const tetto of [null, undefined, "boh"]) {
    assert.equal(verdettoMutazioniCieche({ quante: 10, totale: 100, tetto }).esito, "cieco");
  }
});

prova("il conto sulle voci vere nomina il difetto di ognuna", () => {
  const fuori = mutazioniCieche(
    [
      { difetto: "AR-1", test: "node cervello/test/a.test.mjs" },
      { difetto: "AR-2", test: "cervello/test/b.test.mjs" },
      { difetto: "AR-3" },
    ],
    (p) => p === "cervello/test/b.test.mjs",
  );
  assert.deepEqual(fuori.map((f) => f.difetto), ["AR-1", "AR-3"]);
});

prova("il guardiano è MONTATO nel cancello del lotto, non solo scritto", () => {
  // La malattia di casa: un cancello costruito bene su una porta che nessuno usa. Un contatore che
  // nessuno esegue lascerebbe crescere il numero esattamente come prima.
  const gate = readFileSync(join(AD, "cervello/cancello-lotto.mjs"), "utf8");
  // La riga deve essere VIVA, non commentata: una riga commentata contiene ancora, lettera per
  // lettera, tutto quello che una ricerca cerca. Stessa forma di AR-077 — la parola che la rottura
  // si porta dietro — ritrovata il 27/8 misurando su un guardiano vicino.
  const viva = gate
    .split("\n")
    .filter((r) => !r.trimStart().startsWith("//"))
    .join("\n");
  assert.match(
    viva,
    /passi\.push\(esegui\((?:(?!\)\);)[\s\S])*mutazioni-senza-esecutore\.mjs/,
    "il cancello non esegue il contatore: il tetto non ferma nessuno",
  );
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "ok" : "NON ok"} — ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} passate`);
if (rotte.length) process.exit(1);
