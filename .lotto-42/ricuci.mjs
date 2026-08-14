#!/usr/bin/env node
// Ricucitura del lotto 42 — l'AD unisce i frammenti delle corsie nei registri condivisi.
//
// PERCHE ESISTE: quattro corsie che scrivono insieme in cantiere-difetti.json e mutanti.json
// sono AR-331 moltiplicato per quattro. Le corsie consegnano un frammento; qui si ricuce, una
// volta sola, ad albero fermo.
//
// LE DUE REGOLE CHE NON SI TOCCANO:
//  1. Si aggiornano SOLO `verifica` e `nota_fix`. Lo `stato` NO: le chiusure le applica
//     auto-fix.mjs DOPO il merge (AR-331), altrimenti due lotti aperti insieme litigano.
//  2. A ogni difetto dichiarato APERTO si TOGLIE la verifica a pattern. Se resta, auto-fix la
//     trova soddisfatta (il codice ora contiene il pattern) e RICHIUDE da solo un difetto che
//     abbiamo dichiarato aperto — smentendo cio su cui Nicola ha messo la firma.
//
// Uso:  node .lotto-42/ricuci.mjs [--applica]
//       senza --applica stampa cosa farebbe e non scrive niente.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOTTO = join(REPO, ".lotto-42");
const CANTIERE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json");
const MUTANTI = join(REPO, "cervello/mutanti.json");
const APPLICA = process.argv.includes("--applica");
const LOTTO_N = 42;

const leggi = (p) => JSON.parse(readFileSync(p, "utf8"));

/**
 * Con quanti spazi era indentato il file? Si legge dalla PRIMA riga rientrata, non si indovina.
 *
 * Pagato sul campo in questo stesso lotto: ho riscritto `mutanti.json` con `JSON.stringify(…, 2)`
 * per cambiarci due voci, e il guardiano del commit mi ha fermato — il file era a 1 spazio, quindi
 * il diff diventava 3.714 righe cambiate su 3.714. Il contenuto era giusto: era la FORMA a rendere
 * la richiesta di unione illeggibile e il conflitto totale per chiunque altro tocchi quel file.
 */
const rientroDi = (testo, difetto = 2) => {
  const m = testo.match(/^\{\r?\n( +)"/);
  return m ? m[1].length : difetto;
};

/** Riscrive un JSON tenendo il rientro che aveva: si cambia il contenuto, non la forma. */
const scrivi = (p, o, testoOriginale) =>
  writeFileSync(p, JSON.stringify(o, null, rientroDi(testoOriginale)) + "\n");

// ── i frammenti ─────────────────────────────────────────────────────────────
const frammenti = readdirSync(LOTTO)
  .filter((f) => /^corsia-[A-Z]\.json$/.test(f))
  .map((f) => ({ file: f, dati: leggi(join(LOTTO, f)) }));

if (!frammenti.length) {
  console.error("Nessun frammento corsia-*.json in .lotto-42/ — le corsie non hanno consegnato.");
  process.exit(1);
}

const testoCantiere = readFileSync(CANTIERE, "utf8");
const testoMutanti = readFileSync(MUTANTI, "utf8");
const cantiere = JSON.parse(testoCantiere);
const mutanti = JSON.parse(testoMutanti);
const perId = new Map(cantiere.difetti.map((d) => [d.id, d]));

const esiti = { riparato: [], aperto: [], "gia-riparato": [], ignoto: [] };
const problemi = [];
const mutantiNuovi = [];
const patternTolti = [];

for (const { file, dati } of frammenti) {
  const corsia = dati.corsia || file;
  for (const d of dati.difetti || []) {
    const scheda = perId.get(d.id);
    if (!scheda) { problemi.push(`${d.id} (${file}): non esiste nel cantiere`); continue; }

    const esito = d.esito || "ignoto";
    (esiti[esito] || esiti.ignoto).push({ id: d.id, corsia, nota: d.nota_fix });

    // ── nota_fix: sempre, e sempre tracciabile ──
    if (d.nota_fix) {
      scheda.nota_fix = `[lotto ${LOTTO_N} · ${corsia.split("—")[0].trim()}] ${d.nota_fix}`;
    }

    if (esito === "riparato" || esito === "gia-riparato") {
      if (!d.verifica_comando) { problemi.push(`${d.id}: esito ${esito} senza verifica_comando`); continue; }
      if (!/^node |^bash |^npx /.test(d.verifica_comando)) {
        problemi.push(`${d.id}: verifica_comando non e un comando ("${d.verifica_comando}")`);
      }
      // la prova diventa un COMANDO: mai piu {file, pattern, presente}
      scheda.verifica = { tipo: "comando", comando: d.verifica_comando };

      // la mutazione: senza, il cancello ferma la consegna (mutazione-mancante)
      if (d.mutante?.file && d.mutante?.cerca && d.mutante?.sostituisci) {
        mutantiNuovi.push({
          lotto: LOTTO_N,
          difetto: d.id,
          nome: d.non_vacuita || `${d.id} — la difesa smette di frenare`,
          file: d.mutante.file,
          cerca: d.mutante.cerca,
          sostituisci: d.mutante.sostituisci,
          test: d.verifica_comando.replace(/^node\s+/, "").split(/\s+/)[0],
        });
      } else if (esito === "riparato") {
        problemi.push(`${d.id}: RIPARATO senza mutazione — il cancello lo fermera`);
      }
    }

    if (esito === "aperto") {
      // LA REGOLA CHE SALVA LA FIRMA: via la prova a pattern, o si richiude da solo.
      const v = scheda.verifica || {};
      if (v.file || v.pattern || v.tipo === "pattern" || v.tipo === "grep") {
        patternTolti.push(`${d.id} — tolta ${JSON.stringify(v).slice(0, 70)}`);
        scheda.verifica = { tipo: "umano", nota: d.motivo_se_aperto || "dichiarato aperto nel lotto 42" };
      }
      if (d.motivo_se_aperto) {
        scheda.nota_fix = `[lotto ${LOTTO_N} · APERTO] ${d.motivo_se_aperto}`;
      }
    }
  }
}

// ── mutanti: UNIONE, mai sostituzione ───────────────────────────────────────
const chiave = (m) => `${m.file}::${m.cerca}`;
const gia = new Set((mutanti.mutanti || []).map(chiave));
const daAggiungere = mutantiNuovi.filter((m) => !gia.has(chiave(m)));

// ── referto ─────────────────────────────────────────────────────────────────
const R = [];
R.push(`RICUCITURA LOTTO ${LOTTO_N} — ${frammenti.length} corsie rientrate\n`);
for (const { file, dati } of frammenti) {
  const n = (dati.difetti || []).length;
  const rip = (dati.difetti || []).filter((d) => d.esito === "riparato").length;
  R.push(`  ${file.padEnd(16)} ${String(n).padStart(2)} difetti · ${rip} riparati · modulo: ${dati.modulo_condiviso || "—"}`);
}
R.push("");
R.push(`  riparati ......... ${esiti.riparato.length}`);
R.push(`  gia riparati ..... ${esiti["gia-riparato"].length}`);
R.push(`  dichiarati aperti  ${esiti.aperto.length}`);
if (esiti.ignoto.length) R.push(`  ⚠️  senza esito ... ${esiti.ignoto.length}`);
R.push("");
R.push(`  mutazioni nuove .. ${daAggiungere.length} (su ${mutantiNuovi.length} consegnate, ${mutantiNuovi.length - daAggiungere.length} gia presenti)`);
R.push(`  prove a pattern tolte dai difetti aperti: ${patternTolti.length}`);
for (const p of patternTolti) R.push(`     · ${p}`);

if (problemi.length) {
  R.push("");
  R.push(`  ❌ ${problemi.length} PROBLEMI — vanno risolti prima di consegnare:`);
  for (const p of problemi) R.push(`     · ${p}`);
}

// i difetti nuovi trovati dalle corsie: qui NON si scrivono, si elencano.
const nuovi = frammenti.flatMap(({ file, dati }) => (dati.difetti_nuovi || []).map((n) => ({ ...n, file })));
if (nuovi.length) {
  R.push("");
  R.push(`  🆕 ${nuovi.length} difetti NUOVI trovati riparando (da registrare a mano con id da origin/main):`);
  for (const n of nuovi) R.push(`     · [${n.file}] ${n.titolo}`);
}
const fuori = frammenti.flatMap(({ dati }) => dati.fuori_territorio || []);
if (fuori.length) {
  R.push("");
  R.push(`  🚧 ${fuori.length} pezzi fermati al confine del territorio:`);
  for (const f of fuori) R.push(`     · ${f}`);
}

console.log(R.join("\n"));

if (!APPLICA) {
  console.log("\n(prova a vuoto — niente scritto. Rilancia con --applica)");
  process.exit(problemi.length ? 1 : 0);
}

mutanti.mutanti = [...(mutanti.mutanti || []), ...daAggiungere];
mutanti.aggiornato = new Date().toISOString();
scrivi(CANTIERE, cantiere, testoCantiere);
scrivi(MUTANTI, mutanti, testoMutanti);
console.log(`\n✅ scritti: cantiere-difetti.json · mutanti.json`);
console.log("   Lo STATO non e stato toccato: le chiusure le applica auto-fix DOPO il merge.");
process.exit(problemi.length ? 1 : 0);
