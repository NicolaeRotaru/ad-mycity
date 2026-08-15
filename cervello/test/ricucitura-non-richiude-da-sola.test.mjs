#!/usr/bin/env node
// 🧵 La ricucitura dei frammenti delle corsie non deve richiudere da sola un difetto dichiarato APERTO.
//
// LA RADICE (AR-444, pagata il 29/7): `auto-fix.mjs verifica --applica` guarda la prova che sta
// SULLA SCHEDA, non la volontà di chi ha lavorato il difetto. Se una corsia dichiara «AR-xxx resta
// aperto» ma sulla scheda è rimasta la vecchia prova a pattern, quel pattern adesso il codice ce
// l'ha — quindi dopo il merge il difetto si richiude da solo, e il conteggio su cui Nicola mette la
// firma smentisce quello che la corsia ha scritto. Quella volta il conto diceva «✅ Chiusi 20» ed
// era verde: uno dei venti non doveva esserci.
//
// LA CURA: la decisione su cosa fare della `verifica` è una funzione PURA (`decidiVerifica` in
// cervello/ricuci-corsie.mjs) che un test può eseguire, invece di una riga dentro il ciclo che
// scrive nei registri veri.
//
// COSA PROVA QUESTO FILE:
//   ① chiuso + prova a comando → la verifica si scrive
//   ② aperto + vecchia prova a pattern → la verifica si TOGLIE (è il caso che è costato caro)
//   ③ già-curato + vecchia prova a pattern → si toglie lo stesso: non è chiuso da questo lotto
//   ④ aperto senza prova a pattern → non si tocca niente (nessun danno da riparare)
//   ⑤ chiuso senza comando → non si inventa una prova: si lascia e si dichiara
//   ⑥ lo `stato` non compare MAI fra le cose che questa funzione decide
//
// NON-VACUITÀ (eseguita): in `decidiVerifica`, rimettendo il ramo del non-chiuso a
// `return { azione: "lascia", … }` senza il controllo `eraPattern`, i casi ② e ③ diventano ROSSI.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { decidiVerifica, normalizzaMalattia, testDaComando, voceDiMalattia } from "../ricuci-corsie.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

const PATTERN_VECCHIA = { file: "cervello/qualcosa.mjs", pattern: "GATE &&", presente: true };

prova("① un difetto chiuso prende la sua prova a comando", () => {
  const s = decidiVerifica("chiuso", "node cervello/test/x.test.mjs", PATTERN_VECCHIA);
  assert.equal(s.azione, "scrivi");
  assert.deepEqual(s.verifica, { tipo: "comando", comando: "node cervello/test/x.test.mjs" });
});

prova("② un difetto dichiarato APERTO si vede BLOCCARE la chiusura, e la prova a pattern sparisce", () => {
  const s = decidiVerifica("aperto", null, PATTERN_VECCHIA);
  assert.equal(s.azione, "blocca", "senza il blocco, auto-fix lo richiude da solo dopo il merge");
  assert.equal(s.togliVerifica, true, "una prova a pattern in piu non si merita di sopravvivere");
});

prova("③ anche «già curato» perde la prova a pattern se non ha un comando", () => {
  const s = decidiVerifica("gia-curato", null, PATTERN_VECCHIA);
  assert.equal(s.azione, "blocca");
  assert.equal(s.togliVerifica, true);
});

prova("④ IL CASO CHE È COSTATO DUE CHIUSURE FALSE: aperto con una prova a comando che PASSA", () => {
  // Lotto 43: AR-693 e AR-684 erano dichiarati aperti e portavano una prova a comando verde.
  // La prima versione di questa funzione tornava «lascia» — non era una prova a pattern, quindi
  // sembrava innocua — e dopo il merge auto-fix li ha chiusi tutti e due. Il conto diceva 61
  // chiusure su 49 dichiarate, ed e cosi che si e visto. Non e il TIPO di prova a richiudere un
  // difetto: e il fatto che la prova PASSI.
  const s = decidiVerifica("aperto", null, { tipo: "comando", comando: "node cervello/test/x.test.mjs" });
  assert.equal(s.azione, "blocca");
  assert.ok(!s.togliVerifica, "la prova serve e resta: e il difetto a non essere chiuso, non la prova a essere sbagliata");
});

prova("⑤ un aperto con verifica umana si blocca lo stesso: il blocco non dipende dal tipo di prova", () => {
  const s = decidiVerifica("aperto", null, { tipo: "umano", nota: "serve una mano" });
  assert.equal(s.azione, "blocca");
});

prova("⑥ un chiuso senza comando non si inventa una prova", () => {
  const s = decidiVerifica("chiuso", null, undefined);
  assert.equal(s.azione, "lascia");
  assert.match(s.perche, /dichiar/);
});

prova("⑦ questa funzione non decide MAI lo stato: le chiusure sono di auto-fix dopo il merge", () => {
  for (const esito of ["chiuso", "aperto", "gia-curato"]) {
    const s = decidiVerifica(esito, "node cervello/test/x.test.mjs", PATTERN_VECCHIA);
    assert.ok(!("stato" in s), `${esito}: la decisione non deve portarsi dietro uno stato`);
  }
  const sorgente = readFileSync(join(REPO, "cervello/ricuci-corsie.mjs"), "utf8");
  assert.ok(
    !/scheda\.stato\s*=/.test(sorgente),
    "il ricucitore non deve assegnare stato a nessuna scheda: due lotti aperti insieme litigherebbero (AR-331)",
  );
});

// ── la voce di malattia: la nota di come è stata provata non deve finire nel registro ────────────

prova("⑧ una voce annidata sotto `voce` si estrae senza l'involucro che la racconta", () => {
  const proposta = {
    nome: "come l'ho provata: su una copia del registro, exit 0",
    voce: { id: "una-parola-con-due-padroni", nome: "La stessa parola in due posti", pattern: "x", partenza: 5 },
  };
  assert.deepEqual(voceDiMalattia(proposta), proposta.voce);
  assert.ok(!("descrizione" in voceDiMalattia(proposta)), "la prosa di corsia non entra in malattie.json");
});

prova("⑨ una voce piatta perde solo i campi di racconto, non i suoi", () => {
  const v = voceDiMalattia({ id: "prova-dal-canale-comodo", pattern: "y", partenza: 1, descrizione: "come l'ho provata", nota_onesta: "…" });
  assert.deepEqual(v, { id: "prova-dal-canale-comodo", pattern: "y", partenza: 1 });
});

// ── il contratto della malattia: una voce che la spazzata non sa cercare non è una voce ─────────

const VOCE_INTERA = {
  id: "x", nome: "X", pattern: "p", dove: ["cervello"], estensioni: [".mjs"], baseline: 3,
};

prova("⑩ una voce intera passa, e `partenza` diventa `baseline` (il nome che il registro usa)", () => {
  const { partenza, baseline, ...senzaBaseline } = VOCE_INTERA;
  const e = normalizzaMalattia({ ...senzaBaseline, partenza: 3 });
  assert.equal(e.ok, true);
  assert.equal(e.voce.baseline, 3, "la spazzata legge `baseline`: senza, il tetto non esiste");
  assert.ok(!("partenza" in e.voce), "`partenza` non è un campo del registro");
});

prova("⑪ una voce senza id/dove/estensioni viene SCARTATA, non scritta a metà", () => {
  const e = normalizzaMalattia({ nome: "una frase lunga", pattern: "p", partenza: 5 });
  assert.equal(e.ok, false, "scritta così, la spazzata non la cercherebbe mai e sembrerebbe censita");
  assert.deepEqual(e.mancanti.sort(), ["dove", "estensioni", "id"]);
});

prova("⑫ due voci SENZA nome non sono la stessa voce", () => {
  // `undefined === undefined` è vero: prima di questo caso due proposte anonime si riconoscevano
  // a vicenda come «già censita» e sparivano in silenzio. Un confronto che non ha guardato niente
  // non deve produrre un «sì».
  const a = normalizzaMalattia({ pattern: "p" }).voce;
  const b = normalizzaMalattia({ pattern: "q" }).voce;
  const gemella = (x, y, campo) => y[campo] !== undefined && x[campo] === y[campo];
  assert.equal(gemella(a, b, "id") || gemella(a, b, "nome"), false);
});

// ── il file della prova: una mutazione che punta a `--test` non può girare ───────────────────────

prova("⑬ il file della prova si ricava saltando `node` e le opzioni", () => {
  assert.equal(testDaComando("node cervello/test/x.test.mjs"), "cervello/test/x.test.mjs");
  assert.equal(
    testDaComando("node --test cervello/test/x.test.mjs"),
    "cervello/test/x.test.mjs",
    "prendendo il primo pezzo dopo `node` tornava `--test`: otto mutazioni del lotto 43 sono finite nel registro puntando a un file che non esiste",
  );
  assert.equal(
    testDaComando("node --import ./cervello/test/hook-ts.mjs --test cervello/test/y.test.mjs"),
    "./cervello/test/hook-ts.mjs",
    "col doppio flag prende comunque un file vero: imperfetto, ma non è un'opzione spacciata per file",
  );
  assert.equal(testDaComando(undefined), undefined);
});

prova("⑭ nessuna mutazione del registro punta a un'opzione invece che a un file", () => {
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  const rotte = mutanti.filter((m) => m.test && m.test.startsWith("-"));
  assert.equal(
    rotte.length,
    0,
    `queste mutazioni puntano a un'opzione: ${rotte.map((m) => `${m.difetto}→${m.test}`).join(", ")}`,
  );
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
