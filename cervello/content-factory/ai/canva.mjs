// ============================================================================
// Connettore AI — Canva Connect API (crea design da template brandizzati).
// STATO: DRY-RUN scheletro. In dry-run NON chiama l'API: stampa cosa farebbe.
//
// 🟡 Quando collegato: crea/esporta design sul tuo account Canva.
//    Per attivarlo serve:  CANVA_TOKEN  (OAuth token Canva Connect, scope design:write/content)
//    Doc: https://www.canva.dev/docs/connect/
//    Flusso tipico: autofill di un Brand Template con i campi {{titolo}}/{{testo}}
//    -> richiesta di export -> download del PNG/PDF risultante.
//
// Uso previsto: contenuti "pro" con la design-system Canva di MyCity quando
// servono layout piu' ricchi delle nostre HTML/CSS.
// ============================================================================

const DRY_RUN = !process.env.CANVA_TOKEN;

/**
 * Crea un design da Brand Template con autofill.
 * @param {object} o { templateId, dati:{titolo,testo,cta,...}, outPath }
 * @returns {Promise<{dryRun:boolean, templateId:string, outPath?:string, nota:string}>}
 */
export async function creaDesign(o) {
  const { templateId, dati = {}, outPath = "creativi/output/social/canva-design.png" } = o;
  if (DRY_RUN) {
    console.log("── [canva · DRY-RUN] ──────────────────────────────────────");
    console.log("  Creerei un design Canva da Brand Template (autofill).");
    console.log("  templateId:", templateId || "(da definire — id del Brand Template MyCity)");
    console.log("  campi     :", JSON.stringify(dati));
    console.log("  outPath   :", outPath);
    console.log("  Serve     : CANVA_TOKEN (OAuth Canva Connect) per attivare la chiamata reale.");
    console.log("───────────────────────────────────────────────────────────");
    return { dryRun: true, templateId, outPath, nota: "DRY-RUN: nessun design creato. Imposta CANVA_TOKEN." };
  }

  // ── Implementazione reale (bozza, da rifinire col tech quando c'e' il token) ──
  const base = "https://api.canva.com/rest/v1";
  const auth = { Authorization: `Bearer ${process.env.CANVA_TOKEN}`, "content-type": "application/json" };

  // 1) autofill job
  const af = await fetch(`${base}/autofills`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ brand_template_id: templateId, data: toCanvaData(dati) }),
  });
  if (!af.ok) throw new Error(`Canva autofill ${af.status}: ${await af.text()}`);
  const job = await af.json();
  // 2) (polling job -> design_id) e 3) export -> download URL: da completare.
  return { dryRun: false, templateId, jobId: job?.job?.id, nota: "Autofill avviato (polling/export da completare)." };
}

// I campi Canva autofill vogliono {tipo, valore}: helper minimale per testo.
function toCanvaData(dati) {
  const out = {};
  for (const [k, v] of Object.entries(dati)) out[k] = { type: "text", text: String(v) };
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  creaDesign({
    templateId: "BRAND_TEMPLATE_ID_MYCITY",
    dati: { titolo: "Storia di bottega", testo: "La coppa affettata a mano da generazioni.", cta: "Iscriviti" },
  });
}
