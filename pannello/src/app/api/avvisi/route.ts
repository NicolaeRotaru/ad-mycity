import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 📣 Casella Avvisi: gli avvisi che la macchina manderebbe a Nicola su Telegram (es. «memoria
// incoerente, giro NON pubblicato»). Finché Telegram non è collegato, avviso-telegram.mjs li
// deposita in 90-Memoria-AI/avvisi-macchina.json e questa route li serve alla scheda «📣 Avvisi».
// Più recenti in cima. Nessuna dipendenza esterna: legge un file di memoria come le altre route.
type Avviso = { at: string; testo: string; canale?: string };

export async function GET() {
  const grezzo = await readVaultFile("90-Memoria-AI/avvisi-macchina.json");
  if (!grezzo) return NextResponse.json({ collegato: false, avvisi: [] });
  try {
    const dati = JSON.parse(grezzo);
    const lista: Avviso[] = Array.isArray(dati) ? dati : Array.isArray(dati?.avvisi) ? dati.avvisi : [];
    // Più recenti in cima; teniamo solo voci sensate (con testo).
    const avvisi = lista
      .filter((a) => a && typeof a.testo === "string" && a.testo.trim())
      .slice()
      .reverse();
    return NextResponse.json({ collegato: true, avvisi });
  } catch {
    // JSON rotto: non è un errore fatale per la Cabina — mostra casella vuota, non una schermata rossa.
    return NextResponse.json({ collegato: false, avvisi: [] });
  }
}
