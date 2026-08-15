#!/usr/bin/env node
// 🧪 AR-699 — CHI RISCRIVE DEVE POTER CHIEDERE «CHI HO APPENA SCOLLEGATO?», PRIMA DI CONSEGNARE.
//
// Il conto vero, misurato su un lotto solo: CINQUE mutazioni orfanate riscrivendo il codice che
// sorvegliavano (due in sorvegliante.mjs, due in cancello-lotto.mjs, una spostata da gate-veri.mjs a
// contratto-prova.mjs). In tutti e cinque i casi il comportamento era SPOSTATO, non rimosso — nessun
// fix era stato disfatto. Ma in nessuno dei cinque se n'è accorto chi stava riscrivendo: l'ha detto
// il guardiano DOPO, e per una di esse lo aveva già detto novantanove volte senza che nessuno
// agisse. Il fix resta, la difesa no, e il test continua a passare.
//
// Il cancello del lotto blocca già alla consegna: il buco è NEL MEZZO. Questa prova esercita la
// domanda del mezzo — la funzione pura che risponde «di tutte le mutazioni che puntano ai file che
// hai toccato, queste N non trovano più il loro pezzo» — sui dati veri di questo repo, non su una
// finta comoda.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mutazioniOrfane, nomiDaStatus, padroneDellaMutazione } from "../mutazioni-orfane.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leggiVero = (f) => {
  try {
    return readFileSync(join(REPO, f), "utf8");
  } catch {
    return null;
  }
};

test("LA REGOLA CHE CONTA: una mutazione il cui pezzo è stato riscritto viene NOMINATA", () => {
  const mutanti = [
    { difetto: "AR-503", nome: "il saldo", file: "a.mjs", cerca: "const saldo = tolte - messe;" },
    { difetto: "AR-543", nome: "i commenti", file: "a.mjs", cerca: "senzaCommenti(r.testo, file)" },
  ];
  // Il caso vero del difetto: il comportamento è stato SPOSTATO (rinominato), non tolto.
  const dopo = "const differenza = tolte - messe;\nsenzaCommenti(r.testo, file)\n";
  const r = mutazioniOrfane(mutanti, ["a.mjs"], () => dopo);
  assert.equal(r.controllate, 2);
  assert.equal(r.orfane.length, 1, "una sola delle due ha perso l'appiglio");
  assert.equal(r.orfane[0].difetto, "AR-503");
});

test("i file che NON ho toccato non li giudico: la domanda è «cosa ho scollegato IO»", () => {
  const mutanti = [
    { difetto: "AR-1", file: "mio.mjs", cerca: "c'è" },
    { difetto: "AR-2", file: "altrui.mjs", cerca: "sparito" },
  ];
  const r = mutazioniOrfane(mutanti, ["mio.mjs"], (f) => (f === "mio.mjs" ? "c'è" : "vuoto"));
  assert.equal(r.controllate, 1, "chi non ha toccato altrui.mjs non deve vedersi addossare il suo debito");
  assert.equal(r.orfane.length, 0);
});

test("un file che non riesco a LEGGERE non è «nessuna orfana»: è un cieco dichiarato", () => {
  const r = mutazioniOrfane([{ difetto: "AR-9", file: "sparito.mjs", cerca: "x" }], ["sparito.mjs"], () => null);
  assert.equal(r.orfane.length, 0);
  assert.equal(r.ciechi.length, 1, "un file illeggibile va detto, non contato verde");
  assert.match(r.ciechi[0], /non ho potuto leggerlo/);
});

test("senza elenco di file si guarda TUTTO: è la modalità di controllo, non il default", () => {
  const mutanti = [{ difetto: "AR-1", file: "a.mjs", cerca: "manca" }];
  const r = mutazioniOrfane(mutanti, null, () => "altro");
  assert.equal(r.controllate, 1);
  assert.equal(r.orfane.length, 1);
});

test("una mutazione di LEZIONE non diventa «(senza padrone)»: ha il suo nome", () => {
  assert.equal(padroneDellaMutazione({ lezione: "L-2026-0813-02" }), "L-2026-0813-02");
  assert.equal(padroneDellaMutazione({ difetto: "AR-503 e AR-543" }), "AR-503, AR-543");
});

test("i nomi di `git status -z` si leggono INTERI: lo stato sta nei primi tre caratteri", () => {
  // L'uscita vera di git, copiata com'è: la prima colonna può essere uno spazio.
  const grezzo = " M cervello/non-vacuita.mjs\0?? cervello/mutazioni-orfane.mjs\0M  cervello/test/x.test.mjs\0";
  assert.deepEqual(nomiDaStatus(grezzo), ["cervello/non-vacuita.mjs", "cervello/mutazioni-orfane.mjs", "cervello/test/x.test.mjs"]);
  // Il modo sbagliato — `trim()` prima di tagliare lo stato — lascia dentro una lettera e il
  // percorso non combacia più con nessuna mutazione: zero file trovati con l'albero pieno di
  // modifiche, cioè un verde per non aver guardato. È successo mentre scrivevo questo comando.
  assert.ok(!nomiDaStatus(grezzo).some((n) => /^[A-Z?] /.test(n)));
});

test("SUL CAMPO: ogni mutazione di questo repo trova il suo pezzo (se no, qualcuno l'ha scollegata)", () => {
  const mutanti = JSON.parse(readFileSync(join(REPO, "cervello/mutanti.json"), "utf8")).mutanti;
  assert.ok(mutanti.length > 100, "il repo deve avere le sue mutazioni, o questo caso non misura niente");
  const r = mutazioniOrfane(mutanti, null, leggiVero);
  assert.deepEqual(
    r.orfane.map((o) => `${o.difetto} → ${o.file}`),
    [],
    "queste mutazioni non trovano più il loro pezzo: il fix resta, la difesa no",
  );
});
