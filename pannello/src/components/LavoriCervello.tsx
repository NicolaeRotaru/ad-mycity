"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { faRelativo } from "@/lib/format";
import {
  type LavoroBase,
  leggiMappaGruppiLocali,
  raggruppaLavori,
  titoloLavoro,
} from "@/lib/lavori-gruppo";

const LAVORO_STATO: Record<string, { label: string; cls: string }> = {
  in_attesa: { label: "⏳ In attesa", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  in_corso: { label: "⚙️ In corso", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  fatto: { label: "✅ Fatto", cls: "bg-green-50 text-green-700 ring-green-200" },
  errore: { label: "⚠️ Errore", cls: "bg-red-50 text-red-700 ring-red-200" },
};

type Props = {
  lavori: LavoroBase[];
  onSvuota: () => void;
};

function statoBadge(stato: string) {
  const s = LAVORO_STATO[stato] || { label: stato, cls: "bg-black/5 ring-black/10 text-black/60" };
  return (
    <span className={`px-2 py-0.5 rounded-full ring-1 font-medium text-xs ${s.cls}`}>{s.label}</span>
  );
}

export default function LavoriCervello({ lavori, onSvuota }: Props) {
  const [mappa, setMappa] = useState<Record<string, string>>({});
  const [aperti, setAperti] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMappa(leggiMappaGruppiLocali());
  }, [lavori]);

  const gruppi = useMemo(() => raggruppaLavori(lavori, mappa), [lavori, mappa]);

  // Apri automaticamente gruppi con lavoro attivo; chiudi i completati al primo render.
  useEffect(() => {
    setAperti((prev) => {
      const next = { ...prev };
      for (const g of gruppi) {
        if (next[g.id] === undefined) {
          next[g.id] = g.haAttivo || g.lavori.length === 1;
        } else if (g.haAttivo) {
          next[g.id] = true;
        }
      }
      return next;
    });
  }, [gruppi]);

  const cervelloSpento = lavori.some((lv) => {
    if (lv.stato !== "in_attesa") return false;
    const t = new Date(lv.created_at).getTime();
    return !isNaN(t) && Date.now() - t > 3 * 60 * 1000;
  });

  function toggle(id: string) {
    setAperti((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
            <Brain size={16} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Lavori del cervello (Max)</span>
        </div>
        {lavori.length > 0 && (
          <button
            onClick={onSvuota}
            className="text-xs text-black/40 hover:text-black/70 inline-flex items-center gap-1 transition"
          >
            <Trash2 size={12} /> Svuota
          </button>
        )}
      </div>
      <p className="text-[11px] text-black/40 mb-3">
        Ogni conversazione è un contenitore: i messaggi della stessa chat restano insieme anche se in mezzo ci sono altri lavori.
      </p>

      {cervelloSpento && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-[12.5px] text-red-800 leading-snug">
          <b>⛔ Cervello spento.</b> Il lavoro è in coda da oltre 3 minuti senza partire. Sul VPS:{" "}
          <code className="bg-red-100/80 px-1 rounded text-[11px]">systemctl start mycity-worker</code>
        </div>
      )}

      {gruppi.length === 0 ? (
        <p className="text-sm text-black/40">Nessun lavoro. Scrivi nella chat e premi il cervello.</p>
      ) : (
        <div className="scroll-soft space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {gruppi.map((g) => {
            const aperto = aperti[g.id] ?? g.haAttivo;
            const multi = g.lavori.length > 1;
            const statoUltimo = g.lavori[g.lavori.length - 1]?.stato || "in_attesa";

            return (
              <div
                key={g.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  g.haAttivo ? "border-brand/25 bg-brand-50/20" : "border-black/[0.07] bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  className="w-full flex items-start gap-2 p-3.5 text-left hover:bg-black/[0.02] transition"
                >
                  <span className="mt-0.5 text-black/40 shrink-0">
                    {aperto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {statoBadge(statoUltimo)}
                      {multi && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-black/50">
                          {g.lavori.length} messaggi
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-black/40 shrink-0">{faRelativo(g.ultimoAt)}</span>
                    </div>
                    <div className="text-sm font-medium text-ink/85 line-clamp-2">{g.titolo}</div>
                  </div>
                </button>

                {aperto && (
                  <div className="border-t border-black/[0.06] px-3.5 pb-3.5 space-y-2">
                    {g.lavori.map((lv, i) => (
                      <div
                        key={lv.id}
                        className={`rounded-lg p-3 ${multi ? "bg-paper/60 border border-black/[0.05]" : ""}`}
                      >
                        {multi && (
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <span className="text-black/35 font-medium">#{i + 1}</span>
                            {statoBadge(lv.stato)}
                            <span className="ml-auto text-black/35">{faRelativo(lv.updated_at || lv.created_at)}</span>
                          </div>
                        )}
                        <div className="text-[13px] text-ink/80 whitespace-pre-wrap break-words">
                          {multi ? titoloLavoro(lv) : null}
                          {multi && lv.richiesta.length > 120 && (
                            <details className="mt-1 text-[11px] text-black/45">
                              <summary className="cursor-pointer hover:text-black/65">Richiesta completa</summary>
                              <pre className="mt-1 whitespace-pre-wrap font-sans">{lv.richiesta}</pre>
                            </details>
                          )}
                          {!multi && <span className="font-medium">{lv.richiesta}</span>}
                        </div>
                        {lv.risultato && (
                          <div className="mt-2 text-ink/85 border-t border-black/[0.06] pt-2 text-[13px] prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lv.risultato}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
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
