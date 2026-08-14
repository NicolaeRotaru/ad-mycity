/**
 * 🃏 LE DECISIONI DI UNA CASELLA DEL PANNELLO — fuori da React, dove un test le può ESEGUIRE.
 *
 * La malattia (lotto 42, corsia E). Nel Pannello la logica che decide — quale risposta mostrare,
 * se un bottone è già stato premuto, come si legge un titolo, se una casella è aperta — viveva
 * dentro i componenti. Lì una prova può solo RILEGGERE il file: cerca una parola e la trova, e da
 * quel momento dichiara chiuso un difetto che nessuno ha mai fatto girare. È così che sei difetti
 * sono sopravvissuti a due radiografie: la loro prova controllava la forma, non l'effetto.
 *
 * Qui dentro non c'è React e non c'è nessuna lettura di rete o di disco: solo dati che entrano e
 * dati che escono. Il componente resta con le mani (stato, fetch, JSX) e chiama queste funzioni.
 *
 * Case in casa della stessa famiglia: `coda-azioni.ts` (quali schede montare), `salto-azione.ts`
 * (dove atterra «vai all'azione»), `atto-unico.ts`, `cervello/ora-piacenza.mjs`.
 *
 * Cinque sezioni, una per difetto:
 *   ① AR-675 — UNO stato per casella (prima erano due, con nomi quasi uguali).
 *   ② AR-615 — l'antirimbalzo del doppio tocco come DATO, non come `disabled` sparso a mano.
 *   ③ AR-616 — il titolo che si mostra passa SEMPRE dal filtro, anche quando viene dallo storico.
 *   ④ AR-614 — i colori di un livello nascono con la loro gemella per il tema scuro.
 *   ⑤ AR-607/AR-602 — cosa può promettere una schermata di guasto, e quale risposta è quella vera.
 */

import { cardAperta as soloLaPrimaAperta } from "./coda-azioni.ts";
import { pulisciTitolo } from "./azioni-attesa.ts";
import { testoPulito } from "./format.ts";

// ═══════════════════════════════════════════════════════════════════════════
// ① AR-675 · UNO stato per casella
//
// Il difetto: in Azioni.tsx convivevano `aperte` (un Set: comanda il testo esatto DENTRO la card)
// e `scelteCard` (un Record: comanda la card aperta o chiusa). Due nomi quasi uguali per due cose
// diverse. AR-612 è nato proprio lì: chi ha scritto il salto ha aperto quello sbagliato, in buona
// fede, e il bottone «vai all'azione» sembrava rotto. Finché restano due, il prossimo chiamante
// sbaglia di nuovo — quindi la cura non è correggere quel salto, è che ce ne sia UNO solo.
// ═══════════════════════════════════════════════════════════════════════════

/** Cosa è aperto di UNA casella: la scheda, e il testo esatto che sta dentro la scheda. */
export type PezzoCasella = { readonly card?: boolean; readonly testo?: boolean };
/** id della casella → cosa ne ha deciso Nicola. Un id assente = non ha ancora deciso lui. */
export type StatoCarte = Readonly<Record<string, PezzoCasella>>;

export const NESSUNA_CARTA: StatoCarte = Object.freeze({});

/** Copia con UNA casella modificata. Sempre un oggetto nuovo: React ridisegna solo se cambia. */
function conCasella(stato: StatoCarte | null | undefined, id: string, pezzo: PezzoCasella): StatoCarte {
  const s = stato || NESSUNA_CARTA;
  return { ...s, [id]: { ...(s[id] || {}), ...pezzo } };
}

/**
 * La scheda è aperta?
 *
 * La regola «comanda Nicola, altrimenti resta aperta solo la prima» esiste già ed è provata in
 * `coda-azioni.ts`: qui NON si riscrive, si riusa. Cambia solo da dove arriva la memoria.
 *
 * Il nome resta `cardAperta` di proposito: è il nome che il Pannello chiama da AR-219 in poi, ed è
 * il nome che la rete di sicurezza cerca nel componente.
 */
export function cardAperta(stato: StatoCarte | null | undefined, id: string, indice: number): boolean {
  const s = stato || NESSUNA_CARTA;
  const scelte: Record<string, boolean> = {};
  for (const k of Object.keys(s)) {
    const v = s[k]?.card;
    if (typeof v === "boolean") scelte[k] = v;
  }
  return soloLaPrimaAperta(id, indice, scelte);
}

/** Il testo esatto dentro la scheda è aperto? Qui non c'è nessuna regola di default: chiuso finché non lo apri. */
export function testoAperto(stato: StatoCarte | null | undefined, id: string): boolean {
  return Boolean((stato || NESSUNA_CARTA)[id]?.testo);
}

/** Nicola ha aperto o chiuso QUELLA scheda: da adesso comanda lui. */
export function segnaCard(stato: StatoCarte | null | undefined, id: string, aperta: boolean): StatoCarte {
  const s = stato || NESSUNA_CARTA;
  if (s[id]?.card === aperta) return s; // niente oggetto nuovo se non cambia niente
  return conCasella(s, id, { card: aperta });
}

/** Gira il testo esatto: aperto ↔ chiuso. */
export function giraTesto(stato: StatoCarte | null | undefined, id: string): StatoCarte {
  return conCasella(stato, id, { testo: !testoAperto(stato, id) });
}

/**
 * L'ATTERRAGGIO di «vai all'azione collegata»: scheda aperta E testo aperto, in una chiamata sola.
 *
 * È questa la riga che chiude AR-675 alla radice. Prima erano due chiamate a due stati diversi e
 * bastava dimenticarne una — o azzeccare quella sbagliata — perché il link atterrasse su una riga
 * muta. Con una funzione sola non c'è più uno stato sbagliato da scegliere.
 */
export function apriPerAtterraggio(stato: StatoCarte | null | undefined, id: string): StatoCarte {
  return conCasella(stato, id, { card: true, testo: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// ② AR-615 · l'antirimbalzo del doppio tocco, come DATO
//
// Il difetto: «Approva proposta» e le decisioni della coda avevano il loro blocco anti-doppio-tocco;
// «Ignora» no. Il bottone non si spegneva e la funzione non guardava nessun blocco, quindi un doppio
// tocco su telefono mandava due richieste. Su rete lenta il doppio tocco è la norma, non l'eccezione.
//
// La radice non è quel bottone: è che ogni bottone si era scritto il SUO blocco (`decidendo` Set,
// `propBusy` stringa, `sceltaBusy` booleano). Tre meccanismi diversi, e bastava scordarne uno.
// Da qui in avanti il meccanismo è UNO e vale per tutti: chi si scorda di usarlo non ha un bottone
// che parte due volte, ha un bottone che non parte affatto — cioè un errore che si vede subito.
// ═══════════════════════════════════════════════════════════════════════════

/** Gli id con una richiesta in volo adesso. */
export type Premuti = Readonly<Record<string, true>>;
export const NESSUNO_PREMUTO: Premuti = Object.freeze({});

/** C'è già una richiesta in volo per questo id? Se sì, il secondo tocco si butta via. */
export function giaPremuto(stato: Premuti | null | undefined, id: string): boolean {
  return Boolean((stato || NESSUNO_PREMUTO)[id]);
}

/** Segna l'id come «in volo». Oggetto nuovo, così il bottone si spegne davvero a schermo. */
export function segnaPremuto(stato: Premuti | null | undefined, id: string): Premuti {
  const s = stato || NESSUNO_PREMUTO;
  if (s[id]) return s;
  return { ...s, [id]: true };
}

/** La richiesta è tornata (bene o male): l'id torna libero. Va SEMPRE fatto, anche dopo un errore. */
export function liberaPremuto(stato: Premuti | null | undefined, id: string): Premuti {
  const s = stato || NESSUNO_PREMUTO;
  if (!s[id]) return s;
  const n: Record<string, true> = { ...s };
  delete n[id];
  return n;
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ AR-616 · il titolo che arriva sotto gli occhi di Nicola
//
// Il difetto: ogni lista del Pannello passa i titoli dal filtro che toglie sigle, identificativi e
// percorsi. L'unica eccezione era il Registro, che stampava il titolo nudo. Finché il titolo arriva
// dal lettore della coda è già pulito, ma il Registro conserva duecento voci storiche salvate com'erano
// al momento della decisione: quelle scritte prima che il filtro esistesse riaffiorano con le targhe
// tecniche dentro, proprio nella scheda dove Nicola va a controllare cosa è stato fatto.
//
// La cura è UNA porta d'uscita sola: chi stampa un titolo chiama questa, non i due filtri a mano.
// Il filtro NON si riscrive — è quello di sempre, in `azioni-attesa.ts` e `format.ts`.
// ═══════════════════════════════════════════════════════════════════════════

export function titoloDaMostrare(grezzo: unknown): string {
  return pulisciTitolo(testoPulito(grezzo));
}

// ═══════════════════════════════════════════════════════════════════════════
// ④ AR-614 · un colore nasce con la sua gemella per il tema scuro
//
// Il difetto: le mappe dei colori delle card («bordo rosso», «badge verde») erano stringhe scritte
// solo per il tema chiaro. In tema scuro le card della coda da firmare — la parte più usata del
// Pannello — mostravano bordi pastello chiari sul fondo scuro, proprio sui segnali di rischio.
//
// DIFFERENZA fra la scheda e il codice, misurata: la scheda accusava anche `text-black/55`, ma nel
// Pannello `black` non è nero, è una variabile che si ribalta col tema (globals.css, --black-rgb).
// Quelli erano già a posto. I colpevoli veri sono solo i colori fissi della tavolozza.
//
// La cura alla radice: i colori non si scrivono più a mano nel componente. Si chiedono qui, e qui
// non esiste un modo di restituirne uno senza gemella — `tintaSoloChiara` lo dimostra a ogni prova.
// ═══════════════════════════════════════════════════════════════════════════

export type Livello = "rosso" | "giallo" | "verde" | "?";
export type Tono = "verde" | "ambra" | "rosso" | "spento";

const BORDO_LIVELLO: Record<Livello, string> = {
  rosso: "border-red-200 dark:border-red-900/50",
  giallo: "border-amber-200 dark:border-amber-900/50",
  verde: "border-green-200 dark:border-green-900/50",
  "?": "border-black/[0.08]",
};

const PALLINO_LIVELLO: Record<Livello, string> = {
  // I pallini sono tinte piene (500): si vedono su entrambi i fondi, nessuna gemella serve.
  rosso: "bg-red-500",
  giallo: "bg-amber-500",
  verde: "bg-green-500",
  "?": "bg-black/30",
};

const BADGE_TONO: Record<Tono, string> = {
  verde: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  ambra: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  rosso: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  spento: "bg-black/[0.05] text-black/55",
};

const LIVELLI: Livello[] = ["rosso", "giallo", "verde", "?"];
const TONI: Tono[] = ["verde", "ambra", "rosso", "spento"];

function comeLivello(x: unknown): Livello {
  return LIVELLI.includes(x as Livello) ? (x as Livello) : "?";
}

/** Il bordo della card, per il livello di rischio. */
export function classiBordo(livello: unknown): string {
  return BORDO_LIVELLO[comeLivello(livello)];
}

/** Il pallino del semaforo. */
export function classiPallino(livello: unknown): string {
  return PALLINO_LIVELLO[comeLivello(livello)];
}

/** Il fondo e il testo di un'etichetta. */
export function classiBadge(tono: unknown): string {
  return BADGE_TONO[(TONI.includes(tono as Tono) ? (tono as Tono) : "spento")];
}

/**
 * 🚨 Il guardiano dei colori: quali classi di questa stringa vivono solo nel tema chiaro?
 *
 * Una tinta della tavolozza sotto il 300 (`bg-green-50`, `border-red-200`) o sopra il 600
 * (`text-amber-700`) è tarata su un fondo chiaro: sul fondo scuro o sparisce o acceca. Se non ha la
 * sua gemella `dark:` nella stessa stringa, è un colore che in tema scuro resta quello sbagliato.
 * Le tinte piene di mezzo (400-600, tipo `bg-red-500`) reggono su entrambi i fondi e sono ammesse.
 *
 * Le variabili di tema del Pannello (`black`, `ink`, `paper`, `brand`) non passano di qui: si
 * ribaltano da sole con la variabile CSS.
 */
export function tintaSoloChiara(classi: string): string[] {
  const parole = String(classi || "").split(/\s+/).filter(Boolean);
  const dark = new Set(parole.filter((p) => p.startsWith("dark:")).map((p) => p.slice(5)));
  const colpevoli: string[] = [];
  for (const p of parole) {
    if (p.startsWith("dark:")) continue;
    const m = p.match(/^(bg|text|border)-(red|amber|green|blue|yellow|orange|slate|gray|zinc|neutral|stone)-(\d{2,3})(\/.+)?$/);
    if (!m) continue;
    const tinta = Number(m[3]);
    if (tinta > 300 && tinta < 700) continue; // tinta piena: regge su entrambi i fondi
    // La gemella può avere un'opacità diversa: basta che esista per la stessa proprietà e famiglia.
    const stessaFamiglia = `${m[1]}-${m[2]}-`;
    let coperta = false;
    for (const d of dark) if (d.startsWith(stessaFamiglia)) coperta = true;
    if (!coperta) colpevoli.push(p);
  }
  return colpevoli;
}

/** Tutte le classi che questo modulo sa produrre — serve alla prova per non lasciarne fuori nessuna. */
export function tutteLeClassi(): string[] {
  return [
    ...LIVELLI.map(classiBordo),
    ...LIVELLI.map(classiPallino),
    ...TONI.map(classiBadge),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// ⑤a AR-607 · una schermata di guasto non può promettere più di quanto copre
//
// Il difetto: l'unica rete di sicurezza del Pannello stava alla radice. Bastava un dato storto in
// UNA casella e Next sostituiva l'intera Cabina — testata, menù, aree, chat — con la schermata 😕,
// che intanto scriveva «Il resto del Pannello funziona». Non era vero: non restava niente.
//
// La cura vera è che l'errore di una casella si fermi dentro quella casella (rete di sicurezza per
// area, in page.tsx). Ma resta la decisione: quando la rete scatta, COSA si può dire senza mentire?
// Dipende da quanto ha portato via. Questa funzione lo decide, e la prova la inchioda: una promessa
// più larga dell'ambito è vietata.
// ═══════════════════════════════════════════════════════════════════════════

export type Ambito = "casella" | "cabina";
export type Guasto = {
  /** Il titolo grosso della schermata. */
  titolo: string;
  /** La riga che dice cosa funziona ancora. Mai più larga di quello che è vero. */
  promessa: string;
  /** Il resto del Pannello è ancora in piedi? È il fatto da cui la promessa discende. */
  restaIlResto: boolean;
  /** «Riprova» rimette in piedi solo questo pezzo, senza ricaricare la pagina? */
  riprovaLocale: boolean;
};

export function messaggioGuasto(ambito: Ambito, nome?: string): Guasto {
  if (ambito === "casella") {
    const dove = (nome || "").trim();
    return {
      titolo: dove ? `La casella «${dove}» non è riuscita a caricarsi` : "Questa casella non è riuscita a caricarsi",
      promessa: "Il resto del Pannello funziona: puoi continuare da un'altra parte. Riprova qui sotto — se era un intoppo passeggero, riparte da sola.",
      restaIlResto: true,
      riprovaLocale: true,
    };
  }
  return {
    titolo: "Il Pannello non è riuscito a caricarsi",
    promessa: "Questa volta è caduto tutto, non solo una casella. Ricarica la pagina: se torna subito, era un intoppo passeggero.",
    restaIlResto: false,
    riprovaLocale: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ⑤b AR-602 · la risposta di un lavoro aperto resta quella vecchia
//
// Il difetto: nell'area Lavori, aprendo un gruppo il dettaglio (richiesta + risposta) viene scaricato
// UNA volta e messo da parte. Quella copia non si rinfresca mai — la guardia «ce l'ho già» blocca ogni
// rilettura — mentre l'elenco che si aggiorna da solo porta lo stato ma non la risposta. Così quando
// il lavoro finisce il bollino diventa «Fatto» e il corpo resta la risposta a metà di prima. Nicola
// legge una risposta monca sotto un bollino che dice il contrario, e giudica la macchina su un dato falso.
//
// La radice: la copia messa da parte VINCE SEMPRE su quella fresca (`d.risultato ?? lv.risultato`), e
// nessuno tiene il conto di QUANDO è stata presa. Un dato senza la sua età non si può dire vecchio.
// Qui la copia porta con sé lo stato e l'ora di quando è stata presa, e il confronto è una funzione
// che un test esegue.
// ═══════════════════════════════════════════════════════════════════════════

export type LavoroLetto = {
  id?: string;
  stato?: string;
  updated_at?: string;
  created_at?: string;
  richiesta?: string;
  risultato?: string;
};

function istanteDi(l: LavoroLetto | null | undefined): number {
  const t = Date.parse(String(l?.updated_at || l?.created_at || ""));
  return Number.isFinite(t) ? t : 0;
}

/**
 * La copia messa da parte è invecchiata rispetto al lavoro vivo?
 *
 * Due segnali, e basta UNO:
 *  · lo stato è cambiato (in corso → fatto, in corso → errore): la risposta di prima non è più quella;
 *  · il lavoro vivo porta un'ora più recente di quella con cui la copia è stata presa.
 */
export function dettaglioScaduto(vivo: LavoroLetto | null | undefined, cache: LavoroLetto | null | undefined): boolean {
  if (!cache) return false; // niente copia da parte: non c'è niente di vecchio
  if (!vivo) return false;
  const statoVivo = String(vivo.stato || "");
  const statoCache = String(cache.stato || "");
  if (statoCache && statoVivo && statoCache !== statoVivo) return true;
  const tv = istanteDi(vivo);
  const tc = istanteDi(cache);
  return tv > 0 && tc > 0 && tv > tc;
}

/**
 * Quale richiesta e quale risposta si mostrano — e se la copia va riletta.
 *
 * Prima: la copia vinceva sempre. Adesso vince solo finché è ancora buona; appena il lavoro vivo si è
 * mosso, comanda il fresco e si chiede la rilettura. Se il fresco non porta ancora la risposta (l'elenco
 * la risposta non ce l'ha), meglio nessun testo che il testo sbagliato: `daRileggere` dice al componente
 * di andarla a prendere, e nel frattempo non si spaccia per attuale una risposta di dieci minuti fa.
 */
export function qualeRisposta(
  vivo: LavoroLetto | null | undefined,
  cache: LavoroLetto | null | undefined,
): { richiesta: string; risultato: string; daRileggere: boolean } {
  const v = vivo || {};
  const scaduto = dettaglioScaduto(v, cache);
  if (!cache) {
    return { richiesta: String(v.richiesta || ""), risultato: String(v.risultato || ""), daRileggere: false };
  }
  if (!scaduto) {
    return {
      richiesta: String(cache.richiesta ?? v.richiesta ?? ""),
      risultato: String(cache.risultato ?? v.risultato ?? ""),
      daRileggere: false,
    };
  }
  // Scaduta: comanda il vivo. La richiesta non cambia mai durante un lavoro, quindi quella della copia
  // si può tenere come ripiego; la RISPOSTA no — è esattamente il pezzo che è invecchiato.
  return {
    richiesta: String(v.richiesta || cache.richiesta || ""),
    risultato: String(v.risultato || ""),
    daRileggere: true,
  };
}

/**
 * Va (ri)chiesto il dettaglio al server?
 *
 * La guardia di prima era «ce l'ho già, non lo chiedo più»: è quella che ha congelato la risposta.
 * Adesso si richiede quando non c'è, e ogni volta che quella che c'è è invecchiata.
 */
export function serveRileggereDettaglio(
  vivo: LavoroLetto | null | undefined,
  cache: LavoroLetto | null | undefined,
  inCorso: boolean,
): boolean {
  if (inCorso) return false; // una richiesta è già in volo: non se ne manda una seconda
  if (!cache?.richiesta) return true;
  return dettaglioScaduto(vivo, cache);
}

// ═══════════════════════════════════════════════════════════════════════════
// ⑥ AR-613 · muoversi fra le schede con le frecce
//
// Fa parte della stessa cura: un gruppo di linguette con ruolo di scheda deve rispondere alle
// frecce, altrimenti chi naviga da tastiera o con un lettore di schermo resta fermo sulla prima.
// Quale scheda diventa attiva è una decisione pura, quindi sta qui e non nel gestore del tasto.
// ═══════════════════════════════════════════════════════════════════════════

export function schedaDopoTasto(schede: string[], corrente: string, tasto: string): string | null {
  const lista = (Array.isArray(schede) ? schede : []).filter(Boolean);
  if (lista.length === 0) return null;
  const i = lista.indexOf(corrente);
  if (i < 0) return null;
  if (tasto === "ArrowRight" || tasto === "ArrowDown") return lista[(i + 1) % lista.length];
  if (tasto === "ArrowLeft" || tasto === "ArrowUp") return lista[(i - 1 + lista.length) % lista.length];
  if (tasto === "Home") return lista[0];
  if (tasto === "End") return lista[lista.length - 1];
  return null;
}
