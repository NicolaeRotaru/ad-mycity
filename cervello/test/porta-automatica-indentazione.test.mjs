#!/usr/bin/env node
// 🧪 LA PORTA AUTOMATICA CHE ERA RIMASTA APERTA (AR-558, seguito di AR-522).
//
// AR-522 raccontava la catena per intero — uno spazio, il file riscritto, il guardiano della forma
// che blocca il commit, l'albero sporco, il rebase che non parte, la memoria non pubblicata: quattro
// giorni e diciassette ore — e poi curava UN punto solo, `tasso-lezioni.mjs`. La sua prova cercava
// quel file per nome.
//
// Ma `tasso-lezioni` non lo lancia una persona: lo lancia `tick-auto-coscienza-leggero.mjs`, dentro
// il giro. E due righe dopo averlo lanciato, il tick riapriva `apprendimento.json` e lo riscriveva a
// DUE spazi — il file ne ha UNO. La porta a mano chiusa, quella automatica aperta: è l'errore già
// pagato del cantiere (AR-172), e qui sarebbe costato di nuovo l'intera catena al primo giro utile.
//
// Le altre due porte sullo stesso file: `cristallizza-apprendimento.mjs` e un uno-shot del 23/7
// rimasto in giro. Nessuna delle tre era vista da nessuna prova.
//
// Perciò qui non si prova un file: si prova che NESSUNA porta possa più scegliere la forma. Il
// giudizio sta in `indentazione-fissa.mjs` come funzioni pure, e il test le ESEGUE — sui casi
// costruiti e sul repo vero.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { corpoChiamata, primoArgomento, scrittureConIndentazioneFissa, verdetto } from "../indentazione-fissa.mjs";
import { analizza } from "../indentazione-guardia.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("il confine della chiamata si conta, non si stima", () => {
  // Il falso positivo trovato costruendo il metro: cercare la `stringify` in una finestra di
  // caratteri dopo `writeFileSync(` pescava quella di una chiamata DIVERSA più in basso, e accusava
  // `prova-trigger.mjs` — che scrive a 1 spazio, cioè giusto. Un guardiano che accusa l'innocente
  // viene spento, e da spento non vede nemmeno i colpevoli.
  const sorgente = [
    'const BUONO = join(X, "buono.json");',
    "writeFileSync(BUONO, `${JSON.stringify(a, null, 1)}\\n`);",
    'writeFileSync(ALTRO, JSON.stringify(b, null, 2) + "\\n");',
  ].join("\n");
  const trovate = scrittureConIndentazioneFissa(sorgente);
  assert.equal(trovate.length, 2, "due chiamate, due letture: nessuna deve rubare l'argomento all'altra");
  assert.equal(trovate[0].indent, 1, "la prima scrive a 1, e resta 1");
  assert.equal(trovate[1].indent, 2);

  // E il primo argomento sopravvive alle virgole annidate: `join(REPO, TETTO)` non è `join(REPO`.
  assert.equal(primoArgomento("(join(REPO, TETTO), altro)", 0), "join(REPO, TETTO)");
  assert.equal(corpoChiamata("f(a, g(b, c)) coda", 1), "(a, g(b, c))");
  assert.equal(corpoChiamata("f(a, b", 1), null, "parentesi non chiuse: non si inventa un confine");
});

test("una porta si vede anche se la costante ha il nome minuscolo", () => {
  // La terza porta era `const path = '…/apprendimento.json'`. Dedurre il perimetro dalla convenzione
  // dei nomi (solo MAIUSCOLE) l'avrebbe lasciata fuori: è l'errore di perimetro dedotto di AR-347.
  const sorgente = [
    "const path = 'MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json';",
    "fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\\n');",
  ].join("\n");
  const [scrittura] = scrittureConIndentazioneFissa(sorgente);
  assert.ok(scrittura, "la porta col nome minuscolo va vista");
  assert.equal(scrittura.percorso, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
  assert.equal(scrittura.indent, 2);
});

test("un bersaglio che non si risolve è ⚪ dichiarato, non un verde", () => {
  const scritture = [
    { bersaglio: "APPR", percorso: "a/uno.json", indent: 2, riga: 1 },
    { bersaglio: "APPR", percorso: "a/uno.json", indent: 1, riga: 2 },
    { bersaglio: "percorso", percorso: null, indent: 2, riga: 3 },
  ];
  const v = verdetto(scritture, (p) => (p === "a/uno.json" ? 1 : null));
  assert.equal(v.fuori.length, 1, "solo la scrittura che impone una forma diversa è un guasto");
  assert.equal(v.fuori[0].riga, 1);
  assert.equal(v.nonMisurate.length, 1, "il bersaglio non risolvibile si dichiara, non si assolve");
});

test("dal vivo: una porta che impone la forma viene trovata sul disco", () => {
  // Non un finto comodo: un repo vero in miniatura, con il file a UN spazio sul disco e uno script
  // che ci scriverebbe a DUE. È esattamente la riga che il tick aveva prima di questo lotto.
  const dove = mkdtempSync(join(tmpdir(), "porta-"));
  try {
    mkdirSync(join(dove, "cervello"), { recursive: true });
    mkdirSync(join(dove, "memoria"), { recursive: true });
    writeFileSync(join(dove, "memoria", "appr.json"), '{\n "meta": {},\n "lezioni": []\n}\n');
    writeFileSync(
      join(dove, "cervello", "porta.mjs"),
      ['const APPR = join(ROOT, "memoria/appr.json");', 'writeFileSync(APPR, JSON.stringify(a, null, 2) + "\\n");'].join("\n"),
    );

    const esito = analizza(dove);
    assert.equal(esito.fuori.length, 1, "la porta va trovata");
    assert.equal(esito.fuori[0].reale, 1, "il file sul disco ha un spazio");
    assert.equal(esito.fuori[0].indent, 2, "e la porta gliene imporrebbe due");

    // La prova che la prova non è vuota: corretta la porta, il guasto sparisce.
    writeFileSync(
      join(dove, "cervello", "porta.mjs"),
      ['const APPR = join(ROOT, "memoria/appr.json");', "scriviJsonAtomico(APPR, a);"].join("\n"),
    );
    assert.equal(analizza(dove).fuori.length, 0, "chi passa dall'aiutante non impone niente");
  } finally {
    rmSync(dove, { recursive: true, force: true });
  }
});

test("sul repo vero nessuna porta impone la forma ai file di memoria", () => {
  // Il tetto che non può salire: qualunque scrittura nuova che scelga l'indentazione su un file
  // che ne ha già un'altra rende questo test rosso, prima che fermi la macchina per quattro giorni.
  const esito = analizza(REPO);
  const elenco = esito.fuori.map((f) => `${f.file}:${f.riga} → ${f.percorso} (${f.reale} sul disco, ci scrive a ${f.indent})`);
  assert.deepEqual(elenco, [], "queste scritture riscriverebbero il file intero e bloccherebbero la pubblicazione");
});

test("le tre porte di apprendimento.json passano tutte dall'aiutante", () => {
  // Nominate una per una apposta: una prova condivisa che non nomina i suoi difetti ne chiude uno
  // mai toccato (è il controllo `prova-condivisa-cieca` del cancello).
  for (const file of [
    "cervello/tick-auto-coscienza-leggero.mjs", // la porta AUTOMATICA — quella che girava nel giro
    "cervello/cristallizza-apprendimento.mjs",
    "cervello/tmp-metabolizza-append.mjs",
  ]) {
    const sorgente = readFileSync(join(REPO, file), "utf8");
    assert.match(sorgente, /scriviJsonAtomico\(/, `${file}: la scrittura deve passare dall'aiutante`);
    // Solo le SCRITTURE SU FILE, non ogni `JSON.stringify`: in questi file ce n'è anche una che
    // stampa a schermo con due spazi, ed è innocente. Una prova che accusa l'innocente si disattiva.
    const imposte = scrittureConIndentazioneFissa(sorgente).filter((s) => /apprendimento\.json$/.test(s.percorso ?? ""));
    assert.deepEqual(imposte, [], `${file}: l'indentazione non si sceglie qui, la conserva scriviJsonAtomico`);
  }
});
