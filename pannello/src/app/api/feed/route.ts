import { NextResponse } from "next/server";
import { getDiario, getLavori } from "@/lib/store";
import { readVaultFile } from "@/lib/vault";
import { vaultToIso } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        titolo: `Lavoro (${l.stato}): ${l.tipo}`.slice(0, 140),
        testo: (l.risultato || l.richiesta || "").slice(0, 400),
      });
    }
  } catch {
    /* memoria non collegata */
  }

  const salaRaw = await readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md");
  if (salaRaw) {
    // Parsa SOLO il vero canale: scarta tutto ciò che precede il marcatore, dove stanno le righe-ESEMPIO
    // del manuale ("## Come si scrive → Esempi:") che hanno lo stesso formato ma non sono attività reali.
    const tagli = salaRaw.split("<!-- La squadra scrive qui sotto");
    const sala = tagli.length > 1 ? tagli[1] : salaRaw;
    for (const raw of sala.split("\n")) {
      const line = raw.trim();
      if (!line.startsWith("- ")) continue;
      const corpo = line.slice(2);
      if (corpo.startsWith("`")) continue; // righe-esempio racchiuse in backtick: non sono attività
      const parts = corpo.split("·");
      if (parts.length < 4) continue;
      const ts = parts[0].trim();
      if (!/^\d{4}-\d{2}-\d{2}/.test(ts)) continue;
      items.push({
        quando: ts, // stringa-vault grezza (Piacenza, senza fuso): la rende dataVault via istante()
        tipo: "squadra",
        titolo: `@${parts[1].trim().replace(/^@/, "")} · ${parts[2].trim()}`,
        testo: parts.slice(3).join("·").trim().slice(0, 400),
      });
    }
  }

  // Ordina su istanti reali: le righe-vault (Piacenza, senza fuso) vengono ancorate a Europe/Rome,
  // i record Supabase sono ISO veri (Z). localeCompare su formati misti invertirebbe l'ordine.
  items.sort((a, b) => (Date.parse(vaultToIso(b.quando)) || 0) - (Date.parse(vaultToIso(a.quando)) || 0));
  return NextResponse.json({ collegato: items.length > 0, feed: items.slice(0, 60) });
}
