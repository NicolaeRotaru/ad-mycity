"use client";

import { TrendingUp } from "lucide-react";
import ParlaCasella from "@/components/ParlaCasella";
import { pulisciTitolo } from "@/lib/azioni-attesa";
import { useBriefingVivo } from "@/lib/panel-sync";

export default function ScoperteProposte() {
  const { briefing, ultimoLabel } = useBriefingVivo();

  return (
    <section className="card p-4">
      <div className="sez-head mb-4">
        <span className="sez-ico"><TrendingUp size={16} /></span>
        <div className="min-w-0">
          <span className="t-sez">Scoperte & proposte</span>
          <div className="t-eti">
            {ultimoLabel ? `L'analisi dell'ultimo giro · ${ultimoLabel}` : "L'analisi dell'ultimo giro"}
          </div>
        </div>
      </div>
      {!briefing ? (
        <div className="text-center text-black/45 py-8">
          <p className="mb-1">Nessuna analisi salvata ancora.</p>
          <p className="text-sm text-black/35">Al prossimo giro compare qui da sola.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">{briefing.situazione}</p>
          {briefing.opportunita?.length > 0 && (
            <div>
              <div className="t-micro mb-2">Opportunità</div>
              <div className="space-y-2">
                {briefing.opportunita.map((o, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3.5 hover:border-brand/30 transition">
                    <div className="text-sm font-medium">{pulisciTitolo(o.titolo)}</div>
                    <div className="text-sm text-black/60 mt-0.5">{o.motivo}</div>
                    <div className="text-xs text-black/45 mt-2 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-black/5">impatto {o.impatto}</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/5">sforzo {o.sforzo}</span>
                    </div>
                    <ParlaCasella titolo={`Opportunità: ${o.titolo}`} contesto={[o.motivo, `impatto ${o.impatto}`, `sforzo ${o.sforzo}`].filter(Boolean).join(" · ")} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {briefing.azioni?.length > 0 && (
            <div className="rounded-xl border border-brand/15 bg-brand-50/30 p-3 text-[12.5px] text-ink/80">
              💡 Da questo giro: <b>{briefing.azioni.length}</b> azioni in <b>⚡ Azioni → Da approvare</b>.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
