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
  | "storico"; // legacy: reindirizza ad assistente → storico

export const EVENTO_VAI = "mycity:vai";

export type DettaglioVai = { vista: VistaNav; anchor?: string; sub?: string };

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
