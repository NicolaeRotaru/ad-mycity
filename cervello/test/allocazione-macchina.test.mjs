// AR-114 — test della dimensione MACCHINA vs BUSINESS nell'allocazione dello sforzo.
//
// Il difetto: il guardiano sapeva dire «a quale negozio è intestato questo asset», ma non «lo sforzo
// è andato al business o alla macchina stessa». Ed è lì che stava la quota dominante: al 25/7
// `consegne/tech` da solo pesava 263 file e non entrava in nessun conteggio, quindi il guardiano
// dichiarava «allocazione sana» mentre il 78% del lavoro della settimana era sulla macchina.

import { test } from "node:test";
import assert from "node:assert/strict";
import { destinazioneDi, quotaSforzo } from "../allocazione-check.mjs";

test("destinazioneDi(): il lavoro sulla macchina è riconosciuto", () => {
  // ⬇️ Il percorso che il guardiano ignorava del tutto: è il cuore di AR-114.
  assert.equal(destinazioneDi("consegne/tech/2026-07-24-pannello.md"), "macchina");
  assert.equal(destinazioneDi("cervello/autopilot.mjs"), "macchina");
  assert.equal(destinazioneDi("pannello/src/lib/store.ts"), "macchina");
  assert.equal(destinazioneDi("consegne/audit/2026-07-16-auto-radiografia.md"), "macchina");
  assert.equal(destinazioneDi("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "macchina");
  assert.equal(destinazioneDi("MyCity-Vault/07-Agenti/AGENTI.md"), "macchina");
});

test("destinazioneDi(): il lavoro sul business è riconosciuto", () => {
  assert.equal(destinazioneDi("consegne/content/post-fornaio.md"), "business");
  assert.equal(destinazioneDi("consegne/vendite/dossier.md"), "business");
  assert.equal(destinazioneDi("creativi/output/social/qr.png"), "business");
  assert.equal(destinazioneDi("MyCity-Vault/05-Soldi-Rischi/OKR-Squadra.md"), "business");
  // La memoria AI generica (STATO, DECISIONI, briefing) è diario del lavoro SULL'AZIENDA…
  assert.equal(destinazioneDi("MyCity-Vault/90-Memoria-AI/STATO.md"), "business");
  // …ma auto-coscienza resta macchina: la regola più specifica deve vincere sulla più generica.
  assert.equal(destinazioneDi("MyCity-Vault/90-Memoria-AI/auto-coscienza/pagella-intelligenza.json"), "macchina");
});

test("destinazioneDi(): ciò che non è in lista NON viene assegnato d'ufficio", () => {
  // Assegnare a caso falserebbe la quota. Dire "non lo so" e farlo vedere, no.
  assert.equal(destinazioneDi("README.md"), null);
  assert.equal(destinazioneDi("marketplace/src/app/page.tsx"), null);
  assert.equal(destinazioneDi(""), null);
  assert.equal(destinazioneDi(undefined), null);
});

test("quotaSforzo(): conta le due destinazioni e tiene fuori i non classificati", () => {
  const q = quotaSforzo([
    "cervello/a.mjs",
    "consegne/tech/b.md",
    "pannello/src/c.ts",
    "consegne/content/d.md",
    "README.md",
  ]);
  assert.equal(q.macchina, 3);
  assert.equal(q.business, 1);
  assert.equal(q.non_classificato, 1);
  assert.equal(q.totale, 5);
  // 3 su 4 CLASSIFICATI = 75%. Il non-classificato non deve diluire la quota: se contasse nel
  // denominatore, basterebbe lavorare in cartelle sconosciute per far scendere il numero.
  assert.equal(q.quota_macchina, 0.75);
});

test("quotaSforzo(): nessun file classificato ⇒ quota nulla, non zero", () => {
  const q = quotaSforzo(["README.md", "LICENSE"]);
  assert.equal(q.quota_macchina, null, "null = non misurabile; 0 direbbe 'nessun lavoro sulla macchina', che è falso");
  assert.equal(quotaSforzo([]).quota_macchina, null);
});

test("il caso reale che il guardiano non vedeva: settimana tutta sulla macchina", () => {
  // 9 file di lavoro-macchina e 1 di business: prima erano tutti invisibili e l'esito era "sano".
  const settimana = [
    ...Array.from({ length: 9 }, (_, i) => `consegne/tech/lavoro-${i}.md`),
    "consegne/vendite/unico-dossier.md",
  ];
  const q = quotaSforzo(settimana);
  assert.equal(q.quota_macchina, 0.9);
  assert.ok(q.quota_macchina > 0.7, "sopra la soglia: col cancello acceso sarebbe una violazione");
});
