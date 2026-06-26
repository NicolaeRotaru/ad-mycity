// ============================================================================
// Connettore AI — Video pro (Runway / Kling / Pika...).
// STATO: DRY-RUN scheletro. In dry-run NON chiama l'API: stampa cosa farebbe.
//
// 🟡 Quando collegato: genera un video MP4 da prompt (costo per secondo/clip).
//    Per attivarlo serve la chiave del provider scelto, es:
//      RUNWAY_API_KEY   (Runway Gen-3)        — https://docs.dev.runwayml.com/
//      KLING_API_KEY    (Kling / Kuaishou)
//      PIKA_API_KEY     (Pika)
//    Si sceglie un solo provider; qui l'esempio usa il pattern Runway.
//
// Uso previsto: reel "cinematic" fotorealistici (es. mani che affettano la coppa,
// alba su Piazza Duomo) — superiori al .webm animato che produciamo gia' in casa.
// Nota: senza chiave, il reel reale di oggi resta quello di reel.mjs (.webm).
// ============================================================================

const PROVIDER = process.env.RUNWAY_API_KEY ? "runway" : process.env.KLING_API_KEY ? "kling" : null;
const DRY_RUN = !PROVIDER;

/**
 * Genera un video da prompt (text-to-video o image-to-video).
 * @param {object} o { prompt, durataSec=5, ratio="9:16", imageUrl, outPath }
 * @returns {Promise<{dryRun:boolean, provider:string|null, outPath?:string, nota:string}>}
 */
export async function generaVideo(o) {
  const { prompt, durataSec = 5, ratio = "9:16", imageUrl, outPath = "creativi/output/social/ai-video.mp4" } = o;
  if (DRY_RUN) {
    console.log("── [ai-video · DRY-RUN] ───────────────────────────────────");
    console.log("  Genererei un video con un provider AI (Runway/Kling/Pika).");
    console.log("  prompt   :", prompt);
    console.log("  durata   :", durataSec, "s   ratio:", ratio);
    console.log("  imageUrl :", imageUrl || "(text-to-video)");
    console.log("  outPath  :", outPath);
    console.log("  Serve    : RUNWAY_API_KEY (o KLING_API_KEY / PIKA_API_KEY) per attivare.");
    console.log("  Intanto  : il reel reale di oggi e' il .webm di cervello/content-factory/reel.mjs.");
    console.log("───────────────────────────────────────────────────────────");
    return { dryRun: true, provider: null, outPath, nota: "DRY-RUN: nessun video generato. Imposta una *_API_KEY video." };
  }

  // ── Implementazione reale (bozza pattern Runway, da rifinire col tech) ──────
  if (PROVIDER === "runway") {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        "content-type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptText: prompt,
        ratio,
        duration: durataSec,
        ...(imageUrl ? { promptImage: imageUrl } : {}),
      }),
    });
    if (!res.ok) throw new Error(`Runway ${res.status}: ${await res.text()}`);
    const task = await res.json();
    // polling del task -> URL output -> download in outPath: da completare.
    return { dryRun: false, provider: "runway", taskId: task?.id, outPath, nota: "Task avviato (polling/download da completare)." };
  }
  throw new Error(`Provider ${PROVIDER} non ancora implementato.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generaVideo({
    prompt: "Mani che affettano sottile la coppa piacentina su un tagliere di legno, luce calda, primo piano, cinematic",
    durataSec: 5,
    ratio: "9:16",
  });
}
