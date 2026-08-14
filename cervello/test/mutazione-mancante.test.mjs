#!/usr/bin/env node
// 🧨 IL CERCHIO CHE NON SI CHIUDEVA — un difetto riparato senza la sua mutazione non si consegna.
//
// PERCHÉ ESISTE. Il cancello del lotto pretendeva già che una prova condivisa NOMINASSE ogni
// difetto che copre (AR-254). Ma per soddisfarlo bastava scrivere l'id dentro un commento: il test
// restava lo stesso, e nessuno controllava che quel difetto avesse la sua voce in `mutanti.json` —
// cioè l'unico strumento che rompe il fix apposta e pretende il rosso. La difesa più forte del
// metodo era l'unica senza cancello: il lotto che predica di chiudere le porte ne teneva aperta una
// sua.
//
// Qui il controllo `mutazione-mancante` viene provato COME LO VEDE CHI CONSEGNA: si costruisce un
// repo finto con la sua storia git, ci si mette dentro il cancello VERO, e si guarda il codice di
// uscita. Non un pattern cercato in un file — il cancello che gira e blocca.

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const DENTRO_CANTIERE = "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json";

// AR-694 — I MODULI SI CARICANO QUI, non dentro i casi. Il banco qui sotto lancia i casi con `fn()`
// secco: un caso scritto `async` per poter fare `await import(...)` restituisce una promessa che
// nessuno raccoglie, l'asserzione gira dopo che il conteggio è già stampato, e un `1 = 2` esce
// «passato». Due casi di questo file erano esattamente così. L'import in cima è `await` di modulo —
// legittimo, atteso da Node prima di eseguire una riga di test — e rende i casi sincroni per davvero.
// (Caricare `cancello-lotto.mjs` non lo fa girare: ha la guardia dell'entrypoint.)
const { fileDelComando, proveOrfane } = await import(join(QUI, "..", "cancello-lotto.mjs"));
const { comandoAmmesso } = await import(join(QUI, "..", "forma-prova.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

/**
 * Un repo finto con: il cancello vero, un modulo da mutare, e una storia git che permette al
 * cancello di capire cosa ha «toccato il lotto» (confronto fra HEAD e il working tree).
 */
/**
 * Copia nel repo finto ogni modulo che il programma importa davvero, seguendo la catena.
 * `stub` sono i moduli che il test riscrive apposta (git-github: la radice punta al repo finto).
 */
function copiaDipendenze(dir, entry, gia = new Set(), stub = new Set(["./git-github.mjs"])) {
  const src = readFileSync(join(REPO, entry), "utf8");
  for (const m of src.matchAll(/^\s*(?:import|export)\b[^"';]*from\s*["'](\.\/[^"']+)["']/gm)) {
    const rel = m[1];
    if (stub.has(rel)) continue;
    const dentro = `cervello/${rel.slice(2)}`;
    if (gia.has(dentro)) continue;
    gia.add(dentro);
    copyFileSync(join(REPO, dentro), join(dir, dentro));
    copiaDipendenze(dir, dentro, gia, stub); // le dipendenze delle dipendenze
  }
  return gia;
}

function repoFinto({ verificaPrima, verificaOra, mutanti, tetti, cerca = "if (scaduto) return false;" }) {
  const dir = mkdtempSync(join(tmpdir(), "mut-mancante-"));
  mkdirSync(join(dir, "cervello"), { recursive: true });
  mkdirSync(join(dir, "finto"), { recursive: true });
  mkdirSync(join(dir, dirname(DENTRO_CANTIERE)), { recursive: true });

  copyFileSync(join(REPO, "cervello/cancello-lotto.mjs"), join(dir, "cervello/cancello-lotto.mjs"));
  // Il repo finto è un SECONDO ambiente in cui gira lo stesso programma, e un modulo che manca non
  // dà un errore parlante: il processo muore all'import ed esce 1, cioè indistinguibile da «il
  // cancello ha detto no».
  //
  // ⚠️ Qui c'era un ELENCO A MANO dei moduli da copiare, e tre lotti di fila sono arrivati a
  // ripararlo per la stessa strada: lotto 33 (forma-prova), lotto 34 (storia-git, AR-419), lotto 36
  // (chiusura-dichiarata). Un elenco scritto a mano è un perimetro DEDOTTO dagli esempi: resta
  // indietro di un lotto ogni volta che il cancello acquisisce un import, e chi lo ripara vede solo
  // il punto, non la forma. Adesso le dipendenze si DERIVANO dal codice vero, ricorsivamente: il
  // prossimo import arriva qui da solo.
  copiaDipendenze(dir, "cervello/cancello-lotto.mjs");
  // Il cancello prende la radice da git-github.mjs: qui la si punta al repo finto.
  writeFileSync(
    join(dir, "cervello/git-github.mjs"),
    `export const AD_ROOT = ${JSON.stringify(dir)};\nexport const nowPiacenza = () => "2026-07-29 00:00";\n`,
  );
  writeFileSync(join(dir, "finto/modulo.mjs"), `export function guardia(scaduto) {\n  ${cerca}\n  return true;\n}\n`);
  writeFileSync(join(dir, "cervello/test-finto.test.mjs"), "// AR-900 AR-901\nprocess.exit(0);\n");
  writeFileSync(join(dir, "cervello/mutanti.json"), typeof mutanti === "string" ? mutanti : JSON.stringify({ mutanti }));
  writeFileSync(join(dir, "cervello/tetti-lotto.json"), JSON.stringify(tetti ?? { prova_con_or: 0, mutazione_mancante: 0 }));

  const scriviCantiere = (verifica) =>
    writeFileSync(
      join(dir, DENTRO_CANTIERE),
      JSON.stringify({ difetti: [{ id: "AR-900", stato: "aperto", verifica }] }, null, 1),
    );

  execFileSync("git", ["init", "-q", "."], { cwd: dir });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "t"], { cwd: dir });
  scriviCantiere(verificaPrima);
  execFileSync("git", ["add", "-A"], { cwd: dir });
  execFileSync("git", ["commit", "-q", "-m", "prima", "--no-verify"], { cwd: dir });
  scriviCantiere(verificaOra); // ← quello che il lotto sta per consegnare, non ancora committato
  return dir;
}

function cancello(dir) {
  const r = spawnSync("node", [join(dir, "cervello/cancello-lotto.mjs"), "--solo-prove"], { cwd: dir, encoding: "utf8" });
  return { codice: r.status, uscita: `${r.stdout || ""}${r.stderr || ""}` };
}

const PATTERN = { file: "finto/modulo.mjs", pattern: "guardia", presente: true };
const COMANDO = { comando: "node cervello/test-finto.test.mjs" };
const MUTAZIONE_VIVA = [{ lotto: 30, difetto: "AR-900", file: "finto/modulo.mjs", cerca: "if (scaduto) return false;", sostituisci: "", test: "cervello/test-finto.test.mjs" }];

prova("il difetto che il lotto ripara ADESSO senza mutazione NON si consegna", () => {
  const dir = repoFinto({ verificaPrima: PATTERN, verificaOra: COMANDO, mutanti: [] });
  const { codice, uscita } = cancello(dir);
  assert.equal(codice, 1, `il cancello doveva bloccare, invece è uscito ${codice}:\n${uscita}`);
  assert.match(uscita, /mutazione-mancante/, "deve dire quale regola ha violato");
  assert.match(uscita, /AR-900/, "deve dire QUALE difetto");
});

prova("con la sua mutazione viva, lo stesso lotto passa", () => {
  const dir = repoFinto({ verificaPrima: PATTERN, verificaOra: COMANDO, mutanti: MUTAZIONE_VIVA });
  const { codice, uscita } = cancello(dir);
  assert.equal(codice, 0, `doveva passare, invece è uscito ${codice}:\n${uscita}`);
});

prova("una mutazione che punta a un pezzo sparito non vale: nomina il difetto e non lo può rompere", () => {
  const dir = repoFinto({
    verificaPrima: PATTERN,
    verificaOra: COMANDO,
    // il modulo contiene un'altra riga: la mutazione è rimasta indietro al fix di ieri
    cerca: "if (scaduto) return true;",
    mutanti: MUTAZIONE_VIVA,
  });
  const { codice, uscita } = cancello(dir);
  assert.equal(codice, 1, `doveva bloccare la mutazione fantasma, invece è uscito ${codice}:\n${uscita}`);
  assert.match(uscita, /non esiste più/, "deve spiegare che il pezzo da rompere non c'è più");
});

prova("il difetto accorpato («AR-899+AR-900») conta come nominato", () => {
  const dir = repoFinto({
    verificaPrima: PATTERN,
    verificaOra: COMANDO,
    mutanti: [{ ...MUTAZIONE_VIVA[0], difetto: "AR-899+AR-900" }],
  });
  assert.equal(cancello(dir).codice, 0, "una voce sola può coprire due difetti, se li nomina entrambi");
});

prova("il debito EREDITATO non blocca sotto il tetto, blocca appena si allarga", () => {
  // Stessa fotografia in HEAD e nel working tree: nessun difetto «toccato», solo debito.
  const sotto = repoFinto({ verificaPrima: COMANDO, verificaOra: COMANDO, mutanti: [], tetti: { mutazione_mancante: 1 } });
  assert.equal(cancello(sotto).codice, 0, "un debito sotto il tetto è misurato, non bloccante");
  const oltre = repoFinto({ verificaPrima: COMANDO, verificaOra: COMANDO, mutanti: [], tetti: { mutazione_mancante: 0 } });
  const r = cancello(oltre);
  assert.equal(r.codice, 1, "oltre il tetto il debito blocca");
  assert.match(r.uscita, /oltre-il-tetto/, "e dice che il debito si è allargato");
});

prova("mutanti.json illeggibile è CIECO (2), mai verde", () => {
  const dir = repoFinto({ verificaPrima: PATTERN, verificaOra: COMANDO, mutanti: "{ questo non è json" });
  const { codice, uscita } = cancello(dir);
  assert.equal(codice, 2, `un guardiano che non misura esce 2, invece è uscito ${codice}:\n${uscita}`);
  assert.match(uscita, /non ha misurato|non leggibile/, "e lo deve dire");
});

prova("--aggiorna-tetti non abbassa un tetto che non ha potuto misurare", () => {
  const dir = repoFinto({ verificaPrima: PATTERN, verificaOra: COMANDO, mutanti: "{ rotto", tetti: { mutazione_mancante: 5 } });
  const r = spawnSync("node", [join(dir, "cervello/cancello-lotto.mjs"), "--aggiorna-tetti"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, "deve rifiutarsi, non scrivere un tetto inventato");
  assert.equal(JSON.parse(readFileSync(join(dir, "cervello/tetti-lotto.json"), "utf8")).mutazione_mancante, 5, "il tetto resta quello di prima");
});

prova("il file del test si riconosce anche quando il comando porta un caricatore (lotto 33)", () => {
  // Il caso che ha rotto: la regola era «il primo token che sembra un file», e con
  // `--import ./cervello/test/hook-ts.mjs` quel token è il RISOLUTORE, non il test. Il cancello
  // leggeva il file sbagliato e accusava una prova condivisa di non nominare i suoi difetti mentre
  // li nominava. Un estrattore che legge il file sbagliato è peggio di uno che non legge niente:
  // sbaglia con la stessa sicurezza con cui avrebbe avuto ragione.
  assert.equal(
    fileDelComando("node --import ./cervello/test/hook-ts.mjs --test cervello/test/pannello-serratura.test.mjs"),
    "cervello/test/pannello-serratura.test.mjs",
  );
  assert.equal(fileDelComando("node cervello/test/x.test.mjs"), "cervello/test/x.test.mjs");
  assert.equal(fileDelComando("node cervello/test/x.test.mjs --json"), "cervello/test/x.test.mjs");
  assert.equal(fileDelComando("bats cervello/test/y.bats"), "cervello/test/y.bats");
  assert.equal(fileDelComando("node --test --test-reporter=tap cervello/test/z.test.mjs"), "cervello/test/z.test.mjs");
  assert.equal(fileDelComando("echo niente"), null, "senza file deve dire null, non indovinare");
});

prova("una prova che auto-fix non sa eseguire non passa il cancello (lotto 33)", () => {
  // Il caso che ha rotto, e che è costato due difetti: AR-409 e AR-226 sono stati consegnati con
  // `node --import ./cervello/test/hook-ts.mjs --test …`. Il cancello l'ha accettato — il file
  // esisteva — ma `auto-fix`, che chiude i difetti DOPO il merge, esegue solo
  // `node cervello/<script>.mjs [--flag]`, e quella restrizione è una difesa voluta. Risultato: il
  // lotto consegnato, il merge passato, e i due difetti rimasti aperti marcati «manuale», cioè in
  // attesa di un umano che non sapeva di essere atteso. Due guardiani, due idee di cosa sia un
  // comando valido: la stessa malattia del lotto, dentro il lotto.
  const esisteSempre = () => true;
  const conFlag = [{ id: "AR-999", verifica: { comando: "node --import ./cervello/test/hook-ts.mjs --test cervello/test/x.test.mjs" } }];
  const trovate = proveOrfane(conFlag, esisteSempre);
  assert.equal(trovate.length, 1, "il cancello deve fermare una prova che il motore non potrà eseguire");
  assert.match(trovate[0].motivo, /auto-fix non potrà eseguirlo/);

  // …e la forma buona passa, altrimenti il cancello bloccherebbe il lavoro sano.
  assert.deepEqual(proveOrfane([{ id: "AR-998", verifica: { comando: "node cervello/test/x.test.mjs" } }], esisteSempre), []);

  // La regola sta in UN posto solo: se qualcuno la cambia in auto-fix, il cancello la segue.
  assert.equal(comandoAmmesso("node cervello/test/x.test.mjs"), true);
  assert.equal(comandoAmmesso("node cervello/test/x.test.mjs --json"), true);
  assert.equal(comandoAmmesso("node --import ./y.mjs cervello/test/x.test.mjs"), false);
  assert.equal(comandoAmmesso("bash cervello/test/x.bats"), false, "solo node: non si esegue una shell per chiudere un difetto");
});

const rotti = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n   ${c.err}`}`);
console.log(rotti.length ? `\n⛔ ${rotti.length}/${casi.length} rotti` : `\n✅ ${casi.length}/${casi.length}`);
process.exit(rotti.length ? 1 : 0);
