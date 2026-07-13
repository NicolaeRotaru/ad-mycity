"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { emitSync, usePanelSync } from "@/lib/panel-sync";

// 🤖 Autopilota — controllo unico, spostato QUI nella Plancia (fix #4: prima stava
// nascosto dentro la scheda "Da approvare"). Quando è ON, la macchina esegue DA SOLA
// solo le mosse SICURE (🟢 verde) ancora da decidere. Stesse cinture delle "mani":
// senza worker acceso e chiave del canale, l'azione viene simulata o resta in coda —
// non parte mai nulla per sbaglio.
export default function Autopilota() {
  const [attivo, setAttivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [eseguite, setEseguite] = useState<number | null>(null);

  const carica = useCallback(async () => {
    try {
      const d = await fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json());
      setAttivo(Boolean(d?.autopilota));
      if (d?.autopilota) {
        fetch("/api/azioni-pronte/autopilota", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
          .then((r) => r.json())
          .then((r) => { if (typeof r?.eseguite === "number") setEseguite(r.eseguite); })
          .catch(() => {});
      }
    } catch {
      /* offline */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carica(); }, [carica]);
  usePanelSync(["azioni", "memoria", "all"], carica);

  async function toggle() {
    if (busy) return;
    const nuovo = !attivo;
    setBusy(true);
    setAttivo(nuovo); // ottimistico
    try {
      const r = await fetch("/api/azioni-pronte/autopilota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attiva: nuovo }),
      }).then((x) => x.json());
      if (typeof r?.attivo === "boolean") setAttivo(r.attivo);
      if (typeof r?.eseguite === "number") setEseguite(r.eseguite);
      emitSync("azioni");
    } catch {
      setAttivo(!nuovo); // rollback
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-4">
      <div className="flex items-start gap-3">
        <span className="sez-ico shrink-0"><Bot size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="t-sez">Autopilota</span>
            <span className={`badge ${attivo ? "badge-on" : "badge-off"}`}>{loading ? "…" : attivo ? "ACCESO" : "SPENTO"}</span>
          </div>
          <p className="t-eti mt-1 leading-relaxed">
            Quando è acceso, la macchina fa da sola solo le mosse <b>sicure</b> 🟢 (quelle senza rischi,
            reversibili) e te le segna nel registro. Tutto ciò che tocca soldi o è pubblico 🔴 aspetta
            sempre la tua firma. Senza il worker acceso e la chiave del canale, l&apos;azione viene simulata
            o resta in coda: <b>non parte mai nulla per sbaglio</b>.
          </p>
          {eseguite != null && eseguite > 0 && (
            <p className="t-eti mt-1 text-green-700 dark:text-green-400">✅ {eseguite} {eseguite === 1 ? "mossa sicura eseguita" : "mosse sicure eseguite"} in automatico.</p>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy || loading}
          role="switch"
          aria-checked={attivo}
          title={attivo ? "Spegni l'autopilota" : "Accendi l'autopilota (solo mosse sicure)"}
          className={`shrink-0 inline-flex items-center gap-2 text-[13px] font-medium px-3.5 py-2 rounded-xl border transition disabled:opacity-50 ${
            attivo
              ? "border-brand/40 text-brand"
              : "text-black/60 dark:text-white/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
          }`}
          style={attivo ? { background: "var(--brand-soft)" } : { borderColor: "var(--border-strong)" }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
          {attivo ? "Spegni" : "Accendi"}
        </button>
      </div>
    </section>
  );
}
