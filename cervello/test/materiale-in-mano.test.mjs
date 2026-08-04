#!/usr/bin/env node
// 🧪 AR-524 — UNA CARD CHE CHIEDE UN GESTO DI COPIA DEVE PORTARE IL MATERIALE.
//
// Il caso vero, del 4/8. Ho consegnato a Nicola quattro freni che solo lui può accendere, incollando
// una configurazione. Ho messo quella configurazione in una consegna, ho accodato una card che
// diceva «apri il file e incolla il blocco», e in chat ho citato il percorso. Lui ha risposto: «non
// mi ha dato nessun blocco, perché?».
//
// Le prove qui sotto difendono anche i NO: una card che chiede di LANCIARE un comando non ha bisogno
// di materiale, e chiederglielo renderebbe il guardiano rumoroso — cioè spento entro la settimana.

import { test } from "node:test";
import assert from "node:assert/strict";
import { cardDellaCoda, cardSenzaMateriale, tettoSforato, GESTI_DI_COPIA } from "../materiale-in-mano.mjs";

const coda = (corpo) => `<!-- prova-card -->\n\n### 🟡 #prova-card — Fai la cosa X · ⏳ accodata 2026-08-04 01:00\n${corpo}\n`;

// ── il caso vero ─────────────────────────────────────────────────────────────

test("IL CASO VERO: «incolla il blocco, è nel file X» senza il blocco dentro la card viene preso", () => {
  const fuori = cardSenzaMateriale(cardDellaCoda(coda("**Se va bene:** apri il file e incolla il blocco pronto in `consegne/macchina/2026-08-04-hooks.md`.")));
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].slug, "prova-card");
  assert.match(fuori[0].titolo, /Fai la cosa X/, "il verdetto deve dire QUALE card, o chi legge deve andarsela a cercare — cioè lo stesso difetto un piano sotto");
});

test("con il blocco DENTRO la card non si accusa nessuno: è il comportamento giusto", () => {
  const fuori = cardSenzaMateriale(cardDellaCoda('**Se va bene:** incolla questo:\n\n```json\n{"hooks": {}}\n```\n'));
  assert.deepEqual(fuori, []);
});

// ── i NO: dove il materiale non serve ────────────────────────────────────────

test("una card che chiede di LANCIARE un comando non ha bisogno di materiale", () => {
  assert.deepEqual(cardSenzaMateriale(cardDellaCoda("**Se va bene:** lancia `node cervello/salute.mjs` e guarda il referto.")), []);
});

test("una card che chiede una DECISIONE non ha bisogno di materiale", () => {
  assert.deepEqual(cardSenzaMateriale(cardDellaCoda("**Se va bene:** dimmi se preferisci la strada (a) o la (b).")), []);
});

test("una card già FATTA non si riapre: il gesto è passato", () => {
  const chiusa = "<!-- vecchia -->\n\n### ✅ #vecchia — ~~Incolla il blocco~~ · FATTO 2026-08-01\nera in consegne/x.md\n";
  assert.deepEqual(cardSenzaMateriale(cardDellaCoda(chiusa)), []);
});

// ── il taglio delle card ─────────────────────────────────────────────────────

test("la coda si spezza sui commenti-slug, non sui titoli: una card con sottotitoli resta una", () => {
  const due = "<!-- una -->\n### 🟡 #una — A\ntesto\n\n<!-- due -->\n### 🟡 #due — B\n### sottotitolo dentro la card\naltro\n";
  const c = cardDellaCoda(due);
  assert.equal(c.length, 2);
  assert.deepEqual(c.map((x) => x.slug), ["una", "due"]);
});

test("una coda senza card non produce accuse", () => {
  assert.deepEqual(cardDellaCoda(""), []);
  assert.deepEqual(cardSenzaMateriale([]), []);
});

// ── i verbi ──────────────────────────────────────────────────────────────────

test("i gesti di copia sono riconosciuti nelle forme che questa coda usa davvero", () => {
  for (const g of ["incolla", "incollare", "sostituisci", "sostituiscila", "copia", "aggiungi la riga"]) {
    assert.ok(GESTI_DI_COPIA.test(`allora ${g} il pezzo`), `«${g}» deve contare come gesto di copia`);
  }
});

test("«apri» e «lancia» NON sono gesti di copia: aprire un file non richiede di avere il file in mano", () => {
  assert.equal(GESTI_DI_COPIA.test("apri il pannello e guarda"), false);
  assert.equal(GESTI_DI_COPIA.test("lancia il comando"), false);
});

// ── il tetto ─────────────────────────────────────────────────────────────────

test("LA REGOLA CHE CONTA: il debito può solo scendere — una card puntatore in più non si consegna", () => {
  assert.equal(tettoSforato(7, 6).sforato, true);
  assert.equal(tettoSforato(6, 6).sforato, false);
  assert.equal(tettoSforato(5, 6).scende, true, "quando scende il guardiano lo dice, così il tetto si abbassa nello stesso lavoro");
});

test("senza tetto scritto si parte da zero: un tetto assente non deve assolvere nessuno", () => {
  assert.equal(tettoSforato(1, 0).sforato, true);
  assert.equal(tettoSforato(1, undefined).sforato, true);
});
