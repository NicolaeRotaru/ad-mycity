// AR-282 — «Il sensore della cassa chiama cassa solo i soldi fermi su Stripe: il giorno che Nicola
// darà il numero delle spese, griderà al rosso.»
//
// La radice, al quinto perché: un KPI può nascere dentro uno script senza passare da una
// definizione condivisa — quindi la formula vive solo nel codice, nessuno la rivede, e un numero
// sbagliato PER DEFINIZIONE è indistinguibile da un numero giusto. La disponibilità del dato aveva
// deciso il KPI: cassa = «il saldo che so leggere».
//
// La regola che ne esce, e che questo file fa rispettare:
//   ⛔ UN SENSORE INCOMPLETO NON PUÒ EMETTERE UN ROSSO.
// Perché il danno vero non è l'imprecisione: è che il primo allarme rosso sul rischio numero uno
// sarebbe arrivato il giorno in cui Nicola avesse collegato il burn — insegnandogli che collegare
// un sensore fa urlare la macchina. È il modo più rapido per farne spegnere uno.
//
// 🟢 Nessuna scrittura, da nessuna parte: le funzioni provate qui sono pure e non toccano Stripe.
//
// NON-VACUITÀ (eseguita): togliendo il ramo `if (!cassa.completa) → parziale` da `statoCassa`, il
// caso «manca la banca» torna «critico» e il test diventa rosso.

import { test } from "node:test";
import assert from "node:assert/strict";
import { componentiCassa, statoCassa } from "../sensore-cassa.mjs";

test("AR-282 — la formula ha tre componenti, e i payout dovuti ai negozi si SOTTRAGGONO", () => {
  const c = componentiCassa({ stripeEur: 5000, bancaEur: 12000, payoutDovutiEur: 3000 });
  assert.equal(c.totale_eur, 14000, "i soldi dei negozi transitano da noi: non sono nostri e non fanno runway");
  assert.equal(c.completa, true);
  assert.deepEqual(c.mancanti, []);
});

test("AR-282 — con la sola Stripe la cassa è INCOMPLETA, e lo dichiara per nome", () => {
  const c = componentiCassa({ stripeEur: 5000 });
  assert.equal(c.completa, false);
  assert.deepEqual(c.mancanti.sort(), ["banca", "payout_dovuti"]);
  assert.equal(c.totale_eur, 5000, "il numero si dà lo stesso: è quello che manca che va detto");
});

test("AR-282 — IL PUNTO: con una componente mancante lo stato è «parziale», MAI «critico»", () => {
  // Cassa 900 € e burn 1000 €/mese: 0,9 mesi di runway. Con la vecchia formula sarebbe stato un
  // rosso pieno — e sarebbe stato falso, perché i soldi in banca non li stava contando nessuno.
  const c = componentiCassa({ stripeEur: 900 });
  const s = statoCassa({ cassa: c, burnEur: 1000 });
  assert.notEqual(s.stato, "critico", "un sensore incompleto che grida al rosso è il modo più rapido per farsi spegnere");
  assert.equal(s.stato, "parziale");
  assert.match(s.motivo, /banca/, "deve dire QUALE pezzo manca, non solo che è parziale");
});

test("AR-282 — con tutte e tre le componenti il rosso torna a essere possibile, ed è vero", () => {
  const c = componentiCassa({ stripeEur: 900, bancaEur: 100, payoutDovutiEur: 0 });
  const s = statoCassa({ cassa: c, burnEur: 1000 });
  assert.equal(s.stato, "critico", "misura completa e runway sotto i 3 mesi: questo rosso è reale");
  assert.equal(s.runway_mesi, 1);
});

test("AR-282 — misura completa e cassa larga: verde", () => {
  const c = componentiCassa({ stripeEur: 2000, bancaEur: 10000, payoutDovutiEur: 0 });
  assert.equal(statoCassa({ cassa: c, burnEur: 1000 }).stato, "ok");
});

test("AR-282 — senza burn non si inventa un runway: sconosciuto", () => {
  const c = componentiCassa({ stripeEur: 2000, bancaEur: 10000, payoutDovutiEur: 0 });
  const s = statoCassa({ cassa: c, burnEur: null });
  assert.equal(s.stato, "sconosciuto");
  assert.equal(s.runway_mesi, null);
});

test("AR-282 — zero euro in banca è un dato, non un dato mancante", () => {
  const c = componentiCassa({ stripeEur: 100, bancaEur: 0, payoutDovutiEur: 0 });
  assert.equal(c.completa, true, "uno zero DICHIARATO è una misura: confonderlo con «manca» rifà il difetto al contrario");
  assert.equal(c.totale_eur, 100);
});
