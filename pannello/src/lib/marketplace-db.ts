// Lettura SOLA-LETTURA dal database del MARKETPLACE (mycity), separato dalla
// memoria dell'assistente. Usa Supabase/PostgREST via fetch (solo richieste GET).

import { demoAttivo, metricheDemo } from "@/lib/demo";

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
  // 🧪 Demo: numeri di esempio (chiaramente marchiati) per testare la macchina viva.
  if (await demoAttivo()) return metricheDemo();
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

/**
 * HEALTH PER NEGOZIO (Ondata 1.3) — la salute di OGNI bottega, per proteggere
 * l'asset critico (con pochi negozi, perderne uno conta). Lega gli ordini al
 * negozio via `orders.seller_id` (= `profiles.id`, role=seller) e le recensioni
 * via `store_reviews.store_id`. Ordina i peggiori per primi (chi rischia churn).
 */
export async function getHealthNegozi(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false, negozi: [] };
  try {
    const [orders, profiles, reviews] = await Promise.all([
      selectRows("orders", "select=seller_id,total_price,payment_status,created_at&limit=10000"),
      selectRows("profiles", "select=id,store_name,role,created_at&limit=10000"),
      selectRows("store_reviews", "select=store_id,rating&limit=10000"),
    ]);
    const now = Date.now();
    const d30 = now - 30 * 86400000;
    const d60 = now - 60 * 86400000;
    const t = (iso: string) => new Date(iso).getTime();
    const sellers = profiles.filter((p) => p.role === "seller");

    // Recensioni raggruppate per negozio.
    const revBy: Record<string, number[]> = {};
    for (const r of reviews) {
      const rating = Number(r.rating) || 0;
      if (rating > 0 && r.store_id) (revBy[String(r.store_id)] ||= []).push(rating);
    }

    const negozi = sellers.map((s) => {
      const id = String(s.id);
      const os = orders.filter((o) => String(o.seller_id) === id && o.payment_status !== "FAILED");
      const paid = os.filter((o) => o.payment_status === "PAID");
      const o30 = os.filter((o) => t(o.created_at) >= d30).length;
      const oPrev = os.filter((o) => t(o.created_at) >= d60 && t(o.created_at) < d30).length;
      const gmv30 = paid.filter((o) => t(o.created_at) >= d30).reduce((a, o) => a + (Number(o.total_price) || 0), 0);
      const tempi = os.map((o) => t(o.created_at));
      const ultimoGiorni = tempi.length ? Math.floor((now - Math.max(...tempi)) / 86400000) : null;
      const rev = revBy[id] || [];
      const recMedia = rev.length ? Math.round((rev.reduce((a, b) => a + b, 0) / rev.length) * 10) / 10 : 0;
      const trend = oPrev > 0 ? Math.round(((o30 - oPrev) / oPrev) * 100) : o30 > 0 ? 100 : 0;

      // Stato di salute + motivo (le soglie ricalcano le sentinelle).
      let stato: "verde" | "giallo" | "rosso" = "verde";
      let motivo = "attivo";
      if (os.length === 0) {
        stato = "rosso";
        motivo = "mai un ordine";
      } else if (ultimoGiorni != null && ultimoGiorni >= 14) {
        stato = "rosso";
        motivo = `fermo da ${ultimoGiorni}g`;
      } else if (trend <= -40) {
        stato = "giallo";
        motivo = `ordini −${Math.abs(trend)}% vs mese prima`;
      } else if (recMedia > 0 && recMedia < 3.5) {
        stato = "giallo";
        motivo = `recensioni ${recMedia}/5`;
      }
      return {
        id,
        nome: s.store_name || "(senza nome)",
        ordini_30g: o30,
        gmv_30g: Math.round(gmv30 * 100) / 100,
        ultimo_ordine_giorni: ultimoGiorni,
        recensione_media: recMedia,
        trend_pct: trend,
        stato,
        motivo,
      };
    });

    // Peggiori per primi: rosso → giallo → verde; a parità, i più fermi prima.
    const rank = { rosso: 0, giallo: 1, verde: 2 } as const;
    negozi.sort((a, b) => rank[a.stato] - rank[b.stato] || (b.ultimo_ordine_giorni ?? 9999) - (a.ultimo_ordine_giorni ?? 9999));

    return {
      connected: true,
      riepilogo: {
        totale: negozi.length,
        rossi: negozi.filter((n) => n.stato === "rosso").length,
        gialli: negozi.filter((n) => n.stato === "giallo").length,
      },
      negozi,
    };
  } catch (e: any) {
    return { connected: false, error: e.message, negozi: [] };
  }
}

/**
 * CATALOGO / PRODOTTI (Ondata 2.4) — best-seller, prodotti MAI venduti, copertura
 * per categoria e stock a zero. Lega `order_items.product_id` → `products.id`,
 * contando solo le quantità degli ordini PAID. I nomi categoria da `categories`
 * (se leggibile; altrimenti "Senza categoria"). Niente filtri su `status` indovinati.
 */
export async function getCatalogo(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const [products, items, orders, categories] = await Promise.all([
      selectRows("products", "select=id,name,category_id,status,stock,price&limit=10000"),
      selectRows("order_items", "select=order_id,product_id,quantity&limit=20000"),
      selectRows("orders", "select=id,payment_status&limit=10000"),
      selectRows("categories", "select=id,name&limit=2000"), // graceful: [] se non leggibile
    ]);

    const paidOrderIds = new Set(orders.filter((o) => o.payment_status === "PAID").map((o) => String(o.id)));
    const catName: Record<string, string> = {};
    for (const c of categories) catName[String(c.id)] = c.name || "(senza nome)";

    // Quantità venduta per prodotto (solo ordini PAID).
    const venduto: Record<string, number> = {};
    for (const it of items) {
      if (!paidOrderIds.has(String(it.order_id))) continue;
      const k = String(it.product_id);
      venduto[k] = (venduto[k] || 0) + (Number(it.quantity) || 0);
    }

    const prodotti = products.map((p) => ({
      id: String(p.id),
      nome: p.name || "(senza nome)",
      categoria: p.category_id ? catName[String(p.category_id)] || "Senza categoria" : "Senza categoria",
      status: p.status || "",
      stock: p.stock == null ? null : Number(p.stock),
      prezzo: Number(p.price) || 0,
      venduti: venduto[String(p.id)] || 0,
    }));

    const bestSeller = [...prodotti].filter((p) => p.venduti > 0).sort((a, b) => b.venduti - a.venduti).slice(0, 10);
    const maiVenduti = prodotti.filter((p) => p.venduti === 0);
    const stockZero = prodotti.filter((p) => p.stock === 0);

    // Copertura per categoria: quanti prodotti e quanti pezzi venduti.
    const perCat: Record<string, { prodotti: number; venduti: number }> = {};
    for (const p of prodotti) {
      (perCat[p.categoria] ||= { prodotti: 0, venduti: 0 });
      perCat[p.categoria].prodotti++;
      perCat[p.categoria].venduti += p.venduti;
    }
    const categorieArr = Object.entries(perCat)
      .map(([nome, v]) => ({ nome, prodotti: v.prodotti, venduti: v.venduti }))
      .sort((a, b) => b.venduti - a.venduti);

    return {
      connected: true,
      riepilogo: {
        totale_prodotti: prodotti.length,
        mai_venduti: maiVenduti.length,
        stock_zero: stockZero.length,
        categorie: categorieArr.length,
      },
      best_seller: bestSeller,
      mai_venduti: maiVenduti.slice(0, 15),
      stock_zero: stockZero.slice(0, 15),
      categorie: categorieArr,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

/**
 * MARGINE REALE per ordine (Ondata 2.3, versione dai DATI VERI) — usa i campi in
 * centesimi degli ordini: `application_fee_cents` (la nostra commissione incassata)
 * e `delivery_fee_cents` (fee consegna pagata dal cliente), meno il costo di consegna
 * (config). Media sugli ordini PAID a 30 giorni. Più onesto della stima scontrino×%.
 */
export async function getMargineReale(costoConsegna = 0): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const orders = await selectRows("orders", `select=payment_status,application_fee_cents,delivery_fee_cents,created_at&created_at=gte.${since}&limit=10000`);
    const paid = orders.filter((o) => o.payment_status === "PAID");
    const n = paid.length;
    if (n === 0) return { connected: true, ordini_paid_30g: 0 };

    const sommaComm = paid.reduce((s, o) => s + (Number(o.application_fee_cents) || 0), 0) / 100;
    const sommaFee = paid.reduce((s, o) => s + (Number(o.delivery_fee_cents) || 0), 0) / 100;
    const commMedia = sommaComm / n;
    const feeMedia = sommaFee / n;
    const cmReale = commMedia + feeMedia - costoConsegna;

    return {
      connected: true,
      ordini_paid_30g: n,
      ricavo_commissione_30g: Math.round(sommaComm * 100) / 100,
      commissione_media_ordine: Math.round(commMedia * 100) / 100,
      fee_consegna_media_ordine: Math.round(feeMedia * 100) / 100,
      costo_consegna: costoConsegna,
      cm_reale_per_ordine: Math.round(cmReale * 100) / 100,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

/**
 * RICONCILIAZIONE PAYOUT (Ondata 0.3) — i soldi dei negozi: chi è stato pagato e
 * chi no. Dai campi reali degli ordini (`seller_payout_cents`, `payout_status`,
 * `payout_at`, `refunded_amount_cents`), SENZA Stripe MCP. Bucket generici (non
 * dipende da una lista chiusa di stati): completato se c'è `payout_at`/stato di
 * successo, fallito se lo stato è di errore, altrimenti in attesa.
 */
export async function getRiconciliazionePayout(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const orders = await selectRows(
      "orders",
      "select=payment_status,payment_method,seller_payout_cents,payout_status,payout_at,refunded_amount_cents,cash_collected_cents,total_price,created_at&limit=10000"
    );
    // Ordini che generano un payout DOVUTO al negozio: pagati a carta, o COD incassato, o con payout già tracciato.
    const conIncasso = orders.filter(
      (o) => o.payment_status === "PAID" || (Number(o.cash_collected_cents) || 0) > 0 || o.payout_status != null || (Number(o.seller_payout_cents) || 0) > 0
    );

    const isOk = (s: any) => typeof s === "string" && /paid|complet|transfer|remit|success|done|settl/i.test(s);
    const isFail = (s: any) => typeof s === "string" && /fail|error|revers|cancel|declin/i.test(s);

    let completati = 0,
      falliti = 0,
      inAttesa = 0,
      euroInAttesa = 0,
      euroCompletati = 0;
    const righe: any[] = [];
    for (const o of conIncasso) {
      const payout = (Number(o.seller_payout_cents) || 0) / 100;
      const completo = o.payout_at != null || isOk(o.payout_status);
      const fallito = isFail(o.payout_status);
      let stato: "completato" | "fallito" | "in_attesa";
      if (fallito) {
        stato = "fallito";
        falliti++;
      } else if (completo) {
        stato = "completato";
        completati++;
        euroCompletati += payout;
      } else {
        stato = "in_attesa";
        inAttesa++;
        euroInAttesa += payout;
      }
      if (stato !== "completato") {
        righe.push({
          data: o.created_at,
          payout_eur: Math.round(payout * 100) / 100,
          stato,
          payout_status: o.payout_status || "(vuoto)",
          metodo: o.payment_method || "—",
        });
      }
    }

    const rimborsiArr = orders.filter((o) => (Number(o.refunded_amount_cents) || 0) > 0);
    const rimborsiEuro = rimborsiArr.reduce((s, o) => s + (Number(o.refunded_amount_cents) || 0), 0) / 100;

    const anomalie: { livello: "rosso" | "giallo"; testo: string }[] = [];
    if (falliti > 0) anomalie.push({ livello: "rosso", testo: `${falliti} payout FALLITI da rilavorare` });
    if (inAttesa > 0) anomalie.push({ livello: "giallo", testo: `${inAttesa} payout in attesa — €${Math.round(euroInAttesa * 100) / 100} dovuti ai negozi` });
    if (rimborsiArr.length > 0) anomalie.push({ livello: "giallo", testo: `${rimborsiArr.length} ordini con rimborso (€${Math.round(rimborsiEuro * 100) / 100})` });

    righe.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return {
      connected: true,
      riepilogo: {
        ordini_con_incasso: conIncasso.length,
        completati,
        in_attesa: inAttesa,
        falliti,
        euro_in_attesa: Math.round(euroInAttesa * 100) / 100,
        euro_completati: Math.round(euroCompletati * 100) / 100,
        rimborsi: rimborsiArr.length,
        rimborsi_euro: Math.round(rimborsiEuro * 100) / 100,
      },
      anomalie,
      righe: righe.slice(0, 20),
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}

/**
 * ACQUISIZIONE / ATTRIBUZIONE (Ondata 2.1, lato dati) — quanti nuovi clienti e da
 * dove, per ciò che il DB SA: referral (`profiles.referred_by`) vs diretto. La
 * spesa di acquisizione per canale non è nel DB: il CAC e il rapporto LTV:CAC li
 * calcola la route con la spesa configurata + l'LTV reale.
 */
export async function getAcquisizione(): Promise<{ connected: boolean; [k: string]: any }> {
  if (!marketplaceDbConnected()) return { connected: false };
  try {
    const profiles = await selectRows("profiles", "select=role,created_at,referred_by&limit=10000");
    const buyers = profiles.filter((p) => p.role === "buyer");
    const now = Date.now();
    const d30 = now - 30 * 86400000;
    const t = (iso: string) => new Date(iso).getTime();
    const nuovi = buyers.filter((b) => b.created_at && t(b.created_at) >= d30);
    const refTot = buyers.filter((b) => b.referred_by != null).length;
    const refNuovi = nuovi.filter((b) => b.referred_by != null).length;
    return {
      connected: true,
      clienti_totali: buyers.length,
      nuovi_30g: nuovi.length,
      referral_30g: refNuovi,
      diretti_30g: nuovi.length - refNuovi,
      referral_totali: refTot,
      quota_referral_pct: buyers.length ? Math.round((refTot / buyers.length) * 100) : 0,
    };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
