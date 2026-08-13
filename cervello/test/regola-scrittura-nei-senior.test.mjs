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
import { BLOCCHI } from "../si-capisce.mjs";

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
  { pezzo: "Cosa non ho verificato", perche: "il quarto blocco: dice a Nicola di quanto fidarsi" },
  { pezzo: "Regola zero", perche: "AR-485: il metro è il suo tempo, non il testo — viene prima di tutto il resto" },
  { pezzo: "3 opzioni", perche: "una decisione va consegnata pronta da firmare, non aperta" },
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

// ── Il quarto blocco spariva perché il MANDATO insegnava tre blocchi mentre il metro (si-capisce)
// ne misura quattro: l'11/8 «Cosa non ho verificato» mancava nel 100% dei 26 messaggi del VPS,
// mentre gli altri tre c'erano quasi sempre. I 120 senior la regola ce l'avevano (le prove qui
// sopra); a non averla erano CLAUDE.md (il mansionario dell'AD) e i prompt del worker — cioè
// esattamente chi scrive i messaggi che il contatore misura. ──────────────────────────────────

prova("il mansionario dell'AD (CLAUDE.md) insegna TUTTI e quattro i blocchi del metro", () => {
  const t = readFileSync(join(REPO, "CLAUDE.md"), "utf8");
  for (const b of BLOCCHI) assert.ok(t.includes(b), `CLAUDE.md non nomina «${b}»`);
  assert.ok(
    !t.includes("i **tre blocchi**"),
    "CLAUDE.md insegna ancora «tre blocchi»: il quarto è proprio quello che sparisce",
  );
});

prova("i prompt del worker (chat E lavori) pretendono i quattro blocchi sulle risposte lunghe", () => {
  const t = readFileSync(join(REPO, "cervello", "worker.sh"), "utf8");
  for (const b of BLOCCHI) {
    const volte = t.split(b).length - 1;
    assert.ok(volte >= 2, `«${b}» compare ${volte} volta/e in worker.sh: serve sia nel prompt della CHAT sia in quello dei LAVORI`);
  }
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate · ${file.length} mansionari controllati`);
process.exit(rotte.length ? 1 : 0);
