import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { getLavori } from "@/lib/store";

export const runtime = "nodejs";

// Diretta degli agenti: chi sta facendo cosa adesso.
// Unisce le righe recenti della SALA-OPERATIVA (FACCIO/FATTO/PASSO-A/SERVE/RIVEDI)
// con i lavori in coda/in corso della tabella `lavori`.
export async function GET() {
  const sala = await readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md");
  const righe: { ts: string; reparto: string; tipo: string; msg: string }[] = [];
  if (sala) {
    for (const raw of sala.split("\n")) {
      const line = raw.trim();
      if (!line.startsWith("- ")) continue;
      const parts = line.slice(2).split("·");
      if (parts.length < 4) continue;
      const ts = parts[0].trim();
      if (!/\d{4}-\d{2}-\d{2}/.test(ts)) continue;
      righe.push({
        ts,
        reparto: parts[1].trim().replace(/^@/, ""),
        tipo: parts[2].trim(),
        msg: parts.slice(3).join("·").trim(),
      });
    }
  }
  const ultimi = righe.slice(-25).reverse();

  let lavori: any[] = [];
  try {
    lavori = (await getLavori(20)).filter((l) => l.stato === "in_corso" || l.stato === "in_attesa");
  } catch {
    /* memoria non collegata */
  }

  return NextResponse.json({
    collegato: Boolean(sala) || lavori.length > 0,
    righe: ultimi,
    lavori,
  });
}
