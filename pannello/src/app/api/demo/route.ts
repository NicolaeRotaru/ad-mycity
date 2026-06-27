import { NextResponse } from "next/server";
import { demoAttivo, COOKIE_DEMO } from "@/lib/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🧪 Modalità demo: accende/spegne i dati di esempio (cookie). Nessun dato reale
// viene toccato. GET = stato attuale · POST { on: boolean } = accendi/spegni.
export async function GET() {
  return NextResponse.json({ demo: await demoAttivo() });
}

export async function POST(req: Request) {
  let on = false;
  try {
    const body = await req.json();
    on = Boolean(body?.on);
  } catch {
    on = false;
  }
  const res = NextResponse.json({ ok: true, demo: on });
  res.cookies.set(COOKIE_DEMO, on ? "on" : "", {
    path: "/",
    maxAge: on ? 60 * 60 * 24 * 30 : 0, // 30 giorni / cancella
    httpOnly: false,
    sameSite: "lax",
  });
  return res;
}
