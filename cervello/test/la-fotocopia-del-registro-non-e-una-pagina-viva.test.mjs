// La fotocopia del registro del sito, scritta dal risolutore per i riparatori, non è una pagina viva.
// Il 12/11 la prima campagna (ad-mycity#944) ha fatto diventare rossa la CI: il guardiano dei fatti trovava
// in `registro-compatto.txt` i titoli di due difetti vecchi e li prendeva per copie vecchie di un fatto.
// Il registro vero (auto-coscienza/) è esente perché è storia: la sua fotocopia lo è per la stessa ragione.
// Le schede dei riparatori, invece, restano vive.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { esente } from "../coerenza-fatti.mjs";

const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("la fotocopia del registro di una campagna è esente", () => {
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/registro-compatto.txt", []), true);
});

test("le schede dei riparatori restano vive", () => {
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/schede/R01.md", []), false);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/piano.json", []), false);
});

test("lo stesso nome fuori posto non è esente", () => {
  assert.equal(esente("consegne/audit/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/b/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/registro-compatto.txt.md", []), false);
});

test("le esenzioni di prima valgono ancora", () => {
  assert.equal(esente("MyCity-Vault/90-Memoria-AI/DECISIONI.md", []), true);
  assert.equal(esente("MyCity-Vault/90-Memoria-AI/STATO.md", []), false);
  assert.equal(esente("consegne/x.md", ["consegne/"]), true);
});

test("il guardiano vero, sul deposito di adesso, non trova copie vecchie", () => {
  // Senza la correzione questa chiamata esce 3 (incoerenze) finché la campagna del 12/11 è nel deposito.
  execFileSync("node", [join(RADICE, "cervello/coerenza-fatti.mjs"), "--sola-lettura"], { cwd: RADICE, stdio: "pipe" });
});
