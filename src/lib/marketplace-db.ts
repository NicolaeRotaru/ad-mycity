// Lettura SOLA-LETTURA dal database del MARKETPLACE (mycity), separato dalla
// memoria dell'assistente. Usa Supabase/PostgREST via fetch (solo richieste GET).

const URL = process.env.MARKETPLACE_SUPABASE_URL;
const KEY = process.env.MARKETPLACE_SUPABASE_KEY;

export function marketplaceDbConnected(): boolean {
  return Boolean(URL && KEY);
}

const NON_COLLEGATO =
  "Database del marketplace non collegato. Servono MARKETPLACE_SUPABASE_URL e MARKETPLACE_SUPABASE_KEY (di sola lettura) nelle variabili d'ambiente.";

function headers(extra?: Record<string, string>) {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    ...(extra || {}),
  };
}

/** Elenco delle tabelle del database del marketplace. */
export async function listTables(): Promise<string> {
  if (!marketplaceDbConnected()) return NON_COLLEGATO;
  try {
    const res = await fetch(`${URL}/rest/v1/`, { headers: headers(), cache: "no-store" });
    const data: any = await res.json();
    if (!res.ok) return `Errore: ${data.message || res.status}`;
    // PostgREST espone le tabelle in "definitions" (swagger) o nei "paths".
    let tabelle: string[] = [];
    if (data.definitions) tabelle = Object.keys(data.definitions);
    else if (data.paths) tabelle = Object.keys(data.paths).map((p) => p.replace(/^\//, "")).filter(Boolean);
    tabelle = tabelle.filter((t) => t && !t.startsWith("rpc/"));
    return tabelle.length
      ? `Tabelle nel marketplace:\n${tabelle.join("\n")}`
      : "Nessuna tabella visibile (controlla i permessi della chiave).";
  } catch (e: any) {
    return `Errore leggendo le tabelle: ${e.message}`;
  }
}

/** Legge righe da una tabella del marketplace (con conteggio totale). */
export async function queryTable(opts: {
  tabella: string;
  select?: string;
  filtro?: string;
  ordina?: string;
  limite?: number;
}): Promise<string> {
  if (!marketplaceDbConnected()) return NON_COLLEGATO;
  const tabella = String(opts.tabella || "").trim();
  if (!/^[a-zA-Z0-9_]+$/.test(tabella)) return "Nome tabella non valido.";

  const limite = Math.min(Math.max(Number(opts.limite) || 20, 1), 100);
  const params = new URLSearchParams();
  params.set("select", opts.select?.trim() || "*");
  if (opts.ordina?.trim()) params.set("order", opts.ordina.trim());
  params.set("limit", String(limite));
  // filtro: stringa PostgREST tipo "created_at=gte.2026-06-01" (puo' avere piu' coppie con &)
  const filtroQS = opts.filtro?.trim() ? "&" + opts.filtro.trim() : "";

  try {
    const res = await fetch(`${URL}/rest/v1/${tabella}?${params.toString()}${filtroQS}`, {
      headers: headers({ Prefer: "count=exact" }),
      cache: "no-store",
    });
    const data: any = await res.json();
    if (!res.ok) return `Errore query su ${tabella}: ${data.message || res.status}`;
    // Totale dal Content-Range (es. "0-19/12345").
    const range = res.headers.get("content-range") || "";
    const totale = range.includes("/") ? range.split("/")[1] : "?";
    let righe = JSON.stringify(data, null, 2);
    if (righe.length > 8000) righe = righe.slice(0, 8000) + "\n[...troncato]";
    return `Tabella "${tabella}" — totale righe: ${totale} (ne mostro fino a ${limite}):\n${righe}`;
  } catch (e: any) {
    return `Errore query su ${tabella}: ${e.message}`;
  }
}
