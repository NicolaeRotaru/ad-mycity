// Il Pannello non deve spegnersi perché un campo di memoria non è una stringa.
//
// Cos'è successo davvero: il 27/07/2026 alle 12:14 la radiografia (#558) ha scritto `causa_radice`
// come ELENCO dei «5 perché» in 5 difetti. Il Pannello faceva `(s || "").replace(...)` su quel campo
// dandolo per stringa → `(e || "").replace is not a function` → alle 12:52 la Cabina non si apriva
// più («Application error: a client-side exception»), alle 18:32 la sezione Radiografia macchina
// restava vuota. Nessun dato era sbagliato: era il Pannello a pretendere una forma che i JSON scritti
// dagli agenti non garantiscono.
//
// Qui si ESEGUE la funzione vera (pannello/src/lib/format.ts), non una sua riscrittura, e la si punta
// sui file di memoria REALI: se un giro futuro riscrive di nuovo un campo come elenco, questo test
// resta verde — ed è il punto: il Pannello deve reggere il dato, non pretenderlo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..", "..");

// TypeScript eseguito da node con lo stripping dei tipi: format.ts non importa nulla, gira com'è.
const { comeTesto, testoPulito } = await import(join(RADICE, "pannello/src/lib/format.ts"));

// I campi che il Pannello tratta come frasi e che un agente può scrivere come elenco.
const CAMPI_TESTO = [
  "titolo", "descrizione", "impatto", "causa_radice", "fix", "fix_proposto",
  "dove", "nota_fix", "nota", "impatto_crescita",
];

const MEMORIA = [
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
];

test("il caso che ha rotto: causa_radice come elenco non fa più esplodere il Pannello", () => {
  const cinquePerche = [
    "Perché stampo-check dice 120/120? Perché tutti i 120 agenti passano i 5 marker.",
    "Perché li passano tutti? Perché i marker sono di PRESENZA, non di qualità.",
  ];
  // Prima del fix questa riga sollevava «(s || "").replace is not a function».
  const out = testoPulito(cinquePerche);
  assert.equal(typeof out, "string");
  // Una voce per riga: l'elenco resta leggibile, non diventa "a,b" né "[object Object]".
  assert.equal(out.split("\n").length, 2);
  assert.match(out, /120 agenti/);
});

test("comeTesto regge ogni forma che un agente può scrivere", () => {
  assert.equal(comeTesto("già una frase"), "già una frase");
  assert.equal(comeTesto(null), "");
  assert.equal(comeTesto(undefined), "");
  assert.equal(comeTesto(["a", "b"]), "a\nb");
  assert.equal(comeTesto([["a"], "b"]), "a\nb", "elenco annidato");
  assert.equal(comeTesto(42), "42");
  assert.equal(comeTesto(true), "true");
  // Un oggetto NON deve mai arrivare a schermo come "[object Object]".
  assert.equal(comeTesto({ a: 1 }), "");
  assert.doesNotMatch(comeTesto({ a: 1 }), /object Object/);
});

test("nessuna forma fa più esplodere testoPulito", () => {
  for (const v of [null, undefined, "", 0, 42, true, [], ["a"], [null], {}, { a: 1 }, new Date()]) {
    assert.equal(typeof testoPulito(v), "string", `testoPulito ha ceduto su ${JSON.stringify(v)}`);
  }
});

test("i file di memoria REALI passano tutti dal Pannello senza errori", () => {
  let campiVisitati = 0;
  for (const rel of MEMORIA) {
    const file = join(RADICE, rel);
    if (!existsSync(file)) continue; // memoria non ancora scritta: non è un fallimento
    const json = JSON.parse(readFileSync(file, "utf8"));
    const visita = (nodo, dove) => {
      if (Array.isArray(nodo)) return nodo.forEach((v, i) => visita(v, `${dove}[${i}]`));
      if (!nodo || typeof nodo !== "object") return;
      for (const [k, v] of Object.entries(nodo)) {
        if (CAMPI_TESTO.includes(k)) {
          campiVisitati++;
          assert.doesNotThrow(() => testoPulito(v), `${rel} → ${dove}.${k} spegne il Pannello`);
        }
        visita(v, `${dove}.${k}`);
      }
    };
    visita(json, rel.split("/").pop());
  }
  assert.ok(campiVisitati > 0, "nessun campo di testo trovato: il test non stava provando nulla");
});
