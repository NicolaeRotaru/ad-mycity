"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FileText, Search, ArrowLeft, FolderOpen, Clock, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { EVENTO_VAI, EVENTO_SUB } from "@/lib/nav";
import { usePanelSync } from "@/lib/panel-sync";

// 📄 Archivio: navigatore ad albero per tutto ciò che l'AD produce in consegne/
// Livello 1 → cartelle (strategia, marketing, audit…)
// Livello 2 → file dentro la cartella
// Livello 3 → lettore markdown del documento

type Doc = { file: string; nome: string; titolo: string; data: string | null; categoria?: string; etichetta?: string };
type Gruppo = { categoria: string; etichetta: string; documenti: Doc[] };

let pendingReportFile: string | null = null;
if (typeof window !== "undefined") {
  const capture = (e: Event) => {
    const det = (e as CustomEvent).detail as { vista?: string; sub?: string } | undefined;
    if (!det?.sub) return;
    if (det.vista === "report") pendingReportFile = det.sub;
    if (det.vista === "memoria" && det.sub.startsWith("archivio/")) pendingReportFile = det.sub.slice("archivio/".length);
  };
  window.addEventListener(EVENTO_VAI, capture);
  window.addEventListener(EVENTO_SUB, capture);
}

const MD: Components = {
  h1: ({ children }) => <h1 className="text-[19px] font-bold tracking-tight mt-4 mb-2" style={{ color: "var(--text-primary)" }}>{children}</h1>,
  h2: ({ children }) => <h2 className="text-[16px] font-bold tracking-tight mt-4 mb-1.5 pt-1" style={{ color: "var(--text-primary)" }}>{children}</h2>,
  h3: ({ children }) => <h3 className="text-[14px] font-semibold mt-3 mb-1" style={{ color: "var(--text-primary)" }}>{children}</h3>,
  p: ({ children }) => <p className="my-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-0.5" style={{ color: "var(--text-secondary)" }}>{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-0.5" style={{ color: "var(--text-secondary)" }}>{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>{children}</strong>,
  a: ({ children, href }) => <a href={href} className="text-brand underline underline-offset-2">{children}</a>,
  code: ({ children }) => <code className="text-[12px] px-1 py-0.5 rounded" style={{ background: "var(--bg-surface-2)", color: "var(--text-primary)" }}>{children}</code>,
  pre: ({ children }) => <pre className="rounded-lg p-3 overflow-x-auto text-xs my-2" style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}>{children}</blockquote>,
  hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
  table: ({ children }) => <div className="overflow-x-auto my-2"><table className="w-full text-xs border-collapse">{children}</table></div>,
  thead: ({ children }) => <thead style={{ background: "var(--bg-surface-2)" }}>{children}</thead>,
  th: ({ children }) => <th className="px-2 py-1 text-left font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>{children}</th>,
  td: ({ children }) => <td className="px-2 py-1 align-top" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{children}</td>,
};

function dataIt(d: string | null): string {
  if (!d) return "";
  const [y, m, g] = d.split("-");
  return `${g}/${m}/${y}`;
}

export default function Documenti({ embedded = false }: { embedded?: boolean }) {
  const [gruppi, setGruppi] = useState<Gruppo[]>([]);
  const [caricaLista, setCaricaLista] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [cartella, setCartella] = useState<string | null>(null);
  const [sel, setSel] = useState<Doc | null>(null);
  const [contenuto, setContenuto] = useState<string>("");
  const [caricaDoc, setCaricaDoc] = useState(false);
  const [errDoc, setErrDoc] = useState<string | null>(null);
  const lettoreRef = useRef<HTMLDivElement>(null);

  const caricaElenco = useCallback(() => {
    setCaricaLista(true);
    fetch("/api/consegne", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setGruppi(d.gruppi || []))
      .catch(() => setGruppi([]))
      .finally(() => setCaricaLista(false));
  }, []);

  useEffect(() => { caricaElenco(); }, [caricaElenco]);
  usePanelSync(["memoria", "azioni", "all"], caricaElenco);

  const apri = useCallback((doc: Doc) => {
    setSel(doc);
    setCaricaDoc(true);
    setErrDoc(null);
    setContenuto("");
    fetch(`/api/consegne?file=${encodeURIComponent(doc.file)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.contenuto != null) setContenuto(d.contenuto);
        else setErrDoc(d.errore || "documento non trovato");
      })
      .catch(() => setErrDoc("errore di caricamento"))
      .finally(() => {
        setCaricaDoc(false);
        setTimeout(() => lettoreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      });
  }, []);

  const apriRef = useRef(apri);
  apriRef.current = apri;
  useEffect(() => {
    const openFromSub = (sub?: string) => {
      if (!sub) return;
      apriRef.current({ file: sub, nome: sub.split("/").pop() || sub, titolo: sub.split("/").pop() || sub, data: null });
    };
    if (pendingReportFile) {
      const f = pendingReportFile;
      pendingReportFile = null;
      openFromSub(f);
    }
    const onVai = (e: Event) => {
      const det = (e as CustomEvent).detail as { vista?: string; sub?: string } | undefined;
      if (det?.vista === "report") openFromSub(det.sub);
      if (det?.vista === "memoria" && det.sub?.startsWith("archivio/")) openFromSub(det.sub.slice("archivio/".length));
    };
    const onSub = (e: Event) => {
      const det = (e as CustomEvent).detail as { vista?: string; sub?: string } | undefined;
      if (det?.vista === "report") openFromSub(det.sub);
      if (det?.vista === "memoria" && det.sub?.startsWith("archivio/")) openFromSub(det.sub.slice("archivio/".length));
    };
    window.addEventListener(EVENTO_VAI, onVai);
    window.addEventListener(EVENTO_SUB, onSub);
    return () => {
      window.removeEventListener(EVENTO_VAI, onVai);
      window.removeEventListener(EVENTO_SUB, onSub);
    };
  }, []);

  const q = filtro.trim().toLowerCase();
  const inRicerca = q.length > 0;
  const totale = gruppi.reduce((n, g) => n + g.documenti.length, 0);
  const cartellaCorrente = cartella != null ? gruppi.find((g) => g.categoria === cartella) ?? null : null;

  const gruppiFiltrati = inRicerca
    ? gruppi
        .map((g) => ({ ...g, documenti: g.documenti.filter((d) => (d.titolo + " " + g.etichetta + " " + d.nome).toLowerCase().includes(q)) }))
        .filter((g) => g.documenti.length)
    : gruppi;

  return (
    <div className="space-y-4">
      {/* Intestazione + breadcrumb + refresh */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {!embedded && <h2 className="t-area">📄 Archivio consegne</h2>}
          {embedded && <p className="t-eti">Tutto ciò che l&apos;AD produce in consegne/ — per cartella e documento.</p>}
          {/* Breadcrumb: consegne / cartella / file */}
          <div className="flex items-center gap-1 t-eti mt-1 flex-wrap">
            <button
              onClick={() => { setCartella(null); setSel(null); setContenuto(""); setFiltro(""); }}
              className="hover:text-brand transition"
            >
              📁 consegne
            </button>
            {cartella != null && !inRicerca && (
              <>
                <span>/</span>
                <button
                  onClick={() => { setSel(null); setContenuto(""); }}
                  className="hover:text-brand transition"
                >
                  📁 {cartella || "radice"}
                </button>
              </>
            )}
            {sel && (
              <>
                <span>/</span>
                <span className="truncate max-w-[160px]">📄 {sel.titolo}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={caricaElenco}
          className="mt-1 shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-black/55 hover:text-brand transition px-2 py-1 rounded-lg hover:bg-brand-50/60"
          title="Ricarica l'elenco"
        >
          <RefreshCw size={13} /> Aggiorna
        </button>
      </div>

      {/* VISTA 1: Lettore documento aperto */}
      {sel ? (
        <div className="space-y-3" ref={lettoreRef}>
          <button
            onClick={() => { setSel(null); setContenuto(""); }}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
          >
            <ArrowLeft size={15} />
            {cartella != null ? (cartellaCorrente?.etichetta ?? cartella) : "Tutti i documenti"}
          </button>
          <section className="card p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="sez-ico"><FileText size={16} /></span>
              <div className="min-w-0">
                <div className="t-sez truncate">{sel.titolo}</div>
                <div className="t-eti flex items-center gap-2">
                  {sel.etichetta && <span>{sel.etichetta}</span>}
                  {sel.data && <span className="inline-flex items-center gap-1"><Clock size={11} /> {dataIt(sel.data)}</span>}
                  <code className="text-[10.5px] text-black/35">consegne/{sel.file}</code>
                </div>
              </div>
            </div>
            {caricaDoc ? (
              <div className="flex items-center gap-2 t-eti py-6 justify-center">
                <Loader2 size={16} className="animate-spin" /> Carico il documento…
              </div>
            ) : errDoc ? (
              <p className="t-eti py-4">⚠️ {errDoc}. Il documento potrebbe non essere ancora pubblicato sul ramo che il Pannello legge.</p>
            ) : (
              <div className="text-[13.5px]">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MD}>{contenuto}</ReactMarkdown>
              </div>
            )}
          </section>
        </div>
      ) : (
        <>
          {/* Barra di ricerca — visibile sempre tranne nel lettore */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={filtro}
              onChange={(e) => { setFiltro(e.target.value); if (e.target.value) setCartella(null); }}
              placeholder={`Cerca tra ${totale} documenti… (es. "piano", "audit")`}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-black/[0.03] border border-black/10 focus:border-brand/40 focus:outline-none"
            />
          </div>

          {caricaLista ? (
            <div className="flex items-center gap-2 t-eti py-8 justify-center">
              <Loader2 size={16} className="animate-spin" /> Carico i documenti…
            </div>
          ) : inRicerca ? (
            /* VISTA 2: Risultati di ricerca — piatti, cross-cartella */
            gruppiFiltrati.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="t-eti">Nessun documento per questa ricerca.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {gruppiFiltrati.map((g) => (
                  <section key={g.categoria || "root"} className="card p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="sez-ico"><FolderOpen size={15} /></span>
                      <span className="t-sez">{g.etichetta}</span>
                      <span className="badge badge-off ml-auto">{g.documenti.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {g.documenti.map((d) => (
                        <button
                          key={d.file}
                          onClick={() => { setCartella(g.categoria); apri({ ...d, etichetta: g.etichetta }); }}
                          className="text-left surface-muted p-3 rounded-xl hover:border-brand/30 border border-transparent transition flex items-start gap-2.5"
                        >
                          <span className="mt-0.5 text-black/40 shrink-0"><FileText size={15} /></span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{d.titolo}</span>
                            {d.data && <span className="block t-eti mt-0.5 flex items-center gap-1"><Clock size={10} /> {dataIt(d.data)}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : cartella != null ? (
            /* VISTA 3: File dentro la cartella selezionata */
            <div className="space-y-3">
              <button
                onClick={() => setCartella(null)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
              >
                <ArrowLeft size={15} /> consegne/
              </button>
              {!cartellaCorrente || cartellaCorrente.documenti.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="t-eti">Nessun documento in questa cartella.</p>
                </div>
              ) : (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                    <span className="sez-ico"><FolderOpen size={15} /></span>
                    <span className="t-sez">{cartellaCorrente.etichetta}</span>
                    <span className="badge badge-off ml-auto">{cartellaCorrente.documenti.length}</span>
                  </div>
                  <div className="space-y-1">
                    {cartellaCorrente.documenti.map((d) => (
                      <button
                        key={d.file}
                        onClick={() => apri({ ...d, etichetta: cartellaCorrente.etichetta })}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-black/[0.04] transition flex items-center gap-2.5"
                      >
                        <span className="text-black/35 shrink-0"><FileText size={14} /></span>
                        <span className="min-w-0 flex-1 text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                          {d.titolo}
                        </span>
                        {d.data && (
                          <span className="shrink-0 t-eti text-[11px] flex items-center gap-1">
                            <Clock size={10} /> {dataIt(d.data)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* VISTA 4: Radice — elenco cartelle (entry point) */
            gruppi.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="t-eti">Nessun documento in consegne/ (o non ancora pubblicato sul ramo che il Pannello legge).</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gruppi.map((g) => (
                  <button
                    key={g.categoria || "root"}
                    onClick={() => setCartella(g.categoria)}
                    className="card p-4 text-left hover:border-brand/40 border border-transparent transition flex items-center gap-3"
                  >
                    <span className="sez-ico shrink-0"><FolderOpen size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {g.etichetta}
                      </span>
                      <span className="t-eti">
                        {g.documenti.length} {g.documenti.length === 1 ? "documento" : "documenti"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
