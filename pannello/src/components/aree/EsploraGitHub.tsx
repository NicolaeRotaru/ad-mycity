"use client";

// 🗂️ Esplora GitHub — browser in SOLA LETTURA su tutto l'albero del repo (ramo unico main).
// Perché esiste: il Pannello mostrava solo un set fisso di file cablati a mano; tutto il resto
// presente su GitHub (consegne/audit, design, intelligence, RADIOGRAFIA-MACCHINA.md…) restava
// invisibile. Qui ogni file del repo è raggiungibile, senza dover aggiungere una route per ognuno.

import { useCallback, useEffect, useState } from "react";
import { Folder, FileText, ChevronRight, ArrowUp, RefreshCw, FolderTree } from "lucide-react";

type Voce = { name: string; type: "file" | "dir"; size?: number; path: string };
type Risp =
  | { tipo: "dir"; path: string; voci: Voce[] }
  | { tipo: "file"; path: string; contenuto: string; troppoLungo: boolean }
  | { tipo: "errore"; errore: string };

function pesa(n?: number): string {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function EsploraGitHub() {
  const [path, setPath] = useState<string>("");
  const [dato, setDato] = useState<Risp | null>(null);
  const [caricando, setCaricando] = useState(false);

  const carica = useCallback(async (p: string) => {
    setCaricando(true);
    try {
      const r = await fetch(`/api/repo/esplora?path=${encodeURIComponent(p)}`, { cache: "no-store" });
      setDato((await r.json()) as Risp);
    } catch {
      setDato({ tipo: "errore", errore: "rete non disponibile" });
    } finally {
      setCaricando(false);
    }
  }, []);

  useEffect(() => {
    void carica(path);
  }, [path, carica]);

  const segmenti = path ? path.split("/") : [];
  const vaiSu = () => setPath(segmenti.slice(0, -1).join("/"));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FolderTree size={18} /> Esplora GitHub
        </h2>
        <p className="text-sm text-black/50 dark:text-white/50">
          Tutto il repo, in sola lettura, dal ramo che alimenta il Pannello (main). Nulla resta nascosto.
        </p>
      </div>

      {/* Breadcrumb + azioni */}
      <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
        <button onClick={() => setPath("")} className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10">
          radice
        </button>
        {segmenti.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="opacity-40" />
            <button
              onClick={() => setPath(segmenti.slice(0, i + 1).join("/"))}
              className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10"
            >
              {s}
            </button>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          {path && (
            <button onClick={vaiSu} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10">
              <ArrowUp size={12} /> su
            </button>
          )}
          <button onClick={() => carica(path)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10">
            <RefreshCw size={12} className={caricando ? "animate-spin" : ""} /> aggiorna
          </button>
        </span>
      </div>

      {caricando && !dato && <p className="text-sm text-black/40">Carico…</p>}

      {dato?.tipo === "errore" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 p-3 text-sm">
          {dato.errore}
        </div>
      )}

      {dato?.tipo === "dir" && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
          {dato.voci.length === 0 && <div className="p-3 text-sm text-black/40">Cartella vuota.</div>}
          {dato.voci.map((v) => (
            <button
              key={v.path}
              onClick={() => setPath(v.path)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13.5px] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            >
              {v.type === "dir" ? <Folder size={15} className="text-brand shrink-0" /> : <FileText size={15} className="text-black/40 shrink-0" />}
              <span className={v.type === "dir" ? "font-medium" : ""}>{v.name}</span>
              {v.type === "file" && <span className="ml-auto text-[11px] text-black/35">{pesa(v.size)}</span>}
            </button>
          ))}
        </div>
      )}

      {dato?.tipo === "file" && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
          <div className="px-3 py-2 text-[12px] text-black/50 bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/5 flex items-center gap-2">
            <FileText size={13} /> {dato.path}
            {dato.troppoLungo && <span className="ml-auto text-amber-600">file lungo — mostro l'inizio</span>}
          </div>
          <pre className="p-3 text-[12px] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto max-h-[70vh] overflow-y-auto">
            {dato.contenuto}
          </pre>
        </div>
      )}
    </div>
  );
}
