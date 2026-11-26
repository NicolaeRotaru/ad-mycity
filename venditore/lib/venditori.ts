// GLI ACCOUNT DEI VENDITORI — vivono nella tabella n8n «Venditori della scheda» (flusso 14c).
// Ogni venditore entra con la sua email e la sua password (Nicola, 26/11/2026). Per iscriversi serve il
// codice d'invito di Nicola (CODICE_INVITO su Vercel): senza, chiunque potrebbe iscriversi e consumare le
// corse dell'AD, che sono contate (40 al giorno, insieme agli altri flussi).

export const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
export const normaleEmail = (e: unknown) => String(e ?? '').trim().toLowerCase();
export const emailValida = (e: string) => e.length <= 200 && EMAIL.test(e);

export const ERRORI_MAX = 8;
export const BLOCCO_MS = 15 * 60 * 1000;

export type Riga = { trovato: boolean; email?: string; hash?: string; stato?: string; errori?: number; bloccato_fino?: number };

/** Prima di controllare la password: si può provare? */
export function puoProvare(r: Riga, adesso = Date.now()): { ok: true } | { ok: false; motivo: 'nessuno' | 'sospeso' | 'bloccato'; minuti?: number } {
  if (!r.trovato || !r.hash) return { ok: false, motivo: 'nessuno' };
  if (r.stato === 'sospeso' || r.stato === 'reset') return { ok: false, motivo: 'sospeso' };
  if ((r.bloccato_fino ?? 0) > adesso) return { ok: false, motivo: 'bloccato', minuti: Math.ceil(((r.bloccato_fino ?? 0) - adesso) / 60000) };
  return { ok: true };
}

/** Dopo il controllo: cosa scrivere nella riga. Otto errori di fila bloccano per 15 minuti. */
export function dopoLaProva(r: Riga, giusta: boolean, adesso = Date.now()) {
  if (giusta) return { errori: 0, bloccato_fino: 0, ultimo_accesso: adesso };
  const errori = (r.errori ?? 0) + 1;
  return { errori: errori >= ERRORI_MAX ? 0 : errori, bloccato_fino: errori >= ERRORI_MAX ? adesso + BLOCCO_MS : 0, ultimo_accesso: 0 };
}

/** Il codice d'invito giusto (spazi intorno tolti da tutte e due le parti, confronto a tempo costante). */
export function invitoGiusto(dato: unknown, atteso = process.env.CODICE_INVITO || ''): boolean {
  const a = String(atteso).trim();
  const d = String(dato ?? '').trim();
  if (a.length < 6 || d.length !== a.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ d.charCodeAt(i);
  return x === 0;
}
