#!/usr/bin/env node
// 📏 IL PESO DEI FILE CHE LA CABINA LEGGE — AR-449. 🟢 Sola lettura.
//
// PERCHÉ ESISTE, con la data. Il 2026-07-30 alle 02:03 `cantiere-difetti.json` ha superato
// 1.048.576 byte. La Contents API di GitHub non serve inline i file oltre quel tetto: torna
// `content` vuoto. Il Pannello lo leggeva come «file assente», «assente» diventava lista vuota e
// lista vuota diventava «Nessun difetto aperto 👍» — con 162 difetti aperti, per dodici ore, senza
// che niente lo dicesse. Nicola se n'è accorto guardando lo schermo.
//
// La seconda strada adesso c'è (Blobs API, fino a 100 MB), quindi il blackout non si ripete. Ma un
// file che cresce senza che nessuno lo guardi resta un modo di rompersi che aspetta il suo turno:
// oltre il MiB ogni lettura costa una richiesta in più, e sopra il tetto di casa (MAX_LETTURA) il
// Pannello si ferma comunque. Questo guardiano rende la crescita VISIBILE mentre è ancora innocua.
//
// LA REGOLA CHE PORTA VIA: non basta accorgersi di non sapere (quello il codice lo faceva già,
// AR-254). Serve una via d'uscita, e serve qualcuno che guardi il numero prima che diventi un muro.
//
// Uso:
//   node cervello/peso-file-cabina.mjs           -> report
//   node cervello/peso-file-cabina.mjs --json    -> JSON
// Exit: 0 = tutti sotto il muro · 1 = almeno uno oltre il muro · 2 = non ho potuto misurare (cieco)

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { timbroOra } from "./ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const ROOT = join(QUI, "..");

// Il tetto INLINE di GitHub: oltre questo serve la seconda strada (una richiesta in più a lettura).
const TETTO_INLINE = 1_048_576;

/**
 * Il muro vero: quanto il Pannello accetta di tenere in memoria. Si legge DA `obsidian.ts` invece di
 * riscriverlo qui — due copie dello stesso numero divergono, e la copia sbagliata è quella che ti
 * fa dormire tranquillo. Se non si riesce a leggerlo, il guardiano è CIECO (2), non verde.
 */
function muroDalCodice() {
  const f = join(ROOT, "pannello/src/lib/obsidian.ts");
  if (!existsSync(f)) return { ok: false, motivo: "pannello/src/lib/obsidian.ts non trovato" };
  const m = readFileSync(f, "utf-8").match(/const MAX_LETTURA = ([^;]+);/);
  if (!m) return { ok: false, motivo: "MAX_LETTURA non trovato in obsidian.ts" };
  try {
    const v = Function(`"use strict";return (${m[1]})`)();
    if (!Number.isFinite(v) || v <= 0) return { ok: false, motivo: `MAX_LETTURA illeggibile: ${m[1]}` };
    return { ok: true, muro: v };
  } catch {
    return { ok: false, motivo: `MAX_LETTURA non calcolabile: ${m[1]}` };
  }
}

// I file che la Cabina rilegge in continuo (area Cervello, ogni 30 secondi, anche da telefono).
const SORVEGLIATI = [
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-radiografia.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/storico-salute.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/auto-miglioramento.json",
  "MyCity-Vault/90-Memoria-AI/auto-coscienza/registro-realta.json",
  "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md",
  "MyCity-Vault/90-Memoria-AI/STATO.md",
];

const json = process.argv.includes("--json");
const muro = muroDalCodice();

const misure = [];
let ciechi = 0;
for (const rel of SORVEGLIATI) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    // Un file sorvegliato che non c'è NON è «pesa zero»: è una misura che manca.
    misure.push({ file: rel, byte: null, stato: "non-misurato", motivo: "file non trovato" });
    ciechi++;
    continue;
  }
  const byte = statSync(p).size;
  const stato = muro.ok && byte > muro.muro ? "oltre-il-muro" : byte > TETTO_INLINE ? "oltre-inline" : "ok";
  misure.push({ file: rel, byte, stato });
}

const oltreMuro = misure.filter((m) => m.stato === "oltre-il-muro");
const oltreInline = misure.filter((m) => m.stato === "oltre-inline");
const codice = !muro.ok || ciechi > 0 ? 2 : oltreMuro.length ? 1 : 0;

const report = {
  // AR-648 · AR-665 — qui c'era `new Date().toISOString()`: la forma giusta con dentro l'ora di
  // Greenwich, cioè un timbro che la Cabina mostrava come ora di casa essendo indietro di una o due
  // ore. Non si riparava perché la sua prova copiava questo file DA SOLO in una cartella
  // temporanea, dove un import non si risolve: la sabbiera obbligava lo script a bastare a sé
  // stesso, e uno script che deve bastare a sé stesso l'orologio se lo riscrive per forza. Adesso
  // la sabbiera segue la catena degli import e l'ora arriva da un posto solo.
  data: timbroOra(),
  tetto_inline: TETTO_INLINE,
  muro: muro.ok ? muro.muro : null,
  muro_motivo: muro.ok ? null : muro.motivo,
  misure,
  esito: codice === 0 ? "ok" : codice === 1 ? "oltre-il-muro" : "non-misurato",
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const kb = (n) => (n == null ? "  —  " : `${(n / 1024).toFixed(0).padStart(5)} KB`);
  console.log(`\n📏 PESO DEI FILE CHE LA CABINA LEGGE — ${report.data}\n`);
  if (!muro.ok) console.log(`   ⚪ muro non misurabile: ${muro.motivo}\n`);
  for (const m of misure.sort((a, b) => (b.byte || 0) - (a.byte || 0))) {
    const segno = m.stato === "oltre-il-muro" ? "⛔" : m.stato === "oltre-inline" ? "⚠️ " : m.stato === "non-misurato" ? "⚪" : "✅";
    const nota =
      m.stato === "oltre-il-muro" ? " — oltre il muro: la Cabina non lo mostra"
      : m.stato === "oltre-inline" ? " — oltre il tetto inline: ogni lettura costa una richiesta in più (seconda strada)"
      : m.stato === "non-misurato" ? ` — ${m.motivo}`
      : "";
    console.log(`  ${segno} ${kb(m.byte)}  ${m.file.replace("MyCity-Vault/90-Memoria-AI/", "")}${nota}`);
  }
  console.log();
  if (oltreMuro.length) {
    console.log(`⛔ ${oltreMuro.length} file oltre il muro (${muro.muro} byte): la Cabina non riesce a servirli.`);
    console.log(`   Alleggeriscili (l'archivio dei chiusi non serve alla lista dei difetti aperti) o alza MAX_LETTURA con cognizione.`);
  } else if (oltreInline.length) {
    console.log(`⚠️  ${oltreInline.length} file oltre il tetto inline di GitHub (${TETTO_INLINE} byte).`);
    console.log(`   Funzionano — passano dalla Blobs API — ma ogni lettura costa una richiesta in più, ogni 30 secondi.`);
    console.log(`   È il momento di separare l'archivio, non quando saranno un muro.`);
  } else if (codice === 0) {
    console.log("✅ tutti i file sorvegliati stanno sotto il tetto inline di GitHub.");
  }
  if (ciechi) console.log(`⚪ ${ciechi} file non misurati: esco 2 (cieco), non 0 — un file che non trovo non pesa zero.`);
}

process.exit(codice);
