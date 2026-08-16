#!/usr/bin/env node
// 🧪 AR-347 — la macchina diceva a sé stessa di avere 42 senior. Sono 120.
//
// LA STORIA. AR-195 era stato dichiarato chiuso, e il «42 agenti» era ancora vivo in due posti che
// contano: il menu dei comandi che Nicola legge e la sentinella che ordina all'AD di riallineare i
// registri «ai 42 file reali». Il guardiano non se n'era accorto perché guarda una lista di sei
// percorsi scelti a mano (`FILE_PILOTA` in agent-registry-check.mjs) — e chi l'ha scritta ci ha
// messo i file dove aveva appena visto il difetto. Una lista a mano copre il passato: mai il
// prossimo posto dove il numero verrà ricopiato.
//
// LA CURA: non una lista, una SCANSIONE. Tutti i .md di radice, tutti i workflow, tutti i .md e
// .mjs del cervello. Il numero vero lo conta il test da sé, dai file in `.claude/agents/`.
//
// COSA RESTA FUORI, e perché. Due tipi di frase citano un numero senza mentire:
//   · un SOTTOINSIEME col suo denominatore giusto («114 senior su 120») — è un numero col metro;
//   · un RACCONTO di com'era («la prima versione aveva 48 agenti per giro») — è storia, e la storia
//     non si riscrive.
// Più un terzo tipo, che invece è debito vero: le frasi ancora sbagliate in file che la corsia 2 del
// lotto 44 non poteva toccare. Stanno qui sotto una per una, col perché, e l'elenco può solo
// ACCORCIARSI: se una di quelle frasi sparisce, il test lo dice e va tolta da qui. È un tetto che
// scende, non un'esenzione.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

/** Un numero attaccato a «agenti» / «senior» / «file reali» / «file in .claude/agents». */
const NUMERO_DELLA_SQUADRA = /\b(\d{1,4})\s*(agenti|senior|file reali|file in `?\.claude\/agents)/gi;

/** I file VIVI dove la macchina parla di sé: non una lista scelta a mano, tre cartelle intere. */
function fileVivi() {
  const dentro = [];
  for (const f of readdirSync(REPO)) if (f.endsWith(".md")) dentro.push(f);
  const wf = join(REPO, ".claude/workflows");
  if (existsSync(wf)) for (const f of readdirSync(wf)) if (f.endsWith(".js") || f.endsWith(".mjs")) dentro.push(`.claude/workflows/${f}`);
  for (const f of readdirSync(join(REPO, "cervello"))) if (f.endsWith(".md") || f.endsWith(".mjs")) dentro.push(`cervello/${f}`);
  return dentro;
}

/**
 * Le frasi che possono citare un numero diverso dal vero, e il motivo. `dove` + `frase` devono
 * combaciare esattamente con quello che il test trova, altrimenti l'ammissione non vale.
 */
const AMMESSE = [
  // ── numeri col loro metro: un sottoinsieme dichiarato su 120 ────────────────────────────────
  { dove: "cervello/eta-referto.mjs", frase: "73 senior", perche: "sottoinsieme: la riga dice «73 senior su 120»" },
  { dove: "cervello/prompt-senior.mjs", frase: "114 senior", perche: "sottoinsieme: la riga dice «114 senior su 120»" },
  { dove: "cervello/turno-senior.mjs", frase: "114 senior", perche: "sottoinsieme: la riga dice «114 senior su 120»" },
  { dove: "cervello/sentinella-dati.mjs", frase: "72 senior", perche: "sottoinsieme: la riga dice «72 senior su 120»" },
  { dove: "cervello/deferral-agenti.mjs", frase: "14 agenti", perche: "sottoinsieme: «14 agenti divergenti», non il totale" },
  // ── racconto di com'era: la storia non si riscrive ──────────────────────────────────────────
  {
    dove: ".claude/workflows/radiografia-totale.js",
    frase: "48 agenti",
    perche: "racconto: «la prima versione aveva 48 agenti per giro»",
  },
  {
    dove: "cervello/agent-registry-check.mjs",
    frase: "42 agenti",
    perche: "racconto: la riga cita il vecchio errore e lo corregge subito («mentre erano 120»)",
  },
  // ── DEBITO DICHIARATO: fuori dal territorio della corsia 2 del lotto 44 ─────────────────────
  // La patch per ognuna è nel frammento consegnato all'AD. Quando l'AD la applica, il test qui
  // sotto dice «questa frase non c'è più»: si toglie la riga, e il tetto è sceso.
  { dove: "README.md", frase: "40 senior", perche: "debito: file fuori territorio, patch consegnata all'AD" },
  { dove: "INIZIA-QUI.md", frase: "40 senior", perche: "debito: file fuori territorio, patch consegnata all'AD" },
  { dove: "cervello/agent-registry-check.mjs", frase: "40 senior", perche: "debito: file fuori territorio, patch consegnata all'AD" },
  { dove: "cervello/agent-registry-check.mjs", frase: "42 file reali", perche: "debito: file fuori territorio, patch consegnata all'AD" },
  // ⬇️ 16/8: «42 file reali» in cervello/sentinelle.md e stata CURATA (ora dice 120). Il tetto scende
  //    di una riga, come dice la regola qui sopra: la patch consegnata all'AD e stata applicata.
];

/** Tutte le citazioni di un numero della squadra diverso dal vero, con dove stanno. */
function citazioniStorte(reale) {
  const fuori = [];
  for (const rel of fileVivi()) {
    const testo = readFileSync(join(REPO, rel), "utf8");
    for (const m of testo.matchAll(NUMERO_DELLA_SQUADRA)) {
      if (Number(m[1]) === reale) continue;
      fuori.push({ dove: rel, frase: `${m[1]} ${m[2]}`, riga: testo.slice(0, m.index).split("\n").length });
    }
  }
  return fuori;
}

const seniorVeri = () => readdirSync(join(REPO, ".claude/agents")).filter((f) => f.endsWith(".md")).length;

test("⬇️ AR-347 — nessun file vivo dichiara un numero di senior che non è quello vero", () => {
  const reale = seniorVeri();
  assert.ok(reale > 0, "nessun file in .claude/agents: il test non starebbe confrontando niente");

  const ammesse = AMMESSE.map((a) => `${a.dove}|${a.frase}`);
  const nuove = citazioniStorte(reale).filter((c) => !ammesse.includes(`${c.dove}|${c.frase}`));

  assert.deepEqual(
    nuove.map((c) => `${c.dove}:${c.riga} «${c.frase}» (i senior veri sono ${reale})`),
    [],
    "un numero della squadra è stato ricopiato a mano da qualche parte: fra un mese sarà vecchio e nessuno lo saprà",
  );
});

test("⬇️ AR-347 — il menu dei comandi non dice più «42 agenti»", () => {
  // È la metà della scheda che questa corsia poteva riparare: COMANDI.md è il menù che Nicola
  // legge, e per mesi ha descritto una macchina che non esiste. Qui nessuna frase è ammessa: il
  // menù non ha nessun motivo di citare un sottoinsieme o di raccontare com'era.
  const reale = seniorVeri();
  const testo = readFileSync(join(REPO, "COMANDI.md"), "utf8");
  const storte = [...testo.matchAll(NUMERO_DELLA_SQUADRA)]
    .filter((m) => Number(m[1]) !== reale)
    .map((m) => `«${m[0]}» (i senior veri sono ${reale})`);
  assert.deepEqual(storte, [], `il menu dei comandi conta i senior a mano, e il conto è vecchio: ${storte.join(", ")}`);
});

test("AR-347 — l'elenco delle frasi ammesse può solo accorciarsi", () => {
  // Un'ammissione che non corrisponde più a niente è un'esenzione che sopravvive al suo motivo:
  // resterebbe lì a coprire il prossimo errore che capita nello stesso file.
  const morte = AMMESSE.filter((a) => {
    const p = join(REPO, a.dove);
    return !existsSync(p) || !readFileSync(p, "utf8").includes(a.frase);
  });
  assert.deepEqual(
    morte.map((a) => `${a.dove} «${a.frase}» — ${a.perche}`),
    [],
    "queste frasi non ci sono più: togli la riga dall'elenco, il tetto è sceso",
  );
  for (const a of AMMESSE) assert.match(a.perche, /\S/, `ammissione senza motivo scritto: ${a.dove} «${a.frase}»`);
});
