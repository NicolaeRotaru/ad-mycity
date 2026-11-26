// IL FILO CON n8n — tre indirizzi:
//   avvia:     POST  <N8N_SCHEDA_URL>/scheda-venditore            (flusso 14)  → mette il lavoro in coda e risponde subito
//   risultato: GET   <N8N_SCHEDA_URL>/scheda-venditore-risultato  (flusso 14b) → «in_corso», «pronta» o «errore»
//   venditori: POST  <N8N_SCHEDA_URL>/venditori-scheda            (flusso 14c) → leggi, iscrivi, segna, elenco
// Il segreto viaggia nell'intestazione x-scheda-segreto; n8n ne conosce solo l'impronta (sha256).
// Senza il segreto il sito resta chiuso: nessuno entra e l'AD non parte.

export type Lavoro = { flusso: string; compito: string; dati: unknown; schema: unknown };
export type StatoLavoro = {
  stato: 'in_corso' | 'pronta' | 'errore' | 'sconosciuto';
  venditore?: string | null; prima?: unknown; risultato?: unknown; avvisi?: string[]; errore?: string | null; secondi?: number | null;
};

const base = () => (process.env.N8N_SCHEDA_URL || 'https://n8n-shdy.sliplane.app/webhook').replace(/\/+$/, '');
const segreto = () => process.env.N8N_SCHEDA_SEGRETO || '';
export const adCollegato = () => segreto().length >= 24;

const comeJson = (t: string) => { try { return JSON.parse(t); } catch { return null; } };

/**
 * Il corpo che il flusso 14 riceve. È una funzione a parte perché la prova di contratto
 * (test/contratto-n8n.test.mjs) lo fa passare dal nodo vero «Controlla il lavoro»: il 26/11 il collaudo ha
 * trovato che il sito e n8n si aspettavano due forme diverse, e nessuna prova se ne accorgeva.
 */
export function corpoLavoro(lavoro: string, venditore: string, nome: string, prima: unknown, job: Lavoro) {
  return { lavoro, venditore, nome, prima, ...job };
}

export async function avviaLavoro(lavoro: string, venditore: string, nome: string, prima: unknown, job: Lavoro): Promise<{ ok: boolean; errore?: string }> {
  if (!adCollegato()) return { ok: false, errore: 'il collegamento con l’AD non è ancora acceso (manca il segreto su Vercel)' };
  try {
    const r = await fetch(`${base()}/scheda-venditore`, {
      method: 'POST', signal: AbortSignal.timeout(8000),
      headers: { 'content-type': 'application/json', 'x-scheda-segreto': segreto() },
      body: JSON.stringify(corpoLavoro(lavoro, venditore, nome, prima, job)),
    });
    const corpo = comeJson(await r.text());
    if (r.ok && corpo?.ok === true) return { ok: true };
    return { ok: false, errore: corpo?.errore ? String(corpo.errore).slice(0, 200) : `n8n ha risposto ${r.status}${corpo ? '' : ' senza conferma'}` };
  } catch {
    return { ok: false, errore: 'n8n non risponde' };
  }
}

export async function leggiLavoro(lavoro: string): Promise<StatoLavoro> {
  if (!adCollegato()) return { stato: 'sconosciuto', errore: 'collegamento con l’AD non acceso' };
  try {
    const r = await fetch(`${base()}/scheda-venditore-risultato?lavoro=${encodeURIComponent(lavoro)}`, {
      signal: AbortSignal.timeout(8000), headers: { 'x-scheda-segreto': segreto() }, cache: 'no-store',
    });
    const corpo = comeJson(await r.text());
    if (!r.ok || !corpo || typeof corpo.stato !== 'string') return { stato: 'sconosciuto', errore: `n8n ha risposto ${r.status}` };
    const json = (v: unknown) => (typeof v === 'string' ? comeJson(v) : v);
    const avvisi = json(corpo.avvisi);
    return {
      stato: ['in_corso', 'pronta', 'errore'].includes(corpo.stato) ? corpo.stato : 'sconosciuto',
      venditore: typeof corpo.venditore === 'string' ? corpo.venditore.toLowerCase() : null,
      prima: json(corpo.prima), risultato: json(corpo.risultato),
      avvisi: Array.isArray(avvisi) ? avvisi.map((a) => String(a ?? '').trim()).filter(Boolean) : [],
      errore: corpo.errore ? String(corpo.errore).slice(0, 300) : null,
      secondi: typeof corpo.secondi === 'number' ? corpo.secondi : null,
    };
  } catch {
    return { stato: 'sconosciuto', errore: 'n8n non risponde' };
  }
}

/** Il flusso 14c: gli account dei venditori. Restituisce il corpo JSON e il codice HTTP, o null se n8n non risponde. */
export async function chiediVenditori(azione: 'leggi' | 'iscrivi' | 'segna' | 'elenco', dati: Record<string, unknown>): Promise<{ codice: number; corpo: any } | null> {
  if (!adCollegato()) return null;
  try {
    const r = await fetch(`${base()}/venditori-scheda`, {
      method: 'POST', signal: AbortSignal.timeout(8000), cache: 'no-store',
      headers: { 'content-type': 'application/json', 'x-scheda-segreto': segreto() },
      body: JSON.stringify({ azione, ...dati }),
    });
    const corpo = comeJson(await r.text());
    return corpo && typeof corpo === 'object' ? { codice: r.status, corpo } : null;
  } catch {
    return null;
  }
}
