import { NextResponse } from "next/server";
import { setImpostazione } from "@/lib/store";
import { eseguiAutopilota } from "@/lib/autopilota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Autopilota: esegue DA SOLO le azioni SICURE (🟢 verde) ancora non decise.
// - Interruttore "autopilota" salvato in Supabase (impostazioni), spento di default.
// - Logica condivisa in lib/autopilota.ts (usata anche dal cron / cuore su Vercel).
// - Stesse cinture delle mani: senza chiave/live → simula o coda. Mai invii a sorpresa.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Se il body indica "attiva", aggiorna l'interruttore.
  if (typeof body?.attiva === "boolean") {
    await setImpostazione("autopilota", body.attiva ? "on" : "off");
  }

  const r = await eseguiAutopilota();
  return NextResponse.json({ ok: true, attivo: r.attivo, eseguite: r.eseguite });
}
