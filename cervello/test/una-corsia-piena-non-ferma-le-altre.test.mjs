#!/usr/bin/env node
// 🧪 LE CORSIE DELLA BOTTEGA — un negozio in loop non ferma gli altri quaranta.
//
// È la prova numero 3 delle sette del collaudo finale dell'architettura: «un negozio che va in loop
// non rallenta gli altri». E la ragione per cui la coda della BOTTEGA non può essere una coda in
// ordine d'arrivo: con quaranta negozi su una macchina sola, basta che uno sbagli — trenta lavori
// insieme, o uno che non finisce mai — e i trentanove che hanno pagato il canone aspettano.
//
// Tutti i negozi qui sono finti, e le funzioni sotto misura non hanno orologio: stesso stato,
// stessa risposta. Un turno che dipende dall'ora non si può provare, e quello che non si prova si
// scopre in produzione.

import { test } from "node:test";
import assert from "node:assert/strict";
import { FRAZIONE_AVVISO, daDopoIlUltimo, prossimoLavoro, statoCorsia, statoSpesa } from "../bottega/corsie.mjs";

const A = "forno-a";
const B = "salumeria-b";
const C = "fioraio-c";
const corsia = (negozioId, extra = {}) => ({ negozioId, quota: 1, tetto: 100, speso: 0, ...extra });
const lav = (negozioId, n) => ({ negozioId, id: `${negozioId}-${n}` });

// ─────────────────────────── ⑥ il tetto di spesa ───────────────────────────

test("sotto metà tetto si lavora e non si avvisa", () => {
  const s = statoSpesa({ speso: 10, tetto: 100 });
  assert.equal(s.stato, "ok");
  assert.equal(s.puoLavorare, true);
});

test("a metà tetto si avvisa, ma si lavora ancora", () => {
  const s = statoSpesa({ speso: 50, tetto: 100 });
  assert.equal(s.stato, "avviso");
  assert.equal(s.puoLavorare, true, "l'avviso serve a non far arrivare lo stop di sorpresa, non a fermare");
  assert.equal(s.frazione, FRAZIONE_AVVISO);
});

test("al tetto si smette", () => {
  assert.equal(statoSpesa({ speso: 100, tetto: 100 }).puoLavorare, false);
  assert.equal(statoSpesa({ speso: 101, tetto: 100 }).puoLavorare, false);
});

test("un tetto che non c'è NON è un tetto infinito", () => {
  for (const senza of [{ speso: 5 }, { speso: 5, tetto: null }, { speso: 5, tetto: 0 }, { speso: 5, tetto: -1 }]) {
    const s = statoSpesa(senza);
    assert.equal(s.puoLavorare, false, "meglio un negozio fermo che una bolletta senza fondo");
    assert.match(s.motivo, /tetto di spesa/);
  }
});

test("lo stop dice il conto, non solo che si è fermato", () => {
  assert.match(statoSpesa({ speso: 120, tetto: 100 }).motivo, /120 su 100/);
});

// ─────────────────────────── ③ la corsia di un negozio ───────────────────────────

test("una corsia con la quota piena non prende altro", () => {
  const c = statoCorsia(corsia(A, { quota: 2 }), { inCorso: 2 });
  assert.equal(c.puoLavorare, false);
  assert.match(c.motivo, /quota piena: 2 lavori in corso su 2/);
});

test("l'interruttore spento ferma la corsia prima di ogni altra domanda", () => {
  const c = statoCorsia(corsia(A, { interruttore: "spento", tetto: null }));
  assert.equal(c.puoLavorare, false);
  assert.equal(c.motivo, "interruttore spento", "il motivo dev'essere quello vero, non il primo che si incontra dopo");
});

test("una corsia ferma dice sempre perché", () => {
  for (const c of [statoCorsia({}), statoCorsia(corsia(A, { tetto: null })), statoCorsia(corsia(A), { inCorso: 5 })]) {
    assert.equal(c.puoLavorare, false);
    assert.ok(c.motivo.length > 0, "una corsia ferma senza motivo è la chiamata di assistenza del lunedì mattina");
  }
});

// ─────────────────────────── il turno ───────────────────────────

test("LA PROVA DEL COLLAUDO: un negozio che riempie la coda non ferma gli altri", () => {
  // Il forno mette dentro trenta lavori. La salumeria ne mette uno, per ultimo.
  const coda = [...Array.from({ length: 30 }, (_, i) => lav(A, i)), lav(B, 0)];
  const negozi = [corsia(A), corsia(B)];

  // Primo giro: parte il forno, che è il primo arrivato.
  const primo = prossimoLavoro({ coda, negozi, inCorso: {} });
  assert.equal(primo.negozioId, A);

  // Secondo giro, col forno che sta già lavorando: tocca alla salumeria. In ordine d'arrivo avrebbe
  // aspettato trenta lavori.
  const secondo = prossimoLavoro({ coda, negozi, inCorso: { [A]: 1 }, ultimo: A });
  assert.equal(secondo.negozioId, B, "il ventinovesimo lavoro del forno non deve passare davanti al primo della salumeria");
  assert.equal(secondo.lavoro.id, `${B}-0`);
});

test("il giro riparte da DOPO l'ultimo servito, non dal primo della lista", () => {
  const coda = [lav(A, 0), lav(B, 0), lav(C, 0)];
  const negozi = [corsia(A), corsia(B), corsia(C)];
  assert.equal(prossimoLavoro({ coda, negozi, ultimo: A }).negozioId, B);
  assert.equal(prossimoLavoro({ coda, negozi, ultimo: B }).negozioId, C);
  assert.equal(prossimoLavoro({ coda, negozi, ultimo: C }).negozioId, A, "dopo l'ultimo si ricomincia");
});

test("daDopoIlUltimo ruota, e con un negozio che non c'è più riparte dal primo", () => {
  assert.deepEqual(daDopoIlUltimo([A, B, C], A), [B, C, A]);
  assert.deepEqual(daDopoIlUltimo([A, B, C], "sparito"), [A, B, C]);
  assert.deepEqual(daDopoIlUltimo([], A), []);
});

test("dentro la corsia di un negozio vale l'ordine d'arrivo", () => {
  const coda = [lav(A, 0), lav(A, 1)];
  assert.equal(prossimoLavoro({ coda, negozi: [corsia(A)] }).lavoro.id, `${A}-0`);
});

test("una corsia ferma viene saltata e il lavoro va al negozio dopo", () => {
  const coda = [lav(A, 0), lav(B, 0)];
  const negozi = [corsia(A, { speso: 100 }), corsia(B)];
  const r = prossimoLavoro({ coda, negozi });
  assert.equal(r.negozioId, B, "il forno ha finito il tetto: il lavoro passa alla salumeria");
  assert.ok(r.fermi.some((f) => f.negozioId === A && /tetto finito/.test(f.motivo)), "e chi è fermo resta scritto");
});

test("i lavori di un negozio spento non partono, nemmeno se sono i soli in coda", () => {
  const r = prossimoLavoro({ coda: [lav(A, 0)], negozi: [corsia(A, { interruttore: "spento" })] });
  assert.equal(r.lavoro, null);
  assert.match(r.motivo, /interruttore spento/);
});

test("quando non parte niente, il verdetto dice PERCHÉ — e il motivo cambia col caso", () => {
  assert.match(prossimoLavoro({ coda: [], negozi: [corsia(A)] }).motivo, /coda è vuota/);
  assert.match(prossimoLavoro({ coda: [lav(A, 0)], negozi: [] }).motivo, /nessuna corsia dichiarata/);
  assert.match(prossimoLavoro({ coda: [lav(A, 0)], negozi: [corsia(B)] }).motivo, /non hanno lavori in coda/);
  assert.match(prossimoLavoro({ coda: [lav(A, 0)], negozi: [corsia(A, { speso: 100 })] }).motivo, /tutte le corsie sono ferme/);
});

test("un lavoro della coda grezza porta il negozio col nome del database", () => {
  const r = prossimoLavoro({ coda: [{ negozio_id: A, id: "x" }], negozi: [corsia(A)] });
  assert.equal(r.negozioId, A, "il turno deve leggere anche le righe che vengono dalla tabella");
});

test("un lavoro senza negozio non viene preso da nessuno", () => {
  const r = prossimoLavoro({ coda: [{ id: "orfano" }], negozi: [corsia(A)] });
  assert.equal(r.lavoro, null, "un lavoro orfano non deve essere adottato dalla prima corsia libera");
});

test("stesso stato, stessa risposta: nel turno non c'è nessun orologio", () => {
  const stato = { coda: [lav(A, 0), lav(B, 0)], negozi: [corsia(A), corsia(B)], ultimo: A };
  const a = prossimoLavoro(stato);
  const b = prossimoLavoro(stato);
  assert.deepEqual(a.lavoro, b.lavoro);
  assert.equal(a.negozioId, b.negozioId);
});
