import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🎯 "Le prossime mosse di Nicola" — l'AD legge i Piani (06-Piani/) ed estrae le
// INTENZIONI del proprietario: cosa sta per fare, quali primi negozi contattera,
// in che ordine, con quali scadenze, e cosa l'AD ha gia pre-preparato per anticiparlo.
// Il digest strutturato lo scrive il giro (cervello/giro.md, passo "intenzioni") nel
// file 90-Memoria-AI/intenzioni-nicola.json. Qui lo leggiamo e serviamo alla Cabina.
// €0: nessuna API Claude, solo lettura del vault.

type Mossa = {
  titolo: string;
  quando?: string;
  come?: string;
  priorita?: "alta" | "media" | "bassa";
  ad_prepara?: string;
  senior?: string;
  colore?: "🟢" | "🟡" | "🔴";
};
type Negozio = { nome: string; perche?: string; stato?: string };
type Lacuna = { ambito?: string; cosa_manca: string; domanda_per_nicola: string };

export async function GET() {
  const raw = await readVaultFile("90-Memoria-AI/intenzioni-nicola.json");
  if (raw == null) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "L'AD non ha ancora analizzato i Piani. Lancia un giro (cervello/giro.md, passo 'intenzioni') per generare le prossime mosse di Nicola.",
    });
  }
  try {
    const j = JSON.parse(raw);
    return NextResponse.json({
      collegato: true,
      data: typeof j.data === "string" ? j.data : "",
      sintesi: typeof j.sintesi === "string" ? j.sintesi : "",
      prossime_mosse: Array.isArray(j.prossime_mosse) ? (j.prossime_mosse as Mossa[]) : [],
      primi_negozi: Array.isArray(j.primi_negozi) ? (j.primi_negozi as Negozio[]) : [],
      rischi: Array.isArray(j.rischi) ? (j.rischi as string[]) : [],
      serve_da_nicola: Array.isArray(j.serve_da_nicola) ? (j.serve_da_nicola as Lacuna[]) : [],
    });
  } catch {
    // File presente ma JSON malformato: non rompere la Cabina, segnala soltanto.
    return NextResponse.json({ collegato: false, messaggio: "intenzioni-nicola.json non e un JSON valido." });
  }
}
