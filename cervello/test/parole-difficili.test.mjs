#!/usr/bin/env node
// AR-478 — le prove del misuratore di gergo.
//
// Il caso vero da cui nasce: i corpi delle ultime 5 PR. Qui sotto ci sono pezzi PRESI DA LÌ, non
// inventati per l'occasione — se lo strumento non li boccia, non serve a niente.

import assert from "node:assert/strict";
import { misura, parteDiNicola, DIZIONARIO } from "../parole-difficili.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: e.message });
  }
};

const tipi = (testo) => new Set(misura(testo).problemi.map((p) => p.tipo));
const trovati = (testo) => misura(testo).problemi.map((p) => p.trovato.toLowerCase());

// ── I casi veri, dalle PR che Nicola non è riuscito a leggere ────────────────────────────────

prova("il titolo della PR #654 viene bocciato", () => {
  const t = "AR-474 + AR-477: il contatore dell'abitudine, i limiti del freno sull'esito, e i due canali";
  const p = misura(t).problemi;
  assert.ok(p.length >= 3, `attesi almeno 3 problemi, trovati ${p.length}`);
  assert.ok(trovati(t).includes("ar-474"), "il codice AR-474 deve essere segnalato");
  assert.ok(trovati(t).some((x) => x.startsWith("freno")), "«freno» deve essere segnalato");
});

prova("una riga del corpo della PR #653 viene bocciata su tutti e tre i fronti", () => {
  const t = "Il guardiano è agganciato al cancello del lotto: 13 prove nuove, 2 mutazioni, exit 1 fuori dall'hook.";
  const trov = trovati(t);
  for (const atteso of ["guardiano", "cancello", "lotto", "mutazioni", "hook"]) {
    assert.ok(trov.some((x) => x.startsWith(atteso)), `«${atteso}» doveva essere segnalato`);
  }
  assert.ok(trov.includes("exit 1"), "«exit 1» doveva essere segnalato");
});

prova("il percorso di un file è un codice, non una spiegazione", () => {
  assert.ok(trovati("Ho scritto cervello/cancello-stop.mjs stamattina.").includes("cervello/cancello-stop.mjs"));
});

// ── Il verde: com'è scritto un testo che si legge ────────────────────────────────────────────

prova("lo stesso contenuto, detto in italiano, passa", () => {
  const t = "Ho aggiunto un controllo che ti avvisa quando consegno del lavoro senza dire com'è andato.";
  assert.equal(misura(t).problemi.length, 0, JSON.stringify(misura(t).problemi));
});

prova("sotto la riga dei dettagli tecnici il gergo è al suo posto", () => {
  const t = [
    "Ho aggiunto un controllo che ti avvisa quando ti consegno lavoro senza dirti com'è andato.",
    "",
    "## Dettagli tecnici",
    "cancello-stop.mjs, agganciato all'hook Stop, exit 2, 13 mutazioni su AR-474.",
  ].join("\n");
  assert.equal(misura(t).problemi.length, 0, "sotto il marcatore non si misura niente");
  assert.equal(parteDiNicola(t).length, 2, "il taglio cade PRIMA del titolo dei dettagli");
});

prova("dentro un blocco di codice il gergo non si traduce", () => {
  const t = ["Ecco cosa stampa:", "```", "❌ cancello rosso — exit 1 — AR-999", "```"].join("\n");
  assert.equal(misura(t).problemi.length, 0);
});

// ── Le tre domande: obbligatorie solo dove servono ───────────────────────────────────────────

prova("un testo lungo senza le tre domande viene bocciato", () => {
  const t = Array.from({ length: 20 }, (_, i) => `Riga numero ${i} di spiegazione normale.`).join("\n");
  const p = misura(t).problemi.filter((x) => x.tipo === "struttura");
  assert.equal(p.length, 3, "devono mancare tutti e tre i blocchi");
});

prova("un testo lungo con le tre domande passa", () => {
  const t = [
    "## In parole semplici",
    ...Array.from({ length: 8 }, (_, i) => `Spiegazione riga ${i}.`),
    "## Cosa cambia per te",
    ...Array.from({ length: 8 }, (_, i) => `Conseguenza riga ${i}.`),
    "## Cosa devi fare",
    "Niente, è già a posto.",
  ].join("\n");
  assert.equal(misura(t).problemi.length, 0, JSON.stringify(misura(t).problemi));
});

prova("un messaggio breve non deve avere la struttura", () => {
  const t = "Fatto, il sito è di nuovo online.";
  assert.equal(misura(t).problemi.length, 0);
  assert.equal(misura(t).testoLungo, false);
});

// ── Le trappole: un misuratore che accusa a torto viene spento entro il giorno ────────────────

prova("una parola normale che contiene una parola del dizionario non conta", () => {
  // «cantiere» sta dentro niente, ma «tetto» sta dentro «tetto dell'auto»: qui provo i confini veri.
  assert.equal(misura("Il progetto è fermo.").problemi.length, 0);
  assert.equal(misura("Ha comprato il pane e il latte.").problemi.length, 0);
});

prova("le date non vengono lette come numeri di PR", () => {
  assert.equal(misura("Ci vediamo il 2026-08-02 alle 15:30.").problemi.length, 0);
});

prova("il dizionario copre le parole che Nicola ha chiesto due volte", () => {
  for (const parola of ["cancello", "freno", "tetto", "potatore", "sonda", "lotto", "spazzata"]) {
    assert.ok(parola in DIZIONARIO, `«${parola}» deve avere la sua traduzione`);
  }
});

// ── Referto ──────────────────────────────────────────────────────────────────────────────────

const rotte = casi.filter((c) => !c.ok);
for (const c of casi) console.log(`${c.ok ? "✅" : "❌"} ${c.nome}${c.ok ? "" : `\n     ${c.err}`}`);
console.log(`\n${casi.length - rotte.length}/${casi.length} prove passate`);
process.exit(rotte.length ? 1 : 0);
