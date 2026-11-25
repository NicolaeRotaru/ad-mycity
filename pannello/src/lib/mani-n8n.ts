// LE MANI IN n8n — dal 25/11/2026 le azioni approvate nel Pannello le esegue n8n (flusso
// «23 · Mani del Pannello»), non più il worker del server dell'AD, spento per sempre il 24/11.
//
// Il Pannello manda l'azione all'indirizzo N8N_WEBHOOK_URL con il segreto N8N_WEBHOOK_SEGRETO
// nell'intestazione `x-mycity-segreto`. n8n risponde con lo stesso formato di `Esito`.
//
// LA REGOLA CHE NON SI TOCCA: un'azione 🔴 parte SOLO se l'ha firmata Nicola nel Pannello. Qui
// (e di nuovo dentro n8n) un 🔴 deciso dall'autopilota — o un livello che non si sa leggere — non
// esce mai: resta in coda. Il colore sconosciuto vale rosso, perché nel dubbio si sale di colore.
//
// `decidiN8n` è pura (nessuna rete, nessun ambiente letto): la prova la esegue su casi finti.

export type FirmataDa = "nicola" | "auto";
export type AzionePerN8n = {
  id?: string;
  titolo: string;
  canale: string;
  destinatario?: string;
  testo: string;
  livello?: string;
  firmataDa?: FirmataDa;
};
type EsitoN8n = { stato: "fatta" | "simulata" | "coda"; dettaglio: string };

export type DecisioneN8n =
  | { manda: false; esito: EsitoN8n }
  | { manda: true; corpo: Record<string, unknown> };

const LIVELLI = new Set(["verde", "giallo", "rosso"]);

export function decidiN8n(a: AzionePerN8n, cfg: { url?: string; segreto?: string; adesso?: string }): DecisioneN8n {
  if (!cfg.url) return { manda: false, esito: { stato: "coda", dettaglio: `Canale "${a.canale || "non indicato"}" non ancora collegato: resta in coda.` } };
  if (!/^https:\/\//.test(cfg.url)) return { manda: false, esito: { stato: "coda", dettaglio: "N8N_WEBHOOK_URL non è un indirizzo https: resta in coda." } };
  if (!cfg.segreto) return { manda: false, esito: { stato: "coda", dettaglio: "Manca il segreto per n8n (N8N_WEBHOOK_SEGRETO): resta in coda." } };
  const livello = LIVELLI.has(String(a.livello)) ? String(a.livello) : "rosso";
  const firmataDa: FirmataDa = a.firmataDa === "nicola" ? "nicola" : "auto";
  if (livello === "rosso" && firmataDa !== "nicola") {
    return { manda: false, esito: { stato: "coda", dettaglio: "Azione 🔴 senza la firma di Nicola: non parte da sola, resta in coda." } };
  }
  return {
    manda: true,
    corpo: {
      azione_id: a.id || null, titolo: a.titolo, canale: a.canale, destinatario: a.destinatario || null, testo: a.testo,
      livello, firmata_da: firmataDa, firmata_il: cfg.adesso || new Date().toISOString(), fonte: "pannello",
    },
  };
}

/** Legge la risposta di n8n. Qualunque cosa fuori formato vale «coda», mai «fatta». */
export function leggiRispostaN8n(status: number, corpo: unknown): EsitoN8n {
  if (status < 200 || status >= 300) return { stato: "coda", dettaglio: `n8n ha risposto ${status}: resta in coda.` };
  const c = corpo as { stato?: unknown; dettaglio?: unknown } | null;
  if (c && (c.stato === "fatta" || c.stato === "simulata" || c.stato === "coda") && typeof c.dettaglio === "string") {
    return { stato: c.stato, dettaglio: `n8n · ${c.dettaglio}` };
  }
  return { stato: "coda", dettaglio: "n8n ha risposto fuori formato: non so se è partita, resta in coda." };
}

export async function mandaAN8n(a: AzionePerN8n): Promise<EsitoN8n> {
  const url = process.env.N8N_WEBHOOK_URL?.trim();
  const segreto = process.env.N8N_WEBHOOK_SEGRETO?.trim();
  const d = decidiN8n(a, { url, segreto });
  if (!d.manda) return d.esito;
  try {
    const res = await fetch(url as string, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mycity-segreto": segreto as string },
      body: JSON.stringify(d.corpo),
      signal: AbortSignal.timeout(20_000),
    });
    const corpo = await res.json().catch(() => null);
    return leggiRispostaN8n(res.status, corpo);
  } catch (e: any) {
    return { stato: "coda", dettaglio: `n8n non raggiungibile (${e?.message || "errore di rete"}): resta in coda.` };
  }
}
