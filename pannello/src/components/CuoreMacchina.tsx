"use client";

import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { istante } from "@/lib/format";

type Cuore = {
  collegato: boolean;
  ultimoBattito: string | null;
  eseguiteUltimo: number;
  autopilota: boolean;
  budget: { tetto: number; speso: number; restante: number } | null;
};

// 🫀 Lo stato del cuore della macchina: ultimo battito, autopilota, azioni
// automatiche dell'ultimo giro e budget AI. Tutto a colpo d'occhio.
export default function CuoreMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  useEffect(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
  }, []);
  if (!c) return null;

  const battito = c.ultimoBattito ? istante(c.ultimoBattito) : "non ancora";
  return (
    <section className="card p-3.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0">
          <HeartPulse size={15} className={c.collegato ? "" : "opacity-50"} />
        </span>
        <span className="t-sez">Cuore della macchina</span>
        <span
          className={`badge ${c.autopilota ? "badge-on" : "badge-off"}`}
          title="Quando è ON, le azioni sicure 🟢 partono da sole"
        >
          autopilota {c.autopilota ? "ON" : "OFF"}
        </span>
        <span className="ml-auto t-eti">🕗 ultimo battito · {battito}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="text-[10.5px] text-black/55">Azioni auto (ultimo giro)</div>
          <div className="text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums">{c.eseguiteUltimo}</div>
        </div>
        <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="text-[10.5px] text-black/55">Budget AI questo mese</div>
          <div className="text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums">
            {c.budget ? `€${c.budget.speso} / ${c.budget.tetto}` : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="text-[10.5px] text-black/55">Stato</div>
          <div className="text-[13px] font-medium mt-1">{c.collegato ? "🟢 Vivo" : "🟡 In prova"}</div>
        </div>
      </div>
      {!c.collegato && (
        <p className="t-eti mt-2">Collega la memoria perché il cuore batta e registri i giri. L'AI "pensante" si accende dopo, con la chiave (tetto €{c.budget?.tetto ?? 50}).</p>
      )}
    </section>
  );
}
