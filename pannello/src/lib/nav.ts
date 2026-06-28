// 🧭 Navigazione tra le aree del Pannello, disaccoppiata (niente prop-drilling).
// Un qualsiasi componente può chiedere "portami all'area X e, se c'è, alla casella Y"
// emettendo un evento; la Dashboard (page.tsx) lo ascolta, cambia vista e fa
// scroll + evidenzia la casella di destinazione. Serve ai link bidirezionali
// "Da approvare" ⇄ "Cervello": clicchi e arrivi alla casella esatta.

export type VistaNav =
  | "plancia"
  | "azioni"
  | "cervello"
  | "numeri"
  | "memoria"
  | "persone"
  | "operazioni"
  | "mondo"
  | "assistente"
  | "storico";

export const EVENTO_VAI = "mycity:vai";

export type DettaglioVai = { vista: VistaNav; anchor?: string };

/** Vai a un'area del Pannello e, se passato, scorri/evidenzia la casella con id = anchor. */
export function vaiArea(vista: VistaNav, anchor?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DettaglioVai>(EVENTO_VAI, { detail: { vista, anchor } }));
}
