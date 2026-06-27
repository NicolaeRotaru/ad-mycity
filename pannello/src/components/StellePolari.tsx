"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Stella = { id: string; emoji: string; nome: string; descrizione: string; principale: boolean; attiva: boolean };

// ⭐ Le 3 Stelle Polari, con interruttore on/off per le secondarie.
// Il numero reale di ogni Stella, dai dati già disponibili (/api/metriche).
// Se la fonte non è collegata, resta "—" (mai numeri inventati).
function valoreStella(id: string, m: Record<string, any> | null): string {
  if (!m) return "—";
  const n = (k: string) => (m[k] === undefined || m[k] === null ? null : Number(m[k]));
  if (id === "ordini") {
    const c = n("consegne_7g") ?? n("ordini_7g");
    return c == null ? "—" : `${c} consegnati · 7g`;
  }
  if (id === "clienti") {
    const nuovi = n("nuovi_clienti_7g");
    const visite = n("visite_7g");
    const conv = n("conversione");
    const parti = [
      nuovi != null ? `${nuovi} nuovi` : null,
      visite != null ? `${visite} visite` : null,
      conv != null ? `${conv}% conv.` : null,
    ].filter(Boolean);
    return parti.length ? `${parti.join(" · ")} · 7g` : "—";
  }
  if (id === "influenza") {
    const neg = n("negozi");
    const rec = n("recensioni_totali");
    const visite = n("visite_7g");
    const parti = [
      neg != null ? `${neg} negozi` : null,
      rec != null ? `${rec} recensioni` : null,
      visite != null ? `${visite} visite/7g` : null,
    ].filter(Boolean);
    return parti.length ? parti.join(" · ") : "—";
  }
  return "—";
}

export default function StellePolari() {
  const [stelle, setStelle] = useState<Stella[]>([]);
  const [metriche, setMetriche] = useState<Record<string, any> | null>(null);
  const carica = () =>
    fetch("/api/stelle", { cache: "no-store" }).then((r) => r.json()).then((d) => setStelle(d.stelle || [])).catch(() => {});
  useEffect(() => {
    carica();
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setMetriche).catch(() => {});
  }, []);

  async function toggle(s: Stella) {
    if (s.principale) return;
    // ottimistico
    setStelle((list) => list.map((x) => (x.id === s.id ? { ...x, attiva: !x.attiva } : x)));
    await fetch("/api/stelle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, attiva: !s.attiva }),
    }).catch(() => {});
    carica();
  }

  if (stelle.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Star size={15} className="text-brand" />
        <span className="t-sez">Stelle Polari</span>
        <span className="t-eti">la principale è sempre accesa; le altre le accendi tu</span>
      </div>
      {stelle.map((s) => (
        <div
          key={s.id}
          className={`rounded-xl border p-3 flex items-start gap-3 ${s.attiva ? "border-brand/25 bg-brand-50/20" : "border-black/[0.07] bg-paper/30"}`}
        >
          <span className="text-[18px] leading-none mt-0.5">{s.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-ink">{s.nome}</div>
            <div className="text-[12px] font-medium text-brand mt-0.5 tabular-nums">{valoreStella(s.id, metriche)}</div>
            <div className="t-eti mt-0.5">{s.descrizione}</div>
          </div>
          {s.principale ? (
            <span className="badge badge-on shrink-0">sempre attiva</span>
          ) : (
            <button
              onClick={() => toggle(s)}
              className={`shrink-0 inline-flex items-center h-6 w-11 rounded-full transition ${s.attiva ? "bg-brand" : "bg-black/15"}`}
              aria-pressed={s.attiva}
              title={s.attiva ? "Spegni" : "Accendi"}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${s.attiva ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
