/**
 * AR-226 — la DECISIONE della serratura, come funzione pura.
 *
 * Sta qui e non dentro middleware.ts per un motivo preciso: `next/server` non è importabile fuori
 * da Next, quindi una logica di sicurezza scritta dentro il middleware non è eseguibile da un test —
 * si può solo *rileggere*, che è la stessa forma di prova debole che ha lasciato passare 91 chiusure
 * false il 27/7. Qui invece il test chiama questa funzione VERA con richieste finte.
 *
 * Nessun import: solo ragionamento sugli header.
 */

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

/** Metodi che non modificano nulla: passano sempre. */
const SOLA_LETTURA = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Rotte esentate, con il motivo. Ognuna DEVE avere un proprio controllo in ingresso.
 * L'elenco è corto apposta: una voce senza motivo non va aggiunta.
 */
export const ESENTI: { path: string; perche: string }[] = [
  {
    path: "/api/heartbeat",
    perche:
      "chiamata da un cron esterno (nessun Origin di browser) e già protetta da CRON_SECRET fail-closed nella route stessa",
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
  if (SOLA_LETTURA.has(r.metodo.toUpperCase())) return { ammessa: true };
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
