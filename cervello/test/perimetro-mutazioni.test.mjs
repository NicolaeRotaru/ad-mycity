#!/usr/bin/env node
// 🎯 LA PROVA DEL PERIMETRO DELLE MUTAZIONI — AR-835.
//
// Che cosa difende, in una riga: che il banco delle mutazioni rompa il codice CHE QUESTO LOTTO HA
// TOCCATO, non quello delle schede che si limita a chiudere — e che quando non sa quali file siano
// stati toccati si ALLARGHI invece di stringere.
//
// Il difetto che l'ha fatta nascere, con i numeri: il 26/8/2026 il lotto 63 ha cambiato quattro
// file, tutti di memoria, zero righe di codice. Il cancello ha comunque preso le venticinque
// schede chiuse, ne ha trovato le 85 mutazioni sparse su 29 file di codice mai sfiorati, e le ha
// rotte una per una finché il passo non ha sbattuto contro il suo tetto di quindici minuti. La CI
// ci ha messo 25,2 minuti contro gli 8,1 della stessa mattina, e ha chiuso ammazzando cinquecento
// processi rimasti orfani. Un cancello che non può tornare verde si impara a saltare.
//
// ⚠️ Il caso ③ è il guardiano di questa cura contro sé stessa: se un giorno qualcuno facesse
// STRINGERE il perimetro quando git non sa rispondere, questa prova diventa rossa. Restringere al
// buio è esattamente il modo in cui una cura di velocità si trasforma in un'asticella abbassata.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mutazioniDaGirare, perimetroDalGit, rigaDelleSaltate, idDellaMutazione } from "../perimetro-mutazioni.mjs";

const m = (difetto, file) => ({ difetto, file, cerca: "x", sostituisci: "y", test: `cervello/test/${difetto}.test.mjs` });

test("① il lotto che chiude schede senza toccare codice non rompe niente", () => {
  const p = mutazioniDaGirare({
    mutanti: [m("AR-100", "cervello/uno.mjs"), m("AR-101", "cervello/due.mjs")],
    toccati: ["AR-100", "AR-101"],
    proveCambiate: [],
    fileCambiati: ["MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json", "MyCity-Vault/90-Memoria-AI/DECISIONI.md"],
  });
  assert.equal(p.girare.length, 0, "chiudere una scheda non è aver toccato il codice che ripara");
  assert.equal(p.saltate.length, 2, "le due lasciate fuori devono essere dichiarate, non sparire");
  assert.equal(p.cieco, false);
});

test("② la mutazione del file che il lotto ha cambiato gira, le altre no", () => {
  const p = mutazioniDaGirare({
    mutanti: [m("AR-100", "cervello/uno.mjs"), m("AR-101", "cervello/due.mjs")],
    toccati: ["AR-100", "AR-101"],
    proveCambiate: [],
    fileCambiati: ["cervello/due.mjs"],
  });
  assert.deepEqual(p.difetti, ["AR-101"]);
  assert.equal(p.saltate.length, 1);
  assert.match(p.saltate[0].motivo, /cervello\/uno\.mjs/);
});

test("③ se non so quali file sono cambiati, il perimetro si ALLARGA — mai il contrario", () => {
  const mutanti = [m("AR-100", "cervello/uno.mjs"), m("AR-101", "cervello/due.mjs"), m("AR-999", "cervello/altrui.mjs")];
  const p = mutazioniDaGirare({ mutanti, toccati: ["AR-100", "AR-101"], proveCambiate: [], fileCambiati: null });
  assert.equal(p.girare.length, 2, "al buio si fanno girare tutte le mutazioni delle schede toccate, come prima");
  assert.deepEqual(p.difetti.sort(), ["AR-100", "AR-101"]);
  assert.equal(p.saltate.length, 0, "al buio non si dichiara nessun taglio: non ne è stato fatto nessuno");
  assert.match(p.motivo, /allarga/, "e lo si dice, perché un perimetro largo per cecità non è una scelta");
});

test("④ la prova riscritta in questo lotto porta dentro la sua mutazione anche se il file non è cambiato", () => {
  const p = mutazioniDaGirare({
    mutanti: [m("AR-100", "cervello/uno.mjs")],
    toccati: ["AR-100"],
    proveCambiate: ["AR-100"],
    fileCambiati: ["MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json"],
  });
  assert.equal(p.girare.length, 1, "chi riscrive una prova deve dimostrare che la prova nuova sappia diventare rossa");
  assert.equal(p.saltate.length, 0);
});

test("⑤ la mutazione del file toccato entra anche se la sua scheda non l'ha toccata nessuno", () => {
  // Questo il metro vecchio lo PERDEVA: guardava solo le schede del lotto.
  const p = mutazioniDaGirare({
    mutanti: [m("AR-500", "cervello/uno.mjs")],
    toccati: ["AR-100"],
    proveCambiate: [],
    fileCambiati: ["cervello/uno.mjs"],
  });
  assert.deepEqual(p.difetti, ["AR-500"]);
});

test("⑥ senza sapere quali schede tocca il lotto, o senza mutanti.json, è cieco e lo dice", () => {
  const senzaSchede = mutazioniDaGirare({ mutanti: [m("AR-100", "cervello/uno.mjs")], toccati: null, fileCambiati: [] });
  assert.equal(senzaSchede.cieco, true);
  assert.equal(senzaSchede.girare.length, 0);
  const senzaMutanti = mutazioniDaGirare({ mutanti: null, toccati: ["AR-100"], fileCambiati: [] });
  assert.equal(senzaMutanti.cieco, true);
});

test("⑦ la riga delle saltate nomina i file e non si scrive quando non c'è niente da dichiarare", () => {
  assert.equal(rigaDelleSaltate([]), null);
  const riga = rigaDelleSaltate([{ mutazione: m("AR-100", "cervello/uno.mjs"), motivo: "x" }]);
  assert.match(riga, /cervello\/uno\.mjs/);
  assert.match(riga, /non è girata/);
});

test("⑧ una voce che accorpa più schede le nomina tutte", () => {
  assert.deepEqual(idDellaMutazione({ difetto: "AR-239+AR-264" }), ["AR-239", "AR-264"]);
  assert.deepEqual(idDellaMutazione({}), []);
});

test("⑨ una risposta PARZIALE di git vale quanto nessuna risposta: si allarga", () => {
  const mutanti = [m("AR-100", "cervello/uno.mjs"), m("AR-101", "cervello/due.mjs")];
  const args = { mutanti, toccati: ["AR-100", "AR-101"], proveCambiate: [] };
  // git ha elencato un file solo E ha dichiarato di non aver potuto guardare il resto.
  const parziale = perimetroDalGit({ ...args, daGit: { file: ["cervello/due.mjs"], ciechi: ["git status non ha risposto"] } });
  assert.equal(parziale.girare.length, 2, "con una lista incompleta si fanno girare tutte: fidarsi di metà elenco è restringere al buio");
  // La stessa lista, ma completa: adesso il taglio è una scelta, e si vede.
  const completa = perimetroDalGit({ ...args, daGit: { file: ["cervello/due.mjs"], ciechi: [] } });
  assert.equal(completa.girare.length, 1);
  assert.equal(completa.saltate.length, 1);
  // E se git non ha risposto affatto, idem: largo.
  assert.equal(perimetroDalGit({ ...args, daGit: null }).girare.length, 2);
});
