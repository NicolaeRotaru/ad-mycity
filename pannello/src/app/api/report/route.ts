import { NextRequest, NextResponse } from "next/server";
import { readVaultFile, listVaultDir } from "@/lib/vault";
import { creaLavoro } from "@/lib/store";

export const runtime = "nodejs";

// Estrae il campo "data:" dal frontmatter (può contenere data E ora). Vuoto se assente.
function dataFrontmatter(md: string): string {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  const blocco = fm ? fm[1] : md.slice(0, 400);
  const m = blocco.match(/^\s*data:\s*(.+?)\s*$/m);
  return m ? m[1].trim() : "";
}

// Report automatici: il pannello elenca i report salvati dall'AD nel vault e può
// accodare la generazione (giornaliero/settimanale), eseguita dal worker.
// La GET con ?genera= è pensata per il cron di Vercel.
async function accoda(tipoRaw: string) {
  const tipo = tipoRaw === "settimanale" ? "settimanale" : "giornaliero";
  const richiesta =
    `Genera il REPORT ${tipo} di MyCity: situazione, numeri chiave reali (ordini, incassi, clienti, negozi), ` +
    `mosse fatte e cose da firmare. Scrivilo in MyCity-Vault/90-Memoria-AI/Report/<DATA>-${tipo}.md ` +
    `col frontmatter che riporta SEMPRE data E ora: "data: AAAA-MM-GG HH:MM" (fuso di Piacenza). ` +
    `Se la "mano" email è attiva, invialo anche a Nicola.`;
  return creaLavoro(richiesta, "report");
}

export async function GET(req: NextRequest) {
  const genera = new URL(req.url).searchParams.get("genera");
  if (genera) {
    const l = await accoda(genera);
    return NextResponse.json({ ok: Boolean(l) });
  }
  const files = (await listVaultDir("90-Memoria-AI/Report")).sort().reverse();
  let ultimo: { nome: string; data: string; testo: string } | null = null;
  if (files.length) {
    const testo = await readVaultFile(`90-Memoria-AI/Report/${files[0]}`);
    if (testo) ultimo = { nome: files[0].replace(/\.md$/, ""), data: dataFrontmatter(testo), testo };
  }
  return NextResponse.json({ collegato: files.length > 0, elenco: files.map((f) => f.replace(/\.md$/, "")), ultimo });
}

export async function POST(req: NextRequest) {
  try {
    const { tipo } = await req.json();
    const l = await accoda(String(tipo || "giornaliero"));
    if (!l) return NextResponse.json({ ok: false, error: "Memoria non collegata (tabella 'lavori')." }, { status: 503 });
    return NextResponse.json({ ok: true, lavoro: l });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
