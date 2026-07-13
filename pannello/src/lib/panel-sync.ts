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

/** Polling + rete sync: una sola riga per caselle che già hanno `carica` + setInterval. */
export function usePanelRefresh(scopes: SyncScope[], carica: () => void, pollMs?: number) {
  usePanelSync(scopes, carica);
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const id = setInterval(carica, pollMs);
    return () => clearInterval(id);
  }, [pollMs, carica]);
}

type LavoroSync = { id: string; stato: string; tipo?: string };

/** Quali scope aggiornare quando un lavoro del worker passa a «fatto». */
export function scopesDaLavoro(tipo: string): SyncScope[] {
  const t = (tipo || "").toLowerCase();
  if (/esegui-azione|rifiuta-azione/.test(t)) return ["azioni", "radiografia", "memoria"];
  if (/giro|briefing|radiografia|auto-coscienza/.test(t)) return ["memoria", "azioni", "radiografia"];
  if (/supervisione|marketplace|negozi/.test(t)) return ["memoria", "azioni"];
  return ["memoria"];
}

/** Dopo un lavoro finito: propaga il refresh a tutte le caselle collegate. */
export function emitSyncDaLavoriFiniti(prev: LavoroSync[], next: LavoroSync[]) {
  if (typeof window === "undefined") return;
  const was = new Map(prev.map((l) => [l.id, l.stato]));
  const scopes = new Set<SyncScope>();
  for (const l of next) {
    const prima = was.get(l.id);
    if (!prima || prima === "fatto" || l.stato !== "fatto") continue;
    for (const s of scopesDaLavoro(l.tipo || "")) scopes.add(s);
  }
  if (scopes.size === 0) return;
  if (scopes.size >= 3) {
    emitSync("all", "lavoro:finito");
    return;
  }
  for (const s of scopes) emitSync(s, "lavoro:finito");
}
