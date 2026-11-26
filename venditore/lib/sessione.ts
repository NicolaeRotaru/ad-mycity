// LA SESSIONE DEL VENDITORE — un cookie firmato (HMAC-SHA256) con la sua email e la scadenza.
// La chiave si ricava dal segreto fra sito e n8n (N8N_SCHEDA_SEGRETO): niente variabili in più su Vercel.
// Funziona sia nel middleware (Web Crypto) sia nelle rotte. Senza segreto nessuno entra.

export const COOKIE_SESSIONE = 'sv_sessione';
export const DURATA_S = 60 * 60 * 24 * 30; // 30 giorni

const enc = new TextEncoder();
const b64url = (b: ArrayBuffer | Uint8Array) => {
  const u = b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = '';
  for (const x of u) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const daB64url = (s: string) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function chiave(segreto: string) {
  const base = await crypto.subtle.importKey('raw', enc.encode(segreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const derivata = await crypto.subtle.sign('HMAC', base, enc.encode('scheda-venditore:sessione:v1'));
  return crypto.subtle.importKey('raw', derivata, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export type Sessione = { email: string; scade: number };

export async function firma(email: string, segreto = process.env.N8N_SCHEDA_SEGRETO || '', adesso = Date.now()): Promise<string | null> {
  if (segreto.length < 24) return null;
  const corpo = b64url(enc.encode(JSON.stringify({ e: email, x: Math.floor(adesso / 1000) + DURATA_S })));
  const sig = await crypto.subtle.sign('HMAC', await chiave(segreto), enc.encode(corpo));
  return `${corpo}.${b64url(sig)}`;
}

export async function leggi(valore: string | undefined, segreto = process.env.N8N_SCHEDA_SEGRETO || '', adesso = Date.now()): Promise<Sessione | null> {
  if (!valore || segreto.length < 24) return null;
  const [corpo, sig, ...resto] = valore.split('.');
  if (!corpo || !sig || resto.length) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await chiave(segreto), daB64url(sig), enc.encode(corpo));
    if (!ok) return null;
    const p = JSON.parse(new TextDecoder().decode(daB64url(corpo)));
    if (typeof p?.e !== 'string' || typeof p?.x !== 'number' || p.x * 1000 <= adesso) return null;
    return { email: p.e, scade: p.x * 1000 };
  } catch {
    return null;
  }
}

/** Dove tornare dopo l'accesso: solo una pagina di questo sito (niente «//», «/\», spazi, tab o altri domini). */
export function tornaSicuro(torna: string | null | undefined, origine: string): string {
  if (!torna || !torna.startsWith('/') || /[\\\s]/.test(torna) || torna.startsWith('//')) return '/';
  try {
    const u = new URL(torna, origine);
    return u.origin === new URL(origine).origin ? u.pathname + u.search : '/';
  } catch {
    return '/';
  }
}
