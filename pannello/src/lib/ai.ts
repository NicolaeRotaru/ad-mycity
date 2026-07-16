import { puoSpendere, aggiungiSpesa } from "@/lib/ai-budget";

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

  const model = opts.potente ? MODELLO_POTENTE : MODELLO_ECONOMICO;
  const max_tokens = opts.maxToken ?? 1000;
  const p = PREZZI[model] || { in: 1, out: 5 };
  // Stima PRUDENTE del costo PRIMA di chiamare (input ~ output come tetto largo):
  // se questa singola chiamata sforerebbe il budget, non parte. Chiude il caso
  // "una chiamata costosa che supera il tetto".
  const stimaEuro = ((max_tokens / 1e6) * (p.in + p.out)) * EURO_PER_USD;
  if (!(await puoSpendere(stimaEuro))) return null;

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

    // Registra la spesa reale (così la guardia budget la conta).
    const u = d?.usage || {};
    const costoUsd = ((u.input_tokens || 0) / 1e6) * p.in + ((u.output_tokens || 0) / 1e6) * p.out;
    if (costoUsd > 0) await aggiungiSpesa(costoUsd * EURO_PER_USD).catch(() => {});

    return testo || null;
  } catch {
    return null;
  }
}

// 👀 Il cervello che GUARDA una foto (visione). Stessa guardia-budget di pensa():
// se manca la chiave o il budget è finito → ritorna null (€0). Usa il modello economico
// (haiku, che vede) di default. Serve alla "Vetrina live": foto prodotto → scheda proposta.
export async function vede(opts: {
  immagineBase64: string; // solo i byte in base64 (senza il prefisso data:...)
  mediaType: string; // es. "image/jpeg"
  prompt: string;
  sistema?: string;
  potente?: boolean;
  maxToken?: number;
}): Promise<string | null> {
  if (!aiConfigurato()) return null;
  if (!opts.immagineBase64) return null;

  const model = opts.potente ? MODELLO_POTENTE : MODELLO_ECONOMICO;
  const max_tokens = opts.maxToken ?? 1200;
  const p = PREZZI[model] || { in: 1, out: 5 };
  // Stima prudente PRIMA di chiamare (le immagini costano input: teniamo il tetto largo).
  const stimaEuro = ((max_tokens / 1e6) * (p.in + p.out)) * EURO_PER_USD;
  if (!(await puoSpendere(stimaEuro))) return null;

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
        system:
          opts.sistema ||
          "Sei l'AD digitale di MyCity. Rispondi in italiano, conciso e concreto. Non inventare MAI dati: se dalla foto non capisci un campo, lascialo vuoto.",
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: opts.mediaType, data: opts.immagineBase64 } },
              { type: "text", text: opts.prompt },
            ],
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    const testo = (d?.content?.[0]?.text || "").trim();

    const u = d?.usage || {};
    const costoUsd = ((u.input_tokens || 0) / 1e6) * p.in + ((u.output_tokens || 0) / 1e6) * p.out;
    if (costoUsd > 0) await aggiungiSpesa(costoUsd * EURO_PER_USD).catch(() => {});

    return testo || null;
  } catch {
    return null;
  }
}
