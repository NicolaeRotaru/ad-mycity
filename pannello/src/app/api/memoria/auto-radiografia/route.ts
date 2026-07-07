import { NextResponse } from "next/server";
import { readVaultFile } from "@/lib/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🩻 AUTO-RADIOGRAFIA — la macchina che analizza SÉ STESSA da cima a fondo. Qui leggiamo i digest
// che il workflow/giro scrive nel vault (cartella 90-Memoria-AI/auto-coscienza/) + la lettera a Nicola,
// e li serviamo all'area "Cervello" della Cabina. €0: solo lettura del vault. Spec: cervello/auto-radiografia.md.

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

// 🧹 Come per l'auto-analisi: il giro a volte scrive un voto sporco o un'intera frase in `trend`.
// Nel banner compatto della Plancia (badge shrink-0) quel testo lungo sfonda la card. Sanifichiamo
// ALLA FONTE: voto salute → intero 0-100, trend → token breve (freccia/parola), mai una frase.
function sanificaRadiografia(r: any): void {
  if (!r || typeof r !== "object") return;
  const m = String(r.voto_salute_architettura ?? "").match(/-?\d+/);
  if (m) {
    const n = Math.round(Number(m[0]));
    if (Number.isFinite(n)) r.voto_salute_architettura = Math.max(0, Math.min(100, n));
  }
  if (r.trend != null) {
    const t = String(r.trend).trim();
    r.trend = t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
  }
}

export async function GET() {
  const [radiografia, cantiere, storico, watchlist, lettera] = await Promise.all([
    leggiJson(`${BASE}/auto-radiografia.json`),
    leggiJson(`${BASE}/cantiere-difetti.json`),
    leggiJson(`${BASE}/storico-salute.json`),
    leggiJson(`${BASE}/watchlist-riferimenti.json`),
    readVaultFile(`${BASE}/LETTERA-A-NICOLA.md`),
  ]);

  sanificaRadiografia(radiografia); // voto→intero 0-100, trend→token breve (niente frasi che sfondano il banner)
  const collegato = Boolean(radiografia || cantiere);
  if (!collegato) {
    return NextResponse.json({
      collegato: false,
      messaggio:
        "La macchina non ha ancora fatto la radiografia di sé. Lancia «radiografia di te stesso» (cervello/auto-radiografia.md) per generare il primo verdetto sulla propria architettura.",
    });
  }
  return NextResponse.json({ collegato: true, radiografia, cantiere, storico, watchlist, lettera });
}
