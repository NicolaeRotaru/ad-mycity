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
