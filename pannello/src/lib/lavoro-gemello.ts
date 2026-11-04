/**
 * IL LAVORO GEMELLO — Nicola, 4/11/2026: «togli tutti i lavori in coda doppi ed impedisci che si
 * creano doppioni».
 *
 * Dal 4/11 il database della memoria rifiuta un lavoro identico a uno che aspetta già in coda
 * (stessa corsia, tipo, conversazione e testo): `pannello/sql/lavori-un-solo-in-attesa.sql`.
 * L'errore arriva come HTTP 409 col messaggio «lavoro-gia-in-coda», e nel campo `details` il codice
 * del lavoro che aspetta già.
 *
 * Per chi chiede, quel rifiuto NON è un fallimento: il lavoro che voleva c'è, è solo già in coda.
 * Questa funzione riconosce quel caso e tira fuori il codice del gemello, così il Pannello usa quello
 * invece di dire «non sono riuscito ad accodare». Ogni altro 409, o un corpo che non si legge, resta
 * quello che è: un rifiuto vero.
 */

const MESSAGGIO = "lavoro-gia-in-coda";
const CODICE_LAVORO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Il codice del lavoro che aspetta già, se il rifiuto è quello del freno; altrimenti null. */
export function gemelloDaConflitto(status: number | undefined, corpo: string): string | null {
  if (status !== 409 || !corpo) return null;
  let j: { message?: unknown; details?: unknown };
  try {
    j = JSON.parse(corpo);
  } catch {
    return null;
  }
  if (j?.message !== MESSAGGIO) return null;
  const id = typeof j.details === "string" ? j.details.trim() : "";
  return CODICE_LAVORO.test(id) ? id : null;
}
