import { test } from "node:test";
import assert from "node:assert/strict";
import { verdettoMemoriaFerma, etaTesto, MEMORIA_FERMA_TETTO_ORE } from "./memoria-ferma.ts";

// I numeri sono quelli VERI dell'incidente 30/7→4/8 (AR-544): battito del worker fresco,
// `memoria-ad:ultimo_push` fermo da 114 ore. Con questi ingressi la Cabina diceva «🟢 Viva».
test("l'incidente del 30/7: battito fresco + push di 114 ore fa → ferma, e «lavora ma non pubblica»", () => {
  const v = verdettoMemoriaFerma({ oreWorker: 0.02, orePush: 114 });
  assert.equal(v.ferma, true);
  assert.equal(v.macchinaLavora, true);
  assert.equal(v.oreFerma, 114);
  assert.equal(v.maiVisto, false);
});

test("push fresco → nessun allarme", () => {
  const v = verdettoMemoriaFerma({ oreWorker: 0.02, orePush: 1 });
  assert.equal(v.ferma, false);
  assert.equal(v.oreFerma, 1);
});

test("worker morto E push vecchio → l'allarme resta: il Pannello mostra comunque il passato", () => {
  const v = verdettoMemoriaFerma({ oreWorker: 48, orePush: 114 });
  assert.equal(v.ferma, true);
  assert.equal(v.macchinaLavora, false);
});

test("push mai registrato → NON è un verde: maiVisto dichiarato, ferma non inventata", () => {
  const v = verdettoMemoriaFerma({ oreWorker: 0.02, orePush: null });
  assert.equal(v.ferma, false);
  assert.equal(v.maiVisto, true);
  assert.equal(v.oreFerma, null);
});

test("il tetto è un confine vero: sotto tace, sopra scatta", () => {
  assert.equal(verdettoMemoriaFerma({ oreWorker: 0, orePush: MEMORIA_FERMA_TETTO_ORE - 0.1 }).ferma, false);
  assert.equal(verdettoMemoriaFerma({ oreWorker: 0, orePush: MEMORIA_FERMA_TETTO_ORE + 0.1 }).ferma, true);
});

test("etaTesto legge a voce: minuti, ore, giorni", () => {
  assert.equal(etaTesto(0.5), "30 minuti");
  assert.equal(etaTesto(3), "3 ore");
  assert.equal(etaTesto(114), "4 giorni e 18 ore");
  assert.equal(etaTesto(96), "4 giorni");
});
