import { NextResponse } from "next/server";
import {
  getMetriche,
  getRetention,
  getHealthNegozi,
  getCatalogo,
  getRiconciliazionePayout,
  getAcquisizione,
  getMargineReale,
  getPatternOrari,
} from "@/lib/marketplace-db";
import { getPostHog } from "@/lib/posthog";
import { getImpostazione } from "@/lib/store";
import { demoAttivo } from "@/lib/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cache in-memory (per istanza server): /api/metriche faceva ~7 scansioni della
// tabella `orders` A OGNI chiamata, senza cache — la causa principale della lentezza.
// Ora una risposta calcolata resta valida per TTL_MS, così i cambi d'area, i tab
// multipli e i re-render non ripagano ogni volta il costo pieno. La demo (cookie
// per-utente) NON entra mai in questa cache condivisa: è sempre calcolata a parte.
const TTL_MS = 45_000;
let CACHE: { ts: number; data: any } | null = null;

// Le metriche del cruscotto: dati del marketplace (mycity) + traffico (PostHog)
// + retention, health negozi, catalogo, payout, acquisizione, margine, cassa.
// Tutto in una sola risposta, così il cockpit KPI mostra TUTTI i dati disponibili.
export async function GET() {
  // Demo: dipende da un cookie per-utente → mai dalla cache condivisa.
  if (await demoAttivo()) {
    return NextResponse.json(await getMetriche());
  }
  // Cache ancora fresca: rispondi subito, niente scansioni del DB.
  if (CACHE && Date.now() - CACHE.ts < TTL_MS) {
    return NextResponse.json(CACHE.data);
  }

  const m: any = await getMetriche();
  if (m.demo) return NextResponse.json(m);

  const [ph, retention, health, catalogo, payout, acquisizione, margine, pattern, cassaStr, burnStr] =
    await Promise.all([
      getPostHog(),
      getRetention().catch(() => ({ connected: false })),
      getHealthNegozi().catch(() => ({ connected: false, negozi: [], riepilogo: {} })),
      getCatalogo().catch(() => ({ connected: false, riepilogo: {} })),
      getRiconciliazionePayout().catch(() => ({ connected: false, riepilogo: {} })),
      getAcquisizione().catch(() => ({ connected: false })),
      getMargineReale().catch(() => ({ connected: false })),
      getPatternOrari().catch(() => ({ connected: false })),
      getImpostazione("cassa_attuale").catch(() => null),
      getImpostazione("burn_mensile").catch(() => null),
    ]);

  const marketplaceCollegato = Boolean(m.connected);

  // --- Traffico (PostHog) ---
  if (ph.connected) {
    m.visite_7g = ph.visite_7g;
    if (marketplaceCollegato) {
      const ordini7 = Number(m.ordini_7g) || 0;
      m.conversione = ph.visitatori_7g ? Math.round((ordini7 / ph.visitatori_7g) * 1000) / 10 : 0;
    }
  }

  // --- Retention / LTV ---
  if ((retention as any).connected) {
    const r = retention as any;
    m.repeat_rate = r.repeat_rate;
    m.ltv_medio = r.ltv_medio;
    m.ordini_per_cliente = r.ordini_per_cliente;
    m.tempo_medio_secondo_ordine_giorni = r.tempo_medio_secondo_ordine_giorni;
    m.clienti_paganti = r.clienti_paganti;
  }

  // --- Health negozi ---
  if ((health as any).connected) {
    const h = health as any;
    m.negozi_rossi = h.riepilogo?.rossi ?? 0;
    m.negozi_gialli = h.riepilogo?.gialli ?? 0;
    m.negozi_totale_health = h.riepilogo?.totale ?? 0;
  }

  // --- Catalogo ---
  if ((catalogo as any).connected) {
    const c = (catalogo as any).riepilogo || {};
    m.prodotti_totali = c.totale_prodotti ?? 0;
    m.prodotti_mai_venduti = c.mai_venduti ?? 0;
    m.prodotti_stock_zero = c.stock_zero ?? 0;
    m.categorie_coperte = c.categorie ?? 0;
  }

  // --- Payout ---
  if ((payout as any).connected) {
    const p = (payout as any).riepilogo || {};
    m.payout_completati = p.completati ?? 0;
    m.payout_in_attesa = p.in_attesa ?? 0;
    m.payout_falliti = p.falliti ?? 0;
    m.payout_euro_in_attesa = p.euro_in_attesa ?? 0;
    m.payout_completati_euro = p.euro_completati ?? 0;
    m.rimborsi_n = p.rimborsi ?? 0;
    m.rimborsi_euro = p.rimborsi_euro ?? 0;
  }

  // --- Acquisizione ---
  if ((acquisizione as any).connected) {
    const a = acquisizione as any;
    m.nuovi_clienti_30g_acq = a.nuovi_30g;
    m.referral_30g = a.referral_30g;
    m.referral_totali = a.referral_totali;
    m.quota_referral_pct = a.quota_referral_pct;
  }

  // --- Margine reale ---
  if ((margine as any).connected) {
    const mr = margine as any;
    m.ricavo_commissione_30g = mr.ricavo_commissione_30g;
    m.commissione_media_ordine = mr.commissione_media_ordine;
    m.fee_consegna_media_ordine = mr.fee_consegna_media_ordine;
    m.cm_reale_per_ordine = mr.cm_reale_per_ordine;
  }

  // --- Pattern orari ---
  if ((pattern as any).connected) {
    const pt = pattern as any;
    m.ora_di_punta = pt.ora_di_punta;
    m.giorno_di_punta = pt.giorno_di_punta;
  }

  // --- Cassa / Runway ---
  const cassa = Number(cassaStr || "0");
  const burnLordo = Number(burnStr || "0");
  const ricavo30 = Number(m.ricavo_commissione_30g || 0);
  const burnNetto = burnLordo - ricavo30;
  if (cassa > 0 || burnLordo > 0 || ricavo30 > 0) {
    m.cassa_attuale = Math.round(cassa * 100) / 100;
    m.burn_lordo = Math.round(burnLordo * 100) / 100;
    m.burn_netto = Math.round(burnNetto * 100) / 100;
    m.runway_mesi = burnNetto > 0 && cassa > 0 ? Math.round((cassa / burnNetto) * 10) / 10 : null;
  }

  // --- Unit economics (break-even) ---
  const commissione = Number(await getImpostazione("commissione").catch(() => null) || "12");
  const costoFisso = Number(await getImpostazione("costo_fisso").catch(() => null) || "0");
  const feeCliente = Number(await getImpostazione("fee_consegna_cliente").catch(() => null) || "0");
  const costoConsegna = Number(await getImpostazione("costo_consegna").catch(() => null) || "0");
  const scontrino = Number(m.scontrino_medio || 0);
  const marginePerOrdine = (scontrino * commissione) / 100;
  const cmPerOrdine = marginePerOrdine + feeCliente - costoConsegna;
  m.break_even_ordini_mese = costoFisso > 0 && cmPerOrdine > 0 ? Math.ceil(costoFisso / cmPerOrdine) : null;

  // --- Flag ---
  m.marketplace_collegato = marketplaceCollegato;
  m.traffico_collegato = Boolean(ph.connected);
  m.connected = marketplaceCollegato || Boolean(ph.connected);

  CACHE = { ts: Date.now(), data: m };
  return NextResponse.json(m);
}
