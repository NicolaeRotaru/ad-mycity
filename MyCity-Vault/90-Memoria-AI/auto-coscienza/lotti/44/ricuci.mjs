#!/usr/bin/env node
// 🧵 RICUCI — l'AD prende i frammenti delle corsie e li applica ai registri condivisi.
//
// Perché esiste: `cantiere-difetti.json`, `mutanti.json`, `malattie.json` e `tetti-lotto.json` sono
// quattro registri che TUTTE le corsie vorrebbero scrivere. Se ci scrivono insieme è AR-331
// moltiplicato per il numero di corsie. Quindi le corsie consegnano un frammento e qui si ricuce,
// una volta sola, ad albero fermo.
//
// Cosa NON fa, apposta: non tocca `stato`. Le chiusure le applica `auto-fix.mjs verifica --applica`
// DOPO il merge, che è la regola di casa (AR-331). Qui si scrivono solo `verifica` e `nota_fix`.
// E su un difetto che la corsia dichiara ancora APERTO si TOGLIE la verifica a pattern, o si
// richiuderebbe da solo smentendo la firma di Nicola.
//
// Uso:  node MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44/ricuci.mjs [--scrivi]     (senza --scrivi fa solo il resoconto)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { timbroOra } from "../../../../../cervello/ora-piacenza.mjs";

// `fileURLToPath` e non `.pathname`: un percorso con uno spazio o un accento arriva percent-encoded
// e lo script si spegne in silenzio (è la malattia di AR-720, non la rifacciamo qui).
const ROOT = dirname(dirname(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))));
const CANTIERE = join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const MUTANTI = join(ROOT, "cervello/mutanti.json");
const LOTTO = 44;
const SCRIVI = process.argv.includes("--scrivi");

const leggi = (p) => JSON.parse(readFileSync(p, "utf8"));

/**
 * L'indentazione che il file ha GIÀ — si conserva, non si impone.
 * Riscrivere un registro con un'altra indentazione cambia OGNI riga: la PR diventa illeggibile e
 * chiunque altro tocchi quel file trova un conflitto totale. Il cancello del commit lo blocca, e
 * ha ragione: qui l'ho pagato una volta scrivendo `mutanti.json` a 2 spazi quando ne aveva 1.
 */
const indentazioneDi = (testo) => {
  const m = testo.match(/^\{\r?\n(\s+)"/);
  return m ? m[1].length : 2;
};
const salva = (p, o) => {
  const indent = indentazioneDi(readFileSync(p, "utf8"));
  writeFileSync(p, JSON.stringify(o, null, indent) + "\n");
};

const frammenti = readdirSync(join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44"))
  .filter((f) => /^corsia-\d+\.json$/.test(f))
  .sort()
  .map((f) => ({ nome: f, dati: leggi(join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44", f)) }));

if (!frammenti.length) {
  console.log("nessun frammento in .lotto44/ — le corsie non hanno ancora consegnato");
  process.exit(2);
}

const cantiere = leggi(CANTIERE);
const mutanti = leggi(MUTANTI);
const perId = new Map(cantiere.difetti.map((d) => [d.id, d]));

const esiti = { riparati: [], aperti: [], mancanti: [], mutantiNuovi: 0, patternTolti: [] };
const patchPerAd = [];
const difettiNuovi = [];
const malattieDaCensire = [];

for (const { nome, dati } of frammenti) {
  for (const d of dati.difetti || []) {
    const scheda = perId.get(d.id);
    if (!scheda) {
      esiti.mancanti.push(`${d.id} (${nome}): id non trovato nel cantiere`);
      continue;
    }
    if (d.esito === "riparato") {
      if (!d.verifica_comando) {
        esiti.mancanti.push(`${d.id} (${nome}): riparato senza verifica_comando — NON applicato`);
        continue;
      }
      scheda.verifica = { tipo: "comando", comando: d.verifica_comando };
      if (d.nota_fix) scheda.nota_fix = d.nota_fix;
      scheda.lotto_riparazione = LOTTO;
      esiti.riparati.push(d.id);
      if (d.mutante?.file && d.mutante?.cerca) {
        const gia = mutanti.mutanti.find((m) => m.difetto === d.id && m.cerca === d.mutante.cerca);
        if (!gia) {
          mutanti.mutanti.push({
            lotto: LOTTO,
            difetto: d.id,
            nome: d.mutante.nome || `${d.id}: il cuore del fix rimesso com'era col difetto`,
            file: d.mutante.file,
            cerca: d.mutante.cerca,
            sostituisci: d.mutante.sostituisci ?? "",
            test: d.verifica_comando.replace(/^node\s+/, "").split(/\s+/)[0],
          });
          esiti.mutantiNuovi++;
        }
      } else {
        esiti.mancanti.push(`${d.id} (${nome}): riparato senza mutante — il cancello lo fermerà`);
      }
    } else {
      // Resta aperto: la vecchia prova a pattern si TOGLIE, o si richiude da sola (AR-444).
      const v = scheda.verifica;
      const aPattern = v && (v.pattern !== undefined || v.file !== undefined) && !v.comando;
      if (aPattern || d.togli_verifica_a_pattern) {
        if (aPattern) {
          scheda.verifica_storica = scheda.verifica;
          delete scheda.verifica;
          esiti.patternTolti.push(d.id);
        }
      }
      if (d.nota_fix || d.perche_resta_aperto) {
        scheda.nota_fix = d.nota_fix || d.perche_resta_aperto;
      }
      esiti.aperti.push(`${d.id}: ${d.perche_resta_aperto || "aperto"}`);
    }
  }
  for (const b of dati.bloccati || []) esiti.aperti.push(`${b.id}: BLOCCATO — ${b.serve}`);
  for (const p of dati.patch_per_ad || []) patchPerAd.push({ corsia: dati.corsia, ...p });
  for (const n of dati.difetti_nuovi || []) difettiNuovi.push({ corsia: dati.corsia, ...n });
  for (const m of dati.malattie_da_censire || []) malattieDaCensire.push({ corsia: dati.corsia, ...m });
}

console.log(`\n🧵 RICUCITURA LOTTO ${LOTTO} — ${frammenti.length} frammenti`);
console.log(`   ✅ riparati: ${esiti.riparati.length}`);
console.log(`   🔓 aperti/bloccati: ${esiti.aperti.length}`);
console.log(`   🧨 mutanti nuovi: ${esiti.mutantiNuovi}`);
console.log(`   🧹 prove a pattern tolte da difetti aperti: ${esiti.patternTolti.length}`);
if (esiti.mancanti.length) {
  console.log(`\n   ⚠️  DA GUARDARE A MANO (${esiti.mancanti.length}):`);
  esiti.mancanti.forEach((m) => console.log(`      · ${m}`));
}
if (patchPerAd.length) {
  console.log(`\n   🩹 patch chieste all'AD: ${patchPerAd.length}`);
  patchPerAd.forEach((p) => console.log(`      · [c${p.corsia}] ${p.file}: ${p.perche}`));
}
if (difettiNuovi.length) console.log(`\n   🆕 difetti nuovi da registrare: ${difettiNuovi.length}`);
if (malattieDaCensire.length) console.log(`   🦠 malattie da censire: ${malattieDaCensire.length}`);

if (SCRIVI) {
  mutanti.aggiornato = timbroOra();
  salva(CANTIERE, cantiere);
  salva(MUTANTI, mutanti);
  writeFileSync(
    join(ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/lotti/44/da-fare-ad.json"),
    JSON.stringify({ patchPerAd, difettiNuovi, malattieDaCensire, esiti }, null, 2) + "\n",
  );
  console.log("\n   💾 scritto: cantiere-difetti.json · mutanti.json · .lotto44/da-fare-ad.json");
} else {
  console.log("\n   (prova a vuoto — rilancia con --scrivi per applicare)");
}
