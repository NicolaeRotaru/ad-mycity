// La password del venditore: non si salva mai. Si salva la sua impronta scrypt (sale casuale, costo 2^14),
// calcolata qui sul server del sito; a n8n arriva solo l'impronta.

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';

const scrypt = (pw: string, sale: Buffer, n: number, r: number, p: number, lung: number) =>
  new Promise<Buffer>((ok, ko) => scryptCb(pw, sale, lung, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? ko(e) : ok(k))));
const b64 = (b: Buffer) => b.toString('base64url');

export const PASSWORD_MIN = 8;

/** Una password accettabile: almeno 8 caratteri, al massimo 200. */
export function passwordValida(pw: unknown): pw is string {
  return typeof pw === 'string' && pw.length >= PASSWORD_MIN && pw.length <= 200;
}

export async function impronta(pw: string): Promise<string> {
  const sale = randomBytes(16);
  const k = await scrypt(pw, sale, 16384, 8, 1, 64);
  return `scrypt$16384$8$1$${b64(sale)}$${b64(k)}`;
}

export async function verifica(pw: string, salvata: string): Promise<boolean> {
  const m = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/.exec(String(salvata ?? ''));
  if (!m || typeof pw !== 'string') return false;
  const [n, r, p] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (n < 1024 || n > 1 << 17 || r > 16 || p > 4) return false;
  const atteso = Buffer.from(m[5], 'base64url');
  try {
    const k = await scrypt(pw, Buffer.from(m[4], 'base64url'), n, r, p, atteso.length);
    return k.length === atteso.length && timingSafeEqual(k, atteso);
  } catch {
    return false;
  }
}
