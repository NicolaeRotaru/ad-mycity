// 🛣️ IL BANCO CHE PROVAVA UNA DIFESA SU SEI — AR-938.
//
// IL NUMERO CHE HA DECISO, corsa 33863510792 del 4/9: 27 difese provate su 172, 145 dichiarate
// fuori dal budget. L'84% delle difese di quella consegna non e' stato misurato. Dichiararlo era
// gia' un passo avanti (AR-917, AR-918: prima moriva rosso e muto), ma un verde che copre il 16%
// e' un verde che copre il 16%.
//
// L'aritmetica dice che non e' un problema di budget: 27 in 840 s fanno ~31 s l'una, quindi 172 in
// fila sono 89 minuti contro un tetto di 75 per l'INTERO cancello. In fila non ci stanno, e nessun
// numero piu' grande lo cambia. Nicola ha scelto le corsie parallele, ognuna in una copia separata.
//
// LE TRE COSE CHE QUESTA PROVA TIENE FERME:
//   ① il peggiore vince — una difesa che non difende rende rosso tutto, anche con tre corsie verdi;
//   ② una corsia che non parte NON vale zero: le sue mutazioni diventano ⚪ una per una, col nome;
//   ③ la pulizia di fine corsia butta SOLO una casa di corsia. Il 4/9, mentre rompevo apposta
//      l'isolamento per vedere se il caso ⑥ se ne accorgeva, quella riga ha cancellato la cartella
//      del repo con dentro il lavoro non committato. La prova era diventata rossa come doveva; il
//      prezzo era la casa. Il caso ③ e' quel danno trasformato in un freno.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { corsiaNonPartita, dividiInCorsie, registroDiCorsia, ricuciEsiti, siPuoButtare } from "../banco-a-corsie.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("le mutazioni si dividono A GIRO, non a blocchi: le lente non finiscono tutte insieme", () => {
  // Sei mutazioni di due soli file, messe vicine come stanno nel registro vero. A blocchi
  // finirebbero divise per file, cioe' tutto il costo di una prova lenta in una corsia sola.
  const mut = ["a", "a", "a", "b", "b", "b"].map((file, i) => ({ file, difetto: `AR-${i}` }));
  const corsie = dividiInCorsie(mut, 3);
  assert.equal(corsie.length, 3);
  for (const c of corsie) {
    assert.deepEqual([...new Set(c.map((m) => m.file))].sort(), ["a", "b"], "ogni corsia riceve un po' di entrambi: e' tutto il punto della distribuzione a giro");
  }
  assert.equal(corsie.flat().length, 6, "e nessuna mutazione si perde per strada");
});

test("piu' corsie che mutazioni non inventa corsie vuote", () => {
  assert.equal(dividiInCorsie([{ difetto: "AR-1" }], 4).length, 1);
  assert.deepEqual(dividiInCorsie([], 4), []);
});

test("LA REGOLA: il peggiore vince — un rosso in una corsia rende rosso tutto", () => {
  const tre_verdi_e_un_rosso = [
    { esiti: [{ verdetto: "ok" }, { verdetto: "ok" }] },
    { esiti: [{ verdetto: "ok" }] },
    { esiti: [{ verdetto: "vacua", difetto: "AR-1" }] },
  ];
  assert.equal(ricuciEsiti(tre_verdi_e_un_rosso).codice, 1, "non e' una media: una difesa che non difende e' rossa comunque");
  assert.equal(ricuciEsiti([{ esiti: [{ verdetto: "ok" }] }, { esiti: [{ verdetto: "cieco" }] }]).codice, 2, "e un ⚪ non lo cancella un verde: 2 non e' mai un verde");
  assert.equal(ricuciEsiti([{ esiti: [{ verdetto: "ok" }, { verdetto: "ok" }] }]).codice, 0);
  assert.equal(ricuciEsiti([{ esiti: [{ verdetto: "ok" }] }]).misurate, 1);
});

test("una corsia che NON parte non vale zero: le sue mutazioni escono ⚪ una per una", () => {
  const fuori = corsiaNonPartita([{ difetto: "AR-1", nome: "una" }, { difetto: "AR-2", nome: "due" }], "il disco era pieno");
  assert.equal(fuori.length, 2, "una voce per mutazione: un silenzio in blocco farebbe sparire un quarto delle difese");
  assert.ok(fuori.every((f) => f.verdetto === "cieco"), "⚪, non verde e non rosso");
  assert.match(fuori[0].perche, /il disco era pieno/, "col motivo vero");
  assert.match(fuori[0].perche, /AR-1/, "e il comando per rilanciarla da sola");
});

test("IL DANNO DEL 4/9: si butta SOLO una casa di corsia, mai la casa vera", () => {
  const temp = tmpdir();
  assert.equal(siPuoButtare(join(temp, "corsia-0-abc")), true, "una casa di corsia si butta");
  assert.equal(siPuoButtare(join(temp, "corsia-0-abc", "repo", "cervello")), true, "e anche quello che ci sta dentro");
  // Le cose che il 4/9 sono state cancellate davvero, o che potrebbero esserlo domani:
  assert.equal(siPuoButtare(REPO), false, "LA RADICE DEL REPO NO — e' il danno vero, non un caso di scuola");
  assert.equal(siPuoButtare("/"), false);
  assert.equal(siPuoButtare(temp), false, "nemmeno il temporaneo intero: dentro ci lavora altra gente");
  assert.equal(siPuoButtare(join(temp, "roba-di-qualcun-altro")), false, "e nemmeno una cartella temporanea che non e' nostra");
  assert.equal(siPuoButtare(""), false);
  assert.equal(siPuoButtare(null), false);
});

test("il registro di una corsia contiene SOLO le sue mutazioni", () => {
  const r = registroDiCorsia({ _cosa_e: "il registro vero", mutanti: [1, 2, 3, 4] }, [{ difetto: "AR-1" }]);
  assert.equal(r.mutanti.length, 1, "la copia non deve vedere le mutazioni delle altre corsie");
  assert.equal(r._cosa_e, "il registro vero", "il resto del registro resta com'era");
});

test("IL CASO VERO: due corsie rompono LO STESSO file del repo e non si pestano, perche' ognuna ha la sua copia", () => {
  // La forma conta. Le due mutazioni puntano allo STESSO file del repo e cercano LO STESSO pezzo:
  // in una casa sola la prima lo rompe e la seconda non lo trova piu' — «il pezzo da rompere non
  // esiste piu'», cioe' ⚪. In due copie separate lo trovano tutt'e due. Il verdetto distingue le
  // due cose da solo, senza guardare dentro il meccanismo.
  //
  // (Misurato mentre la scrivevo: coi bersagli in una cartella condivisa FUORI dalle copie, una
  // delle due usciva ⚪ davvero. Le copie isolano il repo, non il resto del disco — una mutazione
  // che punta a un percorso assoluto fuori casa resta esposta, ed e' bene saperlo.)
  const casa = mkdtempSync(join(tmpdir(), "finta-corsie-"));
  try {
    const bersaglio = "cervello/banco-a-corsie.mjs";
    const ancora = "CORSIE_DI_DEFAULT = 4;";
    assert.ok(readFileSync(join(REPO, bersaglio), "utf8").includes(ancora), "l'ancora deve esistere, se no non sto misurando niente");

    const prova = join(casa, "prova.mjs");
    writeFileSync(prova, `import { readFileSync } from "node:fs";\nif (!readFileSync(${JSON.stringify(bersaglio)}, "utf8").includes(${JSON.stringify(ancora)})) { console.error("rotto"); process.exit(1); }\n`);
    const mutanti = [
      { difetto: "AR-938", nome: "la prima", file: bersaglio, cerca: ancora, sostituisci: "CORSIE_DI_DEFAULT = 41;", test: prova },
      { difetto: "AR-938", nome: "la seconda", file: bersaglio, cerca: ancora, sostituisci: "CORSIE_DI_DEFAULT = 42;", test: prova },
    ];
    writeFileSync(join(casa, "mutanti.json"), JSON.stringify({ mutanti }));

    const prima = spawnSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).stdout;
    const r = spawnSync(process.execPath, [join(REPO, "cervello/banco-a-corsie.mjs"), "--corsie", "2", "--json"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 180_000,
      killSignal: "SIGKILL",
      env: { ...process.env, MUTANTI_FILE: join(casa, "mutanti.json"), NON_VACUITA_RADICE: casa },
    });
    const testo = `${r.stdout || ""}${r.stderr || ""}`;
    const dopo = spawnSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).stdout;

    const j = JSON.parse(testo.slice(testo.indexOf("{")));
    assert.equal(j.esiti.length, 2, "due mutazioni dentro, due verdetti fuori: nessuna si perde fra le corsie");
    assert.ok(
      j.esiti.every((e) => e.verdetto === "ok"),
      `in due copie separate entrambe trovano il loro pezzo e rendono rossa la prova. Un ⚪ qui vorrebbe dire che si sono pestate:\n${JSON.stringify(j.esiti.map((e) => [e.nome, e.verdetto, e.perche]), null, 1)}`,
    );
    assert.equal(r.status, 0, `verdetto verde:\n${testo.slice(-400)}`);
    assert.equal(dopo, prima, "e il repo di casa e' identico a prima: le corsie lavorano nelle LORO copie (AR-919)");
  } finally {
    rmSync(casa, { recursive: true, force: true });
  }
});
