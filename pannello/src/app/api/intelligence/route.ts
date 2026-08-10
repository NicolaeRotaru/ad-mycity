import { NextRequest, NextResponse } from "next/server";
import { readVaultFile, readRepoFile } from "@/lib/vault";
import { creaLavoro } from "@/lib/store";
import { freschezza, oggiPiacenza, sogliaPerScheda } from "@/lib/freschezza-intelligence";

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
  leve: {
    file: "leve-uscita",
    agente: "intelligence",
    compito:
      "Analizza le LEVE IN USCITA del radar (cervello/radar.json, direzione=OUT) e le catene_indirette: cosa MyCity può influenzare ADESSO a Piacenza. Per ogni leva rilevante in questo momento di' SE e COME spingerla (mossa concreta, senior, colore 🟢🟡🔴), in ordine di priorità. Aggiungi le 2-3 catene indirette più sfruttabili ora (il primo anello che si muove e l'opportunità a valle). Le azioni reali (stampa, istituzioni, sponsor) si accodano per la firma di Nicola.",
  },
  reputazione: {
    file: "reputazione",
    agente: "supporto",
    compito:
      "Cerca sul web cosa si dice di MyCity e dei nostri negozi a Piacenza: menzioni su news/social, recensioni Google, gruppi FB di quartiere, sentiment generale e lamentele ricorrenti. Sintetizza con i link, indica il sentiment (positivo/neutro/negativo) e le 1-3 cose concrete da sistemare o da valorizzare. Usa la ricerca web.",
  },
};

export async function GET(req: NextRequest) {
  const tipo = (new URL(req.url).searchParams.get("tipo") || "").trim();
  const def = TIPI[tipo];
  if (!def) return NextResponse.json({ ok: false, error: "Tipo non valido." }, { status: 400 });
  const testo = await readVaultFile(`90-Memoria-AI/Intelligence/${def.file}.md`);

  // 📆 Quanto è vecchio ciò che sto per mostrare (2026-08-10). Prima la risposta era solo
  // {presente, testo}: la schermata non aveva NIENTE con cui dire «questo è di tre settimane fa»,
  // e infatti non lo ha detto per undici giorni. La data si legge dall'intestazione del markdown e
  // non dal filesystem, perché in produzione il vault arriva da GitHub — lì un mtime non esiste.
  // La soglia si deriva dalle cadenze delle fonti: unica casa, cervello/radar-fonti.json.
  let radar: unknown = null;
  try {
    const grezzo = await readRepoFile("cervello/radar-fonti.json");
    radar = grezzo ? JSON.parse(grezzo) : null;
  } catch {
    radar = null; // radar illeggibile → soglia larga di ripiego, mai un falso rosso.
  }
  const soglia = sogliaPerScheda(radar, def.file);
  const fresca = freschezza(testo, soglia, oggiPiacenza());

  return NextResponse.json({ tipo, presente: testo != null, testo: testo ?? "", freschezza: fresca });
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
