#!/usr/bin/env node
// IL QUADRO — Nicola, 4/11/2026: «come posso chiederti di controllare tutte queste cose con una parola?»
//
// Il quadro non misura niente di suo: somma quello che misurano gli altri. Quindi i modi in cui può
// mentire sono tre, e questo file prova che non succedono:
//   ① perde una scheda per strada (la casa non si trova, lo stato è scritto male) e il totale cala;
//   ② conta come aperto ciò che è chiuso, o come lavoro sul sito ciò che è già riparato;
//   ③ trasforma un ⚪ «non l'ho visto» in un ✅, o mette sigle e percorsi sopra la riga dei dettagli.
// In più, sui registri veri: il totale della macchina deve essere lo stesso della porta unica
// `eDaFare`, quella che usano cantiere-prove e la visita. Due numeri diversi per la stessa cosa
// sarebbero la bugia che questo comando deve impedire.
//
// NON-VACUITÀ (verificata rompendo il codice apposta, il 4/11): in `cervello/quadro.mjs`
//   · togliendo `eChiusa(d) ||` dal filtro di contaPerCasa, i casi ② e ⑧ diventano ROSSI;
//   · facendo tornare «✅» a segnoOrgano quando `o.ok === 0`, il caso ⑤ diventa ROSSO;
//   · contando sul sito ogni stato diverso da «chiuso», i casi ③ e ⑧ diventano ROSSI;
//   · (5/11) facendo leggere il sito al quadro della macchina, o fare la visita a quello del sito,
//     il caso ⑧ diventa ROSSO: le due case restano separate.
//   · lasciando senza casa (undefined) la scheda che non ne trova una, i casi ① ② ⑧ diventano ROSSI.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AD_ROOT } from "../git-github.mjs";
import { eDaFare } from "../stati-cantiere.mjs";
import {
  FONTI,
  SENZA_CASA,
  areeSito,
  bloccanti,
  casaDi,
  codiceUscita,
  consigli,
  contaPerCasa,
  contaSito,
  organiDaVisita,
  raccogli,
  ritmo,
  segnoOrgano,
  testoQuadro,
} from "../quadro.mjs";

const casi = [];
const prova = (nome, fn) => {
  try {
    fn();
    casi.push({ nome, ok: true });
  } catch (e) {
    casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] });
  }
};

// ── ① La casa ───────────────────────────────────────────────────────────────

prova("① la casa si legge dalla dimensione, e dal titolo solo quando la dimensione è vaga", () => {
  assert.equal(casaDi({ dimensione: "pannello-robustezza-sicurezza", titolo: "qualunque" }), "Pannello e Cabina");
  assert.equal(casaDi({ dimensione: "worker-orchestrazione" }), "Worker e server");
  assert.equal(casaDi({ dimensione: "ad-e-senior" }), "AD e senior");
  // dimensione vaga → il titolo decide
  assert.equal(casaDi({ dimensione: "trovato-riparando", titolo: "Il server non riesce più a pubblicare" }), "Worker e server");
  assert.equal(casaDi({ titolo: "Nessun senior ha un modello assegnato" }), "AD e senior");
  // dimensione chiara che non è una casa nota → «Strategia e altro», non «Senza casa»
  assert.equal(casaDi({ dimensione: "allineamento-northstar", titolo: "il server" }), "Strategia e altro");
  // né dimensione né titolo utili → «Senza casa», che il conto mostra
  assert.equal(casaDi({ dimensione: "", titolo: "Uno strumento racconta di aver scritto dove non ha scritto" }), SENZA_CASA);
});

// ── ② Lo stato ──────────────────────────────────────────────────────────────

const finti = [
  { id: "A1", dimensione: "worker", gravita: "bloccante", stato: "aperto" },
  { id: "A2", dimensione: "worker", gravita: "grave", stato: "da-riverificare" },
  { id: "A3", dimensione: "pannello-x", gravita: "medio", stato: "in-corso" },
  { id: "A4", dimensione: "pannello-x", gravita: "minore", stato: "chiuso" },
  { id: "A5", dimensione: "pannello-x", gravita: "grave", stato: " chiuso " }, // refuso: resta chiuso
  { id: "A6", dimensione: "", titolo: "niente che dica la casa", stato: "boh" }, // stato ignoto = lavoro
];

prova("② conta solo ciò che non è chiuso, anche con lo stato scritto con gli spazi", () => {
  const { case: c, totale } = contaPerCasa(finti);
  assert.equal(totale.totale, 4, "A1 A2 A3 A6 aperti; A4 e A5 chiusi");
  assert.equal(c["Worker e server"].totale, 2);
  assert.equal(c["Pannello e Cabina"].totale, 1);
  assert.equal(c[SENZA_CASA].totale, 1);
  assert.equal(totale.senza, 1, "A6 non ha gravità: si dice, non si butta");
});

prova("② nessuna scheda si perde: la somma delle case è il totale", () => {
  const { case: c, totale } = contaPerCasa(finti);
  assert.equal(Object.values(c).reduce((n, x) => n + x.totale, 0), totale.totale);
});

// ── ③ Il sito ───────────────────────────────────────────────────────────────

prova("③ sul sito è lavoro solo «aperto»: riparato, doppione e già riparato non contano", () => {
  const t = contaSito([
    { severita: "bloccante", stato: "aperto" },
    { severita: "grave", stato: "aperto" },
    { severita: "minore", stato: "aperto" },
    { severita: "grave", stato: "riparato" },
    { severita: "grave", stato: "doppione" },
    { severita: "grave", stato: "gia_riparato_prima" },
    { severita: "grave", stato: "chiuso" },
  ]);
  assert.deepEqual([t.bloccante, t.grave, t.minore, t.totale], [1, 1, 1, 3]);
});

// ── ④ ⑤ Gli organi ──────────────────────────────────────────────────────────

const controlli = [
  { organo: "worker", esito: "rotto", titolo: "Il VPS si visita", detto: "fermo", cronico: true },
  { organo: "worker", esito: "nonvisto", titolo: "La coda scorre", detto: "mancano le chiavi" },
  { organo: "cervello", esito: "guasto", titolo: "I test passano", detto: "non è partito" },
  { organo: "senior", esito: "ok", titolo: "Il registro torna" },
  { organo: "sensori", esito: "nonvisto", titolo: "La macchina vede i dati", detto: "nessuna chiave" },
];

prova("④ un controllo guasto conta come rosso, non sparisce", () => {
  const o = organiDaVisita(controlli);
  assert.equal(o.cervello.rotti.length, 1);
  assert.equal(segnoOrgano(o.cervello), "❌");
});

prova("⑤ un organo visto solo a metà (zero a posto, solo ⚪) resta ⚪, mai ✅", () => {
  const o = organiDaVisita(controlli);
  assert.equal(segnoOrgano(o.sensori), "⚪");
  assert.equal(segnoOrgano(o.senior), "✅");
  assert.equal(segnoOrgano(o.worker), "❌", "un rosso vince sui non visti");
});

// ── ⑥ Il testo ──────────────────────────────────────────────────────────────

function quadroFinto() {
  const macchina = contaPerCasa(finti);
  const r = ritmo([{ nato: "2026-10-01", stato: "aperto" }, ...Array.from({ length: 9 }, () => ({ nato: "2026-10-02", stato: "aperto" }))], "2026-11");
  const q = {
    quando: "2026-11-04 21:00",
    casa: "claude",
    organi: organiDaVisita(controlli),
    visita: { fonte: "una visita finta" },
    ambito: "macchina",
    macchina,
    ritmo: r,
    bloccanti: [{ id: "AR-999", titolo: "🔴 BLOCCANTE — Il server tace" }],
    fontiLette: ["macchina: un file"],
    fontiMancanti: [],
  };
  q.consigli = consigli(q);
  return q;
}

prova("⑥ sopra la riga dei dettagli niente sigle AR-…, e i bloccanti si leggono a voce", () => {
  const t = testoQuadro(quadroFinto());
  const [sopra, sotto] = t.split("Dettagli tecnici");
  assert.ok(sotto, "la riga «Dettagli tecnici» c'è");
  assert.doesNotMatch(sopra, /\bAR-\d+/);
  assert.match(sopra, /· Il server tace/);
  assert.doesNotMatch(sopra, /BLOCCANTE —/);
  assert.match(sotto, /AR-999/);
});

prova("⑥ i non visti hanno la loro sezione, che dice che non è un verde", () => {
  const t = testoQuadro(quadroFinto());
  assert.match(t, /NON HO POTUTO VEDERE DA QUI \(non è un verde\)/);
  assert.match(t, /La coda scorre: mancano le chiavi/);
});

// ── ⑦ I consigli e il ritmo ─────────────────────────────────────────────────

prova("⑦ dove c'è un rosso c'è la parola da dire; dove tutto è verde, niente consigli", () => {
  const q = quadroFinto();
  assert.ok(q.consigli.some((c) => c.startsWith("«checkup»")));
  assert.ok(q.consigli.some((c) => c.startsWith("«sistema i difetti»")));
  assert.ok(!q.consigli.some((c) => /sito/.test(c)), "il quadro della macchina non consiglia lavori sul sito");
  assert.ok(q.consigli.some((c) => /prima si chiude e poi si cerca/.test(c)), "ottobre: 10 aperti, 0 chiusi");
  const pulito = consigli({ organi: organiDaVisita([{ organo: "senior", esito: "ok" }]), macchina: contaPerCasa([]), sito: contaSito([]), ritmo: ritmo([], "2026-11") });
  assert.deepEqual(pulito, []);
});

prova("⑦ il mese in corso compare anche quando è a zero, con ⚪ e non con un voto", () => {
  const t = testoQuadro(quadroFinto());
  assert.match(t, /nov 2026\s+0 aperti →\s+0 chiusi\s+⚪/);
});

prova("⑨ senza nessuna fonte il quadro dice che è vuoto, ed esce 2 — non 0", () => {
  const vuoto = { quando: "2026-11-04 21:00", casa: "claude", fontiLette: [], fontiMancanti: [{ cosa: "il cantiere della macchina", perche: "il file non c'è" }] };
  assert.match(testoQuadro(vuoto), /In due righe — non ho potuto leggere niente/);
  assert.equal(codiceUscita(vuoto), 2);
});

prova("⑨ una visita di adesso caduta, sostituita da quella salvata, esce 2", () => {
  assert.equal(codiceUscita({ fontiMancanti: [], visita: { vecchia: "La visita di adesso non ha risposto" } }), 2);
  assert.equal(codiceUscita({ fontiMancanti: [], visita: { vecchia: null } }), 0);
});

// ── ⑩ Due case, due quadri ──────────────────────────────────────────────────

prova("⑩ il quadro della macchina non parla del sito, se non per dire dove trovarlo", () => {
  const t = testoQuadro(quadroFinto());
  assert.match(t, /^📋 IL QUADRO DELLA MACCHINA/);
  const righeCol = t.split("\n").filter((l) => /sito/i.test(l));
  assert.deepEqual(righeCol, ["  · l'altra casa: «quadro sito» (il marketplace)"]);
});

prova("⑩ il quadro del sito non fa la visita della macchina e consiglia solo il sito", () => {
  const problemi = [
    { severita: "bloccante", stato: "aperto", dimensione: "deploy-sre", titolo: "Il rilascio non applica le migrazioni" },
    { severita: "grave", stato: "aperto", dimensione: "pagamenti-stripe", titolo: "x" },
    { severita: "minore", stato: "riparato", dimensione: "pagamenti-stripe", titolo: "y" },
  ];
  const q = { ambito: "sito", quando: "2026-11-05 00:00", casa: "claude", sito: contaSito(problemi), sitoAree: areeSito(problemi), bloccanti: bloccanti(problemi, { campoGravita: "severita", vivo: (d) => d.stato === "aperto" }), fontiLette: [], fontiMancanti: [] };
  q.consigli = consigli(q);
  const t = testoQuadro(q);
  assert.match(t, /^🏪 IL QUADRO DEL SITO/);
  assert.doesNotMatch(t, /ORGANI|IL RITMO|checkup|sistema i difetti/);
  assert.match(t, /deploy-sre\s+1\s+0\s+0\s+1/);
  assert.match(t, /· Il rilascio non applica le migrazioni/);
  assert.deepEqual(q.consigli, ["«chiudi i gravi del sito» — 2 difetti seri sul sito (1 bloccanti, 1 gravi)."]);
});

// ── ⑧ Sui registri veri ─────────────────────────────────────────────────────

prova("⑧ sui registri veri ogni quadro dice gli stessi numeri della porta unica, e legge solo la sua casa", () => {
  const pc = join(AD_ROOT, FONTI.cantiere);
  const ps = join(AD_ROOT, FONTI.sito);
  if (!existsSync(pc) || !existsSync(ps)) return; // in un clone senza vault non c'è niente da confrontare
  const m = raccogli({ senzaVisita: true });
  const s = raccogli({ ambito: "sito" });
  const difetti = JSON.parse(readFileSync(pc, "utf8")).difetti;
  const problemi = JSON.parse(readFileSync(ps, "utf8")).problemi;
  assert.equal(m.macchina.totale.totale, difetti.filter(eDaFare).length);
  assert.equal(Object.values(m.macchina.case).reduce((n, x) => n + x.totale, 0), m.macchina.totale.totale);
  assert.equal(m.sito, undefined, "il quadro della macchina non deve leggere il registro del sito");
  assert.equal(s.sito.totale, problemi.filter((d) => d.stato === "aperto").length);
  assert.equal(s.organi, undefined, "il quadro del sito non deve fare la visita della macchina");
  assert.equal(s.macchina, undefined);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
