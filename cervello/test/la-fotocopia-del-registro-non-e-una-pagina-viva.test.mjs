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

test("la fotocopia nella cartella di un'onda è esente", () => {
  // Il 17/11 l'onda 6 ha la sua cartella (`--cartella …/onda6`) e il risolutore ci scrive la sua fotocopia:
  // la CI di ad-mycity#983 è diventata rossa sugli stessi due titoli vecchi del 12/11.
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda6/registro-compatto.txt", []), true);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda12/registro-compatto.txt", []), true);
});

test("la fotocopia nella cartella di un giro dentro un'onda è esente", () => {
  // Il 21/11 il giro 4 dell'onda 9 ha la sua cartella (`onda9/giro4`): il guardiano usciva 3 sui titoli
  // di due difetti («al lancio si paga solo in contanti», «fino a 10 km dal negozio»).
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro4/registro-compatto.txt", []), true);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro12/registro-compatto.txt", []), true);
  // Lo stesso 21/11 il giro di correzione ha due cartelle, `giro5d` per le voci delicate e `giro5m` per le altre.
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro5d/registro-compatto.txt", []), true);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro5m/registro-compatto.txt", []), true);
});

test("le schede dei riparatori restano vive", () => {
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/schede/R01.md", []), false);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/piano.json", []), false);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda6/schede/R02.md", []), false);
  assert.equal(esente("consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro4/schede/R01.md", []), false);
  // 21/11: la fotocopia della radiografia in sessioni (ricontrollo, #990) è esente, il resto della cartella no.
  assert.equal(esente("consegne/radiografia/2026-11-21-ricontrollo/registro-compatto.txt", []), true);
  assert.equal(esente("consegne/radiografia/2026-11-21-ricontrollo/piano.json", []), false);
  assert.equal(esente("consegne/radiografia/2026-11-21-ricontrollo/schede/S01.md", []), false);
});

test("lo stesso nome fuori posto non è esente", () => {
  assert.equal(esente("consegne/audit/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/b/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda6/x/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/giro4/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda9/giro4/x/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda9/giro/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda9/giro5dd/registro-compatto.txt", []), false);
  assert.equal(esente("consegne/riparazioni/a/onda9/giro5d/schede/registro-compatto.txt", []), false);
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
