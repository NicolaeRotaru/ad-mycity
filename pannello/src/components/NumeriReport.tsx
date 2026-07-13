"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, TrendingUp, Calculator, FileBarChart, RefreshCw, Loader2, CheckCircle2, Download, Repeat, Clock, AlertTriangle, Store, Filter, Package, UserPlus, Wallet, PiggyBank } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { dataVault } from "@/lib/format";
import Aggiornato from "@/components/Aggiornato";
import { usePanelSync } from "@/lib/panel-sync";

type Tab = "trend" | "retention" | "acquisizione" | "pattern" | "negozi" | "funnel" | "catalogo" | "unit" | "cassa" | "payout" | "report";
type Punto = { giorno: string; ordini: number; incasso: number };
type Anomalia = { giorno: string; metrica: "ordini" | "incasso"; valore: number; media: number; z: number; direzione: "sopra" | "sotto" };
type Negozio = { id: string; nome: string; ordini_30g: number; gmv_30g: number; ultimo_ordine_giorni: number | null; recensione_media: number; trend_pct?: number | null; stato: "verde" | "giallo" | "rosso"; motivo: string };
const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

// Mini grafico a barre in SVG puro (niente dipendenze).
function Barre({ valori, colore }: { valori: number[]; colore: string }) {
  const max = Math.max(1, ...valori);
  const n = valori.length || 1;
  const w = 300, h = 56, gap = 1.5;
  const bw = (w - gap * (n - 1)) / n;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
      {valori.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx={0.8} fill={colore} opacity={0.85} />;
      })}
    </svg>
  );
}

export default function NumeriReport() {
  const [tab, setTab] = useState<Tab>("trend");
  const [loading, setLoading] = useState(false);

  const [trend, setTrend] = useState<{ collegato: boolean; serie: Punto[]; proiezione?: { ordini_mese: number; incasso_mese: number } } | null>(null);
  const [unit, setUnit] = useState<any>(null);
  const [report, setReport] = useState<{ collegato: boolean; elenco: { nome: string; data?: string }[]; ultimo: { nome: string; data?: string; testo: string } | null } | null>(null);
  const [retention, setRetention] = useState<any>(null);
  const [pattern, setPattern] = useState<any>(null);
  const [negozi, setNegozi] = useState<{ collegato: boolean; riepilogo?: any; negozi: Negozio[] } | null>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [catalogo, setCatalogo] = useState<any>(null);
  const [acquisizione, setAcquisizione] = useState<any>(null);
  const [payout, setPayout] = useState<any>(null);
  const [cassa, setCassa] = useState<any>(null);
  const [anomalie, setAnomalie] = useState<Anomalia[]>([]);
  const [accodato, setAccodato] = useState<string | null>(null);
  // BUG-radiografia (riga 46): «Genera report» senza disable durante l'invio → doppio clic = doppia accodatura.
  const [inviando, setInviando] = useState<string | null>(null);
  const [aggAt, setAggAt] = useState<number | null>(null);

  const carica = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "trend") {
        const [tr, an] = await Promise.all([
          fetch("/api/metriche/trend", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/anomalie", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ anomalie: [] })),
        ]);
        setTrend(tr);
        setAnomalie(an?.anomalie || []);
      } else if (t === "retention") setRetention(await fetch("/api/metriche/retention", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "acquisizione") setAcquisizione(await fetch("/api/metriche/acquisizione", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "payout") setPayout(await fetch("/api/metriche/payout", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "cassa") setCassa(await fetch("/api/metriche/cassa", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "pattern") setPattern(await fetch("/api/metriche/pattern", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "negozi") setNegozi(await fetch("/api/metriche/negozi", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "funnel") setFunnel(await fetch("/api/metriche/funnel", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "catalogo") setCatalogo(await fetch("/api/metriche/catalogo", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else if (t === "unit") setUnit(await fetch("/api/metriche/unit", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      else setReport(await fetch("/api/report", { cache: "no-store" }).then((r) => r.json()).catch(() => null));
      setAggAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica(tab);
  }, [tab, carica]);

  usePanelSync(["memoria", "all"], () => carica(tab));

  async function generaReport(tipo: string) {
    // BUG-radiografia (riga 46): blocca i bottoni durante l'invio per evitare la doppia accodatura.
    if (inviando) return;
    setAccodato(null);
    setInviando(tipo);
    try {
      const r = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      }).then((x) => x.json()).catch(() => ({ ok: false }));
      setAccodato(r.ok ? tipo : "err");
    } finally {
      setInviando(null);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "trend", label: "Trend & proiezioni", icon: <TrendingUp size={14} /> },
    { id: "retention", label: "Retention & LTV", icon: <Repeat size={14} /> },
    { id: "acquisizione", label: "Acquisizione (CAC)", icon: <UserPlus size={14} /> },
    { id: "pattern", label: "Ritmi (ore/giorni)", icon: <Clock size={14} /> },
    { id: "negozi", label: "Salute negozi", icon: <Store size={14} /> },
    { id: "funnel", label: "Funnel", icon: <Filter size={14} /> },
    { id: "catalogo", label: "Catalogo", icon: <Package size={14} /> },
    { id: "unit", label: "Unit economics", icon: <Calculator size={14} /> },
    { id: "cassa", label: "Cassa & runway", icon: <PiggyBank size={14} /> },
    { id: "payout", label: "Payout negozi", icon: <Wallet size={14} /> },
    { id: "report", label: "Report", icon: <FileBarChart size={14} /> },
  ];

  // Coercizione sicura: il giro/marketplace può mandare numeri come stringa o assenti.
  // Senza guardia → «€NaN»/«NaN%». num() coerce con fallback; eur() mostra «—» se non è un numero.
  const num = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const eur = (v?: number | string | null) => {
    const n = Number(v);
    return Number.isFinite(n) ? "€" + (Math.round(n * 100) / 100).toLocaleString("it-IT") : "—";
  };

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <BarChart3 size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Numeri & report</span>
        <Aggiornato at={aggAt} className="ml-auto" />
        <button
          onClick={() => carica(tab)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Aggiorna
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TREND */}
      {tab === "trend" && (
        <div className="space-y-5">
          {!trend?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per i trend.</p>}
          {trend?.collegato && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-black/40">Ordini / giorno (30g)</span>
                  <span className="text-[12px] text-black/45">Proiezione mese: <b className="text-ink">{trend.proiezione?.ordini_mese}</b></span>
                </div>
                <Barre valori={trend.serie.map((d) => d.ordini)} colore="#B15C43" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-black/40">Incasso / giorno (30g)</span>
                  <span className="text-[12px] text-black/45">Proiezione mese: <b className="text-ink">{eur(trend.proiezione?.incasso_mese || 0)}</b></span>
                </div>
                <Barre valori={trend.serie.map((d) => d.incasso)} colore="#1a1410" />
              </div>
              <p className="text-[11px] text-black/40">Proiezione = media degli ultimi 7 giorni × 30. Indicativa.</p>
              {anomalie.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800 mb-1.5">
                    <AlertTriangle size={13} /> Giorni anomali (oltre 2σ dalla media 30g)
                  </div>
                  <div className="space-y-1">
                    {anomalie.slice(0, 6).map((a, i) => (
                      <div key={i} className="text-[12px] text-ink/80 flex items-center gap-2">
                        <span className="font-mono text-black/45">{a.giorno}</span>
                        <span>{a.metrica === "incasso" ? eur(a.valore) : a.valore + " ordini"}</span>
                        <span className={a.direzione === "sopra" ? "text-green-700" : "text-red-600"}>
                          {a.direzione === "sopra" ? "▲" : "▼"} {a.direzione} la norma ({a.metrica === "incasso" ? eur(a.media) : a.media})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* RETENTION & LTV */}
      {tab === "retention" && (
        <div className="space-y-3">
          {!retention?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per retention e LTV.</p>}
          {retention?.collegato && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { l: "Repeat rate", v: retention.repeat_rate + "%" },
                  { l: "Ordini / cliente", v: retention.ordini_per_cliente },
                  { l: "LTV medio", v: eur(retention.ltv_medio) },
                  { l: "Clienti paganti", v: retention.clienti_paganti },
                  { l: "Tempo al 2° ordine", v: retention.tempo_medio_secondo_ordine_giorni + "g" },
                  { l: "Ordini validi (PAID)", v: retention.ordini_validi },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[18px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
              {retention.distribuzione && (
                <div className="text-[12px] text-black/60">
                  Distribuzione clienti: <b>{retention.distribuzione.uno}</b> con 1 ordine · <b>{retention.distribuzione.due}</b> con 2 · <b>{retention.distribuzione.tre_piu}</b> con 3+
                </div>
              )}
              {retention.coorti?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 mb-1">Coorti (mese del 1° ordine → % che ha riacquistato)</div>
                  <div className="space-y-1">
                    {retention.coorti.map((c: any) => (
                      <div key={c.mese} className="flex items-center gap-2 text-[12px]">
                        <span className="font-mono text-black/45 w-16 shrink-0">{c.mese}</span>
                        <div className="flex-1 h-3 rounded bg-black/[0.05] overflow-hidden">
                          <div className="h-full bg-brand/70" style={{ width: `${c.tasso}%` }} />
                        </div>
                        <span className="w-24 shrink-0 text-right text-black/60">{c.tasso}% di {c.clienti}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-black/40">Su ordini PAID. La retention è la verità della crescita: senza riacquisto, si scala un secchio bucato.</p>
            </>
          )}
        </div>
      )}

      {/* ACQUISIZIONE — CAC / LTV:CAC */}
      {tab === "acquisizione" && (
        <div className="space-y-3">
          {!acquisizione?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per l'acquisizione.</p>}
          {acquisizione?.collegato && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { l: "Clienti totali", v: acquisizione.clienti_totali },
                  { l: "Nuovi (30g)", v: acquisizione.nuovi_30g },
                  { l: "LTV medio", v: eur(acquisizione.ltv_medio) },
                  { l: "CAC", v: acquisizione.cac != null ? eur(acquisizione.cac) : "—" },
                  { l: "LTV : CAC", v: acquisizione.ltv_cac != null ? acquisizione.ltv_cac + "×" : "—" },
                  { l: "Payback (ordini)", v: acquisizione.payback_ordini != null ? acquisizione.payback_ordini : "—" },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[18px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
              <div className="text-[12px] text-black/60">
                Attribuzione (dai dati): <b>{acquisizione.referral_30g}</b> da referral · <b>{acquisizione.diretti_30g}</b> diretti negli ultimi 30g · quota referral storica {acquisizione.quota_referral_pct}%
              </div>
              {acquisizione.ltv_cac != null && (
                <div className={`rounded-xl border p-3 text-[13px] ${acquisizione.ltv_cac >= 3 ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                  {acquisizione.ltv_cac >= 3 ? "✅ LTV:CAC sano (≥3×): ogni euro speso ne rende almeno 3." : "⚠️ LTV:CAC sotto 3×: l'acquisizione a pagamento non è ancora sostenibile — prima densità e retention."}
                </div>
              )}
              {acquisizione.nota && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">{acquisizione.nota}</p>}
            </>
          )}
        </div>
      )}

      {/* RITMI — pattern ore/giorni */}
      {tab === "pattern" && (
        <div className="space-y-5">
          {!pattern?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per i ritmi.</p>}
          {pattern?.collegato && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-black/40">Ordini per ora del giorno</span>
                  {pattern.ora_di_punta != null && <span className="text-[12px] text-black/45">Punta: <b className="text-ink">{String(pattern.ora_di_punta).padStart(2, "0")}:00</b></span>}
                </div>
                <Barre valori={pattern.per_ora} colore="#B15C43" />
                <div className="flex justify-between text-[10px] text-black/35 mt-0.5"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-black/40">Ordini per giorno della settimana</span>
                  {pattern.giorno_di_punta != null && <span className="text-[12px] text-black/45">Punta: <b className="text-ink">{GIORNI[pattern.giorno_di_punta]}</b></span>}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {pattern.per_giorno.map((v: number, i: number) => {
                    const max = Math.max(1, ...pattern.per_giorno);
                    return (
                      <div key={i} className="text-center">
                        <div className="h-16 flex items-end justify-center">
                          <div className="w-full bg-ink/80 rounded-t" style={{ height: `${(v / max) * 100}%` }} />
                        </div>
                        <div className="text-[10px] text-black/45 mt-0.5">{GIORNI[i]}</div>
                        <div className="text-[11px] font-medium tabular-nums">{v}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[11px] text-black/40">Usa i picchi per la copertura rider e per l'orario di push/post. Totale ordini analizzati: {pattern.totale}.</p>
            </>
          )}
        </div>
      )}

      {/* SALUTE NEGOZI */}
      {tab === "negozi" && (
        <div className="space-y-2.5">
          {!negozi?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per la salute dei negozi.</p>}
          {negozi?.collegato && (
            <>
              {negozi.riepilogo && (
                <div className="text-[12px] text-black/60">
                  <b>{negozi.riepilogo.totale}</b> negozi · <span className="text-red-600">{negozi.riepilogo.rossi} a rischio</span> · <span className="text-amber-600">{negozi.riepilogo.gialli} da tenere d'occhio</span>
                </div>
              )}
              {negozi.negozi.length === 0 && <p className="text-[13px] text-black/45 py-2 text-center">Nessun negozio ancora.</p>}
              {negozi.negozi.map((n) => {
                const c = n.stato === "rosso" ? "border-red-200 bg-red-50/50" : n.stato === "giallo" ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/40";
                const dotc = n.stato === "rosso" ? "bg-red-500" : n.stato === "giallo" ? "bg-amber-500" : "bg-green-500";
                return (
                  <div key={n.id} className={`rounded-xl border p-2.5 ${c}`}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotc}`} />
                      <span className="text-[13px] font-semibold text-ink/90 truncate">{n.nome}</span>
                      <span className="ml-auto text-[11px] text-black/55 shrink-0">{n.motivo}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-black/55 mt-1 pl-4">
                      <span>{n.ordini_30g} ordini/30g</span>
                      <span>{eur(n.gmv_30g)} GMV</span>
                      {n.recensione_media > 0 && <span>★ {n.recensione_media}</span>}
                      {n.ultimo_ordine_giorni != null && <span>ultimo {n.ultimo_ordine_giorni}g fa</span>}
                      {n.trend_pct != null && <span className={num(n.trend_pct) < 0 ? "text-red-600" : "text-green-700"}>{num(n.trend_pct) >= 0 ? "▲" : "▼"} {Math.abs(num(n.trend_pct))}% vs mese prima</span>}
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-black/40">I peggiori in cima: l'AD li passa ad account-negozi per il check-in. Soglie: rosso = mai/fermo da 14g · giallo = −40% o recensioni &lt;3.5.</p>
            </>
          )}
        </div>
      )}

      {/* FUNNEL */}
      {tab === "funnel" && (
        <div className="space-y-3">
          {!funnel?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace (e PostHog per i visitatori) per il funnel.</p>}
          {funnel?.collegato && (
            <>
              <div className="space-y-1.5">
                {funnel.steps.map((s: any, i: number) => {
                  const max = Math.max(1, num(funnel.steps[0]?.valore, 1));
                  const val = num(s.valore);
                  return (
                    <div key={i}>
                      <div className="flex items-baseline justify-between text-[12px] mb-0.5">
                        <span className="text-ink/85">{s.nome}</span>
                        <span className="text-black/55"><b className="text-ink tabular-nums">{val.toLocaleString("it-IT")}</b>{s.conv != null && <span className="text-black/45"> · {s.conv}% del passo prima</span>}</span>
                      </div>
                      <div className="h-5 rounded bg-black/[0.05] overflow-hidden">
                        <div className="h-full bg-brand/70" style={{ width: `${Math.max(2, (val / max) * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[12px] text-black/60">🛒 Carrelli abbandonati (7g): <b>{funnel.carrelli_abbandonati_7g}</b> — ordini quasi persi da recuperare.</div>
              {funnel.nota && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">{funnel.nota}</p>}
            </>
          )}
        </div>
      )}

      {/* CATALOGO */}
      {tab === "catalogo" && (
        <div className="space-y-3">
          {!catalogo?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per il catalogo.</p>}
          {catalogo?.collegato && (
            <>
              {catalogo.riepilogo && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { l: "Prodotti", v: catalogo.riepilogo.totale_prodotti },
                    { l: "Mai venduti", v: catalogo.riepilogo.mai_venduti },
                    { l: "Stock a zero", v: catalogo.riepilogo.stock_zero },
                    { l: "Categorie", v: catalogo.riepilogo.categorie },
                  ].map((c, i) => (
                    <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-2.5">
                      <div className="text-[11px] text-black/45">{c.l}</div>
                      <div className="text-[18px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {catalogo.best_seller?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 mb-1">Best-seller (pezzi venduti, ordini pagati)</div>
                  <div className="space-y-1">
                    {catalogo.best_seller.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-2 text-[12px]">
                        <span className="text-ink/85 truncate">{p.nome}</span>
                        <span className="text-black/40 shrink-0">· {p.categoria}</span>
                        <span className="ml-auto font-semibold tabular-nums shrink-0">{p.venduti}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {catalogo.categorie?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-black/40 mb-1">Copertura per categoria</div>
                  <div className="space-y-0.5">
                    {catalogo.categorie.map((c: any) => (
                      <div key={c.nome} className="flex items-center gap-2 text-[12px]">
                        <span className="text-ink/85 truncate">{c.nome}</span>
                        <span className="ml-auto text-black/50 shrink-0">{c.prodotti} prodotti · {c.venduti} venduti</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {catalogo.mai_venduti?.length > 0 && (
                <details className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5">
                  <summary className="text-[12px] font-semibold text-amber-800 cursor-pointer">Prodotti mai venduti ({catalogo.riepilogo.mai_venduti}) — da rilanciare o togliere</summary>
                  <div className="mt-1.5 space-y-0.5">
                    {catalogo.mai_venduti.map((p: any) => (
                      <div key={p.id} className="text-[12px] text-ink/75 flex items-center gap-2">
                        <span className="truncate">{p.nome}</span>
                        <span className="ml-auto text-black/40 shrink-0">{p.categoria}{p.stock === 0 ? " · stock 0" : ""}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <p className="text-[11px] text-black/40">Best-seller = pezzi venduti su ordini pagati. I "mai venduti" e le categorie scoperte dicono a vendite cosa rilanciare o quali botteghe reclutare.</p>
            </>
          )}
        </div>
      )}

      {/* UNIT ECONOMICS */}
      {tab === "unit" && (
        <div className="space-y-3">
          {!unit?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per le unit economics.</p>}
          {unit?.collegato && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { l: "GMV (7g)", v: eur(unit.gmv_7g) },
                  { l: "Ordini (7g)", v: unit.ordini_7g },
                  { l: "Scontrino medio", v: eur(unit.scontrino_medio) },
                  { l: `Commissione`, v: unit.commissione + "%" },
                  { l: "Ricavo piattaforma (7g)", v: eur(unit.ricavo_piattaforma_7g) },
                  { l: "Margine commissione / ordine", v: eur(unit.margine_per_ordine) },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[18px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
              {/* Margine di CONTRIBUZIONE per ordine: guadagna o perde? */}
              {(() => {
                const cm = Number(unit.cm_per_ordine ?? unit.margine_per_ordine);
                const pos = cm >= 0;
                return (
                  <div className={`rounded-xl border p-3.5 ${pos ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] font-semibold text-ink/85">Margine di contribuzione / ordine</span>
                      <span className={`text-[20px] font-bold tracking-tight ${pos ? "text-green-700" : "text-red-600"}`}>{eur(cm)}</span>
                    </div>
                    <div className="text-[11px] text-black/55 mt-1">
                      = commissione {eur(unit.margine_per_ordine)} + fee consegna {eur(unit.fee_consegna_cliente || 0)} − costo consegna {eur(unit.costo_consegna || 0)}
                    </div>
                    <div className="text-[11px] text-black/50 mt-1">
                      Obiettivo dei Piani: <b>+3-4€/ordine</b> prima di scalare. Imposta <code className="bg-black/[0.06] px-1 rounded">fee_consegna_cliente</code> e <code className="bg-black/[0.06] px-1 rounded">costo_consegna</code> per renderlo reale.
                    </div>
                  </div>
                );
              })()}
              {/* Margine REALE dai campi degli ordini (commissione e fee davvero incassate, 30g) */}
              {unit.reale?.connected && unit.reale.ordini_paid_30g > 0 && (
                <div className="rounded-xl border border-black/[0.1] bg-paper/60 p-3.5">
                  <div className="text-[12px] font-semibold text-ink/85 mb-1.5">Dai dati reali · ultimi 30g ({unit.reale.ordini_paid_30g} ordini pagati)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { l: "Commissione reale / ordine", v: eur(unit.reale.commissione_media_ordine) },
                      { l: "Fee consegna reale / ordine", v: eur(unit.reale.fee_consegna_media_ordine) },
                      { l: "Ricavo commissioni (30g)", v: eur(unit.reale.ricavo_commissione_30g) },
                    ].map((c, i) => (
                      <div key={i} className="rounded-lg border border-black/[0.07] surface-muted p-2.5">
                        <div className="text-[11px] text-black/45">{c.l}</div>
                        <div className="text-[16px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const cm = Number(unit.reale.cm_reale_per_ordine);
                    const pos = cm >= 0;
                    return (
                      <div className={`mt-2 flex items-baseline justify-between rounded-lg px-2.5 py-2 ${pos ? "bg-green-50" : "bg-red-50"}`}>
                        <span className="text-[12px] font-semibold text-ink/85">Margine di contribuzione REALE / ordine</span>
                        <span className={`text-[18px] font-bold ${pos ? "text-green-700" : "text-red-600"}`}>{eur(cm)}</span>
                      </div>
                    );
                  })()}
                  <div className="text-[11px] text-black/45 mt-1">= commissione reale + fee reale − costo consegna {eur(unit.costo_consegna || 0)} (imposta <code className="bg-black/[0.06] px-1 rounded">costo_consegna</code> per il numero netto).</div>
                </div>
              )}
              <div className="rounded-xl border border-black/[0.07] bg-brand-50/40 p-3.5 text-[13px]">
                {unit.break_even_ordini_mese != null ? (
                  <>Break-even: servono <b>{unit.break_even_ordini_mese} ordini/mese</b> per coprire un costo fisso di {eur(unit.costo_fisso)}.</>
                ) : (
                  <>Imposta un costo fisso mensile (impostazione <code className="bg-black/[0.06] px-1 rounded">costo_fisso</code>) per calcolare il break-even. La commissione (<code className="bg-black/[0.06] px-1 rounded">commissione</code>) è {unit.commissione}%.</>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* CASSA & RUNWAY */}
      {tab === "cassa" && (
        <div className="space-y-3">
          {!cassa?.collegato && <p className="text-[13px] text-black/45 py-2">Imposta <code className="bg-black/[0.06] px-1 rounded">cassa_attuale</code> e <code className="bg-black/[0.06] px-1 rounded">burn_mensile</code> nelle impostazioni per il runway.</p>}
          {cassa?.collegato && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { l: "Cassa attuale", v: eur(cassa.cassa_attuale) },
                  { l: "Burn lordo / mese", v: eur(cassa.burn_lordo) },
                  { l: "Ricavo commissioni 30g", v: eur(cassa.ricavo_commissioni_30g) },
                  { l: "Burn netto / mese", v: eur(cassa.burn_netto) },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-2.5">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[16px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
              {cassa.sostenibile ? (
                <div className="rounded-xl border border-green-200 bg-green-50/50 p-3.5 text-[13px] text-green-800">✅ Sostenibile: i ricavi coprono il burn. Runway di fatto illimitato.</div>
              ) : cassa.runway_mesi != null ? (
                <div className={`rounded-xl border p-3.5 text-[13px] ${cassa.runway_mesi >= 12 ? "border-green-200 bg-green-50/50" : cassa.runway_mesi >= 6 ? "border-amber-200 bg-amber-50/50" : "border-red-200 bg-red-50/50"}`}>
                  Runway: <b>{cassa.runway_mesi} mesi</b> di autonomia al ritmo di burn attuale. {cassa.runway_mesi < 6 ? "⚠️ Sotto i 6 mesi: priorità a ricavi o raccolta." : ""}
                </div>
              ) : (
                <div className="rounded-xl border border-black/[0.07] bg-brand-50/40 p-3.5 text-[13px]">Imposta cassa e burn per calcolare i mesi di runway.</div>
              )}
              <p className="text-[11px] text-black/40">Burn netto = burn lordo − ricavo commissioni reale. Il ricavo arriva dai dati; cassa e burn dalle impostazioni.</p>
            </>
          )}
        </div>
      )}

      {/* PAYOUT — riconciliazione soldi negozi */}
      {tab === "payout" && (
        <div className="space-y-3">
          {!payout?.collegato && <p className="text-[13px] text-black/45 py-2">Servono le chiavi del marketplace per la riconciliazione payout.</p>}
          {payout?.collegato && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { l: "Ordini con incasso", v: payout.riepilogo.ordini_con_incasso },
                  { l: "Payout completati", v: payout.riepilogo.completati },
                  { l: "In attesa", v: `${payout.riepilogo.in_attesa} · ${eur(payout.riepilogo.euro_in_attesa)}` },
                  { l: "Falliti", v: payout.riepilogo.falliti },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-2.5">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[16px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
              {payout.anomalie?.length > 0 && (
                <div className="space-y-1.5">
                  {payout.anomalie.map((a: any, i: number) => (
                    <div key={i} className={`rounded-xl border p-2.5 text-[13px] ${a.livello === "rosso" ? "border-red-200 bg-red-50/60 text-red-800" : "border-amber-200 bg-amber-50/60 text-amber-800"}`}>
                      {a.livello === "rosso" ? "🔴" : "🟡"} {a.testo}
                    </div>
                  ))}
                </div>
              )}
              {payout.anomalie?.length === 0 && <p className="text-[13px] text-green-700">✅ Nessuna anomalia: payout e rimborsi in ordine.</p>}
              {payout.righe?.length > 0 && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-2.5">
                  <summary className="text-[12px] font-semibold cursor-pointer">Ordini da riconciliare ({payout.righe.length})</summary>
                  <div className="mt-1.5 space-y-0.5">
                    {payout.righe.map((r: any, i: number) => (
                      <div key={i} className="text-[12px] flex items-center gap-2">
                        <span className="font-mono text-black/45 shrink-0">{dataVault(r.data)}</span>
                        <span className={r.stato === "fallito" ? "text-red-600" : "text-amber-700"}>{r.stato.replace("_", " ")}</span>
                        <span className="text-black/45">{r.payout_status}</span>
                        <span className="ml-auto shrink-0 font-medium">{eur(r.payout_eur)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {payout.riepilogo.rimborsi > 0 && <p className="text-[12px] text-black/55">Rimborsi: {payout.riepilogo.rimborsi} ordini · {eur(payout.riepilogo.rimborsi_euro)}.</p>}
              <p className="text-[11px] text-black/40">Dai campi reali degli ordini (seller_payout_cents, payout_status), senza Stripe. "In attesa" = soldi che i negozi devono ancora ricevere.</p>
            </>
          )}
        </div>
      )}

      {/* REPORT */}
      {tab === "report" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => generaReport("giornaliero")} disabled={inviando !== null} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-brand text-white shadow-card hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed">
              {inviando === "giornaliero" ? <Loader2 size={14} className="animate-spin" /> : <FileBarChart size={14} />} Genera giornaliero
            </button>
            <button onClick={() => generaReport("settimanale")} disabled={inviando !== null} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border border-brand/40 text-brand hover:bg-brand-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {inviando === "settimanale" ? <Loader2 size={14} className="animate-spin" /> : <FileBarChart size={14} />} Genera settimanale
            </button>
          </div>
          {accodato && accodato !== "err" && (
            <p className="text-[12px] text-green-700 flex items-center gap-1.5"><CheckCircle2 size={13} /> Report {accodato} accodato: l'AD lo scriverà al prossimo giro del worker.</p>
          )}
          {accodato === "err" && <p className="text-[12px] text-red-600">Memoria non collegata: impossibile accodare ora.</p>}

          {report?.elenco && report.elenco.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {report.elenco.slice(0, 8).map((r) => (
                <span key={r.nome} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-paper/60 text-black/55">
                  <Download size={11} /> {r.data ? dataVault(r.data) : r.nome}
                </span>
              ))}
            </div>
          )}

          {report?.ultimo ? (
            <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
              <summary className="text-[13px] font-semibold cursor-pointer">Ultimo report · {dataVault(report.ultimo.data || report.ultimo.nome)}</summary>
              <div className="mt-2 max-h-96 overflow-y-auto pr-1 text-[13px] leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{report.ultimo.testo}</ReactMarkdown>
              </div>
            </details>
          ) : (
            <p className="text-[13px] text-black/45 py-2 text-center">Nessun report ancora. Premi “Genera” per crearne uno.</p>
          )}
        </div>
      )}
    </section>
  );
}
