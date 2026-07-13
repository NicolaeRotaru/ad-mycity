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
  | "salute-sito"
  | "auto-coscienza"
  | "numeri"
  | "memoria"
  | "persone"
  | "operazioni"
  | "mondo"
  | "assistente"
  | "esplora" // legacy → memoria/archivio/github
  | "report" // legacy → memoria/archivio
  | "storico"; // legacy → memoria/storico-*

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
//
// ⚠️ CAUSA-RADICE del bug "INDIETRO mi porta ad altre pagine": Next.js (App Router) tiene i
// SUOI internals di routing dentro history.state (__NA, __PRIVATE_NEXTJS_INTERNALS_TREE).
// Se qui sovrascrivessimo lo state con un oggetto pulito {vista, sub}, cancelleremmo quegli
// internals: al primo INDIETRO Next non riconosce più la voce e fa un RELOAD/salto di pagina.
// Perciò FONDIAMO con lo state esistente, esattamente come fa page.tsx per il cambio area.
export function vaiSub(vista: string, sub: string) {
  if (typeof window === "undefined") return;
  try {
    window.history.pushState(
      { ...(window.history.state || {}), vista, sub },
      "",
      window.location.pathname + window.location.search,
    );
  } catch {}
}

// Ripristino di una sotto-scheda dopo il tasto INDIETRO: il popstate centrale lo emette,
// le aree con schede interne lo ascoltano e riaprono la scheda giusta. (bug #2)
export function ripristinaSub(vista: string, sub: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DettaglioSub>(EVENTO_SUB, { detail: { vista, sub } }));
}

// 🧭 BUFFER DEI SUB PENDENTI (fix "INDIETRO / vai-all'azione apre la scheda sbagliata").
// vaiArea() e ripristinaSub() dispatchano EVENTO_VAI/EVENTO_SUB in modo SINCRONO, ma l'area di
// destinazione spesso NON è ancora montata (page.tsx fa setVista, e React monta l'area solo DOPO,
// per via del batching): il listener EVENTO_SUB dell'area non esiste ancora e il sub va perso →
// l'area apre la scheda di default invece di quella richiesta. Qui parcheggiamo l'ultimo sub; ogni
// area lo consuma al MOUNT (consumaSubPendente). Stesso principio del buffer di Documenti.tsx,
// generalizzato a tutte le aree con schede (Azioni, Lavori, Memoria, Cervello, Storico).
//
// Finestra di FRESCHEZZA: onoriamo il sub solo se è stato impostato da poco (< SUB_TTL_MS prima del
// mount). Così un cambio-area dal MENU (setVista diretto, senza sub) NON riapre una scheda vecchia
// rimasta nel buffer: il valore stantio è scaduto → l'area parte dal suo default.
const SUB_TTL_MS = 3000;
let subPendente: { vista: string; sub: string; at: number } | null = null;
if (typeof window !== "undefined") {
  const cattura = (e: Event) => {
    const det = (e as CustomEvent).detail as { vista?: string; sub?: string } | undefined;
    if (det?.vista && det.sub) subPendente = { vista: det.vista, sub: det.sub, at: Date.now() };
  };
  window.addEventListener(EVENTO_VAI, cattura);
  window.addEventListener(EVENTO_SUB, cattura);
}

/**
 * Da chiamare al MOUNT di un'area con schede: restituisce (e consuma) il sub parcheggiato per quella
 * vista se è fresco, altrimenti null (→ l'area usa il suo default). Idempotente: consuma una volta sola.
 */
export function consumaSubPendente(vista: string): string | null {
  if (!subPendente || subPendente.vista !== vista) return null;
  if (Date.now() - subPendente.at > SUB_TTL_MS) return null;
  const s = subPendente.sub;
  subPendente = null;
  return s;
}
