"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

type Cuore = {
  collegato: boolean;
  demo?: boolean;
  ultimoBattito: string | null;
  ultimoGiro?: string | null;
  workerVivo?: boolean;
  vivo?: boolean;
  autopilota: boolean;
  ai: boolean;
  maniEmail: boolean;
  maniLive: boolean;
};

// 🧬 Stato della macchina — gli 8 organi, ognuno ✅ pronto / 🟡 da accendere.
export default function StatoMacchina() {
  const [c, setC] = useState<Cuore | null>(null);
  const [m, setM] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    fetch("/api/cuore", { cache: "no-store" }).then((r) => r.json()).then(setC).catch(() => {});
    fetch("/api/metriche", { cache: "no-store" }).then((r) => r.json()).then(setM).catch(() => {});
  }, []);

  const demo = !!c?.demo;
  // In demo mostro la macchina "tutta accesa" (di esempio), con nota "(demo)".
  const organi = [
    { e: "👁️", n: "Sensi", d: "legge i dati veri", ok: demo || !!m?.marketplace_collegato, nota: demo ? "dati di esempio (demo)" : m?.marketplace_collegato ? "dati collegati" : "da collegare" },
    { e: "🧠", n: "Memoria", d: "ricorda tutto (il vault)", ok: demo || !!c?.collegato, nota: demo ? "di esempio (demo)" : c?.collegato ? "collegata" : "da collegare" },
    { e: "💡", n: "Cervello", d: "40 senior + AD", ok: true, nota: demo ? "40 senior pronti (demo)" : c?.ai ? "AI accesa" : "40 senior pronti · AI da accendere" },
    { e: "🫀", n: "Battito", d: "lavora da solo, su orari", ok: demo || !!c?.vivo, nota: demo ? "autopilota ON (demo)" : c?.vivo ? `ultimo giro ${c.ultimoGiro ? "recente" : "—"} · worker ${c?.workerVivo ? "ON" : "spento"}` : "non ancora battuto" },
    { e: "✋", n: "Mani", d: "agisce nel mondo (email…)", ok: demo || !!(c?.maniEmail && c?.maniLive), nota: demo ? "simulate, 0 invii reali (demo)" : c?.maniEmail ? (c?.maniLive ? "email LIVE" : "email pronta (test)") : "da collegare" },
    { e: "🛡️", n: "Freni", d: "🟢🟡🔴 + tetti + STOP", ok: true, nota: "attivi" },
    { e: "🎛️", n: "Cabina", d: "tu vedi e approvi", ok: true, nota: "attiva" },
    { e: "🔁", n: "Apprendimento", d: "impara dai propri errori", ok: true, nota: demo ? "lezioni attive (demo)" : "lezioni attive" },
  ];

  return (
    <section className="card p-4">
      <div className="sez-head mb-3">
        <span className="sez-ico"><Activity size={16} /></span>
        <span className="t-sez">Stato della macchina — gli 8 organi</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {organi.map((o) => (
          <div key={o.n} className={`rounded-xl border p-2.5 ${o.ok ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}`}>
            <div className="flex items-center gap-1.5">
              <span>{o.e}</span>
              <span className="text-[12.5px] font-semibold text-ink">{o.n}</span>
              <span className="ml-auto text-[12px]">{o.ok ? "✅" : "🟡"}</span>
            </div>
            <div className="t-eti mt-0.5">{o.d}</div>
            <div className="text-[11px] mt-0.5 text-black/55">{o.nota}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
