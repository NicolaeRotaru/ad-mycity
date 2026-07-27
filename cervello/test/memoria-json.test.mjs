// AR-252 / AR-253 — un dato storto in memoria non deve far diventare bianca la Cabina.
//
// I due difetti sembrano diversi ma sono lo stesso: ogni schermata si riscrive il parsing dei JSON di
// memoria a mano, quindi ogni difesa nasce parziale.
//  · AR-252: il giro scrive `domande_per_nicola` come UNA FRASE invece che come elenco. Il guardiano
//    era `a?.domande_per_nicola?.length || 0` — ma `.length` è vero anche per le stringhe, mentre
//    `.map` sulle stringhe non esiste: il controllo lasciava passare esattamente ciò da cui doveva
//    difendere, e il TypeError in pieno render portava via tutta la pagina.
//  · AR-253: un `null` dentro l'elenco dei difetti e `x.stato` esplode. `|| []` difende dal campo
//    assente, non dal tipo sbagliato né dai buchi dentro la lista.
//
// Qui si eseguono le funzioni VERE di pannello/src/lib/memoria-json.ts — il lettore unico che ora usano
// tutti e quattro i punti di lettura del cantiere e i due componenti delle domande. I casi che
// contano sono quelli marcati «il caso che ha rotto»: con la logica vecchia fallivano.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const LIB = join(QUI, "..", "..", "pannello/src/lib/memoria-json.ts");
const { listaSicura, listaDaTestoOLista, listaDiTesti, sanificaListe } = await import(LIB);

/** La difesa vecchia, che qui serve da metro: è quella che lasciava passare il guasto. */
const vecchia = (v) => v?.length || 0;

// ── AR-252: la frase al posto dell'elenco ────────────────────────────────────
test("il caso che ha rotto: una frase al posto dell'elenco NON deve sembrare una lista piena", () => {
  const frase = "Serve una foto del laboratorio per la scheda del negozio";
  assert.ok(vecchia(frase) > 0, "premessa: la difesa vecchia contava 57 e apriva il blocco");
  assert.equal(listaSicura(frase).length, 0, "la difesa nuova non apre un blocco che poi esploderebbe");
});

test("una frase sciolta diventa una domanda vera, non si perde", () => {
  const out = listaDaTestoOLista("Serve la foto del laboratorio", "domanda");
  assert.deepEqual(out, [{ domanda: "Serve la foto del laboratorio" }]);
  // il componente legge `q.domanda`: da qui in poi disegna, non esplode
  assert.equal(out[0].domanda, "Serve la foto del laboratorio");
});

test("una frase vuota o di soli spazi non genera una domanda fantasma", () => {
  assert.deepEqual(listaDaTestoOLista("", "domanda"), []);
  assert.deepEqual(listaDaTestoOLista("   ", "domanda"), []);
});

test("l'elenco fatto bene passa intatto: la difesa non deve mangiare i dati buoni", () => {
  const vere = [{ domanda: "A", perche_serve: "x" }, { domanda: "B" }];
  assert.deepEqual(listaDaTestoOLista(vere, "domanda"), vere);
});

// ── AR-253: il buco dentro l'elenco ──────────────────────────────────────────
test("il caso che ha rotto: un null fra i difetti non deve arrivare al render", () => {
  const difetti = [{ id: "AR-1", stato: "aperto" }, null, { id: "AR-2", stato: "chiuso" }];
  assert.throws(
    () => difetti.filter((x) => x.stato !== "chiuso"),
    TypeError,
    "premessa: è esattamente così che la pagina del Cervello diventava bianca",
  );
  const sicuri = listaSicura(difetti);
  assert.equal(sicuri.length, 2);
  assert.doesNotThrow(() => sicuri.filter((x) => x.stato !== "chiuso"));
});

test("il campo con il tipo sbagliato torna lista vuota, non esplode", () => {
  for (const storto of [null, undefined, "una frase", 42, { difetti: [] }, true]) {
    assert.deepEqual(listaSicura(storto), [], `tipo storto: ${JSON.stringify(storto)}`);
  }
});

test("gli zeri e i false spuri se ne vanno, i dati veri restano", () => {
  assert.deepEqual(listaSicura([{ a: 1 }, null, undefined, "", false, { b: 2 }]), [{ a: 1 }, { b: 2 }]);
});

// ── liste di sole frasi (punti_ciechi, principi, preferenze_nicola) ──────────
test("una lista di frasi resta una lista di frasi", () => {
  assert.deepEqual(listaDiTesti(["uno", "due"]), ["uno", "due"]);
  assert.deepEqual(listaDiTesti("una sola"), ["una sola"]);
  assert.deepEqual(listaDiTesti(null), []);
});

// ── la sanificazione alla fonte (quella che vale per tutti i consumatori) ────
test("la route riporta al contratto tutti i campi-lista in un colpo solo", () => {
  const analisi = {
    voto_fiducia: 86,
    domande_per_nicola: "Serve la foto",           // frase invece di elenco
    errori: [{ titolo: "X" }, null],                 // buco dentro
    punti_ciechi: "Stripe non collegato",            // frase invece di elenco
  };
  sanificaListe(analisi, { domande_per_nicola: "domanda", errori: "titolo", punti_ciechi: "", miglioramenti_prossimo_giro: "" });
  assert.deepEqual(analisi.domande_per_nicola, [{ domanda: "Serve la foto" }]);
  assert.deepEqual(analisi.errori, [{ titolo: "X" }]);
  assert.deepEqual(analisi.punti_ciechi, ["Stripe non collegato"]);
  assert.equal(analisi.voto_fiducia, 86, "i campi non-lista non si toccano");
});

test("un campo che non c'è non viene inventato", () => {
  // Importante: l'auto-analisi di oggi usa `errori_giro`/`domande_bloccanti`. Se la sanificazione
  // creasse i campi mancanti, il Pannello mostrerebbe sezioni vuote che prima non c'erano.
  const a = { voto_fiducia: 70 };
  sanificaListe(a, { domande_per_nicola: "domanda", errori: "titolo" });
  assert.deepEqual(Object.keys(a), ["voto_fiducia"], "nessun campo aggiunto dal nulla");
});

test("sanificaListe su null o su un non-oggetto non esplode", () => {
  assert.doesNotThrow(() => sanificaListe(null, { errori: "titolo" }));
  assert.doesNotThrow(() => sanificaListe("frase", { errori: "titolo" }));
  assert.doesNotThrow(() => sanificaListe(undefined, {}));
});

// ── la memoria vera di oggi ci passa dentro senza cambiare ───────────────────
test("i JSON di memoria veri non vengono alterati dalla difesa", async () => {
  const { readFileSync } = await import("node:fs");
  const base = join(QUI, "..", "..", "MyCity-Vault/90-Memoria-AI/auto-coscienza");
  const rad = JSON.parse(readFileSync(join(base, "auto-radiografia.json"), "utf8"));
  const prima = {
    dimensioni: rad.dimensioni.length,
    domande: rad.domande_per_nicola.length,
    proposte: rad.proposte_nuovi_pezzi.length,
  };
  sanificaListe(rad, { dimensioni: "nome", domande_per_nicola: "domanda", proposte_nuovi_pezzi: "cosa", pre_mortem: "scenario", benchmark_vs_migliori: "chi" });
  assert.equal(rad.dimensioni.length, prima.dimensioni, "nessuna dimensione persa");
  assert.equal(rad.domande_per_nicola.length, prima.domande, "nessuna domanda persa");
  assert.equal(rad.proposte_nuovi_pezzi.length, prima.proposte, "nessuna proposta persa");
});
