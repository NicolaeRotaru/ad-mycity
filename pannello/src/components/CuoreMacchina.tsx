"use client";

import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { istante } from "@/lib/format";

type Cuore = {
  collegato: boolean;
  demo?: boolean;
  ultimoBattito: string | null;
  eseguiteUltimo: number;
  autopilota: boolean;
  pensiero: string | null;
  budget: { tetto: number; speso: number; restante: number } | null;
};

// 🫀 Lo stato del cuore della macchina: ultimo battito, autopilota, azioni
// automatiche dell'ultimo giro e budget AI. Tutto a colpo d'occhio.
export default function CuoreMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const carica = () => fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
  useEffect(() => {
    carica();
  }, []);

  // Governance: imposta il tetto di spesa AI mensile dal pannello.
  async function modificaTetto() {
    const att = c?.budget?.tetto ?? 50;
    const v = window.prompt("Tetto di spesa AI al mese (€). La macchina si ferma da sola al raggiungimento:", String(att));
    if (v == null) return;
    const n = Number(v.replace(",", "."));
    if (Number.isNaN(n) || n < 0) return;
    await fetch("/api/cuore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tetto: n }) }).catch(() => {});
    carica();
  }

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
          <div className="flex items-center gap-1.5">
            <div className="text-[10.5px] text-black/55">Budget AI questo mese</div>
            <button onClick={modificaTetto} className="ml-auto text-[10.5px] text-brand hover:underline" title="Imposta il tetto di spesa AI">modifica</button>
          </div>
          <div className="text-[18px] font-semibold tracking-tight mt-0.5 tabular-nums">
            {c.budget ? `€${c.budget.speso} / ${c.budget.tetto}` : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="text-[10.5px] text-black/55">Stato</div>
          <div className="text-[13px] font-medium mt-1">{c.demo ? "🧪 Demo" : c.collegato ? "🟢 Vivo" : "🟡 In prova"}</div>
        </div>
      </div>
      {c.pensiero && (
        <div className="mt-2 rounded-xl border border-brand/20 bg-brand-50/30 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wide text-brand mb-0.5">💭 Pensiero del giorno</div>
          <p className="text-[12.5px] text-ink/85 whitespace-pre-wrap leading-snug">{c.pensiero}</p>
        </div>
      )}
      {!c.collegato && (
        <p className="t-eti mt-2">Collega la memoria perché il cuore batta e registri i giri. L'AI "pensante" si accende dopo, con la chiave (tetto €{c.budget?.tetto ?? 50}).</p>
      )}
    </section>
  );
}
