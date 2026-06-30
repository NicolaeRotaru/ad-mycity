// Segnali vitali dell'AD: unifica cuore cron, giro VPS, worker e push memoria-ad.
import { vaultToIso } from "@/lib/format";
import { getImpostazione } from "@/lib/store";
import { readVaultFile } from "@/lib/vault";

export type SegnaleBattito = { quando: string; ms: number; fonte: string };

/** Millisecondi da stringa vault (Piacenza) o ISO con fuso. */
export function parseQuandoMs(s: string | null | undefined): number | null {
  if (!s?.trim()) return null;
  const raw = s.trim();
  const iso = /[zZ]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw) ? raw : vaultToIso(raw);
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

/** Ore trascorse da un timestamp (vault o ISO). */
export function oreDaQuando(s: string | null | undefined): number | null {
  const ms = parseQuandoMs(s);
  if (ms == null) return null;
  return (Date.now() - ms) / 3600000;
}

export function etaOre(ore: number | null): string {
  if (ore == null) return "mai";
  const abs = Math.abs(ore);
  if (abs < 1) return `${Math.round(abs * 60)} min fa`;
  if (abs < 48) return `${Math.round(abs)} h fa`;
  return `${Math.round(abs / 24)} giorni fa`;
}

function segnale(quando: string | null | undefined, fonte: string): SegnaleBattito | null {
  const ms = parseQuandoMs(quando);
  if (ms == null || !quando) return null;
  return { quando, ms, fonte };
}

function piuFresco(...lista: (SegnaleBattito | null)[]): SegnaleBattito | null {
  return lista.filter((s): s is SegnaleBattito => s != null).sort((a, b) => b.ms - a.ms)[0] ?? null;
}

/** Legge tutti i battiti e sceglie il più utile per la UI. */
export async function raccogliSegnaliBattito(): Promise<{
  ultimoGiro: SegnaleBattito | null;
  autopilotaCron: SegnaleBattito | null;
  worker: SegnaleBattito | null;
  pushMemoria: SegnaleBattito | null;
  eseguiteAutopilota: number;
}> {
  const [cuoreUltimo, cuoreGiro, push, workerUltimo, eseguite] = await Promise.all([
    getImpostazione("cuore:ultimo").catch(() => null),
    getImpostazione("cuore:ultimo_giro").catch(() => null),
    getImpostazione("memoria-ad:ultimo_push").catch(() => null),
    getImpostazione("worker:ultimo").catch(() => null),
    getImpostazione("cuore:eseguite").catch(() => null),
  ]);

  let briefingData: string | null = null;
  const raw = await readVaultFile("90-Memoria-AI/ultimo-briefing.json").catch(() => null);
  if (raw) {
    try {
      briefingData = JSON.parse(raw)?.data ?? null;
    } catch {
      /* json rotto */
    }
  }

  const autopilotaCron = segnale(cuoreUltimo, "autopilota Vercel");
  const pushMemoria = segnale(push, "push memoria-ad");
  const worker = segnale(workerUltimo, "worker VPS");
  const daBriefing = segnale(briefingData, "giro AD (briefing)");
  const daGiroKey = segnale(cuoreGiro, "giro AD (VPS)");

  // Il cuore mostra l'ultimo giro reale: briefing vault > push > chiave dedicata.
  const ultimoGiro = piuFresco(daBriefing, pushMemoria, daGiroKey);

  return {
    ultimoGiro,
    autopilotaCron,
    worker,
    pushMemoria,
    eseguiteAutopilota: Number(eseguite ?? 0) || 0,
  };
}

/** Macchina «viva» se worker attivo o giro recente (< 26h). */
export function macchinaViva(segnali: Awaited<ReturnType<typeof raccogliSegnaliBattito>>): boolean {
  const oreWorker = oreDaQuando(segnali.worker?.quando);
  if (oreWorker != null && oreWorker <= 0.1) return true;
  const oreGiro = oreDaQuando(segnali.ultimoGiro?.quando);
  return oreGiro != null && oreGiro <= 26;
}
