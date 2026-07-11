"use client";

import { useEffect, useState } from "react";
import { Cpu, Microscope, Store } from "lucide-react";
import RadiografiaDiSe from "@/components/cervello/RadiografiaDiSe";
import RadiografiaMarketplace from "@/components/cervello/RadiografiaMarketplace";
import AutoCoscienzaArea from "@/components/aree/AutoCoscienzaArea";
import { EVENTO_VAI, EVENTO_SUB, vaiSub, consumaSubPendente, type DettaglioVai, type DettaglioSub } from "@/lib/nav";

// Le pagine del reparto «La macchina»: la radiografia della MACCHINA (l'AD stessa — agenti,
// prompt, sensori, memoria; il worker sul VPS è solo il suo braccio), la radiografia del
// MARKETPLACE (l'audit profondo del sito) e l'auto-coscienza.
type Pagina = "radiografia" | "marketplace" | "auto-coscienza";
const PAGINE_VALIDE: Pagina[] = ["radiografia", "marketplace", "auto-coscienza"];

const PAGINE: { id: Pagina; label: string; icon: React.ReactNode }[] = [
  { id: "radiografia", label: "Radiografia macchina", icon: <Cpu size={15} /> },
  { id: "marketplace", label: "Radiografia marketplace", icon: <Store size={15} /> },
  { id: "auto-coscienza", label: "Auto-coscienza", icon: <Microscope size={15} /> },
];

export default function MacchinaArea() {
  const [pagina, setPagina] = useState<Pagina>("radiografia");

  // Ripristino della pagina col tasto INDIETRO: il popstate centrale (page.tsx) riemette
  // EVENTO_SUB per la vista "cervello"; qui riapriamo la pagina giusta. (contratto nav unico —
  // niente più #hash nell'URL, che era la fonte residua dei salti all'INDIETRO). (bug #2/#4)
  useEffect(() => {
    // Al MOUNT consuma la pagina parcheggiata (INDIETRO scattato prima che l'area fosse montata).
    const pend = consumaSubPendente("cervello");
    if (PAGINE_VALIDE.includes(pend as Pagina)) setPagina(pend as Pagina);
    const onSub = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSub>).detail;
      if (det?.vista !== "cervello" || !det.sub) return;
      if (PAGINE_VALIDE.includes(det.sub as Pagina)) setPagina(det.sub as Pagina);
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
        setPagina(PAGINE_VALIDE.includes(det.sub as Pagina) ? (det.sub as Pagina) : "radiografia");
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
          Radiografia della macchina, radiografia del marketplace e auto-coscienza — tre pagine distinte, stesso reparto.
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

      {pagina === "radiografia" && (
        <div className="space-y-3">
          <p className="t-eti">
            La macchina (l&apos;AD: agenti, prompt, sensori, memoria) analizza sé stessa a 12 dimensioni: difetti, cantiere, lettera a Nicola e andamento nel tempo.
          </p>
          <RadiografiaDiSe />
        </div>
      )}
      {pagina === "marketplace" && (
        <div className="space-y-3">
          <p className="t-eti">
            L&apos;audit profondo del SITO mycity a 13 dimensioni (sola lettura, ogni problema verificato): architettura, sicurezza, RLS, pagamenti, privacy, performance, UX, a11y, QA, API, AI, dati e deploy.
          </p>
          <RadiografiaMarketplace />
        </div>
      )}
      {pagina === "auto-coscienza" && <AutoCoscienzaArea embedded />}
    </div>
  );
}
