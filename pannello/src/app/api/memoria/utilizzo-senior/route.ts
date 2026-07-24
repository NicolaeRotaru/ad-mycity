import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📊 UTILIZZO SENIOR — il roster dei 120 agenti come NUMERO, non come elenco.
// Porta fedele di cervello/utilizzo-senior.mjs (stesso calcolo, stessa fonte): legge dal vault
// chiusura-loop.json (la sonda che la macchina scrive a ogni giro) e serve l'utilizzo reale
// all'area Cervello. €0: sola lettura del vault. Spec: cervello/utilizzo-senior.mjs.

const CL = "90-Memoria-AI/auto-coscienza/chiusura-loop.json";

export async function GET() {
  const raw = await readVaultFile(CL);
  if (raw == null) {
    return NextResponse.json({
      collegato: false,
      messaggio: "chiusura-loop.json non disponibile: la sonda del giro non l'ha ancora scritto.",
    });
  }
  let j: any;
  try {
    j = JSON.parse(raw);
  } catch {
    return NextResponse.json({ collegato: false, messaggio: "chiusura-loop.json illeggibile." });
  }

  const quaderni: any[] = Array.isArray(j.quaderni) ? j.quaderni : [];
  const totale = Number(j.totale) || quaderni.length || 0;
  // vivo = ha prodotto almeno un ESITO (righe_esito > 0) e non è fermo — identico allo script.
  const conEsito = quaderni.filter((q) => Number(q.righe_esito) > 0);
  const vivi = quaderni.filter((q) => Number(q.righe_esito) > 0 && !q.fermo);
  const fermi = quaderni.filter((q) => q.fermo);
  const maiEsito = quaderni.filter((q) => !(Number(q.righe_esito) > 0));
  const utilizzo = totale ? conEsito.length / totale : 0;

  const top = quaderni
    .filter((q) => Number(q.righe_esito) > 0)
    .sort((a, b) => Number(b.righe_esito) - Number(a.righe_esito))
    .slice(0, 10)
    .map((q) => ({ reparto: q.reparto, esiti: Number(q.righe_esito), giorni_fa: q.giorni_fa ?? null }));

  return NextResponse.json({
    collegato: true,
    aggiornato: j.aggiornato || null,
    totale_agenti: totale,
    con_almeno_un_esito: conEsito.length,
    vivi: vivi.length,
    fermi: fermi.length,
    mai_un_esito: maiEsito.length,
    utilizzo_reale: Number(utilizzo.toFixed(3)),
    top_consumatori: top,
    dormienti_mai_usati: maiEsito.map((q) => q.reparto),
  });
}
