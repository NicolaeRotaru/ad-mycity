"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ChevronDown, HeartPulse } from "lucide-react";
import { istante } from "@/lib/format";
import { vaiArea } from "@/lib/nav";

type Cuore = {
  collegato: boolean;
  ultimoGiro?: string | null;
  ultimoBattito?: string | null;
  vivo?: boolean;
  workerVivo?: boolean;
  autopilota?: boolean;
};
type Diagnosi = { salute: "verde" | "giallo" | "rosso"; checks: { nome: string; stato: "verde" | "giallo" | "rosso"; dettaglio: string }[] };
type SaluteLink = { label: string; vista: "cervello" | "auto-coscienza" | "salute-sito"; stat: string; semaforo: "verde" | "giallo" | "rosso" };

const ORGANI = [
  { e: "👁️", n: "Sensi", okKey: "sensi" as const },
  { e: "🧠", n: "Memoria", okKey: "memoria" as const },
  { e: "💡", n: "Cervello", okKey: "cervello" as const },
  { e: "🫀", n: "Battito", okKey: "battito" as const },
  { e: "✋", n: "Mani", okKey: "mani" as const },
  { e: "🛡️", n: "Freni", okKey: "freni" as const },
  { e: "🎛️", n: "Cabina", okKey: "cabina" as const },
  { e: "🔁", n: "Apprend.", okKey: "apprend" as const },
];

function dot(stato: "verde" | "giallo" | "rosso") {
  return stato === "verde" ? "bg-green-500" : stato === "giallo" ? "bg-amber-500" : "bg-red-500";
}

/** Card unica home: semaforo + 8 pallini + link alle 3 pagine salute. */
export default function MacchinaHomeCard() {
  const [c, setC] = useState<Cuore | null>(null);
  const [diag, setDiag] = useState<Diagnosi | null>(null);
  const [m, setM] = useState<Record<string, any> | null>(null);
  const [links, setLinks] = useState<SaluteLink[]>([]);
  const [dettagli, setDettagli] = useState(false);
  const [organoHover, setOrganoHover] = useState<string | null>(null);

  const carica = useCallback(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/diagnosi", { cache: "no-store" }).then((r) => r.json()).then(setDiag).catch(() => {});
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setM).catch(() => {});
    Promise.all([
      fetch("/api/memoria/auto-radiografia", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/memoria/radiografia-marketplace", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([rad, ac, sito]) => {
      const difetti = rad?.collegato ? (rad.cantiere?.difetti || []).filter((x: any) => x.stato !== "chiuso").length : 0;
      const votoRad = Number(rad?.live?.voto ?? rad?.radiografia?.voto_salute_architettura);
      const fiducia = Number(ac?.analisi?.voto_fiducia);
      const blocc = sito?.meta?.bloccanti ?? 0;
      setLinks([
        {
          label: "Radiografia macchina",
          vista: "cervello",
          stat: Number.isFinite(votoRad) ? `${votoRad}/100 · ${difetti} aperti` : `${difetti} aperti`,
          semaforo: difetti > 0 || (Number.isFinite(votoRad) && votoRad < 70) ? "giallo" : "verde",
        },
        {
          label: "Auto-coscienza",
          vista: "auto-coscienza",
          stat: Number.isFinite(fiducia) ? `fiducia ${fiducia}/100` : "analisi giro",
          semaforo: Number.isFinite(fiducia) && fiducia < 70 ? "giallo" : "verde",
        },
        {
          label: "Salute sito",
          vista: "salute-sito",
          stat: blocc > 0 ? `${blocc} bloccanti` : sito?.meta?.findings ? `${sito.meta.findings} problemi` : "audit",
          semaforo: blocc > 0 ? "rosso" : (sito?.meta?.gravi ?? 0) > 0 ? "giallo" : "verde",
        },
      ]);
    });
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 60_000);
    return () => clearInterval(t);
  }, [carica]);

  if (!c) return null;

  const demo = !!c.collegato && !!(c as any).demo;
  const okMap: Record<string, boolean> = {
    sensi: demo || !!m?.marketplace_collegato,
    memoria: demo || !!c.collegato,
    cervello: true,
    battito: demo || !!c.vivo,
    mani: demo || !!((c as any).maniEmail && (c as any).maniLive),
    freni: true,
    cabina: true,
    apprend: true,
  };
  const organiStato = ORGANI.map((o) => ({ ...o, ok: okMap[o.okKey] }));
  const problemi = organiStato.filter((o) => !o.ok).length;
  const salute = diag?.salute ?? (problemi ? "giallo" : c.vivo ? "verde" : "giallo");
  const ultimo = c.ultimoGiro ?? c.ultimoBattito;
  const riga =
    salute === "verde"
      ? `🟢 Viva · ultimo giro ${ultimo ? istante(ultimo) : "—"}`
      : salute === "rosso"
        ? `🔴 Attenzione · ${problemi || 1} organi da sistemare`
        : `🟡 Ok con note · ${problemi ? `${problemi} organi · ` : ""}ultimo giro ${ultimo ? istante(ultimo) : "—"}`;

  return (
    <section className="card p-4">
      <div className="flex items-start gap-2 flex-wrap mb-3">
        <span className="grid place-items-center w-7 h-7 rounded-lg bg-brand-50 text-brand shrink-0">
          <HeartPulse size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="t-sez">La macchina</span>
          <p className="t-corpo text-[13px] font-medium mt-0.5">{riga}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-2" role="list" aria-label="Stato degli 8 organi">
        {organiStato.map((o) => (
          <button
            key={o.n}
            type="button"
            role="listitem"
            title={`${o.n}: ${o.ok ? "ok" : "da accendere o controllare"}`}
            onMouseEnter={() => setOrganoHover(o.n)}
            onMouseLeave={() => setOrganoHover(null)}
            onFocus={() => setOrganoHover(o.n)}
            onBlur={() => setOrganoHover(null)}
            className="flex flex-col items-center gap-0.5 min-w-[2rem]"
          >
            <span className="text-base leading-none">{o.e}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${o.ok ? "bg-green-500" : "bg-amber-500"}`} />
          </button>
        ))}
      </div>
      {organoHover && (
        <p className="text-center t-eti mt-1">{organoHover}: {organiStato.find((x) => x.n === organoHover)?.ok ? "ok" : "serve attenzione"}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {links.map((l) => (
          <button
            key={l.vista}
            type="button"
            onClick={() => vaiArea(l.vista)}
            className="flex-1 min-w-[140px] text-left surface-muted p-2.5 rounded-xl border border-transparent hover:border-brand/30 transition"
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot(l.semaforo)}`} />
              <span className="text-[12.5px] font-semibold truncate">{l.label}</span>
            </div>
            <span className="block t-eti mt-0.5 tabular-nums">{l.stat}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDettagli((v) => !v)}
        className="mt-2 flex items-center gap-1 t-eti hover:text-brand transition w-full justify-center"
      >
        <ChevronDown size={14} className={`transition ${dettagli ? "rotate-180" : ""}`} />
        {dettagli ? "Nascondi dettagli tecnici" : "Mostra dettagli tecnici"}
      </button>
      {dettagli && diag && (
        <div className="mt-2 rounded-xl border p-2.5 surface-muted text-[12px] space-y-1">
          {diag.checks.map((ch, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot(ch.stato)}`} />
              <span>{ch.nome}</span>
              <span className="ml-auto t-eti truncate max-w-[50%]">{ch.dettaglio}</span>
            </div>
          ))}
          {c.autopilota != null && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-black/5">
              <Activity size={12} className="text-brand" />
              Autopilota {c.autopilota ? "ON" : "OFF"}
              {c.workerVivo === false && c.vivo ? " · worker spento" : ""}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
