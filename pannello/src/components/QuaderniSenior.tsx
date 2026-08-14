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
import { cosaMostrare } from "@/lib/casella-ricarica";
import { classeCampo, classeComando, classeComandoSommario, classeListaScorrevole } from "@/lib/tocco-bersaglio";

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
  // AR-263 — il terzo stato che non esisteva: caricamento / dato / ERRORE. Senza, una lettura
  // fallita restava `null` e `null` a video è «niente»: identico a «questo senior non ha scritto
  // nulla». Sono due notizie opposte e Nicola non aveva modo di distinguerle.
  const [errElenco, setErrElenco] = useState<string | null>(null);
  const [errDettaglio, setErrDettaglio] = useState<string | null>(null);

  const carica = useCallback(async (silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    try {
      const r = await fetch("/api/memoria/quaderni", { cache: "no-store" });
      // `res.ok` va guardato: una 500 arriva col suo corpo e non fa scattare nessun catch.
      if (!r.ok) throw new Error(`il server ha risposto ${r.status}`);
      const d = await r.json();
      setQuaderni(d.quaderni || []);
      setCollegato(Boolean(d.collegato));
      setRamo(d.ramo || null);
      setAggAt(Date.now());
      setErrElenco(null);
    } catch (e: any) {
      setErrElenco(e?.message || "rete non disponibile");
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
    setErrDettaglio(null);
    try {
      const r = await fetch(`/api/memoria/quaderni?senior=${encodeURIComponent(senior)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`il server ha risposto ${r.status}`);
      const d = await r.json();
      setDettaglio(d.quaderno || null);
    } catch (e: any) {
      // AR-263: prima qui non c'era nessun catch — la rotellina si spegneva, `dettaglio` restava
      // `null` e il riquadro si apriva vuoto, senza che nessuno sapesse che era saltata la rete.
      setDettaglio(null);
      setErrDettaglio(e?.message || "rete non disponibile");
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

  // La decisione «cosa si vede adesso» sta nel modulo condiviso, non qui: elenco e dettaglio la
  // fanno con la stessa funzione, quindi non possono più divergere.
  const vistaElenco = cosaMostrare({
    caricando: loading && quaderni.length === 0,
    letto: errElenco == null,
    vuoto: visibili.length === 0,
    motivo: errElenco,
    testoVuoto: filtro.trim() ? "Nessun quaderno corrisponde alla ricerca." : "Nessun quaderno ancora.",
  });
  const vistaDettaglio = cosaMostrare({
    caricando: caricaDett,
    letto: errDettaglio == null,
    vuoto: dettaglio == null,
    motivo: errDettaglio,
    testoVuoto: "Quaderno non trovato.",
  });

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
          className={classeComando("inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50")}
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
          // AR-220 — 16px sul telefono: sotto, iOS Safari ingrandisce la pagina appena tocchi il campo.
          className={classeCampo("w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-black/[0.08] bg-paper/40 focus:outline-none focus:border-brand/40")}
        />
      </div>

      {vistaElenco.stato === "carico" ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico i quaderni…
        </div>
      ) : vistaElenco.stato === "non-letto" ? (
        <div className="text-center py-8 text-sm max-w-lg mx-auto">
          <p className="text-[13px] font-medium text-amber-700">{vistaElenco.messaggio}</p>
          <p className="t-eti mt-1">I quaderni possono esserci tutti: quello che manca è la lettura, non il dato.</p>
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
        <p className="text-sm text-black/45 py-6 text-center">{vistaElenco.messaggio}</p>
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
                    {vistaDettaglio.stato === "carico" ? (
                      <div className="flex items-center gap-2 text-sm text-black/45 py-4 justify-center">
                        <Loader2 size={14} className="animate-spin" /> Apro il quaderno…
                      </div>
                    ) : vistaDettaglio.stato === "non-letto" ? (
                      // AR-263 — qui prima si vedeva il riquadro vuoto: adesso si vede il motivo.
                      <div className="py-3">
                        <p className="text-[13px] font-medium text-amber-700">{vistaDettaglio.messaggio}</p>
                        <button
                          type="button"
                          onClick={() => { setAperto(null); void apriQuaderno(q.senior); }}
                          className="mt-1 inline-flex items-center gap-1 min-h-[44px] py-2 -my-1 text-[12px] font-medium text-brand hover:underline"
                        >
                          <RefreshCw size={13} /> Riprova
                        </button>
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
                            <summary className={classeComandoSommario("text-[12px] font-medium cursor-pointer text-black/55")}>Markdown completo</summary>
                            <div className={classeListaScorrevole("mt-2 max-h-64 overflow-y-auto pr-1")}>
                              <Markdown>{dettaglio.testo}</Markdown>
                            </div>
                          </details>
                        )}
                        <ParlaCasella
                          idCasella={`quaderno:${q.senior}`}
                          titolo={`Quaderno @${q.reparto}`}
                          contesto={dettaglio.esiti
                            .slice(0, 3)
                            .map((e) => `${e.data}: ${e.testo}`)
                            .join(" · ")}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-black/45 py-2">{vistaDettaglio.messaggio}</p>
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
