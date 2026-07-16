"use client";

import { useCallback, useEffect, useState } from "react";
import { Pin, ChevronDown } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { dataVault } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";

// 📌 Bacheca in home: le informazioni da sapere, appuntate dall'AD nel vault
// (90-Memoria-AI/BACHECA.md, servite da /api/bacheca). Ogni avviso è una riga
// compatta (titolo + data) che si apre sul contenuto completo. Se il file non
// c'è o è vuoto, la sezione non compare.

type Avviso = { titolo: string; data: string; testo: string };

const MD: Components = {
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand underline break-words">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: "var(--bg-surface-2)" }}>{children}</thead>,
  th: ({ children }) => (
    <th className="px-2 py-1 text-left font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1 align-top" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
      {children}
    </td>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 my-1 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1 space-y-0.5">{children}</ol>,
  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
};

export default function Bacheca() {
  const [avvisi, setAvvisi] = useState<Avviso[]>([]);

  const carica = useCallback(() => {
    fetch("/api/bacheca", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAvvisi(Array.isArray(d?.avvisi) ? d.avvisi : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    carica();
  }, [carica]);
  usePanelSync(["memoria", "all"], carica);

  if (avvisi.length === 0) return null;

  return (
    <section className="card p-3">
      <div className="sez-head mb-2">
        <span className="sez-ico w-7 h-7">
          <Pin size={15} />
        </span>
        <span className="t-sez text-[15px]">Bacheca — da sapere</span>
        <span className="badge badge-on ml-auto">{avvisi.length}</span>
      </div>
      <div className="space-y-1.5">
        {avvisi.map((a) => (
          <details key={`${a.data}|${a.titolo}`} className="rounded-xl border border-black/[0.07] bg-paper/30 group">
            <summary className="flex items-start gap-2 px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                  {a.titolo}
                </span>
                <span className="block t-eti text-[10.5px] mt-0.5">appuntato il {dataVault(a.data)}</span>
              </div>
              <ChevronDown size={15} className="mt-1 shrink-0 text-black/35 transition group-open:rotate-180" />
            </summary>
            <div className="px-3 pb-3 pt-1 border-t border-black/[0.05]">
              <div className="md-chat text-[13px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
                  {a.testo}
                </ReactMarkdown>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
