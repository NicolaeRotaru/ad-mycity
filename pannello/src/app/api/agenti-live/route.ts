import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";
import { getLavori } from "@/lib/store";
import { vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Diretta degli agenti: chi sta facendo cosa adesso.
// Unisce le righe recenti della SALA-OPERATIVA (FACCIO/FATTO/PASSO-A/SERVE/RIVEDI)
// con i lavori in coda/in corso della tabella `lavori`.
export async function GET() {
  const salaRaw = await readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md");
  const sala = salaRaw
    ? (salaRaw.split("<!-- La squadra scrive qui sotto").slice(-1)[0]) // solo il vero canale, non gli Esempi:
    : null;
  const righe: { ts: string; reparto: string; tipo: string; msg: string }[] = [];
  if (sala) {
    for (const raw of sala.split("\n")) {
      const line = raw.trim();
      if (!line.startsWith("- ")) continue;
      const corpo = line.slice(2);
      if (corpo.startsWith("`")) continue; // righe-esempio in backtick: non sono attività reali
      const parts = corpo.split("·");
      if (parts.length < 4) continue;
      const ts = parts[0].trim();
      if (!/^\d{4}-\d{2}-\d{2}/.test(ts)) continue;
      righe.push({
        ts,
        reparto: parts[1].trim().replace(/^@/, ""),
        tipo: parts[2].trim(),
        msg: parts.slice(3).join("·").trim(),
      });
    }
  }
  // Ordina per ISTANTE reale (non per posizione nel file): le righe SALA possono non essere cronologiche.
  const ultimi = righe
    .map((r) => ({ r, t: Date.parse(vaultToIso(r.ts)) || 0 }))
    .sort((a, b) => b.t - a.t)
    .slice(0, 25)
    .map((x) => x.r);

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
