"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, TrendingUp, Calculator, FileBarChart, RefreshCw, Loader2, CheckCircle2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

type Tab = "trend" | "unit" | "report";
type Punto = { giorno: string; ordini: number; incasso: number };

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
  const [report, setReport] = useState<{ collegato: boolean; elenco: string[]; ultimo: { nome: string; testo: string } | null } | null>(null);
  const [accodato, setAccodato] = useState<string | null>(null);

  const carica = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "trend") setTrend(await fetch("/api/metriche/trend").then((r) => r.json()).catch(() => null));
      else if (t === "unit") setUnit(await fetch("/api/metriche/unit").then((r) => r.json()).catch(() => null));
      else setReport(await fetch("/api/report").then((r) => r.json()).catch(() => null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica(tab);
  }, [tab, carica]);

  async function generaReport(tipo: string) {
    setAccodato(null);
    const r = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    }).then((x) => x.json()).catch(() => ({ ok: false }));
    setAccodato(r.ok ? tipo : "err");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "trend", label: "Trend & proiezioni", icon: <TrendingUp size={14} /> },
    { id: "unit", label: "Unit economics", icon: <Calculator size={14} /> },
    { id: "report", label: "Report", icon: <FileBarChart size={14} /> },
  ];

  const eur = (v: number) => "€" + (Math.round(v * 100) / 100).toLocaleString("it-IT");

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <BarChart3 size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Numeri & report</span>
        <button
          onClick={() => carica(tab)}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
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
                <Barre valori={trend.serie.map((d) => d.ordini)} colore="#C0492C" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide text-black/40">Incasso / giorno (30g)</span>
                  <span className="text-[12px] text-black/45">Proiezione mese: <b className="text-ink">{eur(trend.proiezione?.incasso_mese || 0)}</b></span>
                </div>
                <Barre valori={trend.serie.map((d) => d.incasso)} colore="#1a1410" />
              </div>
              <p className="text-[11px] text-black/40">Proiezione = media degli ultimi 7 giorni × 30. Indicativa.</p>
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
                  { l: "Margine / ordine", v: eur(unit.margine_per_ordine) },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                    <div className="text-[11px] text-black/45">{c.l}</div>
                    <div className="text-[18px] font-semibold tracking-tight mt-0.5">{c.v}</div>
                  </div>
                ))}
              </div>
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

      {/* REPORT */}
      {tab === "report" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => generaReport("giornaliero")} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-brand text-white shadow-card hover:bg-brand-dark transition">
              <FileBarChart size={14} /> Genera giornaliero
            </button>
            <button onClick={() => generaReport("settimanale")} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border border-brand/40 text-brand hover:bg-brand-50 transition">
              <FileBarChart size={14} /> Genera settimanale
            </button>
          </div>
          {accodato && accodato !== "err" && (
            <p className="text-[12px] text-green-700 flex items-center gap-1.5"><CheckCircle2 size={13} /> Report {accodato} accodato: l'AD lo scriverà al prossimo giro del worker.</p>
          )}
          {accodato === "err" && <p className="text-[12px] text-red-600">Memoria non collegata: impossibile accodare ora.</p>}

          {report?.elenco && report.elenco.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {report.elenco.slice(0, 8).map((r) => (
                <span key={r} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-paper/60 text-black/55">
                  <Download size={11} /> {r}
                </span>
              ))}
            </div>
          )}

          {report?.ultimo ? (
            <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
              <summary className="text-[13px] font-semibold cursor-pointer">Ultimo report · {report.ultimo.nome}</summary>
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
