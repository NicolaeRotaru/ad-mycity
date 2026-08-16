#!/usr/bin/env node
// AR-355 · AR-356 · AR-567 · AR-360 — quattro modi di avere una prova che non prova niente.
//
// AR-355 — una riga di COMMENTO chiudeva un difetto. Due difetti del worker (AR-136, AR-137) erano
//   chiusi perché la loro prova citava una frase che nel file c'era davvero: dentro il commento
//   scritto da chi aveva fatto il fix. Per la macchina un file è una stringa, quindi la
//   documentazione di un fix e il fix erano indistinguibili.
// AR-356 — una prova puntata dentro la memoria che la macchina RISCRIVE si smonta da sola.
// AR-567 — una prova puntata a un file MAI NATO non è «non ancora soddisfatta»: è un buco che
//   sembra un piano, e nessun lavoro potrà mai renderla verde.
// AR-360 — un finding di radiografia senza `genera` non viene instradato da nessuno: non diventa
//   lezione, né sentinella, né pezzo nuovo. Sparisce.
//
// Le quattro cure stanno sul DATO e non dentro un comando: `patternTrovato` (che usano tutti) e il
// contratto dei JSON di auto-coscienza, che gira a ogni giro come cancello.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const CERVELLO = join(QUI, "..");
const REPO = join(CERVELLO, "..");

const P = await import(join(CERVELLO, "prove-regole.mjs"));
const C = await import(join(CERVELLO, "valida-contratti.mjs"));

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ─────────────────── AR-355 · il commento non è il codice ───────────────────

const FILE_FINTO = [
  "#!/bin/bash",
  "# AR-136 — BATTITO DURANTE LA CHAT: adesso il worker manda il battito anche mentre parla.",
  "avvia_chat() {",
  '  echo "ciao"',
  "}",
].join("\n");

prova("AR-355: il caso vero — la frase c'è solo nel commento, quindi la prova NON è soddisfatta", () => {
  assert.equal(P.patternOvunque("BATTITO DURANTE LA CHAT", FILE_FINTO), true, "il testo c'è: era così che si chiudeva");
  assert.equal(P.patternNelCodice("BATTITO DURANTE LA CHAT", FILE_FINTO), false);
  assert.equal(P.soloInCommento("BATTITO DURANTE LA CHAT", FILE_FINTO), true);
  assert.equal(
    P.provaSoddisfatta({ file: "cervello/worker.sh", pattern: "BATTITO DURANTE LA CHAT" }, FILE_FINTO),
    false,
    "la cura sta nel confronto che usano tutti, non in un chiamante solo",
  );
});

prova("AR-355: quello che il computer esegue continua a valere", () => {
  assert.equal(P.patternNelCodice("avvia_chat", FILE_FINTO), true);
  assert.equal(P.soloInCommento("avvia_chat", FILE_FINTO), false);
  // e i tre stili di commento che contano davvero
  assert.equal(P.soloInCommento("segreto", "// segreto\ncodice()"), true);
  assert.equal(P.soloInCommento("segreto", "  * segreto\ncodice()"), true);
  assert.equal(P.soloInCommento("segreto", "<!-- segreto -->\ncodice()"), true);
});

prova("AR-355: sul cantiere vero le due prove del worker cambiano verdetto, e sono le sue", () => {
  const worker = readFileSync(join(REPO, "cervello/worker.sh"), "utf8");
  for (const pattern of ["BATTITO DURANTE LA CHAT", "ESEGUI CON BATTITO"]) {
    assert.equal(P.patternOvunque(pattern, worker), true, `${pattern}: nel file c'è (dentro un commento)`);
    assert.equal(P.patternNelCodice(pattern, worker), false, `${pattern}: e non è codice eseguibile`);
  }
});

// ─────────────────── AR-567 · il vuoto non è un dubbio ───────────────────

prova("AR-567: «file che non esiste» e «pattern non ancora scritto» sono due verdetti diversi", () => {
  const v = { file: "cervello/pezzo-mai-nato.mjs", pattern: "qualcosa" };
  assert.equal(P.classificaProva({ verifica: v, fileEsiste: false }).classe, "al-vuoto");
  assert.equal(P.classificaProva({ verifica: v, fileEsiste: true, patternCombacia: false }).classe, "mai-soddisfatta");
  assert.equal(P.classificaProva({ verifica: v, fileEsiste: true, patternCombacia: true }).classe, "soddisfatta");
  // e i due motivi devono dire cose diverse, o il lettore non impara niente dalla distinzione
  assert.match(P.classificaProva({ verifica: v, fileEsiste: false }).motivo, /non esiste/);
  assert.match(P.classificaProva({ verifica: v, fileEsiste: true, patternCombacia: false }).motivo, /fix è da fare/);
});

prova("AR-567: chi non ha guardato il disco dice «non misurata», non «al vuoto»", () => {
  // Un guardiano che non riesce a misurare deve dire cieco, non bocciato: è la regola di AR-322.
  const v = { file: "x.mjs", pattern: "y" };
  assert.equal(P.classificaProva({ verifica: v }).classe, "non-misurata");
});

// ─────────────────── AR-356 · dove una prova non può puntare ───────────────────

prova("AR-356: una prova puntata alla memoria che la macchina riscrive è inammissibile", () => {
  assert.equal(P.provaSuFileVolatile({ file: "MyCity-Vault/90-Memoria-AI/STATO.md", pattern: "x" }), true);
  assert.equal(P.provaSuFileVolatile({ file: "consegne/audit/2026-08-01.md", pattern: "x" }), true);
  assert.equal(P.provaSuFileVolatile({ file: "cervello/worker.sh", pattern: "x" }), false);
  // una prova per comando non cita nessuna frase: resta ammessa
  assert.equal(P.provaSuFileVolatile({ comando: "node cervello/test/x.test.mjs" }), false);
});

// ─────────────── il cancello: i tre conti hanno un tetto che scende ───────────────

prova("AR-356 · AR-567: il contratto del cantiere conta le prove inammissibili", () => {
  const difetti = [
    { id: "AR-1", verifica: { file: "MyCity-Vault/90-Memoria-AI/STATO.md", pattern: "a" } },
    { id: "AR-2", verifica: { file: "cervello/mai-nato.mjs", pattern: "b" } },
    { id: "AR-3", verifica: { file: "cervello/worker.sh", pattern: "c" } },
    { id: "AR-4", verifica: { comando: "node cervello/test/x.test.mjs" } },
  ];
  const esiste = (f) => f === "cervello/worker.sh" || f.startsWith("MyCity-Vault/");
  const r = C.proveInammissibili(difetti, esiste);
  assert.deepEqual(r.volatili.map((v) => v.id), ["AR-1"]);
  assert.deepEqual(r.alVuoto.map((v) => v.id), ["AR-2"]);
});

prova("AR-360: un finding senza etichetta e uno con etichetta inventata sono due guasti diversi", () => {
  const rad = {
    dimensioni: [
      {
        key: "memoria",
        findings: [
          { titolo: "va bene", genera: "lezione" },
          { titolo: "senza etichetta" },
          { titolo: "etichetta inventata", genera: "scrivi-il-fix" },
        ],
      },
    ],
  };
  const fuori = C.findingsSenzaRotta(rad);
  assert.equal(fuori.length, 2, "quello con `genera` valido non deve comparire");
  assert.deepEqual(fuori.map((f) => f.causa).sort(), ["genera-fuori-enum", "genera-mancante"]);
});

prova("AR-360: sulla radiografia vera i findings senza rotta sono contati e stanno sotto il tetto", () => {
  const rad = JSON.parse(
    readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"),
  );
  const fuori = C.findingsSenzaRotta(rad);
  const mancanti = fuori.filter((f) => f.causa === "genera-mancante").length;
  const inventati = fuori.filter((f) => f.causa === "genera-fuori-enum").length;
  assert.ok(mancanti > 0, "se sono zero il rilevatore è cieco: il 13/8 erano 163 su 286");
  assert.ok(
    mancanti <= C.TETTI_CONTRATTO.findings_senza_genera,
    `${mancanti} findings senza etichetta contro un tetto di ${C.TETTI_CONTRATTO.findings_senza_genera}: il tetto scende, non sale`,
  );
  assert.equal(inventati, 0, "un'etichetta inventata è blocco duro senza tetto: devono restare zero");
});

prova("il cancello dei contratti FRENA davvero quando un conto supera il tetto", () => {
  // Domanda ③ del secondo giro: un tetto mai superato è indistinguibile da un tetto scollegato.
  // Qui lo si supera apposta, in un JSON finto, e si pretende il rosso.
  const troppi = [];
  for (let i = 0; i < C.TETTI_CONTRATTO.prove_su_memoria_volatile + 5; i++) {
    troppi.push({ id: `AR-${900 + i}`, verifica: { file: "MyCity-Vault/90-Memoria-AI/STATO.md", pattern: `p${i}` } });
  }
  const r = C.proveInammissibili(troppi, () => true);
  assert.ok(
    r.volatili.length > C.TETTI_CONTRATTO.prove_su_memoria_volatile,
    "il conteggio deve crescere col numero di prove sporche, o il tetto non misura niente",
  );
});

prova("il guardiano dei contratti gira ed esce 0 sul repo com'è adesso", () => {
  // Se questo diventa rosso non è un test rotto: è il debito che è cresciuto sopra il tetto.
  execFileSync("node", [join(CERVELLO, "valida-contratti.mjs")], { cwd: REPO, stdio: "pipe" });
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
