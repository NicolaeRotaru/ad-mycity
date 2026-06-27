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

/** Lettura grezza (SOLA LETTURA) di righe da una tabella del marketplace. */
export async function marketplaceSelect(table: string, qs: string): Promise<any[]> {
  return selectRows(table, qs);
}

async function selectRows(table: string, qs: string): Promise<any[]> {
  // Resiliente: se una tabella non e' leggibile, non blocca le altre metriche. MA logghiamo l'errore:
  // così un 4xx/5xx/RLS (tabella/colonna sbagliata, permessi) è DISTINGUIBILE da "nessun dato" nei log Vercel,
  // invece di mascherarsi da lista vuota con connected:true. (Badge "dati non affidabili": rifinitura di lunedì col DB su.)
  try {
    const res = await fetch(`${URL}/rest/v1/${table}?${qs}`, { headers: headers(), cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[marketplace-db] query '${table}' fallita: ${res.status} ${body.slice(0, 200)}`);
      return [];
    }
    const d = await res.json();
    return Array.isArray(d) ? d : [];
  } catch (e: any) {
    console.error(`[marketplace-db] query '${table}' errore di rete: ${e?.message || e}`);
    return [];
  }
}

export type Metriche = {
  connected: boolean;
  error?: string;
  [k: string]: number | boolean | string | undefined;
};

/**
 * Calcola le metriche del cruscotto leggendo (SOLA LETTURA) le tabelle del
 * marketplace. Nessuna modifica al database: solo GET, aggregazione lato app.
 */
export async function getMetriche(): Promise<Metriche> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const [orders, profiles, carts, reviews] = await Promise.all([
      selectRows("orders", "select=total_price,payment_status,delivery_status,created_at,delivered_at,user_id&limit=10000"),
      selectRows("profiles", "select=role,created_at&limit=10000"),
      selectRows("abandoned_carts", "select=recovered,created_at&limit=10000"),
      selectRows("store_reviews", "select=rating&limit=10000"),
    ]);

    const now = Date.now();
    const d7 = now - 7 * 86400000;
    const d30 = now - 30 * 86400000;
    const romeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });
    const oggi = romeFmt.format(new Date());
    const t = (iso: string) => new Date(iso).getTime();
    const isOggi = (iso: string) => romeFmt.format(new Date(iso)) === oggi;
    const notFailed = (o: any) => o.payment_status !== "FAILED";
    const paid = (o: any) => o.payment_status === "PAID";
    const num = (v: any) => Number(v) || 0;
    // Media dello scontrino sugli ordini PAID in una finestra temporale.
    const media = (arr: any[]) => (arr.length ? arr.reduce((s, o) => s + num(o.total_price), 0) / arr.length : 0);

    const paidAll = orders.filter(paid);
    const paidOggi = orders.filter((o) => paid(o) && isOggi(o.created_at));
    const paid7 = orders.filter((o) => paid(o) && t(o.created_at) >= d7);
    const paid30 = orders.filter((o) => paid(o) && t(o.created_at) >= d30);
    const delivered = orders.filter((o) => o.delivered_at);
    const ratings = reviews.map((r) => num(r.rating)).filter((n) => n > 0);

    const ultimoOrdine: Record<string, number> = {};
    for (const o of orders) {
      if (o.user_id) ultimoOrdine[o.user_id] = Math.max(ultimoOrdine[o.user_id] || 0, t(o.created_at));
    }
    const ultimi = Object.values(ultimoOrdine);
    // Clienti attivi = clienti distinti che hanno ordinato nella finestra.
    const attiviIn = (pred: (iso: string) => boolean) =>
      new Set(orders.filter((o) => o.user_id && pred(o.created_at)).map((o) => o.user_id)).size;

    return {
      connected: true,
      // --- Ordini (oggi / 7g / 30g) ---
      ordini_oggi: orders.filter((o) => notFailed(o) && isOggi(o.created_at)).length,
      ordini_7g: orders.filter((o) => notFailed(o) && t(o.created_at) >= d7).length,
      ordini_30g: orders.filter((o) => notFailed(o) && t(o.created_at) >= d30).length,
      // --- Incasso / GMV (oggi / 7g / 30g) ---
      incasso_oggi: paidOggi.reduce((s, o) => s + num(o.total_price), 0),
      incasso_7g: paid7.reduce((s, o) => s + num(o.total_price), 0),
      incasso_30g: paid30.reduce((s, o) => s + num(o.total_price), 0),
      // --- Scontrino medio (storico + oggi / 7g / 30g) ---
      scontrino_medio: media(paidAll),
      scontrino_oggi: media(paidOggi),
      scontrino_7g: media(paid7),
      scontrino_30g: media(paid30),
      // --- Clienti ---
      nuovi_clienti_oggi: profiles.filter((p) => p.role === "buyer" && isOggi(p.created_at)).length,
      nuovi_clienti_7g: profiles.filter((p) => p.role === "buyer" && t(p.created_at) >= d7).length,
      nuovi_clienti_30g: profiles.filter((p) => p.role === "buyer" && t(p.created_at) >= d30).length,
      clienti: profiles.filter((p) => p.role === "buyer").length,
      clienti_attivi_oggi: attiviIn((iso) => isOggi(iso)),
      clienti_attivi_7g: attiviIn((iso) => t(iso) >= d7),
      clienti_attivi_30g: attiviIn((iso) => t(iso) >= d30),
      clienti_dormienti: ultimi.filter((tt) => tt < d30).length,
      // --- Carrelli (richiede created_at su abandoned_carts) ---
      carrelli: carts.filter((c) => c.recovered !== true).length,
      carrelli_oggi: carts.filter((c) => c.recovered !== true && c.created_at && isOggi(c.created_at)).length,
      carrelli_7g: carts.filter((c) => c.recovered !== true && c.created_at && t(c.created_at) >= d7).length,
      carrelli_30g: carts.filter((c) => c.recovered !== true && c.created_at && t(c.created_at) >= d30).length,
      carrelli_recuperati_oggi: carts.filter((c) => c.recovered === true && c.created_at && isOggi(c.created_at)).length,
      carrelli_recuperati_7g: carts.filter((c) => c.recovered === true && c.created_at && t(c.created_at) >= d7).length,
      carrelli_recuperati_30g: carts.filter((c) => c.recovered === true && c.created_at && t(c.created_at) >= d30).length,
      // --- Negozi ---
      negozi: profiles.filter((p) => p.role === "seller").length,
      nuovi_negozi_oggi: profiles.filter((p) => p.role === "seller" && isOggi(p.created_at)).length,
      nuovi_negozi_7g: profiles.filter((p) => p.role === "seller" && t(p.created_at) >= d7).length,
      nuovi_negozi_30g: profiles.filter((p) => p.role === "seller" && t(p.created_at) >= d30).length,
      // --- Consegne / Operations ---
      consegne_in_corso: orders.filter((o) => notFailed(o) && !["DELIVERED", "CANCELED"].includes(o.delivery_status)).length,
      consegne_oggi: orders.filter((o) => o.delivered_at && isOggi(o.delivered_at)).length,
      consegne_7g: orders.filter((o) => o.delivered_at && t(o.delivered_at) >= d7).length,
      consegne_30g: orders.filter((o) => o.delivered_at && t(o.delivered_at) >= d30).length,
      tempo_consegna_min: delivered.length
        ? Math.round(delivered.reduce((s, o) => s + Math.max(0, t(o.delivered_at) - t(o.created_at)) / 60000, 0) / delivered.length)
        : 0,
      problemi: orders.filter((o) => o.delivery_status === "CANCELED").length,
      annullati_oggi: orders.filter((o) => o.delivery_status === "CANCELED" && isOggi(o.created_at)).length,
      annullati_7g: orders.filter((o) => o.delivery_status === "CANCELED" && t(o.created_at) >= d7).length,
      annullati_30g: orders.filter((o) => o.delivery_status === "CANCELED" && t(o.created_at) >= d30).length,
      // --- Qualità / recensioni ---
      recensione_media: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0,
      recensioni_totali: ratings.length,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

/**
 * RETENTION / COORTI / LTV (Ondata 1.2) — la verita della crescita.
 * Legge (sola lettura) gli ordini PAID e ragiona per CLIENTE: quanti riordinano,
 * quanto tempo passa tra 1o e 2o ordine, quanto vale un cliente (LTV), e la curva
 * di riacquisto per coorte (mese del primo ordine). Solo aggregazioni lato app.
 */
export async function getRetention(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const orders = await selectRows("orders", "select=user_id,total_price,payment_status,created_at&limit=10000");
    const paid = orders.filter((o) => o.payment_status === "PAID" && o.user_id && o.created_at);

    // Raggruppa per cliente: tempi degli ordini + spesa totale.
    const perCliente: Record<string, { t: number[]; spesa: number }> = {};
    for (const o of paid) {
      const k = String(o.user_id);
      (perCliente[k] ||= { t: [], spesa: 0 });
      perCliente[k].t.push(new Date(o.created_at).getTime());
      perCliente[k].spesa += Number(o.total_price) || 0;
    }
    const clienti = Object.values(perCliente);
    const n = clienti.length;
    const conRiacquisto = clienti.filter((c) => c.t.length >= 2).length;
    const uno = clienti.filter((c) => c.t.length === 1).length;
    const due = clienti.filter((c) => c.t.length === 2).length;
    const trePiu = clienti.filter((c) => c.t.length >= 3).length;

    // Tempo medio tra 1o e 2o ordine (giorni), solo su chi ha riordinato.
    const gap: number[] = [];
    for (const c of clienti) {
      if (c.t.length >= 2) {
        const s = [...c.t].sort((a, b) => a - b);
        gap.push((s[1] - s[0]) / 86400000);
      }
    }
    const tempoMedio2 = gap.length ? gap.reduce((a, b) => a + b, 0) / gap.length : 0;
    const ltvMedio = n ? clienti.reduce((s, c) => s + c.spesa, 0) / n : 0;
    const ordiniTot = paid.length;

    // Coorti per mese del PRIMO ordine (ultime 6): % che ha poi riacquistato.
    const fmtMese = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit" });
    const coorti: Record<string, { clienti: number; riacquisto: number }> = {};
    for (const c of clienti) {
      const mese = fmtMese.format(new Date(Math.min(...c.t))).slice(0, 7); // YYYY-MM
      (coorti[mese] ||= { clienti: 0, riacquisto: 0 });
      coorti[mese].clienti++;
      if (c.t.length >= 2) coorti[mese].riacquisto++;
    }
    const coortiArr = Object.entries(coorti)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([mese, v]) => ({ mese, clienti: v.clienti, riacquisto: v.riacquisto, tasso: v.clienti ? Math.round((v.riacquisto / v.clienti) * 100) : 0 }));

    return {
      connected: true,
      clienti_paganti: n,
      ordini_validi: ordiniTot,
      repeat_rate: n ? Math.round((conRiacquisto / n) * 100) : 0,
      ordini_per_cliente: n ? Math.round((ordiniTot / n) * 100) / 100 : 0,
      tempo_medio_secondo_ordine_giorni: Math.round(tempoMedio2),
      ltv_medio: Math.round(ltvMedio * 100) / 100,
      distribuzione: { uno, due, tre_piu: trePiu },
      coorti: coortiArr,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

/**
 * PATTERN TEMPORALI (Ondata 1.4) — quando si ordina, per pianificare copertura
 * rider e orario di push/post. Conta gli ordini (non falliti) per ORA del giorno
 * e per GIORNO della settimana, nel fuso di Piacenza.
 */
export async function getPatternOrari(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const orders = await selectRows("orders", "select=created_at,payment_status&limit=10000");
    const validi = orders.filter((o) => o.payment_status !== "FAILED" && o.created_at);
    const fmtH = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", hourCycle: "h23" });
    const fmtW = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome", weekday: "short" });
    const wmap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

    const perOra = new Array(24).fill(0) as number[];
    const perGiorno = new Array(7).fill(0) as number[];
    for (const o of validi) {
      const d = new Date(o.created_at);
      perOra[parseInt(fmtH.format(d), 10) % 24]++;
      const w = wmap[fmtW.format(d)];
      if (w != null) perGiorno[w]++;
    }
    return {
      connected: true,
      totale: validi.length,
      per_ora: perOra,
      per_giorno: perGiorno,
      ora_di_punta: validi.length ? perOra.indexOf(Math.max(...perOra)) : null,
      giorno_di_punta: validi.length ? perGiorno.indexOf(Math.max(...perGiorno)) : null,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
