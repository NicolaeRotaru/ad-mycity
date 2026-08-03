#!/usr/bin/env node
// AR-484 — il buco che avevo dichiarato aperto: le soglie si potevano abbassare in silenzio.
//
// Nicola, 3/8: «chiudi il buco della soglia per impedire che si rompa la sicurezza che garantisce
// che funzioni sempre».
//
// IL DIFETTO, col suo meccanismo. Il controllo `si-capisce.mjs` dichiara che una frase sopra le 30
// parole va spezzata. Quel 30 è scritto in una costante. Se domani lo porto a 60, succede questo:
//   · tutte le 30 prove restano VERDI, perché provano il comportamento «sopra la soglia blocca»,
//     e la soglia nuova è ancora una soglia;
//   · il controllo continua a uscire 0 su ogni testo;
//   · Nicola vede tutto verde e legge frasi da 55 parole.
// È lo stesso meccanismo con cui in questa casa un pavimento a 5.200 byte rendeva impossibile
// bocciare un kit: la misura c'era, la soglia la rendeva finta.
//
// LA CURA. I numeri che decidono vengono fissati qui, uno per uno. Cambiarli è legittimo — ma
// diventa un gesto VISIBILE: questa prova diventa rossa, e chi la aggiorna deve scriverlo nel
// commit e passare dal cancello del lotto, che gira su ogni PR.
//
// Perché una prova e non un guardiano: la soglia non è uno stato del repo che cambia da solo, è una
// decisione. Le decisioni si fissano dove si rompono rumorosamente.

import assert from "node:assert/strict";
import {
  PAROLE_FRASE_ROSSA,
  PAROLE_FRASE_AVVISO,
  RIGHE_TESTO_LUNGO,
  BLOCCHI,
  ARIA_FRITTA,
  SOTTINTESI_CONTATI,
  misura,
} from "../si-capisce.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

// ── I numeri che decidono, fissati uno per uno ────────────────────────────────────────────────

prova("una frase sopra le 30 parole blocca, e 30 è il numero deciso", () => {
  assert.equal(PAROLE_FRASE_ROSSA, 30, "alzare questa soglia rende il controllo più permissivo: dillo nel commit");
});

prova("l'avviso parte a 20 parole", () => {
  assert.equal(PAROLE_FRASE_AVVISO, 20, "alzare questa soglia toglie l'avviso prima del blocco");
});

prova("un testo è «lungo» da 15 righe piene in su", () => {
  assert.equal(RIGHE_TESTO_LUNGO, 15, "alzare questa soglia esenta testi sempre più lunghi dai tre blocchi");
});

prova("le tre risposte obbligatorie sono ancora tre, e sono quelle", () => {
  assert.deepEqual(BLOCCHI, ["In parole semplici", "Cosa cambia per te", "Cosa devi fare"]);
});

prova("l'avviso non deve mai essere più severo del blocco", () => {
  // Se qualcuno invertisse i due numeri, l'avviso non uscirebbe mai e il blocco arriverebbe secco.
  assert.ok(PAROLE_FRASE_AVVISO < PAROLE_FRASE_ROSSA, "l'avviso viene prima del blocco, sempre");
});

// ── Il parco delle regole non deve dimagrire in silenzio ──────────────────────────────────────

prova("le frasi vuote sorvegliate sono almeno 15", () => {
  assert.ok(ARIA_FRITTA.length >= 15, `svuotare questo elenco spegne il controllo: ${ARIA_FRITTA.length}`);
});

prova("i sottintesi sorvegliati sono almeno 11", () => {
  assert.ok(SOTTINTESI_CONTATI >= 11, `svuotare questo elenco spegne il controllo: ${SOTTINTESI_CONTATI}`);
});

// ── La prova comportamentale: la soglia dichiarata è quella che agisce davvero ─────────────────

prova("il numero dichiarato è quello che decide DAVVERO, non solo scritto", () => {
  // Una costante può essere giusta e non essere usata da nessuno. Qui si misura il comportamento:
  // una frase di esattamente PAROLE_FRASE_ROSSA parole passa, una di una parola in più blocca.
  const frase = (n) => Array.from({ length: n }, (_, i) => `parola${i}`).join(" ") + ".";
  const alLimite = misura(frase(PAROLE_FRASE_ROSSA)).problemi.filter((p) => p.tipo === "frase-lunga");
  const oltre = misura(frase(PAROLE_FRASE_ROSSA + 1)).problemi.filter((p) => p.tipo === "frase-lunga");
  assert.equal(alLimite.length, 0, "al limite esatto non si blocca");
  assert.equal(oltre.length, 1, "una parola oltre il limite blocca: la soglia scritta è quella che agisce");
});

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate`);
process.exit(rotte.length ? 1 : 0);
