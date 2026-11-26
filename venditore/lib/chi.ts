// Chi sta usando il sito: il venditore della sessione (cookie firmato), letto dalla richiesta.
import { COOKIE_SESSIONE, leggi, firma, DURATA_S } from './sessione.ts';

export function cookieDa(req: Request, nome: string): string | undefined {
  const riga = req.headers.get('cookie') || '';
  for (const parte of riga.split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === nome) return decodeURIComponent(parte.slice(i + 1).trim());
  }
  return undefined;
}

export async function venditoreDa(req: Request): Promise<string | null> {
  return (await leggi(cookieDa(req, COOKIE_SESSIONE)))?.email ?? null;
}

/** L'intestazione Set-Cookie della sessione (o quella che la chiude, se `email` è null). */
export async function cookieSessione(email: string | null): Promise<string | null> {
  if (!email) return `${COOKIE_SESSIONE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  const valore = await firma(email);
  return valore ? `${COOKIE_SESSIONE}=${valore}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DURATA_S}` : null;
}
