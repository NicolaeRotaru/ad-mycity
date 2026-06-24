import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir, codaTesto } from "@/lib/vault";

export const runtime = "nodejs";

// Attività & briefing: ultimo giro + Sala Operativa + Decisioni.
export async function GET() {
  // Ultimo briefing (file con data più recente, esclusi i _README).
  const files = (await listVaultDir("90-Memoria-AI/Briefing"))
    .filter((f) => !f.startsWith("_"))
    .sort()
    .reverse();
  let briefing: { nome: string; testo: string } | null = null;
  if (files.length) {
    const testo = await readVaultFile(`90-Memoria-AI/Briefing/${files[0]}`);
    if (testo) briefing = { nome: files[0].replace(/\.md$/, ""), testo };
  }

  const sala = await readVaultFile("90-Memoria-AI/SALA-OPERATIVA.md");
  const decisioni = await readVaultFile("90-Memoria-AI/DECISIONI.md");

  return NextResponse.json({
    collegato: briefing != null || sala != null || decisioni != null,
    briefing,
    salaOperativa: sala ? codaTesto(sala) : "",
    decisioni: decisioni ? codaTesto(decisioni) : "",
  });
}
