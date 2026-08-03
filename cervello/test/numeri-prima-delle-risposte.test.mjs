#!/usr/bin/env node
// 🧪 SE NICOLA NUMERA LE DOMANDE, I NUMERI VENGONO DOPO (AR-512 e AR-513).
//
// Nicola, 3/8: «come fai in modo che non ti dimentichi mai di quel blocco? cosa ti serve, un
// misuratore, un cancello, o cosa?». La risposta onesta era: né l'uno né l'altro da soli, perché il
// problema non è la memoria ma la STRUTTURA. Misurato sulla sua sessione: le quattro risposte
// mancavano in 11 messaggi lunghi su 20, ma fra le risposte a domande numerate mancavano in 6 su 8.
// Quando lui scrive «1) … 2) … 3)», la mia risposta parte da «1)» e i blocchi non trovano posto.
//
// Le prove qui sotto tengono in piedi i due pezzi della cura:
//   ① il freno cambia forma — una risposta numerata pretende i blocchi SOPRA il primo numero, e li
//     pretende anche se il messaggio è corto (prima la regola scattava solo sui testi lunghi);
//   ③ il contatore misura l'abitudine nel tempo, perché un freno da solo non sa dire se sto
//     migliorando o se sto solo imparando a passarlo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { misura, indiceDellaPrimaRispostaNumerata, COPERTURA, BLOCCHI } from "../si-capisce.mjs";
import { conta, daMisurare, verdetto, trascrizioniRecenti } from "../conta-blocco-mancante.mjs";

const tipi = (t) => misura(t).problemi.map((p) => p.tipo);

const QUATTRO = ["In parole semplici", "Ho fatto la cosa.", "Cosa cambia per te", "Cambia questo.", "Cosa devi fare", "Niente.", "Cosa non ho verificato", "Il resto."];

// ── ① Il freno ────────────────────────────────────────────────────────────────────────────────

test("una risposta che attacca col «1)» e mette i blocchi dopo viene fermata", () => {
  const t = [...["1) La prima cosa che mi hai chiesto è fatta.", "2) La seconda no."], ...QUATTRO].join("\n");
  const p = misura(t).problemi.filter((x) => x.tipo === "risposte-prima-dei-blocchi");
  assert.equal(p.length, BLOCCHI.length, "tutti e quattro i blocchi sono finiti sotto i numeri");
  assert.ok(p[0].dico.includes("DOPO il primo punto numerato"));
});

test("gli stessi contenuti nell'ordine giusto passano", () => {
  const t = [...QUATTRO, "", "1) La prima cosa che mi hai chiesto è fatta.", "2) La seconda no."].join("\n");
  assert.ok(!tipi(t).includes("risposte-prima-dei-blocchi"), "blocchi sopra, numeri sotto: è la forma chiesta");
  assert.ok(!tipi(t).includes("manca-una-risposta"), "i quattro blocchi ci sono tutti");
});

test("una risposta numerata SENZA blocchi viene fermata anche se è corta", () => {
  // Prima di AR-512 questa passava: la regola dei quattro blocchi scattava solo sui testi lunghi, e
  // una risposta a due domande sta in sei righe. È esattamente il buco da cui il blocco spariva.
  const t = ["1) Fatto, il controllo è verde.", "2) Quell'altro l'ho lasciato indietro."].join("\n");
  const mancanti = misura(t).problemi.filter((x) => x.tipo === "manca-una-risposta");
  assert.equal(mancanti.length, BLOCCHI.length, "una risposta numerata pretende le quattro risposte, corta o lunga");
});

test("un elenco che non risponde a domande numerate non viene toccato", () => {
  // Il controllo deve restare stretto: un «3)» solo, o un numero in mezzo alla frase, non sono
  // risposte numerate. Un controllo che accusa a torto viene spento — è la storia di AR-490 e AR-493.
  assert.equal(indiceDellaPrimaRispostaNumerata(["nel 2026 ho fatto 3) cose"]), -1, "un numero in mezzo non attacca la riga");
  assert.equal(indiceDellaPrimaRispostaNumerata(["3) la terza cosa", "4) la quarta"]), -1, "senza il «1)» sopra è un frammento");
  assert.equal(indiceDellaPrimaRispostaNumerata(["1) una cosa sola"]), -1, "un punto solo non è un elenco di risposte");
  assert.equal(indiceDellaPrimaRispostaNumerata(["1) prima", "2) seconda"]), 0);
  assert.equal(indiceDellaPrimaRispostaNumerata(["premessa", "**1)** prima", "**2)** seconda"]), 1, "il grassetto non nasconde il numero");
});

test("il tipo nuovo dichiara cosa NON vede, come tutti gli altri", () => {
  const c = COPERTURA["risposte-prima-dei-blocchi"];
  assert.ok(c && c.unita && c.cieco, "ogni misura dichiara unità e zona cieca (Regola 0-ter)");
  assert.match(c.cieco, /senza numeri/, "il caso cieco vero: domande poste senza numerarle");
});

// ── ③ Il contatore ────────────────────────────────────────────────────────────────────────────

test("conta il blocco mancante solo sui messaggi che lo pretendevano", () => {
  const corto = "Fatto, è verde.";
  const numerato = "1) Sì.\n2) No.";
  assert.equal(daMisurare(corto), false, "su un messaggio di tre parole il blocco non va: contarlo sarebbe un'accusa falsa");
  assert.equal(daMisurare(numerato), true, "una risposta numerata lo pretende");
  const c = conta([corto, numerato, QUATTRO.join("\n") + "\n1) Sì.\n2) No."]);
  assert.equal(c.misurati, 2, "il messaggio corto non entra nel conto");
  assert.equal(c.mancanze["Cosa cambia per te"], 1, "manca in uno solo dei due misurati");
  assert.equal(c.quota, 50);
});

test("il tetto è una quota e non risale", () => {
  assert.equal(verdetto({ conto: { quota: 45, peggiore: "Cosa cambia per te" }, tetto: 45 }).rotto, false);
  assert.equal(verdetto({ conto: { quota: 46, peggiore: "Cosa cambia per te" }, tetto: 45 }).rotto, true, "una dimenticanza in più deve diventare rossa");
  const sceso = verdetto({ conto: { quota: 20, peggiore: "Cosa cambia per te" }, tetto: 45 });
  assert.equal(sceso.rotto, false);
  assert.match(sceso.righe[0], /abbassa il tetto/, "quando scende, lo dice");
});

test("senza messaggi da misurare la quota è nulla, non zero", () => {
  const c = conta(["ok", "fatto"]);
  assert.equal(c.misurati, 0);
  assert.equal(c.quota, null, "«nessun messaggio» non è «zero dimenticanze» (cieco non è verde)");
  assert.equal(verdetto({ conto: c, tetto: 10 }).rotto, false, "su nulla non si accusa nessuno");
});

test("i file scartati si contano: il recinto .jsonl è misurato, non dedotto", () => {
  // `perimetro-dedotto-non-misurato`: un recinto dedotto dagli esempi nasce verde e resta verde,
  // perché fuori dal recinto non guarda. Qui se il formato cambiasse il referto lo direbbe.
  const r = trascrizioniRecenti([], 7);
  assert.deepEqual(r, { presi: [], visti: 0, scartati: {} });
  assert.ok("scartati" in r, "il conto di ciò che lascio fuori fa parte del referto, non è un dettaglio");
});
