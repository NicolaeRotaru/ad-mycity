#!/usr/bin/env node
// AR-437 — IL CANCELLO CHE ERA ROSSO PER COSTRUZIONE, e la regola che adesso lo governa.
//
// Il cancello del lotto chiama quattro guardiani. Due passavano da un TETTO (il debito ereditato si
// conta e scende, ciò che il lotto tocca è blocco duro); gli altri due — `prove-oneste` e
// `test-cervello` — il cancello li chiamava e ne propagava il codice d'uscita secco. Risultato: un
// lotto sano non poteva consegnare finché non ripuliva il debito storico di qualcun altro. E un
// cancello che non può diventare verde viene aggirato al secondo giro: da lì in poi non dice più
// niente nemmeno quando ha ragione.
//
// LA CAUSA VERA non è «a quei due manca un tetto». È che il tetto era una proprietà della MISURA
// invece che una regola del CANCELLO — quindi ogni guardiano agganciato dopo nasceva senza, e
// nascerà senza anche il prossimo. Qui la regola è una sola funzione, e chi la chiama la applica.
//
// ⚠️ DUE COSE MISURATE SUL CODICE VERO, contro quello che diceva la scheda:
//   · `prove-oneste` NON esce 1 sul debito in una sessione cloud: esce 2 (cieco), e il cancello il
//     2 lo tratta già come ⚪. Quella metà della scheda era vecchia — `verdettoCopertura` l'ha
//     curata dopo che la scheda è stata scritta. Il buco vero era solo l'assenza del tetto.
//   · Il tetto NON nasce alla misura di adesso, come fa `prova_debole`. Se lo facesse, un test che
//     divento rosso senza che io tocchi il suo file verrebbe assorbito in silenzio ogni volta: si
//     curerebbe il cancello sempre rosso creando un cancello cieco alle regressioni. Finché il
//     numero non è dichiarato, il rosso resta rosso — e adesso dice cosa manca.
//
// 🟢 Sola lettura: funzioni pure + il cancello vero eseguito in `--solo-prove` (che non lancia
// nessun guardiano e non scrive niente).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verdettoConTetto, testDelLotto, idSospetti, testRossi } from "../tetto-guardiano.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// ─────────────────────────────────────────────────────────────────────────────
// LA REGOLA — i quattro esiti che prima non esistevano
// ─────────────────────────────────────────────────────────────────────────────

test("il DEBITO ereditato sotto il tetto non blocca più il lotto (era il rosso per costruzione)", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 3, tetto: 3, delLotto: [] });
  assert.equal(v.esito, "debito", "tre rossi di ieri, nessuno mio, tetto dichiarato a tre: si consegna");
});

test("ma ciò che il LOTTO tocca resta blocco duro, anche sotto il tetto", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 3, tetto: 10, delLotto: ["cervello/test/mio.test.mjs"] });
  assert.equal(v.esito, "violazione");
  assert.equal(v.regola, "del-lotto");
  assert.match(v.motivo, /sono tuoi/, "il motivo deve dire DI CHI è il rosso: è l'informazione che cambia la mossa");
});

test("il debito che si ALLARGA è una violazione, non un debito", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 4, tetto: 3, delLotto: [] });
  assert.equal(v.esito, "violazione");
  assert.equal(v.regola, "oltre-il-tetto");
});

test("il debito che SCENDE chiede di abbassare il tetto, e non risale mai da solo", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 1, tetto: 3, delLotto: [] });
  assert.equal(v.esito, "debito");
  assert.equal(v.tettoDaDichiarare, 1, "il tetto nuovo è la misura di adesso, che è più bassa");
});

// ⬇️ I tre modi di NON assolvere. Sono il cuore: un tetto che assolve ciò che non ha capito è
// peggio del cancello sempre rosso, perché il primo si vede e questo no.

test("un tetto MAI DICHIARATO non assolve: senza un numero fermo, debito e regressione sono la stessa cosa", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 3, tetto: null, delLotto: [] });
  assert.equal(v.esito, "violazione");
  assert.equal(v.regola, "tetto-non-dichiarato");
  assert.equal(v.tettoDaDichiarare, 3, "e però dice il numero da scrivere: il rimedio è una riga");
});

test("se non so CONTARE le violazioni, non assolvo", () => {
  const v = verdettoConTetto({ codice: 1, quanti: null, tetto: 99, delLotto: [] });
  assert.equal(v.esito, "violazione");
  assert.equal(v.regola, "non-contato");
});

test("se non so ATTRIBUIRLE al lotto, non assolvo: «forse non è mio» non è «non è mio»", () => {
  const v = verdettoConTetto({ codice: 1, quanti: 2, tetto: 99, delLotto: null });
  assert.equal(v.esito, "violazione");
  assert.equal(v.regola, "lotto-sconosciuto");
});

test("il CIECO resta cieco: un tetto non può assolvere una misura mai fatta", () => {
  // È il contratto dei guardiani (AR-322) e vale anche qui: se il tetto potesse coprire un exit 2,
  // «non ho guardato» diventerebbe indistinguibile da «ho guardato e va bene».
  assert.equal(verdettoConTetto({ codice: 2, quanti: 0, tetto: 0, delLotto: [] }).esito, "cieco");
  assert.equal(verdettoConTetto({ codice: 2, quanti: 50, tetto: 0, delLotto: ["x"] }).esito, "cieco");
});

test("verde è verde: un guardiano che esce 0 non passa dal tetto", () => {
  assert.equal(verdettoConTetto({ codice: 0, quanti: 0, tetto: 0, delLotto: [] }).esito, "ok");
});

// ─────────────────────────────────────────────────────────────────────────────
// IL PERIMETRO — chi è «di questo lotto»
// ─────────────────────────────────────────────────────────────────────────────

test("testDelLotto(): i test che il diff aggiunge o modifica, compresi quelli non ancora tracciati", () => {
  const dentro = testDelLotto(
    ["cervello/test/a.test.mjs", "pannello/src/x.ts", "cervello/foo.mjs"],
    ["cervello/test/nuovo.test.mjs", "consegne/nota.md"],
  );
  assert.deepEqual(dentro, ["cervello/test/a.test.mjs", "cervello/test/nuovo.test.mjs"]);
});

test("testDelLotto(): un test scritto adesso e mai committato è comunque mio", () => {
  // Il caso che sfuggirebbe guardando solo `git diff`: una prova nuova non tracciata. Lasciarla
  // fuori dal perimetro significa che il blocco duro non vede proprio le prove appena scritte —
  // cioè è cieco esattamente dove serve di più.
  assert.deepEqual(testDelLotto([], ["cervello/test/appena-scritto.test.mjs"]), ["cervello/test/appena-scritto.test.mjs"]);
  assert.deepEqual(testDelLotto([""], [""]), [], "le righe vuote di git non sono file");
});

// ─────────────────────────────────────────────────────────────────────────────
// LEGGERE I GUARDIANI — il numero e i nomi, non sei righe di coda
// ─────────────────────────────────────────────────────────────────────────────

test("idSospetti(): prende i difetti disonesti e NON i ciechi, che si stampano quasi uguali", () => {
  const uscita = [
    "❌ PROVE DISONESTE: 2 difetti su 40 misurati…",
    "  · AR-101 [grave] la prova era già soddisfatta",
    "      motivo",
    "  · AR-202 [minore] idem",
    "👁️  103 non misurabili…",
    "  · AR-126: impossibile ricostruire il file alla data di nascita",
  ].join("\n");
  assert.deepEqual(idSospetti(uscita), ["AR-101", "AR-202"], "il cieco AR-126 non è una violazione: contarlo sarebbe accusare chi non c'entra");
});

test("idSospetti(): un'uscita senza sospetti non ne inventa", () => {
  assert.deepEqual(idSospetti("✅ Prove oneste: 40 misurate su 40, nessuna era già soddisfatta."), []);
  assert.deepEqual(idSospetti(""), []);
});

test("testRossi(): i file rossi con nome e cognome, e il ⚪ dei bats non è un rosso", () => {
  const j = JSON.stringify({
    test: [
      { file: "cervello/test/a.test.mjs", esito: "ok" },
      { file: "cervello/test/b.test.mjs", esito: "rosso" },
      { file: "cervello/test/c.test.mjs", esito: "ineseguibile" },
    ],
    bats: [{ file: "cervello/test/d.bats", esito: "non-eseguito" }],
  });
  assert.deepEqual(testRossi(j), ["cervello/test/b.test.mjs", "cervello/test/c.test.mjs"]);
});

test("testRossi(): un'uscita che non so leggere torna null, e null non assolve nessuno", () => {
  assert.equal(testRossi("boom, non è JSON"), null);
  // La coppia che conta: `null` entra in `verdettoConTetto` e produce una violazione, non un verde.
  assert.equal(verdettoConTetto({ codice: 1, quanti: testRossi("boom"), tetto: 3, delLotto: [] }).esito, "violazione");
});

// ─────────────────────────────────────────────────────────────────────────────
// SUL CAMPO — il cancello vero, eseguito
// ─────────────────────────────────────────────────────────────────────────────

test("SUL CAMPO: il cancello parte, dà un verdetto e rispetta il contratto 0/1/2", () => {
  // `--solo-prove` non lancia nessun guardiano esterno: misura le regole sulle prove e basta, quindi
  // è istantaneo e non dipende dal lavoro delle altre corsie. Serve a provare che le modifiche di
  // AR-437 non hanno rotto il cancello — un metro che non parte non misura niente.
  const r = spawnSync(process.execPath, ["cervello/cancello-lotto.mjs", "--solo-prove", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 120_000,
  });
  assert.ok([0, 1, 2].includes(r.status), `il cancello deve uscire 0, 1 o 2 — è uscito ${r.status}: ${r.stderr}`);
  const esito = JSON.parse(r.stdout);
  assert.equal(typeof esito.ok, "boolean");
  assert.ok(Array.isArray(esito.violazioniProve), "il verdetto deve restare leggibile da uno script");
});
