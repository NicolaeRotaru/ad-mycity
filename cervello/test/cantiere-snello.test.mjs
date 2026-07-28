#!/usr/bin/env node
// AR-250 — la Cabina spedisce e disegna cose che nessuno guarda.
//
// Misurato il 28/7 sul cantiere vero: `cantiere-difetti.json` è **607.409 byte** per 271 difetti, e la
// scheda Radiografia lo riscarica **ogni 30 secondi**, sul telefono. Dentro ci sono 135 difetti chiusi
// (283.571 byte) che a video sono un muro di righe piatte senza modo di richiuderlo — sotto la lista
// che serve davvero. E dei 136 aperti viaggiano campi che nessuna riga disegna.
//
// Dopo la cura: **607.409 → 301.210 byte, il 50% in meno a ogni ricarica.**
//
// ── Una correzione al difetto stesso, prima di ripararlo ────────────────────
//
// AR-250 diceva «dei chiusi manda solo il conteggio, l'elenco completo non è a video». Guardando il
// componente, quell'elenco **è** a video. Mandare solo un numero avrebbe svuotato una sezione che
// Nicola usa: la scheda del difetto è un indizio, non una specifica (come-riparo ②).
//
// Si esegue la composizione su un cantiere finto, con `--experimental-strip-types` per importare il
// modulo TypeScript senza compilarlo.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const MOD = join(REPO, "pannello/src/lib/cantiere-snello.ts");
const { CAMPI_CHIUSO, cantiereSnello, eChiuso } = await import(MOD);

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};

const peso = (o) => Buffer.byteLength(JSON.stringify(o));

prova("il caso che ha rotto: di un difetto chiuso viaggiano solo i campi che la riga disegna", () => {
  const grasso = {
    id: "AR-999", titolo: "un titolo", stato: "chiuso", chiuso_il: "2026-07-28 10:00",
    fix_proposto: "x".repeat(2000), causa_radice: "y".repeat(1500), nota_fix: "z".repeat(800),
    verifica: { comando: "node cervello/qualcosa.mjs" }, dimensione: "una-dimensione",
  };
  const out = cantiereSnello({ difetti: [grasso] });
  const [voce] = out.difetti;
  assert.deepEqual(Object.keys(voce).sort(), [...CAMPI_CHIUSO, "stato"].sort());
  assert.ok(peso(voce) < peso(grasso) / 20, `la voce chiusa deve dimagrire davvero: ${peso(voce)} vs ${peso(grasso)}`);
});

prova("di un difetto APERTO restano i campi che la scheda legge, non tutto l'oggetto", () => {
  const aperto = { id: "AR-1", titolo: "t", stato: "aperto", gravita: "grave", fix_proposto: "come si ripara", verifica: { comando: "node x.mjs" }, roba_interna: "x".repeat(500) };
  const [voce] = cantiereSnello({ difetti: [aperto] }).difetti;
  assert.equal(voce.fix_proposto, "come si ripara", "il fix è a video: resta");
  assert.equal(voce.verifica, undefined, "la verifica NON è a video: non viaggia");
  assert.equal(voce.roba_interna, undefined, "e nemmeno i campi che nessuno mostra");
});

prova("i totali sono quelli VERI, anche quando la finestra è più piccola", () => {
  // Un elenco troncato senza il totale è lo stesso difetto visto da un'altra angolazione: la Cabina
  // mostrerebbe 40 chiusi e Nicola crederebbe che siano tutti.
  const difetti = [
    ...Array.from({ length: 7 }, (_, i) => ({ id: `A${i}`, stato: "aperto", titolo: "a" })),
    ...Array.from({ length: 60 }, (_, i) => ({ id: `C${i}`, stato: "chiuso", titolo: "c", chiuso_il: `2026-07-${String((i % 28) + 1).padStart(2, "0")} 10:00` })),
  ];
  const out = cantiereSnello({ difetti }, { maxChiusi: 40 });
  assert.equal(out.meta.aperti, 7);
  assert.equal(out.meta.chiusi, 60, "il totale non è il numero di righe mandate");
  assert.equal(out.troncato.chiusi_mostrati, 40);
  assert.equal(out.troncato.chiusi_totali, 60);
  assert.equal(out.difetti.filter((d) => d.stato === "chiuso").length, 40);
  assert.equal(out.difetti.filter((d) => d.stato !== "chiuso").length, 7, "gli aperti non si troncano MAI: sono il lavoro");
});

prova("dei chiusi si mandano i più RECENTI, e chi non ha data non salta la fila", () => {
  const difetti = [
    { id: "vecchio", stato: "chiuso", chiuso_il: "2026-01-01 10:00" },
    { id: "senza-data", stato: "chiuso" },
    { id: "nuovo", stato: "chiuso", chiuso_il: "2026-07-28 10:00" },
  ];
  const ids = cantiereSnello({ difetti }, { maxChiusi: 2 }).difetti.map((d) => d.id);
  assert.deepEqual(ids, ["nuovo", "vecchio"], "ordine per data di chiusura, i senza-data in fondo");
});

prova("un cantiere malformato non fa saltare la schermata", () => {
  assert.equal(cantiereSnello(null), null);
  assert.deepEqual(cantiereSnello({}).difetti, []);
  assert.deepEqual(cantiereSnello({ difetti: "non-una-lista" }).difetti, []);
  assert.deepEqual(cantiereSnello({ difetti: [null, undefined] }).difetti, []);
  assert.equal(eChiuso({ stato: "aperto" }), false);
  assert.equal(eChiuso({}), false, "senza stato non si presume chiuso: sarebbe un difetto che sparisce");
});

// ── Il guadagno vero, misurato sul cantiere di oggi ─────────────────────────

prova("sul cantiere VERO la risposta dimagrisce di almeno il 45%", () => {
  // ⚠️ La prima stima diceva 83%, ed era sbagliata: l'avevo calcolata su una lista di campi
  // INDOVINATA (8), mentre la scheda ne legge 13 — fra cui `fix_proposto` e `causa_radice`, i due
  // più grossi, che stanno nell'accordion «Dettagli tecnici» di ogni difetto aperto e vanno mandati
  // davvero. Il guadagno vero è ~50%: 607.409 → 301.210 byte. Il numero giusto è quello misurato
  // sulla lista derivata dal type, non quello che faceva un titolo migliore.
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const prima = peso(vero);
  const dopo = peso(cantiereSnello(vero));
  const risparmio = 1 - dopo / prima;
  assert.ok(risparmio >= 0.45, `atteso ≥45%, ottenuto ${Math.round(risparmio * 100)}% (${prima} → ${dopo} byte)`);
  console.log(`      # ${prima.toLocaleString()} → ${dopo.toLocaleString()} byte (−${Math.round(risparmio * 100)}%) per ogni ricarica`);
});

prova("nessun difetto APERTO si perde per strada: sono il lavoro da fare", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"), "utf8"));
  const apertiVeri = (vero.difetti || []).filter((d) => d.stato !== "chiuso");
  const out = cantiereSnello(vero);
  const apertiMandati = out.difetti.filter((d) => d.stato !== "chiuso");
  assert.equal(apertiMandati.length, apertiVeri.length);
  assert.equal(out.meta.aperti, apertiVeri.length);
  const idVeri = new Set(apertiVeri.map((d) => d.id));
  for (const d of apertiMandati) assert.ok(idVeri.has(d.id), `${d.id} non esiste nel cantiere vero`);
});

prova("la rotta compone, non inoltra più il file", () => {
  const src = readFileSync(join(REPO, "pannello/src/app/api/memoria/auto-radiografia/route.ts"), "utf8");
  assert.match(src, /cantiere: cantiereRidotto/, "la risposta porta la versione composta");
  assert.doesNotMatch(src, /NextResponse\.json\(\{ collegato: true, live, radiografia, cantiere,/, "non deve più inoltrare l'oggetto intero");
  // I totali si calcolano PRIMA di snellire: dopo, «135 chiusi» diventerebbe «40».
  assert.ok(src.indexOf("calcolaLive(radiografia, cantiere)") < src.indexOf("cantiereSnello(cantiere)"));
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
