#!/usr/bin/env node
// 🛑 IL FRENO CHE SCATTA — segna una lezione come usata QUANDO MI HA FERMATA, non quando te l'ho mostrata.
//
// PERCHÉ ESISTE. Nicola, 18/8, guardando la Cabina: «perché c'è solo il 12% delle lezioni citate?».
// Misurato: 61 lezioni su 521 contano come applicate, e di quelle 61 solo SEI portano una traccia
// esplicita. Le altre 55 contano perché il loro codice capita di comparire in un file recente. Cioè
// il numero misurava le CITAZIONI, non gli inciampi evitati — e la marcatura vera era un comando a
// mano (`tasso-lezioni.mjs applica`) che quasi nessuno lanciava.
//
// LA SCORCIATOIA CHE NON PRENDIAMO, scritta qui perché non venga presa domani: far segnare ogni
// lezione che la scheda CONSEGNA. Il numero salirebbe a quasi 100% in un giorno e sarebbe una bugia
// — misurerebbe «te l'ho mostrata», non «mi ha fermata». È l'asticella di Nicola del 10/8: «fatto»
// vuol dire che un comportamento è cambiato, non che una parola compare in un file.
//
// IL SEGNALE ONESTO. Ogni lezione seria porta un freno: un comando che diventa ROSSO se l'errore
// torna. Quando quel comando fallisce, quella lezione mi ha appena fermata — è un fatto osservabile,
// non un'opinione. Questo modulo marca l'uso SOLO su quel fallimento. Su verde non scrive niente.
//
// LA CHIAVE, e il suo limite dichiarato. Un freno è quasi sempre una PROVA (`cervello/test/X.test.mjs`)
// mentre chi mi blocca in faccia è il GUARDIANO (`cervello/X.mjs`). Sono due file, un mestiere solo:
// la chiave è il nome dello script senza `test/` e senza `.test`. Quindi il sorvegliante che rifiuta
// una modifica marca le lezioni il cui freno è la prova del sorvegliante. È un'euristica, ed è per
// questo che sta scritta: può unire due file che si chiamano uguale e fanno cose diverse.
//
// COSA NON PUÒ VEDERE, per non spacciarlo per completo: la volta in cui una lezione mi ha evitato
// l'errore in silenzio, senza che nessun freno scattasse. Quella resta invisibile, e va bene così:
// meglio un numero piccolo e vero che uno grande e gonfio.
//
// Uso:
//   node cervello/freno-scattato.mjs "<comando o script>" --rc <n> [--ref "<perché>"]
//   node cervello/freno-scattato.mjs "<comando>" --rc 1 --secco   # mostra chi marcherebbe, non scrive
//
// 🟢 Su rc 0 non tocca niente. Su rc≠0 scrive solo dentro `usi` delle lezioni interessate.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { AD_ROOT, nowPiacenza } from "./git-github.mjs";
import { scriviJsonAtomico } from "./scrivi-json.mjs";

export const APPR_PATH = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/auto-coscienza/apprendimento.json");

/**
 * La chiave di un freno: il nome dello script, senza cartella `test/` e senza `.test`.
 * `node --test cervello/test/sorvegliante.test.mjs` e `cervello/sorvegliante.mjs` → «sorvegliante».
 * Torna null se nel comando non c'è nessuno script riconoscibile: senza chiave non si marca niente.
 */
export function chiaveFreno(comando) {
  const c = String(comando || "");
  const m = c.match(/([\w./-]*\/)?([\w.-]+?)\.(?:m?js|cjs|sh)\b/);
  if (!m) return null;
  const nome = m[2].replace(/\.test$/, "").trim();
  return nome || null;
}

/** Le lezioni il cui freno ha la stessa chiave del comando fallito. */
export function lezioniDelFreno(lezioni = [], comando = "") {
  const chiave = chiaveFreno(comando);
  if (!chiave) return [];
  return lezioni.filter((l) => {
    const g = typeof l?.gate === "string" ? l.gate : "";
    return g && chiaveFreno(g) === chiave;
  });
}

/**
 * Puro: torna quante lezioni marcherebbe e quali, senza toccare il disco.
 * Su rc 0 torna sempre lista vuota — un freno verde non è un inciampo evitato.
 */
export function marcatura(dati, comando, { rc = 1, ref = "", quando = "" } = {}) {
  if (Number(rc) === 0) return { marcate: [], motivo: "il freno è verde: non ha fermato niente" };
  const lezioni = Array.isArray(dati?.lezioni) ? dati.lezioni : [];
  const colpite = lezioniDelFreno(lezioni, comando);
  if (!colpite.length) return { marcate: [], motivo: "nessuna lezione ha questo freno" };
  const riferimento = ref || `freno rosso: ${String(comando).trim()}`;
  const marcate = [];
  for (const l of colpite) {
    l.usi = Array.isArray(l.usi) ? l.usi : [];
    // Stessa forma di `tasso-lezioni.mjs applica`, e stessa difesa: due rossi identici nello stesso
    // momento non contano due volte — altrimenti un guardiano rumoroso gonfia il numero da solo.
    const gia = l.usi.some((u) => u && typeof u === "object" && u.ref === riferimento && u.quando === quando);
    if (!gia) {
      l.usi.push({ quando, ref: riferimento });
      marcate.push(l.id);
    }
  }
  return { marcate, motivo: marcate.length ? "" : "già marcate in questo istante" };
}

function main(argv) {
  const comando = argv[2] || "";
  const i = argv.indexOf("--rc");
  const rc = i >= 0 ? Number(argv[i + 1]) : 1;
  const j = argv.indexOf("--ref");
  const ref = j >= 0 ? String(argv[j + 1] || "") : "";
  const secco = argv.includes("--secco");
  if (!comando) {
    console.error('Uso: node cervello/freno-scattato.mjs "<comando>" --rc <n> [--ref "<perché>"] [--secco]');
    return 2;
  }
  // Un archivio assente o illeggibile NON diventa un silenzioso «tutto a posto»: si DICE, e si esce
  // con 2, che in questa casa vuol dire «non ho potuto misurare». Chi mi chiama (guardiano() nel giro,
  // esegui() nel cancello) stampa l'avviso e tira dritto col suo verdetto, che resta l'unica cosa che
  // conta per lui. Ingoiare qui sarebbe la malattia `fonte-troncata-letta-per-intera` commessa dentro
  // il pezzo che serve a rendere onesto un numero — e la spazzata dei fratelli me l'ha contestata.
  if (!existsSync(APPR_PATH)) {
    console.error(`⚠️  archivio delle lezioni non trovato (${APPR_PATH}): nessun uso marcato`);
    return 2;
  }
  let dati;
  try {
    dati = JSON.parse(readFileSync(APPR_PATH, "utf8"));
  } catch (e) {
    console.error(`⚠️  archivio delle lezioni illeggibile: ${e?.message || e} — nessun uso marcato`);
    return 2;
  }
  const quando = nowPiacenza();
  const { marcate, motivo } = marcatura(dati, comando, { rc, ref, quando });
  if (!marcate.length) {
    if (secco) console.log(`(niente da marcare: ${motivo})`);
    return 0;
  }
  if (secco) {
    console.log(`marcherebbe ${marcate.length}: ${marcate.join(", ")}`);
    return 0;
  }
  dati.aggiornato = quando;
  scriviJsonAtomico(APPR_PATH, dati); // indentazione conservata dal file (AR-522)
  console.log(`🛑 freno rosso → ${marcate.length} lezione/i marcate usate: ${marcate.join(", ")}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  process.exit(main(process.argv));
}
