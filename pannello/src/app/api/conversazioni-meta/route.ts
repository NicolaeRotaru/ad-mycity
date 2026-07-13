import { NextRequest, NextResponse } from "next/server";
import { getImpostazione, setImpostazione, memoryConnected } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHIAVE_LETTE = "conv_lette";
const CHIAVE_PIN = "conv_pin";

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeLette(
  a: Record<string, string>,
  b: Record<string, string>
): Record<string, string> {
  const out = { ...a };
  for (const [id, at] of Object.entries(b)) {
    if (!out[id] || at > out[id]) out[id] = at;
  }
  return out;
}

// GET: stato condiviso pallini (lette) e graffette (pin) — cross-device.
export async function GET() {
  if (!memoryConnected()) {
    return NextResponse.json({ memoria: false, letta: {}, pin: [] });
  }
  const [rawLette, rawPin] = await Promise.all([
    getImpostazione(CHIAVE_LETTE),
    getImpostazione(CHIAVE_PIN),
  ]);
  const letta = parseJson<Record<string, string>>(rawLette, {});
  const pin = parseJson<string[]>(rawPin, []);
  return NextResponse.json({ memoria: true, letta, pin: Array.isArray(pin) ? pin : [] });
}

// POST: salva stato (merge letta per-id con max timestamp; pin = lista intera).
export async function POST(req: NextRequest) {
  if (!memoryConnected()) {
    return NextResponse.json({ ok: false, error: "Memoria non collegata." }, { status: 503 });
  }
  try {
    const body = await req.json();
    const tasks: Promise<boolean>[] = [];

    if (body?.letta && typeof body.letta === "object") {
      const incoming = body.letta as Record<string, string>;
      const cur = parseJson<Record<string, string>>(await getImpostazione(CHIAVE_LETTE), {});
      const merged = mergeLette(cur, incoming);
      tasks.push(setImpostazione(CHIAVE_LETTE, JSON.stringify(merged)));
    }

    if (Array.isArray(body?.pin)) {
      const pin = body.pin.map((x: unknown) => String(x)).filter(Boolean);
      tasks.push(setImpostazione(CHIAVE_PIN, JSON.stringify(pin)));
    }

    if (tasks.length === 0) {
      return NextResponse.json({ ok: false, error: "Niente da salvare." }, { status: 400 });
    }

    const results = await Promise.all(tasks);
    if (!results.every(Boolean)) {
      return NextResponse.json({ ok: false, error: "Salvataggio fallito." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
