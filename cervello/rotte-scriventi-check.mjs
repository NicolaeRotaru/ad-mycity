#!/usr/bin/env node
// 🔐 GUARDIANO DELLE ROTTE CHE SCRIVONO — AR-409/AR-226 (lotto 33).
//
// La serratura del Pannello lasciava passare tutto ciò che arrivava col verbo «leggi», e tre rotte
// che scrivono si aprivano proprio così. Il fix (serratura + elenco dichiarato) chiude quelle tre.
// Questo guardiano esiste per la domanda successiva, che è quella vera: **e la quarta?**
//
// Perché senza di lui il fix dura finché dura l'attenzione. L'elenco in `rotte-scriventi.ts` è pur
// sempre una lista scritta a mano, e ogni lista scritta a mano di questo lotto — gli attesi del
// battito, i vincoli del giro, le uscite, le porte — si era scollegata dal codice senza che nessuno
// potesse accorgersene. Qui la lista viene CONFRONTATA a ogni giro con la misura sul codice vero, e
// una rotta nuova che scrive da una GET fa fallire il giro il giorno stesso in cui nasce.
//
// 🟢 Sola lettura: legge i `route.ts` e non scrive niente.
// Uso: node cervello/rotte-scriventi-check.mjs [--json]
// Exit (AR-322): 0 = ogni rotta scrivente è coperta · 1 = una scoperta o una dichiarata di troppo
//                2 = non ho potuto misurare (⚪ non è mai ✅)

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codiceUscita, confronta, elencaFile } from "./perimetro.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const API = join(QUI, "..", "pannello", "src", "app", "api");
const JSON_MODE = process.argv.includes("--json");

/** Da `.../api/report/route.ts` al percorso che vede la serratura: `/api/report`. */
function percorsoRotta(rel) {
  const senza = rel.replace(/\/?route\.ts$/, "");
  return `/api${senza ? `/${senza}` : ""}`;
}

async function main() {
  if (!existsSync(API)) {
    console.error("⚠️  GUARDIANO CIECO: non trovo pannello/src/app/api — non ho potuto misurare nessuna rotta.");
    process.exit(2);
  }
  let misura;
  try {
    misura = await import(join(QUI, "..", "pannello", "src", "lib", "rotte-scriventi.ts"));
  } catch (e) {
    console.error(`⚠️  GUARDIANO CIECO: non riesco a caricare rotte-scriventi.ts (${e.message}).`);
    process.exit(2);
  }

  const file = elencaFile(API, { estensioni: ["route.ts"] });
  if (file == null || !file.length) {
    console.error("⚠️  GUARDIANO CIECO: nessun route.ts letto — «niente da controllare» non è «tutto a posto».");
    process.exit(2);
  }

  const scriventi = [];
  for (const rel of file) {
    let testo;
    try {
      testo = readFileSync(join(API, rel), "utf8");
    } catch {
      continue;
    }
    const scritture = misura.scriveInLettura(testo);
    if (scritture.length) scriventi.push({ percorso: percorsoRotta(rel), scritture });
  }

  const dichiarate = misura.SCRIVONO_IN_GET.map((r) => r.path);
  const esenzioni = Object.fromEntries(misura.SCRIVONO_IN_GET.map((r) => [r.path, r.perche]));
  // Qui `confronta` serve al contrario del solito: le «esenzioni» sono le voci dichiarate col loro
  // perché, quindi ciò che resta fuori è precisamente ciò che nessuno ha ancora deciso.
  const { mancanti, orfani, senzaMotivo } = confronta(dichiarate, scriventi.map((s) => s.percorso), {});
  const senzaPerche = Object.entries(esenzioni)
    .filter(([, p]) => String(p || "").trim().length < 30)
    .map(([k]) => k);

  const problemi = mancanti.length + orfani.length + senzaMotivo.length + senzaPerche.length;
  const rc = codiceUscita({ violazioni: problemi });
  const out = {
    ok: problemi === 0,
    rotte_lette: file.length,
    scrivono_in_get: scriventi,
    non_dichiarate: mancanti,
    dichiarate_ma_non_scrivono: orfani,
    dichiarate_senza_perche: senzaPerche,
  };

  if (JSON_MODE) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(rc);
  }

  console.log(`🔐 ROTTE CHE SCRIVONO DA UNA GET — ${file.length} rotte lette\n`);
  for (const s of scriventi) {
    const stato = dichiarate.includes(s.percorso) ? "🔒 dichiarata" : "❌ SCOPERTA";
    console.log(`   ${stato}  ${s.percorso}  — ${s.scritture.join(", ")}`);
  }
  if (mancanti.length) {
    console.log(`\n   ❌ ${mancanti.length} rotta/e scrivono da una GET e la serratura le lascia passare come letture:`);
    for (const p of mancanti) console.log(`      · ${p}`);
    console.log("      Dichiarale in pannello/src/lib/rotte-scriventi.ts (SCRIVONO_IN_GET) col perché,");
    console.log("      oppure — meglio — sposta la scrittura in una POST.");
  }
  if (orfani.length) console.log(`\n   ⚠️  dichiarate ma non scrivono più (l'elenco invecchia): ${orfani.join(", ")}`);
  if (senzaPerche.length) console.log(`\n   ❌ dichiarate senza un perché di sostanza: ${senzaPerche.join(", ")}`);
  if (!problemi) console.log("\n   ✅ Ogni rotta che scrive è dichiarata, e nessuna dichiarazione è invecchiata.");
  process.exit(rc);
}

main().catch((e) => {
  console.error(`⚠️  GUARDIANO CIECO: ${e.message}`);
  process.exit(2);
});
