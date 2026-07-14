"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, LineChart } from "lucide-react";
import NumeriReport from "@/components/NumeriReport";
import Aggiornato from "@/components/Aggiornato";
import { EVENTO_SUB, EVENTO_VAI, vaiSub, consumaSubPendente, type DettaglioSub, type DettaglioVai } from "@/lib/nav";

type Tab = "cockpit" | "analisi";

function parseNumeriSub(sub?: string): Tab {
  if (sub === "analisi" || sub === "report" || sub === "numeri-report") return "analisi";
  return "cockpit";
}

export default function NumeriArea({
  cockpit,
  aggAt,
}: {
  cockpit: ReactNode;
  aggAt: number | null;
}) {
  const [tab, setTab] = useState<Tab>("cockpit");

  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "numeri" || !det.sub) return;
      setTab(parseNumeriSub(det.sub));
    };
    const pend = consumaSubPendente("numeri");
    if (pend) setTab(parseNumeriSub(pend));
    const onSub = (e: Event) => applica((e as CustomEvent<DettaglioSub>).detail);
    const onVai = (e: Event) => applica((e as CustomEvent<DettaglioVai>).detail);
    window.addEventListener(EVENTO_SUB, onSub);
    window.addEventListener(EVENTO_VAI, onVai);
    return () => {
      window.removeEventListener(EVENTO_SUB, onSub);
      window.removeEventListener(EVENTO_VAI, onVai);
    };
  }, []);

  const schede: { id: Tab; titolo: string; sottotitolo: string; icon: ReactNode }[] = [
    {
      id: "cockpit",
      titolo: "Tutti i numeri",
      sottotitolo: "KPI per categoria — oggi, 7 e 30 giorni",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "analisi",
      titolo: "Analisi & report",
      sottotitolo: "Trend, funnel, unit economics e report dell'AD",
      icon: <LineChart size={18} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">📊 I numeri dell&apos;azienda</h2>
          <p className="t-eti mt-0.5">Scegli cosa guardare: il cockpit dei KPI oppure le analisi e i report.</p>
        </div>
        <Aggiornato at={aggAt} className="mt-1 shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schede.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setTab(s.id);
              vaiSub("numeri", s.id);
            }}
            className={`card-priorita text-left transition ${
              tab === s.id ? "border-brand/40 ring-1 ring-brand/25 bg-brand-50/30" : "hover:border-brand/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="sez-ico">{s.icon}</span>
              <span className="t-sez">{s.titolo}</span>
            </div>
            <p className="t-eti mt-2 pl-[42px]">{s.sottotitolo}</p>
          </button>
        ))}
      </div>

      {tab === "cockpit" ? cockpit : <NumeriReport />}
    </div>
  );
}
