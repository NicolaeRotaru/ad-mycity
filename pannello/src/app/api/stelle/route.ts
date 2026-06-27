import { NextResponse } from "next/server";
import { getStelle, setStella } from "@/lib/stelle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ⭐ Le Stelle Polari: GET elenca (con stato on/off), POST accende/spegne una secondaria.
export async function GET() {
  return NextResponse.json({ stelle: await getStelle() });
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const id = String(body?.id || "");
  const attiva = Boolean(body?.attiva);
  if (!id) return NextResponse.json({ ok: false, error: "id mancante" }, { status: 400 });
  const r = await setStella(id, attiva);
  return NextResponse.json({ ok: r.ok, motivo: r.motivo, stelle: await getStelle() });
}
