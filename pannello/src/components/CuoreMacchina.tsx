"use client";

import { useCallback, useEffect, useState } from "react";
import { HeartPulse, Stethoscope } from "lucide-react";
import { istante } from "@/lib/format";

type Cuore = {
  collegato: boolean;
  demo?: boolean;
  ultimoBattito: string | null;
  ultimoBattitoFonte?: string | null;
  ultimoGiro?: string | null;
  autopilotaUltimo?: string | null;
  workerVivo?: boolean;
  vivo?: boolean;
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

// 🫀 Lo stato del cuore della macchina: ultimo giro AD, autopilota, worker e budget.
export default function CuoreMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const [diag, setDiag] = useState<Diagnosi | null>(null);

  const carica = useCallback(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/diagnosi", { cache: "no-store" }).then((r) => r.json()).then(setDiag).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 60_000);
    return () => clearInterval(t);
  }, [carica]);

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

  const ultimoGiro = c.ultimoGiro ?? c.ultimoBattito;
  const battitoLabel = ultimoGiro ? istante(ultimoGiro) : "non ancora";
  const fonte = c.ultimoBattitoFonte ? ` · ${c.ultimoBattitoFonte}` : "";
  const autopilotaNota =
    c.autopilotaUltimo && c.autopilotaUltimo !== ultimoGiro
      ? `Autopilota Vercel: ${istante(c.autopilotaUltimo)}`
      : null;

  return (
    <section className="card p-3.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0">
          <HeartPulse size={15} className={c.vivo || c.collegato ? "" : "opacity-50"} />
        </span>
        <span className="t-sez">Cuore della macchina</span>
        <span
          className={`badge ${c.autopilota ? "badge-on" : "badge-off"}`}
          title="Quando è ON, le azioni sicure 🟢 partono da sole al cron Vercel"
        >
          autopilota {c.autopilota ? "ON" : "OFF"}
        </span>
        <span className="ml-auto t-eti" title={`Fonte: ${c.ultimoBattitoFonte ?? "—"}`}>
          🕗 ultimo giro AD · {battitoLabel}
          {fonte && <span className="text-black/35">{fonte}</span>}
        </span>
      </div>
      {autopilotaNota && <p className="t-eti mt-1 text-right">{autopilotaNota}</p>}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
          <div className="text-[10.5px] text-black/55" title="Azioni 🟢 eseguite dall'autopilota al cron Vercel (non dal giro AD)">
            Azioni auto (autopilota)
          </div>
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
          <div className="text-[13px] font-medium mt-1">
            {c.demo ? "🧪 Demo" : c.vivo ? "🟢 Vivo" : c.collegato ? "🟡 Collegato" : "🟡 In prova"}
            {c.workerVivo === false && c.vivo ? " · worker spento" : ""}
          </div>
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
