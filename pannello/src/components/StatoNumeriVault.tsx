"use client";

import { useCallback, useEffect, useState } from "react";
import { Gauge, Map as MapIcon, RefreshCw, Loader2, Target } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { dataVault } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";
import Aggiornato from "@/components/Aggiornato";
import StellePolari from "@/components/StellePolari";
import ParlaCasella from "@/components/ParlaCasella";

type Piano = { nome: string; testo: string };
type Okr = { senior: string; kpi: string; target: string; budget: string };

const Markdown: Components = {
  h1: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h4 className="text-[13px] font-semibold mt-3 mb-1">{children}</h4>,
  h3: ({ children }) => <h5 className="text-[13px] font-semibold mt-2 mb-1">{children}</h5>,
  p: ({ children }) => <p className="text-[13px] leading-relaxed text-ink/85 my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ol>,
  li: ({ children }) => <li className="text-ink/85">{children}</li>,
};

function Intestazione({ titolo, icon, aggAt, loading, onRefresh }: { titolo: string; icon: React.ReactNode; aggAt: number | null; loading: boolean; onRefresh: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="t-sez">{titolo}</span>
      <Aggiornato at={aggAt} className="ml-auto" />
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        Aggiorna
      </button>
    </div>
  );
}

export function SezioneStato() {
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);
  const [stato, setStato] = useState("");
  const [statoAgg, setStatoAgg] = useState("");
  const [aggAt, setAggAt] = useState<number | null>(null);

  const carica = useCallback((silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    fetch("/api/memoria/stato", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, testo: "" }))
      .then((st) => { setStato(st.testo || ""); setStatoAgg(st.aggiornato || ""); setCollegato(!!st.collegato); })
      .finally(() => { setLoading(false); setAggAt(Date.now()); });
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(() => carica(true), 90000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["memoria", "azioni", "all"], () => carica(true));

  if (loading && !stato) {
    return (
      <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Carico lo stato…
      </div>
    );
  }

  if (!collegato) {
    return <p className="text-sm text-black/50 py-6 text-center">Vault non raggiungibile.</p>;
  }

  return (
    <div className="space-y-2">
      <Intestazione titolo="Situazione attuale" icon={<Gauge size={15} className="text-brand" />} aggAt={aggAt} loading={loading} onRefresh={() => carica()} />
      {statoAgg && <p className="t-eti -mt-1">{dataVault(statoAgg)}</p>}
      <div className="max-h-[24rem] overflow-y-auto pr-1 rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
        {stato ? <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{stato}</ReactMarkdown>
          : <p className="text-sm text-black/45 py-2 text-center">Nessun file stato ancora.</p>}
      </div>
    </div>
  );
}

export function SezioneOkr() {
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);
  const [okr, setOkr] = useState<{ northStar: string; righe: Okr[]; aggiornato: string }>({ northStar: "", righe: [], aggiornato: "" });
  const [aggAt, setAggAt] = useState<number | null>(null);

  const carica = useCallback((silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    fetch("/api/memoria/okr", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, righe: [], aggiornato: "" }))
      .then((ok) => { setOkr({ northStar: ok.northStar || "", righe: ok.righe || [], aggiornato: ok.aggiornato || "" }); setCollegato(!!ok.collegato); })
      .finally(() => { setLoading(false); setAggAt(Date.now()); });
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(() => carica(true), 90000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["memoria", "azioni", "all"], () => carica(true));

  if (loading && okr.righe.length === 0) {
    return (
      <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Carico gli OKR…
      </div>
    );
  }

  if (!collegato) {
    return <p className="text-sm text-black/50 py-6 text-center">Vault non raggiungibile.</p>;
  }

  return (
    <div className="space-y-3">
      <Intestazione titolo="OKR & pagella" icon={<Target size={15} className="text-brand" />} aggAt={aggAt} loading={loading} onRefresh={() => carica()} />
      <StellePolari />
      <p className="t-eti">Le Stelle Polari si aggiornano da sole. Sotto: OKR dal vault{okr.aggiornato ? ` · ${dataVault(okr.aggiornato)}` : ""}.</p>
      {okr.northStar && <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 t-riga">🌟 {okr.northStar}</div>}
      {okr.righe.map((r, i) => (
        <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="t-riga font-medium">{r.senior}</span>
            <span className="t-eti">{r.budget}</span>
          </div>
          <div className="t-eti mt-0.5">{r.kpi}</div>
          <div className="t-riga mt-0.5">🎯 {r.target}</div>
          <ParlaCasella titolo={`OKR: ${r.senior}`} contesto={[r.kpi && `KPI: ${r.kpi}`, r.target && `Target: ${r.target}`].filter(Boolean).join(" · ")} />
        </div>
      ))}
    </div>
  );
}

export function SezionePiani() {
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);
  const [piani, setPiani] = useState<Piano[]>([]);
  const [aggAt, setAggAt] = useState<number | null>(null);

  const carica = useCallback((silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    fetch("/api/memoria/piani", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, piani: [] }))
      .then((pi) => { setPiani(pi.piani || []); setCollegato(!!pi.collegato); })
      .finally(() => { setLoading(false); setAggAt(Date.now()); });
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(() => carica(true), 90000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["memoria", "azioni", "all"], () => carica(true));

  if (loading && piani.length === 0) {
    return (
      <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Carico i piani…
      </div>
    );
  }

  if (!collegato) {
    return <p className="text-sm text-black/50 py-6 text-center">Vault non raggiungibile.</p>;
  }

  return (
    <div className="space-y-2">
      <Intestazione titolo="Piani" icon={<MapIcon size={15} className="text-brand" />} aggAt={aggAt} loading={loading} onRefresh={() => carica()} />
      <div className="space-y-2.5">
        {piani.length === 0 && <p className="text-sm text-black/45 py-2 text-center">Nessun piano in 06-Piani.</p>}
        {piani.map((p) => (
          <details key={p.nome} className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
            <summary className="text-[13px] font-semibold cursor-pointer">🧩 {p.nome}</summary>
            <div className="mt-2 max-h-96 overflow-y-auto pr-1">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{p.testo}</ReactMarkdown>
            </div>
            <ParlaCasella titolo={`Piano: ${p.nome}`} contesto={(p.testo || "").slice(0, 800)} />
          </details>
        ))}
      </div>
    </div>
  );
}
