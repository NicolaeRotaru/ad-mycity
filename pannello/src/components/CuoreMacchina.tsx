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
// 🪙 Consumo VERO della macchina (token/sforzo del piano Claude Max), da /api/costo (fonte cervello/costo-ai.mjs).
// Rimpiazza il vecchio "Budget AI €/mese" (sempre €0 ora che non ci sono API a pagamento): non misura soldi,
// misura lo sforzo — e quanti giri il delta-gate ha evitato (il risparmio che la macchina si guadagna imparando).
type Costo = {
  collegato: boolean;
  soglia_giornaliera_token?: number;
  oggi?: {
    token_totali?: number;
    runs?: number;
    soglia_pct?: number | null;
    soglia_superata?: boolean;
    giri_pieni?: number;
    giri_saltati?: number;
    risparmio_giri_pct?: number | null;
  };
};

function nFmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function puntino(s: Stato) {
  const c = s === "verde" ? "bg-green-500" : s === "giallo" ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${c}`} />;
}

// 🫀 Lo stato del cuore della macchina: ultimo giro AD, autopilota, worker e budget.
export default function CuoreMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const [diag, setDiag] = useState<Diagnosi | null>(null);
  const [costo, setCosto] = useState<Costo | null>(null);

  const carica = useCallback(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/diagnosi", { cache: "no-store" }).then((r) => r.json()).then(setDiag).catch(() => {});
    fetch("/api/costo", { cache: "no-store" }).then((r) => r.json()).then(setCosto).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 60_000);
    return () => clearInterval(t);
  }, [carica]);

  if (!c) return null;

  const co = costo?.oggi;
  const soglia = Number(costo?.soglia_giornaliera_token || 0);
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
          {fonte && <span className="t-micro normal-case">{fonte}</span>}
        </span>
      </div>
      {autopilotaNota && <p className="t-eti mt-1 text-right">{autopilotaNota}</p>}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="kpi-tile">
          <div className="kpi-tile-label" title="Azioni 🟢 eseguite dall'autopilota al cron Vercel (non dal giro AD)">
            Azioni auto (autopilota)
          </div>
          <div className="kpi-tile-value">{c.eseguiteUltimo}</div>
        </div>
        <div className="kpi-tile">
          <div className="flex items-center gap-1.5">
            <div className="kpi-tile-label" title="Token consumati OGGI dal cervello (piano Claude Max) vs la soglia giornaliera. Non sono soldi: è lo sforzo. Fonte: cervello/costo-ai.mjs">
              🪙 Sforzo oggi (token)
            </div>
            {co?.risparmio_giri_pct != null && (
              <span className="ml-auto text-[10.5px] text-green-600" title="Quota di giri che il delta-gate ha SALTATO perché nulla era cambiato: sforzo risparmiato che la macchina si guadagna imparando a non ripetersi">
                −{co.risparmio_giri_pct}% giri
              </span>
            )}
          </div>
          <div className={`kpi-tile-value ${co?.soglia_superata ? "text-red-600" : ""}`}>
            {costo?.collegato && co
              ? `${nFmt(Number(co.token_totali || 0))}${soglia ? ` / ${nFmt(soglia)}` : ""}`
              : "—"}
          </div>
          {costo?.collegato && co?.soglia_pct != null && (
            <div className="t-micro mt-0.5">{co.soglia_pct}% della soglia · {co.giri_pieni ?? 0} giri pieni</div>
          )}
        </div>
        <div className="kpi-tile">
          <div className="kpi-tile-label">Stato</div>
          <div className="t-riga font-medium mt-1">
            {c.demo ? "🧪 Demo" : c.vivo ? "🟢 Vivo" : c.collegato ? "🟡 Collegato" : "🟡 In prova"}
            {c.workerVivo === false && c.vivo ? " · worker spento" : ""}
          </div>
        </div>
      </div>
      {c.pensiero && (
        <div className="mt-2 rounded-xl border border-brand/20 bg-brand-50/30 p-2.5">
          <div className="text-[10.5px] uppercase tracking-wide text-brand mb-0.5">💭 Pensiero del giorno</div>
          <p className="t-corpo text-[12.5px] whitespace-pre-wrap leading-snug">{c.pensiero}</p>
        </div>
      )}
      {!c.collegato && (
        <p className="t-eti mt-2">Collega la memoria perché il cuore batta e registri i giri. Il cervello gira sul piano Claude Max (costo fisso): la casella «Sforzo oggi» mostra i token consumati, non soldi.</p>
      )}

      {diag && (
        <div className="mt-2 rounded-xl border p-2.5 surface-muted">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Stethoscope size={13} className="text-brand" />
            <span className="t-micro normal-case">Diagnosi macchina</span>
            <span className="ml-auto">{puntino(diag.salute)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {diag.checks.map((ch, i) => (
              <div key={i} className="flex items-center gap-1.5 t-riga" title={ch.dettaglio}>
                {puntino(ch.stato)}
                <span>{ch.nome}</span>
                <span className="ml-auto t-eti truncate max-w-[55%] text-right">{ch.dettaglio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
