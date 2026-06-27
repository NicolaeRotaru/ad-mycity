import { NextResponse } from "next/server";
import { getImpostazione, memoryConnected } from "@/lib/store";
import { getBudget } from "@/lib/ai-budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🫀 Stato del cuore della macchina: ultimo battito, autopilota, ultime azioni
// automatiche, e budget AI. Tutto a €0 (legge solo impostazioni).
export async function GET() {
  const [ultimo, eseguite, autopilota, pensiero] = await Promise.all([
    getImpostazione("cuore:ultimo").catch(() => null),
    getImpostazione("cuore:eseguite").catch(() => null),
    getImpostazione("autopilota").catch(() => null),
    getImpostazione("cuore:pensiero").catch(() => null),
  ]);
  const budget = await getBudget().catch(() => null);
  return NextResponse.json({
    collegato: memoryConnected(),
    ultimoBattito: ultimo,
    eseguiteUltimo: Number(eseguite ?? 0) || 0,
    autopilota: autopilota === "on",
    pensiero: pensiero || null,
    budget,
  });
}
