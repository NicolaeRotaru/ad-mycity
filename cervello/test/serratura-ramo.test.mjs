#!/usr/bin/env node
// 🧪 La serratura del ramo — card #177.
//
// Il difetto che queste prove tengono chiuso non è «manca una regola»: è che una regola ROTTA
// somiglia a una regola. Sul repo del sito ne esiste una dal 26/5/2026, spenta, puntata su zero
// rami, che pretende un controllo di nome «Main» che non è mai esistito. Chi guarda l'elenco delle
// regole e ne vede una, smette di fare domande — ed è per questo che «finta» dev'essere uno stato a
// sé, e non finire annegato dentro «aperta».
//
// Girano su dati finti apposta: devono poter fallire senza rete e senza chiave.

import { test } from "node:test";
import assert from "node:assert/strict";
import { esamina, nomiControlli } from "../serratura-ramo.mjs";

const CONTROLLI = ["Lint + Typecheck + Build", "Unit tests"];

const regola = (extra = {}) => ({
  name: "Main",
  target: "branch",
  enforcement: "active",
  conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
  rules: [
    { type: "required_status_checks", parameters: { required_status_checks: [{ context: "Unit tests" }] } },
  ],
  ...extra,
});

test("nessuna regola = APERTA: il cancello parla e chi unisce decide", () => {
  const v = esamina({ rulesets: [], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "aperta");
});

test("una regola accesa, puntata, con controlli che esistono = CHIUSA", () => {
  const v = esamina({ rulesets: [regola()], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "chiusa");
});

test("SPENTA non è chiusa — è il caso vero del sito, e non va letto come protezione", () => {
  const v = esamina({ rulesets: [regola({ enforcement: "disabled" })], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "finta");
  assert.ok(v.motivi.some((m) => /spenta/.test(m)), `deve dire PERCHÉ: ${v.motivi.join(" | ")}`);
});

test("accesa ma puntata su ZERO rami non protegge niente, e non deve risultare chiusa", () => {
  const vuota = regola({ conditions: { ref_name: { include: [], exclude: [] } } });
  const v = esamina({ rulesets: [vuota], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "finta");
  assert.ok(v.motivi.some((m) => /nessun ramo/.test(m)));
});

test("pretendere un controllo che NON esiste è il guasto che blocca tutto per sempre", () => {
  const fantasma = regola({
    rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "Main" }] } }],
  });
  const v = esamina({ rulesets: [fantasma], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "finta");
  assert.ok(v.motivi.some((m) => /non esiste/.test(m) && /Main/.test(m)),
    "deve nominare il controllo fantasma: è quello che Nicola deve togliere a mano");
});

test("il caso vero del sito il 7/9: spenta E senza ramo E con un fantasma, tutti e tre detti", () => {
  const comeInProduzione = regola({
    enforcement: "disabled",
    conditions: { ref_name: { include: [], exclude: [] } },
    rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "Main" }] } }],
  });
  const v = esamina({ rulesets: [comeInProduzione], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "finta");
  const detto = v.motivi.join(" | ");
  for (const atteso of [/spenta/, /nessun ramo/, /non esiste/]) {
    assert.match(detto, atteso, `un guasto taciuto è un guasto che nessuno ripara: ${detto}`);
  }
});

test("una regola che non pretende NESSUN controllo non è una serratura", () => {
  const senza = regola({ rules: [{ type: "required_status_checks", parameters: { required_status_checks: [] } }] });
  assert.equal(esamina({ rulesets: [senza], controlliVeri: CONTROLLI }).stato, "finta");
});

test("una regola che parla d'altro (cancellazione del ramo) non conta come serratura", () => {
  const altro = { name: "no delete", target: "branch", enforcement: "active", rules: [{ type: "deletion" }] };
  assert.equal(esamina({ rulesets: [altro], controlliVeri: CONTROLLI }).stato, "aperta");
});

test("basta UNA regola sana fra tante rotte: il ramo è chiuso lo stesso", () => {
  const v = esamina({ rulesets: [regola({ enforcement: "disabled" }), regola({ name: "vera" })], controlliVeri: CONTROLLI });
  assert.equal(v.stato, "chiusa");
});

test("senza l'elenco dei controlli veri non si accusa nessun fantasma: non-so non è colpevole", () => {
  const fantasma = regola({
    rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "Main" }] } }],
  });
  assert.equal(esamina({ rulesets: [fantasma], controlliVeri: [] }).stato, "chiusa",
    "se non ho letto i nomi veri, dichiarare fantasma un controllo sarebbe inventare");
});

// ── i nomi dei controlli si leggono da PIÙ teste ───────────────────────────
// Il caso vero: sulla macchina il cancello «prove, guardiani e typecheck» gira solo sulle pull
// request. Leggendo solo l'ultimo commit di main non compare, e Nicola pretenderebbe il controllo
// sbagliato — cioè accenderebbe una serratura che non chiude il cancello di cui parla la card.

test("i nomi arrivano dall'unione delle teste, non da una sola", () => {
  const daMain = [{ name: "suite del cervello + typecheck del Pannello" }];
  const daPr = [{ name: "prove, guardiani e typecheck" }, { name: "suite del cervello + typecheck del Pannello" }];
  assert.deepEqual(nomiControlli(daMain, daPr), [
    "prove, guardiani e typecheck",
    "suite del cervello + typecheck del Pannello",
  ]);
  assert.deepEqual(nomiControlli(daMain), ["suite del cervello + typecheck del Pannello"],
    "da sola, la testa di main perde proprio il cancello");
});

test("nomi vuoti o mancanti non entrano nell'elenco da copiare a mano", () => {
  assert.deepEqual(nomiControlli([{ name: "" }, {}, { name: "Unit tests" }]), ["Unit tests"]);
});
