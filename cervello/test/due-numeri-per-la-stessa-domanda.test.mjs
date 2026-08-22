#!/usr/bin/env node
// 🧪 «COME STO?» — un numero solo, e se non c'è si dice.
//
// Due difetti, una malattia: un voto che la Cabina mostra a Nicola senza dire di che metro è, e un
// buco nei dati che si presenta come un giudizio.
//
//   AR-131  il lower-bound di Wilson è calcolato dal 3/7 e la Cabina non l'ha mai mostrato:
//           disegnava la barra sul punteggio grezzo. Su tre esiti azzeccati su tre quella barra è
//           VERDE PIENA (100%) mentre la confidenza vera è 38% — il massimo della fiducia proprio
//           dove ce n'è meno, nella riga che serve a decidere quanta autonomia lasciare.
//
//   AR-175  la quinta voce della pagella faceva `Number(voto_salute) || 0`: un voto che nessuno ha
//           misurato usciva «0/100», con `cieco: false`. Cioè una bocciatura al posto di un buco.
//
// ⚠️ COSA NON HO FATTO, E PERCHÉ. AR-175 chiedeva di passare la voce al voto onesto (`voto_pieno`).
// Verificato prima di eseguire: `voto_pieno` vale 0 in TUTTI E 90 gli snapshot della serie — non è
// mai stato popolato. Passarci sopra avrebbe mostrato «0/100» come se fosse un giudizio: una bugia
// sostituita con una peggiore. Quella clausola resta aperta e dichiarata sulla scheda.

import { test } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");

const { barraConfidenza } = await import(join(REPO, "pannello/src/lib/confidenza-calibrazione.ts"));
const { voceSalute } = await import(join(REPO, "cervello/pagella-intelligenza.mjs"));

// ── AR-131 · la barra dice la confidenza, non la fortuna ─────────────────────────────────────────

test("AR-131 · il caso che ha rotto: 3 su 3 non è una barra verde piena", () => {
  // I numeri veri della scheda: punteggio grezzo 1.00, lower_bound 0.38.
  const b = barraConfidenza({ previsioni: 3, azzeccate: 3, punteggio: 1.0, lower_bound: 0.38 });
  assert.equal(b.valore, 0.38, "la barra si disegna sulla CONFIDENZA: prima usava 1.0");
  assert.notEqual(b.valore, 1.0, "se questo torna 1.0, AR-131 è tornato");
  assert.equal(b.divergente, true, "grezzo e confidenza raccontano due storie: va detto");
  assert.match(b.etichetta, /38%/);
  assert.match(b.etichetta, /100%/, "si mostrano ENTRAMBI, o si nasconde il confronto che spiega tutto");
});

test("AR-131 · lo stesso 100% su un campione serio NON viene punito", () => {
  const b = barraConfidenza({ previsioni: 20, azzeccate: 20, punteggio: 1.0, lower_bound: 0.87 });
  assert.ok(b.valore > 0.8, "venti su venti è fiducia vera e deve vedersi");
  assert.equal(b.divergente, false, "qui i due numeri dicono la stessa cosa: niente rumore");
});

test("AR-131 · «nessuna previsione» non è uno zero, ed è la differenza che conta", () => {
  const vuoto = barraConfidenza({ previsioni: 0, azzeccate: 0, punteggio: 0 });
  assert.equal(vuoto.valore, null, "zero direbbe «ha sbagliato tutto»: è un'altra cosa");
  assert.equal(vuoto.cieco, true);

  const zeroVero = barraConfidenza({ previsioni: 5, azzeccate: 0, punteggio: 0, lower_bound: 0 });
  assert.equal(zeroVero.valore, 0, "chi ha provato cinque volte e sbagliato sempre, invece, vale zero");
  assert.equal(zeroVero.cieco, false);
});

test("AR-131 · se il lower-bound manca NON si ripiega in silenzio sul grezzo", () => {
  // Ripiegare in silenzio È il difetto: la Cabina mostrerebbe di nuovo la proporzione grezza
  // spacciandola per confidenza, e nessuno se ne accorgerebbe.
  const b = barraConfidenza({ previsioni: 4, azzeccate: 4, punteggio: 1.0 });
  assert.equal(b.cieco, true, "un campo che manca si dichiara");
  assert.match(b.etichetta, /non calcolata/);
});

test("AR-131 · il type della Cabina NOMINA lower_bound, o il campo non è mostrabile", () => {
  // Era il primo pezzo del difetto, e il più silenzioso: il campo esisteva nel JSON dal 3/7 e il
  // type non lo dichiarava, quindi la Cabina non poteva mostrarlo nemmeno volendo.
  const src = readFileSync(join(REPO, "pannello/src/components/AutoCoscienza.tsx"), "utf8");
  assert.match(src, /type Calibrazione[^\n]*lower_bound/, "il type deve dichiararlo");
  assert.match(src, /barra\(barraConfidenza\(r\)\.valore/, "e la barra deve disegnarsi su quello");
});

// ── AR-175 · un voto non misurato non è una bocciatura ───────────────────────────────────────────

test("un voto MAI MISURATO non esce come bocciatura (il metro vero di AR-175 resta da scegliere)", () => {
  const v = voceSalute({ data: "2026-08-21" }, { salute_min: 80 });
  assert.equal(v.valore, null, "prima era 0: un buco nei dati travestito da giudizio");
  assert.equal(v.cieco, true, "e con `cieco: false`, cioè indistinguibile da una misura vera");
  assert.match(v.etichetta, /non misurato/);
});

test("uno zero MISURATO resta uno zero: ⚪ non è una scusa", () => {
  const v = voceSalute({ voto_salute: 0, data: "2026-08-21" }, { salute_min: 80 });
  assert.equal(v.valore, 0);
  assert.equal(v.cieco, false, "senza questo caso, la cura comprerebbe il bianco su ogni bocciatura");
  assert.equal(v.ok, false);
});

test("un voto vero passa dritto, sopra e sotto la soglia", () => {
  assert.equal(voceSalute({ voto_salute: 4, data: "x" }, { salute_min: 80 }).ok, false);
  assert.equal(voceSalute({ voto_salute: 91, data: "x" }, { salute_min: 80 }).ok, true);
  assert.equal(voceSalute({ voto_salute: 91, data: "x" }, { salute_min: 80 }).cieco, false);
});
