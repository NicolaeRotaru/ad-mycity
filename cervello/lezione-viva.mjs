// Le due cose che tengono viva una lezione, in un posto solo e ESEGUIBILI da una prova.
//
// AR-861 — perché questo file esiste. Le due domande «questa lezione ha un freno che monta ancora la
// guardia?» e «quand'è l'ultima volta che è servita?» vivevano dentro `cristallizza-apprendimento.mjs`,
// che al momento in cui lo importi FA il lavoro: legge l'archivio, fa decadere, riscrive. Una prova
// non poteva chiamarle senza far girare la cristallizzazione vera sul vault. Risultato: la prova che
// doveva difendere la regola di AR-771 — una lezione con un freno vivo non muore mai — simulava il
// decadimento SENZA passare quelle due risposte, cioè misurava una regola più debole di quella vera,
// e per giunta su quante lezioni ci fossero quel giorno.
//
// Qui sono funzioni, e la radice del repo è un argomento: chi le chiama dichiara dove guarda, e una
// prova può chiedergliele senza toccare niente.
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Il freno di una lezione monta ancora la guardia? (AR-771)
 * Vero solo se lo script citato nel campo `gate` esiste sul disco. Una stringa non è un guardiano:
 * se il file è stato tolto, la regola non è più in vigore e la lezione riprende a invecchiare.
 */
export function frenoVivoDi(lezione, radice) {
  const g = typeof lezione?.gate === "string" ? lezione.gate : "";
  const m = g.match(/([\w./-]*\/)?([\w.-]+\.(?:m?js|cjs|sh))\b/);
  if (!m) return false;
  const rel = (m[1] || "") + m[2];
  return existsSync(join(radice, rel));
}

/** La data dell'uso più recente, o null. È la traccia che lascia `freno-scattato.mjs` (AR-770). */
export function ultimoUsoDi(lezione) {
  const usi = Array.isArray(lezione?.usi)
    ? lezione.usi
    : Array.isArray(lezione?.applicata_in)
      ? lezione.applicata_in
      : [];
  const date = usi.map((u) => (typeof u === "string" ? u : u?.quando)).filter(Boolean).sort();
  return date.length ? date[date.length - 1] : null;
}
