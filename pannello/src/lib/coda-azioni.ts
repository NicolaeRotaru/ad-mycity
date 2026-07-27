/**
 * AR-219 — le regole di apertura della coda da firmare, fuori dal componente.
 *
 * Il difetto: `daFirmare.map((a) => cardAzione(a))` stampava OGNI azione con la scheda intera già
 * espansa. Con 51 azioni in coda sono ~15 schermate su desktop e ~40 sul telefono, in colonna
 * singola: per arrivare alla decima si scorre finché non si molla. La scheda era stata disegnata
 * quando la coda aveva poche voci e non è mai stata ri-tarata mentre la coda cresceva — mentre il
 * pattern giusto esisteva già in casa (Modulo.tsx: 8 righe + «mostra altri N»;
 * RadiografiaDiSe.tsx: `<details>` chiuso di default) e non era stato riusato.
 *
 * Sta qui e non dentro Azioni.tsx perché quel file importa React e mezza Cabina: una regola scritta
 * là dentro si potrebbe solo rileggere, mai eseguire in un test. È lo stesso motivo per cui esistono
 * cervello/giro-esito.sh, pannello/src/lib/serratura.ts, panel-sync-regole.ts e memoria-json.ts.
 *
 * Nessun import: solo ragionamento sui dati.
 */

/** Quante schede si montano prima di chiedere «mostra le altre». Il valore di Modulo.tsx è 8; qui
 *  10 perché le azioni da firmare sono la cosa per cui Nicola apre il Pannello: una schermata piena. */
export const TETTO_CODA = 10;

/** Le schede da montare adesso. Non è solo estetica: 51 schede sono 51 sottoalberi React. */
export function azioniVisibili<T>(tutte: T[], mostraTutte: boolean, tetto: number = TETTO_CODA): T[] {
  const lista = Array.isArray(tutte) ? tutte : [];
  return mostraTutte ? lista : lista.slice(0, tetto);
}

/** Quante restano fuori — il numero che va scritto sul bottone, così si sa cosa si sta per aprire. */
export function quanteNascoste(totale: number, mostraTutte: boolean, tetto: number = TETTO_CODA): number {
  if (mostraTutte) return 0;
  return Math.max(0, (Number(totale) || 0) - tetto);
}

/**
 * Se una scheda è aperta o chiusa.
 *
 * Due regole, in quest'ordine:
 *  1. se Nicola ha aperto o chiuso QUELLA scheda, comanda lui — sempre, anche se la lista si
 *     riordina o arriva un poll. Una scheda che si richiude da sola mentre la stai leggendo è
 *     peggio del difetto che stiamo togliendo;
 *  2. altrimenti resta aperta solo la prima, così la coda si apre già utile e non muta.
 *
 * `scelte` è la memoria delle sue decisioni: id → aperta?. Un id assente = non ha ancora deciso.
 */
export function cardAperta(id: string, indice: number, scelte: Record<string, boolean>): boolean {
  const s = scelte || {};
  if (Object.prototype.hasOwnProperty.call(s, id)) return s[id];
  return indice === 0;
}

/**
 * Quando si arriva da un link diretto a un'azione («Vai all'azione collegata»), quella scheda va
 * aperta — altrimenti si atterra su una riga chiusa e sembra che il link non abbia funzionato.
 * E se sta oltre il tetto va anche srotolata la lista, altrimenti non è nemmeno montata e chi la
 * cerca nel DOM per scorrerci sopra non la trova.
 */
export function idDaAncora(anchor: string | null | undefined): string | null {
  const m = String(anchor || "").match(/^azione-(.+)$/);
  return m ? m[1] : null;
}

export function serveSrotolare(
  id: string | null,
  lista: { id?: string }[],
  mostraTutte: boolean,
  tetto: number = TETTO_CODA,
): boolean {
  if (!id || mostraTutte) return false;
  const i = (Array.isArray(lista) ? lista : []).findIndex((a) => a?.id === id);
  return i >= tetto;
}
