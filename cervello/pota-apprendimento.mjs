#!/usr/bin/env node
// 🌿 POTATORE DELL'ARCHIVIO — AR-254 (metà b) / AR-199.
//
// Il fix di AR-254 ha due metà. La prima è nel Pannello: un `.json` non si tronca mai, e se non entra
// lo si DICE. Questa è la seconda: il file deve rientrare davvero, altrimenti la Cabina dirà per
// sempre «archivio non leggibile» — meglio del silenzio di prima, ma non è ancora imparare.
//
// Misurato il 28/7: `apprendimento.json` = 1.111.673 caratteri contro un tetto di lettura di
// 1.000.000. Togliere le 211 chiavi di servizio `_*` recupera 114.047 byte e porta a 1.017.222 —
// **non basta**. Servono anche le lezioni decadute, che oggi restano nel file per sempre.
//
// Regola: **si pota solo ciò che è già morto o è rumore di servizio.** Una lezione ATTIVA non si
// tocca — potare la memoria viva per far entrare un file è esattamente il difetto che AR-182 stava
// per causare da solo. E ogni potatura dichiara cosa ha tolto: un archivio che si sfoltisce in
// silenzio è indistinguibile da uno che perde pezzi.
//
// 🟢 Sola lettura senza `--applica`. Con `--applica` scrive SOLO nella memoria dell'AI
// (MyCity-Vault/90-Memoria-AI/), che è la sua, e tiene lo storico di ciò che ha tolto.
//
// Uso:
//   node cervello/pota-apprendimento.mjs             -> cosa toglierebbe (nessuna scrittura)
//   node cervello/pota-apprendimento.mjs --json      -> report JSON
//   node cervello/pota-apprendimento.mjs --applica   -> pota davvero (🟡)
//
// Exit: 0 = sotto il tetto (o già a posto) · 1 = ancora sopra il tetto dopo la potatura · 2 = cieco

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(QUI, "..");
const FILE = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");
const STORICO = join(REPO, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento-potato.json");
// Lo stesso tetto che usa chi legge (pannello/src/lib/obsidian.ts::MAX_LETTURA): il limite VERO
// della Contents API di GitHub. Due numeri diversi qui e là sarebbero due metri per la stessa cosa.
const TETTO = Number(process.env.APPRENDIMENTO_TETTO || 1_048_576);
const JSON_MODE = process.argv.includes("--json");
const APPLICA = process.argv.includes("--applica");

/** Cosa si può togliere, e cosa non si tocca MAI. */
export function pianoPotatura(dati, tetto = TETTO) {
  const j = dati && typeof dati === "object" ? dati : {};
  const lezioni = Array.isArray(j.lezioni) ? j.lezioni.filter(Boolean) : [];
  const chiaviServizio = Object.keys(j).filter((k) => k.startsWith("_") && k !== "_cosa_e");
  // Le decadute hanno già smesso di contare: restano nel file solo perché nessuno le toglie.
  const decadute = lezioni.filter((l) => l.stato === "decaduta");
  const vive = lezioni.filter((l) => l.stato !== "decaduta");
  const prima = Buffer.byteLength(JSON.stringify(j, null, 2));
  const dopoObj = { ...j, lezioni: vive };
  for (const k of chiaviServizio) delete dopoObj[k];
  const dopo = Buffer.byteLength(JSON.stringify(dopoObj, null, 2));
  return {
    prima,
    dopo,
    tetto,
    entra: dopo <= tetto,
    chiavi_servizio: chiaviServizio.length,
    lezioni_totali: lezioni.length,
    lezioni_decadute: decadute.length,
    lezioni_vive: vive.length,
    // Le vive NON si toccano: se anche togliendo tutto il resto non si entra, lo si dice e basta.
    residuo: Math.max(0, dopo - tetto),
    nuovo: dopoObj,
    tolte: { chiavi: chiaviServizio, lezioni: decadute.map((l) => ({ id: l.id, testo: String(l.testo || "").slice(0, 90) })) },
  };
}

function main() {
  if (!existsSync(FILE)) {
    console.error("⚠️  POTATORE CIECO: apprendimento.json non trovato.");
    process.exit(2);
  }
  let j;
  try {
    j = JSON.parse(readFileSync(FILE, "utf8"));
  } catch (e) {
    console.error(`⚠️  POTATORE CIECO: apprendimento.json non è JSON valido (${e.message}).`);
    process.exit(2);
  }

  const p = pianoPotatura(j);
  const fmt = (n) => n.toLocaleString("it");

  if (JSON_MODE) {
    const { nuovo, ...senzaDati } = p;
    console.log(JSON.stringify(senzaDati, null, 2));
  } else {
    console.log(`🌿 POTATURA DELL'ARCHIVIO — ${APPLICA ? "APPLICO" : "cosa toglierei"}\n`);
    console.log(`   Adesso:            ${fmt(p.prima)} byte   (tetto di lettura ${fmt(p.tetto)})`);
    console.log(`   Chiavi di servizio: ${p.chiavi_servizio} (note di metabolizzazione, gate, consolidamenti — nessuna schermata le mostra)`);
    console.log(`   Lezioni:            ${p.lezioni_totali} totali · ${p.lezioni_decadute} decadute (si tolgono) · ${p.lezioni_vive} vive (NON si toccano)`);
    console.log(`   Dopo:              ${fmt(p.dopo)} byte`);
    console.log(
      p.entra
        ? `   ✅ rientra sotto il tetto: la scheda Apprendimento torna a leggersi.`
        : `   ❌ NON rientra: mancano ancora ${fmt(p.residuo)} byte. Le lezioni vive non si potano per far entrare un file — serve alzare il tetto di lettura o spostare l'archivio fuori dal JSON servito.`
    );
  }

  if (APPLICA) {
    // La storia non si perde: ciò che tolgo finisce in un file suo, con la data.
    const precedente = existsSync(STORICO) ? JSON.parse(readFileSync(STORICO, "utf8")) : { potature: [] };
    precedente.potature = precedente.potature || [];
    precedente.potature.unshift({
      quando: new Date().toISOString().slice(0, 16).replace("T", " "),
      byte_prima: p.prima,
      byte_dopo: p.dopo,
      tolte: p.tolte,
    });
    scriviJsonAtomico(STORICO, precedente);
    scriviJsonAtomico(FILE, p.nuovo);
    console.log(`\n   Scritto: ${FILE}\n   Storico di ciò che ho tolto: ${STORICO}`);
  }

  process.exit(p.entra ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
