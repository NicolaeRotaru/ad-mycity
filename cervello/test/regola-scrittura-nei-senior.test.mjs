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

/**
 * I DUE PROMPT DEL WORKER, ritagliati uno per uno.
 *
 * ⚠️ 27/8 · AR-855 — QUI SI CONTAVANO LE OCCORRENZE IN TUTTO IL FILE, con la soglia a due. Ma
 * «Cosa non ho verificato» in `worker.sh` compare SEI volte: due nelle istruzioni ai prompt, e
 * quattro dentro messaggi di esempio già scritti. Togliendone una — proprio quella del prompt
 * della chat, cioè la regola che Nicola legge di riflesso in ogni risposta dal server — ne
 * restavano cinque, e il caso restava verde. Verificato eseguendo la mutazione.
 *
 * È la parola che la rottura si porta dietro, in forma di conteggio: il numero è soddisfatto dagli
 * ESEMPI, e la regola può sparire senza che il conto se ne accorga.
 *
 * La cura è guardare dentro ogni prompt invece che nel file intero. Se gli ancoraggi non ci sono
 * più, questa funzione GRIDA invece di tornare una lista vuota: una lista vuota renderebbe il caso
 * verde per il motivo peggiore, cioè «non ho trovato niente da controllare».
 */
const PROMPT_GENERALI = [
  { nome: "chat", attacco: "Sei l'AD digitale di MyCity e stai parlando con Nicola nella chat del Pannello" },
  { nome: "lavori", attacco: "Sei l'AD digitale di MyCity (segui CLAUDE.md). Esegui questo lavoro" },
];

function promptiDelWorker(src) {
  const righe = src.split("\n");
  // Il corpo di un `prompt="..."` finisce alla PRIMA riga che chiude la stringa — cioè che termina
  // con un `"` non scappato. Tagliare invece fino al prompt SUCCESSIVO (la prima stesura di questo
  // caso) si porta dentro il codice in mezzo, e lì la frase cercata ricompare dentro un commento:
  // il caso restava verde con la regola tolta dal prompt. Misurato il 27/8.
  const corpo = (apre) => {
    const i0 = righe[apre].indexOf('prompt="') + 8;
    const out = [righe[apre].slice(i0)];
    if (/[^\\]"\s*$/.test(out[0])) return out.join("\n");
    for (let i = apre + 1; i < righe.length; i++) {
      out.push(righe[i]);
      if (/[^\\]"\s*$/.test(righe[i]) || righe[i].trimEnd() === '"') return out.join("\n");
    }
    return null; // stringa mai chiusa: non è un prompt che so leggere
  };
  return PROMPT_GENERALI.map(({ nome, attacco }) => {
    const apre = righe.findIndex((r) => r.includes(`prompt="${attacco}`));
    const testo = apre === -1 ? null : corpo(apre);
    if (!testo) {
      throw new Error(
        `CIECO: in worker.sh non trovo il prompt «${nome}» (attacco: «${attacco.slice(0, 48)}…») — l'ancoraggio non c'è più, e questo caso non sta controllando niente`,
      );
    }
    return { nome, testo };
  });
}

prova("AR-855: OGNI prompt dell'AD nel worker pretende i quattro blocchi — non basta che il file li nomini", () => {
  const t = readFileSync(join(REPO, "cervello", "worker.sh"), "utf8");
  // I DUE prompt GENERALI, non tutti: quelli stretti (per esempio «esegui-azione») consegnano una
  // riga d'esito, e su una risposta corta i quattro blocchi non ci vanno — sarebbero quattro
  // intestazioni sopra sei righe, che è la regola opposta scritta nello stesso manuale.
  for (const { nome, testo } of promptiDelWorker(t)) {
    for (const b of BLOCCHI) {
      assert.ok(
        testo.includes(b),
        `il prompt «${nome}» non nomina «${b}»: chi risponde da lì scriverà senza quel blocco, e il file resta pieno di esempi che lo contengono`,
      );
    }
  }
});

prova("AR-855: se l'ancoraggio dei prompt sparisce il caso GRIDA, non passa", () => {
  // Il verso che rende viva la difesa: un ritaglio che non trova niente deve rompersi, non
  // dichiararsi soddisfatto. È il ⚪ che non deve poter diventare ✅.
  assert.throws(() => promptiDelWorker("qui non c'è nessun prompt"), /CIECO: .*«chat»/);
  // E se ne resta UNO solo, grida per quello che manca: due prompt controllati, non «almeno due».
  const soloChat = `  prompt="Sei l'AD digitale di MyCity e stai parlando con Nicola nella chat del Pannello."`;
  assert.throws(() => promptiDelWorker(soloChat), /CIECO: .*«lavori»/);
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate · ${file.length} mansionari controllati`);
process.exit(rotte.length ? 1 : 0);
