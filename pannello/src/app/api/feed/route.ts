import { NextResponse } from "next/server";
import { getDiario, getLavori } from "@/lib/store";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";

// Feed unico "attività dell'azienda": fonde diario + lavori + Sala Operativa,
// ordinati dal più recente. Una timeline sola di tutto ciò che l'AD fa.
type Voce = { quando: string; tipo: string; titolo: string; testo: string };

export async function GET() {
  const items: Voce[] = [];

  try {
    for (const d of await getDiario(60)) {
      items.push({ quando: d.created_at, tipo: d.tipo || "diario", titolo: d.titolo, testo: (d.testo || "").slice(0, 400) });
    }
  } catch {
    /* memoria non collegata */
  }

  try {
    for (const l of await getLavori(30)) {
      items.push({
        quando: l.updated_at || l.created_at,
        tipo: "lavoro",
        titolo: `Lavoro (${l.stato}): ${l.richiesta}`.slice(0, 140),
        testo: (l.risultato || "").slice(0, 400),
      });
    }
  } catch {
    /* memoria non collegata */
  }

  const sala = await readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md");
  if (sala) {
    for (const raw of sala.split("\n")) {
      const line = raw.trim();
      if (!line.startsWith("- ")) continue;
      const parts = line.slice(2).split("·");
      if (parts.length < 4) continue;
      const ts = parts[0].trim();
      if (!/\d{4}-\d{2}-\d{2}/.test(ts)) continue;
      items.push({
        quando: ts.replace(" ", "T"),
        tipo: "squadra",
        titolo: `@${parts[1].trim().replace(/^@/, "")} · ${parts[2].trim()}`,
        testo: parts.slice(3).join("·").trim().slice(0, 400),
      });
    }
  }

  items.sort((a, b) => (b.quando || "").localeCompare(a.quando || ""));
  return NextResponse.json({ collegato: items.length > 0, feed: items.slice(0, 60) });
}
