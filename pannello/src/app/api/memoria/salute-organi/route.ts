import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { riassumiOrgani, contaOrgani } from "@/lib/salute-organi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🫀 SALUTE PER ORGANO — AR-476. Serve il campo `ultime` di auto-coscienza/salute.json, che nessuna
// rotta serviva: la Cabina mostrava il voto sintetico e i sensori, mai il verdetto organo per organo.
// €0: sola lettura del vault. Il motore è `cervello/salute.mjs`; qui non si ricalcola niente.
//
// `collegato: false` quando il file non c'è — e NON un oggetto vuoto con zero rossi, che a schermo
// si leggerebbe come «tutto a posto». È la stessa regola della visita: ⚪ non è mai un verde.

const FILE = "90-Memoria-AI/auto-coscienza/salute.json";

export async function GET() {
  const raw = await readVaultFile(FILE);
  if (raw == null) {
    return NextResponse.json({ collegato: false, messaggio: "Nessun referto di salute nel vault: la visita non è ancora passata di qui." });
  }
  let j: any;
  try {
    j = JSON.parse(raw);
  } catch (e) {
    return NextResponse.json({ collegato: false, messaggio: `Il referto di salute non è leggibile (${(e as Error).message}).` });
  }

  const organi = riassumiOrgani(j?.ultime);
  return NextResponse.json({
    collegato: true,
    aggiornato: j?.aggiornato ?? null,
    conto: contaOrgani(organi),
    organi,
  });
}
