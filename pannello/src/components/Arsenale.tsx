"use client";

import { useCallback, useEffect, useState } from "react";
import { Swords } from "lucide-react";
import { istante } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";

type PB = {
  id: string;
  forma: string;
  leva: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  cadenza: "giornaliero" | "settimanale";
  livello: "verde" | "giallo" | "rosso";
  ultimo: string | null;
  oggi: boolean;
};

const dot = (l: string) => (l === "rosso" ? "bg-red-500" : l === "giallo" ? "bg-amber-500" : "bg-green-500");

// 🗡️ L'arsenale: i playbook delle leve dietro le quinte e quando sono partiti.
export default function Arsenale() {
  const [pb, setPb] = useState<PB[] | null>(null);
  const [aperto, setAperto] = useState(false);
  const carica = useCallback(() => {
    fetch("/api/playbook", { cache: "no-store" }).then((r) => r.json()).then((d) => setPb(d.playbook || [])).catch(() => setPb([]));
  }, []);

  useEffect(() => { carica(); }, [carica]);
  usePanelSync(["memoria", "azioni", "all"], carica);
  if (!pb) return null;
  const partitiOggi = pb.filter((p) => p.oggi).length;
  // Raggruppa per FORMA DI DOMINIO, mantenendo l'ordine di comparsa.
  const forme: string[] = [];
  for (const p of pb) if (!forme.includes(p.forma)) forme.push(p.forma);

  return (
    <section className="card p-4">
      <button onClick={() => setAperto((v) => !v)} className="w-full flex items-center gap-2.5 text-left">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Swords size={16} />
        </span>
        <div className="min-w-0">
          <div className="t-sez">Arsenale — le leve dietro le quinte</div>
          <div className="t-eti">{forme.length} forme di dominio · {pb.length} playbook · {partitiOggi} partiti oggi</div>
        </div>
        <span className="ml-auto t-eti">{aperto ? "nascondi" : "mostra"}</span>
      </button>

      {aperto && (
        <div className="mt-3 space-y-3">
          {forme.map((forma) => (
            <div key={forma}>
              <div className="t-micro mb-1">{forma}</div>
              <div className="space-y-1.5">
                {pb.filter((p) => p.forma === forma).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-paper/40 px-2.5 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot(p.livello)}`} />
                    <span className="text-[15px] leading-none">{p.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium text-ink/90 truncate">{p.titolo}</div>
                      <div className="t-eti truncate">{p.leva} · {p.cadenza}</div>
                    </div>
                    <span className="t-eti shrink-0">
                      {p.ultimo ? `✅ ${istante(p.ultimo)}` : "in attesa"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="t-eti pt-1">
            Un playbook per <b>ogni forma di dominio</b>. <b>Preparano e accodano</b> le mosse al cervello (gratis); la scrittura vera
            la fa l'AD quando fai il giro (Max) o l'AI a contagocce. Le azioni finiscono nella corsia qui sopra, col colore 🟢🟡🔴.
          </p>
        </div>
      )}
    </section>
  );
}
