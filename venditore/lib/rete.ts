// La rete, con le cinture: si aprono solo pagine pubbliche su http(s), mai indirizzi interni.
// Le pagine da aprire arrivano da OpenStreetMap o dalla ricerca dell'AD, cioè da testi che chiunque può
// scrivere: per questo ogni indirizzo (e ogni rinvio) passa dal controllo prima di partire.

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const PRIVATO_V4 = [/^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^22[4-9]\./, /^2[3-5]\d\./];
const ePrivato = (ip: string) => {
  if (isIP(ip) === 4) return PRIVATO_V4.some((re) => re.test(ip));
  const v6 = ip.toLowerCase();
  return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80') || v6.startsWith('::ffff:');
};

/** L'indirizzo, se si può aprire: http(s), porta normale, nome di dominio vero (niente IP, niente nomi interni). */
export function indirizzoSicuro(testo: string): URL | null {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(testo) ? testo : `https://${testo}`); } catch { return null; }
  if (!['http:', 'https:'].includes(u.protocol)) return null;
  if (u.username || u.password) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || isIP(host.replace(/^\[|\]$/g, ''))) return null;
  if (/(^|\.)(localhost|local|internal|intranet|lan|home|corp|test|invalid|example)$/.test(host)) return null;
  return u;
}

async function risolveFuori(host: string) {
  try {
    const indirizzi = await lookup(host, { all: true, verbatim: true });
    return indirizzi.length > 0 && indirizzi.every((a) => !ePrivato(a.address));
  } catch {
    return false;
  }
}

export type Pagina = { ok: boolean; stato: number | null; url: string; html: string; errore: string | null; ms: number };

/** Apre una pagina pubblica: al massimo 4 rinvii, `maxByte` di testo, `attesaMs` in tutto. */
export async function leggiPagina(indirizzo: string, { attesaMs = 4500, maxByte = 1_500_000 } = {}): Promise<Pagina> {
  const inizio = Date.now();
  const fine = (p: Partial<Pagina>): Pagina => ({ ok: false, stato: null, url: indirizzo, html: '', errore: null, ms: Date.now() - inizio, ...p });
  let u = indirizzoSicuro(indirizzo);
  if (!u) return fine({ errore: 'indirizzo non ammesso' });
  const segnale = AbortSignal.timeout(attesaMs);
  try {
    for (let giro = 0; giro < 5; giro++) {
      if (!(await risolveFuori(u.hostname))) return fine({ url: u.toString(), errore: 'il dominio non si trova' });
      const r = await fetch(u.toString(), {
        redirect: 'manual', signal: segnale,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; MyCity-SchedaVenditore/1.0; +https://www.mycity.it)',
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'accept-language': 'it-IT,it;q=0.9',
        },
      });
      const dove = r.headers.get('location');
      if (r.status >= 300 && r.status < 400 && dove) {
        try { await r.body?.cancel(); } catch { /* niente */ }
        const prossimo = indirizzoSicuro(new URL(dove, u).toString());
        if (!prossimo) return fine({ url: u.toString(), stato: r.status, errore: 'rinvio verso un indirizzo non ammesso' });
        u = prossimo;
        continue;
      }
      const tipo = r.headers.get('content-type') || '';
      if (!/html|xml|text\/plain/i.test(tipo) && tipo) {
        try { await r.body?.cancel(); } catch { /* niente */ }
        return fine({ url: u.toString(), stato: r.status, errore: 'non è una pagina web' });
      }
      const lettore = r.body?.getReader();
      let html = '';
      if (lettore) {
        const dec = new TextDecoder();
        let letti = 0;
        while (true) {
          const { done, value } = await lettore.read();
          if (done) break;
          letti += value.byteLength;
          html += dec.decode(value, { stream: true });
          if (letti >= maxByte) { try { await lettore.cancel(); } catch { /* niente */ } break; }
        }
      }
      return fine({ ok: r.ok, stato: r.status, url: u.toString(), html, errore: r.ok ? null : `risposta ${r.status}` });
    }
    return fine({ url: u.toString(), errore: 'troppi rinvii' });
  } catch (e) {
    const msg = e instanceof Error && e.name === 'TimeoutError' ? 'non risponde in tempo' : 'non si apre';
    return fine({ url: u?.toString() ?? indirizzo, errore: msg });
  }
}
