// 🖐️ Le prove della MANO FERMATA (AR-531) — l'errore già censito non si scrive.
//
// Cosa difendono: il testo in arrivo con una malattia censita viene RIFIUTATO (permissionDecision
// deny) col perché; i commenti, le esenzioni e le estensioni del registro valgono anche qui (è la
// stessa `sorveglia()` del sorvegliante, non una copia); un testo pulito passa in silenzio; e i tre
// attrezzi di scrittura (Edit/Write/MultiEdit) consegnano tutti il loro testo nuovo.

import test from "node:test";
import assert from "node:assert/strict";
import { bustaManoFermata, cablaggioPresente, giudizioScrittura, testoInArrivo } from "../mano-fermata.mjs";

const MALATTIE = [
  {
    id: "esca-di-prova",
    nome: "la forma-esca usata solo in queste prove",
    pattern: "ESCA_MALATTIA_[0-9]+",
    perche_e_grave: "è la fixture: se la vedo, il riconoscimento funziona",
    estensioni: [".mjs"],
  },
];

test("il testo in arrivo con una malattia censita viene riconosciuto, con la riga del testo nuovo", () => {
  const voci = giudizioScrittura({ file: "cervello/x.mjs", testo: "riga sana\nconst a = ESCA_MALATTIA_1;\n", malattie: MALATTIE });
  assert.equal(voci.length, 1);
  assert.equal(voci[0].riga, 2);
  assert.match(voci[0].cosa, /esca-di-prova/);
});

test("un testo pulito passa: la mano si ferma solo sul certo", () => {
  assert.equal(giudizioScrittura({ file: "cervello/x.mjs", testo: "const b = 2;\n", malattie: MALATTIE }).length, 0);
});

test("il commento che SPIEGA una malattia non è la malattia (stesso filtro del sorvegliante)", () => {
  const voci = giudizioScrittura({ file: "cervello/x.mjs", testo: "// esempio da evitare: ESCA_MALATTIA_1\n", malattie: MALATTIE });
  assert.equal(voci.length, 0);
});

test("le estensioni del registro valgono anche qui: la stessa riga in un .md non scatta", () => {
  assert.equal(giudizioScrittura({ file: "consegne/x.md", testo: "ESCA_MALATTIA_1\n", malattie: MALATTIE }).length, 0);
});

test("le esenzioni della casa valgono anche qui: nei file di prova le esche sono il mestiere", () => {
  assert.equal(giudizioScrittura({ file: "cervello/test/finto.test.mjs", testo: "ESCA_MALATTIA_1\n", malattie: MALATTIE }).length, 0);
});

test("l'esente PER-FILE del registro vale anche qui: il rilevatore che nomina la malattia per mestiere non viene negato", () => {
  // È il caso vero del 4/8: pre-scrittura.mjs, esente dichiarato per «bypass-del-cancello» nel
  // registro, segnalato 35 volte perché solo la spazzata leggeva il campo `esenti` — e questa mano,
  // una volta cablata, avrebbe negato le modifiche proprio al guardiano dei bypass.
  const malattie = [{ ...MALATTIE[0], esenti: [{ file: "cervello/rilevatore.mjs", perche: "è il rilevatore: nomina la forma per mestiere" }] }];
  assert.equal(giudizioScrittura({ file: "cervello/rilevatore.mjs", testo: "ESCA_MALATTIA_1\n", malattie }).length, 0);
  assert.equal(giudizioScrittura({ file: "cervello/altro.mjs", testo: "ESCA_MALATTIA_1\n", malattie }).length, 1, "l'esenzione è per QUEL file, non per la malattia intera");
});

test("la busta rifiuta con «deny», nomina la malattia e le due uscite legittime", () => {
  const voci = giudizioScrittura({ file: "cervello/x.mjs", testo: "ESCA_MALATTIA_1\n", malattie: MALATTIE });
  const busta = JSON.parse(bustaManoFermata(voci, "cervello/x.mjs"));
  assert.equal(busta.hookSpecificOutput.permissionDecision, "deny");
  assert.match(busta.hookSpecificOutput.permissionDecisionReason, /esca-di-prova/);
  assert.match(busta.hookSpecificOutput.permissionDecisionReason, /due uscite legittime/);
});

test("senza voci la busta è nulla: il silenzio è la risposta giusta di un freno che non serve", () => {
  assert.equal(bustaManoFermata([], "cervello/x.mjs"), null);
});

const SETTINGS = (hooks) => JSON.stringify({ permissions: {}, hooks });
const AGGANCIO = (comando) => [{ hooks: [{ type: "command", command: comando }] }];

test("il controllo del cablaggio legge il JSON vero e distingue i due agganci", () => {
  const cablato = SETTINGS({
    PreToolUse: AGGANCIO("node cervello/mano-fermata.mjs --hook"),
    UserPromptSubmit: AGGANCIO("node cervello/contesto-lezioni.mjs --richiesta"),
  });
  assert.deepEqual(cablaggioPresente(cablato), { mano: true, scheda: true });
  const meta = cablaggioPresente(SETTINGS({ PreToolUse: AGGANCIO("node cervello/mano-fermata.mjs --hook") }));
  assert.equal(meta.mano, true);
  assert.equal(meta.scheda, false, "un cablaggio a metà non è un cablaggio: la scheda AR-531 non si deve chiudere");
});

test("il comando sotto l'evento SBAGLIATO non è un cablaggio: era il verde falso della prima stesura", () => {
  const sbagliato = SETTINGS({
    PreToolUse: AGGANCIO("node cervello/altro.mjs --hook"),
    PostToolUse: AGGANCIO("node cervello/mano-fermata.mjs --hook"),
  });
  assert.equal(cablaggioPresente(sbagliato).mano, false, "mano-fermata DOPO la scrittura non ferma niente: deve contare solo sotto PreToolUse");
});

test("un settings malformato o vuoto risponde «non cablato»: l'esito onesto, mai un errore", () => {
  assert.deepEqual(cablaggioPresente(""), { mano: false, scheda: false });
  assert.deepEqual(cablaggioPresente("{ json rotto"), { mano: false, scheda: false });
});

test("oltre il tetto di dimensione il testo passa senza esame: fail-open dichiarato, non un blocco lento", () => {
  const enorme = "const a = ESCA_MALATTIA_1;\n".repeat(30000); // ~780KB, sopra TESTO_MAX
  assert.equal(giudizioScrittura({ file: "cervello/x.mjs", testo: enorme, malattie: MALATTIE }).length, 0);
});

test("i tre attrezzi di scrittura consegnano tutti il loro testo nuovo", () => {
  assert.equal(testoInArrivo({ content: "tutto il file" }), "tutto il file");
  assert.equal(testoInArrivo({ new_string: "il pezzo" }), "il pezzo");
  assert.equal(testoInArrivo({ edits: [{ new_string: "a" }, { new_string: "b" }] }), "a\nb");
  assert.equal(testoInArrivo({ old_string: "solo lettura?" }), null);
});
