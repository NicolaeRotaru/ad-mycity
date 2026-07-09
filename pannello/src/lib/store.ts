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

/** Salva il briefing dell'ultimo giro. */
export async function saveBriefing(data: Briefing): Promise<void> {
  if (!memoryConnected()) return;
  await fetch(`${URL}/rest/v1/briefings`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ data }),
  });
}

/** Ultimo briefing salvato (o null). */
export async function getLatestBriefing(): Promise<BriefingRecord | null> {
  if (!memoryConnected()) return null;
  const res = await fetch(
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
  const res = await fetch(
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
  await fetch(`${URL}/rest/v1/diario`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ tipo: v.tipo, titolo: v.titolo, testo: v.testo }),
  });
}

/** Le ultime voci del diario, dalla piu' recente. */
export async function getDiario(limit = 200): Promise<DiarioRecord[]> {
  if (!memoryConnected()) return [];
  const res = await fetch(
    `${URL}/rest/v1/diario?select=id,created_at,tipo,titolo,testo&order=created_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return [];
  return (await res.json()) as DiarioRecord[];
}

/** Svuota il diario (tutte le voci). */
export async function clearDiario(): Promise<void> {
  if (!memoryConnected()) return;
  await fetch(`${URL}/rest/v1/diario?id=not.is.null`, {
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
  richiesta: string;
  risultato: string;
  esperto: string;
  gruppo_id?: string | null;
  /** Quante volte il worker ha già ri-provato in automatico (auto-recovery). */
  tentativi?: number;
  /** Se valorizzato e nel futuro: il lavoro è in ATTESA DI RITENTATIVO (non è bloccato). */
  riprova_dopo?: string | null;
};

/** Crea un lavoro per il cervello. Torna la riga creata, o null se non collegato. */
export async function creaLavoro(richiesta: string, tipo = "analisi", gruppoId?: string | null): Promise<Lavoro | null> {
  if (!memoryConnected()) return null;
  const payload: Record<string, string> = { richiesta, tipo, stato: "in_attesa" };
  if (gruppoId) payload.gruppo_id = gruppoId;
  let res = await fetch(`${URL}/rest/v1/lavori`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!res.ok && gruppoId) {
    const { gruppo_id: _g, ...senzaGruppo } = payload;
    res = await fetch(`${URL}/rest/v1/lavori`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify(senzaGruppo),
    });
  }
  if (!res.ok) return null;
  const rows = (await res.json()) as Lavoro[];
  return rows[0] || null;
}

/** Un singolo lavoro per id (o null). */
export async function getLavoroById(id: string): Promise<Lavoro | null> {
  if (!memoryConnected()) return null;
  const res = await fetch(
    `${URL}/rest/v1/lavori?select=id,created_at,updated_at,stato,tipo,richiesta,risultato,esperto,gruppo_id,tentativi,riprova_dopo&id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Lavoro[];
  return rows[0] || null;
}

/** Aggiorna stato/risultato di un lavoro. Torna true se riuscito. */
export async function patchLavoro(id: string, patch: Partial<Pick<Lavoro, "stato" | "risultato">>): Promise<boolean> {
  if (!memoryConnected()) return false;
  const res = await fetch(`${URL}/rest/v1/lavori?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
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
  const res = await fetch(
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

/** Ultimi lavori, dal piu' recente. */
export async function getLavori(limit = 50): Promise<Lavoro[]> {
  if (!memoryConnected()) return [];
  const q = `${URL}/rest/v1/lavori?select=id,created_at,updated_at,stato,tipo,richiesta,risultato,esperto,gruppo_id,tentativi,riprova_dopo&order=created_at.desc&limit=${limit}`;
  let res = await fetch(q, { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    res = await fetch(
      `${URL}/rest/v1/lavori?select=id,created_at,updated_at,stato,tipo,richiesta,risultato,esperto&order=created_at.desc&limit=${limit}`,
      { headers: headers(), cache: "no-store" }
    );
  }
  if (!res.ok) return [];
  return (await res.json()) as Lavoro[];
}

/** Svuota i lavori. */
export async function clearLavori(): Promise<void> {
  if (!memoryConnected()) return;
  await fetch(`${URL}/rest/v1/lavori?id=not.is.null`, {
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
  const res = await fetch(
    `${URL}/rest/v1/conversazioni?select=id,created_at,updated_at,titolo,messaggi&order=updated_at.desc&limit=${limit}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return { tabella: false, righe: [] };
  return { tabella: true, righe: (await res.json()) as ConversazioneRow[] };
}

/** Crea (se manca id) o aggiorna una conversazione. Torna l'id, o null. */
export async function upsertConversazione(c: { id?: string | null; titolo: string; messaggi: any }): Promise<string | null> {
  if (!memoryConnected()) return null;
  if (c.id) {
    const res = await fetch(`${URL}/rest/v1/conversazioni?id=eq.${c.id}`, {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify({ titolo: c.titolo, messaggi: c.messaggi, updated_at: new Date().toISOString() }),
    });
    return res.ok ? c.id : null;
  }
  const res = await fetch(`${URL}/rest/v1/conversazioni`, {
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
  await fetch(`${URL}/rest/v1/conversazioni?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers(), Prefer: "return=minimal" },
  });
}

/** Svuota tutte le conversazioni. */
export async function clearConversazioni(): Promise<void> {
  if (!memoryConnected()) return;
  await fetch(`${URL}/rest/v1/conversazioni?id=not.is.null`, {
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
  const res = await fetch(
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
  const res = await fetch(`${URL}/rest/v1/impostazioni?select=chiave,valore`, { headers: headers(), cache: "no-store" });
  if (!res.ok) return { tabella: false, valori: {} };
  const rows = (await res.json()) as { chiave: string; valore: string }[];
  const valori: Record<string, string> = {};
  for (const r of rows) valori[r.chiave] = r.valore;
  return { tabella: true, valori };
}

/** Scrive (upsert) una impostazione. Torna true se riuscito. */
export async function setImpostazione(chiave: string, valore: string): Promise<boolean> {
  if (!memoryConnected()) return false;
  const res = await fetch(`${URL}/rest/v1/impostazioni?on_conflict=chiave`, {
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
