"use client";

import { useMemo, useState } from "react";
import { Brain, ChevronDown, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { faRelativo } from "@/lib/format";
import { vaiArea } from "@/lib/nav";
import {
  type LavoroBase,
  leggiMappaGruppiLocali,
  raggruppaLavori,
  titoloLavoro,
} from "@/lib/lavori-gruppo";

const LAVORO_STATO: Record<string, { label: string; cls: string }> = {
  in_attesa: { label: "⏳ In attesa", cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800" },
  in_corso: { label: "⚙️ In corso", cls: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800" },
  fatto: { label: "✅ Fatto", cls: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-800" },
  errore: { label: "⚠️ Errore", cls: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800" },
};

type Props = {
  lavori: LavoroBase[];
  onSvuota: () => void;
  /** Dentro l'area Lavori: senza intestazione esterna duplicata */
  embedded?: boolean;
};

function statoBadge(stato: string) {
  const s = LAVORO_STATO[stato] || { label: stato, cls: "bg-black/5 ring-black/10 text-black/60 dark:bg-white/10 dark:text-white/60" };
  return (
    <span className={`px-2 py-0.5 rounded-full ring-1 font-medium text-xs ${s.cls}`}>{s.label}</span>
  );
}

export default function LavoriCervello({ lavori, onSvuota, embedded = false }: Props) {
  const mappa = useMemo(() => (typeof window !== "undefined" ? leggiMappaGruppiLocali() : {}), [lavori]);
  const [apertiGruppi, setApertiGruppi] = useState<Record<string, boolean>>({});
  const [apertiLavori, setApertiLavori] = useState<Record<string, boolean>>({});

  const gruppi = useMemo(() => raggruppaLavori(lavori, mappa), [lavori, mappa]);

  const cervelloSpento = lavori.some((lv) => {
    if (lv.stato !== "in_attesa") return false;
    const t = new Date(lv.created_at).getTime();
    return !isNaN(t) && Date.now() - t > 3 * 60 * 1000;
  });

  function toggleGruppo(id: string) {
    setApertiGruppi((s) => ({ ...s, [id]: !s[id] }));
  }

  function toggleLavoro(id: string) {
    setApertiLavori((s) => ({ ...s, [id]: !s[id] }));
  }

  const contenuto = (
    <>
      {cervelloSpento && (
        <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-3.5 py-2.5 text-[12.5px] text-red-800 dark:text-red-300 leading-snug">
          <b>⛔ Cervello spento.</b> Il lavoro è in coda da oltre 3 minuti senza partire. Sul VPS:{" "}
          <code className="bg-red-100/80 dark:bg-red-900/40 px-1 rounded text-[11px]">systemctl start mycity-worker</code>
        </div>
      )}

      {gruppi.length === 0 ? (
        <p className="text-sm text-black/40 dark:text-white/40">Nessun lavoro in questa vista.</p>
      ) : (
        <div className="scroll-soft space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {gruppi.map((g) => {
            const gruppoAperto = apertiGruppi[g.id] === true;
            const multi = g.lavori.length > 1;
            const statoUltimo = g.lavori[g.lavori.length - 1]?.stato || "in_attesa";

            return (
              <div
                key={g.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  g.haAttivo ? "border-brand/25 bg-brand-50/20 dark:bg-brand/10" : "border-black/[0.07] dark:border-white/10 bg-white dark:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => toggleGruppo(g.id)}
                  className="flex-1 flex items-start gap-2 p-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition min-w-0"
                >
                  <span className="mt-0.5 text-black/40 dark:text-white/40 shrink-0">
                    {gruppoAperto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {statoBadge(statoUltimo)}
                      {multi && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50">
                          {g.lavori.length} messaggi · stessa chat
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-black/40 dark:text-white/40 shrink-0">{faRelativo(g.ultimoAt)}</span>
                    </div>
                    <div className="text-sm font-medium text-ink/85 dark:text-white/85 line-clamp-2">{g.titolo}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => vaiArea("assistente", g.id, "chat")}
                  className="shrink-0 self-center mr-2.5 inline-flex items-center gap-1 text-[11px] font-medium border border-brand/35 text-brand rounded-lg px-2.5 py-1.5 hover:bg-brand-50/60 dark:hover:bg-brand/10 transition"
                  title="Riprendi questa conversazione nella chat"
                >
                  <MessageSquare size={12} />
                  Chat
                </button>
                </div>

                {gruppoAperto && (
                  <div className="border-t border-black/[0.06] dark:border-white/10 px-3 pb-3 space-y-2">
                    {g.lavori.map((lv, i) => {
                      const lavoroAperto = apertiLavori[lv.id] === true;
                      return (
                        <div
                          key={lv.id}
                          className="border border-black/[0.06] dark:border-white/10 rounded-lg overflow-hidden bg-paper/40 dark:bg-black/20"
                        >
                          <button
                            type="button"
                            onClick={() => toggleLavoro(lv.id)}
                            className="w-full flex items-start gap-2 p-3 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"
                          >
                            <span className="mt-0.5 text-black/35 dark:text-white/35 shrink-0">
                              {lavoroAperto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                {multi && <span className="text-[10px] text-black/35 dark:text-white/35 font-medium">#{i + 1}</span>}
                                {statoBadge(lv.stato)}
                                <span className="ml-auto text-[10px] text-black/35 dark:text-white/35">{faRelativo(lv.updated_at || lv.created_at)}</span>
                              </div>
                              <div className="text-[13px] font-medium text-ink/80 dark:text-white/80 line-clamp-2">{titoloLavoro(lv)}</div>
                            </div>
                          </button>

                          {lavoroAperto && (
                            <div className="border-t border-black/[0.05] dark:border-white/10 px-3 pb-3 pt-2 space-y-2">
                              <div className="text-[13px] text-ink/80 dark:text-white/80 whitespace-pre-wrap break-words">
                                <span className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40 block mb-1">Richiesta</span>
                                {lv.richiesta}
                              </div>
                              {lv.risultato && (
                                <div className="text-ink/85 dark:text-white/85 border-t border-black/[0.06] dark:border-white/10 pt-2 text-[13px] prose-sm dark:prose-invert max-w-none">
                                  <span className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40 block mb-1 not-prose">Risposta</span>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{lv.risultato}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="card p-4">{contenuto}</div>;
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="sez-ico">
            <Brain size={16} />
          </span>
          <span className="t-sez">Lavori del cervello (Max)</span>
        </div>
        {lavori.length > 0 && (
          <button
            onClick={onSvuota}
            className="text-xs text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 inline-flex items-center gap-1 transition"
          >
            <Trash2 size={12} /> Svuota
          </button>
        )}
      </div>
      <p className="t-eti mb-3">
        Ogni conversazione è un contenitore: i messaggi della stessa chat restano insieme. Apri o chiudi ogni finestra.
      </p>
      {contenuto}
    </section>
  );
}
