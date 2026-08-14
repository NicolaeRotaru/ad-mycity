"use client";

import { useCallback, useEffect, useState } from "react";
import { ListChecks, RefreshCw, Loader2, Radio } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { dataVault } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";
import Aggiornato from "@/components/Aggiornato";
import ParlaCasella from "@/components/ParlaCasella";
import { classeListaScorrevole } from "@/lib/tocco-bersaglio";

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

function useAttivita() {
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

  return { loading, collegato, attivita, aggAt, ramoVault, carica };
}

function Intestazione({ titolo, icon, ramoVault, collegato, aggAt, loading, onRefresh }: {
  titolo: string; icon: React.ReactNode; ramoVault: string | null; collegato: boolean; aggAt: number | null; loading: boolean; onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
        {icon}
      </span>
      <span className="text-[15px] font-semibold tracking-tight">{titolo}</span>
      {ramoVault && collegato && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand border border-brand/15">
          ramo {ramoVault}
        </span>
      )}
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

export function SezioneBriefing() {
  const { loading, collegato, attivita, aggAt, ramoVault, carica } = useAttivita();

  return (
    <section className="card p-4">
      <Intestazione titolo="Ultimo briefing" icon={<ListChecks size={16} />} ramoVault={ramoVault} collegato={collegato} aggAt={aggAt} loading={loading} onRefresh={() => carica()} />
      {loading && !attivita ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico…
        </div>
      ) : !collegato ? (
        <div className="text-center text-black/50 py-8 text-sm max-w-lg mx-auto">
          <p className="mb-2 font-medium text-ink/80">Vault non raggiungibile.</p>
          <p className="text-xs text-black/45">Il briefing compare appena il giro salva su GitHub.</p>
        </div>
      ) : attivita?.briefing ? (
        <div>
          <p className="t-eti mb-2">{dataVault(attivita.briefing.data || attivita.briefing.nome)}</p>
          <div className={classeListaScorrevole("max-h-[28rem] overflow-y-auto pr-1 rounded-xl border border-black/[0.07] bg-paper/30 p-3.5")}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{attivita.briefing.testo}</ReactMarkdown>
          </div>
          <ParlaCasella idCasella="briefing-ultimo" titolo="Ultimo briefing" contesto={(attivita.briefing.testo || "").slice(0, 800)} />
        </div>
      ) : (
        <p className="text-sm text-black/45 py-4 text-center">Nessun briefing ancora.</p>
      )}
    </section>
  );
}

export function SezioneSalaOperativa() {
  const { loading, collegato, attivita, aggAt, ramoVault, carica } = useAttivita();

  return (
    <section className="card p-4">
      <Intestazione titolo="Sala Operativa" icon={<Radio size={16} />} ramoVault={ramoVault} collegato={collegato} aggAt={aggAt} loading={loading} onRefresh={() => carica()} />
      {loading && !attivita ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico…
        </div>
      ) : !collegato ? (
        <div className="text-center text-black/50 py-8 text-sm max-w-lg mx-auto">
          <p className="mb-2 font-medium text-ink/80">Vault non raggiungibile.</p>
          <p className="text-xs text-black/45">La sala operativa compare appena il giro salva su GitHub.</p>
        </div>
      ) : attivita?.salaOperativa ? (
        <div>
          <div className={classeListaScorrevole("max-h-[28rem] overflow-y-auto pr-1 rounded-xl border border-black/[0.07] bg-paper/30 p-3.5")}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={Markdown}>{attivita.salaOperativa}</ReactMarkdown>
          </div>
          <ParlaCasella idCasella="sala-operativa" titolo="Sala Operativa" contesto={(attivita.salaOperativa || "").slice(0, 800)} />
        </div>
      ) : (
        <p className="text-sm text-black/45 py-4 text-center">Nessuna sala operativa ancora.</p>
      )}
    </section>
  );
}
