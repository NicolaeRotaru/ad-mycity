#!/usr/bin/env node
// 📦 CHI INSTALLA LE DIPENDENZE DEVE VENIRE PRIMA DI CHI LE USA.
//
// IL CASO VERO, 14 agosto 2026 sera. La richiesta di unione #727 aveva due controlli sulla stessa
// riga di codice: «prove, guardiani e typecheck» verde, «suite del cervello» rossa. Stesso repo,
// stesso commit, verdetti opposti.
//
// La differenza non era nel codice: era l'ORDINE dei passi. In `cancello-lotto.yml` le dipendenze
// del Pannello si installano al passo prima del cancello; in `test-cervello.yml` stavano DOPO la
// suite. Così `c1-atto-una-volta-sola.test.mjs` — che carica `pannello/src/app/api/azioni-pronte/
// route.ts`, che importa `next` — usciva 🚫 «import non risolvibile», e il runner lo contava fra i
// rotti: `❌ 1 su 279 non danno garanzie`.
//
// PERCHÉ NON È UN DETTAGLIO DI CONFIGURAZIONE. Una prova sana veniva dichiarata rotta perché
// nessuno le aveva ancora messo davanti ciò che le serve. È il gemello esatto del male che questa
// casa cura da AR-660: lì una prova esisteva e non la eseguiva nessuno, qui una prova viene
// eseguita in un ambiente in cui non può girare — e in tutti e due i casi il verdetto che arriva a
// Nicola è falso. Con l'aggravante che questo si traveste da rosso del codice, e manda a cercare
// un difetto dove non c'è: ci ho perso il primo giro, convinta che l'avesse risolto la fusione con
// main (localmente passava — ma solo perché in questa sessione `npm ci` l'avevo già lanciato io).
//
// La prova guarda l'ORDINE dichiarato, non una parola: legge i passi nell'ordine in cui il runner
// li eseguirà e confronta due posizioni. Rimettere l'installazione sotto la fa diventare rossa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * I passi di un workflow, in ordine di esecuzione: `[{nome, comando}]`.
 *
 * Letto a mano invece che con un parser YAML perché è l'unica dipendenza che servirebbe, e un
 * guardiano che ha bisogno di `npm install` per girare è esattamente il problema che qui misuriamo.
 */
export function passiDelWorkflow(yaml = "") {
  const passi = [];
  let corrente = null;
  for (const riga of String(yaml).split("\n")) {
    const nome = riga.match(/^\s*-\s+name:\s*(.+?)\s*$/);
    if (nome) {
      corrente = { nome: nome[1], comando: "" };
      passi.push(corrente);
      continue;
    }
    if (/^\s*-\s+uses:/.test(riga)) {
      corrente = null;
      continue;
    }
    if (corrente) {
      const run = riga.match(/^\s*run:\s*(.*)$/);
      if (run) corrente.comando += run[1];
      else if (corrente.comando && /^\s{8,}\S/.test(riga)) corrente.comando += `\n${riga.trim()}`;
    }
  }
  return passi;
}

/** La posizione del primo passo il cui comando soddisfa `quale`, o -1. */
export function posizione(passi, quale) {
  return passi.findIndex((p) => quale(p.comando || ""));
}

const INSTALLA = (c) => /npm\s+(--prefix\s+pannello\s+)?ci\b/.test(c) && /pannello/.test(c);
const SUITE = (c) => /node\s+cervello\/test-cervello\.mjs/.test(c);
const CANCELLO = (c) => /node\s+cervello\/cancello-lotto\.mjs/.test(c);

const leggi = (f) => readFileSync(join(REPO, f), "utf8");

test("il caso che ha rotto: nella suite del cervello le dipendenze si installano PRIMA", () => {
  const passi = passiDelWorkflow(leggi(".github/workflows/test-cervello.yml"));
  const dove = posizione(passi, INSTALLA);
  const prove = posizione(passi, SUITE);
  assert.notEqual(dove, -1, "il passo che installa le dipendenze del Pannello dev'esserci");
  assert.notEqual(prove, -1, "e quello che lancia la suite pure");
  assert.ok(
    dove < prove,
    `install al passo ${dove}, suite al passo ${prove}: la suite carica moduli .ts del Pannello che importano «next» — senza npm ci non partono, e una prova sana esce «rotta»`,
  );
});

test("e lo stesso vale per il cancello del lotto, che la suite la chiama dentro", () => {
  const passi = passiDelWorkflow(leggi(".github/workflows/cancello-lotto.yml"));
  const dove = posizione(passi, INSTALLA);
  const gate = posizione(passi, CANCELLO);
  assert.notEqual(dove, -1);
  assert.notEqual(gate, -1);
  assert.ok(dove < gate, `install al passo ${dove}, cancello al passo ${gate}: stesso ordine, stessa ragione`);
});

test("i due workflow non possono divergere: la regola è una sola", () => {
  // Il difetto è nato proprio da qui — due file con lo stesso compito e due ordini diversi, quindi
  // due verdetti opposti sulla stessa riga di codice. La prova li tiene insieme.
  for (const f of [".github/workflows/test-cervello.yml", ".github/workflows/cancello-lotto.yml"]) {
    const passi = passiDelWorkflow(leggi(f));
    const dove = posizione(passi, INSTALLA);
    const usa = Math.max(posizione(passi, SUITE), posizione(passi, CANCELLO));
    assert.ok(dove !== -1 && usa !== -1 && dove < usa, `${f}: le dipendenze devono precedere chi le usa`);
  }
});

test("il lettore dei passi legge davvero l'ordine, su un finto costruito qui", () => {
  // Se il lettore sbagliasse a leggere, le tre prove sopra passerebbero per caso. Qui si esegue.
  const finto = [
    "jobs:",
    "  x:",
    "    steps:",
    "      - uses: actions/checkout@v4",
    "      - name: Test del cervello",
    "        run: node cervello/test-cervello.mjs",
    "      - name: Dipendenze del Pannello",
    "        run: npm --prefix pannello ci",
  ].join("\n");
  const passi = passiDelWorkflow(finto);
  assert.equal(passi.length, 2, "il passo `uses` non è un passo con comando");
  assert.equal(passi[0].nome, "Test del cervello");
  assert.ok(posizione(passi, INSTALLA) > posizione(passi, SUITE), "questo è l'ordine SBAGLIATO, e va riconosciuto come tale");
});

test("un comando su più righe non sfugge al riconoscimento", () => {
  const finto = ["      - name: Dipendenze", "        run: |", "          npm --prefix pannello ci", "      - name: Prove", "        run: node cervello/test-cervello.mjs"].join("\n");
  const passi = passiDelWorkflow(finto);
  assert.ok(posizione(passi, INSTALLA) === 0, "anche scritto con `run: |` su più righe");
  assert.ok(posizione(passi, SUITE) === 1);
});

test("i workflow che questa prova sorveglia esistono ancora", () => {
  // Se un file venisse rinominato, le prove sopra passerebbero su zero controlli senza dirlo.
  for (const f of [".github/workflows/test-cervello.yml", ".github/workflows/cancello-lotto.yml"]) {
    assert.ok(existsSync(join(REPO, f)), `${f} non c'è più: questa prova sta sorvegliando il vuoto`);
  }
});
