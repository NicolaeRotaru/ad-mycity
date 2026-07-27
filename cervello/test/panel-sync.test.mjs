// AR-235 — le liste devono aggiornarsi anche quando non stavi guardando (node --test, nessuna rete).
//
// Il difetto, in due metà:
//  (a) il rinfresco partiva SOLO se il browser aveva visto con i propri occhi un lavoro passare a
//      «fatto». Un lavoro nato e finito mentre la scheda era in secondo piano veniva scartato dalla
//      condizione `!prima` — cioè proprio il caso in cui il rinfresco serve.
//  (b) al ritorno sulla scheda non c'era alcun ripasso: dieci caselle restavano ferme a com'erano
//      quando avevi lasciato la pagina.
//
// Qui si eseguono le funzioni VERE di pannello/src/lib/panel-sync-regole.ts. Il primo caso fallisce con la
// logica vecchia: è il metro che distingue il prima dal dopo.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const LIB = join(QUI, "..", "..", "pannello/src/lib/panel-sync-regole.ts");
const { scopesDaRinfrescare, deveRinfrescareAlRitorno, RITORNO_MIN_MS, scopesDaLavoro } = await import(LIB);

const lav = (id, stato, tipo = "giro") => ({ id, stato, tipo });

// ── (a) il lavoro nato e finito mentre non guardavi ──────────────────────────
test("il caso che ha rotto: un lavoro mai visto prima, già finito, DEVE rinfrescare", () => {
  const prima = [lav("L1", "in_corso")];
  const dopo = [lav("L1", "in_corso"), lav("L9", "fatto", "giro")];
  const scopes = scopesDaRinfrescare(prima, dopo);
  assert.ok(scopes.length > 0, "con la logica vecchia `!prima` lo scartava e la lista restava indietro");
  assert.ok(scopes.includes("memoria"));
});

test("il passaggio visto a occhio continua a funzionare", () => {
  const scopes = scopesDaRinfrescare([lav("L1", "in_corso")], [lav("L1", "fatto")]);
  assert.ok(scopes.length > 0);
});

test("un lavoro già finito nella fotografia precedente non rinfresca di nuovo", () => {
  assert.deepEqual(scopesDaRinfrescare([lav("L1", "fatto")], [lav("L1", "fatto")]), []);
});

test("un lavoro ancora in corso non rinfresca", () => {
  assert.deepEqual(scopesDaRinfrescare([lav("L1", "in_corso")], [lav("L1", "in_corso")]), []);
});

test("il primo caricamento NON scatena un rinfresco a raffica", () => {
  // Senza questa guardia, togliere `!prima` avrebbe fatto ricaricare tutto a ogni apertura della
  // pagina: un rimedio peggiore del male.
  const primoCarico = [lav("A", "fatto"), lav("B", "fatto"), lav("C", "fatto")];
  assert.deepEqual(scopesDaRinfrescare([], primoCarico), [], "nessun termine di paragone = niente da propagare");
});

test("gli scope seguono il tipo di lavoro, senza duplicati", () => {
  const dopo = [lav("X", "fatto", "esegui-azione"), lav("Y", "fatto", "esegui-azione")];
  const scopes = scopesDaRinfrescare([lav("Z", "in_corso")], dopo);
  assert.deepEqual([...new Set(scopes)], scopes, "nessuno scope ripetuto");
  for (const s of scopesDaLavoro("esegui-azione")) assert.ok(scopes.includes(s));
});

// ── (b) il ripasso al ritorno sulla scheda ───────────────────────────────────
const ORA = 1_800_000_000_000;

test("se non hai mai caricato, al ritorno si legge", () => {
  assert.equal(deveRinfrescareAlRitorno(null, ORA), true);
});

test("se sei stato via abbastanza, si rilegge", () => {
  assert.equal(deveRinfrescareAlRitorno(ORA - RITORNO_MIN_MS, ORA), true);
  assert.equal(deveRinfrescareAlRitorno(ORA - 10 * 60_000, ORA), true, "dieci minuti");
});

test("un cambio scheda di due secondi NON ricarica tutto", () => {
  // Senza soglia, ogni passaggio da un'altra app farebbe ripartire le fetch di tutte le caselle:
  // su telefono sarebbe un rinfresco continuo.
  assert.equal(deveRinfrescareAlRitorno(ORA - 2000, ORA), false);
});

test("un orologio spostato indietro non blocca il ripasso", () => {
  assert.equal(deveRinfrescareAlRitorno(ORA + 60_000, ORA), true, "nel dubbio si rilegge, non si resta fermi");
});
