// Memoria dell'assistente: dove scrive cosa scopre e propone, cosi resta "vivo"
// tra un giro e l'altro. Usa Supabase via REST (nessuna dipendenza extra).
// Se non e' configurato, funziona in modalita' "senza memoria" (i giri non si
// salvano, ma l'assistente gira comunque su richiesta).

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

export type Azione = {
  titolo: string;
  motivo: string;
  livello: "verde" | "giallo" | "rosso";
};
export type Opportunita = {
  titolo: string;
  motivo: string;
  impatto: "alto" | "medio" | "basso";
  sforzo: "alto" | "medio" | "basso";
};
export type Briefing = {
  situazione: string;
  opportunita: Opportunita[];
  azioni: Azione[];
};
export type BriefingRecord = { created_at: string; data: Briefing };

export function memoryConnected(): boolean {
  return Boolean(URL && KEY);
}

function headers() {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
}

// Fetch verso Supabase REST con timeout (AbortController) + retry sui transitori.
// Il timeout evita che una risposta lenta resti appesa fino al kill di Vercel;
// il retry copre i singoli intoppi del pooler/rete. I 4xx (tranne 429) NON si ritentano.
const SB_TIMEOUT_MS = 8000;
async function sbFetch(url: string, opts: RequestInit = {}, retries = 0, timeoutMs = SB_TIMEOUT_MS): Promise<Response> {
  let ultimoErrore: unknown;
  for (let tentativo = 0; tentativo <= retries; tentativo++) {
    if (tentativo > 0) await new Promise((r) => setTimeout(r, 300 * tentativo));
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: ac.signal });
      clearTimeout(timer);
      // Ritenta solo i transitori (5xx / 429) e solo se restano tentativi.
      if ((res.status >= 500 || res.status === 429) && tentativo < retries) continue;
      return res;
    } catch (e) {
      clearTimeout(timer);
      ultimoErrore = e;
    }
  }
  throw ultimoErrore instanceof Error ? ultimoErrore : new Error("supabase-fetch-timeout");
}
// GET idempotenti: timeout + 2 ritentativi. Comodo drop-in per le letture.
const sbGet = (url: string, opts: RequestInit = {}) => sbFetch(url, opts, 2);

/** Salva il briefing dell'ultimo giro. */
export async function saveBriefing(data: Briefing): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/briefings`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ data }),
  });
}

/** Ultimo briefing salvato (o null). */
export async function getLatestBriefing(): Promise<BriefingRecord | null> {
  if (!memoryConnected()) return null;
  const res = await sbGet(
    `${URL}/rest/v1/briefings?select=created_at,data&order=created_at.desc&limit=1`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as BriefingRecord[];
  return rows[0] || null;
}

/** Date degli ultimi giri (per mostrare "quanto e' attivo"). */
export async function getRecentTimes(limit = 10): Promise<string[]> {
  if (!memoryConnected()) return [];
  const res = await sbGet(
    `${URL}/rest/v1/briefings?select=created_at&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return [];
  const rows = (await res.json()) as { created_at: string }[];
  return rows.map((r) => r.created_at);
}

// --- Diario: tutto cio' che l'assistente dice e fa, salvato lato server ---
// Cosi resta anche se cambi browser, dispositivo o aggiorni la pagina.

export type DiarioVoce = { tipo: string; titolo: string; testo: string };
export type DiarioRecord = DiarioVoce & { id: string; created_at: string };

/** Salva una voce del diario (chat, giro, azione). */
export async function saveDiarioVoce(v: DiarioVoce): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/diario`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ tipo: v.tipo, titolo: v.titolo, testo: v.testo }),
  });
}

/** Le ultime voci del diario, dalla piu' recente. */
export async function getDiario(limit = 200): Promise<DiarioRecord[]> {
  if (!memoryConnected()) return [];
  const res = await sbGet(
    `${URL}/rest/v1/diario?select=id,created_at,tipo,titolo,testo&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return [];
  return (await res.json()) as DiarioRecord[];
}

/** Svuota il diario (tutte le voci). */
export async function clearDiario(): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/diario?id=not.is.null`, {
    method: "DELETE",
    headers: { ...headers(), Prefer: "return=minimal" },
  });
}

// --- Lavori: il "ponte" verso il cervello (Claude Code sul Max) ---
// La dashboard crea un lavoro "in_attesa"; un worker sul VPS (Claude Code col Max)
// lo prende, lo esegue e ne scrive il risultato. La dashboard mostra l'esito.

export type Lavoro = {
  id: string;
  created_at: string;
  updated_at: string;
  stato: "in_attesa" | "in_corso" | "fatto" | "errore" | "annullato";
  tipo: string;
  /** Assente nel poll leggero (lista/archivio): caricare on-demand con getLavoroById. */
  richiesta?: string;
  /** Assente nel poll leggero: caricare on-demand per streaming/espansione. */
  risultato?: string;
  esperto: string;
  gruppo_id?: string | null;
  /** Quante volte il worker ha già ri-provato in automatico (auto-recovery). */
  tentativi?: number;
  /** Se valorizzato e nel futuro: il lavoro è in ATTESA DI RITENTATIVO (non è bloccato). */
  riprova_dopo?: string | null;
};

/** Crea un lavoro per il cervello. Torna la riga creata, o null se non collegato. */
// Errore "memoria non collegata": mancano le chiavi Supabase → è un problema di
// CONFIGURAZIONE, non un intoppo passeggero. La route lo distingue per dare il
// messaggio giusto (e NON dire mai "tabella mancante" quando la tabella c'è).
export class MemoriaNonCollegata extends Error {
  constructor() {
    super("memoria-non-collegata");
    this.name = "MemoriaNonCollegata";
  }
}

/** Testo sicuro per colonne Postgres/PostgREST (NUL e surrogate isolati → PGRST102). */
export function sanitizeDbText(s: string): string {
  return String(s ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\uD800-\uDFFF]/g, "");
}

function bodyJsonLavoro(payload: Record<string, string>): string {
  const richiesta = sanitizeDbText(payload.richiesta);
  const tipo = sanitizeDbText(payload.tipo || "chat") || "chat";
  const stato = payload.stato || "in_attesa";
  const body: Record<string, string> = { richiesta, tipo, stato };
  if (payload.gruppo_id) body.gruppo_id = sanitizeDbText(payload.gruppo_id);
  const raw = JSON.stringify(body);
  if (!richiesta.trim() || !raw || raw.length < 10) {
    throw new Error("payload-lavoro-vuoto");
  }
  return raw;
}

async function postLavoroUnaVolta(payload: Record<string, string>, gruppoId?: string | null, timeoutMs = SB_TIMEOUT_MS): Promise<Response> {
  let res = await sbFetch(`${URL}/rest/v1/lavori`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: bodyJsonLavoro(payload),
  }, 0, timeoutMs);
  // Se la colonna gruppo_id non esiste sul DB, riprova SUBITO senza (non è un fallimento di rete).
  if (!res.ok && gruppoId) {
    const { gruppo_id: _g, ...senzaGruppo } = payload;
    res = await sbFetch(`${URL}/rest/v1/lavori`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=representation" },
      body: bodyJsonLavoro(senzaGruppo),
    }, 0, timeoutMs);
  }
  return res;
}

// Perché la creazione del lavoro NON è andata a buon fine. Distingue i casi che
// prima collassavano tutti nel generico "riprova tra poco":
//  - config  → mancano le chiavi Supabase negli env (va sistemato, non è passeggero)
//  - timeout → il DB non ha risposto entro il tempo (passeggero: riprovare ha senso)
//  - rete    → non ho raggiunto il DB (DNS/connessione)
//  - rifiuto → il DB ha risposto ma ha RIFIUTATO la scrittura (HTTP 4xx/5xx: RLS,
//              schema, permessi) → stabile, riprovare non basta, va indagato
export type MotivoLavoro = "config" | "timeout" | "rete" | "rifiuto";
export type EsitoLavoro =
  | { ok: true; lavoro: Lavoro }
  | { ok: false; motivo: MotivoLavoro; status?: number; dettaglio: string };

// Budget di tempo TOTALE tenuto sotto il limite di durata della funzione Vercel:
// al massimo 2 tentativi da 4s con 300ms di pausa ≈ 8,3s nel caso peggiore. Così la
// funzione fa in tempo a RITORNARE l'errore vero, invece di essere uccisa a metà
// (era la causa per cui usciva sempre il messaggio generico "riprova tra poco").
const LAVORO_TIMEOUT_MS = 4000;
const LAVORO_TENTATIVI = 2;

/** Crea un lavoro e dice ESATTAMENTE cosa è successo (per la chat/coda del Pannello). */
export async function creaLavoroEsito(richiesta: string, tipo = "analisi", gruppoId?: string | null): Promise<EsitoLavoro> {
  if (!memoryConnected()) {
    return { ok: false, motivo: "config", dettaglio: "mancano SUPABASE_URL / SUPABASE_SERVICE_KEY negli env di Vercel" };
  }
  const payload: Record<string, string> = {
    richiesta: sanitizeDbText(richiesta),
    tipo: sanitizeDbText(tipo || "chat") || "chat",
    stato: "in_attesa",
  };
  if (gruppoId) payload.gruppo_id = sanitizeDbText(gruppoId);
  let ultimo: { motivo: MotivoLavoro; status?: number; dettaglio: string } = {
    motivo: "rete",
    dettaglio: "nessuna risposta dal database di memoria",
  };
  for (let tentativo = 0; tentativo < LAVORO_TENTATIVI; tentativo++) {
    if (tentativo > 0) await new Promise((r) => setTimeout(r, 300 * tentativo));
    try {
      const res = await postLavoroUnaVolta(payload, gruppoId, LAVORO_TIMEOUT_MS);
      if (res.ok) {
        const rows = (await res.json()) as Lavoro[];
        if (rows[0]) return { ok: true, lavoro: rows[0] };
        ultimo = { motivo: "rifiuto", status: res.status, dettaglio: "il DB ha risposto ma non ha restituito la riga creata" };
        continue;
      }
      const corpo = (await res.text().catch(() => "")).slice(0, 300).trim();
      ultimo = { motivo: "rifiuto", status: res.status, dettaglio: corpo || res.statusText || "scrittura rifiutata" };
      // 4xx diversi da 429 = errore STABILE (richiesta malformata, RLS, permessi): inutile ritentare.
      if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
    } catch (e: any) {
      if (e?.name === "AbortError") {
        ultimo = { motivo: "timeout", dettaglio: `il DB non ha risposto entro ${LAVORO_TIMEOUT_MS} ms` };
      } else {
        ultimo = { motivo: "rete", dettaglio: e?.message || "errore di rete verso il database di memoria" };
      }
    }
  }
  return { ok: false, ...ultimo };
}

// Crea un lavoro. Lancia MemoriaNonCollegata se mancano le chiavi (config, per i
// chiamanti storici che si aspettano l'eccezione); ritorna null se il DB non
// accetta la scrittura. Chi vuole il MOTIVO preciso usa creaLavoroEsito().
export async function creaLavoro(richiesta: string, tipo = "analisi", gruppoId?: string | null): Promise<Lavoro | null> {
  if (!memoryConnected()) throw new MemoriaNonCollegata();
  const esito = await creaLavoroEsito(richiesta, tipo, gruppoId);
  return esito.ok ? esito.lavoro : null;
}

/** Estrae la chiave sentinella dal marcatore "[sentinella-dati key=X firma=...]" in fondo alla
 * richiesta (vedi cervello/sentinella-dati.mjs). Null se il lavoro non viene da una sentinella. */
export function chiaveSentinella(richiesta: string): string | null {
  const m = /\[sentinella-dati key=([a-z0-9_]+)/i.exec(richiesta);
  return m ? m[1] : null;
}

/** Un lavoro in_attesa/in_corso con la stessa chiave sentinella è già in coda? Anti-doppione per
 * il Riprova (AR-114): quando N lavori della stessa sentinella falliscono in fila (es. limite
 * Claude scaduto) e vengono riprovati uno per uno, senza questo controllo ognuno crea un nuovo
 * lavoro invece di riconoscere che la diagnosi è già in coda una volta. */
export async function lavoroSentinellaGiaInCoda(chiave: string): Promise<string | null> {
  if (!memoryConnected()) return null;
  const marker = encodeURIComponent(`key=${chiave}`);
  const res = await sbGet(
    `${URL}/rest/v1/lavori?select=id&stato=in.(in_attesa,in_corso)&richiesta=like.*${marker}*&limit=1`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as { id: string }[];
  return rows[0]?.id || null;
}

/** Un singolo lavoro per id, corpo completo (o null). */
export async function getLavoroById(id: string): Promise<Lavoro | null> {
  if (!memoryConnected()) return null;
  const res = await sbGet(
    `${URL}/rest/v1/lavori?select=${LAVORI_SELECT_FULL}&id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Lavoro[];
  return rows[0] || null;
}

/** Dettaglio completo per più id (max 50): streaming chat, espansione card, quota worker. */
export async function getLavoriByIds(ids: string[]): Promise<Lavoro[]> {
  if (!memoryConnected()) return [];
  const uniq = [...new Set(ids.map((x) => x.trim()).filter(Boolean))].slice(0, 50);
  if (uniq.length === 0) return [];
  const inList = uniq.map((x) => encodeURIComponent(x)).join(",");
  const res = await sbGet(`${URL}/rest/v1/lavori?select=${LAVORI_SELECT_FULL}&id=in.(${inList})`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) as Lavoro[];
}

/** Aggiorna stato/risultato di un lavoro. Torna true se riuscito. */
export async function patchLavoro(id: string, patch: Partial<Pick<Lavoro, "stato" | "risultato">>): Promise<boolean> {
  if (!memoryConnected()) return false;
  const res = await sbFetch(`${URL}/rest/v1/lavori?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  }, 2);
  return res.ok;
}

/**
 * Annulla un lavoro SOLO se è ancora in uno degli stati ammessi (compare-and-set atomico,
 * lo STESSO meccanismo con cui il worker "claima" un in_attesa). Torna la riga aggiornata se
 * l'annullo ha "preso", null se lo stato è cambiato sotto di noi (es. il worker l'ha appena preso
 * → ora in_corso) o la memoria non è collegata. È questa CAS che rende l'annullo privo di race:
 * se il lavoro è già passato in_corso, il filtro non combacia e NON lo tocchiamo.
 */
export async function annullaLavoroSeStato(
  id: string,
  statiAmmessi: string[],
  risultato: string
): Promise<Lavoro | null> {
  if (!memoryConnected()) return null;
  const inFiltro = statiAmmessi.map((s) => encodeURIComponent(s)).join(",");
  const res = await sbFetch(
    `${URL}/rest/v1/lavori?id=eq.${encodeURIComponent(id)}&stato=in.(${inFiltro})`,
    {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify({ stato: "annullato", risultato, updated_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Lavoro[];
  return rows[0] || null;
}

/** Metadati soli: niente richiesta/risultato (evita timeout Postgres su poll frequenti). */
const LAVORI_SELECT_LIGHT =
  "id,created_at,updated_at,stato,tipo,esperto,gruppo_id,tentativi,riprova_dopo";
const LAVORI_SELECT_FULL =
  "id,created_at,updated_at,stato,tipo,richiesta,risultato,esperto,gruppo_id,tentativi,riprova_dopo";
const LAVORI_SELECT_LEGACY = "id,created_at,updated_at,stato,tipo,richiesta,risultato,esperto";

async function fetchLavoriQuery(extra: string, full = false): Promise<Lavoro[]> {
  if (!memoryConnected()) return [];
  const select = full ? LAVORI_SELECT_FULL : LAVORI_SELECT_LIGHT;
  const q = `${URL}/rest/v1/lavori?select=${select}&${extra}`;
  let res = await sbGet(q, { headers: headers(), cache: "no-store" });
  if (!res.ok && full) {
    res = await sbGet(`${URL}/rest/v1/lavori?select=${LAVORI_SELECT_LEGACY}&${extra}`, {
      headers: headers(),
      cache: "no-store",
    });
  }
  if (!res.ok) return [];
  return (await res.json()) as Lavoro[];
}

/** Conteggio esatto righe lavori (Prefer: count=exact). Filtro PostgREST es. `stato=eq.fatto`. */
export async function countLavori(filtro?: string): Promise<number> {
  if (!memoryConnected()) return 0;
  const params = new URLSearchParams({ select: "id", limit: "1" });
  if (filtro) {
    const eq = filtro.indexOf("=");
    if (eq > 0) params.set(filtro.slice(0, eq), filtro.slice(eq + 1));
  }
  const res = await sbGet(`${URL}/rest/v1/lavori?${params}`, {
    headers: { ...headers(), Prefer: "count=exact" },
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const range = res.headers.get("content-range") || "";
  const m = range.match(/\/(\d+)/);
  return m ? Number(m[1]) : 0;
}

export type ConteggiLavori = {
  coda: number;
  archivio: number;
  per_stato: Record<string, number>;
};

/** Badge tab Lavori: conteggi reali dal DB, non dalla finestra degli ultimi N. */
export async function getConteggiLavori(): Promise<ConteggiLavori> {
  const [in_attesa, in_corso, errore, fatto, annullato] = await Promise.all([
    countLavori("stato=eq.in_attesa"),
    countLavori("stato=eq.in_corso"),
    countLavori("stato=eq.errore"),
    countLavori("stato=eq.fatto"),
    countLavori("stato=eq.annullato"),
  ]);
  return {
    coda: in_attesa + in_corso + errore,
    archivio: fatto + annullato,
    per_stato: { in_attesa, in_corso, errore, fatto, annullato },
  };
}

export type LavoriPannello = {
  lavori: Lavoro[];
  conteggi: ConteggiLavori;
  archivio: { offset: number; limit: number; totale: number; hasMore: boolean };
};

/**
 * Lista per il Pannello: TUTTI i lavori attivi (coda) + pagina dell'archivio.
 * Prima prendeva solo gli ultimi 50 in blocco → badge e archivio troncati.
 */
export async function getLavoriPannello(archivioLimit = 100, archivioOffset = 0): Promise<LavoriPannello> {
  const limit = Math.min(Math.max(archivioLimit, 1), 200);
  const offset = Math.max(archivioOffset, 0);
  const [coda, archivio, conteggi] = await Promise.all([
    fetchLavoriQuery("stato=in.(in_attesa,in_corso,errore)&order=updated_at.desc"),
    fetchLavoriQuery(
      `stato=in.(fatto,annullato)&order=created_at.desc&limit=${limit}&offset=${offset}`
    ),
    getConteggiLavori(),
  ]);
  const caricati = offset + archivio.length;
  return {
    lavori: [...coda, ...archivio],
    conteggi,
    archivio: {
      offset,
      limit,
      totale: conteggi.archivio,
      hasMore: caricati < conteggi.archivio,
    },
  };
}

/** Ultimi lavori, dal piu' recente (finestra unica — usare getLavoriPannello per la UI Lavori). */
export async function getLavori(limit = 50): Promise<Lavoro[]> {
  return fetchLavoriQuery(`order=created_at.desc&limit=${limit}`);
}

/** Svuota i lavori. */
export async function clearLavori(): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/lavori?id=not.is.null`, {
    method: "DELETE",
    headers: { ...headers(), Prefer: "return=minimal" },
  });
}

// --- Conversazioni: la memoria delle chat (ricordare e riprendere) ---
// Ogni riga e' una conversazione con il suo elenco di messaggi (jsonb). Se la
// tabella "conversazioni" non esiste ancora, le funzioni segnalano tabella:false
// cosi la dashboard ripiega sul salvataggio locale (su questo dispositivo).

export type ConversazioneRow = {
  id: string;
  created_at: string;
  updated_at: string;
  titolo: string;
  messaggi: any;
};

/** Elenco conversazioni. tabella:false se la tabella non esiste ancora. */
export async function getConversazioni(limit = 100): Promise<{ tabella: boolean; righe: ConversazioneRow[] }> {
  if (!memoryConnected()) return { tabella: false, righe: [] };
  const res = await sbGet(
    `${URL}/rest/v1/conversazioni?select=id,created_at,updated_at,titolo,messaggi&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return { tabella: false, righe: [] };
  return { tabella: true, righe: (await res.json()) as ConversazioneRow[] };
}

/** Crea (se manca id) o aggiorna una conversazione. Torna l'id, o null. */
export async function upsertConversazione(c: { id?: string | null; titolo: string; messaggi: any }): Promise<string | null> {
  if (!memoryConnected()) return null;
  if (c.id) {
    const res = await sbFetch(`${URL}/rest/v1/conversazioni?id=eq.${c.id}`, {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify({ titolo: c.titolo, messaggi: c.messaggi, updated_at: new Date().toISOString() }),
    }, 2);
    return res.ok ? c.id : null;
  }
  const res = await sbFetch(`${URL}/rest/v1/conversazioni`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({ titolo: c.titolo, messaggi: c.messaggi }),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as { id: string }[];
  return rows[0]?.id || null;
}

/** Elimina una conversazione. */
export async function deleteConversazione(id: string): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/conversazioni?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers(), Prefer: "return=minimal" },
  });
}

/** Svuota tutte le conversazioni. */
export async function clearConversazioni(): Promise<void> {
  if (!memoryConnected()) return;
  await sbFetch(`${URL}/rest/v1/conversazioni?id=not.is.null`, {
    method: "DELETE",
    headers: { ...headers(), Prefer: "return=minimal" },
  });
}

// --- Impostazioni: chiave/valore per kill-switch, budget AI, preferenze ---
// Tabella `impostazioni` (chiave text unique, valore text, updated_at). Se manca,
// le funzioni ripiegano silenziosamente e il pannello usa i default.

/** Legge il valore di una impostazione (o null se assente/non collegato). */
export async function getImpostazione(chiave: string): Promise<string | null> {
  if (!memoryConnected()) return null;
  const res = await sbGet(
    `${URL}/rest/v1/impostazioni?select=valore&chiave=eq.${encodeURIComponent(chiave)}&limit=1`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as { valore: string }[];
  return rows[0]?.valore ?? null;
}

/** Legge tutte le impostazioni come mappa chiave→valore. */
export async function getImpostazioni(): Promise<{ tabella: boolean; valori: Record<string, string> }> {
  if (!memoryConnected()) return { tabella: false, valori: {} };
  const res = await sbGet(`${URL}/rest/v1/impostazioni?select=chiave,valore`, { headers: headers(), cache: "no-store" });
  if (!res.ok) return { tabella: false, valori: {} };
  const rows = (await res.json()) as { chiave: string; valore: string }[];
  const valori: Record<string, string> = {};
  for (const r of rows) valori[r.chiave] = r.valore;
  return { tabella: true, valori };
}

/** Scrive (upsert) una impostazione. Torna true se riuscito. */
export async function setImpostazione(chiave: string, valore: string): Promise<boolean> {
  if (!memoryConnected()) return false;
  const res = await sbFetch(`${URL}/rest/v1/impostazioni?on_conflict=chiave`, {
    method: "POST",
    headers: { ...headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ chiave, valore, updated_at: new Date().toISOString() }),
  });
  return res.ok;
}

// --- Registro azioni: impara e misura ---
// Storia append-only di ogni azione decisa/eseguita, salvata come JSON cappato
// nella chiave impostazioni "azioni_log". Serve a misurare cosa è stato fatto e
// (nel tempo) se ha reso. Degrada in silenzio se la memoria non è collegata.

export type VoceLog = {
  at: string;
  id: string;
  titolo: string;
  reparto: string;
  livello: string;
  stato: string; // fatta | simulata | coda | rifiutata
  esito: string;
  auto: boolean; // eseguita dall'autopilota?
};

export async function getAzioniLog(): Promise<VoceLog[]> {
  const raw = await getImpostazione("azioni_log");
  if (!raw) return [];
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export async function logAzione(v: Omit<VoceLog, "at"> & { at?: string }): Promise<void> {
  if (!memoryConnected()) return;
  const voce: VoceLog = { ...v, at: v.at || new Date().toISOString() };
  const cur = await getAzioniLog();
  await setImpostazione("azioni_log", JSON.stringify([voce, ...cur].slice(0, 200)));
}
