// La scheda che il risolutore scrive per un riparatore non è un allarme e non è un testo per Nicola.
// Il 12/11 la prima campagna (ad-mycity#944) ha fatto diventare rosso il cancello del lotto: le schede
// R01-R03 elencano difetti «bloccante» del registro e venivano lette come «allarme non accodato»; la R06
// come «testo difficile per Nicola». Le scrive un programma, le legge una sessione. Un allarme scritto da
// me in una consegna vera, invece, deve restare un rosso.
import { test } from "node:test";
import assert from "node:assert/strict";
import { allarmiSenzaCoda, testiIlleggibili, eSchedaRisolutore } from "../cancello-stop.mjs";

const SCHEDA = "consegne/riparazioni/2026-11-12-sito-tutto/schede/R01.md";
const ELENCO = "- `R01-001` · bloccante · deploy-sre|ogni unione su main pubblica in produzione senza aspettare la CI · .github/workflows/deploy-dopo-ci.yml\n";
// La frase lunga che il cancello ha contato davvero nella R06 del 12/11, sotto la sua intestazione.
const DIFFICILE = "## In parole semplici\n\nPer esempio la prima voce è «Il funnel conta molti meno clienti che comprano di quelli veri, perché per ogni cento clienti ne perde una parte», minore, e la sessione la ripara per prima insieme alle altre.\n";

test("la scheda del risolutore si riconosce, e solo lei", () => {
  assert.equal(eSchedaRisolutore(SCHEDA), true);
  assert.equal(eSchedaRisolutore("consegne/riparazioni/2026-11-12-sito-tutto/schede/R12.md"), true);
  assert.equal(eSchedaRisolutore("consegne/riparazioni/2026-11-12-sito-tutto/schede/K02.md"), false, "il comando schede scrive solo le schede dei riparatori");
  assert.equal(eSchedaRisolutore("consegne/riparazioni/2026-11-12-sito-tutto/REGIA.md"), false);
  assert.equal(eSchedaRisolutore("consegne/riparazioni/2026-11-12-sito-tutto/schede/note.md"), false);
  assert.equal(eSchedaRisolutore("consegne/audit/schede/R01.md"), false);
});

test("una scheda con difetti bloccanti non è un allarme non accodato", () => {
  assert.deepEqual(allarmiSenzaCoda([{ file: SCHEDA, contenuto: ELENCO }], false, []), []);
  assert.deepEqual(allarmiSenzaCoda([], false, [{ file: SCHEDA, righe: [ELENCO] }]), []);
});

test("un allarme in una consegna vera resta un rosso", () => {
  const vero = "consegne/riparazioni/2026-11-12-sito-tutto/esito.md";
  assert.deepEqual(allarmiSenzaCoda([{ file: vero, contenuto: "🔴 il sito è giù" }], false, []), [vero]);
  assert.deepEqual(allarmiSenzaCoda([{ file: "consegne/ad/nota.md", contenuto: "difetto bloccante" }], false, []), ["consegne/ad/nota.md"]);
});

test("la scheda non conta come testo per Nicola, una consegna vera sì", () => {
  assert.deepEqual(testiIlleggibili([{ file: SCHEDA, contenuto: DIFFICILE }]), []);
  const vero = "consegne/ad/2026-11-12-nota.md";
  const fuori = testiIlleggibili([{ file: vero, contenuto: DIFFICILE }]);
  assert.equal(fuori.length, 1);
  assert.equal(fuori[0].file, vero);
});
