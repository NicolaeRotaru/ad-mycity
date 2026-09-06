#!/usr/bin/env node
// 🧵 RICUCI — l'AD prende i frammenti delle squadre e li applica al registro del sito.
//
// Perché esiste: `radiografia-marketplace.json` è un registro solo, e 126 squadre non ci possono
// scrivere insieme. Le squadre consegnano `squadra-<N>.json`, qui si ricuce una volta sola, ad
// albero fermo.
//
// La chiave è FRAGILE e non si imita a mano: è `chiaveProblema` di cervello/referti-sito.mjs
// (`dimensione|titolo` normalizzati). Il primo collaudo del comando dei pacchetti trovò 356 chiavi
// su 361 che non combaciavano proprio perché il formato era stato copiato invece che chiamato.
//
// Uso: node MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/sito-2026-09-06/ricuci.mjs [--scrivi] [--pr <numero>]
//      senza --scrivi fa solo il resoconto.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chiaveProblema } from "../../../../../cervello/referti-sito.mjs";
import { timbroOra } from "../../../../../cervello/ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "../../../../..");
const REGISTRO = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json");
const SCRIVI = process.argv.includes("--scrivi");
const iPr = process.argv.indexOf("--pr");
const PR = iPr > -1 ? process.argv[iPr + 1] : null;

const ESITI_CHIUSI = new Set(["riparato", "gia_riparato_prima"]);

const leggi = (p) => JSON.parse(readFileSync(p, "utf8"));
const indentazioneDi = (t) => { const m = t.match(/^\{\r?\n(\s+)"/); return m ? m[1].length : 2; };
const salva = (p, o) => {
  const indent = indentazioneDi(readFileSync(p, "utf8"));
  writeFileSync(p, JSON.stringify(o, null, indent) + "\n");
};

const frammenti = readdirSync(QUI)
  .filter((f) => /^squadra-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => ({ nome: f, dati: leggi(join(QUI, f)) }));

if (!frammenti.length) {
  console.log("nessun frammento squadra-*.json: le squadre non hanno ancora consegnato");
  process.exit(2);
}

const reg = leggi(REGISTRO);
// L'indice si costruisce con la funzione di casa, su TUTTE le schede: una chiave che non combacia
// deve gridare, non sparire.
const perChiave = new Map(reg.problemi.map((p) => [chiaveProblema(p), p]));

const esiti = { chiusi: [], gia: [], aperti: [], mancanti: [], nuovi: 0, bloccati: 0 };
const timbro = timbroOra();

for (const { nome, dati } of frammenti) {
  const squadra = dati.squadra ?? nome;
  for (const d of dati.difetti || []) {
    const scheda = perChiave.get(d.chiave);
    if (!scheda) { esiti.mancanti.push(`${nome}: ${String(d.chiave).slice(0, 90)}`); continue; }
    if (!ESITI_CHIUSI.has(d.esito)) { esiti.aperti.push(`sq${squadra}: ${scheda.titolo.slice(0, 70)}`); continue; }
    if (SCRIVI) {
      scheda.stato = "chiuso";
      scheda.chiuso_il = timbro;
      scheda.chiuso_da = PR
        ? `lotto minori del sito 6/9/2026 — squadra ${squadra} — richiesta di unione NicolaeRotaru/mycity#${PR} (non ancora unita)`
        : `lotto minori del sito 6/9/2026 — squadra ${squadra}`;
      scheda.nota_riparazione = [d.nota_fix, d.prova ? `Prova: ${d.prova}` : null].filter(Boolean).join(" — ");
    }
    (d.esito === "gia_riparato_prima" ? esiti.gia : esiti.chiusi).push(scheda.titolo.slice(0, 70));
  }
  esiti.nuovi += (dati.difetti_nuovi || []).length;
  esiti.bloccati += (dati.bloccati || []).length;
}

if (SCRIVI) {
  // I contatori del referto vanno rifatti, o il Pannello disegna un totale che non esiste più.
  const aperti = reg.problemi.filter((p) => p.stato === "aperto");
  reg.meta = { ...reg.meta, findings: reg.problemi.length };
  for (const dim of reg.dimensioni || []) {
    const suoi = aperti.filter((p) => p.dimensione === dim.chiave || p.dimensione === dim.nome);
    if (typeof dim.findings === "number") dim.findings = suoi.length;
  }
  salva(REGISTRO, reg);
}

console.log(`frammenti letti: ${frammenti.length}`);
console.log(`chiusi come riparati: ${esiti.chiusi.length}`);
console.log(`trovati già a posto:  ${esiti.gia.length}`);
console.log(`lasciati aperti:      ${esiti.aperti.length}`);
console.log(`difetti nuovi visti:  ${esiti.nuovi}   ·   bloccati fuori territorio: ${esiti.bloccati}`);
if (esiti.mancanti.length) {
  console.log(`\n⚠️  ${esiti.mancanti.length} chiavi non combaciano con nessuna scheda — NON sono state chiuse:`);
  esiti.mancanti.slice(0, 20).forEach((m) => console.log("   · " + m));
}
esiti.aperti.slice(0, 20).forEach((a) => console.log("   ↩ ancora aperto — " + a));
console.log(SCRIVI ? "\n✍️  registro riscritto" : "\n(prova secca: rilancia con --scrivi per applicare)");
process.exit(esiti.mancanti.length ? 1 : 0);
