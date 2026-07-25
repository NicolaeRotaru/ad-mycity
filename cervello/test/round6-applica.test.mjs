// Lo script che modifica giro.sh e AutoCoscienza.tsx, provato prima di lasciarglieli toccare.
//
// Sono i due file che non passano dall'API di GitHub intatti: 914 e 972 righe, e per cambiarne
// cinque punti bisognerebbe ribatterli tutti a mano. Uno regge il ciclo principale della macchina
// (se si rompe, la macchina non «degrada»: si ferma), l'altro una schermata del Pannello. Per
// questo le modifiche passano da uno script con ancore precise — e per questo lo script ha una rete.
//
// Le proprietà che contano davvero sono le due di sicurezza: se non riconosce il file, NON scrive.

import { test } from "node:test";
import assert from "node:assert/strict";
import { applica } from "../round6-applica.mjs";

const modFinte = [
  { nome: "uno", gia: "@@GIA-UNO@@", ancora: "ANCORA-UNO", dopo: (a) => `${a}\n@@GIA-UNO@@` },
  { nome: "due", gia: "@@GIA-DUE@@", ancora: "ANCORA-DUE", dopo: (a) => `${a}\n@@GIA-DUE@@` },
];

test("applica le modifiche che mancano", () => {
  const r = applica("prima\nANCORA-UNO\nin mezzo\nANCORA-DUE\ndopo", modFinte);
  assert.equal(r.ok, true);
  assert.ok(r.out.includes("@@GIA-UNO@@"));
  assert.ok(r.out.includes("@@GIA-DUE@@"));
  assert.deepEqual(r.esiti.map((e) => e.esito), ["applicata", "applicata"]);
});

test("è idempotente: rilanciarlo non raddoppia niente", () => {
  // Nicola può rilanciarlo senza guardare se l'aveva già fatto. È il requisito di ogni comando
  // che gli passo: deve poter essere ripetuto senza pensarci.
  const uno = applica("ANCORA-UNO\nANCORA-DUE", modFinte).out;
  const due = applica(uno, modFinte);
  assert.equal(due.out, uno, "il secondo giro non cambia niente");
  assert.deepEqual(due.esiti.map((e) => e.esito), ["già presente", "già presente"]);
});

// ⬇️ Le due proprietà di sicurezza. Senza queste, lo script scriverebbe nel punto sbagliato.
test("ancora NON trovata: si ferma e lascia il file INTATTO", () => {
  const originale = "un file che non riconosco";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.equal(r.out, originale, "meglio non fare niente che scrivere alla cieca");
});

test("ancora AMBIGUA (compare due volte): si ferma — non sa DOVE mettere la modifica", () => {
  const originale = "ANCORA-UNO ... ANCORA-UNO";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.match(r.esiti[0].esito, /AMBIGUA/);
  assert.equal(r.out, originale);
});

test("se la prima modifica fallisce, la seconda NON viene applicata a metà", () => {
  // Un'applicazione parziale su giro.sh sarebbe peggio di nessuna: un file mezzo modificato.
  const originale = "niente ancore qui, ma ANCORA-DUE sì";
  const r = applica(originale, modFinte);
  assert.equal(r.ok, false);
  assert.equal(r.out, originale, "o tutte o nessuna");
});

// ────────────────────────────────────────────────────────────────────────────
// Il PIANO vero: i due file e le loro ancore. Qui non si esegue niente su disco — si controlla
// che il piano sia sensato, perché un'ancora sbagliata scoperta sul VPS è una brutta sorpresa.

import { PIANO } from "../round6-applica.mjs";

test("il piano copre i due file che non passano dall'API, e nessun altro", () => {
  assert.deepEqual(
    PIANO.map((v) => v.file),
    ["cervello/giro.sh", "pannello/src/components/AutoCoscienza.tsx"],
  );
});

test("ogni modifica dichiara come si riconosce di essere già applicata", () => {
  // Senza `gia`, rilanciare lo script raddoppierebbe le modifiche. È la proprietà che permette a
  // Nicola di lanciarlo senza prima controllare se l'aveva già fatto.
  for (const v of PIANO) {
    for (const m of v.modifiche) {
      assert.ok(m.gia && m.gia.length > 3, `${v.file} / ${m.nome}: manca il marcatore 'gia'`);
      assert.ok(m.ancora && m.ancora.length > 3, `${v.file} / ${m.nome}: manca l'ancora`);
    }
  }
});

test("le modifiche del Pannello sono idempotenti per costruzione: applicarle dà il marcatore", () => {
  const pannello = PIANO.find((v) => v.file.endsWith("AutoCoscienza.tsx"));
  for (const m of pannello.modifiche) {
    assert.equal(m.dopo(m.ancora), m.gia, `${m.nome}: il risultato deve coincidere col marcatore`);
  }
});

test("giro.sh ha un controllo di sintassi prima di essere scritto, il Pannello no (e si sa perché)", () => {
  // giro.sh rotto = macchina ferma: non si scrive senza `bash -n`. Sul Pannello il controllo
  // sarebbe `tsc`, che pretende node_modules sul VPS — lì la rete sono le ancore univoche.
  const giro = PIANO.find((v) => v.file.endsWith("giro.sh"));
  assert.deepEqual(giro.verifica, ["bash", "-n"]);
  assert.equal(PIANO.find((v) => v.file.endsWith(".tsx")).verifica, null);
});
