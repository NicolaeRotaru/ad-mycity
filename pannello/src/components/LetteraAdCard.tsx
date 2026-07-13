"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { dataVault } from "@/lib/format";

/** Anteprima lettera AD in home (3–5 righe + «Leggi tutta»). */
export default function LetteraAdCard() {
  const [lettera, setLettera] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [aperta, setAperta] = useState(false);

  useEffect(() => {
    fetch("/api/memoria/auto-radiografia", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.lettera) setLettera(String(d.lettera));
        const dt = d?.radiografia?.data || d?.live?.data_scan;
        if (dt) setData(String(dt).slice(0, 10));
      })
      .catch(() => {});
  }, []);

  if (!lettera) {
    return (
      <section className="card p-4">
        <div className="sez-head mb-2">
          <span className="sez-ico"><Mail size={16} /></span>
          <span className="t-sez">Lettera dell&apos;AD</span>
        </div>
        <p className="t-eti">La prossima lettera compare dopo la review settimanale della macchina.</p>
      </section>
    );
  }

  const righe = lettera.split(/\n+/).filter(Boolean);
  const anteprima = righe.slice(0, 4).join(" ").slice(0, 320);
  const troncata = anteprima.length < lettera.replace(/\s+/g, " ").length;

  return (
    <>
      <section className="card p-4">
        <div className="sez-head mb-2">
          <span className="sez-ico"><Mail size={16} /></span>
          <span className="t-sez">Lettera dell&apos;AD</span>
          {data && <span className="ml-auto t-eti">{dataVault(data)}</span>}
        </div>
        <p className="t-corpo font-medium leading-relaxed line-clamp-4">{anteprima}{troncata ? "…" : ""}</p>
        <button
          type="button"
          onClick={() => setAperta(true)}
          className="mt-2 text-[13px] font-medium text-brand hover:underline"
        >
          Leggi tutta →
        </button>
      </section>

      {aperta && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label="Lettera completa dell'AD">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-black/10">
              <Mail size={18} className="text-brand shrink-0" />
              <span className="t-sez flex-1">Lettera dell&apos;AD</span>
              {data && <span className="t-eti">{dataVault(data)}</span>}
              <button type="button" onClick={() => setAperta(false)} className="p-1 rounded-lg hover:bg-black/5" aria-label="Chiudi">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lettera}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
