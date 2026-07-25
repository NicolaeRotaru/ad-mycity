// Voce 1 della pagella — «quante correzioni di Nicola sono diventate una regola» (node --test).
//
// La voce vecchia chiedeva «applica le lezioni che scrive» ma misurava se la SIGLA di una lezione
// compariva in un documento recente. Per arrivare al 70% servivano 331 citazioni in un mese.
// Questa misura chiede la cosa che conta e vale 12% dove la vecchia diceva 18%: più severa, non
// più comoda. Qui si prova che i conti tornano e che non si può gonfiare scrivendo altre lezioni.

import { test } from "node:test";
import assert from "node:assert/strict";
import { misura, diventataRegola, correzioniDiNicola, temiAperti, giorniFa } from "../tasso-regole.mjs";

const OGGI = new Date("2026-07-25T12:00:00").getTime();
const lez = (p = {}) => ({ id: p.id ?? "L-1", caso_studio_nicola: true, nato: "2026-07-20", ...p });

test("diventataRegola(): tre forme di promozione, perché nel tempo ne sono passate tre", () => {
  assert.equal(diventataRegola(lez({ promosso_il: "2026-07-21" })), true);
  assert.equal(diventataRegola(lez({ cristallizzato_in: "cervello/giro.md" })), true);
  assert.equal(diventataRegola(lez({ stato: "principio" })), true);
  assert.equal(diventataRegola(lez()), false, "una lezione che sta solo scritta non è una regola");
  assert.equal(diventataRegola(null), false);
});

test("conta SOLO le correzioni di Nicola, vive e dentro la finestra", () => {
  const dentro = correzioniDiNicola(
    [
      lez({ id: "sua" }),
      lez({ id: "mia", caso_studio_nicola: false }),
      lez({ id: "decaduta", stato: "decaduta" }),
      lez({ id: "vecchia", nato: "2026-05-01" }),
      lez({ id: "senza-data", nato: undefined }),
    ],
    30,
    OGGI,
  );
  assert.deepEqual(dentro.map((l) => l.id), ["sua"]);
});

test("il conto torna", () => {
  const m = misura([lez({ id: "a", promosso_il: "x" }), lez({ id: "b" }), lez({ id: "c" }), lez({ id: "d" })], 30, OGGI);
  assert.equal(m.correzioni, 4);
  assert.equal(m.diventate_regola, 1);
  assert.equal(m.tasso, 0.25);
  assert.deepEqual(m.aperte_ids, ["b", "c", "d"]);
});

// ⬇️ La proprietà che rende onesta questa misura.
test("scrivere altre lezioni ABBASSA il tasso: non si può gonfiare producendo carta", () => {
  const prima = misura([lez({ id: "a", promosso_il: "x" }), lez({ id: "b" })], 30, OGGI);
  const dopo = misura(
    [lez({ id: "a", promosso_il: "x" }), lez({ id: "b" }), lez({ id: "c" }), lez({ id: "d" })],
    30,
    OGGI,
  );
  assert.equal(prima.tasso, 0.5);
  assert.equal(dopo.tasso, 0.25);
  assert.ok(dopo.tasso < prima.tasso, "più lezioni scritte senza chiuderle = numero più basso");
});

test("l'unico modo di alzarla è chiudere una correzione", () => {
  const aperta = [lez({ id: "a" }), lez({ id: "b" })];
  const chiusa = [lez({ id: "a", promosso_il: "2026-07-24" }), lez({ id: "b" })];
  assert.equal(misura(aperta, 30, OGGI).tasso, 0);
  assert.equal(misura(chiusa, 30, OGGI).tasso, 0.5);
});

test("zero correzioni in finestra non è «va male»: è «niente da misurare»", () => {
  // Un tasso 0 senza denominatore sarebbe una bocciatura inventata. La pagella deve poterlo
  // distinguere, altrimenti mostra un fallimento dove non c'è nessun dato.
  const m = misura([lez({ id: "vecchia", nato: "2026-01-01" })], 30, OGGI);
  assert.equal(m.correzioni, 0);
  assert.equal(m.tasso, 0);
  assert.equal(m.misurabile, false);
});

test("temiAperti(): dice da dove cominciare, contando solo ciò che è ancora aperto", () => {
  const temi = temiAperti(
    [
      lez({ id: "a", tag: ["pannello", "ux"] }),
      lez({ id: "b", tag: ["pannello"] }),
      lez({ id: "c", tag: ["worker"], promosso_il: "x" }),
    ],
    30,
    OGGI,
  );
  assert.deepEqual(temi[0], { tag: "pannello", volte: 2 });
  assert.ok(!temi.some((t) => t.tag === "worker"), "un tema già chiuso non è un tema aperto");
});

test("giorniFa(): legge la data ovunque stia nella stringa, e non inventa quando non c'è", () => {
  assert.equal(giorniFa("2026-07-24", OGGI), 1);
  assert.equal(giorniFa("nato il 2026-07-25 alle 10:00", OGGI), 0);
  assert.equal(giorniFa("", OGGI), Infinity);
  assert.equal(giorniFa("senza data", OGGI), Infinity);
});

// ─────────────────────────────────────────────────────────────────────────────
// I DUE NUMERI aggiunti il 25/7 rispondendo a «l'hai risolto del tutto?». La risposta era no:
// `diventataRegola()` si fida di campi che la macchina scrive sul proprio lavoro, e tutte le
// lezioni «cristallizzate» finiscono in `memoria-persistente` — testo nel prompt, non un gate.

import { ricadute, conGate } from "../tasso-regole.mjs";

test("ricadute(): conta solo i temi CRONICI, e guarda com'era PRIMA di quella correzione", () => {
  // «pannello» diventa cronico dopo 3 correzioni: la 4ª è una ricaduta, le prime 3 no.
  const r = ricadute(
    [
      lez({ id: "1", tag: ["pannello"], nato: "2026-07-01" }),
      lez({ id: "2", tag: ["pannello"], nato: "2026-07-02" }),
      lez({ id: "3", tag: ["pannello"], nato: "2026-07-03" }),
      lez({ id: "4", tag: ["pannello"], nato: "2026-07-04" }),
    ],
    90,
    OGGI,
  );
  assert.equal(r.correzioni, 4);
  assert.equal(r.su_tema_cronico, 1, "solo la quarta cade su un tema già cronico");
  assert.equal(r.temi_cronici, 1);
});

test("ricadute(): i tag generici non fanno testo (se no «nicola» renderebbe tutto cronico)", () => {
  const r = ricadute(
    ["a", "b", "c", "d"].map((id, i) => lez({ id, tag: ["nicola", "caso-studio"], nato: `2026-07-0${i + 1}` })),
    90,
    OGGI,
  );
  assert.equal(r.su_tema_cronico, 0);
  assert.equal(r.temi_cronici, 0);
});

test("ricadute(): scende solo se le correzioni smettono di ripetersi", () => {
  const ripetute = ["1", "2", "3", "4", "5"].map((id, i) => lez({ id, tag: ["worker"], nato: `2026-07-0${i + 1}` }));
  const sparse = ["1", "2", "3", "4", "5"].map((id, i) => lez({ id, tag: [`tema-${id}`], nato: `2026-07-0${i + 1}` }));
  assert.ok(ricadute(ripetute, 90, OGGI).quota > 0, "ripetersi sullo stesso tema si vede");
  assert.equal(ricadute(sparse, 90, OGGI).quota, 0, "temi sempre nuovi = nessuna ricaduta");
});

test("conGate(): conta solo le correzioni legate a un controllo che può fallire", () => {
  const g = conGate(
    [lez({ id: "a", gate: "node cervello/permessi-check.mjs" }), lez({ id: "b" }), lez({ id: "c", gate: "   " })],
    30,
    OGGI,
  );
  assert.equal(g.correzioni, 3);
  assert.equal(g.con_gate, 1, "un campo vuoto non è un gate");
  assert.equal(g.quota, 0.33);
});

test("conGate(): un principio NON conta come gate — è un promemoria, non un impedimento", () => {
  // È il punto dell'intera analisi: promuovere a principio significa iniettare testo nel prompt.
  const g = conGate([lez({ id: "a", promosso_il: "x", cristallizzato_in: "memoria-persistente" })], 30, OGGI);
  assert.equal(g.con_gate, 0);
});
