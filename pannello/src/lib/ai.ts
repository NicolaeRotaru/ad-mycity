import { getBudget, aggiungiSpesa } from "@/lib/ai-budget";

// 🧠 Il cervello "pensante" a basso costo della macchina.
// SICURO PER COSTRUZIONE: se manca la chiave (ANTHROPIC_API_KEY) o il budget è
// finito → NON fa niente (ritorna null). €0 finché non si collega.
// Default = modello ECONOMICO; il potente solo dove chiesto esplicitamente.
// Registra la spesa stimata nella guardia budget (tetto 50€/mese + STOP).

const MODELLO_ECONOMICO = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
const MODELLO_POTENTE = process.env.ANTHROPIC_MODEL_POTENTE || "claude-opus-4-8";

// Prezzi indicativi in $/Mtoken (input/output) per stimare la spesa.
const PREZZI: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
  "claude-opus-4-8": { in: 15, out: 75 },
};
const EURO_PER_USD = 0.92;

export function aiConfigurato(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Fa ragionare la macchina su un compito. Ritorna il testo, o null se spenta/budget finito.
export async function pensa(opts: {
  prompt: string;
  sistema?: string;
  potente?: boolean;
  maxToken?: number;
}): Promise<string | null> {
  if (!aiConfigurato()) return null;
  const b = await getBudget().catch(() => null);
  if (b?.stop) return null; // tetto raggiunto → STOP, niente spesa

  const model = opts.potente ? MODELLO_POTENTE : MODELLO_ECONOMICO;
  const max_tokens = opts.maxToken ?? 1000;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: opts.sistema || "Sei l'AD digitale di MyCity. Rispondi in italiano, conciso e concreto. Non inventare MAI numeri: se non hai un dato, dillo.",
        messages: [{ role: "user", content: opts.prompt }],
      }),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    const testo = (d?.content?.[0]?.text || "").trim();

    // Stima e registra la spesa (così la guardia budget la conta).
    const u = d?.usage || {};
    const p = PREZZI[model] || { in: 1, out: 5 };
    const costoUsd = ((u.input_tokens || 0) / 1e6) * p.in + ((u.output_tokens || 0) / 1e6) * p.out;
    if (costoUsd > 0) await aggiungiSpesa(costoUsd * EURO_PER_USD).catch(() => {});

    return testo || null;
  } catch {
    return null;
  }
}
