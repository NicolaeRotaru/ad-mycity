/**
 * AR-612 — «Vai all'azione da firmare»: dove si atterra, deciso fuori dal componente.
 *
 * Il difetto: dalle schede «Mosse di Nicola» e «Sentinelle» quel bottone cercava l'azione collegata e
 * provava a scorrerci sopra. Ma da quando la coda è fatta di tendine chiuse con un tetto di dieci
 * (lib/coda-azioni.ts), questo percorso non era stato aggiornato e faceva due cose sbagliate e una
 * mancante:
 *  · apriva lo stato sbagliato — `setAperte`, che comanda solo il tendina «Leggi il testo esatto»,
 *    mentre la card dipende da `scelteCard`: si atterrava su una riga chiusa e muta;
 *  · non srotolava mai la lista, quindi se l'azione stava oltre la decima non era nemmeno nel DOM,
 *    `getElementById` tornava vuoto e non succedeva NIENTE: sembrava un bottone rotto;
 *  · e quando nessuna azione corrispondeva, nessuno lo diceva: si restava su una lista qualunque
 *    senza capire perché.
 * Il percorso gemello — quello che arriva da un'altra area (`EVENTO_VAI`) — faceva già le cose
 * giuste: il fix era stato applicato a un chiamante solo dei due. Qui la decisione è UNA e sta fuori
 * da React, dove un test la può eseguire davvero.
 *
 * Nessun import da React: solo ragionamento sui dati. Il tetto e la regola dello srotolamento
 * arrivano da coda-azioni.ts — quella è la fonte, e non si copia.
 */

import { serveSrotolare, TETTO_CODA } from "./coda-azioni.ts";

export type AzioneDaFirmare = { id: string; stato?: string; titolo?: string; perche?: string };

export type SaltoAllAzione = {
  /** La scheda su cui portare Nicola. Sempre «Da approvare»: è lì che si firma. */
  tab: "approvare";
  /** L'azione collegata, o `null` se non se n'è trovata nessuna. */
  id: string | null;
  /** La card va aperta (è una tendina chiusa di default). */
  apri: boolean;
  /** La lista va srotolata, altrimenti l'azione non è nemmeno montata e nessuno la trova. */
  srotola: boolean;
  /** Cosa dire a Nicola quando non c'è niente da mostrargli. `null` = tutto bene, si salta. */
  avviso: string | null;
};

/** Parole del titolo che vale la pena confrontare: le corte e le generiche non distinguono niente. */
const GENERICHE = new Set([
  "firmare", "portare", "aprire", "fare", "della", "delle", "degli", "come", "questa", "questo",
  "subito", "entro", "prima", "anche", "nicola", "sblocca", "sbloccare", "azione", "azioni",
  "mossa", "live", "prepara", "gestisci",
]);

export function parolePiene(s: string): string[] {
  return ((s || "").toLowerCase().match(/[a-zàèéìòù0-9]{4,}/g) || []).filter((w) => !GENERICHE.has(w));
}

/**
 * L'azione da firmare che parla della stessa cosa del titolo, o `null`.
 *
 * Punteggio per parole in comune, e a pari punteggio vince la PRIMA della coda (l'ordine che Nicola
 * vede a schermo): un pareggio non deve dipendere da come è ordinato l'array in memoria.
 */
export function azioneCollegata(titolo: string, daFirmare: AzioneDaFirmare[]): string | null {
  const k = parolePiene(titolo);
  if (!k.length) return null;
  const lista = Array.isArray(daFirmare) ? daFirmare.filter(Boolean) : [];
  let migliore: string | null = null;
  let punti = 0;
  for (const a of lista) {
    if (!a?.id) continue;
    const testo = `${a.titolo || ""} ${a.perche || ""}`.toLowerCase();
    const p = k.reduce((n, w) => n + (testo.includes(w) ? 1 : 0), 0);
    if (p > punti) {
      punti = p;
      migliore = a.id;
    }
  }
  return punti > 0 ? migliore : null;
}

/**
 * Tutto ciò che deve succedere quando si tocca «Vai all'azione da firmare».
 *
 * `azioni` è la lista intera: da firmare sono quelle senza stato, ed è la stessa lista che si vede a
 * schermo — quindi il conto per il tetto è fatto sulla stessa base, non su un'altra.
 */
export function saltoAllAzione(
  titolo: string,
  azioni: AzioneDaFirmare[],
  mostraTutte: boolean,
  tetto: number = TETTO_CODA,
): SaltoAllAzione {
  const daFirmare = (Array.isArray(azioni) ? azioni : []).filter((a) => a && !a.stato);
  const id = azioneCollegata(titolo, daFirmare);
  if (!id) {
    const nome = String(titolo || "").trim();
    return {
      tab: "approvare",
      id: null,
      apri: false,
      // Se non c'è niente da srotolare non si srotola; se la coda è più lunga del tetto sì, perché
      // Nicola deve poterla scorrere tutta per cercarsela da sé.
      srotola: daFirmare.length > tetto && !mostraTutte,
      avviso: nome
        ? `Non ho trovato l'azione da firmare collegata a «${nome}». Qui sotto c'è tutta la coda.`
        : "Non ho trovato l'azione da firmare collegata. Qui sotto c'è tutta la coda.",
    };
  }
  return {
    tab: "approvare",
    id,
    apri: true,
    srotola: serveSrotolare(id, daFirmare, mostraTutte, tetto),
    avviso: null,
  };
}
