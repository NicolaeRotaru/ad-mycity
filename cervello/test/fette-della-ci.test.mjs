// 🍰 LE FETTE DELLA CI — la suite e le mutazioni divise fra più runner, e ricucite (13/11).
//
// La domanda che questa prova fa è una sola, in forme diverse: **dividere il lavoro può far
// sparire un controllo?** Le tre strade per farlo sparire sono queste, e ognuna ha il suo caso:
//   ① una prova che non finisce in nessuna fetta (o in due) — la divisione;
//   ② una fetta che non consegna e viene letta come verde — la ricucitura;
//   ③ una fetta che consegna i verdetti di un altro commit o di un altro perimetro.
// I casi che contano ESEGUONO: lanciano la suite e il banco veri su una cartella di prove finte,
// li fanno dividere, tolgono un referto, e pretendono il ⚪ (uscita 2) — non il verde.
//
// Esegui: node --test cervello/test/fette-della-ci.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buchiNelleFette,
  chiaveMutazione,
  dividiInFette,
  fettaDelleMutazioni,
  leggiFetta,
  pesoProva,
  ricuciMutazioni,
  ricuciSuite,
} from "../fette-ci.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const SUITE = join(REPO, "cervello/test-cervello.mjs");
const BANCO = join(REPO, "cervello/banco-a-corsie.mjs");

// ── ① LA DIVISIONE ──────────────────────────────────────────────────────────────────────────

test("① ogni prova vera della cartella finisce in UNA e una sola fetta, per ogni numero di fette", () => {
  const vere = readdirSync(join(REPO, "cervello/test")).filter((f) => !f.startsWith("_"));
  assert.ok(vere.length > 100, "la cartella delle prove dovrebbe essere piena: se è vuota questo caso non misura niente");
  const voci = vere.map((f, k) => ({ file: f, peso: (k * 7919) % 53 }));
  for (let n = 1; n <= 12; n++) {
    const fette = dividiInFette(voci, n);
    assert.equal(fette.length, n, `${n} fette chieste, ${fette.length} date`);
    const tutte = fette.flat();
    assert.equal(tutte.length, vere.length, `con ${n} fette: ${tutte.length} assegnazioni per ${vere.length} prove`);
    assert.equal(new Set(tutte).size, vere.length, `con ${n} fette qualche prova è in due fette`);
  }
});

test("① la divisione è la stessa per tutti: chi la rifà altrove arriva allo stesso risultato", () => {
  const voci = [5, 5, 5, 3, 3, 1, 9, 9].map((peso, k) => ({ file: `p${k}.test.mjs`, peso }));
  const a = dividiInFette(voci, 3);
  const b = dividiInFette([...voci].reverse(), 3);
  assert.deepEqual(a, b, "l'ordine d'ingresso non deve cambiare la divisione: ogni runner vede la cartella a modo suo");
});

test("① le prove in fila pesano tutto il loro tempo, le libere un quarto: la fila non si ammucchia", () => {
  assert.equal(pesoProva({ ms: 40_000, inFila: true }), 40_000);
  assert.equal(pesoProva({ ms: 40_000, inFila: false }), 10_000);
  assert.ok(pesoProva({ ms: null, inFila: true }) > 0, "una prova mai cronometrata non pesa zero");
  // Quattro prove in fila da 40 s e otto libere da 1 s su quattro fette: una prova in fila a testa.
  const voci = [
    ...[1, 2, 3, 4].map((k) => ({ file: `fila${k}`, peso: pesoProva({ ms: 40_000, inFila: true }) })),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ file: `libera${k}`, peso: pesoProva({ ms: 1_000 }) })),
  ];
  for (const f of dividiInFette(voci, 4)) assert.equal(f.filter((x) => x.startsWith("fila")).length, 1, `fetta sbilanciata: ${f.join(", ")}`);
});

test("① una fetta chiesta e non capita non diventa «tutto»", () => {
  assert.equal(leggiFetta(undefined), null);
  assert.deepEqual(leggiFetta("2/8"), { i: 2, n: 8 });
  for (const storta of ["0/3", "4/3", "1/0", "tre/otto", "", "2-8"]) assert.ok(leggiFetta(storta).errore, `«${storta}» doveva essere rifiutata`);
});

test("① le mutazioni si dividono senza perderne né raddoppiarne nessuna", () => {
  const mut = Array.from({ length: 23 }, (_, k) => ({ difetto: `AR-${k % 5}`, nome: `m${k}`, file: "x.mjs", test: `t${k % 4}.test.mjs`, cerca: `c${k}` }));
  const tempi = new Map([["t0.test.mjs", 30_000], ["t1.test.mjs", 2_000]]);
  for (let n = 1; n <= 7; n++) {
    const pezzi = Array.from({ length: n }, (_, i) => fettaDelleMutazioni(mut, { i: i + 1, n }, tempi)).flat();
    assert.equal(pezzi.length, mut.length, `con ${n} fette: ${pezzi.length} mutazioni invece di ${mut.length}`);
    assert.equal(new Set(pezzi.map(chiaveMutazione)).size, mut.length, `con ${n} fette una mutazione è in due fette`);
  }
});

// ── ② ③ LA RICUCITURA, A FUNZIONI ───────────────────────────────────────────────────────────

const referto = (i, n, file, extra = {}) => ({ fetta: { i, n }, commit: "abc", test: file.map((f) => ({ file: f, esito: "ok", passati: 1 })), bats: [], ...extra });

test("② la suite ricucita è completa solo se OGNI prova attesa ha il suo verdetto", () => {
  const universo = { test: ["a", "b", "c"], bats: [] };
  const tutto = ricuciSuite([referto(1, 2, ["a", "c"]), referto(2, 2, ["b"])], universo, { commit: "abc" });
  assert.equal(tutto.completo, true, JSON.stringify(tutto.buchi));
  const senza2 = ricuciSuite([referto(1, 2, ["a", "c"])], universo, { commit: "abc" });
  assert.equal(senza2.completo, false, "una fetta mancante NON è una suite completa");
  assert.deepEqual(senza2.mancano, ["b"], "e la prova senza verdetto ha un nome");
  assert.ok(senza2.buchi.some((b) => b.includes("fetta 2 di 2")), "e la fetta mancante pure");
  const doppia = ricuciSuite([referto(1, 2, ["a", "b"]), referto(2, 2, ["b", "c"])], universo, { commit: "abc" });
  assert.deepEqual(doppia.doppi, ["b"]);
  assert.equal(doppia.completo, false, "una prova misurata due volte vuol dire che la divisione non era la stessa");
});

test("③ una fetta di un altro commit, o con un altro totale, non si ricuce come buona", () => {
  const universo = { test: ["a", "b"], bats: [] };
  const altro = ricuciSuite([referto(1, 2, ["a"]), { ...referto(2, 2, ["b"]), commit: "zzz" }], universo, { commit: "abc" });
  assert.equal(altro.completo, false);
  assert.ok(altro.buchi.some((b) => b.includes("zzz")));
  assert.ok(buchiNelleFette([referto(1, 2, []), referto(1, 3, [])]).length > 0, "due totali diversi sono un buco");
  assert.deepEqual(buchiNelleFette([]), ["nessuna fetta ha consegnato il suo referto"]);
});

test("②③ le mutazioni ricucite: mancanti nominate, doppie e di un altro perimetro segnalate", () => {
  const attese = [{ difetto: "AR-1", nome: "uno", file: "f", test: "t", cerca: "x" }, { difetto: "AR-2", nome: "due", file: "f", test: "t", cerca: "y" }];
  const esito = (m, verdetto = "ok") => ({ ...m, verdetto, perche: "" });
  const ok = ricuciMutazioni([{ fetta: { i: 1, n: 2 }, commit: "c", difetti: ["AR-1", "AR-2"], esiti: [esito(attese[0])] }, { fetta: { i: 2, n: 2 }, commit: "c", difetti: ["AR-1", "AR-2"], esiti: [esito(attese[1])] }], attese, { commit: "c", difetti: ["AR-1", "AR-2"] });
  assert.equal(ok.completo, true, JSON.stringify(ok.buchi));
  const persa = ricuciMutazioni([{ fetta: { i: 1, n: 2 }, commit: "c", difetti: ["AR-1", "AR-2"], esiti: [esito(attese[0])] }], attese, { commit: "c", difetti: ["AR-1", "AR-2"] });
  assert.deepEqual(persa.mancano.map((m) => m.nome), ["due"], "la mutazione che nessuno ha provato torna col suo nome");
  const altroLotto = ricuciMutazioni([{ fetta: { i: 1, n: 1 }, commit: "c", difetti: ["AR-9"], esiti: [esito(attese[0]), esito(attese[1])] }], attese, { commit: "c", difetti: ["AR-1", "AR-2"] });
  assert.equal(altroLotto.completo, false, "verdetti calcolati su un altro perimetro non valgono per questo");
});

// ── ② ESEGUITO: la suite vera, divisa e ricucita, su una cartella di prove finte ──────────────

function cartellaDiProve({ rossa = false } = {}) {
  const casa = mkdtempSync(join(tmpdir(), "mycity-fette-"));
  const prove = join(casa, "prove");
  mkdirSync(prove);
  for (const n of ["a", "b", "c", "d", "e"]) writeFileSync(join(prove, `${n}.test.mjs`), `import { test } from "node:test";\ntest("${n}", () => {});\n`);
  if (rossa) writeFileSync(join(prove, "r.test.mjs"), `import { test } from "node:test";\nimport assert from "node:assert";\ntest("rossa", () => assert.equal(1, 2));\n`);
  // La cartella dei referti NON la creo: la deve creare chi scrive. Il collaudo del 13/11 ha trovato
  // un flusso che non la creava, e ogni fetta moriva con ENOENT dopo aver girato tutte le sue prove.
  return { casa, prove, referti: join(casa, "referti", "suite") };
}

const suite = (args, env) => spawnSync(process.execPath, [SUITE, ...args], { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env }, timeout: 120_000 });

test("② ESEGUITO: tre fette verdi ricucite escono 0; tolta una fetta escono 2, non 0", () => {
  const { casa, prove, referti } = cartellaDiProve();
  try {
    const env = { TEST_CERVELLO_DIR: prove };
    for (const i of [1, 2, 3]) {
      const r = suite(["--fetta", `${i}/3`, "--referto", join(referti, `suite-${i}.json`)], env);
      assert.equal(r.status, 0, `la fetta ${i} doveva essere verde:\n${r.stdout}${r.stderr}`);
    }
    const conti = [1, 2, 3].map((i) => JSON.parse(readFileSync(join(referti, `suite-${i}.json`), "utf8")).test.length);
    assert.equal(conti.reduce((a, b) => a + b, 0), 5, `le tre fette dovevano dividersi le 5 prove: ${conti.join(" + ")}`);
    const tutta = suite(["--ricuci", referti], env);
    assert.equal(tutta.status, 0, `ricucite tutte: verde\n${tutta.stdout}${tutta.stderr}`);
    // IL CASO CHE CONTA: una fetta che non consegna. Se la ricucitura leggesse solo ciò che è
    // arrivato, qui direbbe «5 file su 5 passano» con due prove mai girate.
    const persa = readdirSync(referti).find((f) => JSON.parse(readFileSync(join(referti, f), "utf8")).test.length > 0);
    rmSync(join(referti, persa));
    const buca = suite(["--ricuci", referti], env);
    assert.equal(buca.status, 2, `una fetta mancante doveva uscire 2 (⚪), è uscita ${buca.status}:\n${buca.stdout}${buca.stderr}`);
    assert.match(buca.stdout, /non ha consegnato/, "e il referto deve dire quale fetta manca");
    const json = suite(["--ricuci", referti, "--json"], env);
    assert.equal(json.status, 2, "anche col JSON, che è quello che legge il cancello");
    assert.equal(JSON.parse(json.stdout).completo, false);
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});

test("② ESEGUITO: una prova rossa in una fetta resta rossa nella suite ricucita (1, col suo nome)", () => {
  const { casa, prove, referti } = cartellaDiProve({ rossa: true });
  try {
    const env = { TEST_CERVELLO_DIR: prove };
    const uscite = [1, 2].map((i) => suite(["--fetta", `${i}/2`, "--referto", join(referti, `suite-${i}.json`)], env).status);
    assert.deepEqual(uscite.sort(), [0, 1], `una fetta verde e una rossa: ${uscite.join(", ")}`);
    const r = suite(["--ricuci", referti, "--json"], env);
    assert.equal(r.status, 1, `la rossa doveva arrivare fino in fondo:\n${r.stdout}${r.stderr}`);
    assert.ok(JSON.parse(r.stdout).rossi_node.some((f) => f.endsWith("r.test.mjs")), "col suo nome, che è quello che serve a chi ripara");
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});

// ── ② ESEGUITO: il banco delle mutazioni, ricucito ───────────────────────────────────────────

test("② ESEGUITO: il banco ricuce le mutazioni; una persa esce 2 col suo nome, una vacua esce 1", () => {
  const casa = mkdtempSync(join(tmpdir(), "mycity-fette-banco-"));
  try {
    const mutanti = [
      { difetto: "AR-1", nome: "la prima difesa", file: "cervello/x.mjs", cerca: "a", sostituisci: "b", test: "cervello/test/x.test.mjs" },
      { difetto: "AR-1", nome: "la seconda difesa", file: "cervello/x.mjs", cerca: "c", sostituisci: "d", test: "cervello/test/x.test.mjs" },
    ];
    const registro = join(casa, "mutanti.json");
    writeFileSync(registro, JSON.stringify({ mutanti }));
    const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).stdout.trim();
    // Una fetta VUOTA (due fette, una mutazione sola) consegna lo stesso il suo referto, anche in
    // una cartella che non esiste ancora: il conto di cosa doveva girare lo fa chi ricuce.
    const unaSola = join(casa, "una-sola.json");
    writeFileSync(unaSola, JSON.stringify({ mutanti: [mutanti[0]] }));
    const vuota = join(casa, "fette", "nuova", "mutazioni-2.json");
    const r2 = spawnSync(process.execPath, [BANCO, "--difetti", "AR-1", "--fetta", "2/2", "--referto", vuota], { cwd: REPO, encoding: "utf8", env: { ...process.env, MUTANTI_FILE: unaSola }, timeout: 60_000 });
    assert.equal(r2.status, 0, `una fetta vuota non è un ⚪:\n${r2.stdout}${r2.stderr}`);
    assert.deepEqual(JSON.parse(readFileSync(vuota, "utf8")).esiti, [], "e il suo referto c'è, vuoto");
    const referti = join(casa, "referti");
    mkdirSync(referti);
    const scrivi = (i, esiti) => writeFileSync(join(referti, `mutazioni-${i}.json`), JSON.stringify({ fetta: { i, n: 2 }, commit, difetti: ["AR-1"], esiti }));
    const banco = () => spawnSync(process.execPath, [BANCO, "--difetti", "AR-1", "--ricuci", referti], { cwd: REPO, encoding: "utf8", env: { ...process.env, MUTANTI_FILE: registro }, timeout: 60_000 });
    scrivi(1, [{ ...mutanti[0], verdetto: "ok", perche: "" }]);
    scrivi(2, [{ ...mutanti[1], verdetto: "ok", perche: "" }]);
    const tutto = banco();
    assert.equal(tutto.status, 0, `tutte misurate e tutte rosse col fix rotto: verde\n${tutto.stdout}${tutto.stderr}`);
    rmSync(join(referti, "mutazioni-2.json"));
    const persa = banco();
    assert.equal(persa.status, 2, `una fetta di mutazioni mancante doveva uscire 2, è uscita ${persa.status}:\n${persa.stdout}${persa.stderr}`);
    assert.match(persa.stdout, /la seconda difesa/, "e la difesa non provata va nominata, non persa");
    scrivi(2, [{ ...mutanti[1], verdetto: "vacua", perche: "il test resta VERDE col fix rotto" }]);
    const vacua = banco();
    assert.equal(vacua.status, 1, `una difesa che non difende resta rossa anche ricucita:\n${vacua.stdout}${vacua.stderr}`);
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});

test("② ESEGUITO: il cancello con «--referti» o «--fetta-mutazioni» senza valore esce 2, non fa girare un'altra cosa", () => {
  // Se l'opzione storta valesse «assente», il cancello farebbe girare qui la suite intera: minuti, e
  // un verdetto su una domanda che nessuno ha fatto. Il tetto di 60 s è il freno di questa prova.
  for (const argomenti of [["--referti"], ["--fetta-mutazioni"], ["--fetta-mutazioni", "9/3", "--referto", join(tmpdir(), "mai-scritto.json")]]) {
    const r = spawnSync(process.execPath, [join(REPO, "cervello/cancello-lotto.mjs"), ...argomenti], { cwd: REPO, encoding: "utf8", timeout: 60_000, killSignal: "SIGKILL" });
    assert.equal(r.status, 2, `${argomenti.join(" ")}: doveva uscire 2, è uscito ${r.status}\n${(r.stderr || "").slice(-400)}`);
  }
});

// ── LA FORMA DEI DUE FLUSSI: il numero di fette scritto una volta sola ───────────────────────

test("i flussi leggono indice e totale dalla matrice: un numero scritto due volte non può lasciare fuori una fetta", () => {
  for (const f of [".github/workflows/cancello-lotto.yml", ".github/workflows/test-cervello.yml"]) {
    const yml = readFileSync(join(REPO, f), "utf8");
    assert.match(yml, /INDICE: \$\{\{ strategy\.job-index \}\}/, `${f}: l'indice della fetta deve venire dalla matrice`);
    assert.match(yml, /TOTALE: \$\{\{ strategy\.job-total \}\}/, `${f}: e il totale pure`);
    assert.ok(!/--fetta\s+"?\d+\/\d+/.test(yml), `${f}: una fetta scritta a numeri nel comando può divergere dalla matrice`);
    assert.match(yml, /--ricuci "\$RUNNER_TEMP\/referti\/suite"/, `${f}: qualcuno deve ricucire le fette della suite`);
    // I referti FUORI dal deposito: dentro, un file non tracciato sporca l'albero e cambia il verdetto
    // dei guardiani che lo guardano (13/11: «verdetti senza lettore» usciva ⚪ per questo).
    assert.ok(!/(path:|--referto|--ricuci|--referti)\s+"?referti\//.test(yml), `${f}: i referti devono stare in $RUNNER_TEMP, non dentro il deposito`);
  }
  const cancello = readFileSync(join(REPO, ".github/workflows/cancello-lotto.yml"), "utf8");
  assert.match(cancello, /needs: \[suite, mutazioni\]/, "il cancello aspetta le fette della suite E delle mutazioni");
  assert.match(cancello, /node cervello\/cancello-lotto\.mjs --referti "\$RUNNER_TEMP\/referti"/, "e le ricuce, invece di non leggerle");
});
