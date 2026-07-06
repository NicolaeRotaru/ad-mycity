"use client";

import { useEffect, useState } from "react";
import { Cpu, Microscope } from "lucide-react";
import RadiografiaDiSe from "@/components/cervello/RadiografiaDiSe";
import AutoCoscienzaArea from "@/components/aree/AutoCoscienzaArea";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

type Pagina = "radiografia" | "auto-coscienza";

const PAGINE: { id: Pagina; label: string; icon: React.ReactNode }[] = [
  { id: "radiografia", label: "Radiografia", icon: <Cpu size={15} /> },
  { id: "auto-coscienza", label: "Auto-coscienza", icon: <Microscope size={15} /> },
];

export default function MacchinaArea() {
  const [pagina, setPagina] = useState<Pagina>("radiografia");

  // Ripristino della pagina col tasto INDIETRO: il popstate centrale (page.tsx) riemette
  // EVENTO_SUB per la vista "cervello"; qui riapriamo la pagina giusta. (contratto nav unico —
  // niente più #hash nell'URL, che era la fonte residua dei salti all'INDIETRO). (bug #2/#4)
  useEffect(() => {
    const onSub = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSub>).detail;
      if (det?.vista !== "cervello" || !det.sub) return;
      if (det.sub === "radiografia" || det.sub === "auto-coscienza") setPagina(det.sub);
    };
    window.addEventListener(EVENTO_SUB, onSub);
    return () => window.removeEventListener(EVENTO_SUB, onSub);
  }, []);

  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (!det?.vista) return;
      if (det.vista === "auto-coscienza" || det.vista === "memoria") {
        setPagina("auto-coscienza");
      } else if (det.vista === "cervello") {
        setPagina(det.sub === "auto-coscienza" ? "auto-coscienza" : "radiografia");
      }
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 La macchina</h2>
        <p className="t-eti mt-0.5">
          Radiografia architetturale e auto-coscienza — due pagine distinte, stesso reparto.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PAGINE.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPagina(p.id);
              // Voce di cronologia PULITA (vaiSub fonde lo state di Next, niente #hash nell'URL):
              // l'INDIETRO torna alla pagina precedente invece di ricaricare/saltare. (bug #2/#4)
              vaiSub("cervello", p.id);
            }}
            className={`nav-tab ${pagina === p.id ? "nav-tab-active" : ""}`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {pagina === "radiografia" ? (
        <div className="space-y-3">
          <p className="t-eti">
            Analisi a 12 dimensioni: difetti, cantiere, lettera a Nicola e andamento nel tempo.
          </p>
          <RadiografiaDiSe />
        </div>
      ) : (
        <AutoCoscienzaArea embedded />
      )}
    </div>
  );
}
