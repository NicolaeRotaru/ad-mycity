// 🧭 Navigazione tra le aree del Pannello, disaccoppiata (niente prop-drilling).
// Un qualsiasi componente può chiedere "portami all'area X, apri la scheda Y e
// scorri/evidenzia la casella Z" emettendo un evento; la Dashboard (page.tsx) lo
// ascolta e cambia vista + scroll + evidenziazione. Le aree con schede interne
// (Azioni, Cervello) ascoltano lo stesso evento e aprono la scheda giusta.
// Serve ai link bidirezionali "Da approvare" ⇄ origine: clicchi e arrivi alla casella esatta.

// L'unico import: la voce di cronologia «pulita» vive in strati.ts perché è lì che nasce il
// marcatore che va tolto. Percorso con estensione .ts (allowImportingTsExtensions, già usato da
// selezione-autopilota.ts): così questo modulo resta eseguibile da un test Node, senza bundler.
import { voceDiNavigazione } from "./strati.ts";

export type VistaNav =
  | "plancia"
  | "azioni"
  | "lavori"
  | "cervello"
  | "salute-sito"
  | "auto-coscienza"
  | "numeri"
  | "analisi-report"
  | "memoria"
  | "persone"
  | "operazioni"
  | "mondo"
  | "intelligence"
  | "assistente"
  | "contenuti"
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
    const voce = voceSubDaTimbrare(window.history.state, vista, sub);
    if (!voce) return; // AR-245: niente è cambiato, niente da timbrare
    window.history.pushState(voce, "", window.location.pathname + window.location.search);
  } catch {}
}

/**
 * AR-245 — la voce da timbrare per un cambio di SCHEDA, o `null` se non c'è niente da timbrare.
 *
 * Il difetto: ritoccando la scheda su cui sei già (o toccandola due volte, cosa normalissima col
 * pollice) si timbrava comunque un gradino di cronologia. Poi l'indietro lo consumava senza cambiare
 * nulla a video: un colpo a vuoto, e sembra che il tasto sia rotto.
 *
 * La guardia esisteva già per il cambio di AREA (`if (ultimaVistaStoria.current !== vista)` in
 * page.tsx) ma viveva LÌ, non nell'atto: le schede sono entrate in cronologia dopo e non potevano
 * ereditarla. Qui sta dentro `vaiSub`, cioè al confine dell'atto, e vale per tutti e sei i chiamanti
 * (Azioni, Lavori, Memoria, Storico, Macchina) senza toccarli uno per uno.
 *
 * `voceDiNavigazione` spoglia i marcatori degli strati: una scheda nuova non è un pannello aperto
 * (AR-606).
 */
export function voceSubDaTimbrare(statoCorrente: unknown, vista: string, sub: string): Record<string, unknown> | null {
  const st = statoCorrente && typeof statoCorrente === "object" ? (statoCorrente as { vista?: unknown; sub?: unknown }) : null;
  if (st && st.vista === vista && st.sub === sub) return null;
  return voceDiNavigazione(statoCorrente, { vista, sub });
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

// ─────────────────────────────────────────────────────────────────────────────
// 🔗 I LINK PROFONDI (AR-609 / AR-610): un indirizzo scritto o salvato deve atterrare in un posto.
//
// Il Pannello è una pagina sola: l'area si sceglie con lo stato, e all'avvio veniva letta SOLO da
// `localStorage`. Quindi l'indirizzo non instradava niente: un vecchio link col cancelletto
// (`/#auto-coscienza`, finito in lettere e note) apriva l'ultima area visitata, e il cancelletto
// moriva in silenzio — funzionava per caso, solo se eri già sulla scheda giusta. E un percorso
// plausibile ma inesistente (`/azioni`: sono i nomi delle aree, è naturale digitarli) cadeva sul 404
// inglese di Next, senza una riga in italiano né un link per rientrare.
//
// Qui c'è la decisione — dove porta un indirizzo — come funzione pura. Chi la applica è page.tsx
// all'avvio (per il cancelletto) e not-found.tsx (per il percorso sbagliato).
// ─────────────────────────────────────────────────────────────────────────────

/** Le aree con il loro nome parlato: servono a instradare e a scriverlo in una pagina d'errore. */
export const AREE_NOTE: Record<string, string> = {
  plancia: "Plancia",
  azioni: "Azioni",
  lavori: "Lavori",
  cervello: "Macchina",
  "salute-sito": "Salute del sito",
  "auto-coscienza": "Auto-coscienza",
  numeri: "Numeri",
  "analisi-report": "Analisi e report",
  memoria: "Memoria",
  persone: "Persone",
  operazioni: "Operazioni",
  mondo: "Mondo",
  intelligence: "Intelligence",
  assistente: "Worker",
  contenuti: "Diretta contenuti",
};

export type Destinazione = { vista: VistaNav; sub?: string };

/** Normalizza un pezzo d'indirizzo: via il cancelletto, via le barre, tutto minuscolo. */
function ripulisci(pezzo: string | null | undefined): string {
  return String(pezzo || "")
    .trim()
    .replace(/^[#/]+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

/**
 * Dove porta un vecchio link col cancelletto. `null` se non porta da nessuna parte riconoscibile —
 * e in quel caso chi chiama NON deve muovere niente (l'area salvata resta quella che era).
 *
 * Regge sia `#azioni` sia `#azioni/approvare` (area + scheda). `#auto-coscienza` è il caso storico:
 * il link vecchio puntava alla card dell'auto-analisi, che oggi è la scheda «analisi» della sua area.
 */
export function destinazioneDaHash(hash: string | null | undefined): Destinazione | null {
  const pulito = ripulisci(hash);
  if (!pulito) return null;
  const [area, ...resto] = pulito.split("/");
  // Alias storici: viste vecchie che il Pannello sa già tradurre da sé (applicaVistaSalvata).
  const LEGACY: Record<string, Destinazione> = {
    "auto-coscienza": { vista: "auto-coscienza", sub: "analisi" },
    autocoscienza: { vista: "auto-coscienza", sub: "analisi" },
    report: { vista: "report" },
    esplora: { vista: "esplora" },
    storico: { vista: "storico" },
  };
  if (LEGACY[area] && !resto.length) return LEGACY[area];
  if (!AREE_NOTE[area] && !LEGACY[area]) return null;
  const sub = resto.join("/");
  return sub ? { vista: area as VistaNav, sub } : { vista: area as VistaNav };
}

/**
 * Dove voleva andare chi ha digitato un percorso che non esiste (`/azioni`, `/lavori/`). `null` se
 * non somiglia a niente di nostro.
 */
export function destinazioneDaPercorso(pathname: string | null | undefined): Destinazione | null {
  const pulito = ripulisci(pathname);
  if (!pulito) return null;
  return destinazioneDaHash(pulito);
}

/** Un link è una destinazione scritta come indirizzo: `/#azioni`, `/#azioni/approvare`. */
export function linkDiDestinazione(d: Destinazione | null): string {
  if (!d?.vista) return "/";
  return d.sub ? `/#${d.vista}/${d.sub}` : `/#${d.vista}`;
}

/**
 * AR-610 — le vie d'uscita da una pagina che non esiste. **Non è mai vuoto**: quello era il difetto —
 * una schermata che dice solo «404» e ti lascia lì. La prima via è l'area che il percorso sbagliato
 * lascia intendere (se si capisce), l'ultima è sempre la Cabina.
 */
export function viePerTornare(pathname: string | null | undefined): { testo: string; href: string }[] {
  const vie: { testo: string; href: string }[] = [];
  const d = destinazioneDaPercorso(pathname);
  if (d && AREE_NOTE[d.vista]) vie.push({ testo: `Vai a ${AREE_NOTE[d.vista]}`, href: linkDiDestinazione(d) });
  vie.push({ testo: "Torna alla Cabina", href: "/" });
  return vie;
}
