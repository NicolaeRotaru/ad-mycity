import { NextResponse } from "next/server";
import { memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

function headers() {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

/** Rimette in coda i lavori bloccati «in_corso» (stesso effetto di recupera-lavori-orfani.sh sul VPS). */
export async function POST() {
  if (!memoryConnected() || !URL || !KEY) {
    return NextResponse.json({ ok: false, error: "Memoria non collegata." }, { status: 503 });
  }

  const listRes = await fetch(`${URL}/rest/v1/lavori?stato=eq.in_corso&select=id,tipo`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!listRes.ok) {
    return NextResponse.json({ ok: false, error: "Impossibile leggere la coda." }, { status: 502 });
  }
  const rows = (await listRes.json()) as { id: string; tipo: string }[];
  let n = 0;
  for (const row of rows) {
    const patch = await fetch(`${URL}/rest/v1/lavori?id=eq.${row.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ stato: "in_attesa" }),
    });
    if (patch.ok) n++;
  }

  return NextResponse.json({ ok: true, recuperati: n, messaggio: n ? `${n} lavoro/i rimessi in coda.` : "Nessun lavoro orfano." });
}
