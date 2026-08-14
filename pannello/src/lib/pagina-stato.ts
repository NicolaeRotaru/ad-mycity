// 🧭 LO STATO DELLA PAGINA, FUORI DALLA PAGINA.
//
// LA MALATTIA (corsia 2, lotto 41). Un difetto solo, sei facce: lo stato che dice **dove sei**,
// **cosa stai guardando** e **com'è andata** vive dentro il componente-pagina (`app/page.tsx`,
// 3.800 righe) invece che nell'indirizzo o in un modulo che qualcuno possa interrogare.
// Da fuori non ci si può arrivare (un link non porta dove promette, AR-244); da dentro ogni battuta
// ridisegna tutto, anche ciò che è nascosto (AR-248, AR-249); e nessuno può chiedere alla pagina
// se il salvataggio è davvero atterrato sul server (AR-400).
//
// La cura non è una toppa per faccia: è togliere la decisione dal componente e metterla qui, dove
// un test la esegue davvero. Il componente resta il posto dove si disegna, non dove si decide.
//
// 🟢 Modulo puro: niente React, niente `window`, niente `fetch`. L'unico import è la medicina già
// in casa per «fatto vuol dire confermato» (`esito-scrittura.ts`) e la tabella delle aree note
// (`nav.ts`), perché una seconda copia dei nomi delle aree sarebbe la prossima bugia.
//
// Prove: cervello/test/c2-indirizzo.test.mjs · c2-cassetto.test.mjs · c2-salvataggio-chat.test.mjs
// · c2-telaio.test.mjs

import { destinazioneDaHash, type Destinazione } from "./nav.ts";
import { scritturaConfermata } from "./esito-scrittura.ts";

export type { Destinazione };

// ─────────────────────────────────────────────────────────────────────────────
// 1) DOVE SEI — l'indirizzo sa nominare area e scheda (AR-244)
// ─────────────────────────────────────────────────────────────────────────────
//
// Il difetto: ogni timbro di cronologia riscriveva l'indirizzo come
// `location.pathname + location.search`, cioè lo lasciava esattamente com'era. Area e scheda
// viaggiavano solo dentro lo stato di React e in `localStorage`: due posti che un link non può
// trasportare. Quindi il messaggio Telegram «approva dal Pannello» apriva l'ultima area visitata,
// e per arrivare alla coda da firmare servivano altri tre tocchi.
//
// La scelta di NON toccare l'indirizzo era nata giusta — l'hash si mangiava il tasto INDIETRO — ma
// è stata applicata a tutto, buttando via anche il link profondo. La cura non era «niente indirizzo»:
// era **parametri di ricerca** (`?a=azioni&s=approvare`), che quel difetto non ce l'hanno.

/** Il parametro che porta l'AREA (Azioni, Numeri, Memoria…). Corto perché finisce nei messaggi. */
export const PARAM_AREA = "a";
/** Il parametro che porta la SCHEDA interna dell'area (es. «approvare»). */
export const PARAM_SCHEDA = "s";

function pulisci(x: string | null | undefined): string {
  return String(x ?? "").trim();
}

/** Legge `a` e `s` da una stringa di ricerca (`?a=azioni&s=approvare`), senza URL né window. */
function parametri(search: string | null | undefined): { a: string; s: string } {
  const grezzo = pulisci(search).replace(/^[?]+/, "");
  const out = { a: "", s: "" };
  if (!grezzo) return out;
  for (const pezzo of grezzo.split("&")) {
    if (!pezzo) continue;
    const i = pezzo.indexOf("=");
    const chiave = i === -1 ? pezzo : pezzo.slice(0, i);
    const valore = i === -1 ? "" : pezzo.slice(i + 1);
    let decodificato = valore.replace(/\+/g, " ");
    try {
      decodificato = decodeURIComponent(decodificato);
    } catch {
      /* percento malformato: tengo il grezzo, non butto via l'indirizzo */
    }
    if (chiave === PARAM_AREA && !out.a) out.a = decodificato.trim();
    if (chiave === PARAM_SCHEDA && !out.s) out.s = decodificato.trim();
  }
  return out;
}

/**
 * AR-244 — dove porta un indirizzo. `null` se non porta da nessuna parte riconoscibile, e in quel
 * caso chi chiama NON deve muovere niente (resta l'ultima area salvata).
 *
 * Ordine di comando: **prima i parametri**, poi il vecchio cancelletto (`/#azioni/approvare`, che
 * gira ancora in lettere e note e continua a funzionare — AR-609). Un'area sconosciuta scritta nei
 * parametri non fa cadere il Pannello: si prova comunque il cancelletto.
 */
export function destinazioneDaIndirizzo(
  search: string | null | undefined,
  hash?: string | null | undefined,
): Destinazione | null {
  const { a, s } = parametri(search);
  if (a) {
    const daParametri = destinazioneDaHash(s ? `${a}/${s}` : a);
    if (daParametri) return daParametri;
  }
  return destinazioneDaHash(hash);
}

/**
 * AR-244 — l'indirizzo che NOMINA la destinazione: `/?a=azioni&s=approvare`.
 *
 * È il contrario esatto di quello che c'era: il vecchio timbro scriveva l'indirizzo di prima, quindi
 * cambiare area o scheda non lasciava traccia fuori dal browser. Qui la stessa coppia (area, scheda)
 * che il Pannello usa a video diventa qualcosa che si può incollare in un messaggio.
 *
 * `pathname` resta quello che è (il Pannello è una pagina sola): non si inventa un percorso che il
 * server non serve. Senza area si torna alla radice, senza scheda si scrive solo l'area.
 */
export function indirizzoDestinazione(
  dest: { vista?: string | null; sub?: string | null } | null | undefined,
  pathname: string = "/",
): string {
  const base = pulisci(pathname) || "/";
  const vista = pulisci(dest?.vista);
  if (!vista) return base;
  const sub = pulisci(dest?.sub);
  const q = [`${PARAM_AREA}=${encodeURIComponent(vista)}`];
  if (sub) q.push(`${PARAM_SCHEDA}=${encodeURIComponent(sub)}`);
  return `${base}?${q.join("&")}`;
}

/**
 * AR-244 — l'indirizzo da scrivere quando cambia l'AREA, senza buttare via la scheda del link.
 *
 * Il caso che l'ha resa necessaria, visto a schermo: apri `?a=azioni&s=approvare`, il Pannello passa
 * da «Plancia» ad «Azioni» e quel passaggio timbra una voce di cronologia — che riscriveva
 * l'indirizzo con la sola area, cancellando `s=approvare` un istante dopo il caricamento. Il link
 * funzionava e si auto-smontava.
 *
 * La regola: se l'indirizzo NOMINA GIÀ quest'area, la sua scheda resta (siamo arrivati da lì);
 * se stiamo andando in un'area diversa, la scheda di prima non c'entra più e se ne va.
 */
export function indirizzoDopoCambioArea(
  searchCorrente: string | null | undefined,
  vista: string,
  pathname: string = "/",
): string {
  const { a, s } = parametri(searchCorrente);
  const stessaArea = a && a.toLowerCase() === String(vista || "").toLowerCase();
  return indirizzoDestinazione({ vista, sub: stessaArea ? s : "" }, pathname);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) COSA SI DISEGNA — il cassetto chiuso non disegna niente (AR-248, AR-249)
// ─────────────────────────────────────────────────────────────────────────────
//
// AR-248: il cassetto delle conversazioni era nascosto in CSS (`-translate-x-full` + `aria-hidden`),
// non smontato: per React restava lì, e ogni render attraversava tutte le righe invisibili — con
// tre ricuciture complete del thread per riga.
// AR-249: la stringa di ricerca viveva nel componente-pagina e la casella la aggiornava a ogni
// battuta, quindi ogni lettera ridisegnava 3.800 righe di pagina; e il filtro faceva
// `toLowerCase()` su ogni messaggio di ogni conversazione, a ogni battuta.
//
// Qui la decisione — QUALI righe esistono — è una funzione sola: cassetto chiuso ⇒ nessuna riga,
// qualunque cosa ci sia dentro. Il componente si limita a disegnare quello che questa restituisce
// (e a non montare il contenuto quando è chiuso, che è la stessa regola detta a React).

/** Il minimo che serve per filtrare una conversazione: titolo e testo dei messaggi. */
export type ConversazioneFiltrabile = {
  id?: string;
  titolo?: string | null;
  messaggi?: { content?: string | null }[] | null;
};

/** Quanto si aspetta prima di filtrare mentre si scrive: una pausa di battuta, non un ritardo. */
export const RITARDO_RICERCA_MS = 200;

/**
 * AR-249 — l'indice di ricerca: per ogni conversazione UNA stringa già minuscola (titolo + messaggi).
 *
 * Prima la minuscola si ricalcolava per ogni messaggio di ogni conversazione a ogni battuta: sette
 * lettere di «garetti» = sette scansioni complete dell'archivio, con una copia nuova di ogni
 * messaggio ogni volta. Qui si paga una volta sola, quando l'elenco cambia.
 */
export function indiceRicercaConversazioni(conversazioni: ConversazioneFiltrabile[] | null | undefined): Map<string, string> {
  const idx = new Map<string, string>();
  for (const c of conversazioni || []) {
    if (!c) continue;
    const id = String(c.id ?? "");
    const testo = [String(c.titolo ?? ""), ...(c.messaggi || []).map((m) => String(m?.content ?? ""))]
      .join("\n")
      .toLowerCase();
    idx.set(id, testo);
  }
  return idx;
}

/**
 * AR-249 — quali conversazioni corrispondono a ciò che è stato scritto.
 *
 * Ricerca vuota (o soli spazi) = nessun filtro: si vedono tutte. L'indice è facoltativo — se non
 * arriva, il filtro se lo calcola al volo per la sola conversazione che sta guardando (così questa
 * funzione resta usabile anche da chi non tiene un indice).
 */
export function filtraConversazioni<T extends ConversazioneFiltrabile>(
  conversazioni: T[] | null | undefined,
  ricerca: string | null | undefined,
  indice?: Map<string, string> | null,
): T[] {
  const lista = (conversazioni || []).filter(Boolean) as T[];
  const q = pulisci(ricerca).toLowerCase();
  if (!q) return lista;
  return lista.filter((c) => {
    const id = String(c.id ?? "");
    const testo =
      (indice && indice.get(id)) ??
      [String(c.titolo ?? ""), ...(c.messaggi || []).map((m) => String(m?.content ?? ""))].join("\n").toLowerCase();
    return testo.includes(q);
  });
}

/**
 * AR-248 + AR-249 — le righe che il cassetto deve DISEGNARE.
 *
 * La regola che mancava, in una riga: **quello che non si vede non si disegna.** Cassetto chiuso ⇒
 * lista vuota, anche con cento conversazioni dentro. Cassetto aperto ⇒ le conversazioni che
 * corrispondono alla ricerca, nell'ordine in cui arrivano (l'ordinamento resta di chi chiama:
 * fissate in cima, poi per data).
 */
export function righeCassetto<T extends ConversazioneFiltrabile>(args: {
  aperto: boolean;
  conversazioni: T[] | null | undefined;
  ricerca?: string | null;
  indice?: Map<string, string> | null;
}): T[] {
  if (!args?.aperto) return [];
  return filtraConversazioni(args.conversazioni, args.ricerca, args.indice);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) COM'È ANDATA — «salvata» si dice solo se il server l'ha presa (AR-400)
// ─────────────────────────────────────────────────────────────────────────────
//
// Il difetto: `persistConversazione` restituiva un id anche quando non aveva salvato niente. Il
// ripiego locale (`loc_…`, «meglio che perdere tutto») tornava con lo STESSO tipo del successo,
// quindi nessuno dei dieci chiamanti poteva distinguerli: la chat diceva «salvata» e cambiando
// dispositivo non c'era. La rotta peggiora il travestimento rispondendo `{ok:false, id:null}` con
// HTTP 200 — un `res.ok` da solo non basta, e infatti `scritturaConfermata` pretende trasporto E
// corpo. La medicina esisteva già (lib/esito-scrittura.ts) ed era stata applicata a due punti
// piccoli e mai al più caro: qui la si applica dove si salva la chat.

export type EsitoSalvataggio = {
  /** L'id da usare d'ora in poi: quello del server se ha confermato, altrimenti il ripiego locale. */
  id: string | null;
  /** true SOLO se il server ha confermato. false = vive solo su questo dispositivo. */
  suServer: boolean;
};

/** L'id dentro il corpo di risposta, se c'è ed è una stringa vera. */
function idDalCorpo(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== "object") return null;
  const v = (corpo as { id?: unknown }).id;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/**
 * AR-400 — l'esito del salvataggio di una conversazione: quale id vale, e se è davvero sul server.
 *
 * Casi, tutti reali:
 *  · memoria non collegata            → id locale, `suServer:false` (lo sapevamo prima di partire);
 *  · risposta confermata con id       → id del server, `suServer:true`;
 *  · risposta confermata senza id     → resta l'id che avevamo (era un aggiornamento), `suServer:true`;
 *  · `{ok:false}` con HTTP 200        → NON confermata: id di ripiego, `suServer:false`;
 *  · rete caduta (`risposta` nulla)   → NON confermata: id di ripiego, `suServer:false`.
 *
 * `idDiRipiego` lo genera il chiamante (qui dentro non ci sono orologi né numeri a caso: è una
 * funzione pura e deve restare ripetibile).
 */
export function esitoSalvataggioConversazione(args: {
  idCorrente: string | null;
  memoriaCollegata: boolean;
  risposta?: { ok?: boolean; status?: number } | null;
  corpo?: unknown;
  idDiRipiego: string;
}): EsitoSalvataggio {
  const idCorrente = args.idCorrente || null;
  const ripiego = idCorrente || args.idDiRipiego || null;
  if (!args.memoriaCollegata) return { id: ripiego, suServer: false };
  const confermata = scritturaConfermata(args.risposta, args.corpo);
  if (!confermata) return { id: ripiego, suServer: false };
  const idServer = idDalCorpo(args.corpo);
  if (idServer) return { id: idServer, suServer: true };
  if (idCorrente) return { id: idCorrente, suServer: true };
  // Confermata ma senza id e senza id di partenza: non sappiamo dove è finita. Non è un successo.
  return { id: ripiego, suServer: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) IL TELAIO DELLA PAGINA — la protezione per la barra dell'iPhone (AR-417)
// ─────────────────────────────────────────────────────────────────────────────
//
// Il difetto: in quattro punti il Pannello calcola le distanze dal fondo con
// `env(safe-area-inset-bottom)`, ma su iOS quel valore resta ZERO se la pagina non dichiara
// `viewport-fit=cover`. La dichiarazione del viewport conteneva solo il colore del tema: quattro
// protezioni scritte e inerti, `calc(1rem + env(...))` = esattamente 1rem.
//
// Sta qui e non dentro `layout.tsx` per la stessa ragione di tutto il resto del modulo: era una
// decisione dentro il componente, quindi nessuno poteva chiederle com'era messa.

/** La dichiarazione di viewport del Pannello. `viewportFit` è ciò che accende la safe-area su iOS. */
export const VIEWPORT_PANNELLO = {
  themeColor: "#B15C43",
  viewportFit: "cover" as const,
};
