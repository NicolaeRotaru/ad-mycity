"use client";

import { useEffect, useState } from "react";

// 🕗 Ora in cui la casella è comparsa/aggiornata nel Pannello, catturata SOLO lato
// client dopo il mount. Serve alla chip <Aggiornato/> per mostrare giorno+ora su
// ogni casella (regola dell'orario del mansionario) quando la casella non ha una
// data-dato propria. Perché in useEffect e non al render: l'ora del server e
// quella del browser differiscono → un valore preso al render darebbe un errore
// di hydration di Next.js. Finché è null, <Aggiornato/> non mostra nulla.
export function useCaricato(): string | null {
  const [at, setAt] = useState<string | null>(null);
  useEffect(() => {
    setAt(new Date().toISOString());
  }, []);
  return at;
}
