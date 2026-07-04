// 🧭 Navigazione tra le aree del Pannello, disaccoppiata (niente prop-drilling).
// Un qualsiasi componente può chiedere "portami all'area X, apri la scheda Y e
// scorri/evidenzia la casella Z" emettendo un evento; la Dashboard (page.tsx) lo
// ascolta e cambia vista + scroll + evidenziazione. Le aree con schede interne
// (Azioni, Cervello) ascoltano lo stesso evento e aprono la scheda giusta.
// Serve ai link bidirezionali "Da approvare" ⇄ origine: clicchi e arrivi alla casella esatta.

export type VistaNav =
  | "plancia"
  | "azioni"
  | "lavori"
  | "cervello"
  | "auto-coscienza"
  | "numeri"
  | "memoria"
  | "persone"
  | "operazioni"
  | "mondo"
  | "assistente"
  | "esplora"
  | "report"
  | "storico"; // legacy: reindirizza ad assistente → storico

export const EVENTO_VAI = "mycity:vai";
// 🧭 CONTRATTO DI NAVIGAZIONE: le sotto-schede non usano più window.location.hash.
// Chi cambia scheda timbra una voce di cronologia con pushState({vista, sub}); il
// popstate centrale (page.tsx) rilegge vista+sub e, per ripristinare la scheda,
// emette EVENTO_SUB: ogni area lo ascolta e riapre la scheda giusta. Un solo canale
// di cronologia (niente hash residuo che si mangia il tasto INDIETRO).
export const EVENTO_SUB = "mycity:sub";

export type DettaglioVai = { vista: VistaNav; anchor?: string; sub?: string };
export type DettaglioSub = { vista: string; sub: string };

/**
 * Vai a un'area del Pannello.
 * @param vista  l'area di destinazione
 * @param anchor (opz.) id della casella DOM da scorrere/evidenziare
 * @param sub    (opz.) la scheda interna da aprire (es. "approvare", "cantiere", "sentinelle")
 */
export function vaiArea(vista: VistaNav, anchor?: string, sub?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DettaglioVai>(EVENTO_VAI, { detail: { vista, anchor, sub } }));
}

// Cambio SOTTO-SCHEDA (contratto nav): pushState({vista, sub}) SENZA toccare l'hash,
// così l'URL non trascina residui e ogni INDIETRO è un passo visibile. (bug #2/#4)
export function vaiSub(vista: string, sub: string) {
  if (typeof window === "undefined") return;
  try {
    window.history.pushState({ vista, sub }, "", window.location.pathname + window.location.search);
  } catch {}
}

// Ripristino di una sotto-scheda dopo il tasto INDIETRO: il popstate centrale lo emette,
// le aree con schede interne lo ascoltano e riaprono la scheda giusta. (bug #2)
export function ripristinaSub(vista: string, sub: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DettaglioSub>(EVENTO_SUB, { detail: { vista, sub } }));
}
