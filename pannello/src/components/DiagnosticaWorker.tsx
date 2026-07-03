"use client";

import { useCallback, useEffect, useState } from "react";
import { Stethoscope, RefreshCw, Unlock, Loader2, Power } from "lucide-react";

type Salute = {
  memoria: boolean;
  supabaseHost?: string | null;
  workerVivo?: boolean;
  workerUltimo?: string | null;
  workerUltimoFa?: string;
  adInPausa?: boolean;
  pipeline?: string | null;
  conteggi?: Record<string, number>;
  attesaPiuVecchiaMin?: number | null;
  corsoPiuVecchioMin?: number | null;
  attesaQuota?: boolean;
  riprovaAlle?: string | null;
  resetHint?: string | null;
  problema?: string | null;
  azioni?: string[];
  ok?: boolean;
};

export default function DiagnosticaWorker() {
  const [d, setD] = useState<Salute | null>(null);
  const [loading, setLoading] = useState(true);
  const [sbloccando, setSbloccando] = useState(false);
  const [riavviando, setRiavviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const carica = useCallback(() => {
    setLoading(true);
    fetch("/api/worker-salute", { cache: "no-store" })
      .then((r) => r.json())
      .then(setD)
      .catch(() => setD(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 30_000);
    return () => clearInterval(t);
  }, [carica]);

  // Riavvia il worker sul VPS senza SSH: mette il flag worker:riavvia in Supabase;
  // il worker lo legge a ogni ciclo (5s) e si ricarica. La coda resta in Supabase: zero perdite.
  async function riavviaWorker() {
    setRiavviando(true);
    setMsg(null);
    try {
      const r = await fetch("/api/worker-salute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ azione: "riavvia" }),
      });
      const j = await r.json();
      setMsg(j.messaggio || j.error || (j.ok ? "Riavvio richiesto." : "Errore"));
      setTimeout(carica, 8000);
    } catch {
      setMsg("Errore di rete.");
    } finally {
      setRiavviando(false);
    }
  }

  async function sbloccaCoda() {
    setSbloccando(true);
    setMsg(null);
    try {
      const r = await fetch("/api/lavori/recupera", { method: "POST" });
      const j = await r.json();
      setMsg(j.messaggio || (j.ok ? "Fatto." : j.error || "Errore"));
      carica();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("mycity:lavori"));
    } catch {
      setMsg("Errore di rete.");
    } finally {
      setSbloccando(false);
    }
  }

  if (loading && !d) {
    return (
      <div className="card p-3 flex items-center gap-2 t-eti text-sm">
        <Loader2 size={14} className="animate-spin" /> Controllo worker…
      </div>
    );
  }

  if (!d) return null;

  // La coda in attesa del reset quota Claude NON è un guasto: si riparte da soli → giallo, non rosso.
  const rosso = (Boolean(d.problema) && !d.attesaQuota) || d.workerVivo === false;
  const giallo = !rosso && (d.adInPausa || Boolean(d.attesaQuota));

  return (
    <section
      className={`card p-3.5 border ${
        rosso
          ? "border-red-300/50 dark:border-red-900/60"
          : giallo
            ? "border-amber-300/50 dark:border-amber-900/50"
            : "border-green-300/40 dark:border-green-900/40"
      }`}
      style={{
        background: rosso
          ? "color-mix(in srgb, var(--bg-surface) 92%, #dc2626 8%)"
          : giallo
            ? "color-mix(in srgb, var(--bg-surface) 94%, #d97706 6%)"
            : undefined,
      }}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <Stethoscope size={16} className="text-brand shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="t-sez text-[14px]">Stato worker (coda chat)</div>
          <div className="t-eti mt-0.5 text-[12px]">
            {d.workerVivo ? (
              <span className="text-green-700 dark:text-green-400 font-medium">Worker ON</span>
            ) : d.adInPausa ? (
              <span className="text-amber-700 dark:text-amber-400 font-medium">AD in pausa</span>
            ) : (
              <span className="text-red-700 dark:text-red-400 font-medium">Worker spento o mai partito</span>
            )}
            {d.workerUltimoFa && d.workerUltimoFa !== "mai" && (
              <> · battito {d.workerUltimoFa}</>
            )}
            {d.supabaseHost && (
              <> · DB <code className="text-[11px]">{d.supabaseHost}</code></>
            )}
          </div>
          {d.conteggi && (
            <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
              {(["in_attesa", "in_corso", "fatto", "errore"] as const).map((k) =>
                (d.conteggi?.[k] ?? 0) > 0 ? (
                  <span key={k} className="badge badge-off">
                    {k.replace("_", " ")}: {d.conteggi![k]}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
        <button type="button" onClick={carica} className="btn-ghost shrink-0" title="Ricontrolla">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {d.problema && (
        <div className="mt-2.5 text-[13px] leading-snug" style={{ color: "var(--text-primary)" }}>
          <b>{d.attesaQuota ? "Cosa sta succedendo:" : "Probabile causa:"}</b> {d.problema}
        </div>
      )}

      {d.azioni && d.azioni.length > 0 && (
        <ol className="mt-2 space-y-1.5 text-[12.5px] list-decimal list-inside t-corpo leading-relaxed">
          {d.azioni.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(d.conteggi?.in_corso ?? 0) > 0 && (
          <button
            type="button"
            onClick={sbloccaCoda}
            disabled={sbloccando}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand text-white rounded-lg px-3 py-1.5 hover:bg-brand-dark disabled:opacity-50"
          >
            {sbloccando ? <Loader2 size={12} className="animate-spin" /> : <Unlock size={12} />}
            Sblocca coda
          </button>
        )}
        <button
          type="button"
          onClick={riavviaWorker}
          disabled={riavviando}
          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border border-amber-300/60 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
          title="Il worker si ricarica da solo al prossimo ciclo. I lavori in coda restano in Supabase: non si perde nulla."
        >
          {riavviando ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
          Riavvia worker
        </button>
        <a
          href="/api/diagnosi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand hover:underline self-center"
        >
          Apri diagnosi completa (JSON)
        </a>
      </div>

      {msg && <p className="t-eti mt-2 text-[12px]">{msg}</p>}

      <p className="t-eti mt-2.5 text-[11px] leading-relaxed border-t pt-2" style={{ borderColor: "var(--border)" }}>
        Sul VPS (SSH):{" "}
        <code className="text-[10.5px] break-all">
          sudo bash /opt/mycity/ad-mycity/cervello/vps/diagnostica-completa.sh
        </code>
      </p>
    </section>
  );
}
