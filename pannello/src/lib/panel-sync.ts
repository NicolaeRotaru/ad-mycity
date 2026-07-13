// Rete di sincronizzazione del Pannello — fonte unica lato browser.
// Quando un dato cambia (azione firmata, fix radiografia, lavoro finito), TUTTE le caselle
// collegate si aggiornano subito, non dopo 30–60s di polling isolato.
// Estende il pattern esistente mycity:lavori / mycity:conversazioni.

import { useEffect, useRef } from "react";

export type SyncScope =
  | "azioni" // AZIONI-IN-ATTESA + decisioni Supabase
  | "radiografia" // auto-radiografia, cantiere-difetti, auto-coscienza
  | "memoria" // STATO, briefing, intenzioni, todo, avvisi
  | "lavori" // coda lavori worker
  | "all";

export const EVENTO_SYNC = "mycity:sync";

export type DettaglioSync = { scope: SyncScope; origine?: string };

/** Emette un segnale di refresh verso tutte le caselle che ascoltano questo scope. */
export function emitSync(scope: SyncScope = "all", origine?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DettaglioSync>(EVENTO_SYNC, { detail: { scope, origine } }));
  if (scope === "lavori" || scope === "all") {
    window.dispatchEvent(new Event("mycity:lavori"));
  }
}

function scopeMatch(wanted: SyncScope[], incoming: SyncScope): boolean {
  if (incoming === "all" || wanted.includes("all")) return true;
  return wanted.includes(incoming);
}

/**
 * Ascolta la rete di sync e richiama onRefresh quando arriva un evento rilevante.
 * Usare con onRefresh wrappato in useCallback per evitare re-subscribe inutili.
 */
export function usePanelSync(scopes: SyncScope[], onRefresh: () => void) {
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;
  const key = scopes.join(",");

  useEffect(() => {
    const handler = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSync>).detail;
      const scope = det?.scope ?? "all";
      if (scopeMatch(scopes, scope)) cbRef.current();
    };
    window.addEventListener(EVENTO_SYNC, handler);
    return () => window.removeEventListener(EVENTO_SYNC, handler);
  }, [key]);
}
