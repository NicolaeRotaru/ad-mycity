/**
 * Il numero di una card archiviata resta suo.
 *
 * Le card della coda si scrivono in due forme: `### 🟡 #81 — …` finché sono in attesa, e
 * `| 81 | data | … |` una volta archiviate. È la stessa card in due momenti della sua vita, e
 * il numero è la sua targa: serve a Nicola per dire «ok 81» e ottenere UNA risposta.
 *
 * Il 16/8 due card portavano il numero 81. Chi assegna i numeri — `prossimoNumero` — guardava
 * solo i titoli delle card in attesa. La coda aveva 81 come titolo più alto e 91 in archivio:
 * il prossimo numero usciva 82, e ottantadue era già speso, come 83, come tutti fino a 91.
 * Non era un incidente singolo: erano dieci collisioni in fila, in attesa di essere scritte.
 *
 * La guardia che l'ha trovato (`carte-numerate.test.mjs`) controlla il file VERO e sa già che le
 * due forme condividono lo spazio dei numeri. Ma sa dirlo solo DOPO che il numero doppio è
 * finito su disco. Questa prova lo chiede a chi il numero lo sceglie, PRIMA.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { prossimoNumero, numeriUsati } from "../pausa-coda.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const CODA_VERA = join(QUI, "..", "..", "MyCity-Vault", "90-Memoria-AI", "AZIONI-IN-ATTESA.md");

// La forma esatta del guasto del 16/8, in miniatura: titoli fermi a 81, archivio già a 91.
const CODA_CON_ARCHIVIO = [
  "# Azioni in attesa",
  "",
  "### 🟡 #80 — Una card ancora in attesa · ⏳ accodata 2026-08-15 09:00",
  "",
  "### 🟡 #81 — Un'altra card in attesa · ⏳ accodata 2026-08-15 10:00",
  "",
  "## 🗄️ Archivio",
  "",
  "| # | Quando | Chi | Cosa | Colore |",
  "| --- | --- | --- | --- | --- |",
  "| 91 | 2026-08-14 18:59 | @tech | Una card già fatta e archiviata | 🔴 |",
  "| 82 | 2026-08-13 18:59 | @tech | Un'altra archiviata | 🟡 |",
].join("\n");

test("① il prossimo numero non è mai un numero che l'archivio ha già speso", () => {
  const n = prossimoNumero(CODA_CON_ARCHIVIO);
  assert.equal(n, 92, "l'archivio arriva a 91: il primo libero è 92, non 82");
});

test("② nessun numero proposto può essere già in uso, in nessuna delle due forme", () => {
  const usati = numeriUsati(CODA_CON_ARCHIVIO);
  assert.equal(usati.has(prossimoNumero(CODA_CON_ARCHIVIO)), false, "il numero proposto era già di qualcun altro");
  assert.deepEqual([...usati].sort((a, b) => a - b), [80, 81, 82, 91]);
});

test("③ una coda senza nessun numero parte da 1", () => {
  assert.equal(prossimoNumero("# Azioni in attesa\n\nniente card qui."), 1);
  assert.equal(prossimoNumero(""), 1);
  assert.equal(prossimoNumero(null), 1);
});

test("④ una tabella senza numeri non conta: solo la prima colonna numerica è una targa", () => {
  const md = ["| Quando | Chi |", "| --- | --- |", "| 2026-08-14 | @tech |"].join("\n");
  assert.equal(numeriUsati(md).size, 0, "una data in prima colonna non è il numero di una card");
});

test("⑤ sul file VERO il numero proposto è libero davvero", () => {
  const md = readFileSync(CODA_VERA, "utf8");
  const usati = numeriUsati(md);
  const n = prossimoNumero(md);
  assert.ok(usati.size > 50, `attese decine di card numerate, trovate ${usati.size}`);
  assert.equal(usati.has(n), false, `il prossimo numero proposto (#${n}) è già di un'altra card`);
});
