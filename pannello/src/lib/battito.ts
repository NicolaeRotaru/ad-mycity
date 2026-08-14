// Segnali vitali dell'AD: unifica cuore cron, giro VPS, worker e push della memoria.
import { vaultToIso } from "@/lib/format";
import { type SegnaleGiro, segnaleGiroDaJson, verdettoUltimoGiro } from "@/lib/memoria-ferma";
import { getImpostazione } from "@/lib/store";
import { readVaultFile } from "@/lib/vault";

export type SegnaleBattito = { quando: string; ms: number; fonte: string };

/** Dove il giro scrive com'è andato. AR-367: fino a oggi questo file non lo apriva nessuno. */
export const PERCORSO_ESITO_GIRO = "90-Memoria-AI/auto-coscienza/esito-giro.json";

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
  /** AR-367 — com'è andato l'ultimo giro. `null` = non l'ho potuto leggere, che non è «bene». */
  esitoGiro: SegnaleGiro | null;
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

  // AR-367 — il file che dice com'è andato il giro, finalmente aperto da qualcuno.
  const esitoGiro = segnaleGiroDaJson(await readVaultFile(PERCORSO_ESITO_GIRO).catch(() => null));

  const autopilotaCron = segnale(cuoreUltimo, "autopilota Vercel");
  const pushMemoria = segnale(push, "push memoria");
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
    esitoGiro,
  };
}

/**
 * Macchina «viva» se il worker sta battendo ADESSO, oppure se l'ultimo giro è recente E PULITO.
 *
 * AR-367 — prima la seconda condizione era solo «recente»: guardava SE un giro fosse avvenuto, mai
 * se fosse andato a buon fine. Per due giorni `esito-giro.json` ha detto `pulito: false, gate_rossi:
 * 2` e la home ha continuato a dire 🟢 Viva, perché nessun punto del codice apriva quel file. Un
 * giro che parte, trova due cancelli rossi e non consegna niente non è una macchina viva: è una
 * macchina che gira a vuoto — e chi legge la home deve poter distinguere le due cose.
 *
 * Il battito del worker resta una scorciatoia legittima: è un fatto misurato adesso, non un
 * racconto di com'è andata prima.
 */
export function macchinaViva(segnali: Awaited<ReturnType<typeof raccogliSegnaliBattito>>): boolean {
  const oreWorker = oreDaQuando(segnali.worker?.quando);
  if (oreWorker != null && oreWorker <= 0.1) return true;
  return verdettoUltimoGiro(oreDaQuando(segnali.ultimoGiro?.quando), segnali.esitoGiro ?? null).verde;
}

/**
 * La frase da mostrare accanto al pallino: dice sempre PERCHÉ, non solo se. «L'ultimo giro è finito
 * con 2 cancelli rossi» è un'informazione; un pallino verde non lo è.
 */
export function comeStaLaMacchina(segnali: Awaited<ReturnType<typeof raccogliSegnaliBattito>>): string {
  const oreWorker = oreDaQuando(segnali.worker?.quando);
  if (oreWorker != null && oreWorker <= 0.1) return "il worker sta lavorando adesso";
  return verdettoUltimoGiro(oreDaQuando(segnali.ultimoGiro?.quando), segnali.esitoGiro ?? null).frase;
}
