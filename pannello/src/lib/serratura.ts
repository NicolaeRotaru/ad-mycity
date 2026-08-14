/**
 * AR-226 — la DECISIONE della serratura, come funzione pura.
 *
 * Sta qui e non dentro middleware.ts per un motivo preciso: `next/server` non è importabile fuori
 * da Next, quindi una logica di sicurezza scritta dentro il middleware non è eseguibile da un test —
 * si può solo *rileggere*, che è la stessa forma di prova debole che ha lasciato passare 91 chiusure
 * false il 27/7. Qui invece il test chiama questa funzione VERA con richieste finte.
 *
 * Un import solo, e non è un caso: `rotte-scriventi.ts` è la MISURA di quali rotte scrivono, ed è
 * la stessa che usa il guardiano del giro. Se la serratura tenesse qui una sua copia dell'elenco,
 * avremmo di nuovo due liste che divergono — la malattia del lotto 33.
 */

import { rottaScriveInGet } from "./rotte-scriventi";

export type RichiestaDaValutare = {
  metodo: string;
  /** pathname, es. "/api/lavori" */
  percorso: string;
  /** header in minuscolo → valore (già normalizzati da chi chiama) */
  header: Record<string, string | null | undefined>;
  /** token macchina configurato lato server (process.env.PANNELLO_TOKEN) */
  tokenAtteso?: string | null;
};

export type Verdetto = { ammessa: true } | { ammessa: false; motivo: string; dettaglio: string };

/**
 * Metodi che di norma non modificano nulla.
 *
 * «Di norma», non «sempre»: è la correzione di AR-409. Il verbo dice le INTENZIONI del protocollo,
 * non l'effetto di questa rotta — e tre rotte del Pannello scrivono proprio da una GET. Chi passa di
 * qui deve superare due domande, non una: «è un metodo di lettura?» **e** «questa rotta scrive?».
 */
const SOLA_LETTURA = new Set(["GET", "HEAD", "OPTIONS"]);

// ─────────────────────────────────────────────────────────────────────────────
// AR-410 — UN'ESENZIONE NON SI GIUSTIFICA CON UNA FRASE
//
// Il difetto: l'heartbeat era l'unica rotta tolta dalla serratura, e il motivo scritto accanto
// diceva che «si difende da sola con CRON_SECRET fail-closed». Il codice però era
// `if (secret && auth !== …)`: senza la variabile il controllo non esisteva e la porta era aperta a
// chiunque, in GET e in POST — e dietro quella porta ci sono `creaLavoro` (fa girare l'agente sul
// VPS) ed `eseguiAutopilota` (esegue azioni senza che nessuno clicchi). Il file di configurazione
// che si copia per riempire gli ambienti consegnava per giunta `CRON_SECRET=` vuoto.
// Il collaudo controllava che l'esenzione portasse un motivo lungo almeno 20 caratteri: cioè
// verificava che la frase esistesse, mai che fosse vera.
//
// La cura: l'esenzione non porta più una frase, porta una FUNZIONE. La difesa dichiarata si può
// ESEGUIRE, quindi una prova può chiamarla senza chiave e pretendere un rifiuto — e la route usa
// quella stessa funzione, così non possono divergere.
// ─────────────────────────────────────────────────────────────────────────────

/** Cosa sa la difesa di una rotta esente: il segreto configurato lato server e gli header arrivati. */
export type AmbienteDifesa = {
  /** Il segreto configurato (process.env.CRON_SECRET). Assente/vuoto = non configurato. */
  segreto?: string | null;
  /** header in minuscolo → valore. */
  header?: Record<string, string | null | undefined>;
};

export type EsitoDifesa = { ammessa: true } | { ammessa: false; status: number; motivo: string };

/**
 * La difesa del battito, indipendente dalla configurazione.
 *
 * Due strade legittime e nessuna terza:
 *   · il cron, che porta `Authorization: Bearer <CRON_SECRET>` — e senza CRON_SECRET configurato
 *     questa strada NON esiste, invece di aprirsi;
 *   · il Pannello stesso, cioè una richiesta che il browser marca come «same-origin» (il pulsante
 *     «Aggiorna ora»). È la stessa strada che la serratura accetta per ogni altra rotta che scrive:
 *     non un'eccezione in più, la regola di casa.
 *
 * Chi non è né l'uno né l'altro viene respinto. Se il segreto manca, il messaggio lo dice: 503
 * «battito non configurato», perché un cancello che si spegne togliendo una variabile non è un
 * cancello.
 */
export function difesaBattito(a: AmbienteDifesa): EsitoDifesa {
  const h = a.header || {};
  const segreto = (a.segreto || "").trim();
  if (segreto && (h["authorization"] || "") === `Bearer ${segreto}`) return { ammessa: true };
  if (stessaOrigine(h)) return { ammessa: true };
  if (!segreto) {
    return {
      ammessa: false,
      status: 503,
      motivo:
        "Battito non configurato: manca CRON_SECRET, quindi non posso distinguere il cron da uno sconosciuto. Imposta CRON_SECRET nell'ambiente e riprova.",
    };
  }
  return { ammessa: false, status: 401, motivo: "Non autorizzato" };
}

/**
 * Rotte esentate, con il motivo E la difesa che quel motivo dichiara. Ognuna DEVE avere un proprio
 * controllo in ingresso, e quel controllo deve essere eseguibile: `cervello/test/c1-porta-aperta-per-default.test.mjs`
 * chiama la `difesa` di OGNI voce senza chiave configurata e pretende un rifiuto.
 * L'elenco è corto apposta: una voce senza motivo e senza difesa non va aggiunta.
 */
export const ESENTI: { path: string; perche: string; difesa: (a: AmbienteDifesa) => EsitoDifesa }[] = [
  {
    path: "/api/heartbeat",
    perche:
      "chiamata da un cron esterno (nessun Origin di browser): passa solo con CRON_SECRET giusto o dalla UI del Pannello stesso, e senza CRON_SECRET configurato la strada del cron non esiste",
    difesa: difesaBattito,
  },
];

function esente(percorso: string): boolean {
  return ESENTI.some((e) => percorso === e.path || percorso.startsWith(e.path + "/"));
}

/** La richiesta arriva dalla UI del Pannello stesso? */
function stessaOrigine(h: RichiestaDaValutare["header"]): boolean {
  // Sec-Fetch-Site lo imposta il browser e non è modificabile dal JavaScript di pagina: per una
  // richiesta cross-site vale "cross-site" o "same-site", mai "same-origin". È il segnale migliore
  // che abbiamo contro il CSRF. (Un client non-browser può fingerlo: vedi l'avvertenza in middleware.ts.)
  const sito = h["sec-fetch-site"];
  if (sito) return sito === "same-origin" || sito === "none";

  // Browser vecchi senza Sec-Fetch-*: ripiego sul confronto Origin/Host.
  const origin = h["origin"];
  if (!origin) return false; // né Origin né Sec-Fetch = non è un browser: serve il token
  try {
    return new URL(origin).host === (h["host"] || "");
  } catch {
    return false;
  }
}

/** Confronto a tempo costante: non far trapelare quanto del token era giusto. */
function tokenCombacia(atteso: string, inviato: string): boolean {
  if (atteso.length !== inviato.length) return false;
  let diff = 0;
  for (let i = 0; i < atteso.length; i++) diff |= atteso.charCodeAt(i) ^ inviato.charCodeAt(i);
  return diff === 0;
}

function tokenValido(h: RichiestaDaValutare["header"], atteso?: string | null): boolean {
  if (!atteso) return false; // token non configurato ⇒ nessuna chiamata macchina è ammessa
  const auth = h["authorization"] || "";
  const inviato = auth.startsWith("Bearer ") ? auth.slice(7).trim() : h["x-pannello-token"] || "";
  return !!inviato && tokenCombacia(atteso, inviato);
}

export function decidiAccesso(r: RichiestaDaValutare): Verdetto {
  // AR-409: prima qui c'era `if (SOLA_LETTURA.has(metodo)) return ammessa` — un passaggio libero a
  // tutto ciò che arrivava col verbo «leggi». Tre rotte scrivono da una GET (report accoda un
  // lavoro, azioni-pronte chiude le card mentre le legge, heartbeat timbra la memoria) e nascevano
  // quindi fuori dalla serratura. L'elenco non è scritto qui a mano: sta in `rotte-scriventi.ts`
  // accanto alla funzione che lo MISURA sul codice, e un guardiano confronta i due a ogni giro.
  if (SOLA_LETTURA.has(r.metodo.toUpperCase()) && !rottaScriveInGet(r.percorso)) return { ammessa: true };
  if (esente(r.percorso)) return { ammessa: true };
  if (stessaOrigine(r.header) || tokenValido(r.header, r.tokenAtteso)) return { ammessa: true };
  return {
    ammessa: false,
    motivo:
      "Richiesta rifiutata: questa rotta modifica lo stato e la chiamata non arriva dal Pannello né porta un token macchina valido.",
    dettaglio:
      "Se sei uno script, manda l'header Authorization: Bearer $PANNELLO_TOKEN. Se sei un browser, apri il Pannello e usa l'interfaccia.",
  };
}
