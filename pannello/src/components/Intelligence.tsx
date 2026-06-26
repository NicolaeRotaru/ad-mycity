"use client";

import { useCallback, useEffect, useState } from "react";
import { Telescope, AlertTriangle, Swords, CalendarClock, PackageSearch, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

type Tab = "alert" | "concorrenti" | "eventi" | "buchi";
type Alert = { livello: "rosso" | "giallo"; titolo: string; perche: string; cosaFare: string };

const INTEL: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "alert", label: "Alert anomalie", icon: <AlertTriangle size={14} /> },
  { id: "concorrenti", label: "Concorrenti", icon: <Swords size={14} /> },
  { id: "eventi", label: "Eventi & picchi", icon: <CalendarClock size={14} /> },
  { id: "buchi", label: "Buchi di mercato", icon: <PackageSearch size={14} /> },
];

export default function Intelligence() {
  const [tab, setTab] = useState<Tab>("alert");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{ collegato: boolean; alert: Alert[] } | null>(null);
  const [cache, setCache] = useState<Record<string, { presente: boolean; testo: string }>>({});
  const [accodato, setAccodato] = useState<string | null>(null);

  const carica = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "alert") {
        const a = await fetch("/api/alert").then((r) => r.json()).catch(() => ({ collegato: false, alert: [] }));
        setAlert(a);
      } else {
        const r = await fetch(`/api/intelligence?tipo=${t}`).then((x) => x.json()).catch(() => ({ presente: false, testo: "" }));
        setCache((c) => ({ ...c, [t]: { presente: r.presente, testo: r.testo } }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica(tab);
  }, [tab, carica]);

  async function rigenera(t: Tab) {
    setAccodato(null);
    const r = await fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: t }),
    }).then((x) => x.json()).catch(() => ({ ok: false }));
    setAccodato(r.ok ? t : `err:${t}`);
  }

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Telescope size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Intelligence & opportunità</span>
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
        {INTEL.map((t) => (
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

      {/* ALERT */}
      {tab === "alert" && (
        <div className="space-y-2.5">
          {!alert?.collegato && (
            <p className="text-[13px] text-black/45 py-2">
              Servono le chiavi del marketplace (<code className="bg-black/[0.05] px-1 rounded">MARKETPLACE_SUPABASE_*</code>) per calcolare gli alert.
            </p>
          )}
          {alert?.collegato && alert.alert.length === 0 && (
            <p className="text-[13px] text-green-700 flex items-center gap-1.5 py-2"><CheckCircle2 size={15} /> Tutto tranquillo: nessuna anomalia rilevata.</p>
          )}
          {alert?.alert.map((a, i) => (
            <div key={i} className={`rounded-xl border p-3.5 ${a.livello === "rosso" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/40"}`}>
              <div className="flex items-center gap-2">
                <span className={a.livello === "rosso" ? "text-red-500" : "text-amber-500"}>{a.livello === "rosso" ? "🔴" : "🟡"}</span>
                <span className="text-[14px] font-semibold">{a.titolo}</span>
              </div>
              <p className="text-[12px] text-black/60 mt-1">{a.perche}</p>
              <p className="text-[12px] text-ink/85 mt-1"><b>Cosa fare:</b> {a.cosaFare}</p>
            </div>
          ))}
        </div>
      )}

      {/* CONCORRENTI / EVENTI / BUCHI (cache vault + rigenera) */}
      {tab !== "alert" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-black/45">Ultimo risultato salvato dall'AD. Premi “Aggiorna analisi” per rigenerarlo.</p>
            <button
              onClick={() => rigenera(tab)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-brand text-white shadow-card hover:bg-brand-dark transition"
            >
              <RefreshCw size={14} /> Aggiorna analisi
            </button>
          </div>
          {accodato === tab && (
            <p className="text-[12px] text-green-700 flex items-center gap-1.5"><CheckCircle2 size={13} /> Accodato all'AD: lo genererà al prossimo giro del worker.</p>
          )}
          {accodato === `err:${tab}` && (
            <p className="text-[12px] text-red-600">Memoria non collegata: impossibile accodare ora.</p>
          )}
          {cache[tab]?.presente ? (
            <div className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5 max-h-96 overflow-y-auto text-[13px] leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{cache[tab].testo}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-[13px] text-black/45 py-4 text-center">Non ancora generato. Premi “Aggiorna analisi”.</p>
          )}
        </div>
      )}
    </section>
  );
}
