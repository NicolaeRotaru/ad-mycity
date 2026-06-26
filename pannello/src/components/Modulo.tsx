"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatta, type Tipo } from "@/lib/format";
import type { ModuloDef } from "@/lib/moduli";

// Card-accordion generica di un modulo di controllo. Mostra:
// - badge stato (N/M kpi collegati, oppure "live"/"parziale"/"da collegare")
// - una griglia di KPI (valori reali da /api/metriche, "—" se non collegati)
// - i punti "cosa contiene / cosa mostrerà" e la fonte da collegare.
export default function Modulo({ def, metriche }: { def: ModuloDef; metriche: Record<string, any> | null }) {
  const [open, setOpen] = useState(def.apertaDefault ?? false);
  const acceso = (chiave?: string, tipo?: Tipo) =>
    Boolean(chiave && metriche && metriche[chiave] !== undefined && metriche[chiave] !== null) &&
    formatta(metriche![chiave!], tipo) !== "—";

  const kpis = def.kpis || [];
  const collegate = kpis.filter((k) => acceso(k.chiave, k.tipo)).length;
  const haDati = collegate > 0;
  const statoLabel = def.stato === "live" ? "live" : def.stato === "parziale" ? "parziale" : "da collegare";

  return (
    <div className={`rounded-xl border transition ${open ? "border-brand/25 bg-brand-50/20" : "border-black/[0.06] bg-paper/30 hover:border-brand/20"}`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left" aria-expanded={open}>
        <span className="t-sez">{def.emoji} {def.titolo}</span>
        <span className={`badge ${haDati ? "badge-on" : "badge-off"}`}>{kpis.length ? `${collegate}/${kpis.length}` : statoLabel}</span>
        <span className="ml-auto shrink-0 text-black/35">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <p className="t-eti mb-2.5">{def.descrizione}</p>

          {kpis.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
              {kpis.map((k, i) => {
                const on = acceso(k.chiave, k.tipo);
                const v = on ? formatta(metriche![k.chiave!], k.tipo) : "—";
                return (
                  <div key={i} className={`rounded-xl border p-2.5 ${on ? "border-black/[0.06] bg-paper/40" : "border-dashed border-black/[0.10] bg-paper/20"}`}>
                    <div className="text-[10.5px] text-black/55 leading-tight">{k.label}</div>
                    <div className={`text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums ${on ? "text-ink" : "text-black/25"}`}>{v}</div>
                  </div>
                );
              })}
            </div>
          )}

          {def.punti && def.punti.length > 0 && (
            <ul className="space-y-1">
              {def.punti.map((p, i) => (
                <li key={i} className="text-[12px] text-black/60 leading-snug flex gap-1.5">
                  <span className="text-brand shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}

          {def.stato !== "live" && (
            <p className="t-eti mt-2.5">
              {def.stato === "placeholder" ? "Si accende quando colleghi: " : "Parzialmente collegato · fonte: "}
              <span className="text-black/70">{def.fonte}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
