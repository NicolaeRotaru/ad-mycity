"use client";

// Hook client per la FONTE UNICA DELLA VERITÀ (registro-fatti.json), servita da /api/memoria/fatti.
// Ogni scheda che mostra un fatto DECISO (negozio faro, date, target, strategia) può leggerlo da qui
// con `byId(...)` invece di ri-parsare la prosa di STATO/intenzioni: una casa sola, niente divergenze.
// Si aggiorna con la rete-sync del Pannello + poll 60s, così una correzione registrata compare da sé.

import { useCallback, useEffect, useState } from "react";
import { usePanelRefresh } from "@/lib/panel-sync";
import type { StatoCoerenza } from "@/lib/badge-coerenza";

export type Fatto = { id: string; nome: string; valore: string; fonte: string; aggiornato: string };
// AR-646 — il tipo dichiara TUTTI gli stati che il guardiano sa scrivere, «sconosciuto» compreso.
// Finché diceva `"ok" | "incoerenze"`, anche il tipo raccontava che gli altri due non esistevano.
export type CoerenzaFatti = { esito: StatoCoerenza; incoerenze: number; cacce_aperte: number; data: string };
export type FattiData = { collegato: boolean; aggiornato: string; fatti: Fatto[]; coerenza: CoerenzaFatti | null };

const VUOTO: FattiData = { collegato: false, aggiornato: "", fatti: [], coerenza: null };

export function useFatti() {
  const [data, setData] = useState<FattiData>(VUOTO);
  const [caricato, setCaricato] = useState(false);

  const carica = useCallback(() => {
    void fetch("/api/memoria/fatti", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: FattiData) => {
        setData(d && Array.isArray(d.fatti) ? d : VUOTO);
        setCaricato(true);
      })
      .catch(() => setCaricato(true));
  }, []);

  useEffect(() => {
    carica();
  }, [carica]);

  // Stessa rete-sync delle altre schede-memoria + poll di sicurezza.
  usePanelRefresh(["memoria", "azioni", "all"], carica, 60_000);

  const byId = useCallback((id: string) => data.fatti.find((f) => f.id === id) || null, [data.fatti]);

  return { ...data, caricato, byId, ricarica: carica };
}
