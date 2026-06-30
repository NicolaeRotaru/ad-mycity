import { NextResponse } from "next/server";
import { getImpostazione, memoryConnected } from "@/lib/store";
import { getBudget, setTetto } from "@/lib/ai-budget";
import { aiConfigurato } from "@/lib/ai";
import { demoAttivo, cuoreDemo } from "@/lib/demo";
import { macchinaViva, oreDaQuando, raccogliSegnaliBattito } from "@/lib/battito";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🫀 Stato del cuore della macchina: ultimo battito, autopilota, ultime azioni
// automatiche, e budget AI. Tutto a €0 (legge solo impostazioni).
export async function GET() {
  // 🧪 Demo: cuore che "batte" con valori di esempio (marchiati demo:true).
  if (await demoAttivo()) return NextResponse.json(cuoreDemo());
  const [autopilota, pensiero, budget, segnali] = await Promise.all([
    getImpostazione("autopilota").catch(() => null),
    getImpostazione("cuore:pensiero").catch(() => null),
    getBudget().catch(() => null),
    raccogliSegnaliBattito(),
  ]);
  const ultimoDisplay = segnali.ultimoGiro?.quando ?? segnali.autopilotaCron?.quando ?? null;
  return NextResponse.json({
    collegato: memoryConnected(),
    // Card principale: ultimo giro AD reale (non solo cron Vercel mattutino).
    ultimoBattito: ultimoDisplay,
    ultimoBattitoFonte: segnali.ultimoGiro?.fonte ?? segnali.autopilotaCron?.fonte ?? null,
    ultimoGiro: segnali.ultimoGiro?.quando ?? null,
    autopilotaUltimo: segnali.autopilotaCron?.quando ?? null,
    workerUltimo: segnali.worker?.quando ?? null,
    workerVivo: (() => {
      const o = oreDaQuando(segnali.worker?.quando);
      return o != null && o <= 0.1;
    })(),
    vivo: macchinaViva(segnali),
    eseguiteUltimo: segnali.eseguiteAutopilota,
    autopilota: autopilota === "on",
    pensiero: pensiero || null,
    budget,
    // stato organi: cervello (AI) e mani (email)
    ai: aiConfigurato(),
    maniEmail: Boolean(process.env.RESEND_API_KEY),
    maniLive: process.env.AZIONI_LIVE === "on",
  });
}

// Governance: imposta il tetto di spesa AI mensile (€). Body: { tetto: number }.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const n = Number(body?.tetto);
  if (!Number.isNaN(n) && n >= 0) await setTetto(n);
  return NextResponse.json({ ok: true, budget: await getBudget().catch(() => null) });
}
