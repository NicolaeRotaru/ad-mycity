import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🧠 AUTO-COSCIENZA — il livello con cui la macchina pensa su se stessa: si controlla
// (auto-analisi), impara (apprendimento), si migliora (auto-miglioramento). Qui leggiamo
// i 5 digest che il giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) e li
// serviamo alla Cabina. €0: nessuna API Claude, solo lettura del vault.
// Spec/contratti: cervello/auto-coscienza.md.

const BASE = "90-Memoria-AI/auto-coscienza";

async function leggiJson(rel: string): Promise<any | null> {
  const raw = await readVaultFile(rel);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const [analisi, apprendimento, miglioramento, calibrazione, registro] = await Promise.all([
    leggiJson(`${BASE}/auto-analisi.json`),
    leggiJson(`${BASE}/apprendimento.json`),
    leggiJson(`${BASE}/auto-miglioramento.json`),
    leggiJson(`${BASE}/calibrazione.json`),
    leggiJson(`${BASE}/registro-realta.json`),
  ]);

  const collegato = Boolean(analisi || apprendimento || miglioramento);
  if (!collegato) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora fatto la sua auto-analisi. Al prossimo giro (cervello/giro.md, passi Auto-analisi/Apprendimento) genera il primo verdetto su se stessa.",
    });
  }
  return NextResponse.json({ collegato: true, analisi, apprendimento, miglioramento, calibrazione, registro });
}
