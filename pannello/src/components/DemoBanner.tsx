"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Power } from "lucide-react";
import { scritturaConfermata } from "@/lib/esito-scrittura";

// 🧪 Banner della modalità demo. Quando è ON mostra un avviso ben visibile (dati
// di esempio, niente di reale inviato) con il bottone per uscire. Quando è OFF
// mostra un invito discreto ad accenderla per "provare la macchina viva" senza chiavi.
export default function DemoBanner() {
  const [demo, setDemo] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/demo", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setDemo(Boolean(d.demo)))
      .catch(() => setDemo(false));
  }, []);

  async function cambia(on: boolean) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on }),
      });
      const corpo = await res.json().catch(() => null);
      // AR-264: si ricarica SOLO se il cambio è confermato. Prima si andava dritti al reload senza
      // guardare `res.ok`: `fetch` respinge solo sugli errori di rete, quindi un 500 del server
      // passava per successo — e l'etichetta che dice a Nicola SE sta guardando numeri veri o finti
      // restava sbagliata proprio nel momento in cui conta di più.
      if (!scritturaConfermata(res, corpo)) {
        setErr(`Non sono riuscito a cambiare modalità — stai ancora vedendo dati ${demo ? "di esempio" : "veri"}.`);
        setBusy(false);
        return;
      }
      // Ricarico: tutte le aree rileggono i dati con/ senza il cookie demo.
      window.location.reload();
    } catch {
      setErr("Non sono riuscito a cambiare modalità — riprova.");
      setBusy(false);
    }
  }

  if (demo === null) return null;

  if (demo) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 flex items-center gap-3 flex-wrap">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber-200/70 text-amber-800 shrink-0">
          <FlaskConical size={16} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-amber-900">🧪 Modalità DEMO attiva — stai vedendo dati di esempio</div>
          <div className="text-[12px] text-amber-800/90">
            Numeri, cuore e volano sono finti, solo per provare la macchina. <b>Niente di reale viene inviato.</b>
          </div>
        </div>
        <button
          onClick={() => cambia(false)}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-xl bg-white text-amber-900 ring-1 ring-amber-300 hover:bg-amber-100 transition disabled:opacity-50"
        >
          <Power size={14} /> Esci dalla demo
        </button>
        {err && <div className="w-full text-[12px] font-medium text-red-700">⚠️ {err}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-black/[0.12] bg-paper/40 p-3 flex items-center gap-3 flex-wrap">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
        <FlaskConical size={16} />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink">🧪 Prova la macchina "viva" (demo)</div>
        <div className="t-eti">Accendi dati di esempio per vedere com'è quando gira — senza chiavi e senza inviare nulla di reale.</div>
      </div>
      <button
        onClick={() => cambia(true)}
        disabled={busy}
        className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-xl bg-brand text-white shadow-card hover:opacity-90 transition disabled:opacity-50"
      >
        <Power size={14} /> Attiva la demo
      </button>
      {err && <div className="w-full text-[12px] font-medium text-red-700">⚠️ {err}</div>}
    </div>
  );
}
