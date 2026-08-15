#!/usr/bin/env node
// 🧪 AR-693 (② e ③) e AR-706 — DUE BUCHI CHE ESISTEVANO SENZA UN NUMERO.
//
// ② Ventinove prove scritte in bash non le fa girare nessuno. Il conto vero, misurato il 14/8 sullo
//   stesso commit: senza `bats` il banco diceva 1 rosso su 243; con `bats` 12. Dieci fallimenti veri
//   erano invisibili. Il banco lo dichiarava — un ⚪ per file — e un ⚪ in fondo a duecentoquaranta
//   righe si scorre. La differenza fra un buco DETTO e un buco MISURATO è che il secondo ha un tetto.
//
// ③ E quei rossi vanno contati A PARTE da quelli in Node: sono debito ereditato, e stanno negli
//   script del worker e del giro, non nel lavoro di chi consegna oggi. «12 rossi» in un numero solo
//   manda chi legge a cercare nel posto sbagliato.
//
// AR-706: la sorella a runtime. Una prova che guida il Pannello vero misurava il bordo della «prima
//   card» per dire se il tema scuro era rispettato — e quel bordo usa una variabile che si ribalta
//   da sola col tema: la misura cambiava anche con la cura TOLTA. Nessuno se n'era accorto perché
//   nessuno l'aveva mai rotta apposta. Il numero che mancava: quante prove a runtime non hanno una
//   mutazione dichiarata.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { esecutoreDichiarato, verdettoDebitoBash, fontiPossibili } from "../debito-prove-bash.mjs";
import { guidaUnaSuperficieViva, runtimeSenzaMutazione, provaDellaMutazione, verdettoTetto } from "../prove-runtime-senza-mutazione.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ── AR-693 ② — il debito delle prove in bash ────────────────────────────────

test("LA REGOLA CHE CONTA: un PERMESSO non è un esecutore", () => {
  // È l'unica traccia di bats che esisteva in tutto il repo mentre 29 prove non le faceva girare
  // nessuno. Contarla come esecutore chiuderebbe il difetto senza aver fatto girare una sola prova.
  const e = esecutoreDichiarato([{ nome: ".claude/settings.json", testo: '"Bash(npx bats:*)",' }]);
  assert.equal(e.installato, false, "l'autorizzazione a lanciarlo non è qualcuno che lo lancia");
});

test("un passo di CI che INSTALLA bats conta come esecutore", () => {
  assert.equal(esecutoreDichiarato([{ nome: ".github/workflows/x.yml", testo: "      - run: npm i -g bats" }]).installato, true);
  assert.equal(esecutoreDichiarato([{ nome: ".github/workflows/x.yml", testo: "      - uses: bats-core/bats-action@v3" }]).installato, true);
  assert.equal(esecutoreDichiarato([{ nome: "package.json", testo: '"devDependencies": { "bats": "^1.11.0" }' }]).installato, true);
  assert.equal(esecutoreDichiarato([{ nome: ".github/workflows/x.yml", testo: "      - run: bats cervello/test/*.bats" }]).installato, true);
});

test("una menzione qualsiasi non basta: un commento che nomina bats non lo installa", () => {
  const e = esecutoreDichiarato([{ nome: ".github/workflows/x.yml", testo: "# un giorno bisognerà far girare le prove bats" }]);
  assert.equal(e.installato, false);
});

test("il debito si BLOCCA quando cresce e si CONTA quando è fermo", () => {
  const nessuno = { installato: false, dove: [] };
  assert.equal(verdettoDebitoBash({ quante: 30, esecutore: nessuno, tetto: 29 }).esito, "violazione", "una prova in più mentre nessuno le esegue non è copertura");
  assert.equal(verdettoDebitoBash({ quante: 29, esecutore: nessuno, tetto: 29 }).esito, "debito");
  assert.equal(verdettoDebitoBash({ quante: 20, esecutore: nessuno, tetto: 29 }).esito, "debito");
  // Col suo esecutore il numero smette di essere debito: quelle prove le fa girare qualcuno.
  assert.equal(verdettoDebitoBash({ quante: 40, esecutore: { installato: true, dove: ["ci"] }, tetto: 29 }).esito, "ok");
});

test("i posti dove cercare un esecutore si DERIVANO dal repo, non si elencano a mano", () => {
  const fonti = fontiPossibili(REPO);
  assert.ok(fonti.length > 10, `troppo pochi posti guardati (${fonti.length}): un perimetro scritto a mano nasce verde e resta verde`);
  assert.ok(fonti.some((f) => f.startsWith(".github/workflows/")), "i workflow di CI devono essere nel perimetro");
  assert.ok(fonti.some((f) => f.endsWith(".sh")), "gli script di avvio devono essere nel perimetro");
});

test("SUL CAMPO: oggi nessuno esegue le prove in bash di questo repo, e il numero è 29", () => {
  const bats = readdirSync(join(REPO, "cervello/test")).filter((f) => f.endsWith(".bats") && !f.startsWith("_"));
  const fonti = fontiPossibili(REPO).map((rel) => {
    try {
      return { nome: rel, testo: readFileSync(join(REPO, rel), "utf8") };
    } catch {
      return { nome: rel, testo: "" };
    }
  });
  const e = esecutoreDichiarato(fonti);
  assert.equal(e.installato, false, `qualcuno adesso le esegue (${e.dove.join(", ")}): allora AR-693 ① è chiusa e questo caso va aggiornato`);
  assert.ok(bats.length >= 20, `prove in bash trovate: ${bats.length}`);
});

// ── AR-693 ③ — i rossi in bash contati a parte da quelli in Node ────────────

test("AR-693 ③ SUL CAMPO: il banco separa i rossi in Node da quelli in bash, e lo dice", () => {
  // Un banco vero su una cartella di prove FINTA: una prova in Node rossa e una in bash rossa. È
  // l'unico modo di misurare questa distinzione senza mettere due prove rotte apposta nel repo.
  const dir = mkdtempSync(join(tmpdir(), "ar693-"));
  try {
    writeFileSync(join(dir, "finta-rossa.test.mjs"), 'import assert from "node:assert/strict";\nimport { test } from "node:test";\ntest("cade", () => assert.equal(1, 2));\n');
    writeFileSync(join(dir, "finta-shell.bats"), "@test \"cade\" {\n  false\n}\n");
    // Un finto `bats` che stampa TAP: serve a provare il CABLAGGIO su una macchina dove bats non c'è
    // (che è il caso di quasi ogni sessione, ed è il difetto stesso).
    const finto = join(dir, "bats-finto.sh");
    writeFileSync(finto, "#!/bin/sh\necho '1..1'\necho 'not ok 1 cade'\nexit 1\n", { mode: 0o755 });

    const r = spawnSync(process.execPath, ["cervello/test-cervello.mjs", "--json"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, TEST_CERVELLO_DIR: dir, BATS_BIN: finto },
    });
    const j = JSON.parse(r.stdout);
    assert.deepEqual(j.rossi_node.map((f) => f.split("/").pop()), ["finta-rossa.test.mjs"], "i rossi in Node sono il lavoro di ADESSO: vanno da soli");
    assert.deepEqual(j.rossi_bash.map((f) => f.split("/").pop()), ["finta-shell.bats"], "i rossi in bash sono debito ereditato: vanno contati a parte");
    // E la riga che si legge deve dire di chi è: «2 rossi» manderebbe a cercare nel posto sbagliato.
    const testo = spawnSync(process.execPath, ["cervello/test-cervello.mjs"], {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, TEST_CERVELLO_DIR: dir, BATS_BIN: finto },
    });
    assert.match(`${testo.stdout}`, /1 in Node · 1 in bash/, "il numero deve dire di chi è, o chi legge cerca nel posto sbagliato");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── AR-706 — le prove che guidano una superficie viva ───────────────────────

test("LA REGOLA CHE CONTA: guidare un BROWSER è runtime; un finto server che ti sei acceso tu no", () => {
  assert.equal(guidaUnaSuperficieViva("browser = await chromium.launch({ headless: true });").runtime, true);
  assert.equal(guidaUnaSuperficieViva("const p = await browser.newPage(formato);").runtime, true);
  // NOMINARE playwright non basta: il rilevatore cerca il GESTO (aprire un browser, aprire una
  // pagina), non la parola. Un aiutante che lo importa e non lo guida non misura niente di vivo.
  assert.equal(guidaUnaSuperficieViva('const pw = createRequire(dove)("playwright");').runtime, false);
  // Il caso da NON accusare: decine di prove sane accendono un finto e gli parlano. Lì la misura non
  // può ribaltarsi da sola, perché il finto lo controlli tu.
  assert.equal(guidaUnaSuperficieViva('server.listen(0, "127.0.0.1", r); await fetch(url);').runtime, false);
  assert.equal(guidaUnaSuperficieViva("readFileSync(x)").runtime, false);
});

test("il rilevatore non accusa la prova che lo MISURA: l'esenzione è un import, non un nome in lista", () => {
  const sorgenteDiQuestoFile = readFileSync(fileURLToPath(import.meta.url), "utf8");
  assert.equal(
    guidaUnaSuperficieViva(sorgenteDiQuestoFile).runtime,
    false,
    "una prova sul rilevatore contiene per forza i pezzi che il rilevatore cerca: accusarla è un rosso che nessuna riparazione toglie",
  );
});

test("una prova a runtime senza mutazione viene NOMINATA; con la sua mutazione no", () => {
  const runtime = [{ file: "cervello/test/c9-schermo.test.mjs", come: "browser" }, { file: "cervello/test/c9-altro.test.mjs", come: "browser" }];
  const mutanti = [{ difetto: "AR-1", test: "node cervello/test/c9-altro.test.mjs" }];
  const scoperte = runtimeSenzaMutazione(runtime, mutanti);
  assert.deepEqual(scoperte.map((s) => s.file), ["cervello/test/c9-schermo.test.mjs"]);
});

test("il file di prova si riconosce anche quando il comando porta flag e caricatori", () => {
  assert.equal(provaDellaMutazione({ test: "node --test cervello/test/x.test.mjs" }), "x.test.mjs");
  assert.equal(provaDellaMutazione({ test: "cervello/test/y.test.mjs" }), "y.test.mjs");
});

test("il tetto blocca la prova a runtime NUOVA e conta quella ereditata", () => {
  assert.equal(verdettoTetto(1, 0).esito, "violazione", "una prova a runtime nuova mai rotta apposta non passa, nemmeno la prima");
  assert.equal(verdettoTetto(0, 0).esito, "ok");
  assert.equal(verdettoTetto(2, 5).esito, "debito");
});

test("SUL CAMPO: ogni prova che guida un browser in questo repo è stata rotta apposta almeno una volta", () => {
  const dir = join(REPO, "cervello/test");
  const runtime = [];
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith(".test.mjs") || f.startsWith("_")) continue;
    if (guidaUnaSuperficieViva(readFileSync(join(dir, f), "utf8")).runtime) runtime.push({ file: `cervello/test/${f}`, come: "browser" });
  }
  assert.ok(runtime.length >= 2, `prove a runtime trovate: ${runtime.length} — se sono zero il rilevatore è cieco, non il repo è pulito`);
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  assert.deepEqual(
    runtimeSenzaMutazione(runtime, mutanti).map((s) => s.file),
    [],
    "queste prove guidano una superficie viva e nessuno le ha mai viste diventare rosse col fix disfatto (AR-706)",
  );
});
