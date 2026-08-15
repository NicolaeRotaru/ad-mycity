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
// AR-244 — come si scrive un indirizzo che nomina area e scheda. Vive in `pagina-stato.ts` con il
// resto delle decisioni della pagina; quel modulo a sua volta chiama `destinazioneDaHash` di qui per
// LEGGERE un indirizzo. I due si citano a vicenda, ma solo DENTRO le funzioni (niente si esegue al
// caricamento): è il caso che ESM regge senza problemi, ed è meglio di due tabelle delle aree.
import { indirizzoDestinazione } from "./pagina-stato.ts";

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
//
// AR-244 — l'INDIRIZZO ora nomina area e scheda. Prima questo timbro riscriveva l'indirizzo come
// `pathname + search`, cioè lo lasciava com'era: la scheda su cui eri viveva solo dentro React e
// nella memoria del browser, due posti che un link non può trasportare. Adesso scrive
// `?a=<area>&s=<scheda>` — l'indirizzo che si può incollare in un messaggio e che riporta lì.
export function vaiSub(vista: string, sub: string) {
  if (typeof window === "undefined") return;
  try {
    const voce = voceSubDaTimbrare(window.history.state, vista, sub);
    if (!voce) return; // AR-245: niente è cambiato, niente da timbrare
    window.history.pushState(voce, "", indirizzoDestinazione({ vista, sub }, window.location.pathname));
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
let subPendente: { vista: string; sub: string; at: number; daIndirizzo?: boolean } | null = null;
if (typeof window !== "undefined") {
  const cattura = (e: Event) => {
    const det = (e as CustomEvent).detail as { vista?: string; sub?: string } | undefined;
    if (!det?.vista || !det.sub) return;
    // Se quello che sta passando è LO STESSO sub già parcheggiato da un indirizzo, non gli si
    // toglie il salvacondotto (vedi `parcheggiaSubDaIndirizzo`): è lo stesso intento, non uno nuovo.
    const daIndirizzo = Boolean(subPendente?.daIndirizzo && subPendente.vista === det.vista && subPendente.sub === det.sub);
    subPendente = { vista: det.vista, sub: det.sub, at: Date.now(), daIndirizzo };
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
  // Un sub arrivato da un INDIRIZZO non scade: chi ha aperto quel link vuole quella scheda anche se
  // l'area ci mette qualche secondo a comparire (AR-244).
  if (!subPendente.daIndirizzo && Date.now() - subPendente.at > SUB_TTL_MS) return null;
  const s = subPendente.sub;
  subPendente = null;
  return s;
}

/**
 * AR-244 — parcheggia la scheda chiesta da un INDIRIZZO (`?a=azioni&s=approvare`), senza scadenza.
 *
 * Il difetto visto a schermo: aprendo quel link il Pannello arrivava sull'area giusta ma sulla
 * scheda di default. L'evento che porta la scheda partiva subito dopo il caricamento, mentre l'area
 * — che si carica quando serve — compariva parecchio dopo: nessuno era ancora in ascolto, e la
 * finestra di freschezza di tre secondi (giusta per un salto fatto col dito) era già chiusa.
 * Un link non «invecchia» come un tocco: qui resta parcheggiato finché l'area lo viene a prendere.
 *
 * Restava rotto anche col vecchio cancelletto `#azioni/approvare`: verificato guidando il Pannello
 * prima del fix, sia sul codice di partenza sia su questo.
 */
export function parcheggiaSubDaIndirizzo(vista: string, sub: string) {
  if (!vista || !sub) return;
  subPendente = { vista, sub, at: Date.now(), daIndirizzo: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 📍 L'ANCORA CHIESTA DALL'INDIRIZZO (AR-673) — stesso parcheggio, altro passeggero.
//
// La casella dell'auto-coscienza si porta sott'occhio da sola quando si arriva da `/#auto-coscienza`,
// e per saperlo leggeva `window.location.hash` al proprio risveglio. Solo che il cancelletto lì non
// c'è già più: mezzo secondo prima il Pannello lo ha TRADOTTO nel nuovo indirizzo (`?a=auto-coscienza`)
// e lo ha tolto dalla barra — è la cura di AR-609/AR-244. Quando la casella si sveglia trova la
// tasca vuota, e non salta. Nessun errore, nessun segnale: gira e non fa niente.
//
// La scheda del difetto accusava un altro colpevole: «cerca un pezzo di pagina per nome, e quel nome
// non esiste più». Guardando il Pannello vero il nome c'è (finché è aperta la scheda Analisi): il
// colpevole è il cancelletto consumato prima. Sono due difetti in fila, e questo è il primo.
//
// La cura è quella che il Pannello usa già per la stessa malattia — chi riceve arriva dopo che il
// messaggio è passato: si parcheggia, senza scadenza, e chi arriva se lo viene a prendere.

let ancoraPendente: string | null = null;

/** Da `#auto-coscienza/altro` a `auto-coscienza`. Pura: è la parte che una prova può eseguire. */
export function nomeAncora(grezzo: string | null | undefined): string | null {
  const s = String(grezzo || "").trim().replace(/^#/, "").split("?")[0].split("/")[0].trim();
  return s || null;
}

/** L'indirizzo di partenza chiedeva un punto preciso della pagina: si tiene da parte. */
export function parcheggiaAncoraDaIndirizzo(hash: string | null | undefined) {
  const a = nomeAncora(hash);
  if (a) ancoraPendente = a;
}

/**
 * La casella chiede: «l'indirizzo chiedeva ME?». Si consuma: la seconda volta è no.
 *
 * Consumarla è la metà che conta. Senza, una casella che si rimonta salterebbe di nuovo, ed è
 * esattamente il difetto già pagato con AR-257: la pagina che si sposta da sola ogni mezzo minuto.
 */
export function ancoraChiesta(nome: string): boolean {
  if (!nome || ancoraPendente !== nome) return false;
  ancoraPendente = null;
  return true;
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
