import { NextResponse } from "next/server";
import { PLAYBOOKS, statoPlaybook } from "@/lib/playbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🗡️ L'arsenale: catalogo dei playbook + stato (quali sono partiti oggi).
export async function GET() {
  const stato = await statoPlaybook().catch(() => []);
  const mappa = new Map(stato.map((s) => [s.id, s.ultimo]));
  const playbook = PLAYBOOKS.map((p) => ({
    id: p.id,
    leva: p.leva,
    emoji: p.emoji,
    titolo: p.titolo,
    descrizione: p.descrizione,
    cadenza: p.cadenza,
    livello: p.livello,
    ultimo: mappa.get(p.id) ?? null,
  }));
  return NextResponse.json({ playbook });
}
