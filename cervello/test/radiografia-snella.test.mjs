#!/usr/bin/env node
// La metà più grossa che il lotto 20 aveva lasciato scoperta — e l'aveva detto nel corpo della PR
// #589: «sulla stessa rotta viaggia `auto-radiografia.json`, ancora inoltrato intero. È la metà più
// grossa del problema e merita il suo lotto».
//
// Misurato il 28/7: il file è **614.805 byte**, riscaricati ogni 30 secondi insieme al cantiere.
// Dentro, i findings pesano 531.074 byte — e **109 su 170 sono chiusi** (338.175 byte) che il
// componente **filtra via prima di disegnarli** (`RadiografiaDiSe.tsx:278`). Viaggiavano per essere
// scartati all'arrivo.
//
// Non chiude un difetto del cantiere: nessuno lo copre. Chiude un residuo che avevo dichiarato io.
//
// ── Verificato, non assunto ─────────────────────────────────────────────────
//
// Su AR-250 il difetto giurava che i chiusi «non sono a video» e invece lo erano: seguirlo alla
// lettera avrebbe svuotato una sezione. Qui ho guardato il componente PRIMA, e la risposta è
// l'opposto — gli aperti si disegnano, i chiusi no. Stessa domanda, risposta diversa: è il motivo
// per cui si guarda invece di assumere.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..", "..");
const { CAMPI_FINDING, eChiusoFinding, radiografiaSnella } = await import(join(REPO, "pannello/src/lib/radiografia-snella.ts"));

const casi = [];
const prova = (nome, fn) => {
  try { fn(); casi.push({ nome, ok: true }); }
  catch (e) { casi.push({ nome, ok: false, err: (e.message || String(e)).split("\n")[0] }); }
};
const peso = (o) => Buffer.byteLength(JSON.stringify(o));

prova("il caso che ha rotto: i findings CHIUSI non viaggiano più", () => {
  const r = {
    dimensioni: [{
      key: "una", voto: 7, stato: "giallo", sintesi: "s",
      findings: [
        { titolo: "aperto", stato: "aperto", descrizione: "x".repeat(500) },
        { titolo: "chiuso", stato: "chiuso", descrizione: "y".repeat(3000), fix: "z".repeat(2000) },
      ],
    }],
  };
  const out = radiografiaSnella(r);
  assert.equal(out.dimensioni[0].findings.length, 1, "resta solo l'aperto: il chiuso lo scarta la scheda");
  assert.equal(out.dimensioni[0].findings[0].titolo, "aperto");
  assert.ok(peso(out) < peso(r) / 3);
});

prova("il CONTEGGIO dei chiusi resta: «0 aperti» e «0 aperti, 12 chiusi» non dicono la stessa cosa", () => {
  const r = { dimensioni: [{ key: "k", findings: [
    { titolo: "a", stato: "chiuso" }, { titolo: "b", stato: "chiuso" }, { titolo: "c", stato: "aperto" },
  ] }] };
  const out = radiografiaSnella(r);
  assert.equal(out.dimensioni[0].findings_chiusi, 2, "per dimensione");
  assert.equal(out.findings_chiusi_non_inviati, 2, "e in totale, così il taglio è dichiarato e non nascosto");
});

prova("di un finding aperto restano i campi che la scheda disegna, non tutto l'oggetto", () => {
  const f = { titolo: "t", stato: "aperto", severita: "grave", fix: "come", roba_interna: "x".repeat(900) };
  const [voce] = radiografiaSnella({ dimensioni: [{ findings: [f] }] }).dimensioni[0].findings;
  assert.equal(voce.fix, "come", "il fix è a video: resta");
  assert.equal(voce.roba_interna, undefined, "i campi che nessuno mostra non viaggiano");
  assert.ok(CAMPI_FINDING.includes("severita"));
});

prova("le chiavi di primo livello che la scheda non legge non viaggiano", () => {
  const out = radiografiaSnella({ sintesi: "resta", sync_scan: { roba: "x".repeat(400) }, inventata: "via" });
  assert.equal(out.sintesi, "resta");
  assert.equal(out.inventata, undefined);
  assert.equal(out.sync_scan, undefined, "sync_scan lo usa calcolaLive lato server, non la scheda");
});

prova("una radiografia malformata non fa saltare la schermata", () => {
  assert.equal(radiografiaSnella(null), null);
  assert.deepEqual(radiografiaSnella({}).findings_chiusi_non_inviati, 0);
  // Trovato da questa prova mentre la scrivevo: il modulo inoltrava la stringa così com'è, e il
  // componente ci fa sopra un `.map` — la schermata sarebbe sparita. Ora diventa una lista vuota.
  assert.deepEqual(radiografiaSnella({ dimensioni: "non-una-lista" }).dimensioni, []);
  assert.deepEqual(radiografiaSnella({ dimensioni: [null, { findings: null }] }).dimensioni[0].findings, []);
  assert.equal(eChiusoFinding({}), false, "senza stato non si presume chiuso: sarebbe un finding che sparisce");
});

// ── Il guadagno vero, sul file di oggi ──────────────────────────────────────

prova("sul file VERO la risposta dimagrisce di almeno il 45%", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const prima = peso(vero);
  const dopo = peso(radiografiaSnella(vero));
  const risparmio = 1 - dopo / prima;
  assert.ok(risparmio >= 0.45, `atteso ≥45%, ottenuto ${Math.round(risparmio * 100)}% (${prima} → ${dopo})`);
  console.log(`      # ${prima.toLocaleString()} → ${dopo.toLocaleString()} byte (−${Math.round(risparmio * 100)}%)`);
});

prova("nessun finding APERTO si perde: sono quello che Nicola legge", () => {
  const vero = JSON.parse(readFileSync(join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json"), "utf8"));
  const apertiVeri = (vero.dimensioni || []).flatMap((d) => (d.findings || []).filter((f) => f.stato !== "chiuso"));
  const out = radiografiaSnella(vero);
  const mandati = out.dimensioni.flatMap((d) => d.findings);
  assert.equal(mandati.length, apertiVeri.length, "gli aperti non si troncano MAI");
  const titoliVeri = new Set(apertiVeri.map((f) => String(f.titolo)));
  for (const f of mandati) assert.ok(titoliVeri.has(String(f.titolo)));
});

prova("i chiusi sono davvero filtrati dalla scheda: la premessa del taglio, verificata", () => {
  // Se un giorno il componente smettesse di filtrarli, questo taglio diventerebbe una sezione vuota.
  // La premessa va provata, non ricordata — è esattamente l'errore di AR-250 al contrario.
  const src = readFileSync(join(REPO, "pannello/src/components/cervello/RadiografiaDiSe.tsx"), "utf8");
  assert.match(src, /\.findings \|\| \[\]\)\.filter\(\(f\) => \(f as Finding & \{ stato\?: string \}\)\.stato !== "chiuso"\)/,
    "la scheda deve continuare a scartare i findings chiusi: è la ragione per cui non li mandiamo");
});

prova("l'ordine conta: si conta PRIMA di sfoltire", () => {
  const src = readFileSync(join(REPO, "pannello/src/app/api/memoria/auto-radiografia/route.ts"), "utf8");
  assert.ok(src.indexOf("calcolaLive(radiografia, cantiere)") < src.indexOf("radiografiaSnella(radiografia)"),
    "invertendo, i totali si conterebbero su una radiografia già sfoltita e scenderebbero da soli");
  assert.match(src, /radiografia: radiografiaRidotta/);
});

let falliti = 0;
for (const c of casi) {
  console.log(`${c.ok ? "  ok" : "not ok"} - ${c.nome}${c.ok ? "" : `\n      ${c.err}`}`);
  if (!c.ok) falliti++;
}
console.log(`# pass ${casi.length - falliti}\n# fail ${falliti}`);
process.exit(falliti ? 1 : 0);
