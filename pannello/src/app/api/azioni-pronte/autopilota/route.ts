import { NextResponse } from "next/server";
import { setImpostazione } from "@/lib/store";
import { eseguiAutopilota } from "@/lib/autopilota";
import { chiusuraAtto } from "@/lib/cancello-atto";

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
  // L'esito si guarda: un interruttore che dice «acceso» e non si è scritto torna indietro da solo
  // al primo ricarico, e questo è l'interruttore che decide se la macchina agisce da sola.
  if (typeof body?.attiva === "boolean") {
    const c = chiusuraAtto({
      scritture: [{ nome: "interruttore autopilota", ok: await setImpostazione("autopilota", body.attiva ? "on" : "off") }],
      attoEseguito: false,
    });
    if (!c.ok) return NextResponse.json({ ok: false, error: c.messaggio }, { status: c.status });
  }

  const r = await eseguiAutopilota();
  return NextResponse.json({
    ok: true,
    attivo: r.attivo,
    eseguite: r.eseguite,
    in_pausa: r.in_pausa === true,
    ...(r.gia_in_corso ? { gia_in_corso: true } : {}),
    ...(r.cieco ? { cieco: true } : {}),
    ...(r.fermato ? { fermato: r.fermato } : {}),
  });
}
