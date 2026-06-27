"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Stethoscope } from "lucide-react";
import { istante } from "@/lib/format";

type Cuore = {
  collegato: boolean;
  ultimoBattito: string | null;
  eseguiteUltimo: number;
  autopilota: boolean;
  pensiero: string | null;
  budget: { tetto: number; speso: number; restante: number } | null;
};
type Stato = "verde" | "giallo" | "rosso";
type Diagnosi = { salute: Stato; checks: { nome: string; stato: Stato; dettaglio: string }[] };

function puntino(s: Stato) {
  const c = s === "verde" ? "bg-green-500" : s === "giallo" ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${c}`} />;
}

// 🫀 Lo stato del cuore della macchina: ultimo battito, autopilota, azioni
// automatiche dell'ultimo giro e budget AI. Tutto a colpo d'occhio.
export default function CuoreMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const [diag, setDiag] = useState<Diagnosi | null>(null);
  useEffect(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/diagnosi", { cache: "no-store" }).then((r) => r.json()).then(setDiag).catch(() => {});
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
      {c.pensiero && (
        <div className="mt-2 rounded-xl border border-brand/20 bg-brand-50/30 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wide text-brand mb-0.5">💭 Pensiero del giorno</div>
          <p className="text-[12.5px] text-ink/85 whitespace-pre-wrap leading-snug">{c.pensiero}</p>
        </div>
      )}
      {!c.collegato && (
        <p className="t-eti mt-2">Collega la memoria perché il cuore batta e registri i giri. L'AI "pensante" si accende dopo, con la chiave (tetto €{c.budget?.tetto ?? 50}).</p>
      )}

      {/* 🩺 Self-diagnosi: l'autonomia sta davvero girando? */}
      {diag && (
        <div className="mt-2 rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Stethoscope size={13} className="text-brand" />
            <span className="text-[10.5px] uppercase tracking-wide text-black/55">Diagnosi macchina</span>
            <span className="ml-auto">{puntino(diag.salute)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {diag.checks.map((ch, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11.5px]" title={ch.dettaglio}>
                {puntino(ch.stato)}
                <span className="text-ink/80">{ch.nome}</span>
                <span className="ml-auto text-black/40 truncate max-w-[55%] text-right">{ch.dettaglio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
