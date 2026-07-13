"use client";

import RadiografiaMarketplace from "@/components/cervello/RadiografiaMarketplace";

/** Salute sito — audit del marketplace, voce menu dedicata. */
export default function SaluteSitoArea() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="t-area">🏪 Salute sito</h2>
        <p className="t-eti mt-0.5">Audit del marketplace: cosa non va sul sito e cosa fare prima.</p>
      </div>
      <RadiografiaMarketplace />
    </div>
  );
}
