"use client";

import { useEffect, useState } from "react";
import { BookOpen, Gauge, ScrollText } from "lucide-react";
import QuaderniSenior from "@/components/QuaderniSenior";
import GovernoAD from "@/components/GovernoAD";
import StatoNumeriVault from "@/components/StatoNumeriVault";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

export type StoricoTab = "decisioni" | "quaderni-senior" | "stato-numeri";

const STORICO_SUB_PREFIX = "storico-";

export function parseStoricoSub(sub?: string): StoricoTab {
  if (!sub) return "decisioni";
  if (sub === "storico") return "decisioni";
  if (sub.startsWith(STORICO_SUB_PREFIX)) {
    const inner = sub.slice(STORICO_SUB_PREFIX.length) as StoricoTab;
    if (inner === "decisioni" || inner === "quaderni-senior" || inner === "stato-numeri") return inner;
  }
  // Legacy: quaderni era tab diretta in Memoria
  if (sub === "quaderni-senior") return "quaderni-senior";
  return "decisioni";
}

export function storicoSubId(tab: StoricoTab): string {
  return `${STORICO_SUB_PREFIX}${tab}`;
}

export default function StoricoMemoria() {
  const [tab, setTab] = useState<StoricoTab>("decisioni");

  useEffect(() => {
    const applica = (det: { vista?: string; sub?: string } | undefined) => {
      if (det?.vista !== "memoria" || !det.sub) return;
      const parsed = parseStoricoSub(det.sub);
      if (det.sub === "storico" || det.sub.startsWith(STORICO_SUB_PREFIX) || det.sub === "quaderni-senior") {
        setTab(parsed);
      }
    };
    const pend = consumaSubPendente("memoria");
    if (pend && (pend === "storico" || pend.startsWith(STORICO_SUB_PREFIX) || pend === "quaderni-senior")) {
      setTab(parseStoricoSub(pend));
    }
    const onSub = (e: Event) => applica((e as CustomEvent<DettaglioSub>).detail);
    const onVai = (e: Event) => applica((e as CustomEvent<DettaglioVai>).detail);
    window.addEventListener(EVENTO_SUB, onSub);
    window.addEventListener(EVENTO_VAI, onVai);
    return () => {
      window.removeEventListener(EVENTO_SUB, onSub);
      window.removeEventListener(EVENTO_VAI, onVai);
    };
  }, []);

  const tabs: { id: StoricoTab; label: string; icon: React.ReactNode }[] = [
    { id: "decisioni", label: "Decisioni", icon: <ScrollText size={14} /> },
    { id: "quaderni-senior", label: "Quaderni senior", icon: <BookOpen size={14} /> },
    { id: "stato-numeri", label: "Stato & numeri", icon: <Gauge size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <p className="t-eti">Cronologia e riferimenti: cosa è stato deciso, cosa hanno imparato i senior, numeri e piani del vault.</p>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              vaiSub("memoria", storicoSubId(t.id));
            }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "nav-tab-active bg-brand text-white shadow-card" : "nav-tab"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      {tab === "decisioni" && <GovernoAD variant="decisioni" />}
      {tab === "quaderni-senior" && <QuaderniSenior />}
      {tab === "stato-numeri" && <StatoNumeriVault />}
    </div>
  );
}
