// 🎟️ PRENDERE IL POSTO — l'unica scrittura del Pannello che può dire «c'ero prima io».
//
// AR-412. `setImpostazione` è un upsert incondizionato: scrive e basta, sempre. Con un upsert la
// guardia contro il doppio invio può solo essere un «leggi lo stato, se è vuoto procedi» seguito,
// secondi dopo, da «scrivi lo stato» — e in mezzo c'è la chiamata che manda l'email. Due richieste
// ravvicinate leggono entrambe vuoto e partono entrambe. Su Vercel il cron, il pulsante e il
// componente sono TRE processi diversi: nessun lucchetto in memoria può vederli tutti.
//
// Qui la corsa si chiude dove è possibile chiuderla: sul DATO. La tabella `impostazioni` ha
// `chiave text not null unique` (pannello/sql/memoria-schema.sql), quindi un INSERT senza
// `on_conflict` è atomico per costruzione: o crea la riga (201) o sbatte sul vincolo (409). Non c'è
// finestra fra il controllo e la scrittura, perché non c'è nessun controllo — c'è il vincolo.
//
// Questo file è l'ADATTATORE: parla con Supabase. La regola che decide sta in `cancello-atto.ts`,
// che è puro. Il `fetch` si può sostituire (parametro `trasporto`) così una prova può mettere in
// scena due chiamate davvero concorrenti su un magazzino finto che rispetta il vincolo unico.
//
// Prova: cervello/test/c1-atto-una-volta-sola.test.mjs

import { prenotazioneDaRisposta, prenotazioneScaduta, type Prenotazione } from "./cancello-atto";

/**
 * Quanto vive una prenotazione prima di poter essere scippata.
 *
 * Dieci minuti: molto più del tetto di una funzione su Vercel (secondi) e molto meno di un turno di
 * lavoro, così un processo morto a metà non blocca l'azione fino a domani.
 */
export const SCADENZA_PRENOTAZIONE_MS = 10 * 60_000;

/** Il minimo che serve sapere di una risposta HTTP. Una `Response` vera lo soddisfa. */
export type RispostaMinima = { ok: boolean; status: number; json: () => Promise<unknown> };
export type Trasporto = (url: string, opts: Record<string, unknown>) => Promise<RispostaMinima>;

/**
 * L'ambiente si legge AL MOMENTO DELLA CHIAMATA, non all'import.
 *
 * Non è pignoleria: letto all'import, il valore si congela nella prima istanza del modulo e una
 * prova non può più metterlo in scena. Il costo è nullo, il guadagno è che questa funzione è
 * eseguibile davvero invece che solo leggibile.
 */
function ambiente(opz: OpzioniPrenotazione) {
  return {
    url: opz.url ?? process.env.SUPABASE_URL,
    key: opz.key ?? process.env.SUPABASE_SERVICE_KEY,
    trasporto: opz.trasporto ?? ((u: string, o: Record<string, unknown>) => fetch(u, o as RequestInit) as unknown as Promise<RispostaMinima>),
  };
}

export type OpzioniPrenotazione = {
  url?: string | null;
  key?: string | null;
  trasporto?: Trasporto;
  ora?: number;
  scadenzaMs?: number;
};

function intestazioni(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

/** Il valore che si scrive nel posto: chi l'ha preso e quando. Il «quando» serve alla scadenza. */
export function valorePrenotazione(chi: string, ora: number = Date.now()): string {
  return `${chi}|${new Date(ora).toISOString()}`;
}

/**
 * Prova a prendere il posto per una chiave.
 *
 * Tre esiti e nessuna scorciatoia: "mia" solo se la riga l'ho creata io o l'ho scippata a una
 * prenotazione scaduta con un confronta-e-scambia; "gia-presa" quando è di qualcun altro e non è
 * scaduta; "incerta" ogni volta che non lo so — memoria non configurata, 500, rete caduta. «Non lo
 * so» ferma l'atto esattamente come «è di un altro»: è il punto di tutto il lotto.
 */
export async function prenotaChiave(chiave: string, chi: string, opz: OpzioniPrenotazione = {}): Promise<Prenotazione> {
  const { url, key, trasporto } = ambiente(opz);
  // Memoria non collegata ⇒ non posso prendere nessun posto ⇒ non posso garantire l'unicità.
  // Rispondere "mia" qui sarebbe la stessa bugia di AR-413: eseguire senza poter registrare.
  if (!url || !key) return "incerta";
  const ora = opz.ora ?? Date.now();
  const scadenza = opz.scadenzaMs ?? SCADENZA_PRENOTAZIONE_MS;
  const mio = valorePrenotazione(chi, ora);

  let res: RispostaMinima | null = null;
  try {
    // INSERT NUDO: niente `on_conflict`. È questa assenza a rendere la scrittura condizionata.
    res = await trasporto(`${url}/rest/v1/impostazioni`, {
      method: "POST",
      headers: { ...intestazioni(key), Prefer: "return=minimal" },
      body: JSON.stringify({ chiave, valore: mio, updated_at: new Date(ora).toISOString() }),
    });
  } catch {
    return "incerta";
  }

  const esito = prenotazioneDaRisposta(res);
  if (esito !== "gia-presa") return esito;

  // C'era già: è di qualcuno che sta lavorando, o il residuo di un processo morto a metà?
  return scippaSeScaduta(chiave, mio, { url, key, trasporto, ora, scadenza });
}

async function scippaSeScaduta(
  chiave: string,
  mio: string,
  ctx: { url: string; key: string; trasporto: Trasporto; ora: number; scadenza: number },
): Promise<Prenotazione> {
  const filtro = `chiave=eq.${encodeURIComponent(chiave)}`;
  let vecchio: string | null = null;
  try {
    const res = await ctx.trasporto(`${ctx.url}/rest/v1/impostazioni?select=valore&${filtro}&limit=1`, {
      method: "GET",
      headers: intestazioni(ctx.key),
      cache: "no-store",
    });
    if (!res.ok) return "gia-presa"; // non riesco a guardare: il posto resta di chi ce l'ha
    const righe = (await res.json()) as { valore: string }[];
    vecchio = righe?.[0]?.valore ?? null;
  } catch {
    return "gia-presa";
  }

  if (!prenotazioneScaduta(vecchio, ctx.scadenza, ctx.ora)) return "gia-presa";

  // Confronta-e-scambia: la PATCH filtra anche sul valore vecchio, quindi se due processi provano a
  // scippare la stessa prenotazione scaduta uno solo si porta a casa la riga.
  try {
    const res = await ctx.trasporto(
      `${ctx.url}/rest/v1/impostazioni?${filtro}&valore=eq.${encodeURIComponent(String(vecchio))}`,
      {
        method: "PATCH",
        headers: { ...intestazioni(ctx.key), Prefer: "return=representation" },
        body: JSON.stringify({ valore: mio, updated_at: new Date(ctx.ora).toISOString() }),
      },
    );
    if (!res.ok) return "gia-presa";
    const righe = (await res.json()) as unknown[];
    return Array.isArray(righe) && righe.length === 1 ? "mia" : "gia-presa";
  } catch {
    return "gia-presa";
  }
}

/**
 * Sigilla il posto: l'atto è avvenuto, questo posto non si libera più da solo.
 *
 * Serve contro il caso peggiore: atto eseguito, registrazione dello stato fallita. Lì la casella
 * `azione:<id>` resta vuota, quindi la guardia «già fatta» non vede niente — e senza sigillo, dopo
 * la scadenza, la prenotazione verrebbe scippata e l'azione rieseguita. Il valore sigillato non
 * contiene una data leggibile, quindi `prenotazioneScaduta` non lo dichiara mai scaduto: il posto
 * resta occupato finché qualcuno non lo libera apposta.
 */
export async function sigillaChiave(chiave: string, esito: string, opz: OpzioniPrenotazione = {}): Promise<boolean> {
  const { url, key, trasporto } = ambiente(opz);
  if (!url || !key) return false;
  try {
    // Qui l'upsert va bene: il posto è già mio, sto solo dichiarando com'è finita.
    const res = await trasporto(`${url}/rest/v1/impostazioni?on_conflict=chiave`, {
      method: "POST",
      headers: { ...intestazioni(key), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        chiave,
        valore: `concluso:${esito || "?"}`,
        updated_at: new Date(opz.ora ?? Date.now()).toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function sigillaAzione(id: string, esito: string, opz: OpzioniPrenotazione = {}): Promise<boolean> {
  return sigillaChiave(chiavePostoAzione(id), esito, opz);
}

/**
 * Libera il posto. Serve quando l'atto NON è avvenuto e l'azione deve tornare disponibile — per
 * esempio quando Nicola annulla dal Pannello un lavoro mai partito. Non si chiama dopo un atto
 * riuscito: lì il posto deve restare occupato, è la memoria del fatto che è già partito.
 */
export async function liberaChiave(chiave: string, opz: OpzioniPrenotazione = {}): Promise<boolean> {
  const { url, key, trasporto } = ambiente(opz);
  if (!url || !key) return false;
  try {
    const res = await trasporto(`${url}/rest/v1/impostazioni?chiave=eq.${encodeURIComponent(chiave)}`, {
      method: "DELETE",
      headers: { ...intestazioni(key), Prefer: "return=minimal" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Le chiavi in chiaro, così nessuno le riscrive a mano in due posti diversi ────────────────────

/** Il posto di UNA azione della coda. Chi ce l'ha, la esegue; gli altri si fermano. */
export function chiavePostoAzione(id: string): string {
  return `azione:${id}:in-corso`;
}

/** Il posto dell'INTERO giro di autopilota: cron, pulsante e componente sono tre inneschi (AR-412c). */
export const CHIAVE_POSTO_AUTOPILOTA = "autopilota:in-corso";

export function prenotaAzione(id: string, chi: "nicola" | "auto", opz: OpzioniPrenotazione = {}): Promise<Prenotazione> {
  return prenotaChiave(chiavePostoAzione(id), chi, opz);
}

export function liberaAzione(id: string, opz: OpzioniPrenotazione = {}): Promise<boolean> {
  return liberaChiave(chiavePostoAzione(id), opz);
}
