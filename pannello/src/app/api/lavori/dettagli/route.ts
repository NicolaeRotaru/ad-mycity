import { NextRequest, NextResponse } from "next/server";
import { getLavoriByIds, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Batch: corpo completo per id selezionati (chat in corso, espansione, quota). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    if (!memoryConnected()) {
      return NextResponse.json({ ok: false, memoria: false, lavori: [] }, { status: 503 });
    }
    const lavori = await getLavoriByIds(ids);
    return NextResponse.json({ ok: true, lavori });
  } catch (e: any) {
    return NextResponse.json({ ok: false, lavori: [], error: e.message }, { status: 500 });
  }
}
