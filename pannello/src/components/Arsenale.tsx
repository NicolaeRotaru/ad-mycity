"use client";

import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import { istante } from "@/lib/format";

type PB = {
  id: string;
  leva: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  cadenza: "giornaliero" | "settimanale";
  livello: "verde" | "giallo" | "rosso";
  ultimo: string | null;
};

const dot = (l: string) => (l === "rosso" ? "bg-red-500" : l === "giallo" ? "bg-amber-500" : "bg-green-500");

// 🗡️ L'arsenale: i playbook delle leve dietro le quinte e quando sono partiti.
export default function Arsenale() {
  const [pb, setPb] = useState<PB[] | null>(null);
  const [aperto, setAperto] = useState(false);
  useEffect(() => {
    fetch("/api/playbook", { cache: "no-store" }).then((r) => r.json()).then((d) => setPb(d.playbook || [])).catch(() => setPb([]));
  }, []);
  if (!pb) return null;
  const partitiOggi = pb.filter((p) => p.ultimo).length;

  return (
    <section className="card p-4">
      <button onClick={() => setAperto((v) => !v)} className="w-full flex items-center gap-2.5 text-left">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Swords size={16} />
        </span>
        <div className="min-w-0">
          <div className="t-sez">Arsenale — le leve dietro le quinte</div>
          <div className="t-eti">{pb.length} playbook · {partitiOggi} partiti oggi</div>
        </div>
        <span className="ml-auto t-eti">{aperto ? "nascondi" : "mostra"}</span>
      </button>

      {aperto && (
        <div className="mt-3 space-y-1.5">
          {pb.map((p) => (
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
          <p className="t-eti pt-1">
            I playbook <b>preparano e accodano</b> le mosse al cervello (gratis). La scrittura vera la fa l'AD quando fai il giro
            (Max) o l'AI a contagocce. Le azioni finiscono nella corsia qui sopra, col loro colore 🟢🟡🔴.
          </p>
        </div>
      )}
    </section>
  );
}
