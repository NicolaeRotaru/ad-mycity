"use client";

import { useEffect, useState } from "react";
import { Microscope, GraduationCap, Rocket } from "lucide-react";
import AutoCoscienza from "@/components/AutoCoscienza";
import { EVENTO_VAI, type DettaglioVai } from "@/lib/nav";

type Tab = "analisi" | "apprendimento" | "miglioramento";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "analisi", label: "Auto-analisi", icon: <Microscope size={15} /> },
  { id: "apprendimento", label: "Apprendimento", icon: <GraduationCap size={15} /> },
  { id: "miglioramento", label: "Auto-miglioramento", icon: <Rocket size={15} /> },
];

export default function AutoCoscienzaArea({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>("analisi");

  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "auto-coscienza" && det?.vista !== "memoria") return;
      const valide: Tab[] = ["analisi", "apprendimento", "miglioramento"];
      if (det.sub && valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
      else if (det.vista === "auto-coscienza" || det.sub === "analisi") setTab("analisi");
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  return (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h2 className="t-area">🔬 Auto-coscienza della macchina</h2>
          <p className="t-eti mt-0.5">Come l&apos;AD si controlla, impara e migliora — ogni scheda è una pagina dedicata.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            // Tab interne di 3° livello: stato locale, niente #hash nell'URL (era una fonte
            // residua di salti col tasto INDIETRO). La navigazione tra aree resta sul contratto nav.
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition ${
              tab === t.id ? "nav-tab-active bg-brand text-white" : "nav-tab"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AutoCoscienza fixedTab={tab} hideSwitcher />
    </div>
  );
}
