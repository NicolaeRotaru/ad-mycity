#!/usr/bin/env node
// 🚧 IL GUARDIANO DELL'INDENTAZIONE — la malattia di AR-522 non si allarga più.
//
// AR-522 raccontava la catena giusta e curava un punto solo. Questo la chiude come FORMA: percorre i
// sorgenti di `cervello/`, trova ogni `writeFileSync(X, JSON.stringify(…, null, N))`, risolve X in un
// file vero e confronta N con l'indentazione che quel file ha SUL DISCO. Se differiscono, quella riga
// è la prossima macchina ferma per quattro giorni, e il guardiano fallisce PRIMA che accada.
//
// Uso:
//   node cervello/indentazione-guardia.mjs           # verdetto leggibile
//   node cervello/indentazione-guardia.mjs --json
//
// Uscita (contratto guardiani, AR-322):
//   0 = nessuna scrittura impone un'indentazione diversa da quella del file
//   1 = almeno una la impone → è il guasto, non si consegna
//   2 = non ho potuto leggere i sorgenti (⚪ dichiarato, non un verde)
//
// 🟢 Sola lettura: non scrive niente.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scrittureConIndentazioneFissa, verdetto } from "./indentazione-fissa.mjs";
import { indentazioneDi } from "./scrivi-json.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(QUI);
const JSON_OUT = process.argv.includes("--json");

/** I `.json` del repo indicizzati per nome: serve a risolvere un bersaglio di cui si sa solo la coda. */
function indiceJson(radice, dentro = new Map(), profondita = 0) {
  if (profondita > 4) return dentro;
  let voci;
  try {
    voci = readdirSync(radice, { withFileTypes: true });
  } catch {
    return dentro;
  }
  for (const v of voci) {
    // `.claude/` NON si salta: le skill hanno i loro registri JSON, e uno di quelli veniva riscritto
    // con la forma sbagliata. Saltare le cartelle col punto rendeva il guardiano cieco proprio lì.
    if (v.name === ".git" || v.name === "node_modules") continue;
    const p = join(radice, v.name);
    if (v.isDirectory()) indiceJson(p, dentro, profondita + 1);
    else if (v.name.endsWith(".json")) {
      const gia = dentro.get(v.name);
      dentro.set(v.name, gia ? [...gia, p] : [p]);
    }
  }
  return dentro;
}

/**
 * L'indentazione del file che un bersaglio indica, o `null` se non si riesce a dire QUALE file sia.
 *
 * Prima si prova il percorso per intero dalla radice del repo (il caso pulito). Poi per nome: se un
 * solo file del repo si chiama così, è quello. Se ce ne sono due, il bersaglio resta ambiguo e torna
 * `null` — meglio un ⚪ che un verde tirato a indovinare.
 */
function indentazioneReale(indice) {
  return (percorso) => {
    const diretto = join(REPO, percorso);
    if (existsSync(diretto) && statSync(diretto).isFile()) return indentazioneDi(diretto, null);
    const candidati = indice.get(percorso.split("/").pop()) ?? [];
    return candidati.length === 1 ? indentazioneDi(candidati[0], null) : null;
  };
}

function sorgenti(radice, dentro = [], profondita = 0) {
  if (profondita > 3) return dentro;
  let voci;
  try {
    voci = readdirSync(radice, { withFileTypes: true });
  } catch {
    return dentro;
  }
  for (const v of voci) {
    if (v.name.startsWith(".") || v.name === "node_modules" || v.name === "test") continue;
    const p = join(radice, v.name);
    if (v.isDirectory()) sorgenti(p, dentro, profondita + 1);
    else if (v.name.endsWith(".mjs")) dentro.push(p);
  }
  return dentro;
}

/** Il giro completo sul repo vero. Esportata così il test la esegue invece di rifarla. */
export function analizza(repo = REPO) {
  const indice = indiceJson(repo);
  const leggi = indentazioneReale(indice);
  const fuori = [];
  const nonMisurate = [];
  for (const file of sorgenti(join(repo, "cervello"))) {
    let testo;
    try {
      testo = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const v = verdetto(scrittureConIndentazioneFissa(testo), leggi);
    const rel = file.slice(repo.length + 1);
    fuori.push(...v.fuori.map((x) => ({ ...x, file: rel })));
    nonMisurate.push(...v.nonMisurate.map((x) => ({ ...x, file: rel })));
  }
  return { fuori, nonMisurate };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let esito;
  try {
    esito = analizza();
  } catch (e) {
    console.error(`⚪ INDENTAZIONE: non ho potuto leggere i sorgenti — ${e.message}`);
    process.exit(2);
  }
  if (JSON_OUT) {
    console.log(JSON.stringify(esito, null, 1));
  } else if (esito.fuori.length) {
    console.error(`❌ INDENTAZIONE: ${esito.fuori.length} scritture impongono al file una forma che il file non ha.`);
    for (const f of esito.fuori) {
      console.error(`   ${f.file}:${f.riga} → ${f.percorso} ha ${f.reale} spazi, ci scrive a ${f.indent}`);
    }
    console.error("   La cura: passare da scriviJsonAtomico (cervello/scrivi-json.mjs), che l'indentazione la LEGGE dal file.");
  } else {
    console.log(`✅ INDENTAZIONE: nessuna scrittura impone la forma (⚪ ${esito.nonMisurate.length} bersagli non risolvibili staticamente).`);
  }
  process.exit(esito.fuori.length ? 1 : 0);
}
