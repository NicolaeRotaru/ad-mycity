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

test("i gesti di copia sono gli ORDINI a Nicola, in seconda persona", () => {
  for (const g of ["incolla", "incollalo", "incollare", "sostituisci", "sostituiscila", "aggiungi la riga", "riporta questo"]) {
    assert.ok(GESTI_DI_COPIA.test(`allora ${g} il pezzo`), `«${g}» è un ordine rivolto a lui`);
  }
});

test("«copia» nudo NON è più un gesto: era il sostantivo che ha prodotto quattro abbagli su sette", () => {
  // Prima versione, 4/8: `copia|copiare` prendeva «una copia della memoria», «copiando lo schema»,
  // «glieli copia dentro», «una copia a mano». Quattro card sane accusate. La parola da sola non
  // dice chi agisce; l'imperativo sì.
  assert.equal(GESTI_DI_COPIA.test("congela una copia della memoria"), false);
  assert.equal(GESTI_DI_COPIA.test("copiando lo schema del controllo"), false);
  assert.equal(GESTI_DI_COPIA.test("il modello da copiare"), false);
  assert.equal(GESTI_DI_COPIA.test("il piano sostituisce la pausa"), false, "terza persona: non è un ordine");
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

// ── I CINQUE ABBAGLI, presi dalla coda vera il 4/8 ───────────────────────────
//
// La prima versione di questo guardiano trovava 7 card. Controllandole una per una, SEI erano sane:
// il verbo c'era ma non era un ordine rivolto a Nicola. Queste prove tengono quelle frasi esatte,
// perché un guardiano che grida al lupo viene spento — e allora il giorno che grida per davvero non
// lo ascolta nessuno. Sono le frasi vere, non inventate per l'occasione.

const cardCon = (corpo) => cardDellaCoda(`<!-- x -->\n\n### 🟡 #x — Fai la cosa X · ⏳ accodata 2026-08-04 01:00\n${corpo}\n`);

test("abbaglio ①: «una COPIA della memoria» è un sostantivo, non un ordine", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Se va bene:** l'AD congela subito una copia della memoria di oggi e cambia il decadimento in `cervello/pota-apprendimento.mjs`.")), []);
});

test("abbaglio ②: «COPIANDO lo schema» è quello che faccio io nel codice", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Se va bene:** l'AD promuove i controlli che contano, copiando lo schema di `cervello/giro.sh`; il modello da copiare è MEMORIA_INCOERENTE.")), []);
});

test("abbaglio ③: «glieli COPIA dentro» descrive un bug, non chiede un gesto", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Cosa cambia:** la cancellazione dell'account glieli copia dentro invece di toglierli, vedi `cervello/audit.md`.")), []);
});

test("abbaglio ④: «l'ho aggirato con una COPIA a mano» racconta cosa ho fatto io", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Nota:** l'ho aggirato con una copia a mano, il dettaglio è in `consegne/audit/x.md`.")), []);
});

test("abbaglio ⑤: «SOSTITUISCE» in terza persona non è un ordine — e quella card era pure chiusa", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Se va bene:** dimmi se il piano squadra sostituisce la pausa negozi, il piano è in `MyCity-Vault/piano.md`.")), []);
  const chiusa = "<!-- y -->\n\n### ❌ #y — ~~Conferma se il piano sostituisce la pausa~~ → RIMOSSA 2026-07-30\nincolla il pezzo che è in `consegne/x.md`\n";
  assert.deepEqual(cardSenzaMateriale(cardDellaCoda(chiusa)), [], "una card chiusa non torna nell'elenco delle cose da fare");
});

// ── e il secondo requisito: l'ordine da solo non basta ───────────────────────

test("«incolla questo:» col materiale subito sotto NON è il difetto: l'ordine e la cosa sono insieme", () => {
  assert.deepEqual(cardSenzaMateriale(cardCon("**Se va bene:** incolla questo nel file dei permessi:\n\n```\nuna riga\n```\n")), []);
});

test("«incollalo, è in quel file» È il difetto: l'ordine qui, la cosa là", () => {
  const fuori = cardSenzaMateriale(cardCon("**Se va bene:** sostituisci le due righe con l'elenco che ti ho preparato. È in `consegne/sicurezza/2026-07-29-permessi.md`, pronto da incollare."));
  assert.equal(fuori.length, 1);
});

test("un ordine SENZA nessun file citato non è il difetto: non c'è nessun «altrove» da cui prendere", () => {
  // Questa prova esiste perché la mutazione sul secondo requisito lasciava tutto verde: cioè
  // `ALTROVE` non era difeso da niente e potevo toglierlo senza che nessuno se ne accorgesse.
  // Il difetto è «l'ordine qui, la cosa là»: senza un là, è solo una richiesta diretta.
  assert.deepEqual(cardSenzaMateriale(cardCon("**Se va bene:** incolla qui sotto la partita IVA e te la scrivo io nell'informativa.")), []);
});
