"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, Loader2, RefreshCw, Search } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { usePanelSync } from "@/lib/panel-sync";
import Aggiornato from "@/components/Aggiornato";
import ParlaCasella from "@/components/ParlaCasella";
import { dataVault } from "@/lib/format";

type Esito = { data: string; testo: string };
type Quaderno = {
  senior: string;
  reparto: string;
  ultimoEsito: Esito | null;
  totaleEsiti: number;
  esiti: Esito[];
  testo?: string;
};

const md: Components = {
  h1: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h4 className="text-[13px] font-semibold mt-3 mb-1">{children}</h4>,
  h3: ({ children }) => <h5 className="text-[13px] font-semibold mt-2 mb-1">{children}</h5>,
  p: ({ children }) => <p className="text-[13px] leading-relaxed text-ink/85 my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ul>,
  li: ({ children }) => <li className="text-ink/85">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2 break-all">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="text-[12px] bg-black/[0.05] rounded px-1 py-0.5">{children}</code>,
};

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={md}>
      {children}
    </ReactMarkdown>
  );
}

function estraiUrl(testo: string): string | null {
  const m = testo.match(/https?:\/\/[^\s·]+/);
  return m?.[0] || null;
}

export default function QuaderniSenior() {
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);
  const [ramo, setRamo] = useState<string | null>(null);
  const [quaderni, setQuaderni] = useState<Quaderno[]>([]);
  const [aperto, setAperto] = useState<string | null>(null);
  const [dettaglio, setDettaglio] = useState<Quaderno | null>(null);
  const [caricaDett, setCaricaDett] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [aggAt, setAggAt] = useState<number | null>(null);

  const carica = useCallback(async (silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    try {
      const r = await fetch("/api/memoria/quaderni", { cache: "no-store" });
      const d = await r.json();
      setQuaderni(d.quaderni || []);
      setCollegato(Boolean(d.collegato));
      setRamo(d.ramo || null);
      setAggAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(() => carica(true), 120000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["memoria", "radiografia", "azioni", "all"], () => carica(true));

  const apriQuaderno = async (senior: string) => {
    if (aperto === senior) {
      setAperto(null);
      setDettaglio(null);
      return;
    }
    setAperto(senior);
    setCaricaDett(true);
    try {
      const r = await fetch(`/api/memoria/quaderni?senior=${encodeURIComponent(senior)}`, { cache: "no-store" });
      const d = await r.json();
      setDettaglio(d.quaderno || null);
    } finally {
      setCaricaDett(false);
    }
  };

  const visibili = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return quaderni;
    return quaderni.filter(
      (x) =>
        x.senior.toLowerCase().includes(q) ||
        x.reparto.toLowerCase().includes(q) ||
        (x.ultimoEsito?.testo || "").toLowerCase().includes(q),
    );
  }, [quaderni, filtro]);

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <BookOpen size={16} />
        </span>
        <div className="min-w-0">
          <span className="text-[15px] font-semibold tracking-tight">Quaderni senior</span>
          <p className="t-eti mt-0.5">Cosa ha imparato ogni reparto dal web e dal lavoro — 1 riga ESITO per senior.</p>
        </div>
        {ramo && collegato && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand border border-brand/15">
            ramo {ramo}
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

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Cerca senior, reparto o lezione…"
          className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-black/[0.08] bg-paper/40 focus:outline-none focus:border-brand/40"
        />
      </div>

      {loading && quaderni.length === 0 ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico i quaderni…
        </div>
      ) : !collegato && quaderni.length === 0 ? (
        <div className="text-center text-black/50 py-8 text-sm max-w-lg mx-auto">
          <p className="mb-2 font-medium text-ink/80">Quaderni non raggiungibili.</p>
          <p className="text-xs text-black/45 leading-relaxed">
            I file stanno in <code className="bg-black/[0.05] px-1 rounded">memoria-squadra/</code> sul ramo{" "}
            <b>unico main</b> (come il vault). Servono le variabili <code className="bg-black/[0.05] px-1 rounded">OBSIDIAN_*</code>{" "}
            su Vercel — stesse del resto della memoria.
          </p>
        </div>
      ) : visibili.length === 0 ? (
        <p className="text-sm text-black/45 py-6 text-center">Nessun quaderno corrisponde alla ricerca.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-black/45 mb-1">
            {visibili.length} senior · clicca per aprire tutti gli ESITO
          </p>
          {visibili.map((q) => {
            const esp = aperto === q.senior;
            const url = q.ultimoEsito ? estraiUrl(q.ultimoEsito.testo) : null;
            return (
              <div key={q.senior} className="rounded-xl border border-black/[0.07] bg-paper/30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => apriQuaderno(q.senior)}
                  className="w-full text-left p-3.5 hover:bg-brand-50/30 transition flex gap-3 items-start"
                >
                  <ChevronDown
                    size={16}
                    className={`shrink-0 mt-0.5 text-black/40 transition ${esp ? "rotate-180" : ""}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-ink/90">@{q.reparto}</span>
                      <span className="text-[11px] text-black/40">{q.totaleEsiti} ESITO</span>
                      {q.ultimoEsito && (
                        <span className="text-[11px] font-mono text-black/45 ml-auto">{dataVault(q.ultimoEsito.data)}</span>
                      )}
                    </div>
                    {q.ultimoEsito ? (
                      <p className="text-[12.5px] text-ink/80 leading-relaxed line-clamp-2">{q.ultimoEsito.testo}</p>
                    ) : (
                      <p className="text-[12px] text-black/40 italic">Nessun ESITO ancora.</p>
                    )}
                    {url && !esp && (
                      <p className="text-[11px] text-brand mt-1 truncate">{url}</p>
                    )}
                  </div>
                </button>

                {esp && (
                  <div className="border-t border-black/[0.06] px-3.5 pb-3.5 pt-2 bg-paper/20">
                    {caricaDett ? (
                      <div className="flex items-center gap-2 text-sm text-black/45 py-4 justify-center">
                        <Loader2 size={14} className="animate-spin" /> Apro il quaderno…
                      </div>
                    ) : dettaglio ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {dettaglio.esiti.map((e, i) => (
                            <div key={i} className="rounded-lg border border-black/[0.06] surface-muted p-2.5">
                              <div className="text-[11px] font-mono t-eti mb-1">{dataVault(e.data)}</div>
                              <p className="text-[12.5px] text-ink/85 leading-relaxed">{e.testo}</p>
                            </div>
                          ))}
                        </div>
                        {dettaglio.testo && (
                          <details className="rounded-lg border border-black/[0.06] p-2.5">
                            <summary className="text-[12px] font-medium cursor-pointer text-black/55">Markdown completo</summary>
                            <div className="mt-2 max-h-64 overflow-y-auto pr-1">
                              <Markdown>{dettaglio.testo}</Markdown>
                            </div>
                          </details>
                        )}
                        <ParlaCasella
                          titolo={`Quaderno @${q.reparto}`}
                          contesto={dettaglio.esiti
                            .slice(0, 3)
                            .map((e) => `${e.data}: ${e.testo}`)
                            .join(" · ")}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-black/45 py-2">Quaderno non trovato.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
