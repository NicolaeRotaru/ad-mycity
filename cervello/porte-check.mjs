#!/usr/bin/env node
// 🚪 GUARDIANO DELLE PORTE DI PUBBLICAZIONE — AR-127.
//
// Un cancello condiviso esiste (`gate_pubblicazione`) e funziona. Il problema è che non tutte le
// porte ci passano, e una porta scoperta non si vede: pubblica e basta.
//
// Terza volta che questa forma torna — AR-272 (uscite verso il mondo), AR-169 (invarianti del
// registro), ora i push. Quando una regola vive in N posti, prima o poi N-1 restano indietro.
//
// 🟢 Sola lettura. Uso: node cervello/porte-check.mjs [--json]
// Exit (AR-322): 0 = ogni porta passa dal cancello · 1 = porta scoperta · 2 = cieco

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codiceUscita, porteDi, porteScoperte } from "./porte-pubblicazione.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const JSON_MODE = process.argv.includes("--json");
const CARTELLA = process.env.PORTE_DIR || QUI;

/** Le porte che NON passano dal cancello, con il motivo. Un'esenzione senza perché non vale. */
const ESENZIONI = {
  "motore-ai.sh": "non pubblica: il push autenticato lo fa git-pr.mjs su un ramo di PR, mai su main — la riga è un commento di divieto",
};

function main() {
  if (!existsSync(CARTELLA)) {
    console.error(`⚠️  GUARDIANO CIECO: manca ${CARTELLA}.`);
    process.exit(2);
  }
  const file = readdirSync(CARTELLA).filter((f) => f.endsWith(".sh")).sort();
  if (!file.length) {
    console.error("⚠️  GUARDIANO CIECO: nessuno script da controllare.");
    process.exit(2);
  }
  const porte = file.flatMap((f) => porteDi(readFileSync(join(CARTELLA, f), "utf8"), f));
  const scoperte = porteScoperte(porte, ESENZIONI);
  const rc = codiceUscita({ scoperte: scoperte.length });

  const rapporto = { ok: rc === 0, porte_totali: porte.length, protette: porte.filter((p) => p.protetta).length, scoperte, esenzioni: Object.keys(ESENZIONI) };
  if (JSON_MODE) {
    console.log(JSON.stringify(rapporto, null, 2));
    process.exit(rc);
  }
  console.log(`🚪 Porte di pubblicazione — ${porte.length} trovate, ${rapporto.protette} passano dal cancello\n`);
  for (const p of porte) {
    const eti = p.protetta ? "✅" : ESENZIONI[p.file] ? "➖" : "🕳️ ";
    console.log(`   ${eti} ${p.file}:${p.riga}${p.protetta ? ` (cancello a riga ${p.gateSopraA})` : ""}`);
  }
  if (scoperte.length) {
    console.log(`\n   🕳️  ${scoperte.length} porte pubblicano SENZA cancello:`);
    for (const p of scoperte) console.log(`      · ${p.file}:${p.riga} — ${p.testo}`);
    console.log("\n   Falle passare da gate_pubblicazione, o dichiara il perché in porte-check.mjs (ESENZIONI).");
  } else {
    console.log("\n   ✅ Ogni porta passa dal cancello, o dice perché no.");
  }
  process.exit(rc);
}

main();
