// L'ACCESSO — il sito è per i venditori: si entra con un codice (variabile CODICE_ACCESSO su Vercel).
// Il codice non si salva: nel cookie va la sua impronta. Senza codice configurato il sito resta chiuso.
// Funziona anche nel middleware (Web Crypto, niente moduli di Node).

export const COOKIE = 'sv_accesso';

export async function impronta(codice: string) {
  const dati = new TextEncoder().encode(`scheda-venditore:${codice}`);
  const h = await crypto.subtle.digest('SHA-256', dati);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function uguali(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function accessoValido(valoreCookie: string | undefined) {
  const codice = process.env.CODICE_ACCESSO || '';
  if (codice.length < 6 || !valoreCookie) return false;
  return uguali(valoreCookie, await impronta(codice));
}
