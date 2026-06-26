import { NextResponse } from "next/server";
import { readVaultFile, listVaultDir, codaTesto } from "@/lib/vault";

export const runtime = "nodejs";

// Estrae il campo "data:" dal frontmatter (può contenere data E ora,
// es. "2026-06-26 01:48"). Vuoto se assente. Cerca solo nel blocco --- iniziale.
function dataFrontmatter(md: string): string {
  const fm = md.match(/^---\s*\n([\s\S]*?)\n---/);
  const blocco = fm ? fm[1] : md.slice(0, 400);
  const m = blocco.match(/^\s*data:\s*(.+?)\s*$/m);
  return m ? m[1].trim() : "";
}

// Attività & briefing: ultimo giro + Sala Operativa + Decisioni.
export async function GET() {
  // Ultimo briefing (file con data più recente, esclusi i _README).
  const files = (await listVaultDir("90-Memoria-AI/Briefing"))
    .filter((f) => !f.startsWith("_"))
    .sort()
    .reverse();
  let briefing: { nome: string; data: string; testo: string } | null = null;
  if (files.length) {
    const testo = await readVaultFile(`90-Memoria-AI/Briefing/${files[0]}`);
    if (testo) briefing = { nome: files[0].replace(/\.md$/, ""), data: dataFrontmatter(testo), testo };
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
