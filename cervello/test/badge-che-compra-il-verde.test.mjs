#!/usr/bin/env node
// 🧪 AR-646 — IN CABINA IL BADGE DELLA MEMORIA DAVA IL VERDE A CHI NON AVEVA GUARDATO.
//
// La rotta traduceva così l'esito del guardiano di coerenza:
//
//     esito: cf.esito === "incoerenze" ? "incoerenze" : "ok"
//
// Il verde era il ramo di DEFAULT. `cervello/coerenza-fatti.mjs` però scrive quattro etichette:
// «ok», «incoerenze», «cieco» (AR-597 — il registro dei fatti non c'era, non ho potuto guardare) e
// «non_verificato» (AR-211 — ho aperto zero file). Le ultime due arrivavano a Nicola come lo scudo
// verde «Memoria coerente»: la superficie diceva che andava tutto bene esattamente nei due casi in
// cui nessuno aveva controllato.
//
// La prova guarda due cose: la decisione (fail-closed anche su un'etichetta mai vista) e il fatto
// che il guardiano vero SAPPIA scrivere quelle etichette — se un giorno le rinominasse, questo test
// diventa rosso e ci si accorge che la mappa è rimasta indietro.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { statoCoerenza, memoriaCoerente, tonoBadge, testoBadge } = await import(join(REPO, "pannello/src/lib/badge-coerenza.ts"));

test("solo «ok» compra lo scudo verde", () => {
  assert.equal(memoriaCoerente(statoCoerenza("ok")), true);
  for (const altro of ["incoerenze", "cieco", "non_verificato", "boh", "", undefined, null]) {
    assert.equal(memoriaCoerente(statoCoerenza(altro)), false, `«${altro}» non ha misurato niente: non può essere verde`);
  }
});

test("«cieco» e «non_verificato» hanno un tono loro: né accusa né assoluzione", () => {
  assert.equal(tonoBadge(statoCoerenza("cieco")), "cieco");
  assert.equal(tonoBadge(statoCoerenza("non_verificato")), "cieco");
  assert.equal(tonoBadge(statoCoerenza("incoerenze")), "rosso");
  assert.equal(tonoBadge(statoCoerenza("ok")), "verde");
});

test("un'etichetta mai vista diventa «sconosciuto», non «ok»", () => {
  assert.equal(statoCoerenza("parzialmente_ok"), "sconosciuto");
  assert.equal(tonoBadge(statoCoerenza("parzialmente_ok")), "cieco", "il default dev'essere il buco, non il verde");
});

test("il testo del badge dice a Nicola cosa è successo, senza sigle", () => {
  assert.match(testoBadge("cieco"), /non ho potuto controllare/i);
  assert.match(testoBadge("non_verificato"), /non ha aperto nessun file/i);
  assert.match(testoBadge("incoerenze", 3), /3 copie vecchie/);
  assert.match(testoBadge("incoerenze", 1), /1 copia vecchia/);
  assert.match(testoBadge("ok"), /Memoria coerente/);
  assert.match(testoBadge("sconosciuto"), /non so leggere/i);
});

test("le etichette della mappa sono quelle che il guardiano scrive davvero", () => {
  const src = readFileSync(join(REPO, "cervello", "coerenza-fatti.mjs"), "utf8");
  for (const et of ["cieco", "non_verificato", "incoerenze"]) {
    assert.match(src, new RegExp(`esito:\\s*(?:"|')?${et}|"${et}"`), `il guardiano deve poter scrivere «${et}»`);
  }
});

test("la rotta non decide più da sé: chiama la mappa condivisa", () => {
  const src = readFileSync(join(REPO, "pannello/src/app/api/memoria/fatti/route.ts"), "utf8");
  assert.doesNotMatch(src, /=== "incoerenze" \? "incoerenze" : "ok"/, "la forma malata non deve tornare");
  assert.match(src, /statoCoerenza\(cf\.esito\)/, "e la decisione dev'essere quella provata qui sopra");
});
