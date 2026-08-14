#!/usr/bin/env node
// AR-199 — la potatura vera: la storia esce dai file vivi e va in `Storico/`, senza perdere niente.
//
// Fino a stasera `housekeeping-azioni.mjs` spostava le card chiuse **in fondo allo stesso file**:
// 253.414 byte su 311.250 stavano sotto l'intestazione «archivio» e viaggiavano lo stesso, a ogni
// giro e a ogni caricamento della Cabina. Spostare non è togliere.
//
// Qui la storia esce davvero — e resta consultabile, con il suo mese nel nome.
//
// 🟡 SCRIVE nella memoria dell'AD. Di default NON scrive: mostra cosa farebbe. Serve `--applica`.
// Prima di scrivere verifica `integro()`: se anche una sola riga si perderebbe, non tocca niente.
//
// Uso:
//   node cervello/pota-memoria.mjs              → dice cosa farebbe
//   node cervello/pota-memoria.mjs --applica    → lo fa

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NOTE_TENUTE, VOCI_TENUTE, integro, splittaCoda, splittaLog, splittaSnapshot } from "./archivio-memoria.mjs";
import { mesePiacenza, timbroOra } from "./ora-piacenza.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.POTA_REPO || join(QUI, "..");
const MEM = "MyCity-Vault/90-Memoria-AI";
const APPLICA = process.argv.includes("--applica");

// AR-648: il mese di PIACENZA. Con `toISOString()` la notte fra il 31 e il 1º, dalle 00:00 alle
// 01:00 (o 02:00 d'estate), l'archivio del mese nuovo finiva dentro la cartella del mese vecchio.
const mese = process.env.POTA_MESE || mesePiacenza();

/** Cosa fare per ogni file: la forma del file decide il taglio, non un'unica regola per tutti. */
const PIANO = [
  { file: "STATO.md", come: "snapshot", tieni: NOTE_TENUTE["STATO.md"] },
  { file: "SALA-OPERATIVA.md", come: "log", tieni: VOCI_TENUTE["SALA-OPERATIVA.md"] },
  { file: "AZIONI-IN-ATTESA.md", come: "coda" },
];

function dividi(testo, p) {
  if (p.come === "snapshot") {
    const s = splittaSnapshot(testo, { tieni: p.tieni });
    return { vivo: s.testa + s.vivo, storico: s.storico, dettaglio: `${s.noteTenute}/${s.noteTotali} note tenute` };
  }
  if (p.come === "log") {
    const s = splittaLog(testo, { tieni: p.tieni });
    return { vivo: s.testa + s.vivo, storico: s.storico, dettaglio: `${s.vociTenute}/${s.vociTotali} voci tenute` };
  }
  const s = splittaCoda(testo);
  return { vivo: s.vivo, storico: s.storico, dettaglio: s.trovato ? "card chiuse fuori dal file vivo" : "nessuna sezione archivio: non tocco niente" };
}

/**
 * I BYTE, non i caratteri. `"…".length` conta unità UTF-16: su un file pieno di accenti ed emoji dà
 * 466.594 dove il disco ne ha 479.575. Due strumenti che dicono «quanto pesa» con due unità diverse
 * si contraddicono davanti a chi legge — e questo lotto nasce proprio per rendere il peso un numero
 * di cui ci si può fidare.
 */
const peso = (s) => Buffer.byteLength(String(s || ""), "utf8");

function main() {
  let totalePrima = 0;
  let totaleDopo = 0;
  const righe = [];

  for (const p of PIANO) {
    const path = join(REPO, MEM, p.file);
    if (!existsSync(path)) { righe.push(`   ⚠️  ${p.file}: assente`); continue; }
    const originale = readFileSync(path, "utf8");
    const { vivo, storico, dettaglio } = dividi(originale, p);
    totalePrima += peso(originale);

    if (!storico.trim()) {
      totaleDopo += peso(originale);
      righe.push(`   ✅ ${p.file}: già snello (${dettaglio})`);
      continue;
    }

    // LA CONDIZIONE. Se anche una riga si perderebbe, non si scrive: meglio un file grosso che un
    // pezzo di memoria sparito.
    const g = integro(originale, vivo, storico);
    if (!g.ok) {
      righe.push(`   ⛔ ${p.file}: NON tocco — ${g.perse.length} righe si perderebbero, ${g.duplicate.length} si duplicherebbero`);
      totaleDopo += peso(originale);
      continue;
    }

    totaleDopo += peso(vivo);
    const relStorico = join("Storico", `${p.file.replace(/\.md$/, "")}-${mese}.md`);
    righe.push(
      `   ${APPLICA ? "✂️ " : "○"} ${p.file}: ${peso(originale).toLocaleString("it-IT")} → ${peso(vivo).toLocaleString("it-IT")} B ` +
        `(−${Math.round(100 - (peso(vivo) / peso(originale)) * 100)}%) · ${dettaglio} · storico → ${relStorico}`,
    );

    if (APPLICA) {
      const dest = join(REPO, MEM, relStorico);
      mkdirSync(dirname(dest), { recursive: true });
      const intestazione =
        `---\ntipo: storico\nfonte: ${p.file}\npotato: ${timbroOra()}\n---\n\n` +
        `> 📦 Storico di **${p.file}** (${mese}). Spostato qui da \`cervello/pota-memoria.mjs\` perché il file vivo\n` +
        `> viene riletto a ogni giro e spedito alla Cabina a ogni caricamento. **Niente è stato cancellato.**\n\n`;
      const gia = existsSync(dest) ? readFileSync(dest, "utf8") : "";
      writeFileSync(dest, gia ? `${gia}\n${storico}\n` : `${intestazione}${storico}\n`);
      writeFileSync(path, vivo.endsWith("\n") ? vivo : `${vivo}\n`);
    }
  }

  console.log(`\n🌿 POTATURA DELLA MEMORIA${APPLICA ? "" : " (prova: non scrivo niente, serve --applica)"}`);
  for (const r of righe) console.log(r);
  const risparmio = totalePrima - totaleDopo;
  console.log(
    `\n   Totale: ${totalePrima.toLocaleString("it-IT")} → ${totaleDopo.toLocaleString("it-IT")} B ` +
      `(−${Math.round((risparmio / Math.max(totalePrima, 1)) * 100)}%, ${Math.round(risparmio / 1024)} KB in meno a ogni giro e a ogni apertura della Cabina)`,
  );
  if (!APPLICA) console.log(`   Per farlo davvero: node cervello/pota-memoria.mjs --applica`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
