"use client";

import CuoreMacchina from "@/components/CuoreMacchina";
import StatoMacchina from "@/components/StatoMacchina";
import RadiografiaDiSe from "@/components/cervello/RadiografiaDiSe";

/** Radiografia macchina: organi grandi + report sotto, senza tab esterne. */
export default function RadiografiaMacchinaArea() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🩻 Radiografia macchina</h2>
        <p className="t-eti mt-0.5">Cuore, organi e referto strutturale — tutto in una pagina.</p>
      </div>
      <CuoreMacchina />
      <StatoMacchina />
      <RadiografiaDiSe />
    </div>
  );
}
