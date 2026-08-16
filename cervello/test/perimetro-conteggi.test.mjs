// 🔢 LE PROVE DEL PERIMETRO DEI CONTEGGI — AR-347.
//
// IL DIFETTO CHE DIFENDONO. Il guardiano del registro agenti controllava i conteggi vecchi in sei
// file scelti a mano. Il «42» era ancora vivo in due posti, tutti e due fuori da quell'elenco:
// `COMANDI.md`, il menù che legge Nicola, e `cervello/sentinelle.md`, cioè la regola che dovrebbe
// accorgersi proprio di questo. Gli agenti reali erano 120.
//
// LA PROVA CHE CONTA è la prima: un file FUORI dal vecchio elenco letterale, con un conteggio
// sbagliato, deve essere trovato. Se quella torna verde per sbaglio, il perimetro è di nuovo un
// elenco e il difetto è tornato senza che nessuno lo veda.
//
// La seconda che conta davvero è quella sui sottoinsiemi: «73 senior su 120» è una frase giusta, e
// una guardia che la chiama errore si impara a scorrere in due giorni. Un freno rumoroso è un freno
// spento — con l'aggravante che sembra acceso.

import assert from "node:assert/strict";
import test from "node:test";
import { conteggiDi, conteggiSbagliati, eParziale, nelPerimetro, perimetroDaRepo } from "../perimetro-conteggi.mjs";

const VECCHIO_ELENCO = [
  ".claude/workflows/auto-radiografia.js",
  ".claude/workflows/giro-operativo.js",
  ".claude/workflows/audit-pannello.js",
  "cervello/auto-radiografia.md",
  "cervello/auto-coscienza.md",
  "cervello/giro.md",
];

test("LA REGOLA CHE CONTA: un file fuori dal vecchio elenco entra nel perimetro", () => {
  for (const f of ["COMANDI.md", "cervello/sentinelle.md", "README.md", "MyCity-Vault/07-Agenti/AGENTI.md"]) {
    assert.equal(nelPerimetro(f), true, `${f} era invisibile al guardiano: è lì che il «42» è sopravvissuto`);
    assert.equal(VECCHIO_ELENCO.includes(f), false, "e non era nell'elenco scritto a mano");
  }
});

test("il perimetro vecchio resta dentro: allargare non deve perdere pezzi", () => {
  for (const f of VECCHIO_ELENCO) assert.equal(nelPerimetro(f), true, `${f} era coperto prima e deve restarlo`);
});

test("la storia resta fuori: un verbale di luglio era vero il giorno che è stato scritto", () => {
  assert.equal(nelPerimetro("MyCity-Vault/90-Memoria-AI/Briefing/2026-07-15.md"), false);
  assert.equal(nelPerimetro("MyCity-Vault/90-Memoria-AI/DECISIONI.md"), false);
  assert.equal(nelPerimetro("memoria-squadra/tech.md"), false);
  assert.equal(nelPerimetro("MyCity-Vault/90-Memoria-AI/auto-coscienza/salute.json"), false);
});

test("un altro repo e le dipendenze non sono affari nostri", () => {
  assert.equal(nelPerimetro("marketplace/lib/constants.ts"), false);
  assert.equal(nelPerimetro("node_modules/qualcosa/README.md"), false);
});

test("il perimetro si deriva da un elenco di file, in ordine e senza doppioni", () => {
  const dentro = perimetroDaRepo(["COMANDI.md", "memoria-squadra/x.md", "cervello/giro.md", "marketplace/a.md"]);
  assert.deepEqual(dentro, ["COMANDI.md", "cervello/giro.md"]);
});

test("un conteggio vecchio viene trovato, uno giusto no", () => {
  assert.equal(conteggiDi("COMANDI.md", "la propria architettura: 42 agenti, prompt", 120).length, 1);
  assert.equal(conteggiDi("COMANDI.md", "i 120 senior della squadra", 120).length, 0);
});

test("il reale+1 è ammesso: l'AD a volte si conta e a volte no", () => {
  assert.equal(conteggiDi("x.md", "121 agenti", 120).length, 0);
  assert.equal(conteggiDi("x.md", "122 agenti", 120).length, 1);
});

test("LA SECONDA CHE CONTA: «73 senior su 120» è una frase giusta, non un errore", () => {
  assert.equal(conteggiDi("cervello/eta-referto.mjs", "73 senior su 120 non hanno mai consegnato", 120).length, 0);
  assert.equal(eParziale("73 senior su 120", "73 senior".length), true);
});

test("anche una scomposizione è un conto di un gruppo, non del roster", () => {
  assert.equal(conteggiDi("x.md", "26 agenti: 13 revisori + 13 verificatori", 120).length, 0);
});

test("ma un numero secco resta un errore: la tolleranza non diventa un buco", () => {
  assert.equal(conteggiDi("x.md", "40 agenti al lavoro", 120).length, 1);
  assert.equal(eParziale("40 agenti al lavoro", "40 agenti".length), false);
});

test("su più file il conto non perde pezzi", () => {
  const fuori = conteggiSbagliati({ "a.md": "42 agenti", "b.md": "40 senior", "c.md": "120 agenti" }, 120);
  assert.equal(fuori.length, 2);
  assert.deepEqual(fuori.map((f) => f.file).sort(), ["a.md", "b.md"]);
});
