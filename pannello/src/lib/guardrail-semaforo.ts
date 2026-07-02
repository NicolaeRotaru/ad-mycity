// Cancello 🟢🟡🔴 — mirror TS del modulo cervello/guardrail-semaforo.mjs (stessa logica, zero drift).

export type Livello = "verde" | "giallo" | "rosso" | "?";

const CANALI_SENSIBILI =
  /stripe|payout|transfer|refund|rimborso|whatsapp|sms|deploy|produzione|ads|meta\s*ads|google\s*ads|contratto|firma\s+negozio/i;
const TESTO_SENSIBILE =
  /\b(payout|stripe|transfer|refund|rimborso|chargeback|iban|commissione|deploy|produzione|whatsapp|pubblica\s+su|spendi|budget\s+ads|messagg(?:io|i)\s+a\s+(?:il\s+)?negozio|email\s+a\s+[^@\s]+@)\b/i;
const DOMINI_INTERNI = /@(?:mycity|resend\.dev|example)/i;

export function parseLivello(raw?: string | null): Livello {
  const s = String(raw || "").toLowerCase();
  if (s.includes("🔴") || s === "rosso" || s === "red") return "rosso";
  if (s.includes("🟡") || s === "giallo" || s === "yellow") return "giallo";
  if (s.includes("🟢") || s === "verde" || s === "green") return "verde";
  return "?";
}

export function hasFirmaNicola(opts?: { firmaNicola?: boolean }): boolean {
  if (opts?.firmaNicola === true) return true;
  const v = process.env.NICOLA_FIRMA;
  return v === "1" || v === "on" || v === "true";
}

export function classificaRischio(ctx: {
  livello?: Livello | string;
  canale?: string;
  destinatario?: string;
  testo?: string;
  titolo?: string;
}): { livello: Livello; motivi: string[] } {
  const motivi: string[] = [];
  let livello = parseLivello(ctx.livello);
  const blob = [ctx.titolo, ctx.testo, ctx.canale, ctx.destinatario].filter(Boolean).join(" ");

  if (livello === "?") {
    if (blob.includes("🔴")) livello = "rosso";
    else if (blob.includes("🟡")) livello = "giallo";
    else if (blob.includes("🟢")) livello = "verde";
  }

  const canale = String(ctx.canale || "");
  if (CANALI_SENSIBILI.test(canale)) {
    if (livello !== "rosso") motivi.push(`canale sensibile: ${canale}`);
    livello = "rosso";
  }
  if (TESTO_SENSIBILE.test(blob)) {
    if (livello !== "rosso") motivi.push("contenuto sensibile");
    livello = "rosso";
  }

  const dest = String(ctx.destinatario || "").trim();
  if (dest && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest) && !DOMINI_INTERNI.test(dest)) {
    if (livello === "verde" || livello === "?") {
      motivi.push(`email esterna: ${dest}`);
      livello = "rosso";
    }
  }

  return { livello, motivi };
}

export type EsitoVerifica =
  | { ok: true; modalita: string; livello: Livello; firma: boolean; motivi: string[] }
  | {
      ok: false;
      bloccato: true;
      codice: string;
      livello: Livello;
      firma: boolean;
      motivi: string[];
      motivo: string;
    };

export function verificaEsecuzione(ctx: {
  live?: boolean;
  livello?: Livello | string;
  firmaNicola?: boolean;
  automatico?: boolean;
  canale?: string;
  destinatario?: string;
  testo?: string;
  titolo?: string;
}): EsitoVerifica {
  const live = Boolean(ctx.live);
  const firma = hasFirmaNicola(ctx);
  const { livello, motivi } = classificaRischio(ctx);

  if (!live) return { ok: true, modalita: "dry-run", livello, firma, motivi };

  if (ctx.automatico && livello !== "verde") {
    return {
      ok: false,
      bloccato: true,
      codice: "AUTO_NON_VERDE",
      livello,
      firma,
      motivi,
      motivo: `BLOCCATO: autopilot su azione ${livello} (solo 🟢).`,
    };
  }

  if (livello === "rosso" && !firma) {
    return {
      ok: false,
      bloccato: true,
      codice: "ROSSO_SENZA_FIRMA",
      livello,
      firma,
      motivi,
      motivo: "BLOCCATO: azione 🔴 senza firma di Nicola.",
    };
  }

  const canale = String(ctx.canale || "");
  const blob = [ctx.titolo, ctx.testo, canale].join(" ");
  if ((CANALI_SENSIBILI.test(canale) || TESTO_SENSIBILE.test(blob)) && !firma) {
    return {
      ok: false,
      bloccato: true,
      codice: "CANALE_SENSIBILE_SENZA_FIRMA",
      livello: "rosso",
      firma,
      motivi,
      motivo: "BLOCCATO: canale/contenuto sensibile senza firma.",
    };
  }

  return { ok: true, modalita: "live", livello, firma, motivi };
}

export function azioniLive(): boolean {
  return process.env.AZIONI_LIVE === "on" || process.env.AZIONI_LIVE === "1";
}
