"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, ListTodo, Archive } from "lucide-react";
import LavoriCervello from "@/components/LavoriCervello";
import DiagnosticaWorker from "@/components/DiagnosticaWorker";
import type { LavoroBase } from "@/lib/lavori-gruppo";
import { EVENTO_SUB, vaiSub, type DettaglioSub } from "@/lib/nav";

type Tab = "coda" | "archivio";

type Props = {
  lavori: LavoroBase[];
  onSvuota: () => void;
  workerVivo?: boolean | null;
  adInPausa?: boolean;
};

export default function Lavori({ lavori, onSvuota, workerVivo, adInPausa }: Props) {
  const [tab, setTab] = useState<Tab>("coda");

  // Sincronizza la scheda col tasto INDIETRO: ogni click di scheda timbra una voce di
  // cronologia (pushState, non più hash) e il popstate centrale riemette EVENTO_SUB che
  // qui riapre la scheda precedente, non la Plancia. (contratto nav)
  useEffect(() => {
    const onSub = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSub>).detail;
      if (det?.vista !== "lavori" || !det.sub) return;
      if (det.sub === "coda" || det.sub === "archivio") setTab(det.sub);
    };
    window.addEventListener(EVENTO_SUB, onSub);
    return () => window.removeEventListener(EVENTO_SUB, onSub);
  }, []);

  const filtrati = useMemo(() => {
    if (tab === "coda") return lavori.filter((l) => l.stato === "in_attesa" || l.stato === "in_corso");
    return lavori.filter((l) => l.stato === "fatto" || l.stato === "errore");
  }, [lavori, tab]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; n: number }[] = [
    { id: "coda", label: "In coda", icon: <ListTodo size={14} />, n: lavori.filter((l) => l.stato === "in_attesa" || l.stato === "in_corso").length },
    { id: "archivio", label: "Archivio", icon: <Archive size={14} />, n: lavori.filter((l) => l.stato === "fatto" || l.stato === "errore").length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">🧠 Lavori del cervello</h2>
          <p className="t-eti mt-0.5">
            Coda e storico dei compiti che l&apos;AD esegue sul tuo Max. Ogni conversazione è un gruppo collassabile — usa <b>Chat</b> per riaprirla nell&apos;Assistente.
          </p>
        </div>
        {lavori.length > 0 && (
          <button
            type="button"
            onClick={onSvuota}
            className="shrink-0 text-xs text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 inline-flex items-center gap-1 transition mt-1"
          >
            <Archive size={12} /> Svuota tutto
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              vaiSub("lavori", t.id); // voce di cronologia per la scheda (contratto nav)
            }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
            }`}
          >
            {t.icon}
            {t.label}
            {t.n > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${tab === t.id ? "bg-white/20" : "bg-black/5 dark:bg-white/10"}`}>
                {t.n}
              </span>
            )}
          </button>
        ))}
      </div>

      <DiagnosticaWorker />

      <LavoriCervello lavori={filtrati} onSvuota={onSvuota} embedded workerVivo={workerVivo} adInPausa={adInPausa} />
    </div>
  );
}
