// ============================================================================
// Connettore AI — Gemini Image (generazione immagini fotorealistiche).
// STATO: DRY-RUN scheletro. In dry-run NON chiama l'API: stampa cosa genererebbe.
//
// 🟡 Quando collegato: chiama un servizio esterno (costo per immagine).
//    Per attivarlo serve la chiave:  GEMINI_API_KEY  (Google AI Studio)
//    Modello immagini: es. "imagen-3.0-generate-002" / Gemini image-out.
//    Endpoint: https://generativelanguage.googleapis.com/v1beta/models/...:generateContent
//
// Uso previsto: foto-prodotto e scene di bottega fotorealistiche da usare come
// SFONDO dietro i template (es. bancone Garetti generato, tagliere DOP).
// ============================================================================

const DRY_RUN = !process.env.GEMINI_API_KEY;

/**
 * Genera un'immagine da prompt.
 * @param {object} o { prompt, aspect="1:1", outPath, negative }
 * @returns {Promise<{dryRun:boolean, prompt:string, outPath?:string, nota:string}>}
 */
export async function generaImmagine(o) {
  const { prompt, aspect = "1:1", outPath = "creativi/output/social/ai-image.png", negative } = o;
  if (DRY_RUN) {
    console.log("── [gemini-image · DRY-RUN] ───────────────────────────────");
    console.log("  Genererei un'immagine con Gemini/Imagen.");
    console.log("  prompt   :", prompt);
    console.log("  aspect   :", aspect);
    console.log("  negative :", negative || "(nessuno)");
    console.log("  outPath  :", outPath);
    console.log("  Serve    : GEMINI_API_KEY in ambiente per attivare la chiamata reale.");
    console.log("───────────────────────────────────────────────────────────");
    return { dryRun: true, prompt, outPath, nota: "DRY-RUN: nessuna immagine generata. Imposta GEMINI_API_KEY." };
  }

  // ── Implementazione reale (attiva solo con la chiave) ─────────────────────
  // Bozza dell'integrazione; va rifinita e testata col senior tech quando
  // Nicola collega la chiave. Lasciata qui per non perdere il design.
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages";
  const body = {
    prompt: { text: prompt },
    config: { numberOfImages: 1, aspectRatio: aspect, ...(negative ? { negativePrompt: negative } : {}) },
  };
  const res = await fetch(`${endpoint}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini image error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data?.generatedImages?.[0]?.image?.imageBytes;
  if (!b64) throw new Error("Risposta senza immagine");
  const { writeFileSync, mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, Buffer.from(b64, "base64"));
  return { dryRun: false, prompt, outPath, nota: "Immagine generata." };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generaImmagine({
    prompt:
      "Bancone di una storica salumeria di Piacenza, coppa appesa, luce calda, fotografia documentaristica, niente testo",
    aspect: "4:5",
    negative: "logo, testo, watermark, colori giallo brillante",
  });
}
