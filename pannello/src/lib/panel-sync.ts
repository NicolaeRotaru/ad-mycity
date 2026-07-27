// Rete di sincronizzazione del Pannello — fonte unica lato browser.
// Quando un dato cambia (azione firmata, fix radiografia, lavoro finito), TUTTE le caselle
// collegate si aggiornano subito, non dopo 30–60s di polling isolato.
// Estende il pattern esistente mycity:lavori / mycity:conversazioni.

import { useCallback, useEffect, useRef, useState } from "react";
import { istante } from "@/lib/format";
import {
  type SyncScope as SyncScopeBase,
  type LavoroSync,
  scopesDaLavoro,
  scopesDaRinfrescare,
  deveRinfrescareAlRitorno,
  RITORNO_MIN_MS,
} from "@/lib/panel-sync-regole";

// Riesportate: le caselle continuano a importarle da qui, il file puro e' un dettaglio interno.
export { scopesDaLavoro, scopesDaRinfrescare, deveRinfrescareAlRitorno, RITORNO_MIN_MS };
export type { LavoroSync };

export type SyncScope = SyncScopeBase;

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

/**
 * Polling + rete sync + ripasso al ritorno sulla scheda.
 *
 * AR-235 (seconda metà): mancava proprio il ripasso al ritorno. `focus`/`visibilitychange` erano
 * agganciati solo alla chat e all'area Azioni, quindi dieci caselle — Bacheca, Documenti, Arsenale,
 * Intelligence, Autopilota, Lettera AD, Numeri, Stato macchina, Volano, Esplora GitHub — restavano
 * ferme a com'erano quando avevi lasciato la pagina. Agganciandolo QUI lo ereditano tutte quelle che
 * già usano questo hook, invece di rattoppare dieci componenti uno per uno (e dimenticarne il
 * prossimo che verrà aggiunto).
 */
export function usePanelRefresh(scopes: SyncScope[], carica: () => void, pollMs?: number) {
  usePanelSync(scopes, carica);
  const ultimoRef = useRef<number | null>(null);

  const caricaEsegna = useCallback(() => {
    ultimoRef.current = Date.now();
    carica();
  }, [carica]);

  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const id = setInterval(caricaEsegna, pollMs);
    return () => clearInterval(id);
  }, [pollMs, caricaEsegna]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const alRitorno = () => {
      if (document.visibilityState === "hidden") return;
      if (!deveRinfrescareAlRitorno(ultimoRef.current, Date.now())) return;
      caricaEsegna();
    };
    document.addEventListener("visibilitychange", alRitorno);
    window.addEventListener("focus", alRitorno);
    return () => {
      document.removeEventListener("visibilitychange", alRitorno);
      window.removeEventListener("focus", alRitorno);
    };
  }, [caricaEsegna]);
}

/** Dopo un lavoro finito: propaga il refresh a tutte le caselle collegate. */
export function emitSyncDaLavoriFiniti(prev: LavoroSync[], next: LavoroSync[]) {
  if (typeof window === "undefined") return;
  const scopes = scopesDaRinfrescare(prev, next);
  if (scopes.length === 0) return;
  if (scopes.length >= 3) {
    emitSync("all", "lavoro:finito");
    return;
  }
  for (const s of scopes) emitSync(s, "lavoro:finito");
}

/** Ultimo briefing del giro (fonte: /api/stato → vault + Supabase). */
export type BriefingVivo = {
  situazione: string;
  opportunita: { titolo: string; motivo: string; impatto: string; sforzo: string }[];
  azioni: { titolo: string; motivo: string; livello: string }[];
};

export async function fetchBriefingVivo(): Promise<{ briefing: BriefingVivo | null; ultimoAt: string | null }> {
  try {
    const res = await fetch("/api/stato", { cache: "no-store" });
    const data = await res.json();
    if (data?.ultimo?.data) {
      return { briefing: data.ultimo.data as BriefingVivo, ultimoAt: data.ultimo.created_at || null };
    }
  } catch {
    /* offline */
  }
  return { briefing: null, ultimoAt: null };
}

/** Briefing/proposte del giro collegati alla rete sync (non dipendono dalla pagina madre). */
export function useBriefingVivo() {
  const [briefing, setBriefing] = useState<BriefingVivo | null>(null);
  const [ultimoAt, setUltimoAt] = useState<string | null>(null);
  const carica = useCallback(() => {
    void fetchBriefingVivo().then(({ briefing: b, ultimoAt: at }) => {
      setBriefing(b);
      setUltimoAt(at);
    });
  }, []);
  useEffect(() => { carica(); }, [carica]);
  usePanelSync(["memoria", "azioni", "lavori", "radiografia", "all"], carica);
  return { briefing, ultimoAt, ultimoLabel: ultimoAt ? istante(ultimoAt) : null, ricarica: carica };
}
