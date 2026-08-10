#!/usr/bin/env node
// 🔗 LA CODA LETTA COME LA LEGGE LA CABINA — una fonte, un lettore, un numero solo.
//
// PERCHÉ ESISTE (AR-569, trovato l'11/8 accodando due card e guardando il guardiano ignorarle).
//
// `AZIONI-IN-ATTESA.md` ha avuto due formati: una tabella a 8 colonne, e poi i blocchi `###` con
// «Cosa cambia» / «Se va bene». La Cabina è stata aggiornata al formato nuovo. `guardiano-tempo.mjs`
// no: leggeva solo le righe-tabella. Contate a mano l'11/8: **49 card a blocchi, 18 righe-tabella**.
// Il guardiano diceva «In attesa della tua firma: 5 · ✅ Coda sotto controllo».
//
// Il danno è doppio, ed è il motivo per cui questo difetto era bloccante. Il numero sbagliato è
// proprio quello che serve a capire **se Nicola è il collo di bottiglia**; e il verde «coda sotto
// controllo» spegne l'allarme che dovrebbe suonare. Nessuno se n'era accorto perché il guardiano
// non diceva «ho letto 18 righe su 67»: diceva un numero e un verde.
//
// LA CURA, e perché non è una seconda copia del parser. Il lettore della Cabina —
// `pannello/src/lib/azioni-attesa.ts`, 331 righe — conosce regole che non si riassumono: cosa
// distingue una sezione-manuale da un'azione vera, quando una ✅ nel corpo NON chiude la card, come
// si pesca il reparto, come si ripulisce il titolo. Riscriverle qui vorrebbe dire due copie che
// divergono al primo lotto: **è esattamente la malattia che questo difetto rappresenta** (AR-344 —
// una regola, una casa). Quindi qui non si riscrive niente: si CARICA quel file e lo si esegue.
//
// Il file è TypeScript e usa import relativi senza estensione (regola del bundler). Node 22 toglie
// i tipi da solo, e `cervello/test/risolvi-ts.mjs` — l'hook già scritto per i test del Pannello —
// insegna a Node l'estensione mancante. Qui si riusano tutti e due.
//
// ⚠️ SE NON SI PUÒ CARICARE, non si indovina: si ritorna `null` e chi chiama deve dire ⚪, non un
// numero. Un Node vecchio senza `process.features.typescript` è un caso reale (il VPS può averlo):
// meglio «non l'ho potuto contare» che un conteggio fatto con mezzo file.
//
// 🟢 Sola lettura: carica un modulo e lo esegue su un testo. Non scrive niente.

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { AD_ROOT } from "./git-github.mjs";

const QUI = dirname(fileURLToPath(import.meta.url));
const PARSER_CABINA = join(AD_ROOT, "pannello/src/lib/azioni-attesa.ts");

let cache; // il caricamento si fa una volta sola: l'hook si registra una volta per processo

/**
 * Carica il parser VERO della Cabina. Ritorna la funzione, oppure `null` col motivo.
 * @returns {Promise<{parse: Function}|{cieco: string}>}
 */
export async function lettoreDellaCabina() {
  if (cache) return cache;
  if (!existsSync(PARSER_CABINA)) {
    cache = { cieco: "pannello/src/lib/azioni-attesa.ts non c'è: non posso leggere la coda come la legge la Cabina" };
    return cache;
  }
  if (process.features?.typescript !== "strip" && process.features?.typescript !== "transform") {
    cache = { cieco: `questo Node (${process.version}) non sa togliere i tipi dai .ts: non posso caricare il lettore della Cabina` };
    return cache;
  }
  try {
    const { register } = await import("node:module");
    // L'hook va registrato PRIMA dell'import: insegna a Node l'estensione che il bundler indovina.
    register("./test/risolvi-ts.mjs", pathToFileURL(join(QUI, "/")));
    const m = await import(pathToFileURL(PARSER_CABINA).href);
    if (typeof m.parseAzioniAttesa !== "function") {
      cache = { cieco: "il lettore della Cabina non esporta più `parseAzioniAttesa`: il ponte è rotto, non tiro a indovinare" };
      return cache;
    }
    cache = { parse: m.parseAzioniAttesa };
  } catch (e) {
    cache = { cieco: `non ho potuto caricare il lettore della Cabina: ${String(e.message).slice(0, 120)}` };
  }
  return cache;
}

/**
 * Le azioni della coda, viste ESATTAMENTE come le vede Nicola nel Pannello.
 *
 * @param {string} [percorso] la coda da leggere (di norma quella vera)
 * @returns {Promise<{azioni: object[], fonte: string}|{cieco: string}>}
 */
export async function azioniDellaCoda(percorso = join(AD_ROOT, "MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md")) {
  if (!existsSync(percorso)) return { cieco: `${percorso} non c'è: non ho potuto contare niente` };
  const l = await lettoreDellaCabina();
  if (l.cieco) return { cieco: l.cieco };
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch (e) {
    return { cieco: `non ho potuto leggere la coda: ${e.message}` };
  }
  return { azioni: l.parse(testo), fonte: "pannello/src/lib/azioni-attesa.ts (lo stesso lettore della Cabina)" };
}

/**
 * Aspetta la firma di Nicola?
 *
 * Non lo decide questo file: lo decide la Cabina, che mette il suo verdetto nel campo `inAttesa` di
 * ogni azione. Qui si LEGGE quel verdetto e basta. La prima versione di questa funzione se lo
 * ricalcolava con una espressione regolare sugli stati — e sbagliava: contava come in attesa due
 * card dichiarate «SUPERATA», che nel Pannello non compaiono. Rifare a mano una regola che esiste
 * già è la stessa malattia del difetto che questo file cura.
 */
export function aspettaLaFirma(a) {
  return a?.inAttesa === true;
}
