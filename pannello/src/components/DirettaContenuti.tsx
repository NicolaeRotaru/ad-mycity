"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Radio, Loader2, RefreshCw, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { usePanelRefresh } from "@/lib/panel-sync";
import { faRelativo } from "@/lib/format";

// 📡 DIRETTA CONTENUTI — guarda in tempo reale ciò che il worker sforna: post, bozze,
// dossier, audit, piani (consegne/*) + briefing/report/intelligence del vault, in un unico
// flusso ordinato al minuto. Si aggiorna da solo (poll 30s + eventi di sync quando un lavoro
// finisce) e mette in evidenza le NOVITÀ apparse da quando l'hai guardato l'ultima volta.

type Contenuto = {
  path: string;
  categoria: string;
  emoji: string;
  etichetta: string;
  reparto: string;
  titolo: string;
  estratto: string;
  colore: string;
  tipo: string;
  quando: string;
  quandoIso: string;
  vuoto: boolean;
};

const MD: Components = {
  h1: ({ children }) => <h1 className="text-[18px] font-bold tracking-tight mt-3 mb-2" style={{ color: "var(--text-primary)" }}>{children}</h1>,
  h2: ({ children }) => <h2 className="text-[15px] font-bold tracking-tight mt-3 mb-1.5 pt-1" style={{ color: "var(--text-primary)" }}>{children}</h2>,
  h3: ({ children }) => <h3 className="text-[13.5px] font-semibold mt-2.5 mb-1" style={{ color: "var(--text-primary)" }}>{children}</h3>,
  p: ({ children }) => <p className="my-1.5 leading-relaxed text-[13px]" style={{ color: "var(--text-secondary)" }}>{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>{children}</strong>,
  a: ({ children, href }) => <a href={href} className="text-brand underline underline-offset-2">{children}</a>,
  code: ({ children }) => <code className="text-[12px] px-1 py-0.5 rounded" style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)" }}>{children}</code>,
  pre: ({ children }) => <pre className="rounded-lg p-3 overflow-x-auto text-xs my-2" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}>{children}</blockquote>,
  hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
  table: ({ children }) => <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse">{children}</table></div>,
  th: ({ children }) => <th className="px-2 py-1 text-left font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>{children}</th>,
  td: ({ children }) => <td className="px-2 py-1 align-top" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{children}</td>,
};

const CHIAVE_VISTO = "mycity_contenuti_visto"; // ISO dell'ultima volta che Nicola ha guardato la diretta

export default function DirettaContenuti() {
  const [contenuti, setContenuti] = useState<Contenuto[]>([]);
  const [caricato, setCaricato] = useState(false);
  const [fonte, setFonte] = useState<string>("");
  const [aggAt, setAggAt] = useState<number | null>(null);
  // Riferimento "ultima volta vista": fissato al montaggio, così le novità restano evidenziate
  // per tutta la sessione finché non premi "Segna come letti".
  const [vistoAt, setVistoAt] = useState<string>(() => {
    if (typeof window === "undefined") return new Date().toISOString();
    return localStorage.getItem(CHIAVE_VISTO) || "1970-01-01T00:00:00Z";
  });
  const [aperto, setAperto] = useState<string | null>(null);
  const [dettaglio, setDettaglio] = useState<Record<string, string>>({});
  const [caricaDett, setCaricaDett] = useState<string | null>(null);
  const primaVolta = useRef(true);

  const carica = useCallback(async () => {
    try {
      const r = await fetch("/api/contenuti", { cache: "no-store" });
      const d = await r.json();
      setContenuti(Array.isArray(d.contenuti) ? d.contenuti : []);
      setFonte(d.fonte || "");
      setAggAt(Date.now());
    } catch {
      /* rete giù: tengo l'ultimo elenco */
    } finally {
      setCaricato(true);
    }
  }, []);

  // Live: poll ogni 30s + refresh immediato quando un lavoro del worker finisce (eventi di sync).
  usePanelRefresh(["lavori", "memoria", "all"], carica, 30000);
  useEffect(() => { void carica(); }, [carica]);

  // Al primo caricamento fissa il riferimento "visto" al più recente GIÀ presente:
  // così i contenuti apparsi PRIMA non lampeggiano tutti come "nuovi", ma quelli che
  // arrivano DOPO (mentre guardi) sì.
  useEffect(() => {
    if (!caricato || !primaVolta.current) return;
    primaVolta.current = false;
    const salvato = typeof window !== "undefined" ? localStorage.getItem(CHIAVE_VISTO) : null;
    if (!salvato) {
      const piuRecente = contenuti.map((c) => c.quandoIso).filter(Boolean).sort().slice(-1)[0] || new Date().toISOString();
      setVistoAt(piuRecente);
    }
  }, [caricato, contenuti]);

  const nuoviCount = useMemo(() => {
    const soglia = Date.parse(vistoAt) || 0;
    return contenuti.filter((c) => (Date.parse(c.quandoIso) || 0) > soglia).length;
  }, [contenuti, vistoAt]);

  function segnaLetti() {
    const ora = new Date().toISOString();
    setVistoAt(ora);
    try { localStorage.setItem(CHIAVE_VISTO, ora); } catch {}
  }

  async function apri(path: string) {
    if (aperto === path) { setAperto(null); return; }
    setAperto(path);
    if (dettaglio[path]) return;
    setCaricaDett(path);
    try {
      const r = await fetch(`/api/contenuti?file=${encodeURIComponent(path)}`, { cache: "no-store" });
      const d = await r.json();
      setDettaglio((m) => ({ ...m, [path]: d.contenuto || `_${d.errore || "Contenuto non disponibile."}_` }));
    } catch {
      setDettaglio((m) => ({ ...m, [path]: "_Non sono riuscito a leggere il contenuto._" }));
    } finally {
      setCaricaDett(null);
    }
  }

  const soglia = Date.parse(vistoAt) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">📡 Diretta contenuti</h2>
          <p className="t-eti mt-0.5">
            Ciò che il worker sta creando, in tempo reale: post, bozze, dossier, audit e piani man mano che escono. Si aggiorna da solo — clicca una scheda per leggerla tutta.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {nuoviCount > 0 && (
            <button
              type="button"
              onClick={segnaLetti}
              className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-1"
              title="Azzera l'evidenza delle novità"
            >
              Segna come letti
            </button>
          )}
          <button
            type="button"
            onClick={() => void carica()}
            className="text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition"
            title="Aggiorna adesso"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Barra di stato: diretta viva + conteggio novità */}
      <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400/90 dark:ring-emerald-900/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          In diretta
        </span>
        {nuoviCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand ring-1 ring-brand/20 font-medium">
            <Sparkles size={12} /> {nuoviCount} {nuoviCount === 1 ? "nuovo" : "nuovi"} da quando guardavi
          </span>
        ) : (
          caricato && <span className="text-black/40 dark:text-white/40">Nessuna novità da quando guardavi.</span>
        )}
        {aggAt && <span className="text-black/35 dark:text-white/35 ml-auto">aggiornato {faRelativo(new Date(aggAt).toISOString())}</span>}
      </div>

      {!caricato ? (
        <div className="card p-6 flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
          <Loader2 size={16} className="animate-spin" /> Carico i contenuti…
        </div>
      ) : contenuti.length === 0 ? (
        <div className="card p-6 text-sm text-black/50 dark:text-white/50">
          Ancora nessun contenuto prodotto. Appena il worker crea un post, un dossier o un briefing, compare qui in diretta.
        </div>
      ) : (
        <ul className="space-y-2">
          {contenuti.map((c) => {
            const nuovo = (Date.parse(c.quandoIso) || 0) > soglia;
            const isOpen = aperto === c.path;
            return (
              <li
                key={c.path}
                className={`card overflow-hidden transition ${nuovo ? "ring-1 ring-brand/30" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => void apri(c.path)}
                  className="w-full text-left px-3.5 py-3 flex items-start gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition"
                >
                  <span className="text-lg leading-none mt-0.5 shrink-0" aria-hidden>{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.colore && <span className="text-[13px] leading-none" title="Livello dell'azione">{c.colore}</span>}
                      <span className="font-semibold text-[13.5px] truncate" style={{ color: "var(--text-primary)" }}>
                        {c.titolo}
                      </span>
                      {nuovo && (
                        <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand text-white shrink-0">
                          nuovo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[11px] text-black/45 dark:text-white/45">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 font-medium">{c.etichetta}</span>
                      {c.reparto && <span>· {c.reparto}</span>}
                      <span>· {c.quando ? faRelativo(c.quando) : "senza data"}</span>
                    </div>
                    {c.estratto && !isOpen && (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {c.estratto}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 mt-0.5 text-black/30 dark:text-white/30">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    {caricaDett === c.path && !dettaglio[c.path] ? (
                      <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50 py-3">
                        <Loader2 size={14} className="animate-spin" /> Apro il contenuto…
                      </div>
                    ) : (
                      <div className="pt-2 max-h-[60vh] overflow-y-auto scroll-soft pr-1">
                        <ReactMarkdown components={MD} remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {dettaglio[c.path] || ""}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="mt-2 text-[10.5px] text-black/35 dark:text-white/35 font-mono truncate">{c.path}</div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {caricato && contenuti.length > 0 && (
        <p className="t-eti text-center">
          Diretta dei {contenuti.length} contenuti più recenti{fonte === "github" ? " · da GitHub (main)" : fonte === "disco" ? " · da disco" : ""}.
        </p>
      )}
    </div>
  );
}
