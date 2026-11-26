// IL FILO CON L'AD — due indirizzi del flusso n8n «14 · Scheda per il venditore».
//   avvia:     POST  <N8N_SCHEDA_URL>/scheda-venditore            → mette il lavoro in coda e risponde subito
//   risultato: GET   <N8N_SCHEDA_URL>/scheda-venditore-risultato  → «in_corso», «pronta» o «errore»
// Il segreto viaggia nell'intestazione x-scheda-segreto; n8n ne conosce solo l'impronta (sha256).
// Senza le variabili il sito lavora lo stesso: dà la prima scheda e dice che l'AD non è collegato.

export type Lavoro = { flusso: string; compito: string; dati: unknown; schema: unknown };
export type StatoLavoro = { stato: 'in_corso' | 'pronta' | 'errore' | 'sconosciuto'; prima?: unknown; risultato?: unknown; avvisi?: string[]; errore?: string | null; secondi?: number | null };

const base = () => (process.env.N8N_SCHEDA_URL || 'https://n8n-shdy.sliplane.app/webhook').replace(/\/+$/, '');
const segreto = () => process.env.N8N_SCHEDA_SEGRETO || '';
export const adCollegato = () => segreto().length >= 24;

const comeJson = (t: string) => { try { return JSON.parse(t); } catch { return null; } };

export async function avviaLavoro(lavoro: string, nome: string, prima: unknown, job: Lavoro): Promise<{ ok: boolean; errore?: string }> {
  if (!adCollegato()) return { ok: false, errore: 'il collegamento con l’AD non è ancora acceso (manca il segreto su Vercel)' };
  try {
    const r = await fetch(`${base()}/scheda-venditore`, {
      method: 'POST', signal: AbortSignal.timeout(8000),
      headers: { 'content-type': 'application/json', 'x-scheda-segreto': segreto() },
      body: JSON.stringify({ lavoro, nome, prima, ...job }),
    });
    const corpo = comeJson(await r.text());
    if (r.ok && corpo?.ok === true) return { ok: true };
    return { ok: false, errore: corpo?.errore ? String(corpo.errore).slice(0, 200) : `n8n ha risposto ${r.status}${corpo ? '' : ' senza conferma'}` };
  } catch {
    return { ok: false, errore: 'n8n non risponde' };
  }
}

export async function leggiLavoro(lavoro: string): Promise<StatoLavoro & { errore?: string | null }> {
  if (!adCollegato()) return { stato: 'sconosciuto', errore: 'collegamento con l’AD non acceso' };
  try {
    const r = await fetch(`${base()}/scheda-venditore-risultato?lavoro=${encodeURIComponent(lavoro)}`, {
      signal: AbortSignal.timeout(8000), headers: { 'x-scheda-segreto': segreto() }, cache: 'no-store',
    });
    const corpo = comeJson(await r.text());
    if (!r.ok || !corpo || typeof corpo.stato !== 'string') return { stato: 'sconosciuto', errore: `n8n ha risposto ${r.status}` };
    const json = (v: unknown) => (typeof v === 'string' ? comeJson(v) : v);
    return {
      stato: ['in_corso', 'pronta', 'errore'].includes(corpo.stato) ? corpo.stato : 'sconosciuto',
      prima: json(corpo.prima), risultato: json(corpo.risultato),
      avvisi: Array.isArray(json(corpo.avvisi)) ? (json(corpo.avvisi) as unknown[]).map(String) : [],
      errore: corpo.errore ? String(corpo.errore).slice(0, 300) : null,
      secondi: typeof corpo.secondi === 'number' ? corpo.secondi : null,
    };
  } catch {
    return { stato: 'sconosciuto', errore: 'n8n non risponde' };
  }
}
