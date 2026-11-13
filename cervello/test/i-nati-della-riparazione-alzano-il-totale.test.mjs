// I difetti nati da una riparazione entrano nel registro del sito, e il totale dichiarato sale con loro.
//
// Il conto che l'ha chiesta (13/11/2026): alle 06:06 `applica --scrivi` dell'onda 1 ha messo nel registro
// del sito 58 difetti nati, ma `meta.findings` — il totale che il referto dichiara e che fa da testimone
// al conto — è rimasto 3032 mentre l'elenco ne contava 3090. La prova «il conto del sito che dice zero»
// è diventata rossa e con lei la CI della macchina (ad-mycity#952). Uno dei 58 era anche sotto
// «legale-privacy», un'area che il registro non ha: la scheda del Pannello non sapeva come chiamarla.
//
// Queste prove passano dal codice vero che applica usa (`scriviNatiSito`) e chiudono col conto vero
// (`contoMarketplace`, `dimensioniDaDisegnare`): togliendo la correzione tornano rosse.

import test from "node:test";
import assert from "node:assert/strict";

import { scriviNatiSito } from "../riparazione-sessioni.mjs";
import { contoMarketplace, dimensioniDaDisegnare } from "../radiografia-marketplace-conti.mjs";
import { chiaveProblema } from "../referti-sito.mjs";

/** Un registro piccolo della forma vera: aree con il nome, un totale dichiarato che torna. */
function registro() {
  const problemi = [{ dimensione: "pagamenti-stripe", titolo: "il payout salta", severita: "grave", file: "lib/a.ts:1", stato: "aperto" }];
  const grezzo = {
    meta: { findings: 1, bloccanti: 0, gravi: 1, minori: 0 },
    dimensioni: [
      { chiave: "pagamenti-stripe", nome: "Pagamenti", fonte: "marketplace" },
      { chiave: "privacy-legale", nome: "Privacy e legale", fonte: "marketplace" },
      { chiave: "qa-flussi", nome: "Flussi critici", fonte: "marketplace" },
    ],
    problemi,
  };
  const perChiave = new Map(problemi.map((p) => [chiaveProblema(p), p]));
  return { reg: { percorso: "/non-si-scrive", grezzo, elenco: problemi }, perChiave };
}

const NATI = [
  { sessione: "C01", titolo: "Il bonifico parte due volte se si preme due volte", dimensione: "pagamenti-stripe", severita: "grave", file: "lib/a.ts:9" },
  { sessione: "R07", titolo: "La cookie policy non nomina YouTube", dimensione: "legale-privacy", severita: "minore", file: "app/privacy/page.tsx:1" },
  { sessione: "C01", titolo: "Un'area inventata dal riparatore", dimensione: "un-area-che-non-esiste", severita: "bloccante", file: "lib/b.ts:2" },
  { sessione: "R11", titolo: "La falla dell'IBAN", dimensione: "sicurezza-auth", severita: "grave", file: "lib/c.ts:3", riservato: true },
];

test("① i nati alzano il totale dichiarato, uno per uno e per gravità, e il conto torna", () => {
  const { reg, perChiave } = registro();
  const r = scriviNatiSito(reg, NATI, { campagna: "prova", perChiave });
  assert.equal(r.scritti.length, 3, "tre nati scritti: il riservato resta fuori dal deposito");
  assert.equal(r.riservati.length, 1);
  assert.deepEqual(reg.grezzo.meta, { findings: 4, bloccanti: 1, gravi: 2, minori: 1 });
  const c = contoMarketplace(reg.grezzo);
  assert.equal(c.letto, true);
  assert.equal(c.totale, reg.grezzo.meta.findings, "il conto dell'elenco e il testimone devono dire lo stesso numero");
});

test("② un nato finisce sempre in un'area che il registro conosce, e la scheda sa come chiamarla", () => {
  const { reg, perChiave } = registro();
  scriviNatiSito(reg, NATI, { campagna: "prova", perChiave });
  const cookie = reg.elenco.find((p) => p.titolo.startsWith("La cookie policy"));
  assert.equal(cookie.dimensione, "privacy-legale", "le stesse parole in un altro ordine sono la stessa area");
  assert.equal(cookie.dimensione_dichiarata, "legale-privacy", "e quella scritta dal riparatore resta, per chi vuole risalire");
  assert.equal(cookie.reparto, "Privacy e legale");
  const inventata = reg.elenco.find((p) => p.titolo.startsWith("Un'area inventata"));
  assert.equal(inventata.dimensione, "qa-flussi");
  const aree = new Set(reg.grezzo.dimensioni.map((d) => d.chiave));
  assert.ok(reg.elenco.every((p) => aree.has(p.dimensione)), "nessun difetto sotto un'area che non esiste");
  assert.ok(dimensioniDaDisegnare(reg.grezzo).every((d) => d.nome), "ogni area disegnata ha il suo nome leggibile");
});

test("③ rilanciare applica sugli stessi nati non li conta due volte", () => {
  const { reg, perChiave } = registro();
  scriviNatiSito(reg, NATI, { campagna: "prova", perChiave });
  const dopoIlPrimo = structuredClone(reg.grezzo.meta);
  const r = scriviNatiSito(reg, NATI, { campagna: "prova", perChiave });
  assert.equal(r.scritti.length, 0);
  assert.equal(r.gianoti.length, 3);
  assert.deepEqual(reg.grezzo.meta, dopoIlPrimo);
  assert.equal(contoMarketplace(reg.grezzo).totale, reg.grezzo.meta.findings);
});

test("④ un registro senza totale dichiarato né aree resta com'era: niente numeri inventati", () => {
  const problemi = [{ dimensione: "x", titolo: "a", severita: "minore", file: "lib/a.ts:1", stato: "aperto" }];
  const reg = { percorso: "/non-si-scrive", grezzo: { problemi }, elenco: problemi };
  const r = scriviNatiSito(reg, [{ sessione: "C01", titolo: "b", dimensione: "y", severita: "minore", file: "lib/b.ts:1" }], { campagna: "prova", perChiave: new Map() });
  assert.equal(r.scritti.length, 1);
  assert.equal(reg.grezzo.meta, undefined, "un testimone che non c'era non si inventa");
  assert.equal(reg.elenco[1].dimensione, "y", "senza elenco delle aree l'area resta quella scritta");
});
