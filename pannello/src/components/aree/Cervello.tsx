"use client";

import { useEffect, useState } from "react";
import {
  Cpu, Microscope, GraduationCap, Rocket,
} from "lucide-react";
import { EVENTO_VAI, type DettaglioVai } from "@/lib/nav";
import AutoCoscienza from "@/components/AutoCoscienza";
import RadiografiaDiSe from "@/components/cervello/RadiografiaDiSe";

type SezioneCervello = "radiografia" | "analisi" | "apprendimento" | "miglioramento";

const SEZIONI: { id: SezioneCervello; label: string; icon: React.ReactNode }[] = [
  { id: "radiografia", label: "Radiografia", icon: <Cpu size={15} /> },
  { id: "analisi", label: "Auto-analisi", icon: <Microscope size={15} /> },
  { id: "apprendimento", label: "Apprendimento", icon: <GraduationCap size={15} /> },
  { id: "miglioramento", label: "Auto-miglioramento", icon: <Rocket size={15} /> },
];

export default function Cervello() {
  const [sezione, setSezione] = useState<SezioneCervello>("radiografia");

  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "cervello") return;
      const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
      if (hash === "auto-radiografia" || det.sub === "dimensioni" || det.sub === "cantiere" || det.sub === "lettera" || det.sub === "storico") {
        setSezione("radiografia");
        return;
      }
      if (hash === "auto-coscienza" || det.sub === "analisi") setSezione("analisi");
      else if (det.sub === "apprendimento") setSezione("apprendimento");
      else if (det.sub === "miglioramento") setSezione("miglioramento");
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash === "auto-coscienza") setSezione("analisi");
    if (hash === "auto-radiografia") setSezione("radiografia");
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 Cervello — la macchina su sé stessa</h2>
        <p className="t-eti mt-0.5">Radiografia architetturale, auto-analisi del lavoro, apprendimento e miglioramento continuo.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SEZIONI.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSezione(s.id);
              if (typeof window !== "undefined") {
                window.location.hash = s.id === "radiografia" ? "auto-radiografia" : s.id === "analisi" ? "auto-coscienza" : s.id;
              }
            }}
            className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition ${
              sezione === s.id ? "bg-brand text-white" : "bg-white text-black/60 ring-1 ring-black/[0.06] hover:bg-black/[0.03]"
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {sezione === "radiografia" && <RadiografiaDiSe />}
      {sezione !== "radiografia" && (
        <AutoCoscienza
          fixedTab={sezione}
          hideSwitcher
        />
      )}
    </div>
  );
}
