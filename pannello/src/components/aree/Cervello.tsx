"use client";

import RadiografiaDiSe from "@/components/cervello/RadiografiaDiSe";

export default function Cervello() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🧠 Cervello — radiografia della macchina</h2>
        <p className="t-eti mt-0.5">Analisi architetturale a 12 dimensioni: difetti, cantiere, lettera a Nicola e andamento nel tempo.</p>
      </div>
      <RadiografiaDiSe />
    </div>
  );
}
