// 🔎 Le prove del COLLAUDO (AR-518) — il ricontrollo obbligato del lavoro finito.
//
// Cosa difendono, in una riga ciascuna:
//   · il primo «fatto» di un lavoro NON passa: il cancello chiede il giro di collaudo;
//   · un giro che non cambia niente CONFERMA il lavoro (promuovi), e non viene richiesto in eterno;
//   · un giro che corregge fa RIPARTIRE il collaudo al turno dopo (rimanda → chiedi), anche se le
//     correzioni sono state committate e il diff del turno nuovo è vuoto (il registro «chiesto» pende);
//   · un turno senza lavoro passa senza una parola;
//   · le istruzioni aprono con ❌ (nel verdetto dello Stop è ciò che blocca e tiene ferma l'ancora)
//     e nel verdetto dello Stop bloccano davvero — tranne che nella valvola anti-cappio.

import test from "node:test";
import assert from "node:assert/strict";
import { improntaLavoro, righeCollaudo, verdettoCollaudo } from "../collaudo.mjs";
import { verdetto } from "../cancello-stop.mjs";

// ── L'impronta: uguale sullo stesso stato, diversa appena qualcosa si muove ──────────────────────

test("la stessa fotografia del lavoro produce la stessa impronta", () => {
  const a = improntaLavoro({ testa: "abc", diff: "+riga", nuovi: [{ file: "x.md", dim: 3, quando: 9 }] });
  const b = improntaLavoro({ testa: "abc", diff: "+riga", nuovi: [{ file: "x.md", dim: 3, quando: 9 }] });
  assert.equal(a, b);
});

test("una correzione nel contenuto non committato cambia l'impronta anche se i NOMI dei file restano gli stessi", () => {
  const prima = improntaLavoro({ testa: "abc", diff: "+riga vecchia" });
  const dopo = improntaLavoro({ testa: "abc", diff: "+riga corretta" });
  assert.notEqual(prima, dopo);
});

test("un commit nuovo o un file nuovo salvato di nuovo cambiano l'impronta", () => {
  const base = improntaLavoro({ testa: "abc", diff: "", nuovi: [{ file: "x.md", dim: 3, quando: 9 }] });
  assert.notEqual(base, improntaLavoro({ testa: "def", diff: "", nuovi: [{ file: "x.md", dim: 3, quando: 9 }] }));
  assert.notEqual(base, improntaLavoro({ testa: "abc", diff: "", nuovi: [{ file: "x.md", dim: 3, quando: 12 }] }));
});

// ── La decisione: quando si chiede, quando si conferma, quando si tace ───────────────────────────

test("un turno senza lavoro e senza collaudi pendenti passa senza una parola", () => {
  assert.equal(verdettoCollaudo({ lavoro: false, impronta: "i1", registro: null }).azione, "niente");
});

test("il primo «fatto» di un lavoro chiede il giro 1 di collaudo", () => {
  const v = verdettoCollaudo({ lavoro: true, impronta: "i1", registro: null });
  assert.equal(v.azione, "chiedi");
  assert.equal(v.giro, 1);
});

test("un lavoro collaudato pulito e mai più toccato non viene richiesto in eterno", () => {
  const registro = { impronta: "i1", esito: "pulito", giro: 1 };
  assert.equal(verdettoCollaudo({ lavoro: true, impronta: "i1", registro }).azione, "niente");
});

test("lavoro NUOVO dopo un collaudo pulito: si riparte dal giro 1", () => {
  const registro = { impronta: "i1", esito: "pulito", giro: 3 };
  const v = verdettoCollaudo({ lavoro: true, impronta: "i2", registro });
  assert.equal(v.azione, "chiedi");
  assert.equal(v.giro, 1, "è un lavoro diverso, non il quarto giro dello stesso");
});

test("il giro di collaudo che non cambia niente CONFERMA il lavoro (promuovi)", () => {
  const registro = { impronta: "i1", esito: "chiesto", giro: 2 };
  const v = verdettoCollaudo({ lavoro: true, impronta: "i1", registro, giaBloccato: true });
  assert.equal(v.azione, "promuovi");
  assert.equal(v.giro, 2);
});

test("il giro di collaudo che CORREGGE non incappia il turno: rimanda al prossimo «fatto»", () => {
  const registro = { impronta: "i1", esito: "chiesto", giro: 1 };
  const v = verdettoCollaudo({ lavoro: true, impronta: "i2", registro, giaBloccato: true });
  assert.equal(v.azione, "rimanda");
});

test("correzioni committate e diff del turno vuoto: il registro «chiesto» tiene il collaudo dovuto", () => {
  // È il caso per cui `lavoro` da solo non basta: l'ancora dello Stop si è spostata, il diff del
  // turno nuovo non vede più niente, ma quel lavoro non è mai uscito pulito da un giro.
  const registro = { impronta: "i1", esito: "chiesto", giro: 1 };
  const v = verdettoCollaudo({ lavoro: false, impronta: "i2", registro });
  assert.equal(v.azione, "chiedi");
  assert.equal(v.giro, 2, "è il secondo giro dello stesso lavoro, non un lavoro nuovo");
});

test("un collaudo chiesto e mai tornato (turno interrotto) si richiede, non si dimentica", () => {
  const registro = { impronta: "i1", esito: "chiesto", giro: 1 };
  assert.equal(verdettoCollaudo({ lavoro: true, impronta: "i1", registro }).azione, "chiedi");
});

// ── Le istruzioni: la forma che blocca, i quattro passi, il giro meccanico dentro ────────────────

test("le istruzioni aprono con ❌ e contengono i quattro passi del ricontrollo sul diff VERO", () => {
  const righe = righeCollaudo({ giro: 1, nFile: 4, da: "a1b2c3" });
  assert.ok(righe[0].startsWith("❌"), "senza ❌ il verdetto dello Stop non blocca e l'ancora scivola");
  assert.match(righe[0], /giro 1/);
  assert.match(righe[0], /git diff a1b2c3/, "il ricontrollo si fa sul diff dell'INTERO perimetro, non a memoria");
  assert.match(righe[0], /RICHIESTA di Nicola/);
  assert.match(righe[0], /esegui le prove/);
});

test("il verdetto del sorvegliante sull'intero lavoro entra nelle istruzioni, gravi prima e col tetto", () => {
  const voci = [
    ...Array.from({ length: 7 }, (_, i) => ({ gravita: "grave", classe: "malattia-nuova", file: `f${i}.mjs`, riga: 1, cosa: `guaio ${i}` })),
    { gravita: "media", classe: "riparazione-parziale", file: "g.mjs", riga: null, cosa: "classe viva" },
    { gravita: "informativa", classe: "raggio", file: "h.mjs", riga: null, cosa: "3 dipendenti" },
  ];
  const righe = righeCollaudo({ giro: 2, nFile: 9, da: "base", voci });
  assert.equal(righe.length, 2);
  assert.equal((righe[1].match(/❌/g) || []).length - 0, 6, "1 di testa + 5 gravi: il resto è tetto, non dimenticanza");
  assert.match(righe[1], /⚠️.*riparazione-parziale/);
  assert.ok(!righe[1].includes("raggio"), "le informative sono un quadro, non un compito: fuori dalle istruzioni");
});

test("senza voci meccaniche restano i quattro passi da soli: il ricontrollo del modello è la parte che conta", () => {
  assert.equal(righeCollaudo({ giro: 1, nFile: 2, da: "base", voci: [] }).length, 1);
});

// ── Dentro il verdetto dello Stop: blocca al primo giro, rispetta la valvola anti-cappio ─────────

test("le righe del collaudo nel verdetto dello Stop BLOCCANO la chiusura del turno", () => {
  const v = verdetto({ collaudo: righeCollaudo({ giro: 1, nFile: 3, da: "base" }) });
  assert.equal(v.blocca, true);
  assert.ok(v.righe.some((r) => r.includes("COLLAUDO DEL LAVORO FINITO")));
});

test("con la valvola anti-cappio il collaudo si legge ma non riblocca il turno", () => {
  const v = verdetto({ collaudo: righeCollaudo({ giro: 1, nFile: 3, da: "base" }), giaBloccato: true });
  assert.equal(v.blocca, false);
  assert.ok(v.righe.some((r) => r.includes("COLLAUDO DEL LAVORO FINITO")), "non bloccare non vuol dire tacere");
});

test("un verdetto senza collaudo e senza altri guai resta pulito: il cancello parte verde", () => {
  assert.equal(verdetto({}).blocca, false);
});
