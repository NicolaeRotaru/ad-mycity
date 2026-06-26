import { NextRequest, NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { creaLavoro } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Intelligence: il pannello mostra l'ultimo risultato salvato dall'AD nel vault e
// può accodare un lavoro per rigenerarlo (lo esegue l'agente intelligence/analista).
const TIPI: Record<string, { file: string; agente: string; compito: string }> = {
  concorrenti: {
    file: "radar-concorrenti",
    agente: "intelligence",
    compito:
      "Fai un RADAR dei concorrenti del marketplace MyCity a Piacenza (food/grocery delivery, marketplace locali, GDO con consegna, botteghe che vendono online): prezzi, promozioni, novità, punti deboli sfruttabili. Usa la ricerca web.",
  },
  eventi: {
    file: "eventi-picchi",
    agente: "intelligence",
    compito:
      "Trova gli EVENTI a Piacenza nei prossimi 7-14 giorni (sagre, mercati, fiere, concerti, meteo estremo, chiusure/ZTL) e stima i PICCHI di domanda per il delivery, con consigli operativi. Usa la ricerca web.",
  },
  buchi: {
    file: "buchi-mercato",
    agente: "analista",
    compito:
      "Analizza le categorie e i negozi presenti sul marketplace (dati reali) e individua i BUCHI di mercato: categorie o zone scoperte da coprire, in ordine di priorità e potenziale.",
  },
};

export async function GET(req: NextRequest) {
  const tipo = (new URL(req.url).searchParams.get("tipo") || "").trim();
  const def = TIPI[tipo];
  if (!def) return NextResponse.json({ ok: false, error: "Tipo non valido." }, { status: 400 });
  const testo = await readVaultFile(`90-Memoria-AI/Intelligence/${def.file}.md`);
  return NextResponse.json({ tipo, presente: testo != null, testo: testo ?? "" });
}

export async function POST(req: NextRequest) {
  try {
    const { tipo } = await req.json();
    const def = TIPI[String(tipo || "")];
    if (!def) return NextResponse.json({ ok: false, error: "Tipo non valido." }, { status: 400 });
    const richiesta =
      `${def.compito}\n\nScrivi il risultato (sintetico, azionabile, con la data di oggi in cima) in ` +
      `MyCity-Vault/90-Memoria-AI/Intelligence/${def.file}.md. Delega all'agente ${def.agente} se serve.`;
    const lavoro = await creaLavoro(richiesta, "intelligence");
    if (!lavoro) {
      return NextResponse.json({ ok: false, error: "Memoria non collegata (tabella 'lavori')." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
