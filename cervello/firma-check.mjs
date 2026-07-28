#!/usr/bin/env node
// AR-119 — guardiano del confine della firma: nessuno script del cervello scrive la firma di Nicola.
//
// Spiegazione completa del difetto e di cosa resta a Nicola: `cervello/firma-riservata.mjs`.
// In breve: la firma vive in `impostazioni` su Supabase, e il cervello quella tabella la scrive con
// la stessa chiave di servizio con cui la legge. Il confine, a livello di permessi, non c'è: c'è una
// convenzione. Questo guardiano la trasforma in un controllo che gira a ogni giro.
//
// 🟢 Sola lettura.
// Uso: node cervello/firma-check.mjs [--json]
// Exit (AR-322): 0 = confine rispettato · 1 = una violazione · 2 = non ho potuto leggere.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codiceUscita, difettiFirma } from "./firma-riservata.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const DIR = process.env.FIRMA_DIR || QUI;
const JSON_MODE = process.argv.includes("--json");

/**
 * Esenzioni: nessuna, ed è voluto.
 *
 * Alla prima stesura ce n'erano due — `git-github.mjs` e `sentinella-dati.mjs`, gli unici due script
 * che scrivono su `impostazioni` — con la motivazione «dichiara le sue chiavi». Ma non le
 * dichiaravano: era proprio per questo che erano esenti. Un'esenzione che dice il falso è peggio di
 * nessuna esenzione, perché chi la legge crede che il controllo sia passato.
 *
 * Ho fatto l'altra cosa: gliele ho fatte dichiarare davvero (`CHIAVI_SCRITTE`). Adesso il guardiano
 * parte verde con **zero** esenzioni, e la lista qui sotto esiste solo per il giorno in cui servirà
 * — col motivo scritto per esteso, come in porte-check.
 */
const ESENZIONI = {};

function main() {
  if (!existsSync(DIR)) {
    console.error(`⛔ FIRMA-CHECK CIECO: cartella non leggibile (${DIR})`);
    process.exit(2);
  }
  const file = readdirSync(DIR).filter((f) => f.endsWith(".mjs")).sort();
  if (!file.length) {
    console.error(`⛔ FIRMA-CHECK CIECO: nessuno script da leggere in ${DIR} — niente da controllare non è «tutto a posto».`);
    process.exit(2);
  }

  const violazioni = [];
  const dichiarati = [];
  for (const f of file) {
    if (f === "firma-riservata.mjs" || f === "firma-check.mjs") continue; // il guardiano e il suo metro
    let testo;
    try {
      testo = readFileSync(join(DIR, f), "utf8");
    } catch {
      continue;
    }
    for (const d of difettiFirma(testo, f)) {
      const motivo = ESENZIONI[f];
      // L'esenzione copre «scrive e non lo dichiara», MAI «scrive una firma»: quello è il difetto.
      if (d.difetto === "scrittura_non_dichiarata" && motivo && motivo.length > 10) {
        dichiarati.push({ file: f, motivo });
        continue;
      }
      violazioni.push(d);
    }
  }

  const rc = codiceUscita({ violazioni: violazioni.length });
  if (JSON_MODE) {
    console.log(JSON.stringify({ file: file.length, violazioni, esenti: dichiarati }, null, 2));
  } else {
    console.log(`\n🖊️  FIRMA-CHECK — chi può scrivere la firma di Nicola (${file.length} script letti)`);
    if (!violazioni.length) {
      console.log("   ✅ Nessuno script del cervello scrive una chiave di firma.");
      for (const e of dichiarati) console.log(`   · ${e.file}: scrive su impostazioni, esente — ${e.motivo.slice(0, 90)}…`);
    } else {
      console.log(`   ⛔ ${violazioni.length} violazioni del confine:`);
      for (const v of violazioni) console.log(`   • ${v.file}: ${v.difetto}${v.chiave ? ` (${v.chiave})` : ""}`);
    }
    console.log(
      "\n   Resta a Nicola la parte che il codice non può fare: una chiave Supabase con permessi\n" +
        "   ristretti (o una RLS) che vieti al ruolo del cervello di scrivere `azione:*:firma`.\n" +
        "   Finché non c'è, questo è un confine sorvegliato, non un confine chiuso.",
    );
  }
  process.exit(rc);
}

main();
