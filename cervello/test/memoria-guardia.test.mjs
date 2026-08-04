#!/usr/bin/env node
// 🧪 Le prove della MEMORIA DELLA GUARDIA (cervello/memoria-guardia.mjs).

import { test } from "node:test";
import assert from "node:assert/strict";
import { riassuntoSessione, aggiungiAlloStorico, bustaApertura, consegnaDiContesto, MAX_SESSIONI } from "../memoria-guardia.mjs";

const battito = {
  scatto: 7,
  viste: {
    "malattia-nuova|cervello/a.mjs|riga con la malattia #": { n: 3, scatto: 7, gravita: "grave", file: "cervello/a.mjs", cosa: "malattia x" },
    "gate-orfano|cervello/b.mjs|gate non esiste": { n: 1, scatto: 2, gravita: "grave", file: "cervello/b.mjs", cosa: "gate y" },
    "esenzione-aggiunta|cervello/c.mjs|1 percorso": { n: 1, scatto: 7, gravita: "media", file: "cervello/c.mjs", cosa: "esenzione z" },
  },
};

// ── il riassunto ─────────────────────────────────────────────────────────────

test("«mai risolte» sono solo quelle ancora vive all'ultimo scatto, non tutte quelle mai viste", () => {
  const r = riassuntoSessione(battito, "2026-08-04T10:00:00Z");
  assert.equal(r.mai_risolte.length, 1, "quella dello scatto 2 l'ho sistemata mentre lavoravo: contarla punirebbe il comportamento giusto");
  assert.equal(r.mai_risolte[0].file, "cervello/a.mjs");
  assert.equal(r.mai_risolte[0].ripetuta, 3);
});

test("le medie non entrano fra le mai risolte: il debito inestinguibile si impara a ignorare in blocco", () => {
  const r = riassuntoSessione(battito);
  assert.ok(!r.mai_risolte.some((v) => v.file === "cervello/c.mjs"));
});

test("il conto per classe c'è: è la domanda da cui si capisce quale malattia introduco più spesso", () => {
  const r = riassuntoSessione(battito);
  assert.equal(r.per_classe["malattia-nuova"], 1);
  assert.equal(r.per_classe["gate-orfano"], 1);
  assert.equal(r.voci, 3);
});

test("senza battito non c'è sessione da archiviare: è diverso da «sessione senza voci»", () => {
  assert.equal(riassuntoSessione(null), null);
  assert.equal(riassuntoSessione("boh"), null);
});

// ── lo storico ───────────────────────────────────────────────────────────────

test("lo storico si pota in coda: una memoria che non si può più aprire è un archivio", () => {
  const tante = Array.from({ length: MAX_SESSIONI + 10 }, (_, i) => ({ quando: `s${i}` }));
  const s = aggiungiAlloStorico({ sessioni: tante }, { quando: "ultima" });
  assert.equal(s.sessioni.length, MAX_SESSIONI);
  assert.equal(s.sessioni[s.sessioni.length - 1].quando, "ultima", "la più recente non si pota mai");
});

test("archiviare niente non cancella lo storico che c'è già", () => {
  const s = aggiungiAlloStorico({ sessioni: [{ quando: "vecchia" }] }, null);
  assert.equal(s.sessioni.length, 1);
});

// ── l'apertura ───────────────────────────────────────────────────────────────

test("LA REGOLA CHE CONTA: le voci gravi sopravvivono alla morte della copia", () => {
  // È il difetto per cui questo file esiste: il battito muore col container, e ogni sessione cloud
  // ripartiva senza sapere cosa era rimasto aperto.
  const storico = { sessioni: [{ quando: "ieri", mai_risolte: [{ classe: "malattia-nuova", file: "cervello/a.mjs", cosa: "malattia x", ripetuta: 3 }] }] };
  const testo = JSON.parse(bustaApertura(storico)).hookSpecificOutput.additionalContext;
  assert.match(testo, /cervello\/a\.mjs/);
  assert.match(testo, /ripetuta 3 volte/);
  assert.match(testo, /ieri/, "chi legge deve sapere QUANDO, o crede che sia roba di adesso");
});

test("una sessione chiusa pulita non dice niente all'avvio: il rumore all'avvio è il più costoso", () => {
  assert.equal(bustaApertura({ sessioni: [{ quando: "ieri", mai_risolte: [] }] }), null);
  assert.equal(bustaApertura({}), null);
  assert.equal(bustaApertura({ sessioni: [] }), null);
});

test("si guarda l'ULTIMA sessione, non la somma di tutte: il debito vecchio ha già i suoi registri", () => {
  const storico = {
    sessioni: [
      { quando: "vecchia", mai_risolte: [{ classe: "x", file: "vecchio.mjs", cosa: "roba vecchia" }] },
      { quando: "ieri", mai_risolte: [] },
    ],
  };
  assert.equal(bustaApertura(storico), null);
});

// ── la consegna prima della compressione ─────────────────────────────────────

test("la consegna porta l'intento e le voci vive: è quello che il contesto sta per dimenticare", () => {
  const c = consegnaDiContesto({ intento: { intento: "creare gli hook" }, battito, file: ["a.mjs"] });
  assert.equal(c.intento, "creare gli hook");
  assert.equal(c.vive.length, 1);
  assert.equal(c.vive[0].file, "cervello/a.mjs");
});

test("senza intento registrato la consegna non ne inventa uno", () => {
  assert.equal(consegnaDiContesto({ battito }).intento, null);
});
