#!/usr/bin/env node
// memoria-senza-perdite.mjs — nessuno cancella la memoria di un altro senza dirlo.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// IL DIFETTO, dichiarato e mai chiuso. Lo scrive `cervello/scrivi-json.mjs` in cima a sé stesso,
// come seconda metà di AR-296:
//
//     ② IL LAVORO DELL'ALTRO CANCELLATO. Due processi che leggono lo stesso file, ci aggiungono una
//        cosa ciascuno e risalvano: l'ultimo che scrive cancella la riga del primo.
//
// Non è rimasta una frase teorica. Contate tutte le revisioni di `apprendimento.json` da fine
// giugno — 1.489 — il conto delle lezioni è SCESO sei volte, per undici lezioni in tutto:
//
//     04/07  −2   cutover del ramo unico
//     06/07  −1   riconcilia memoria
//     13/07  −2   chore: fix/menu-memoria-hub
//     16/07  −1   una risposta del worker
//     13/08  −3   giro AD
//     21/08  −2   riconcilia (le due lezioni di quel giorno, arrivate da PR firmate)
//
// Quattro lavori diversi, e nessuno di loro era il potatore. Nessuno aveva l'intenzione di togliere
// niente: ognuno aveva in mano una copia vecchia dell'archivio e l'ha risalvata intera.
//
// LA FORMA DEL RIMEDIO. La cura completa cambia il formato dei registri (append invece di oggetto
// riscritto), è un lavoro grosso e va fatto un registro alla volta. Questo è il freno che si può
// mettere subito e che non aspetta quella riscrittura: al punto unico da cui passa ogni scrittura
// atomica, si confronta ciò che sta per essere scritto con ciò che c'è sul disco ADESSO. Se sparisce
// una voce con un id, non la si lascia sparire.
//
// PERCHÉ RIMETTE INVECE DI RIFIUTARE. Un rifiuto fermerebbe il giro sul server per un difetto che
// non è del giro, e verrebbe aggirato al secondo giorno. Rimettere la voce e GRIDARLO tiene insieme
// le due cose che contano: la memoria non si perde, e l'incidente resta visibile. Chi toglie
// davvero — il potatore — lo dichiara, e allora passa.
//
// Uso: `node cervello/memoria-senza-perdite.mjs [file...]` per ispezionare a mano (sola lettura).

import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

/**
 * Gli archivi tenuti a id, e dove vivono le voci.
 * Solo `apprendimento.json` per ora, ed è una scelta: è l'archivio dove una perdita è irreversibile
 * (una lezione persa nessuno la riscrive) ed è l'unico dove ho MISURATO che succede. Allargare la
 * lista a registri che si rigenerano da soli aggiungerebbe rumore senza aggiungere sicurezza.
 */
export const ARCHIVI_A_ID = Object.freeze({
  "apprendimento.json": Object.freeze({ campo: "lezioni", chiave: "id" }),
});

/** La specifica per un percorso, o null se quel file non è un archivio a id. */
export function specDi(percorso) {
  return ARCHIVI_A_ID[basename(String(percorso || ""))] || null;
}

/** Le voci di una collezione, in modo tollerante: un archivio malformato non fa esplodere niente. */
function voci(dati, spec) {
  const a = dati?.[spec.campo];
  return Array.isArray(a) ? a : null;
}

/**
 * Gli id che c'erano e non ci sono più. Pura.
 * Torna [] anche quando non c'è niente da confrontare: un file nuovo o illeggibile non è una perdita,
 * ed è la distinzione che tiene questo freno lontano dai falsi allarmi.
 */
export function vociPerse(vecchio, nuovo, spec) {
  const prima = voci(vecchio, spec);
  const dopo = voci(nuovo, spec);
  if (!prima || !dopo) return [];
  const restano = new Set(dopo.map((v) => v?.[spec.chiave]).filter(Boolean));
  return prima.map((v) => v?.[spec.chiave]).filter((id) => id && !restano.has(id));
}

/**
 * Rimette le voci sparite, in fondo, senza toccare il resto.
 * Torna { dati, riaggiunte }: `dati` è lo stesso oggetto quando non c'è niente da rimettere, così
 * il caso normale non paga nessuna copia.
 */
export function riparaPerdita(vecchio, nuovo, spec) {
  const perse = vociPerse(vecchio, nuovo, spec);
  if (!perse.length) return { dati: nuovo, riaggiunte: [] };
  const persi = new Set(perse);
  const tornano = voci(vecchio, spec).filter((v) => persi.has(v?.[spec.chiave]));
  return { dati: { ...nuovo, [spec.campo]: [...voci(nuovo, spec), ...tornano] }, riaggiunte: perse };
}

/** L'archivio com'è sul disco adesso, o null se non c'è o non si legge. */
export function suDisco(percorso) {
  try {
    if (!existsSync(percorso)) return null;
    return JSON.parse(readFileSync(percorso, "utf8"));
  } catch {
    return null; // illeggibile: non ho un «prima» con cui confrontare, quindi non accuso nessuno
  }
}

/**
 * Il passaggio che `scriviJsonAtomico` chiama prima di scrivere.
 * `dichiaraRimozioni` è il permesso esplicito di chi toglie apposta (il potatore).
 */
export function primaDiScrivere(percorso, dati, { dichiaraRimozioni = false, log = console.error } = {}) {
  const spec = specDi(percorso);
  if (!spec || dichiaraRimozioni) return dati;
  const vecchio = suDisco(percorso);
  if (!vecchio) return dati;
  const { dati: riparati, riaggiunte } = riparaPerdita(vecchio, dati, spec);
  if (riaggiunte.length) {
    log(`🧠 MEMORIA SALVATA: questa scrittura di ${basename(percorso)} avrebbe tolto ${riaggiunte.length} voce/i che non ha dichiarato.`);
    log(`   ${riaggiunte.slice(0, 8).join(", ")}${riaggiunte.length > 8 ? " …" : ""}`);
    log(`   Rimesse. Chi scrive aveva in mano una copia vecchia — è il difetto ② di AR-296, misurato`);
    log(`   sei volte da fine giugno per undici lezioni. Chi toglie apposta lo dichiara e passa.`);
  }
  return riparati;
}

function main() {
  const file = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!file.length) {
    console.log("🧠 ARCHIVI TENUTI A ID (una perdita qui non la riscrive nessuno):");
    for (const [nome, s] of Object.entries(ARCHIVI_A_ID)) console.log(`   · ${nome} → voci in «${s.campo}», chiave «${s.chiave}»`);
    console.log("\n   Uso: node cervello/memoria-senza-perdite.mjs <file.json> per contarne le voci.");
    process.exit(0);
  }
  for (const f of file) {
    const spec = specDi(f);
    const d = suDisco(f);
    const n = spec && d ? (voci(d, spec) || []).length : null;
    console.log(`${f}: ${spec ? (n === null ? "illeggibile" : `${n} voci`) : "non è un archivio a id"}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
