#!/usr/bin/env node
// AR-480 — la regola di scrittura deve stare in TUTTI i mansionari, non solo in quello dell'AD.
//
// Il difetto, col suo conto: misurato il 2/8/2026, **0 agenti su 120** citavano
// `cervello/scrittura-umana.md`. La regola viveva in CLAUDE.md, cioè nel mansionario dell'AD, e si
// fermava lì. Ma quando l'AD delega a @finanza, @vendite o @legale-privacy, è QUEL senior a scrivere
// il testo che Nicola legge — e lo scriveva senza nessuna regola.
//
// Nicola, 2/8: «non solo della macchina, ma a tutto quello che fai e farai, di qualsiasi altra cosa».
// Il perimetro non è l'argomento: è chiunque scriva qualcosa che finirà sotto i suoi occhi.
//
// Questa prova è il freno: se un mansionario nasce senza la regola, o se qualcuno la toglie da uno
// dei 120, qui diventa rosso. Senza, la regola sarebbe di nuovo una buona intenzione.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const AGENTI = join(REPO, ".claude", "agents");

/** I pezzi che rendono la regola utilizzabile: il senso, il formato, e come si misura. */
const OBBLIGATORI = [
  { pezzo: "si-capisce.mjs", perche: "senza il comando, il senior non può misurare la bozza" },
  { pezzo: "scrittura-umana.md", perche: "senza il rimando, non può leggere la regola per esteso" },
  { pezzo: "In parole semplici", perche: "il primo dei tre blocchi che Nicola legge" },
  { pezzo: "Cosa cambia per te", perche: "il secondo blocco" },
  { pezzo: "Cosa devi fare", perche: "il terzo blocco" },
  { pezzo: "passo indietro", perche: "la regola di forma che costa più tempo a Nicola quando manca" },
];

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

const file = readdirSync(AGENTI).filter((f) => f.endsWith(".md"));
const testi = new Map(file.map((f) => [f, readFileSync(join(AGENTI, f), "utf8")]));

prova("i mansionari ci sono tutti", () => {
  assert.ok(file.length >= 120, `attesi almeno 120 mansionari, trovati ${file.length}`);
});

for (const { pezzo, perche } of OBBLIGATORI) {
  prova(`ogni senior sa: «${pezzo}»`, () => {
    const senza = [...testi].filter(([, t]) => !t.includes(pezzo)).map(([f]) => f);
    assert.equal(senza.length, 0, `${senza.length} mansionari senza «${pezzo}» (${perche}): ${senza.slice(0, 5).join(", ")}`);
  });
}

prova("la regola dice esplicitamente che i termini tecnici NON si tolgono", () => {
  // È la correzione di Nicola. Se sparisce questa riga, il senior torna a scrivere annacquato.
  const senza = [...testi].filter(([, t]) => !/non si tolgono/i.test(t)).map(([f]) => f);
  assert.equal(senza.length, 0, `${senza.length} mansionari hanno perso la riga sui termini tecnici`);
});

prova("la regola vale per ogni argomento, non solo per la macchina", () => {
  const senza = [...testi].filter(([, t]) => !/non solo la macchina/i.test(t)).map(([f]) => f);
  assert.equal(senza.length, 0, `${senza.length} mansionari non dichiarano il perimetro largo`);
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate · ${file.length} mansionari controllati`);
process.exit(rotte.length ? 1 : 0);
