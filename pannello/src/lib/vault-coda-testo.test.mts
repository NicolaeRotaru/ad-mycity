// Nicola 4/8 19:36: la card "Sala Operativa" mostrava l'avviso di troncamento incollato dentro il
// testo, senza andare a capo — sembrava un errore invece che una spiegazione (screenshot). Causa:
// `codaTesto` metteva l'avviso su una riga e il contenuto SUBITO dopo, un solo `\n`: nel markdown
// reso da ReactMarkdown due righe consecutive senza riga vuota restano nello stesso paragrafo.
// Qui si prova che l'avviso è ora separato dal contenuto da un blocco a sé (riga vuota + `---`).

import { test } from "node:test";
import assert from "node:assert/strict";

const { codaTesto } = await import("./vault.ts");

test("codaTesto: testo corto passa invariato, nessun avviso aggiunto", () => {
  const s = "riga corta";
  assert.equal(codaTesto(s, 100), s);
});

test("codaTesto: testo lungo ha l'avviso separato dal contenuto da una riga vuota + separatore", () => {
  const contenuto = "X".repeat(50);
  const out = codaTesto("y".repeat(10) + contenuto, 50);
  assert.match(out, /^\*…\(troncato, mostro la parte più recente\)\*\n\n---\n\n/);
  // il contenuto (le ultime `max` lettere) resta intatto dopo il separatore
  assert.ok(out.endsWith(contenuto));
});

test("codaTesto: l'avviso non è mai incollato senza riga vuota al primo carattere del contenuto", () => {
  const out = codaTesto("a".repeat(20) + "b".repeat(20), 20);
  // Nessuna sequenza ")*" seguita immediatamente da un carattere di contenuto senza `\n\n---\n\n` in mezzo.
  assert.ok(!/\)\*[^\n]/.test(out), "l'avviso non va a capo subito dopo la parentesi");
});
