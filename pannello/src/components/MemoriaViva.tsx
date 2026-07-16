"use client";

import { useCallback, useEffect, useState } from "react";
import { ListChecks, RefreshCw, Loader2 } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { dataVault } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";
import Aggiornato from "@/components/Aggiornato";
import ParlaCasella from "@/components/ParlaCasella";

type Attivita = {
  collegato: boolean;
  vaultGithub?: boolean;
  ramo?: string;
  repo?: string | null;
  briefing: { nome: string; data?: string; testo: string } | null;
  salaOperativa: string;
};

const Markdown: Components = {
  h1: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h4 className="text-[13px] font-semibold mt-3 mb-1">{children}</h4>,
  h3: ({ children }) => <h5 className="text-[13px] font-semibold mt-2 mb-1">{children}</h5>,
  p: ({ children }) => <p className="text-[13px] leading-relaxed text-ink/85 my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ol>,
  li: ({ children }) => <li className="text-ink/85">{children}</li>,
};

export default function MemoriaViva() {
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);
  const [attivita, setAttivita] = useState<Attivita | null>(null);
  const [aggAt, setAggAt] = useState<number | null>(null);
  const [ramoVault, setRamoVault] = useState<string | null>(null);

  const carica = useCallback((silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    fetch("/api/memoria/attivita", { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ collegato: false }))
      .then((at) => {
        setAttivita(at && (at.briefing || at.salaOperativa) ? at : at?.collegato ? at : null);
        setRamoVault(at?.ramo || null);
        setCollegato(Boolean(at?.collegato));
        setAggAt(Date.now());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(() => carica(true), 90000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["memoria", "azioni", "radiografia", "all"], () => carica(true));

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <ListChecks size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Memoria viva</span>
        {ramoVault && collegato && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand border border-brand/15">
            ramo {ramoVault}
          </span>
        )}
        <Aggiornato at={aggAt} className="ml-auto" />
        <button
          onClick={() => carica()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Aggiorna
        </button>
      </div>

      {loading && !attivita ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico…
        </div>
      ) : !collegato ? (
        <div className="text-center text-black/50 py-8 text-sm max-w-lg mx-auto">
          <p className="mb-2 font-medium text-ink/80">Vault non raggiungibile.</p>
          <p className="text-xs text-black/45">Briefing e sala operativa compaiono appena il giro salva su GitHub.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attivita?.briefing && (
            <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
              <summary className="text-[13px] font-semibold cursor-pointer">📋 Ultimo briefing · {dataVault(attivita.briefing.data || attivita.briefing.nome)}</summary>
              <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{attivita.briefing.testo}</ReactMarkdown>
              </div>
              <ParlaCasella titolo="Ultimo briefing" contesto={(attivita.briefing.testo || "").slice(0, 800)} />
            </details>
          )}
          {attivita?.salaOperativa && (
            <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
              <summary className="text-[13px] font-semibold cursor-pointer">🛰️ Sala Operativa</summary>
              <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{attivita.salaOperativa}</ReactMarkdown>
              </div>
              <ParlaCasella titolo="Sala Operativa" contesto={(attivita.salaOperativa || "").slice(0, 800)} />
            </details>
          )}
          {!attivita?.briefing && !attivita?.salaOperativa && (
            <p className="text-sm text-black/45 py-4 text-center">Nessun briefing o sala operativa ancora.</p>
          )}
        </div>
      )}
    </section>
  );
}
